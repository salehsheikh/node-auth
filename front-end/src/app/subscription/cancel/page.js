"use client";
import { useRouter } from "next/navigation";

export default function SubscriptionCancel() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Subscription Cancelled</h1>
        <p className="text-lg mb-6">Your subscription was not completed.</p>
        <button
          onClick={() => router.push("/subscription")}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 mr-4"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push("/")}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}