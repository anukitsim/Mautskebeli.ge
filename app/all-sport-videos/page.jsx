"use client";

import React from 'react';
import SportsVideosList from '@/app/components/SportsVideoList';

const AllVideosPage = () => {
  return (
    <div className='bg-[#AD88C6]'>
      <SportsVideosList endpoint="https://mautskebeli.wpenginepowered.com/wp-json/custom/v1/sporti-videos" title="ყველა ვიდეო" />
    </div>
  );
};

export default AllVideosPage;