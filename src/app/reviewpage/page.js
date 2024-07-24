"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

const ReviewPage = () => {
  const searchParams = useSearchParams();
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [sentiments, setSentiments] = useState([]);
  const [showFeedback, setShowFeedback] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [grade, setGrade] = useState('');

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
        return { feedback: response.data.feedback, improvement: response.data.improvement };
      });
      const feedbackResults = await Promise.all(feedbackPromises);
      setFeedbacks(feedbackResults);
      fetchSentiments(feedbackResults.map(result => result.feedback));
    } catch (error) {
      console.error('Error fetching feedback:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      setFeedbacks(parsedQnA.map(() => ({ feedback: 'Error fetching feedback', improvement: '' })));
    }
  };

  const fetchSentiments = async (feedbacks) => {
    try {
      const sentimentPromises = feedbacks.map(async (feedback) => {
        const response = await axios.post('/api/sentiment', { content: feedback });
        console.log('Received sentiment response:', response.data); // Log the sentiment response
        const maxDeg = calculateMaxDeg(response.data.sentiment);
        return { ...response.data.sentiment, max_deg: maxDeg };
      });
      const sentimentResults = await Promise.all(sentimentPromises);
      setSentiments(sentimentResults);
      calculateTotalScore(sentimentResults);
    } catch (error) {
      console.error('Error fetching sentiments:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      setSentiments(feedbacks.map(() => 'Error fetching sentiment'));
    }
  };

  const calculateMaxDeg = (sentiment) => {
    const { positive, neutral, negative } = sentiment;
    if (positive >= neutral && positive >= negative) {
      return 'P';
    } else if (neutral >= positive && neutral >= negative) {
      return 'M';
    } else {
      return 'N';
    }
  };

  const calculateScore = (maxDeg) => {
    if (maxDeg === 'P') return 1;
    if (maxDeg === 'M') return 0;
    if (maxDeg === 'N') return -1;
    return 0; // 기본값
  };

  const calculateTotalScore = (sentiments) => {
    const maxDegs = sentiments.map(sentiment => sentiment.max_deg);
    const score = maxDegs.reduce((acc, maxDeg) => acc + calculateScore(maxDeg), 0);
    setTotalScore(score);
    setGrade(determineGrade(maxDegs));
  };

  const determineGrade = (maxDegs) => {
    const frequency = maxDegs.reduce((acc, maxDeg) => {
      acc[maxDeg] = (acc[maxDeg] || 0) + 1;
      return acc;
    }, {});

    const maxFreq = Math.max(...Object.values(frequency));
    const mostFrequentDegs = Object.keys(frequency).filter(deg => frequency[deg] === maxFreq);

    if (mostFrequentDegs.length > 1) {
      return 'B'; // 최빈값이 동일한 경우 B 등급
    }

    const mostFrequentDeg = mostFrequentDegs[0];

    if (mostFrequentDeg === 'P' && frequency['P'] === maxDegs.length) return 'S';
    if (mostFrequentDeg === 'N' && frequency['N'] === maxDegs.length) return 'F';

    if (mostFrequentDeg === 'P') return 'A';
    if (mostFrequentDeg === 'M') return 'B';
    if (mostFrequentDeg === 'N') return 'C';
    return ''; // 기본값
  };

  const toggleFeedback = (index) => {
    setShowFeedback((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="flex flex-col items-center p-5">
      <div className="w-full max-w-3xl mb-4 p-4 border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">면접 평가</h1>
        <p className="text-5xl text-center font-bold">{grade}</p>
      </div>
      <div className="w-full max-w-3xl p-4 border rounded-lg shadow-md">
        {questionsAndAnswers.length > 0 ? (
          questionsAndAnswers.map((qa, index) => (
            <div key={index} className="mb-4">
              <p>
                <strong>Question {index + 1}:</strong> {qa.question}
              </p>
              <p>
                <strong>Answer:</strong> {qa.answer}
              </p>
              {feedbacks.length > index && (
                <div>
                  <button 
                    className="mt-2 text-blue-500" 
                    onClick={() => toggleFeedback(index)}
                  >
                    {showFeedback[index] ? 'Hide Feedback' : 'Show Feedback'}
                  </button>
                  {showFeedback[index] && (
                    <div>
                      <p>
                        <strong>Feedback:</strong> {feedbacks[index].feedback}
                      </p>
                      <p>
                        <strong>Improvement:</strong> {feedbacks[index].improvement}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {feedbacks.length <= index && <p>Loading feedback...</p>}
            </div>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
