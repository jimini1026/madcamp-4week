"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

const ReviewPage = () => {
  const searchParams = useSearchParams();
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const qnaParam = searchParams.get('qna');
    if (qnaParam) {
      const parsedQnA = JSON.parse(decodeURIComponent(qnaParam));
      setQuestionsAndAnswers(parsedQnA);
      fetchFeedbacks(parsedQnA);
    }
  }, [searchParams]);

  const fetchFeedbacks = async (parsedQnA) => {
    try {
      const feedbackPromises = parsedQnA.map(async (qa) => {
        console.log('Sending request for QA:', qa); // Log the QA pair being sent
        const response = await axios.post('/api/feedback', { question: qa.question, answer: qa.answer });
        console.log('Received feedback response:', response.data); // Log the feedback response
        return response.data.feedback;
      });
      const feedbackResults = await Promise.all(feedbackPromises);
      setFeedbacks(feedbackResults);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      setFeedbacks(parsedQnA.map(() => 'Error fetching feedback'));
    }
  };

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
            {feedbacks.length > index ? (
              <p>
                <strong>Feedback:</strong> {feedbacks[index]}
              </p>
            ) : (
              <p>Loading feedback...</p>
            )}
          </div>
        ))
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default ReviewPage;
