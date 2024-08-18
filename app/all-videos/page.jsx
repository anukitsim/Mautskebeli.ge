// app/all-videos/page.jsx
"use client";

import React from 'react';
import VideosList from '../components/VideosList';

const AllVideosPage = () => {
  return (
    <div>
      <VideosList 
        endpoint="https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/acf-fields"
        title="ყველა ვიდეო" 
      />
    </div>
  );
};

export default AllVideosPage;
