"use client";

import { useContext, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import exampleEssays from "./exampleEssay";
import Link from "next/link";
import { Context } from "../../appProvider";
import { MdDeleteOutline } from "react-icons/md";
import { TbReload } from "react-icons/tb";
import { MdOutlineSaveAlt } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function Create() {
  const { state, setState } = useContext(Context);
  const gemini = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  const [generatedEssay, setGeneratedEssay] = useState("");
  const [title, setTitle] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const [shrinkBlue, setShrinkBlue] = useState(false);

  const registerAnswer = async (data) => {
    const { title, university, major, club, reading } = data;
    setTitle(title);
    console.log(title, university, major, club, reading);

    const prompt = `
    당신은 입시를 위하여 대학교에 제출할 자소서를 작성하는 학생입니다.
    ${university} ${major}에 지원하고 싶어서 자소서를 쓰려고 합니다.
    나는 고등학교에서 동아리활동으로 ${club},
    독서활동으로는 ${reading}.

    1. 고등학교 재학 기간 중 자신의 진로와 관련하여 어떤 노력을 해왔는지 본인에게 의미 있는 학습 경험과 교내
    활동을 중심으로 기술해 주시기 바랍니다.
    2. 특수기호 금지
    3. 첫문장에는 대학교 지원 동기로 시작, 이후에 동아리 활동과 자신의 느낀점, 독서 활동 순으로 작성
    4. 예의 바르고 차분한 느낌으로 한글로 작성할 것
    5. 공백 포함 1000자 이상 1500자 이하로 작성할 것
    6. 접속사를 이용하여 자연스럽게 흐름이 이어지도록 할 것
    7. 대학교 언급 금지
    8. 문단은 엔터키로 구분 해줘

    내용을 직접 겪은 것 처럼 과정을 자세히 작성해라
      `;
    setGeneratedEssay("");

    const answer = await chat(prompt);
    setGeneratedEssay(answer);
  };

  const handleSubmitSelfIntroduction = async () => {
    console.log(generatedEssay);
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.email,
          title,
          content: generatedEssay,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
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

  const enterKey = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      handleSubmit(registerAnswer)();
      setShrinkBlue(true); // 엔터 키를 누르면 파란 바탕이 줄어들도록 설정
    }
  };

  const chat = async (prompt) => {
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt, {
        temperature: 0.2,
        presence_penalty: 0.5,
      });
      const response = result.response;
      const text = await response.text();

      if (text) {
        console.log(text);
        return text;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div
        className={`flex flex-col justify-center items-center transition-all duration-500 ${
          shrinkBlue ? "flex-[2]" : "flex-[3]"
        } bg-customBlue`}
      >
        {!shrinkBlue && (
          <div className="bg-white px-10 py-5 rounded-lg shadow-lg flex flex-col gap-5">
            <div className="pb-3">
              <div className="font-semibold text-xl pl-2 pb-2">자소서 제목</div>
              <input
                {...register("title", { required: true })}
                className="border-b-2 px-3 text-sm"
                placeholder="title"
              />
            </div>
            <div className="flex gap-7">
              <div className="w-60">
                <div className="font-semibold pb-2 pl-2">지원 희망 대학</div>
                <input
                  {...register("university", { required: true })}
                  placeholder="university"
                  className="border-b-2 px-3 text-sm"
                />
              </div>
              <div className="w-60">
                <div className="font-semibold pb-2 pl-2">지원 희망 학과</div>
                <input
                  {...register("major", { required: true })}
                  placeholder="major"
                  className="border-b-2 px-3 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-7">
              <div className="w-60">
                <div className="font-semibold pb-2 pl-2">동아리 활동</div>
                <textarea
                  {...register("club", { required: true })}
                  placeholder="club"
                  className="border rounded-lg px-3 text-sm h-16 w-56"
                />
              </div>
              <div className="w-60">
                <div className="font-semibold pb-2 pl-2">독서 활동</div>
                <textarea
                  onKeyUp={enterKey}
                  {...register("reading", { required: true })}
                  placeholder="reading"
                  className="border rounded-lg px-3 text-sm h-16 w-56"
                />
              </div>
            </div>
          </div>
        )}
        {shrinkBlue && (
          <>
            <div className="font-bold text-3xl mb-2 text-white">
              {generatedEssay ? (
                "After Creating..."
              ) : (
                <div className="pr-[5rem]">Creating...</div>
              )}
            </div>
            <div className="font-semibold pr-16">
              <div>
                {generatedEssay
                  ? "자소서가 생성되었습니다"
                  : "자소서를 생성 중입니다."}
              </div>
              <div>
                {generatedEssay
                  ? "저장 이후 수정해주세요"
                  : "잠시만 기다려주세요"}
              </div>
            </div>
            <Image
              src={
                generatedEssay
                  ? "/images/createDone.png"
                  : "/images/creating.png"
              }
              width={350}
              height={350}
              alt="create_image"
            />
          </>
        )}
      </div>
      <div
        className={`flex flex-col justify-center items-center transition-all duration-500 ${
          shrinkBlue ? "flex-[4]" : "flex-[2]"
        }`}
      >
        {!shrinkBlue && (
          <>
            <div className="font-bold text-3xl mb-2">Before Creating...</div>
            <div className="font-semibold pr-8 text-customGray">
              <div>AI를 통해 자소서를 생성하기 전</div>
              <div>질문의 답을 작성해주세요</div>
            </div>
            <Image
              src="/images/create.png"
              width={350}
              height={350}
              alt="create_image"
            />
          </>
        )}
        {shrinkBlue && (
          <div className="flex flex-col items-center justify-center relative">
            <div className="flex mb-2">
              <div className="font-bold mt-5 text-xl pr-[19rem] pl-[5rem]">
                생성된 자소서
              </div>
              <div className="flex gap-2 border p-3 rounded-lg mr-16">
                <button
                  className="bg-customBlue font-semibold text-white px-5 rounded-lg"
                  onClick={handleSubmit(registerAnswer)}
                >
                  <TbReload />
                </button>
                <button
                  className="bg-customBlue font-semibold text-white px-5 rounded-lg"
                  onClick={handleSubmitSelfIntroduction}
                >
                  <MdOutlineSaveAlt />
                </button>
                <button className="bg-customGray font-semibold rounded-lg px-3">
                  <Link href={"/selfIntroduction"}>
                    <MdDeleteOutline />
                  </Link>
                </button>
              </div>
            </div>
            <div className="border rounded-lg w-[40rem] h-[30rem] shadow-lg px-10 py-5 flex jusitfy-center items-center overflow-y-auto">
              <div className="w-full h-full flex justify-center items-center whitespace-pre-wrap">
                {generatedEssay ? (
                  <div className="max-h-full w-full">{generatedEssay}</div>
                ) : (
                  <div className="max-h-full flex items-center justify-center">
                    <Image
                      src="/assets/spinner.gif"
                      alt="loading"
                      width={200}
                      height={200}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
