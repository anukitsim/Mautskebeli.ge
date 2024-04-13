import Image from "next/image"

const HomePageRcheuli = () => {
    return (
        <>
          <div className="w-10/12 flex justify-between mx-auto mt-[102px]">
            <p className="text-[#474F7A] text-[24px] font-bold">მაუწყებელი გირჩევთ</p>
          
          </div>
          <div className="flex lg:hidden overflow-x-auto hide-scroll-bar pl-2 mt-[42px]">
        <div className="flex ">
        {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className="inline-block px-2 w-[248px]"
              >
                {/* Placeholder for thumbnail */}
                <div className="w-full bg-purple-300 h-44 rounded-lg"></div>
    
                {/* Placeholder for caption */}
                <div className="w-full bg-purple-500 h-10 rounded"></div>
              </div>
            ))}
        </div>
      </div>
          <section className="lg:flex hidden w-10/12 mt-[69px]  gap-[20px] mx-auto  ">
            {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 w-full sm:w-1/2 md:w-1/3 lg:w-1/4  flex flex-col "
              >
                {/* Placeholder for thumbnail */}
                <div className="w-full bg-purple-300 h-44 rounded-lg"></div>
    
                {/* Placeholder for caption */}
                <div className="w-full bg-purple-500 h-10 rounded"></div>
              </div>
            ))}
          </section>
        </>
      )
}

export default HomePageRcheuli
