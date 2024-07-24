"use client";

import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../appProvider';
import { useRouter } from 'next/navigation';

export default function VirtualInterview() {
  const { state } = useContext(Context);
  const [essays, setEssays] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedEssayIndex, setSelectedEssayIndex] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch essays from your API or static data
    const fetchEssays = async () => {
      try {
        const response = await fetch(`/api/getUserSelfIntroduction?email=${encodeURIComponent(state.email)}`);
        const data = await response.json();
        setEssays(data);
      } catch (error) {
        console.error('Failed to fetch essays:', error);
      }
    };

    if (state.email) {
      fetchEssays();
    }
  }, [state.email]);

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleCheckboxChange = (index) => {
    setSelectedEssayIndex(selectedEssayIndex === index ? null : index);
  };

  const handleNavigate = async () => {
    if (selectedEssayIndex !== null) {
      const selectedEssay = essays[selectedEssayIndex];
      const response = await fetch('/api/generateQuestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: selectedEssay.content, numQuestions: 3 }), // 요청 시 문제의 수를 지정
      });
      const questionsData = await response.json();

      // Ensure questionsData is an array before saving
      if (Array.isArray(questionsData.questions)) {
        const saveResponse = await fetch('/api/saveQuestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ questions: questionsData.questions }),
        });

        if (saveResponse.ok) {
          router.push('/streamingavatar');
        } else {
          console.error('Failed to save questions');
        }
      } else {
        console.error('Invalid questions format:', questionsData);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">면접 질문을 추출할 글을 고르세요.</h1>
      <ul className="space-y-4">
        {essays.map((essay, index) => (
          <li key={index} className="border rounded-lg p-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedEssayIndex === index}
                onChange={() => handleCheckboxChange(index)}
                className="mr-4 w-6 h-6"
              />
              <div
                className="cursor-pointer font-bold text-lg"
                onClick={() => handleExpand(index)}
              >
                {essay.title}
              </div>
            </div>
            {expandedIndex === index && (
              <div className="mt-2">
                <p>{essay.content}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
      {selectedEssayIndex !== null && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleNavigate}
            className="px-4 py-2 font-bold text-white bg-customBlue rounded"
          >
            면접 보러 가기
          </button>
        </div>
      )}
    </div>
  );
}
