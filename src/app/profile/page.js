"use client";

import React, { useContext, useEffect, useState } from "react";
import { Context } from "../appProvider";
import { IoPersonCircleSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { state, setState } = useContext(Context);
  const [profileImg, setProfileImg] = useState("");
  const [interest, setInterest] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [modalOn, setModalOn] = useState(false);
  const [modalData, setModalData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    console.log(modalData);
  }, [modalOn]);

  const handleProfileImg = (e) => {
    const uploadImg = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(uploadImg);
    reader.onload = () => {
      const base64Img = reader.result;
      const imgKey = `profile_${state.email}`;
      localStorage.setItem(imgKey, base64Img);
      setState({ ...state, userProfile: base64Img });
      setProfileImg(base64Img);

      fetch("/api/saveProfileImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: state.email, imageKey: imgKey }),
      });
    };
  };

  const saveInterest = async () => {
    try {
      const response = await fetch("/api/saveInterest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: state.email, interest }),
      });

      if (!response.ok) {
        throw new Error("Failed to save interest");
      }

      alert("Interest saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save interest");
    }
  };

  useEffect(() => {
    console.log(feedback);
  }, [feedback]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/getUserEtc?email=${encodeURIComponent(state.email)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        if (data.interest) {
          setInterest(data.interest);
        }
        if (data.imageKey) {
          const storedImg = localStorage.getItem(data.imageKey);
          if (storedImg) {
            setProfileImg(storedImg);
          }
        }

        // Fetch feedback data
        const feedbackResponse = await fetch(
          `/api/getFeedback?email=${encodeURIComponent(state.email)}`
        );
        if (!feedbackResponse.ok) {
          throw new Error("Failed to fetch feedback data");
        }

        const feedbackData = await feedbackResponse.json();
        setFeedback(feedbackData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [state.email]);

  const deleteUserData = async () => {
    try {
      const response = await fetch(
        `/api/deleteAllUserData?email=${encodeURIComponent(state.email)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user data");
      }

      const imgKey = `profile_${state.email}`;
      localStorage.removeItem(imgKey);

      alert("User data deleted successfully!");
      setState({ username: "", email: "" });
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Failed to delete user data");
    }
  };

  const deleteFeedback = async (title) => {
    try {
      const response = await fetch("/api/deleteFeedback", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: state.email, title }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete feedback");
      }

      const updatedFeedback = feedback.filter((data) => data.title !== title);
      setFeedback(updatedFeedback);
    } catch (error) {
      console.error(error);
      alert("Failed to delete feedback");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="font-black text-4xl pt-20 pb-8">내 정보</div>
      <div className="w-[42rem] py-8">
        <div className="font-bold text-lg">로그인 정보</div>
        <div className="py-7">
          <div className="flex">
            <div>
              <div className="text-sm font-semibold px-2 py-3">이메일</div>
              <div className="bg-lightWhite border border-placeHolder text-placeHolder rounded-lg py-5 px-3 text-sm w-[25rem] mb-3">
                {state.email}
              </div>
            </div>
            <div className="mx-20 mt-[-1rem]">
              <div className="flex w-[11rem] flex-col items-center justify-center ">
                {profileImg ? (
                  <img
                    className="m-3 h-20 w-20 rounded-full"
                    src={profileImg}
                    alt="현재 이미지"
                  />
                ) : (
                  <IoPersonCircleSharp size={100} />
                )}
                <label htmlFor="profileImg">
                  <div className="flex h-7 w-[7rem] cursor-pointer items-center justify-center rounded-lg bg-customGray text-xs text-white font-bold">
                    사진 불러오기
                  </div>
                  <input
                    className="h-0 w-0"
                    id="profileImg"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg"
                    onChange={handleProfileImg}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-20">
            <div>
              <div className="text-sm font-semibold px-2 py-3">이름</div>
              <div className="bg-lightWhite border border-placeHolder text-placeHolder rounded-lg py-5 px-3 text-sm w-[18rem] mb-10">
                {state.username}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold px-2 py-3">관심분야</div>
              <input
                className="text-sm py-5 px-5 border rounded-lg mb-8 border-placeHolder w-[18rem]"
                placeholder="관심분야"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              />
            </div>
          </div>
        </div>
        <hr />
        <div className="py-5">
          <div className="font-semibold text-lg pb-5 px-2">피드백 관리</div>
          <div className="flex flex-wrap px-3 ">
            {feedback.map((data, index) => {
              return (
                <div
                  key={index}
                  className="w-full md:w-1/4 px-2 py-5 flex justify-center items-center"
                >
                  <div
                    className="rounded-lg w-[9rem] h-[10.5rem] p-2"
                    style={{
                      backgroundColor: "#F8FAFF",
                      border: "1px solid #5C8BF2",
                    }}
                  >
                    <div
                      className="font-semibold text-lg truncate px-1"
                      style={{ color: "#5C8BF2", maxWidth: "7rem" }}
                      title={data.title}
                    >
                      {data.title}
                    </div>
                    <hr
                      className="border-t-1 w-full my-2"
                      style={{ borderColor: "#5C8BF2" }}
                    />
                    <div className="text-sm px-1 flex flex-col gap-1">
                      {data.QnA.map((qna, index) => {
                        return (
                          <div
                            key={index}
                            style={{ maxWidth: "8rem" }}
                            className="truncate text-xs font-semibold"
                            title={qna.question}
                          >
                            <b className="text-sm">Q{index + 1} : </b>
                            {qna.question}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-1 pt-2">
                      <button
                        className="bg-customGray text-sm text-white font-semibold py-1 px-2 rounded-l-lg"
                        onClick={() => deleteFeedback(data.title)}
                      >
                        del
                      </button>
                      <button
                        className="bg-customBlue text-sm font-semibold text-white py-1 px-2 rounded-r-lg"
                        onClick={() => {
                          setModalOn(true);
                          setModalData(data);
                        }}
                      >
                        read more
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <hr />
        <div>
          <div className="mt-5 flex gap-3 float-left">
            <button
              className="bg-customGray rounded-lg py-2 px-4 text-sm font-bold text-black"
              onClick={() => {
                setState({ username: "", email: "" });
                router.push("/");
              }}
            >
              로그아웃
            </button>
            <button
              className="bg-customGray rounded-lg py-2 px-4 text-sm font-bold"
              onClick={deleteUserData}
            >
              회원탈퇴
            </button>
            <div className="pl-[23.5rem]">
              <button
                className="bg-customBlue text-white rounded-lg py-2 px-8 text-sm font-bold"
                onClick={saveInterest}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
      {modalOn ? (
        <div
          className="fixed inset-0 z-20 flex justify-center items-center bg-gray-800 bg-opacity-50"
          onClick={() => setModalOn(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg w-[40rem] h-[39rem] px-10 py-5"
          >
            <div className="font-bold text-2xl">모의 면접 피드백</div>
            <div>{modalData.title}</div>
            <div></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
