"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PayPalButtons } from "@paypal/react-paypal-js";

const OvalButton = ({ amount, setAmount }) => {
  const handleIncrement = () => {
    if (amount < 100) {
      setAmount((prev) => ({
        ...prev,
        amount: amount + 1,
      }));
    }
  };

  const handleDecrement = () => {
    if (amount > 5) {
      setAmount((prev) => ({
        ...prev,
        amount: amount - 1,
      }));
    }
  };

  return (
    <div className="flex items-center relative">
      <div
        className="flex items-center justify-center cursor-pointer absolute left-3"
        onClick={handleDecrement}
      >
        <Image src="/images/minus.png" alt="minus" width={24} height={24} />
      </div>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="border border-[#CBCBCB] text-center w-full h-[40px] rounded-[40px]"
        value={amount}
        onChange={(e) => {
          const newValue = parseInt(e.target.value, 10);
          if (!isNaN(newValue) && newValue >= 5 && newValue <= 100) {
            setAmount(newValue);
          }
        }}
      />
      <div
        className=" flex items-center justify-center cursor-pointer absolute right-3"
        onClick={handleIncrement}
      >
        <Image src="/images/plus.png" alt="minus" width={24} height={24} />
      </div>
    </div>
  );
};

const Buttons = ({ isAnonymous, state, setError, handleApprove }) => {
  const { name, otherAmount, amount , email} = state
  const total = Number(otherAmount) + amount
  return (
    <PayPalButtons
      key={total}
      className="h-[45px]"
      createOrder={(_, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              description: `${!isAnonymous ? name : "Anonymous"} ${
                email
              } Donation`,
              amount: {
                value: total,
              },
            },
          ],
        });
      }}
      onError={(err) => {
        setError(err);
        console.error("PayPal Checkout onError", err);
      }}
      fundingSource="paypal"
      style={{ layout: "vertical" }}
      disabled={false}
      forceReRender={{ layout: "vertical" }}
      onApprove={async (data, actions) => {
        const order = await actions.order.capture();
        console.log("order", order);
        handleApprove(data.orderID);
      }}
    />
  );
};

const Donation = () => {
  const initialState = {
    amount: 5,
    otherAmount: 0,
    name: "",
    email: "",
    totalAmount: 0,
  }
  const [state, setState] = useState(initialState);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasApproved, setHasApproved] = useState(false);
  const [error, setError] = useState(null);

  const handleAnonymousChange = () => {
    setIsAnonymous(!isAnonymous);
  };

  const handleApprove = (orderId) => {
    if (orderId) {
      setState(initialState)
      alert("Thank you for your purchase!");
    } else {
      alert("Something went wrong while processing the payments.")
    }
  }

  if (error) {
    // Display error message, modal or redirect user to error page
    alert(error);
  }

  return (
    <div className="flex w-[380px] bg-gradient-to-r from-[#D2D4DC] to-[#E0DBE8] border border-[#CBCBCB] gap-[12px] mx-auto flex-col py-[18px] items-center rounded-[12px] ">
      <form className="w-full pl-[18px] pr-[18px] ">
        <div className="flex flex-row w-full gap-2 items-start mb-4">
          <div className="w-2/4">
            <h2 className="text-[#767676] text-[14px] font-medium mb-3">
              ოდენობა amount
            </h2>
            <OvalButton amount={state.amount} setAmount={setState} />
          </div>
          <div className="w-2/4">
            <h2 className="text-[#767676] text-[14px] font-medium">
              სხვა თანხა
            </h2>
            <input
              type="number"
              className="border border-[#CBCBCB] w-full mt-3 h-[40px] rounded-[6px] pl-[24px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="სხვა თანხა other amount"
              value={state.otherAmount}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  otherAmount: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <h2 className="text-[#767676] text-[14px] font-medium">
          პირადი ინფორმაცია Personal Information
        </h2>
        <input
          type="text"
          disabled={isAnonymous}
          className="w-[340px] border border-[#CBCBCB] text-[#000] text-[14px] rounded-[6px] pt-[12px] pb-[12px] pl-[24px] h-[44px] mt-[12px] flex justify-center"
          placeholder="სახელი name"
          value={isAnonymous ? "" : state.name}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />

        {/* Custom radio button (styled checkbox) and text for "ანონიმურად" */}
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={handleAnonymousChange}
            style={{ cursor: "pointer" }}
          />
          <label
            htmlFor="anonymous"
            className="text-[#000] text-[14px] cursor-pointer ml-2"
          >
            ანონიმურად anonymously
          </label>
        </div>

        <input
          required
          type="email"
          className="w-[340px] border border-[#CBCBCB] text-[#000] text-[14px] rounded-[6px] pt-[12px] pb-[12px] pl-[24px] h-[44px] mt-[12px] flex justify-center"
          placeholder="ელ. ფოსტა mail e-mail"
          value={state.email}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
        />

        {/* Custom radio button (styled checkbox) and text for "ანონიმურად" */}
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="approve"
            onChange={() => setHasApproved(!hasApproved)}
            style={{ cursor: "pointer" }}
            required
          />
          <label
            htmlFor="approve"
            className="text-[#000] text-[14px] cursor-pointer ml-2"
          >
            ვეთანხმები წესებსა და პირობებს I agree to the terms and conditions
          </label>
        </div>

        <h2 className="text-[#767676] text-[14px] font-medium mt-[24px] text-center">
          გადახდის მეთოდი method of payment
        </h2>
        <div className="flex flex-col gap-[8px] mt-[10px] relative">
          <div className="flex-row flex items-center whitespace-nowrap gap-[8px] bg-white py-2 justify-center w-full hover:bg-[#c4c4c4]">
            <label className="flex items-center gap-[8px]">
              <Image
                src="/images/card.png"
                alt="paypal"
                width={30}
                height={30}
              />
              Credit/Debit card
            </label>
          </div>
          <h2 className="text-[#767676] text-[14px] font-medium text-center">
            ან or
          </h2>
          <div className="relative">
            <Buttons
              {...{
                setError,
                state,
                isAnonymous,
                handleApprove,
              }}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Donation;
