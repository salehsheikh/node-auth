import Stripe from "stripe";
import User from "../modals/userModal.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook handler
// Webhook handler
export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email;

      if (!session.subscription) {
        console.error("No subscription found in session:", session.id);
        return res.json({ received: true }); // Still return 200 to Stripe
      }

      // Retrieve the subscription
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const priceId = subscription.items.data[0].price.id;
      
      let planType = 'monthly';
      if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
        planType = 'yearly';
      }

      const user = await User.findOne({ email });
      if (user) {
        user.isSubscribed = true;
        user.subscriptionPlan = planType;
        user.subscriptionId = session.subscription;
        user.subscriptionEnd = new Date(
          Date.now() + (planType === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
        );
        await user.save();
        console.log(`Updated subscription for user: ${email}`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

// Create checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    console.log("REQ BODY:", req.body);
    console.log("USER:", req.user);

    let priceId;
    if (plan === "monthly") {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID; // Use environment variable
    } else if (plan === "yearly") {
      priceId = process.env.STRIPE_YEARLY_PRICE_ID; // Use environment variable
    }

    if (!priceId) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // Validate that it's a price ID, not product ID
    if (priceId.startsWith('prod_')) {
      return res.status(500).json({ 
        message: "Configuration error: Use Price ID (starts with price_) not Product ID" 
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      customer_email: req.user?.email,
    });

    console.log("Stripe session created:", session.id);
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Verify subscription function
export const verifySubscription = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID required" });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'] // This returns the full subscription object
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    // Check if subscription exists and get the subscription ID
    let subscriptionId;
    if (typeof session.subscription === 'string') {
      subscriptionId = session.subscription;
    } else if (session.subscription && session.subscription.id) {
      subscriptionId = session.subscription.id; // Get ID from expanded object
    } else {
      return res.status(400).json({ success: false, message: "No subscription found" });
    }

    // Retrieve the subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0].price.id;

    let planType = 'monthly';
    if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
      planType = 'yearly';
    }

    // Update user subscription in database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isSubscribed = true;
    user.subscriptionPlan = planType;
    user.subscriptionId = subscriptionId;
    user.subscriptionEnd = new Date(
      Date.now() + (planType === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
    );

    await user.save();

    res.json({ 
      success: true, 
      message: "Subscription verified", 
      plan: planType 
    });

  } catch (err) {
    console.error("Subscription verification error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};