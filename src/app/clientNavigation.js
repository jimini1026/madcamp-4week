"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function ClientNavigation() {
  const pathname = usePathname();

  useEffect(() => console.log(pathname), [pathname]);

  return (
    <div className="h-16 flex items-center border-b-2 border-black overflow-hidden">
      <div className="font-bold text-xl pl-[8rem] pr-[3rem]">Daesi</div>
      <div className="border-l-[0.09rem] border-black h-full mx-4"></div>
      <Link href="/" className="ml-[43rem]">
        <div
          className={`font-bold w-[4rem] mx-2 text-center ${
            pathname === "/" ? "border-b-4 border-black" : "text-customGray"
          }`}
        >
          홈
        </div>
      </Link>
      <Link href="/selfIntroduction">
        <div
          className={`font-bold w-[4rem] mx-2 text-center ${
            pathname === "/selfIntroduction"
              ? "border-b-4 border-black"
              : "text-customGray"
          }`}
        >
          자소서
        </div>
      </Link>
      <Link href="/virtualInterview">
        <div
          className={`font-bold w-[4rem] mx-2 text-center ${
            pathname === "/virtualInterview"
              ? "border-b-4 border-black"
              : "text-customGray"
          }`}
        >
          모의면접
        </div>
      </Link>
      <Link href="/profile" className="flex ml-[6rem]">
        <div className="mx-3">
          <Image
            src="/images/person-circle.png"
            alt="기본 이미지"
            width={25}
            height={25}
          />
        </div>
        <div className="font-bold text-center text-customGray">임지민</div>
      </Link>
    </div>
  );
}
