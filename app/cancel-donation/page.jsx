// app/cancel-donation/page.jsx

"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentMessage from '../components/PaymentMessage';

const CancelDonation = () => {
    const searchParams = useSearchParams();
    const recId = searchParams.get('recId');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (recId) {
            const cancelRecurringDonation = async () => {
                try {
                    const response = await fetch(`/api/cancel-recurring-payment?recId=${recId}`);
                    const data = await response.json();

                    if (data.status === 'success') {
                        setMessage('Your recurring donation has been successfully cancelled.');
                        setIsError(false);
                    } else {
                        setMessage(data.message || 'Failed to cancel your recurring donation.');
                        setIsError(true);
                    }
                } catch (error) {
                    setMessage('An error occurred while cancelling your donation.');
                    setIsError(true);
                } finally {
                    setLoading(false);
                }
            };
            cancelRecurringDonation();
        } else {
            setMessage('No recurring donation ID provided.');
            setIsError(true);
            setLoading(false);
        }
    }, [recId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Processing your request...</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <PaymentMessage message={message} isError={isError} onClose={() => {}} />
        </div>
    );
};

export default CancelDonation;
