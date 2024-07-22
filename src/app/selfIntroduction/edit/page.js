"use client";

import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../appProvider";

export default function Edit() {
  const { state } = useContext(Context);
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const [selfIntroductionData, setSelfIntroductionData] = useState("");

  useEffect(() => {
    if (title) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `/api/getOneUserSelfIntroduction?email=${encodeURIComponent(
              state.email
            )}&title=${encodeURIComponent(title)}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setSelfIntroductionData(data.content);
        } catch (error) {
          console.error("Failed to fetch data: ", error);
        }
      };

      fetchData();
    }
  }, [title, state.email]);

  return (
    <div className="mx-[18rem] pt-10">
      <div className="flex">
        <div className="font-bold text-xl py-5 pl-10">Editing "{title}"</div>
        <div className="flex items-center">
          <button className="bg-customBlue text-white text-lg rounded-lg px-3">
            Save
          </button>
        </div>
      </div>
      <div className="border bg-white shadow-lg rounded-lg mx-8 px-5 py-5 h-[30rem]">
        <textarea
          className="w-full h-full border-none outline-none"
          onChange={(e) => setSelfIntroductionData(e.target.value)}
          value={selfIntroductionData}
        />
      </div>
    </div>
  );
}
