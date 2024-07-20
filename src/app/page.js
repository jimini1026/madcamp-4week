"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute top-[-2rem] w-full -z-10">
        <Image
          src="/images/mainBlack.png"
          layout="responsive"
          width={1920}
          height={1080}
          alt="Main Black Image"
        />
      </div>
      <div className="absolute right-80 top-28">
        <div className="text-white text-5xl font-bold">
          Welcome to <span className="text-customBlue">Daesi</span>
          <hr className="color-white mt-3" />
        </div>
        <div className="text-white text-3xl font-bold pt-9 pl-44">
          <Link href="/login">Join the site {">>"}</Link>
        </div>
      </div>
      <div className="absolute right-[20rem] top-[24rem]">
        <div className="text-customBlue text-2xl font-bold text-right">
          자소서, 면접 모두 Daesi에서
        </div>
        <div className="text-black font-bold pt-2 pl-14 text-right">
          <div>AI의 맞춤형 피드백과 충분한 연습 기회를 통해</div>
          <div>합격을 향한 준비를 완성하세요.</div>
          <div>쉽고 효과적인 AI 도움으로 성공적인 미래를 만들어보세요.</div>
        </div>
      </div>
      <div className="pl-36 pt-20">
        <Image
          src="/images/mainImg.png"
          alt="메인이미지"
          width={600}
          height={600}
        />
      </div>
      <div className="absolute bottom-0 w-full">
        <Image src="/images/mainGray.png" width={1920} height={1080} alt="Main Gray Image" />
      </div>
    </div>
  );
}
