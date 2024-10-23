"use client";

import React from 'react';

const PaymentMessage = ({ message, isError, onClose }) => {
    if (!message) return null;

    return (
        <div
            className={`fixed top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg z-60 ${
                isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
        >
            <span>{message}</span>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 text-white font-semibold border-none bg-transparent"
                >
                    ✖
                </button>
            )}
        </div>
    );
};

export default PaymentMessage;
