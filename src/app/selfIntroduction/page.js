"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { Context } from "../appProvider";
import Image from "next/image";

export default function SelfIntroduction() {
  const { state, setState } = useContext(Context);
  const [selfIntroductionData, setSelfIntroductionData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/getUserSelfIntroduction?email=${encodeURIComponent(
            state.email
          )}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setSelfIntroductionData(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
    // // SelfIntroduction 페이지에 진입할 때 overflow-auto 설정
    // document.body.style.overflow = "auto";
    // // 페이지를 벗어날 때 overflow-hidden으로 되돌림
    // return () => {
    //   document.body.style.overflow = "hidden";
    // };
  }, [state.email]);

  const handleDeleteSelfIntroduction = async (title) => {
    try {
      const response = await fetch(
        `/api/deleteSelfIntroduction?email=${encodeURIComponent(
          state.email
        )}&title=${encodeURIComponent(title)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete self-introduction");
      }

      // 삭제 후 성공적으로 데이터를 갱신합니다.
      setSelfIntroductionData((prevData) =>
        prevData.filter((item) => item.title !== title)
      );
    } catch (error) {
      console.error("Failed to delete self-introduction:", error);
    }
  };

  const SelfIntroductionList = ({ title }) => {
    return (
      <div className="border rounded-xl py-5 px-10 flex items-center relative w-full">
        <div className="font-bold text-lg">{title}</div>
        <div className="bg-customBlue text-white rounded-lg px-6 py-1 text-sm absolute right-32 cursor-pointer">
          <Link
            href={`/selfIntroduction/edit?title=${encodeURIComponent(title)}`}
          >
            edit
          </Link>
        </div>
        <div
          className="bg-customGray text-white rounded-lg px-3 py-1 text-sm absolute right-10 cursor-pointer"
          onClick={() => handleDeleteSelfIntroduction(title)}
        >
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
        <div className="bg-white px-24 pt-5 pb-10 rounded-b-xl flex flex-col min-h-screen">
          <div className="font-semibold px-10 pb-3">
            {selfIntroductionData.length ? "Title" : null}
          </div>
          <div className="flex flex-col gap-4 items-center">
            {selfIntroductionData.length ? (
              selfIntroductionData.map((data) => {
                return (
                  <SelfIntroductionList key={data.title} title={data.title} />
                );
              })
            ) : (
              <div className="flex justify-center items-center flex-col text-[1.3rem] pt-28">
                <div className="text-customGray font-bold">
                  현재 저장된 자소서가 존재하지 않습니다.
                </div>
                <Image
                  alt="noData"
                  src={"/images/noData.png"}
                  className="mt-[-6rem]"
                  width={550}
                  height={550}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
