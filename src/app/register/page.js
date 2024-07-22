"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function Page() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const registerSubmit = async (data) => {
    const { username, email, password, confirmPassword } = data;
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    } else {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          alert(`회원가입 실패: ${errorData.message}`);
          return;
        }
        alert("회원가입 성공!");
      } catch (error) {
        console.error("회원가입 중 오류 발생:", error);
        alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="h-full flex justify-center items-center mt-10">
      <div className="flex mb-14">
        <div className="bg-customBlue backdrop-blur-lg bg-opacity-80 rounded-l-lg shadow-2xl py-5 px-10">
          <div className="text-white text-[2rem] font-bold text-center mb-[-2rem]">
            Welcome to Daesi
            <hr className="mx-8 mt-3" />
          </div>
          <Image
            alt="register image"
            src="/images/register.png"
            width={470}
            height={470}
            className="pt-7"
          />
        </div>
        <div className="bg-white rounded-r-lg shadow-2xl px-16 pb-10 pt-5 flex flex-col items-center w-auto">
          <div className="text-black font-bold text-[2rem] pb-5">Sign Up</div>
          <form onSubmit={handleSubmit(registerSubmit)}>
            <div className="flex flex-col gap-3 w-[17rem]">
              <div>
                <div className="font-semibold">username</div>
                <input
                  {...register("username", { required: true })}
                  placeholder="Daesi Lim"
                  className="h-10 mt-2 block w-full rounded-3xl border p-3 text-sm"
                />
              </div>
              <div>
                <div className="font-semibold">email</div>
                <input
                  {...register("email", { required: true })}
                  placeholder="Daesi@gmail.com"
                  className="h-10 mt-2 block w-full rounded-3xl border p-3 text-sm"
                />
              </div>
              <div>
                <div className="font-semibold">password</div>
                <input
                  {...register("password", { required: true })}
                  className="h-10 mt-2 block w-full rounded-3xl border p-3 text-sm"
                  type="password"
                  id="password"
                  placeholder="Your password"
                />
              </div>
              <div>
                <div className="font-semibold">confirm password</div>
                <input
                  {...register("confirmPassword", { required: true })}
                  className="h-10 mt-2 block w-full rounded-3xl border p-3 text-sm"
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
            <div className="pt-5">
              <button className="h-10 mt-5 w-full rounded-3xl text-white bg-customBlue">
                Sign Up
              </button>
            </div>
            <div className="flex pt-3 gap-3 justify-center">
              <div className="text-[0.85rem] font-normal text-center">
                이미 계정이 있으신가요?
              </div>
              <div className="text-[0.85rem] font-semibold text-customBlue text-center">
                <Link href={"/login"}>로그인 하기</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
