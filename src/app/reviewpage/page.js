"use client";

import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Context } from "../appProvider";

const ReviewPage = () => {
  const searchParams = useSearchParams();
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [sentiments, setSentiments] = useState([]);
  const [showFeedback, setShowFeedback] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [grade, setGrade] = useState("");
  const [essayTitle, setEssayTitle] = useState("");
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const { state } = useContext(Context);

  useEffect(() => {
    const qnaParam = searchParams.get("qna");
    const title = searchParams.get("title");
    if (qnaParam) {
      const parsedQnA = JSON.parse(decodeURIComponent(qnaParam));
      setQuestionsAndAnswers(parsedQnA);
      fetchFeedbacks(parsedQnA);
    }
    if (title) {
      setEssayTitle(decodeURIComponent(title));
    } else {
      console.error("Title is not defined in query params");
    }
  }, [searchParams]);

  useEffect(() => {
    if (questionsAndAnswers.length > 0) {
      console.log("Questions and answers:", questionsAndAnswers);
    }
  }, [questionsAndAnswers]);

  useEffect(() => {
    if (essayTitle) {
      console.log("Essay Title:", essayTitle);
    }
  }, [essayTitle]);

  const fetchFeedbacks = async (parsedQnA) => {
    try {
      const feedbackPromises = parsedQnA.map(async (qa) => {
        console.log("Sending request for QA:", qa); // Log the QA pair being sent
        const response = await axios.post("/api/feedback", {
          question: qa.question,
          answer: qa.answer,
        });
        console.log("Received feedback response:", response.data); // Log the feedback response
        return {
          feedback: response.data.feedback,
          improvement: response.data.improvement,
        };
      });
      const feedbackResults = await Promise.all(feedbackPromises);
      setFeedbacks(feedbackResults);
      console.log("feedbackResult : ", feedbackResults);
      fetchSentiments(
        feedbackResults.map((result) => result.feedback),
        parsedQnA,
        feedbackResults
      );
    } catch (error) {
      console.error("Error fetching feedback:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      setFeedbacks(
        parsedQnA.map(() => ({
          feedback: "Error fetching feedback",
          improvement: "",
        }))
      );
    }
  };

  const fetchSentiments = async (feedbacks, parsedQnA, feedbackResults) => {
    try {
      const sentimentPromises = feedbacks.map(async (feedback) => {
        const response = await axios.post("/api/sentiment", {
          content: feedback,
        });
        console.log("Received sentiment response:", response.data); // Log the sentiment response
        const maxDeg = calculateMaxDeg(response.data.sentiment);
        return { ...response.data.sentiment, max_deg: maxDeg };
      });
      const sentimentResults = await Promise.all(sentimentPromises);
      setSentiments(sentimentResults);
      calculateTotalScore(sentimentResults);
      saveFeedbackData(state.email, essayTitle, parsedQnA, feedbackResults);
    } catch (error) {
      console.error("Error fetching sentiments:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      setSentiments(feedbacks.map(() => "Error fetching sentiment"));
    }
  };

  const saveFeedbackData = async (email, title, QnA, feedbackResult) => {
    try {
      const response = await axios.post("/api/saveFeedback", {
        email,
        title,
        QnA,
        feedbackResult,
      });
      console.log("Feedback data saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving feedback data:", error);
    }
  };

  const calculateMaxDeg = (sentiment) => {
    const { positive, neutral, negative } = sentiment;
    if (positive >= neutral && positive >= negative) {
      return "P";
    } else if (neutral >= positive && neutral >= negative) {
      return "M";
    } else {
      return "N";
    }
  };

  const calculateScore = (sentiment) => {
    const { positive, neutral, negative, max_deg } = sentiment;
    if (max_deg === "P") return 1;
    if (max_deg === "M") {
      if (positive > negative) return 0.5;
      if (negative > positive) return -0.5;
      return 0;
    }
    if (max_deg === "N") return -1;
    return 0; // 기본값
  };

  const calculateTotalScore = (sentiments) => {
    const maxDegs = sentiments.map((sentiment) => sentiment.max_deg);
    const score = sentiments.reduce(
      (acc, sentiment) => acc + calculateScore(sentiment),
      0
    );
    const f_score = score / questionsAndAnswers.length;
    setTotalScore(score);
    setGrade(determineGrade(f_score));
    setLoading(false); // 로딩 상태 설정
  };

  const determineGrade = (f_score) => {
    if (f_score > 0.8) return "S";
    if (f_score > 0.5) return "A";
    if (f_score > 0) return "B";
    if (f_score > -0.6) return "C";
    return "F"; // 기본값
  };

  const toggleFeedback = (index) => {
    setShowFeedback((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  
  return (
    <div className="flex flex-col items-center p-5 mt-14">
      <div className="w-full max-w-3xl mb-4 p-4 border rounded-lg shadow-md">
        <div className="text-2xl font-bold text-center">모의 면접 평가</div>
        <div className="text-3xl text-center font-bold pt-3">
          등급 :{" "}
          {loading ? (
            <span className="text-customGray text-2xl dot-animate">평가 중</span>
          ) : grade === "S" ? (
            <b className="text-yellow-400">S</b>
          ) : grade === "A" ? (
            <b className="text-red-500">A</b>
          ) : grade === "F" ? (
            <b className="text-blue-900">F</b>
          ) : (
            <b className="text-gray-500">{grade}</b>
          )}
        </div>
      </div>
      <div className="w-full max-w-3xl px-10 py-5 border rounded-lg shadow-md">
        {questionsAndAnswers.length > 0 ? (
          questionsAndAnswers.map((qa, index) => (
            <div key={index} className="mb-4">
              <p>
                <strong>Q{index + 1} :</strong>{" "}
                {qa.question.replace(/\*\*/g, "")}
              </p>
              <p>
                <strong>A :</strong> {qa.answer}
              </p>
              {feedbacks.length > index && (
                <div>
                  <button
                    className="mt-2 text-blue-500"
                    onClick={() => toggleFeedback(index)}
                  >
                    {showFeedback[index] ? "Hide Feedback" : "Show Feedback"}
                  </button>
                  {showFeedback[index] && (
                    <div>
                      <p>
                        <strong>Feedback:</strong> {feedbacks[index].feedback}
                      </p>
                      <p>
                        <strong>Improvement:</strong>{" "}
                        {feedbacks[index].improvement}
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
      <style jsx>{`
        @keyframes dot-animate {
          0% {
            content: '';
          }
          20% {
            content: '.';
          }
          40% {
            content: '..';
          }
          60% {
            content: '...';
          }
          100% {
            content: '';
          }
        }

        .dot-animate:after {
          content: '';
          animation: dot-animate 2.5s infinite steps(1, end);
        }
      `}</style>
    </div>
  );
};

export default ReviewPage;
