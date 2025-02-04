// utils/paypal.js

let paypalScriptLoadingPromise = null;

export const loadPayPalScript = (clientId) => {
  if (typeof window === 'undefined') {
    // Prevent running on the server
    return Promise.reject(new Error("PayPal SDK can only be loaded in the browser."));
  }

  if (window.paypal) {
    console.log("PayPal SDK already loaded.");
    return Promise.resolve(window.paypal);
  }

  if (paypalScriptLoadingPromise) {
    console.log("PayPal SDK is already loading...");
    return paypalScriptLoadingPromise;
  }

  paypalScriptLoadingPromise = new Promise((resolve, reject) => {
    console.log("Starting to load PayPal SDK with currency: USD");

    const existingScript = document.querySelector(
      `script[src*="client-id=${clientId}"]`
    );
    if (existingScript) {
      console.log(
        "PayPal SDK script is already in the DOM. Using existing script."
      );
      return resolve(window.paypal);
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons`;
    script.async = true;

    script.onload = () => {
      console.log("PayPal SDK loaded successfully.");
      resolve(window.paypal);
    };

    script.onerror = () => reject(new Error("Failed to load PayPal SDK."));

    document.body.appendChild(script);
  });

  return paypalScriptLoadingPromise;
};
