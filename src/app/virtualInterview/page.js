"use client";

import React, { useContext, useEffect, useState } from "react";
import { Context } from "../appProvider";
import { useRouter } from "next/navigation";
import { FaCircle } from "react-icons/fa";
import { HiOutlineLightBulb } from "react-icons/hi";

export default function VirtualInterview() {
  const { state } = useContext(Context);
  const [essays, setEssays] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedEssayIndex, setSelectedEssayIndex] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch essays from your API or static data
    const fetchEssays = async () => {
      try {
        const response = await fetch(
          `/api/getUserSelfIntroduction?email=${encodeURIComponent(
            state.email
          )}`
        );
        const data = await response.json();
        setEssays(data);
      } catch (error) {
        console.error("Failed to fetch essays:", error);
      }
    };

    if (state.email) {
      fetchEssays();
    }
  }, [state.email]);

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleCheckboxChange = (index) => {
    if (selectedEssayIndex === index) {
      setSelectedEssayIndex(null);
      setContent(null);
    } else {
      setSelectedEssayIndex(index);
      setContent(essays[index].content);
    }
  };

  const handleNavigate = async () => {
    if (selectedEssayIndex !== null) {
      setLoading(true);
      const selectedEssay = essays[selectedEssayIndex];
      console.log(selectedEssay);
      const response = await fetch("/api/generateQuestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: selectedEssay.content,
          numQuestions: 3,
        }), // 요청 시 문제의 수를 지정
      });
      const questionsData = await response.json();

      // Ensure questionsData is an array before saving
      if (Array.isArray(questionsData.questions)) {
        const saveResponse = await fetch("/api/saveQuestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questions: questionsData.questions }),
        });

        if (saveResponse.ok) {
          router.push(
            `/streamingavatar?title=${encodeURIComponent(selectedEssay.title)}`
          );
        } else {
          setLoading(false);
          console.error("Failed to save questions");
        }
      } else {
        setLoading(false);
        console.error("Invalid questions format:", questionsData);
      }
    } else {
      alert("자소서를 선택하세요");
    }
  };

  return (
    <div className="flex px-20 py-10 gap-5">
      <div className="flex-[4]">
        <div className="border-y border-y-customGray px-10 py-5 relative">
          <div className="font-bold text-lg flex absolute top-[-1rem] z-10 bg-white font-pretendard text-2xl">
            <HiOutlineLightBulb size={23} />
            모의 면접 질문 생성
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-sm font-semibold">
              <FaCircle size={7} />
              <div className="px-2">
                한 번에&nbsp;
                <b className="text-customBlue">하나의 자소서만</b>&nbsp;선택
                가능하며
              </div>
            </div>
            <div className="flex items-center text-sm font-semibold">
              <FaCircle size={7} />
              <div className="px-2">
                질문은&nbsp;<b className="text-customBlue">자소서를 기반</b>으로
                생성되며 생성된 질문을 통해 모의면접이 진행됩니다.
              </div>
            </div>
          </div>
        </div>
        <div
          className=" h-[31rem] px-10 py-5"
          style={{ backgroundColor: "#F2F2F2" }}
        >
          <div className="text-black px-4 pb-2">cover letter Lists</div>
          <hr className="border border-black mb-3" />
          <div className="flex flex-col gap-3 h-[23rem] overflow-y-auto">
            {essays.map((essay, index) => {
              return (
                <div
                  key={index}
                  className={`${
                    selectedEssayIndex === index
                      ? "bg-customBlue text-white"
                      : "bg-white"
                  } px-4 py-4 rounded-lg border-2`}
                  style={{ borderColor: "#D6D6D6" }}
                  onClick={() => {
                    handleExpand(index);
                    handleCheckboxChange(index);
                  }}
                >
                  <div className="font-semibold text-lg">{essay.title}</div>
                </div>
              );
            })}
          </div>
          <div
            className={`${
              selectedEssayIndex !== null
                ? "bg-customBlue text-white"
                : "bg-customGray"
            } font-bold rounded-lg w-[7rem] py-2 flex items-center justify-center ml-[36rem] cursor-pointer`}
            onClick={handleNavigate}
          >
            {loading ? <span className="dot-animate">Loading</span> : "Select"}
          </div>
        </div>
      </div>
      <div className="border flex-[3]">
        <div
          className="px-7 py-5 border border-y-customGray"
          style={{ backgroundColor: "#F2F2F2" }}
        >
          <div className="font-semibold text-lg">자소서 미리보기</div>
          <div className="text-sm">read-only</div>
        </div>
        <div className="px-7 py-5 h-[29rem] w-[38rem] overflow-y-auto">
          {content}
        </div>
      </div>
      <style jsx>{`
        @keyframes dot-animate {
          0% {
            content: '';
          }
          20% {
            content: '.';
          }
          40% {
            content: '..';
          }
          60% {
            content: '...';
          }
          100% {
            content: '';
          }
        }

        .dot-animate:after {
          content: '';
          animation: dot-animate 2.5s infinite steps(1, end);
        }
      `}</style>
    </div>
  );
}
