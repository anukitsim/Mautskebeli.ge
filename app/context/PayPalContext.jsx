// app/context/PayPalContext.jsx

'use client';

import React, { createContext, useState, useEffect } from 'react';
import { loadPayPalScript } from '@/utils/paypal';

// Create the PayPalContext
export const PayPalContext = createContext();

// Create the PayPalProvider component
export const PayPalProvider = ({ children }) => {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const clientId = 'AYlqZEZoVSEneZaXSwsFmsVu0kTwaASIwdn9clPyg-pTLhc57WWyHSHAHCkMlfwF7Trp1vpGLqsf41Fx'; // Use environment variable

  useEffect(() => {
    if (!clientId) {
      console.error("PayPal Client ID is not defined in environment variables.");
      return;
    }

    let isMounted = true;

    // Load the PayPal SDK
    loadPayPalScript(clientId)
      .then(() => {
        if (isMounted) {
          console.log("PayPal SDK loaded successfully.");
          setSdkLoaded(true);
        }
      })
      .catch((error) => {
        console.error("Failed to load PayPal SDK:", error);
      });

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [clientId]);

  return (
    <PayPalContext.Provider value={{ sdkLoaded }}>
      {children}
    </PayPalContext.Provider>
  );
};
