import { Suspense } from 'react';
import Podcast from "../components/Podcast";

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <Podcast />
      </div>
    </Suspense>
  );
}

export default Page;
