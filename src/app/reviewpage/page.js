// src/app/reviewpage/page.js
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const ReviewPage = () => {
  const searchParams = useSearchParams();
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([]);

  useEffect(() => {
    const qnaParam = searchParams.get('qna');
    if (qnaParam) {
      const parsedQnA = JSON.parse(decodeURIComponent(qnaParam));
      setQuestionsAndAnswers(parsedQnA);
    }
  }, [searchParams]);

  return (
    <div style={{ padding: '20px' }}>
      <h1 className="text-2xl font-bold mb-4">Interview Summary</h1>
      {questionsAndAnswers.length > 0 ? (
        questionsAndAnswers.map((qa, index) => (
          <div key={index} className="mb-4">
            <p>
              <strong>Question {index + 1}:</strong> {qa.question}
            </p>
            <p>
              <strong>Answer:</strong> {qa.answer}
            </p>
          </div>
        ))
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default ReviewPage;
