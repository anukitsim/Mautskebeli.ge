"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const DonationPopup = () => {
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [showDonationPopup, setShowDonationPopup] = useState(false);
  const donationModalRef = useRef(null);

  useEffect(() => {
    // Check session storage to determine if the popup should be shown
    const alreadyShown = sessionStorage.getItem('donationPopupShown');

    if (!alreadyShown) {
      setShowDonationPopup(true);
      sessionStorage.setItem('donationPopupShown', 'true'); // Set the flag in session storage
    }

    let timer = setTimeout(() => setShowCloseButton(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOverlayClick = (e) => {
      if (!donationModalRef.current?.contains(e.target)) {
        setShowDonationPopup(false);
      }
    };

    if (showDonationPopup) {
      document.addEventListener("click", handleOverlayClick);
      return () => document.removeEventListener("click", handleOverlayClick);
    }
  }, [showDonationPopup]);

  if (!showDonationPopup) return null;

  return (
    <div className="donation-modal-overlay">
      <div
        className="donation-modal relative bg-[url('/images/ილუსტრაცია.png')] w-[280px] h-[320px] bg-contain flex flex-col items-center justify-center gap-[32px]"
        ref={donationModalRef}
      >
        {showCloseButton && (
          <button className="absolute top-2 left-2" onClick={() => setShowDonationPopup(false)}>
            <img src="/images/donation-cross.png" alt="close" width={30} height={30} loading="lazy" />
          </button>
        )}
        <p className="text-white text-center text-[18px] font-extrabold">
          "მაუწყებელს" თქვენი მხარდაჭერა სჭირდება!
        </p>
        <Link href='/donation' className="inline-flex justify-center items-center h-[51px] rounded-[200px] bg-[#FECE27] pl-[32px] pr-[32px] pt-[18px] pb-[20px] text-[#8C74B2] font-bold text-[18px]">
          დაუჭირე მხარი
        </Link>
      </div>
    </div>
  );
};

export default DonationPopup;
