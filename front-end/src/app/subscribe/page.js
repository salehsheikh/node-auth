"use client"
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiCheck, FiZap, FiCrown, FiStar, FiAward, FiCreditCard } from "react-icons/fi";
import { TfiCrown } from "react-icons/tfi";
const Page = () => {
  const { user, loading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);


  const handleSubscribe = async (plan) => {
    setIsProcessing(true);
    try {
      const res = await fetch("http://localhost:5000/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: "monthly",
      name: "Premium Monthly",
      price: "$20",
      period: "month",
      description: "Perfect for trying out all premium features",
      features: [
        "Blue verification tick",
        "Priority story placement",
        "Advanced analytics",
        "Custom profile theme",
        "Ad-free experience",
        "Exclusive badges"
      ],
      popular: false,
      icon: <FiStar className="text-yellow-400" />
    },
    {
      id: "yearly",
      name: "Premium Yearly",
      price: "$100",
      period: "year",
      description: "Best value - save 58% compared to monthly",
      features: [
        "Everything in Monthly plan",
        "Early access to new features",
        "Dedicated support",
        "Special anniversary rewards",
        "Yearly member exclusive events",
        "2 months free compared to monthly"
      ],
      popular: true,
      icon: <TfiCrown className="text-amber-500" />
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Upgrade Your Experience
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Unlock exclusive features, get verified, and enjoy an ad-free experience with our premium plans.
          </p>
        </div>

        {/* Current Status */}
        {user?.isSubscribed && (
          <div className="bg-green-900/20 border border-green-700 rounded-xl p-6 mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <FiAward className="text-green-400 text-2xl" />
              <h3 className="text-xl font-semibold text-green-300">You're already a premium member!</h3>
            </div>
            <p className="text-gray-300 text-center mt-2">
              Thank you for supporting our community. Enjoy your exclusive benefits!
            </p>
          </div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-2 border-amber-500 bg-gradient-to-b from-gray-800 to-gray-900 transform scale-105 shadow-xl shadow-amber-900/20"
                  : "border border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 hover:border-gray-500 hover:shadow-lg hover:shadow-blue-900/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 text-black px-4 py-1 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-6">
                {plan.icon}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
              </div>
              
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 mb-1">/{plan.period}</span>
                </div>
                <p className="text-gray-400 mt-2">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => {
                  setSelectedPlan(plan.id);
                  handleSubscribe(plan.id);
                }}
                disabled={!user || user?.isSubscribed || isProcessing}
                className={`w-full py-4 rounded-xl cursor-pointer font-semibold transition-all duration-300 ${
                  user?.isSubscribed
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : plan.popular
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                }`}
              >
                {isProcessing && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : user?.isSubscribed ? (
                  "Current Plan"
                ) : !user ? (
                  "Sign in to Subscribe"
                ) : (
                  `Get ${plan.name}`
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What You Get With Premium</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-800/50 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/30 rounded-full mb-4">
                <FiCheck className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Blue Verification Tick</h3>
              <p className="text-gray-400">Get verified and stand out as an authentic creator.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-800/50 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-900/30 rounded-full mb-4">
                <FiZap className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Priority Placement</h3>
              <p className="text-gray-400">Your content gets seen first by your followers.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-800/50 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-900/30 rounded-full mb-4">
                <FiAward className="text-2xl text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Exclusive Badges</h3>
              <p className="text-gray-400">Special badges that showcase your premium status.</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-800/30 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-2">How does the verification process work?</h3>
              <p className="text-gray-400">After successful payment, our team will review your account and apply the blue verification tick typically within 24-48 hours.</p>
            </div>
            
            <div className="bg-gray-800/30 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-400">Yes, you can cancel at any time. You'll keep your benefits until the end of your billing period.</p>
            </div>
            
            <div className="bg-gray-800/30 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards through our secure Stripe payment processing system.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;