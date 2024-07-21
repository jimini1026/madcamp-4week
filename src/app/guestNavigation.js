"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GuestNavigation() {
  const pathname = usePathname();

  return (
    <div className="h-16 flex items-center border-black overflow-hidden shadow-lg">
      <div className="font-bold text-xl pl-[20rem] pr-[3rem]">Daesi</div>
      <div className="border-l-[0.09rem] border-customGray h-full mx-4"></div>
      <Link href="/" className="ml-[31.5rem]">
        <div
          className={`font-bold w-[4rem] mx-2 text-center ${
            pathname === "/" ? "border-b-4 border-black" : "text-customGray"
          }`}
        >
          홈
        </div>
      </Link>
      <Link href="/login">
        <div
          className={`font-bold w-[4rem] mx-2 text-center ${
            pathname.startsWith("/login")
              ? "border-b-4 border-black"
              : "text-customGray"
          }`}
        >
          로그인
        </div>
      </Link>
      <Link href="/register">
        <div
          className={`font-bold w-[4rem] mx-2 text-center ${
            pathname.startsWith("/register")
              ? "border-b-4 border-black"
              : "text-customGray"
          }`}
        >
          회원가입
        </div>
      </Link>
    </div>
  );
}
