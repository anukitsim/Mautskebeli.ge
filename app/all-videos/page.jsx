// app/all-videos/page.jsx
"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import React from 'react';
import VideosList from '../components/VideosList';

const AllVideosPage = () => {
  const { t, localize } = useLanguage();
  return (
    <div>
      <VideosList 
        endpoint="https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/acf-fields"
        title={t("ყველა ვიდეო")} 
      />
    </div>
  );
};

export default AllVideosPage;
