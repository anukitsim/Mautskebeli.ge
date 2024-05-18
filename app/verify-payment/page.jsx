"use client"

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const VerifyPayment = () => {
    const searchParams = useSearchParams();
    const transaction_id = searchParams.get('transaction_id');

    useEffect(() => {
        if (transaction_id) {
            verifyPayment(transaction_id);
        }
    }, [transaction_id]);

    const verifyPayment = async (transactionId) => {
        try {
            const response = await fetch(`https://mautskebeli.local/wp-json/wp/v2/verify-payment?transaction_id=${transactionId}`);
            const responseData = await response.json();
            if (response.ok) {
                alert('Payment verified successfully.');
                console.log('Payment verification success:', responseData);
            } else {
                alert('Payment verification failed: ' + responseData.message);
                console.error('Payment verification failed:', responseData.message);
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Error verifying payment: Please check the console for more details.');
        }
    };

    return (
        <div>
            <h1>Verifying Payment...</h1>
        </div>
    );
};

export default VerifyPayment;
