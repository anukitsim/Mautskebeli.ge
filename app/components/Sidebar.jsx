import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
  return (
    <aside className="lg:flex lg:flex-col hidden items-start gap-7 lg:w-3/12 p-8 rounded-[16px] border border-lilac-20 bg-lilac-20/20 shadow-md md:w-64 md:gap-7"
      style={{
        boxShadow: '4px 4px 12px rgba(93, 78, 116, 0.14)',
        border: '1px solid #E0DBE8',
        background: 'rgba(224, 219, 232, 0.20)'
      }}
    >
      <Link href="/shroma" className="flex flex-row gap-3">
        <Image src="/images/shroma.png" alt="shroma" width={0} height={0} style={{ width: 'auto', height: '20px' }} />
        <span className="text-[#222] text-[15px]">შრომა</span>
      </Link>
      <Link href="/mecniereba" className="flex flex-row gap-3">
        <Image
          src="/images/mecniereba.png"
          alt="mecniereba"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">მეცნიერება</span>
      </Link>
      <Link href="/ekonomika" className="flex flex-row gap-3">
        <Image
          src="/images/ekonomika.png"
          alt="ekonomika"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">ეკონომიკა</span>
      </Link>
      <Link href="/medicina" className="flex flex-row gap-3">
        <Image
          src="/images/medicina.png"
          alt="medicina"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">მედიცინა</span>
      </Link>
      <Link href="/xelovneba" className="flex flex-row gap-3">
        <Image
          src="/images/xelovneba.png"
          alt="xelovneba"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">ხელოვნება</span>
      </Link>
      <Link href="/qalaqi" className="flex flex-row gap-3">
        <Image
          src="/images/qalaqi.png"
          alt="qalaqi"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">ქალაქი</span>
      </Link>
      <Link href="/resursebi" className="flex flex-row gap-3">
        <Image
          src="/images/msoplio.png"
          alt="msoplio"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">რესურსები</span>
      </Link>
      <Link href="/msoflio" className="flex flex-row gap-3">
        <Image
          src="/images/saxli-yvelas.png"
          alt="msoflio"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">მსოფლიო</span>
      </Link>
      <Link href="/saxli-yvelas" className="flex flex-row gap-3">
        <Image
          src="/images/bechduri.png"
          alt="saxli-yvelas"
          width={0}
          height={0}
          style={{ width: 'auto', height: '20px' }}
        />
        <span className="text-[#222] text-[15px]">სახლი ყველას</span>
      </Link>
    </aside>
  );
};

export default Sidebar;
