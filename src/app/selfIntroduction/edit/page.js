"use client";

import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../appProvider";
import { useRouter } from "next/navigation";
import HighlightWithinTextarea from "react-highlight-within-textarea";

export default function Edit() {
  const { state } = useContext(Context);
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const [selfIntroductionData, setSelfIntroductionData] = useState("");
  const [charCountWithSpaces, setCharCountWithSpaces] = useState(0);
  const [charCountWithoutSpaces, setCharCountWithoutSpaces] = useState(0);
  const [spellingCheckData, setSpellingCheckData] = useState([]);
  const [highlight, setHightlight] = useState([]);
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

  useEffect(() => {
    handleSpellCheck();
  }, [selfIntroductionData]);

  const handleTextChange = (text) => {
    setSelfIntroductionData(text);
    setCharCountWithSpaces(text.length);
    setCharCountWithoutSpaces(text.replace(/\s/g, "").length);
  };

  const handleSpellCheck = async () => {
    try {
      const response = await fetch("/api/spellCheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: selfIntroductionData }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.results);
      setSpellingCheckData(data.results || []);
      setHightlight(
        data.results.map((result) => ({
          highlight: result.token,
          className: "red",
        }))
      );
    } catch (error) {
      console.error("Spell check failed:", error);
    }
  };

  const handleEdit = () => {
    let updatedText = selfIntroductionData;
    spellingCheckData.forEach(({ token, suggestions }) => {
      const suggestion = suggestions[0]; // 첫 번째 제안을 사용
      const regex = new RegExp(token, "g");
      updatedText = updatedText.replace(regex, suggestion);
    });
    setSelfIntroductionData(updatedText);
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

  const SpellCheckTag = ({ data }) => {
    return (
      <div className="border-b">
        <div className="py-3 flex">
          <div className="flex items-center gap-5 ml-10">
            <div className="text-red-600 font-semibold">{data.token}</div>
            <div>{"->"}</div>
            <div
              style={{ backgroundColor: "#00B6FF" }}
              className="rounded-lg font-semibold px-2 py-1"
            >
              {data.suggestions[0]}
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-dashed">
          <div>
            <div className="font-semibold">context</div>
            <div>: {data.context}</div>
          </div>
          <div>
            <div className="font-semibold">info</div>
            <div>: {data.info}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-56 my-10">
      <div className="font-bold text-xl pb-5">Editing '{title}'</div>
      <div className="flex">
        <div className="flex-[2]">
          <div
            style={{ backgroundColor: "#F9FAFA" }}
            className="border py-3 rounded-tl-lg"
          >
            <div className="font-semibold px-5">내용 입력</div>
          </div>
          <div className="border rounded-bl-lg h-[30rem] flex flex-col">
            <div className="overflow-y-auto py-5 px-5 h-[27rem]">
              <HighlightWithinTextarea
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  outline: "none",
                  padding: "1.25rem 0.75rem",
                }}
                spellCheck="false"
                onChange={handleTextChange}
                value={selfIntroductionData}
                highlight={highlight}
              />
            </div>
            <div className="py-3 flex justify-center items-center gap-5 border-t relative">
              <div className="absolute left-4 font-semibold">
                <div className="text-sm">
                  글자 수 {"(공백 제외)"} : {charCountWithoutSpaces}
                </div>
                <div className="text-sm ml-[3.1rem]">
                  {"(공백 포함)"} : {charCountWithSpaces}
                </div>
              </div>
              <button
                className="bg-customBlue text-white text-lg rounded-lg px-5 py-1 font-bold"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-customGray text-lg rounded-lg px-3 py-1 font-bold"
                onClick={() => setSelfIntroductionData("")}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        <div className="flex-[1.3]">
          <div className="bg-customGray border py-3 rounded-tr-lg flex justify-between">
            <div className="font-semibold text-white px-5">맞춤법 검사</div>
            <div className="ml-auto pr-5 text-sm font-semibold">
              error -{" "}
              <span className="text-red-600">{`[${spellingCheckData.length}]`}</span>
            </div>
          </div>
          <div className="border rounded-br-lg h-[30rem]">
            <div className="overflow-y-auto h-[26.1rem]">
              {spellingCheckData.length !== 0
                ? spellingCheckData.map((data, index) => (
                    <SpellCheckTag key={index} data={data} />
                  ))
                : null}
            </div>
            <div className="border-t flex items-center justify-center pt-3">
              <button
                className="bg-customBlue text-white text-lg rounded-lg px-5 py-1 font-bold"
                onClick={handleEdit}
              >
                Edit All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
