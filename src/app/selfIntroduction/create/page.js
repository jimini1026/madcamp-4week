"use client";

import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function Create() {
  const gemini = new GoogleGenerativeAI(
    "api"
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const [shrinkBlue, setShrinkBlue] = useState(false);

  const registerAnswer = (data) => {
    const { title, university, major, club, reading } = data;
    console.log(title, university, major, club, reading);
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
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = await response.text();

      if (text) {
        console.log(text);
        return 200;
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    chat(
      `
      부산대학교 컴퓨터공학과에 지원하고 싶어서 자소서를 쓰려고 해. 
      이 대학교에서 원하는 인재상을 찾아서 자소서를 작성해줘.
      나는 고등학교에서 동아리활동으로 AI를 이용하여 자율주행자동차를 만드는 활동을 하였고, 
      독서활동으로는 AI 혁명의 미래라는 책을 읽었어. 
      이를 바탕으로 자소서를 1000자 이상 작성해줘
      대답은 엔터 없이 작성해주고 마크다운 표시도 다 빼줘
      `
    );
  }, []);

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
              After Creating...
            </div>
            <div className="font-semibold pr-16">
              <div>자소서가 생성되었습니다</div>
              <div>저장 이후 수정해주세요</div>
            </div>
            <div></div>
            <Image
              src="/images/createDone.png"
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
            <div></div>
            <Image
              src="/images/create.png"
              width={350}
              height={350}
              alt="create_image"
            />
          </>
        )}
        {shrinkBlue && (
          <div className="flex flex-col items-center justify-center">
            <div className="font-bold text-xl">생성된 자소서</div>
            <div className="border rounded-lg w-[40rem] h-[30rem] shadow-lg"></div>
          </div>
        )}
      </div>
    </div>
  );
}
