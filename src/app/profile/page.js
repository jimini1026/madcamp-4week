"use client";

import React, { useContext, useEffect, useState } from "react";
import { Context } from "../appProvider";
import { IoPersonCircleSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { state, setState } = useContext(Context);
  const [profileImg, setProfileImg] = useState("");
  const [interest, setInterest] = useState("");
  const router = useRouter();

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
          <div className="font-semibold text-lg pb-5">피드백 정보</div>
          <div className="flex flex-wrap px-3">
            <div className="w-full md:w-1/3 p-2 bg-red-100 flex justify-center items-center">
              <div>피드백 리스트1</div>
            </div>
            <div className="w-full md:w-1/3 p-2 bg-red-100 flex justify-center items-center">
              <div>피드백 리스트1</div>
            </div>
            <div className="w-full md:w-1/3 p-2 bg-red-100 flex justify-center items-center">
              <div>피드백 리스트1</div>
            </div>
            <div className="w-full md:w-1/3 p-2 bg-red-100 flex justify-center items-center">
              <div>피드백 리스트1</div>
            </div>
            <div className="w-full md:w-1/3 p-2 bg-red-100 flex justify-center items-center">
              <div>피드백 리스트1</div>
            </div>
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
    </div>
  );
}
