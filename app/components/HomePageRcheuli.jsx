import Image from "next/image"

const HomePageRcheuli = () => {
    return (
        <>
          <div className="w-10/12 flex justify-between mx-auto">
            <p className="section-title">მაუწყებელი გირჩევთ</p>
          
          </div>
          <section className="flex  w-10/12   gap-[20px] mx-auto  ">
            {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 w-full sm:w-1/2 md:w-1/3 lg:w-1/4  flex flex-col  gap-2"
              >
                {/* Placeholder for thumbnail */}
                <div className="w-full bg-purple-300 h-44 rounded-lg"></div>
    
                {/* Placeholder for caption */}
                <div className="w-full bg-purple-500 h-6 rounded"></div>
              </div>
            ))}
          </section>
        </>
      )
}

export default HomePageRcheuli
