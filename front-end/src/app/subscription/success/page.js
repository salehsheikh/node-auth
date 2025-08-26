"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/app/contexts/AuthContext";

export default function SubscriptionSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const verifySubscription = async () => {
      if (!sessionId) {
        setMessage("No session ID found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/api/stripe/verify-subscription",
          { sessionId },
          { 
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setMessage("Subscription successful! Thank you for subscribing.");
          setTimeout(() => {
            router.push("/posts");
          }, 3000);
        } else {
          setMessage("Subscription verification failed: " + response.data.message);
        }
      } catch (error) {
        console.error("Verification error:", error);
        if (error.response?.status === 401) {
          setMessage("Please log in to verify your subscription.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          setMessage("Error verifying subscription. Please contact support.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [sessionId, router, user]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Subscription Status</h1>
        {loading ? (
          <div>
            <p>Verifying your subscription...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mt-4"></div>
          </div>
        ) : (
          <>
            <p className="text-lg mb-4">{message}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}