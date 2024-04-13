"use client"

import Image from 'next/image';
import React from 'react';

const HomePageStatiebi = () => {
  const truncateText = (text, limit) => {
    const words = text.split(' ');
    if (words.length > limit) {
      return words.slice(0, limit).join(' ') + '...';
    }
    return text;
  };

  const articleText = 'გთავაზობთ მწერალ გაბრიელ გარსია მარკესისა და ჟურნალისტ რობერტო პომბოს ვრცელ ინტერვიუს სუბკომანდანტე მარკოსთან. ინტერვიუ საპატისტას მოძრაობის პირველ ათწლეულს აჯამებს და აღწერს საპატისტას მიზნებს, ისტორიას და საფუძველმდებარე იდეებს...';

  return (
    <section className="mx-auto mt-[110px] flex flex-col">
      <style jsx global>{`
        @media (max-width: 768px) {
          .article:first-child {
            flex: 0 0 100%;
          }

          .articles-container {
            flex-wrap: nowrap;
          }

          .article:not(:first-child){
            flex: 0 0 100%
          }

          .article {
            flex: 0 0 auto;
          }
        }
      `}</style>
      <div className="flex w-10/12 mx-auto justify-between items-center mb-6">
        {/* ... other elements ... */}
      </div>
      <div className=" w-10/12 mx-auto flex articles-container overflow-x-auto flex-row gap-5">
      <div className="article  bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden">
        <div className="relative w-full" style={{ height: '220px' }}>
        <Image
              src="/images/statia-test.png"
              alt="article-cover"
              layout="fill"
              objectFit="cover"
              className="rounded-tl-[10px] rounded-tr-[10px]"
            />
          </div>
          <div className="p-[18px]">
            <h2 className="text-[20px] font-bold mb-2" style={{ color: '#474F7A' }}>
              საპატისტათა ქვიშის საათი
            </h2>
            <span className="text-[#8D91AB] text-[14px] font-bold">
              ინტერვიუ ჩამოართვეს გაბრიელ გარსია მარკესმა და რობერტო პომბომ
            </span>
            <p className="text-sm pt-[18px]" style={{ color: '#000' }}>
              {truncateText(articleText, 30)}
            </p>
            <div className="flex flex-col justify-end pt-[30px] items-end">
              <span className="text-[15px] text-[#AD88C6]">
                გიორგი ყურაშვილის თარგმანი
              </span>
              <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] pt-[10px] pb-[10px] pl-[12px] pr-[12px]">
                ნახეთ სრულად
              </button>
            </div>
          </div>
        </div>
        <div className="article  bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden">
        <div className="relative w-full" style={{ height: '220px' }}>
        <Image
              src="/images/statia-test.png"
              alt="article-cover"
              layout="fill"
              objectFit="cover"
              className="rounded-tl-[10px] rounded-tr-[10px]"
            />
          </div>
          <div className="p-[18px]">
            <h2 className="text-[20px] font-bold mb-2" style={{ color: '#474F7A' }}>
              საპატისტათა ქვიშის საათი
            </h2>
            <span className="text-[#8D91AB] text-[14px] font-bold">
              ინტერვიუ ჩამოართვეს გაბრიელ გარსია მარკესმა და რობერტო პომბომ
            </span>
            <p className="text-sm pt-[18px]" style={{ color: '#000' }}>
              {truncateText(articleText, 30)}
            </p>
            <div className="flex flex-col justify-end pt-[30px] items-end">
              <span className="text-[15px] text-[#AD88C6]">
                გიორგი ყურაშვილის თარგმანი
              </span>
              <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] pt-[10px] pb-[10px] pl-[12px] pr-[12px]">
                ნახეთ სრულად
              </button>
            </div>
          </div>
        </div>
        <div className="article  bg-[#F6F4F8] rounded-tl-[10px] rounded-tr-[10px] border border-[#B6A8CD] overflow-hidden">
        <div className="relative w-full" style={{ height: '220px' }}>
        <Image
              src="/images/statia-test.png"
              alt="article-cover"
              layout="fill"
              objectFit="cover"
              className="rounded-tl-[10px] rounded-tr-[10px]"
            />
          </div>
          <div className="p-[18px]">
            <h2 className="text-[20px] font-bold mb-2" style={{ color: '#474F7A' }}>
              საპატისტათა ქვიშის საათი
            </h2>
            <span className="text-[#8D91AB] text-[14px] font-bold">
              ინტერვიუ ჩამოართვეს გაბრიელ გარსია მარკესმა და რობერტო პომბომ
            </span>
            <p className="text-sm pt-[18px]" style={{ color: '#000' }}>
              {truncateText(articleText, 30)}
            </p>
            <div className="flex flex-col justify-end pt-[30px] items-end">
              <span className="text-[15px] text-[#AD88C6]">
                გიორგი ყურაშვილის თარგმანი
              </span>
              <button className="text-white text-[12px] mt-[16px] bg-[#AD88C6] rounded-[6px] pt-[10px] pb-[10px] pl-[12px] pr-[12px]">
                ნახეთ სრულად
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HomePageStatiebi;
