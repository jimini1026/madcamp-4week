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
      const selectedEssay = essays[selectedEssayIndex];
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
          router.push("/streamingavatar");
        } else {
          console.error("Failed to save questions");
        }
      } else {
        console.error("Invalid questions format:", questionsData);
      }
    }
  };

  return (
    <div className="flex px-20 py-10 gap-5">
      <div className="flex-[4]">
        <div className="border-y border-y-customGray px-10 py-5 relative">
          <div className="font-bold text-lg flex absolute top-[-1rem] z-10 bg-white">
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
            onClick={() => {
              if (selectedEssayIndex !== null) {
                handleNavigate();
              }
            }}
          >
            Select
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
        <div className="px-7 py-3 h-[25rem] overflow-x-hidden overflow-y-auto">
          대한항공의 혁신적인 광고 캠페인과 글로벌 영향력에 매료되어 지원 부문의
          직무에 관심을 갖게 되었습니다. 어린 시절부터 대한항공의 영감을 주는
          광고를 통해 마케팅의 힘을 목격하며, 사람들의 감정을 움직이고 행동을
          유도하는 데 깊은 매력을 느끼게 되었습니다. 대학에서 마케팅을 전공하고
          학생회를 통해 학교 광고 기획을 담당하면서, 저는 마케팅 원칙을 실무에
          적용하는 실질적인 경험을 쌓았습니다. 특히, 일하던 옷가게에서 광고
          기획에 직접 참여하여 매출 증대를 달성한 경험은 제가 마케팅의 효과에
          미치는 영향을 직접 증명해 주었습니다. 대한항공이 지속적으로 고객
          경험을 향상시키고 글로벌 시장에서 선도적인 위치를 차지하기 위해
          노력하는 점에 감명을 받습니다. 이러한 회사理念은 저의 개인적인 목표와
          완벽히 일치하며, 저는 대한항공의 성공에 기여할 수 있는 기회에 열의를
          갖고 있습니다. 특히, 저는 대한항공의 디지털 마케팅 전략에 관심이
          있습니다. 저는 소셜 미디어, 온라인 광고, 모바일 마케팅을 활용하여 더욱
          광범위하고 참여적인 고객 기반을 구축할 수 있는 혁신적인 캠페인을
          개발하는 데 관심이 있습니다. 또한, 모든 고객에게 맞춤화된 경험을
          제공하기 위해 데이터 분석과 인공 지능을 활용하는 데 노력할 것입니다.
          저는 대한항공의 팀에 합류하여 제가 가진 기술과 열정으로 회사의 성공에
          기여할 수 있는 기회를 기대합니다. 제가 가진 마케팅 지식과 경험이
          대한항공의 글로벌 브랜드 가치를 향상시키는 데 활용될 수 있다고
          확신합니다. 나는 그렇게 생각을 않합니다. 그렇게
          됬습니다.dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
        </div>
      </div>
    </div>
  );
}
