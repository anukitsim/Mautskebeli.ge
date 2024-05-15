"use client"

import React, { useState } from 'react';

const DonationForm = () => {
  const [formData, setFormData] = useState({
    donationAmount: '',
    donorName: '',
    donorEmail: '',
    isRecurring: false,
    recId: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
        setFormData({ ...formData, [name]: checked });
    } else {
        setFormData({ ...formData, [name]: value });
    }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    const bodyData = {
        ...formData,
        isRecurring: formData.isRecurring ? 1 : 0,  // Ensure the backend receives a clear flag for recurring
        recId: formData.recId  // This should be set when saving card data or from previous transactions
    };

    try {
        const response = await fetch('https://mautskebeli.local/wp-json/wp/v2/submit-donation/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || "Failed to submit donation");
        }

        alert('Donation processed successfully.');
        if (responseData.paymentUrl) {
            window.location.href = responseData.paymentUrl;
        }
    } catch (error) {
        console.error('Error submitting donation:', error);
        alert('Error submitting donation: ' + error.message);
    }
};




  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        name="donationAmount"
        value={formData.donationAmount}
        onChange={handleInputChange}
        placeholder="Donation Amount"
      />
      <input
        type="text"
        name="donorName"
        value={formData.donorName}
        onChange={handleInputChange}
        placeholder="Your Name"
      />
      <input
        type="email"
        name="donorEmail"
        value={formData.donorEmail}
        onChange={handleInputChange}
        placeholder="Your Email"
      />
      <label>
        <input
          type="checkbox"
          name="isRecurring"
          checked={formData.isRecurring}
          onChange={(e) =>
            setFormData({ ...formData, isRecurring: e.target.checked })
          }
        />
        Recurring Donation
      </label>
      <button type="submit">Submit Donation</button>
    </form>
  );
};

export default DonationForm;