import React from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const SubscriptionPlans = () => {
  const { user, loading } = useAuth();
 console.log("User in SubscriptionPlans:", user);
  const handleSubscribe = async (plan) => {
  try {
    const res = await fetch("http://localhost:5000/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, 
      },
      body: JSON.stringify({ plan }), // { plan: "monthly" } or { plan: "yearly" }
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe Checkout
    }
  } catch (err) {
    console.error(err);
  }
};

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-4 items-center">
      <h2 className="text-xl font-bold">Choose Your Plan</h2>

      <div className="p-4 border rounded w-60 text-center">
        <h3 className="font-semibold">Monthly Plan</h3>
        <p>$20 / month</p>
        <button
          disabled={!user}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2 disabled:bg-gray-400"
          onClick={() => handleSubscribe("monthly")}
        >
          Subscribe
        </button>
      </div>

      <div className="p-4 border rounded w-60 text-center">
        <h3 className="font-semibold">Yearly Plan</h3>
        <p>$100 / year</p>
        <button
          disabled={!user}
          className="bg-green-500 text-white px-4 py-2 rounded mt-2 disabled:bg-gray-400"
          onClick={() => handleSubscribe("yearly")}
        >
          Subscribe
        </button>
      </div>
      
    </div>
  );
};

export default SubscriptionPlans;
