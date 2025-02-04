// components/DonationForm.jsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import PayPalButton from "./PayPalButton";

// PaymentMessage Component
const PaymentMessage = ({ message, isError, onClose }) => {
  if (!message) return null;
  return (
    <div
      className={`fixed top-100 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg ${
        isError ? "bg-red-500 text-white" : "bg-green-500 text-white"
      } flex items-center space-x-4 z-50`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-white font-semibold border-none bg-transparent focus:outline-none"
        aria-label="Close"
      >
        ✖
      </button>
    </div>
  );
};

// Modal Component
const Modal = ({ show, handleClose, handleConfirm }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">ყოველთვიური გადახდა</h2>
        <p className="mb-6">
          ბარათის მონაცემები შეინახება და ყოველთვიურად ავტომატურად ჩამოგეჭრებათ
          მითითებული თანხა. გადახდის დღემდე 2 დღით ადრე მიიღებთ გამაფრთხილებელ
          შეტყობინებას ელექტრონული ფოსტის საშუალებით. გამოწერის გაუქმება
          შეგიძლიათ ნებისმიერ დროს. თუკი ეთანხმებით დააჭირეთ ღილაკს - ვადასტურებ
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="bg-[#474F7A] text-white p-2 rounded hover:bg-gray-700"
            onClick={handleClose}
          >
            გათიშვა
          </button>
          <button
            className="bg-[#AD88C6] text-white p-2 rounded hover:bg-[#9B7EBD]"
            onClick={handleConfirm}
          >
            ვადასტურებ
          </button>
        </div>
      </div>
    </div>
  );
};

