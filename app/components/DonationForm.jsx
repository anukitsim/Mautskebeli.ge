"use client";

import React, { useState } from "react";
import Image from "next/image";

const DonationForm = () => {
  const [formData, setFormData] = useState({
    donationAmount: "",
    donorName: "",
    donorEmail: "",
    isRecurring: false,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleIncrement = () => {
    setFormData({
      ...formData,
      donationAmount: (parseFloat(formData.donationAmount) || 0) + 1,
    });
  };

  const handleDecrement = () => {
    setFormData({
      ...formData,
      donationAmount: (parseFloat(formData.donationAmount) || 0) - 1,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        "https://mautskebeli.local/wp-json/wp/v2/submit-donation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
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
          window.location.href = responseData.paymentUrl;
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
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 pl-2 items-center">
        <Image
          src="/images/donacia.png"
          alt="donation"
          width={20}
          height={20}
        />
        <h1 className=" text-[15px] ">დონაცია</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-col flex justify-center items-center rounded-lg h-[380px] bg-[url('/images/donacia-foni.png')] bg-cover bg-no-repeat pr-[32px] pl-[32px] pt-[60px] pb-[31px] gap-4 max-w-md w-full"
      >
        <div className="relative flex items-center">
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
            placeholder="ოდენობა"
            className="p-3 rounded-lg border border-gray-300 w-full text-center hide-arrows"
            style={{ paddingLeft: "40px", paddingRight: "40px" }} // Ensure padding for the buttons
          />
          <button
            type="button"
            onClick={handleIncrement}
            className="absolute right-2 bg-transparent border-none cursor-pointer"
          >
            <img src="/images/plus.png" alt="Plus" />
          </button>
        </div>
        <input
          type="text"
          name="donorName"
          value={formData.donorName}
          onChange={handleInputChange}
          placeholder="სახელი:"
          className="p-3 rounded-lg border border-gray-300"
        />
        <input
          type="email"
          name="donorEmail"
          value={formData.donorEmail}
          onChange={handleInputChange}
          placeholder="ელ-ფოსტა"
          className="p-3 rounded-lg border border-gray-300"
        />
        <label className="flex items-center whitespace-nowrap">
          <input
            type="checkbox"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={(e) =>
              setFormData({ ...formData, isRecurring: e.target.checked })
            }
            className="mr-2 whitespace-nowrap"
          />
          ყოველ თვიური გადახდა
        </label>
        <button
          type="submit"
          className="bg-[#AD88C6] w-full text-white p-3 rounded-lg mt-4 hover:scale-105 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? "მუშავდება.." : "გადახდა"}
        </button>
      </form>
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
