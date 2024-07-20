"use client";

import React from 'react';
import Image from 'next/image';

export default function Profile() {
  const name = '임지민';
  const email = 'jimin@gmail.com';
  const profileImageUrl = 'https://cloudfront-ap-northeast-1.images.arcpublishing.com/chosun/JNA4MQKSONGMFMSGUAYJBXYQUA.jpg'; // 이미지 경로를 실제 경로로 변경해야 합니다.

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 flex justify-center">마이페이지</h1>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2 flex justify-center">프로필 사진</label>
        <div className="flex justify-center">
          <Image 
            src={profileImageUrl} 
            alt="Profile Image"
            width={150}
            height={150}
            className="rounded-full"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">이름</label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md">{name}</div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">이메일</label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md">{email}</div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">비밀번호</label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md">********</div>
      </div>
    </div>
  );
}
