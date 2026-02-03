import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
  return (
    <aside
      className="lg:flex lg:flex-col hidden items-start justify-center lg:w-3/12 py-8 px-6 rounded-[16px] border border-lilac-20 bg-lilac-20/20 shadow-md md:w-64 flex-shrink-0 self-stretch min-h-0"
      style={{
        boxShadow: '4px 4px 12px rgba(93, 78, 116, 0.14)',
        border: '1px solid #E0DBE8',
        background: 'rgba(224, 219, 232, 0.20)'
      }}
    >
      <div className="flex flex-col gap-7 w-full">
      <Link href="/shroma" className="flex flex-row gap-3">
        <Image src="/images/shroma.svg" alt="shroma" width={0} height={0} style={{ width: 'auto', height: '20px' }} />
        <span className="text-[#222] text-[15px]">შრომა</span>
      </Link>
      <Link href="/mecniereba" className="flex flex-row gap-3">
        <Image
          src="/images/mecniereba.svg"
          alt="mecniereba"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">მეცნიერება</span>
      </Link>
      <Link href="/ekonomika" className="flex flex-row gap-3">
        <Image
          src="/images/ekonomika.svg"
          alt="ekonomika"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">ეკონომიკა</span>
      </Link>
      <Link href="/medicina" className="flex flex-row gap-3">
        <Image
          src="/images/medicina.svg"
          alt="medicina"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">მედიცინა</span>
      </Link>
      <Link href="/xelovneba" className="flex flex-row gap-3">
        <Image
          src="/images/xelovneba.svg"
          alt="xelovneba"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">ხელოვნება</span>
      </Link>
      <Link href="/kalaki" className="flex flex-row gap-3">
        <Image
          src="/images/qalaqi.svg"
          alt="qalaqi"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">ქალაქი</span>
      </Link>
      <Link href="/resursebi" className="flex flex-row gap-3">
        <Image
          src="/images/resursebi.svg"
          alt="msoplio"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">რესურსები</span>
      </Link>
      <Link href="/msoflio" className="flex flex-row gap-3">
        <Image
          src="/images/msoflio.svg"
          alt="msoflio"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">მსოფლიო</span>
      </Link>
      <Link href="/saxli" className="flex flex-row gap-3">
        <Image
          src="/images/saxli.svg"
          alt="`saxli`-yvelas"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">სახლი ყველას</span>
      </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
