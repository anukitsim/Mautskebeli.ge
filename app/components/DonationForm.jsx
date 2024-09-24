"use client";

import React, { useState } from "react";
import Image from "next/image";

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
          შეგიძლიათ ნებისმიერ დროს. თუკი ეთანმხებით დააჭიეთ ვადასტურებს
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="bg-[#474F7A] text-white p-2 rounded hover:bg-gray-700"
            onClick={handleClose}
          >
            გათიშვა
          </button>
          <button
            className="bg-[#AD88C6] text-white p-2 rounded hover:bg-purple-700"
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
  // Set default donation amount to 5
  const [formData, setFormData] = useState({
    donationAmount: 5, // Default value set to 5
    donorName: "",
    donorEmail: "",
    donorPhone: "", // Optional phone field
    isRecurring: false,
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Handle form field updates
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Increment donation amount
  const handleIncrement = () => {
    setFormData({
      ...formData,
      donationAmount: (parseFloat(formData.donationAmount) || 0) + 1,
    });
  };

  // Decrement donation amount
  const handleDecrement = () => {
    setFormData({
      ...formData,
      donationAmount: Math.max(
        (parseFloat(formData.donationAmount) || 0) - 1,
        0
      ),
    });
  };

  // Handle Recurring checkbox click
  const handleRecurringChange = (e) => {
    if (e.target.checked) {
      setShowModal(true); // Show modal when the checkbox is checked
    } else {
      setFormData({ ...formData, isRecurring: false });
    }
  };

  const handleModalConfirm = () => {
    setFormData({ ...formData, isRecurring: true });
    setShowModal(false);
  };

  const handleModalClose = () => {
    setFormData({ ...formData, isRecurring: false });
    setShowModal(false);
  };

  // Form submission for one-time or recurring donations
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure that `donationAmount` is a number and other fields are trimmed strings
    const trimmedFormData = {
      donationAmount: parseFloat(formData.donationAmount), // Convert to float
      donorName: formData.donorName.trim(),
      donorEmail: formData.donorEmail.trim(),
      donorPhone: formData.donorPhone.trim() || undefined, // Optional field
      isRecurring: formData.isRecurring,
    };

    if (
      isNaN(trimmedFormData.donationAmount) ||
      !trimmedFormData.donorName ||
      !trimmedFormData.donorEmail
    ) {
      alert("Please fill out all required fields before submitting.");
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
          body: JSON.stringify(trimmedFormData), // Send the trimmed formData object to the backend
        }
      );

      const responseData = await response.json();
      setLoading(false);

      if (!response.ok) {
        console.error("Donation Failed:", responseData.message);
        alert("Failed to process donation: " + responseData.message);
      } else {
        console.log("Donation Success:", responseData);
        if (responseData.paymentUrl) {
          window.location.href = responseData.paymentUrl; // Redirect to the payment URL
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting donation:", error);
      alert(
        "Error submitting donation: Please check the console for more details."
      );
    }
  };

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

      <form
        onSubmit={handleSubmit}
        className="flex-col flex justify-center items-center rounded-lg h-auto bg-[url('/images/donacia-foni.png')] bg-cover bg-no-repeat p-6 sm:p-8 gap-6 w-full lg:w-[25vw] max-w-lg"
      >
        {/* Donation amount input with increment/decrement */}
        <div className="relative flex items-center w-full">
          <button
            type="button"
            onClick={handleDecrement}
            className="absolute left-2 bg-transparent border-none cursor-pointer"
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
          />
          <button
            type="button"
            onClick={handleIncrement}
            className="absolute right-2 bg-transparent border-none cursor-pointer"
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

        {/* Checkbox for Recurring Payment */}
        <label className="flex items-center whitespace-nowrap">
          <input
            type="checkbox"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleRecurringChange}
            className="mr-2"
          />
          ყოველთვიური გადახდა
        </label>

        {/* Submit button for processing the donation */}
        <button
          type="submit"
          className="bg-[#AD88C6] w-full text-white p-3 rounded-lg mt-4 hover:scale-105 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? "მუშავდება.." : "გადახდა"}
        </button>
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
