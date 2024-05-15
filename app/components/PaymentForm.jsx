"use client"

import React, { useState } from 'react';

const PaymentForm = () => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCardDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    TbcPayments.processPayment({
      cardNumber: cardDetails.cardNumber,
      cardHolderName: cardDetails.cardHolderName,
      expiryDate: cardDetails.expiryDate,
      cvv: cardDetails.cvv,
      onSuccess: (response) => console.log('Payment Success:', response),
      onError: (error) => console.error('Payment Error:', error)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Card Number:</label>
        <input
          name="cardNumber"
          type="text"
          value={cardDetails.cardNumber}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Card Holder Name:</label>
        <input
          name="cardHolderName"
          type="text"
          value={cardDetails.cardHolderName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Expiry Date:</label>
        <input
          name="expiryDate"
          type="text"
          value={cardDetails.expiryDate}
          onChange={handleChange}
          placeholder="MM/YY"
          required
        />
      </div>
      <div>
        <label>CVV:</label>
        <input
          name="cvv"
          type="password"
          value={cardDetails.cvv}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Submit Payment</button>
    </form>
  );
};

export default PaymentForm;
