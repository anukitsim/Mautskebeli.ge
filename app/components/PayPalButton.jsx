"use client";

import React, { useEffect, useRef, useContext } from "react";
import { PayPalContext } from "@/app/context/PayPalContext";

const PayPalButtonComponent = ({
  getDonationData,
  onTransactionComplete,
  onTransactionError,
}) => {
  const buttonContainerRef = useRef(null);
  const { sdkLoaded } = useContext(PayPalContext);

  useEffect(() => {
    if (!sdkLoaded) {
      console.log("PayPal SDK not loaded yet.");
      return;
    }
    if (!buttonContainerRef.current) {
      console.error("PayPal button container is not available.");
      return;
    }
    console.log("Rendering PayPal button...");
    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
          height: 45,
        },
        createOrder: (data, actions) => {
          console.log("Creating PayPal order...");
          const { donationAmount, donorName } = getDonationData();
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: donationAmount.toString(),
                },
                description: `Donation from ${donorName}`,
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          console.log("Transaction approved:", data);
          return actions.order.capture().then((details) => {
            console.log(
              "Transaction completed by:",
              details.payer.name.given_name
            );
            onTransactionComplete(details);
          });
        },
        onError: (err) => {
          console.error("PayPal Button Error:", err);
          onTransactionError(err);
        },
      })
      .render(buttonContainerRef.current)
      .catch((err) => {
        console.error("PayPal Render Error:", err);
      });

    return () => {
      console.log("Cleaning up PayPal button...");
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = "";
      }
    };
  }, [sdkLoaded, getDonationData, onTransactionComplete, onTransactionError]);

  return (
    <div
      className="w-full z-0 rounded-lg border-2 border-[#AD88C6] transition-transform duration-300 hover:scale-105 flex justify-center items-center"
      style={{ height: "50px", overflow: "hidden" }}
    >
      {!sdkLoaded ? (
        <svg
          className="animate-spin h-5 w-5 text-[#AD88C6]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : (
        <div
          ref={buttonContainerRef}
          id="paypal-button-container"
          style={{ width: "100%", height: "100%" }}
        ></div>
      )}
    </div>
  );
};

export default React.memo(
  PayPalButtonComponent,
  (prevProps, nextProps) =>
    prevProps.getDonationData === nextProps.getDonationData &&
    prevProps.onTransactionComplete === nextProps.onTransactionComplete &&
    prevProps.onTransactionError === nextProps.onTransactionError
);
