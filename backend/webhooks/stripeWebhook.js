import Stripe from "stripe";
import User from "../modals/userModal.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // raw body (not parsed by express.json)
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

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      const priceId = subscription.items.data[0].price.id;
      let planType = priceId === "price_xxx_yearly" ? "yearly" : "monthly";

      const user = await User.findOne({ email });
      if (user) {
        user.isSubscribed = true;
        user.subscriptionPlan = planType;
        user.subscriptionEnd = new Date(
          Date.now() + (planType === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
        );
        await user.save();
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    res.status(400).json({ message: err.message });
  }
};
