import Image from "next/image";
import Link from "next/link";

const SportHeader = () => {
  return (
    <header className="h-20 w-full flex bg-[#AD88C6] flex-col items-start">
      
      <div className="w-10/12 h-1/2 mx-auto mt-5 flex justify-between items-center">
      <Link href='/'>
      <Image
          src="/images/sport-logo.svg"
          alt="logo"
          width={116}
          height={32}
          priority
        />
      </Link>
       
        <div className="flex gap-8">
          
        </div>
      </div>
    </header>
  );
};

export default SportHeader;
