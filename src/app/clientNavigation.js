"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoPersonCircleSharp } from "react-icons/io5";
import { useContext, useEffect, useState } from "react";
import { Context } from "./appProvider";

export default function ClientNavigation() {
  const { state } = useContext(Context);
  const [profileImg, setProfileImg] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (state.email) {
      const imgKey = `profile_${state.email}`;
      const storedImg = localStorage.getItem(imgKey);
      if (storedImg) {
        setProfileImg(storedImg);
      }
    }
  }, [state.email]);

  useEffect(() => {
    if (state.userProfile) {
      setProfileImg(state.userProfile);
    }
  }, [state.userProfile]);

  return (
    <div className="h-16 flex items-center border-black overflow-hidden shadow-lg">
      <div className="font-bold text-xl pl-[20rem] pr-[3rem]">Cheetah</div>
      <div className="border-l-[0.09rem] border-customGray h-full mx-4"></div>
      <Link href="/" className="ml-[20rem]">
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
            pathname.startsWith("/selfIntroduction")
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
            pathname.startsWith("/virtualInterview")
              ? "border-b-4 border-black"
              : "text-customGray"
          }`}
        >
          모의면접
        </div>
      </Link>
      <Link href="/profile" className="flex ml-[6rem]">
        <div className="mx-2">
          {profileImg ? (
            <img
              className="m-3 h-10 w-10 rounded-full"
              src={profileImg}
              alt="프로필 이미지"
            />
          ) : (
            <IoPersonCircleSharp size={35} />
          )}
        </div>
        <div
          className={`${
            profileImg ? "mt-[16px]" : "mt-[4px]"
          }  font-bold text-center text-customGray`}
        >
          {state.username}
        </div>
      </Link>
    </div>
  );
}
