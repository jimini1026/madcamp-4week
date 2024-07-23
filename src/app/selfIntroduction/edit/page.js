"use client";

import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../appProvider";
import { useRouter } from "next/navigation";

export default function Edit() {
  const { state } = useContext(Context);
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const [selfIntroductionData, setSelfIntroductionData] = useState("");
  const [charCountWithSpaces, setCharCountWithSpaces] = useState(0);
  const [charCountWithoutSpaces, setCharCountWithoutSpaces] = useState(0);
  const router = useRouter();

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
          setCharCountWithSpaces(data.content.length);
          setCharCountWithoutSpaces(data.content.replace(/\s/g, "").length);
        } catch (error) {
          console.error("Failed to fetch data: ", error);
        }
      };

      fetchData();
    }
  }, [title, state.email]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setSelfIntroductionData(newText);
    setCharCountWithSpaces(newText.length);
    setCharCountWithoutSpaces(newText.replace(/\s/g, "").length);
  };

  const handleSave = async () => {
    try {
      // Update existing self-introduction
      const saveResponse = await fetch("/api/updateSelfIntroduction", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.email,
          title,
          content: selfIntroductionData,
        }),
      });
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        alert(`저장 실패: ${errorData.message}`);
        return;
      }
      alert("자소서가 저장되었습니다.");
      router.push("/selfIntroduction");
    } catch (error) {
      console.error("Failed to save selfIntroduction", error);
      alert("자소서 저장에 실패하였습니다.");
    }
  };

  return (
    <div className="mx-[18rem] pt-10">
      <div className="flex">
        <div className="font-bold text-xl py-5 pl-10">Editing "{title}"</div>
        <div className="flex items-center">
          <button
            className="bg-customBlue text-white text-lg rounded-lg px-3"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
      <div className="border bg-white shadow-lg rounded-lg mx-8 px-5 py-5 h-[30rem]">
        <textarea
          className="w-full h-full border-none outline-none"
          onChange={handleTextChange}
          value={selfIntroductionData}
        />
        <div className="pt-2">
          <p>글자 수 (공백 포함): {charCountWithSpaces}</p>
          <p>(공백 제외): {charCountWithoutSpaces}</p>
        </div>
      </div>
    </div>
  );
}
