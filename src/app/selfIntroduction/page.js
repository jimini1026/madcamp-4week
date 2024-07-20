"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SelfIntroduction() {
  useEffect(() => {
    // SelfIntroduction 페이지에 진입할 때 overflow-auto 설정
    document.body.style.overflow = "auto";

    // 페이지를 벗어날 때 overflow-hidden으로 되돌림
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  const SelfIntroductionList = ({ title }) => {
    return (
      <div className="border rounded-xl py-5 px-10 flex items-center relative">
        <div className="font-bold text-lg">{title}</div>
        <div className="bg-customBlue text-white rounded-lg px-6 py-1 text-sm absolute right-32 cursor-pointer">
          edit
        </div>
        <div className="bg-customGray text-white rounded-lg px-3 py-1 text-sm absolute right-10 cursor-pointer">
          delete
        </div>
      </div>
    );
  };

  return (
    <div className="self-introduction-container min-h-full bg-customGrayLight px-72 pt-10 pb-14">
      <div className="shadow-xl rounded-xl">
        <div className="font-bold rounded-t-xl text-3xl bg-customBlue h-20 flex items-center px-28 text-white">
          자소서 관리
        </div>
        <div className="bg-white py-5 flex items-center text-right relative min-w-full">
          <input
            placeholder="search your list..."
            className="border rounded-lg pr-28 h-10 w-[25rem] px-5 ml-[15rem]"
          />
          <button className="absolute right-[20rem]">Search</button>
          <div className="bg-customBlue rounded-lg px-4 py-2 ml-[6.5rem]">
            <Link
              href="/selfIntroduction/create"
              className="text-white font-semibold"
            >
              새로 작성
            </Link>
          </div>
        </div>
        <hr className="mx-20" />
        <div className="bg-white px-24 pt-5 pb-10 rounded-b-xl flex flex-col">
          <div className="font-semibold px-10 pb-3">Title</div>
          <div className="flex flex-col gap-4">
            <SelfIntroductionList title="자기소개서1" />
            <SelfIntroductionList title="자기소개서2" />
            <SelfIntroductionList title="자기소개서3" />
            <SelfIntroductionList title="자기소개서4" />
            <SelfIntroductionList title="자기소개서5" />
            <SelfIntroductionList title="자기소개서6" />
            <SelfIntroductionList title="자기소개서7" />
            <SelfIntroductionList title="자기소개서8" />
            <SelfIntroductionList title="자기소개서9" />
            <SelfIntroductionList title="자기소개서10" />
          </div>
        </div>
      </div>
    </div>
  );
}
