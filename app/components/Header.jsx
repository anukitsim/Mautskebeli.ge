import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="h-20 w-full flex bg-[#FBFAFC] flex-col items-start">
      
      <div className="w-10/12 h-1/2 mx-auto mt-5 flex justify-between items-center">
      <Link href='/'>
      <Image
          src="/images/IMG_0311.svg"
          alt="logo"
          width={116}
          height={32}
          priority
        />
      </Link>
       
        <div className="flex gap-8">
            <Link href="/donation" className="flex gap-2.5 text-xs justify-center items-center">
                <Image
                  src="/images/donation.svg"
                  alt="Live"
                  width={20}
                  height={20}
                  style={{ width: "20px", height: "20px" }}
                />
              
                <span className="hidden sm:inline text-[#474F7A]">დონაცია</span>
              </Link>
         
          <Link href="/live" className="flex gap-2.5 text-xs justify-center items-center">
            <Image
              src="/images/pirdapiri-eteri.svg"
              alt="Live"
              width={20}
              height={20}
            />
            {/* Hide text on small screens */}
            <span className="hidden sm:inline text-[#474F7A]">პირდაპირი ეთერი</span>
          </Link>
         
        </div>
      </div>
    </header>
  );
};

export default Header;
