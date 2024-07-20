"use client";

import React, { useState } from 'react';

export default function SelfIntroduction() {
  const [text, setText] = useState('');
  const [savedText, setSavedText] = useState('');

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleSave = () => {
    setSavedText(text);
    alert('글이 저장되었습니다.');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">자소서 페이지</h1>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="여기에 글을 작성하세요"
        className="w-full h-48 p-2 border border-gray-300 rounded mb-4"
      />
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        저장
      </button>
      {savedText && (
        <div className="mt-4 p-4 border-t border-gray-300">
          <h2 className="text-xl font-semibold mb-2">저장된 글</h2>
          <p>{savedText}</p>
        </div>
      )}
    </div>
  );
}