const DonationForm = () => {
  const [formData, setFormData] = useState({
    donationAmount: 5, // Default donation amount
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    isRecurring: false, // Set to false by default
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const searchParams = useSearchParams();

  // Ref to hold the latest formData
  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Callback to get the latest donation data
  const getDonationData = useCallback(() => {
    return {
      donationAmount: parseFloat(formDataRef.current.donationAmount),
      donorName: formDataRef.current.donorName.trim(),
      donorEmail: formDataRef.current.donorEmail.trim(),
      donorPhone: formDataRef.current.donorPhone.trim(),
      isRecurring: formDataRef.current.isRecurring,
    };
  }, []);

  // This effect checks if the user was redirected back from a TBC payment
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) {
      handlePaymentStatus(orderId, setPaymentMessage, setIsError);
    }
  }, [searchParams]);

  // Function to finalize PayPal donation by calling the backend
  const finalizePayPalDonation = useCallback(
    async (details, currency, donorName, donorEmail) => {
      console.log("Finalizing PayPal donation with details:", details);
      try {
        // Extract necessary details from PayPal response
        const transactionID = details.id; // PayPal order ID

        // Determine payment method based on context
        const payment_method = "PayPal";

        // Determine currency from PayPal details
        const currencyCode =
          details.purchase_units[0].amount.currency_code || "USD";

        // Access the latest formData from the ref
        const currentFormData = formDataRef.current;

        // Build the payload expected by /paypal-donation-complete
        const payload = {
          donationAmount: parseFloat(currentFormData.donationAmount),
          donorName: donorName,
          donorEmail: donorEmail,
          donorPhone: currentFormData.donorPhone.trim() || "",
          isRecurring: currentFormData.isRecurring,
          transactionID: transactionID,
          currency: currencyCode,
          payment_method: payment_method,
          payment_type: currentFormData.isRecurring ? "Recurring" : "One-Time",
        };

        // Send POST request to finalize the donation in WordPress
        const res = await fetch(
          "https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/paypal-donation-complete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const json = await res.json();
        if (!res.ok) {
          console.error("Failed to finalize PayPal donation:", json);
          setPaymentMessage("PayPal donation finalization failed.");
          setIsError(true);
        } else {
          console.log("PayPal donation saved to WordPress:", json);
          setPaymentMessage("PayPal donation completed successfully.");
          setIsError(false);
          // Optionally, you can reset the form or perform other actions here
        }
      } catch (error) {
        console.error("Error finalizing PayPal donation:", error);
        setPaymentMessage(
          "Error finalizing donation. Please try again later."
        );
        setIsError(true);
      }
    },
    [] // No dependencies needed as we're using a ref
  );

  // HandleTransactionComplete
  const handleTransactionComplete = useCallback(
    (details) => {
      console.log("Transaction completed:", details);

      // Extract currency from PayPal details
      const currency =
        details.purchase_units[0].amount.currency_code || "USD";

      // Extract donor information from PayPal details if form is not filled
      const currentFormData = formDataRef.current;
      const donorName =
        currentFormData.donorName.trim() ||
        `${details.payer.name.given_name} ${details.payer.name.surname}`;
      const donorEmail =
        currentFormData.donorEmail.trim() || details.payer.email_address;

      // Log the extracted donor email
      console.log("Extracted Donor Email:", donorEmail);

      // Now finalize in WP
      finalizePayPalDonation(details, currency, donorName, donorEmail);
    },
    [finalizePayPalDonation]
  );

  // HandleTransactionError
  const handleTransactionError = useCallback((error) => {
    setPaymentMessage("An error occurred during the transaction.");
    setIsError(true);
    console.error("PayPal Error:", error);
  }, []);

  // Handle form field updates
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Increment the donation amount by 5
  const handleIncrement = () => {
    setFormData((prev) => ({
      ...prev,
      donationAmount: Math.max((parseFloat(prev.donationAmount) || 0) + 5, 5),
    }));
  };

  // Decrement the donation amount by 5 (stopping at 5 as minimum)
  const handleDecrement = () => {
    setFormData((prev) => ({
      ...prev,
      donationAmount: Math.max((parseFloat(prev.donationAmount) || 0) - 5, 5),
    }));
  };

  // Handle recurring payments checkbox
  const handleRecurringChange = (e) => {
    if (e.target.checked) {
      setShowModal(true);
    } else {
      setFormData({ ...formData, isRecurring: false });
    }
  };

  // Modal handlers
  const handleModalConfirm = () => {
    setFormData({ ...formData, isRecurring: true });
    setShowModal(false);
  };

  const handleModalClose = () => {
    setFormData({ ...formData, isRecurring: false });
    setShowModal(false);
  };

  // Handle form submission for TBC donations
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedFormData = {
      donationAmount: parseFloat(formData.donationAmount),
      donorName: formData.donorName.trim(),
      donorEmail: formData.donorEmail.trim(),
      donorPhone: formData.donorPhone.trim() || undefined,
      isRecurring: formData.isRecurring,
      payment_method: "Local", // Explicitly set payment_method
      currency: "GEL", // Always GEL for local donations
    };

    if (
      isNaN(trimmedFormData.donationAmount) ||
      !trimmedFormData.donorName ||
      !trimmedFormData.donorEmail
    ) {
      setPaymentMessage("Please fill out all required fields before submitting.");
      setIsError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/submit-donation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trimmedFormData),
        }
      );

      const responseData = await response.json();
      setLoading(false);

      if (!response.ok) {
        console.error("Donation Failed:", responseData.message);
        setPaymentMessage("Failed to process donation: " + responseData.message);
        setIsError(true);
      } else {
        if (responseData.paymentUrl) {
          // Redirect to the TBC payment URL
          window.location.href = responseData.paymentUrl;
        } else {
          // Payment succeeded but no redirect (rare scenario)
          if (formData.isRecurring) {
            setPaymentMessage(
              "Recurring donation setup successful, card will be saved for future transactions."
            );
            setIsError(false);
          } else {
            setPaymentMessage("One-time donation completed successfully.");
            setIsError(false);
          }
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting donation:", error);
      setPaymentMessage(
        "Error submitting donation: Please try again later."
      );
      setIsError(true);
    }
  };

  const closePaymentMessage = () => {
    setPaymentMessage("");
  };

  // The component JSX
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 pl-2 items-center">
        <Image
          src="/images/donacia.png"
          alt="donation"
          width={20}
          height={20}
        />
        <h1 className="text-[18px] font-semibold">დონაცია</h1>
      </div>

      {/* Payment Message Component */}
      <PaymentMessage
        message={paymentMessage}
        isError={isError}
        onClose={closePaymentMessage}
      />

      <form
        onSubmit={handleSubmit}
        className="flex-col flex justify-center items-center rounded-lg h-auto bg-[url('/images/donacia-foni.png')] bg-cover bg-no-repeat p-6 sm:p-8 gap-6 w-full lg:w-[25vw] max-w-lg"
      >
        {/* Donation amount input with increment/decrement */}
        <div className="relative flex items-center w-full">
          <button
            type="button"
            onClick={handleDecrement}
            className="absolute left-2 bg-transparent border-none cursor-pointer focus:outline-none"
            aria-label="Decrease donation amount"
          >
            <img src="/images/minus.png" alt="Minus" />
          </button>
          <input
            type="number"
            name="donationAmount"
            value={formData.donationAmount}
            onChange={handleInputChange}
            placeholder="ლარი"
            className="p-3 rounded-lg border border-gray-300 w-full text-center hide-arrows"
            style={{ paddingLeft: "60px", paddingRight: "60px" }}
            required
            min={5}
          />
          <button
            type="button"
            onClick={handleIncrement}
            className="absolute right-2 bg-transparent border-none cursor-pointer focus:outline-none"
            aria-label="Increase donation amount"
          >
            <img src="/images/plus.png" alt="Plus" />
          </button>
        </div>

        {/* Donor's Name Input */}
        <input
          type="text"
          name="donorName"
          value={formData.donorName}
          onChange={handleInputChange}
          placeholder="სახელი *"
          className="p-3 rounded-lg border border-gray-300 w-full"
          required
        />

        {/* Donor's Email Input */}
        <input
          type="email"
          name="donorEmail"
          value={formData.donorEmail}
          onChange={handleInputChange}
          placeholder="ელ-ფოსტა *"
          className="p-3 rounded-lg border border-gray-300 w-full"
          required
        />

        {/* Donor's Phone Input (Optional) */}
        <input
          type="tel"
          name="donorPhone"
          value={formData.donorPhone}
          onChange={handleInputChange}
          placeholder="ტელეფონის ნომერი"
          className="p-3 rounded-lg border border-gray-300 w-full"
        />

        {/* Checkbox for Recurring Payment + Tooltip on Hover */}
        <div
          className="relative inline-block group"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <label className="flex items-center whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleRecurringChange}
              className="mr-2"
            />
            ყოველთვიური გადახდა
          </label>

          {/* Tooltip with monthly-payment explanation, shown on hover */}
          {showTooltip && (
            <div className="absolute z-10 top-full left-0 mt-2 w-72 p-3 bg-white border border-gray-300 rounded shadow-md text-sm text-gray-700">
              <p className="font-semibold mb-2">ყოველთვიური გადახდა</p>
              <p>
                ბარათის მონაცემები შეინახება და ყოველთვიურად ავტომატურად
                ჩამოგეჭრებათ მითითებული თანხა. გადახდის დღემდე 2 დღით ადრე
                მიიღებთ გამაფრთხილებელ შეტყობინებას ელექტრონული ფოსტის
                საშუალებით. გამოწერის გაუქმება შეგიძლიათ ნებისმიერ დროს.
              </p>
            </div>
          )}
        </div>

        {/* TBC "Submit" button */}
        <button
          type="submit"
          className="bg-[#AD88C6] w-full text-white p-3 rounded-lg mt-4 hover:scale-105 transition-transform duration-300 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "მუშაობდა.." : "გადახდა"}
        </button>

        {/* PayPal Button Container */}
        <PayPalButton
          getDonationData={getDonationData}
          onTransactionComplete={handleTransactionComplete}
          onTransactionError={handleTransactionError}
        />

        {/* Terms of Service and Privacy Policy */}
        <div className="mt-4">
          <p
            className={`text-sm cursor-pointer ${
              showTerms ? "text-[#AD88C6] font-bold" : "text-gray-600"
            }`}
            onClick={() => setShowTerms(!showTerms)}
          >
            {showTerms ? "დახურვა" : "მომსახურების პირობები"}
          </p>
          {showTerms && (
            <div className="text-sm text-gray-700 mt-2">
              <p>
                <strong>მომსახურების პირობები:</strong>
              </p>
              <p>
                1. დონაცია არის ნებაყოფლობითი და არ ექვემდებარება დაბრუნებას.
                <br />
                2. შეგიძლიათ აირჩიოთ ერთჯერადი ან ყოველთვიური დონაცია.
                <br />
                3. ყოველთვიური დონაცია ავტომატურად ჩამოიჭრება თქვენ მიერ
                მითითებული ბარათიდან ყოველთვიურად, ხოლო გადახდის წინ მიიღებთ
                ელფოსტაზე გამაფრთხილებელ შეტყობინებას.
                <br />
                4. ყოველთვიური დონაციის გაუქმება შესაძლებელია ნებისმიერ დროს,
                გაუქმების ბმული გამოგეგზავნებათ ელ-ფოსტაზე.
                <br />
                5. ყველა გადახდა უსაფრთხოდ მუშავდება TBC ბანკის სისტემებით. ჩვენ
                არ ვინახავთ ბარათის informaciją მონაცემთა ბაზაში.
              </p>
            </div>
          )}

          <p
            className={`text-sm cursor-pointer mt-2 ${
              showPrivacy ? "text-[#AD88C6] font-bold" : "text-gray-600"
            }`}
            onClick={() => setShowPrivacy(!showPrivacy)}
          >
            {showPrivacy ? "დახურვა" : "კონფიდენციალურობის პოლიტიკა"}
          </p>
          {showPrivacy && (
            <div className="text-sm text-gray-700 mt-2">
              <p>
                <strong>კონფიდენციალურობის პოლიტიკა:</strong>
              </p>
              <p>
                1. ჩვენ ვაგროვებთ მხოლოდ იმ მონაცემებს, რომლებიც საჭიროა
                ტრანზაქციის დასამუშავებლად: სახელი, ელფოსტა და (სურვილისამებრ)
                ტელეფონის ნომერი.
                <br />
                2. თქვენი ბარათის მონაცემები უსაფრთხოდ მუშავდება TBC ბანკის
                მიერ. ჩვენ არ ვინახავთ ბარათის დეტალებს მონაცემთა ბაზაში.
                <br />
                3. თქვენი მონაცემები არ გაიყიდება ან გადაეცემა მესამე მხარეებს
                სარეკლამო მიზნებისთვის.
                <br />
                4. ყოველთვიური დონაციის შემთხვევაში, ბარათის ინფორმაცია ინახება
                ბანკის სისტემებში და გამოიყენება მომდევნო გადახდებისთვის.
                <br />
                5. თქვენ გაქვთ უფლება მოითხოვოთ თქვენი მონაცემების წაშლა ან
                შეცვლა ნებისმიერ დროს.
              </p>
            </div>
          )}
          <p className="text-xs font-light text-gray-700 mt-10">
            მიმღები: შპს. მაუწყებელი 2021
          </p>
        </div>
      </form>

      {/* Modal Popup */}
      <Modal
        show={showModal}
        handleClose={handleModalClose}
        handleConfirm={handleModalConfirm}
      />

      <style jsx>{`
        /* Hide number input arrows */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default DonationForm;
