import { Suspense } from 'react';
import Podcast from "../components/Podcast";

const Page = () => {
  return (
    <Suspense fallback={<div> <img src="/images/loader.svg" /></div>}>
      <div>
        <Podcast />
      </div>
    </Suspense>
  );
}

export default Page;
