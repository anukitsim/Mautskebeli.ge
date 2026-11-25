"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import React from 'react';
import SportsVideosList from '@/app/components/SportsVideoList';

const AllVideosPage = () => {
  const { t, localize } = useLanguage();
  return (
    <div className='bg-[#AD88C6]'>
      <SportsVideosList endpoint="https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/sporti-videos" title={t("ყველა ვიდეო")} />
    </div>
  );
};

export default AllVideosPage;