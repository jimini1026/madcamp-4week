"use client";

import { useContext, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Context } from "../../appProvider";
import { MdDeleteOutline } from "react-icons/md";
import { TbReload } from "react-icons/tb";
import { MdOutlineSaveAlt } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function Create() {
  const { state } = useContext(Context);
  const gemini = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  const [generatedEssay, setGeneratedEssay] = useState("");
  const [title, setTitle] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [shrinkBlue, setShrinkBlue] = useState(false);

  const registerAnswer = async (data) => {
    const { title, university, major, club, reading } = data;
    setTitle(title);
    console.log(title, university, major, club, reading);

    const prompt = `
    당신은 회사에 입사하기 위하여 이력서를 쓰는 취업준비생입니다.
    ${university} ${major}에 지원하고 싶어서 이력서를 쓰려고 합니다.
    지원하는 곳과 관련된 경험으로는 ${club},
    지원하기 위한 노력으로는 ${reading}.

    다음 질문에 대해 한글로 예의 바르고 차분한 느낌으로 답변해 주세요. 특수 기호(예: !, @, #, $, %, ^, &, *, ** 등)를 사용하지 않고 공백 포함 600자 이상 1000자 이하로 작성해 주세요. 접속사를 이용하여 자연스럽게 흐름이 이어지도록 하고, 답변할 때 한 번의 엔터로만 문단을 구분하여 한 단락으로 작성해 주세요.

    지원 동기는 경험과 관련지어 작성해 주세요.
    수많은 직무 중에서 왜 이 직무를 선택했는지 구체적으로 생각해야합니다.
    입사 이후에 어떤 노력을 할 것인지 작성해 주세요.
    회사가 제공하는 직무소개서(job description)을 보면서 내가 원하는 이 직무와 회사가 제공하는 일자리가 어떻게 적합한지 적어야합니다.
    먼저 제가 지원하는 직무에 대해 그 회사가 잘하는 것을 칭찬해 주세요.
    회사에 대해 감명받은 것을 작성해 주세요
    최근 지원하는 회사의 지원하는 부문의 이슈에 대해서도 구체적으로 언급하며 자신의 생각과 관심을 어필해 주세요.
    회사 지원 자소서의 예시 답변을 참고하여 자소서를 작성해 주세요.
    내용마다 자신의 작성 근거 또는 에피소드의 내용을 자세히 설명해 주세요
    답변은 순서에 상관없이 자연스럽게 내용을 연결해주세요
    질문에 대한 답변 내용은 필수적으로 들어가야 합니다.
    
    아래의 예시 형식으로 작성해 주세요:
    
    저는 어린 시절부터 대한항공의 인상적인 광고에 깊은 감명을 받았습니다. 그들의 창의적인 접근 방식과 글로벌 커뮤니케이션에 대한 지속적인 노력은 저에게 마케팅에 대한 열정을 불러일으켰습니다. 지원 부문의 직무 수행을 위해 저는 마케팅학을 전공하여 기본적인 원리를 굳건히 다졌습니다. 또한, 학교 광고 기획을 담당한 대학 동아리 활동을 통해 실무적인 경험을 쌓았습니다. 이러한 경험을 통해 목표 청중을 식별하고, 설득력 있는 메시지를 개발하며, 효과적인 캠페인을 실행하는 데 필요한 기술과 지식을 습득했습니다. 입사 이후 저는 대한항공의 브랜드 가치를 더욱 높이고, 고객 경험을 향상시키기 위해 노력할 것입니다. 특히 혁신적인 마케팅 전략을 통해 새로운 시장을 개척하고, 회사의 글로벌 영향력을 강화하는 데 기여하고자 합니다. 저의 열정과 성실함을 바탕으로 대한항공의 성공에 이바지할 수 있을 것으로 확신합니다.
    
    이제, 위의 형식을 참고하여 답변을 작성해 주세요:
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
      setShrinkBlue(true);
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
                <div className="font-semibold pb-2 pl-2">지원 희망 회사</div>
                <input
                  {...register("university", { required: true })}
                  placeholder="university"
                  className="border-b-2 px-3 text-sm"
                />
              </div>
              <div className="w-60">
                <div className="font-semibold pb-2 pl-2">지원 희망 부문</div>
                <input
                  {...register("major", { required: true })}
                  placeholder="major"
                  className="border-b-2 px-3 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-7">
              <div className="w-60">
                <div className="font-semibold pb-2 pl-2">부문 관련 경험</div>
                <textarea
                  {...register("club", { required: true })}
                  placeholder="club"
                  className="border rounded-lg px-3 text-sm h-16 w-56"
                />
              </div>
              <div className="w-60">
                <div className="font-semibold pb-2 pl-2">관련 노력</div>
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
            <div className="border rounded-lg w-[40rem] h-[30rem] shadow-lg px-10 py-10 flex jusitfy-center items-center">
              <div className="w-full h-full flex justify-center items-center whitespace-pre-wrap pr-5 overflow-y-auto">
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
