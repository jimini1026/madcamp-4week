"use client";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import { useContext, useState } from "react";
import { Context } from "../appProvider";
import { useRouter } from "next/navigation";

export default function Login() {
  const { setState } = useContext(Context);

  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/getUsersData?email=${encodeURIComponent(loginInfo.email)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      if (loginInfo.email === data.email) {
        if (loginInfo.password === data.password) {
          alert("로그인 성공");
          setState({ username: data.username, email: data.email });
          sessionStorage.setItem("username", data.username);
          sessionStorage.setItem("email", data.email);
          router.push("/");
        } else {
          alert("비밀번호가 일치하지 않습니다.");
        }
      }
    } catch (error) {
      alert("유효하지 않은 이메일입니다.");
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="mb-20">
        <form className="w-96" onSubmit={handleLoginSubmit}>
          <h1 className="m-3 mb-10 text-center text-5xl font-bold text-customBlue">
            Daesi
          </h1>
          <div className="mb-5">
            <label className="block text-sm" htmlFor="email">
              <p>이메일</p>
              <input
                className="h-15 mt-2 block w-full rounded-3xl border border-borderColor p-3 text-sm"
                type="email"
                id="email"
                placeholder="Daesi@gmail.com"
                onChange={(e) => {
                  setLoginInfo({ ...loginInfo, email: e.target.value });
                }}
              />
            </label>
          </div>
          <div className="mb-7">
            <label className="block text-sm" htmlFor="password">
              <p>비밀번호</p>
              <div className="relative">
                <input
                  className="h-15 mt-2 block w-full rounded-3xl border border-borderColor p-3 text-sm"
                  type={visible ? "text" : "password"}
                  id="password"
                  placeholder="Your password"
                  onChange={(e) => {
                    setLoginInfo({ ...loginInfo, password: e.target.value });
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-placeHolder"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? (
                    <AiOutlineEye size="22" />
                  ) : (
                    <AiOutlineEyeInvisible size="22" />
                  )}
                </button>
              </div>
            </label>
          </div>
          <div className="mt-1">
            <button
              type="submit"
              className="h-15 mt-2 w-full rounded-3xl p-3 text-white bg-customBlue"
            >
              로그인
            </button>
          </div>
          <div className="mt-4 text-center text-sm">
            계정이 없으신가요?{" "}
            <Link href="/register" className="text-customBlue">
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
