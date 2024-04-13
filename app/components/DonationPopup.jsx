"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";


const DonationPopup = ({}) => {
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [showDonationPopup, setShowDonationPopup] = useState(true);

  // Function to close the donation popup
  const closeDonationPopup = () => {
    setShowDonationPopup(false);
  };

  const donationModalRef = useRef(null);

  // Function to show the close button after a delay
  useEffect(() => {
    const showCloseButtonAfterDelay = () => {
      setTimeout(() => {
        setShowCloseButton(true);
      }, 2000); // 2-second delay
    };

    showCloseButtonAfterDelay(); // Show close button after a delay
  }, []);

  // Event listener to close the donation popup when clicking outside the modal
  const handleOverlayClick = (e) => {
    if (
      donationModalRef.current &&
      !donationModalRef.current.contains(e.target)
    ) {
      closeDonationPopup();
    }
  };

  useEffect(() => {
    // Add the event listener when the donation popup is shown
    document.addEventListener("click", handleOverlayClick);

    // Remove the event listener when the component is unmounted or the donation popup is closed
    return () => {
      document.removeEventListener("click", handleOverlayClick);
    };
  }, [showDonationPopup]);

  if (!showDonationPopup) return null;

  return (
    <div className="donation-modal-overlay ">
       
      <div
        className="donation-modal relative bg-[url('/images/donation-popup.svg')] w-[280px] h-[320px] bg-contain flex flex-col items-center justify-center gap-[32px]"
        ref={donationModalRef}
      >
        {showCloseButton && (
          <button className="absolute top-2 left-2" onClick={closeDonationPopup}>
            <Image src="/images/donation-cross.png" alt="close" width={30} height={30} />
          </button>
        )}
    <p className="text-white text-center text-[18px] font-extrabold">"მაუწყებელს" თქვენი
მხარდაჭერა სჭირდება!</p>
<button className="inline-flex justify-center items-center h-[51px] rounded-[200px] bg-[#FECE27] pl-[32px] pr-[32px] pt-[18px] pb-[20px] text-[#8C74B2] font-bold text-[18px]">
დაუჭირე მხარი
</button>
      </div>
    </div>
  );
};

export default DonationPopup;
