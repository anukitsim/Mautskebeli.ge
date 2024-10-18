"use client";

import React, { useState, useEffect } from "react";

const DonationResult = () => {
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handlePaymentStatus = async (orderId) => {
    try {
      const response = await fetch(
        "https://www.mautskebeli.ge/wp-json/wp/v2/verify-payment-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const result = await response.json();

      if (result.status === "Succeeded") {
        setPaymentMessage("Donation succeeded! Thank you for your support.");
        setIsError(false);
      } else {
        setPaymentMessage("Payment failed. Please try again.");
        setIsError(true);
      }
    } catch (error) {
      setPaymentMessage("Error capturing payment status.");
      setIsError(true);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orderId = new URLSearchParams(window.location.search).get("orderId");

      if (orderId) {
        handlePaymentStatus(orderId);
      } else {
        setPaymentMessage("No order ID found in the URL.");
        setIsError(true);
      }
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {paymentMessage ? (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg ${
            isError ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}
        >
          <span>{paymentMessage}</span>
        </div>
      ) : (
        <p>Processing payment status...</p>
      )}
    </div>
  );
};

export default DonationResult;
