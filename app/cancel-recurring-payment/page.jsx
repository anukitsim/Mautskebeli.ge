// app/cancel-recurring-payment/page.jsx

"use client"

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'; // Forces the page to be rendered dynamically

export default function CancelRecurringPayment() {
  const router = useRouter();
  const { recId, token } = router.query; // Extract recId and token from the query string

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
