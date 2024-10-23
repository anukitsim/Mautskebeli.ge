// app/cancel-recurring-payment/page.jsx

"use client";

import { useSearchParams } from 'next/navigation'; // Correct way in App Router
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

export default function CancelRecurringPayment() {
  const searchParams = useSearchParams();
  const recId = searchParams.get('recId');
  const token = searchParams.get('token');

  const [status, setStatus] = useState('Processing your request...');

  useEffect(() => {
    if (recId && token) {
      // Send the cancellation request to the WordPress API
      fetch(`/api/cancel-recurring-payment?recId=${recId}&token=${token}`, {
        method: 'POST',
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            setStatus('Your recurring payment has been successfully cancelled.');
          } else {
            setStatus('There was a problem processing your request.');
          }
        })
        .catch(() => setStatus('There was an error processing your cancellation.'));
    }
  }, [recId, token]);

  return (
    <div>
      <h1>Cancel Recurring Payment</h1>
      <p>{status}</p>
    </div>
  );
}
