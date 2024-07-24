"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, CardFooter, Divider, Spinner } from "@nextui-org/react";
import { fetchAccessToken } from "../utils/api";
import { initializeAvatar, startAvatarSession, endAvatarSession, speakAvatar } from "../utils/AvatarControl";
import { startRecording, stopRecording } from "../utils/RecordingControl";
import { initialQuestionsAndAnswers } from "../data/InterviewQuestions";
import FaceDetection from "../components/FaceDetection"; // Adjust the import path if necessary

export default function StreamingAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState(null);
  const [data, setData] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [startClicked, setStartClicked] = useState(false);
  const mediaStream = useRef(null);
  const avatar = useRef(null);

  const defaultAvatarId = "josh_lite3_20230714";
  const defaultVoiceId = "077ab11b14f04ce0b49b5f6e5cc20979";

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioURL, setAudioURL] = useState("");
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState(initialQuestionsAndAnswers);
  const [displayedQuestions, setDisplayedQuestions] = useState([]);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const handleSpeak = async (textToSpeak) => {
    setIsLoadingRepeat(true);
    if (!initialized || !avatar.current) {
      console.log("Avatar API is not initialized");
      setIsLoadingRepeat(false);
      return;
    }
    await speakAvatar(avatar.current, textToSpeak, data?.sessionId, console.log);
    setIsLoadingRepeat(false);
  };

  useEffect(() => {
    async function init() {
      const newToken = await fetchAccessToken();
      avatar.current = await initializeAvatar(newToken);
      setInitialized(true);
      const res = await startAvatarSession(avatar.current, defaultAvatarId, defaultVoiceId, console.log);
      setData(res);
      setStream(avatar.current.mediaStream);
    }
    init();

    return () => {
      endAvatarSession(avatar.current, data?.sessionId, console.log);
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current.play();
        console.log("Playing");
      };
    }
  }, [stream]);

  useEffect(() => {
    window.addEventListener("beforeunload", () => endAvatarSession(avatar.current, data?.sessionId, console.log));
    return () => {
      window.removeEventListener("beforeunload", () => endAvatarSession(avatar.current, data?.sessionId, console.log));
    };
  }, [initialized]);

  const handleStartRecording = async () => {
    await startRecording(
      mediaRecorderRef,
      setAudioURL,
      setQuestionsAndAnswers,
      currentQuestionIndex,
      questionsAndAnswers,
      handleNextQuestion,
      setError
    );
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    stopRecording(mediaRecorderRef);
    setIsRecording(false);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questionsAndAnswers.length - 1) {
      const nextQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQuestionIndex);
      setDisplayedQuestions([questionsAndAnswers[nextQuestionIndex].question]);
      await handleSpeak(questionsAndAnswers[nextQuestionIndex].question);
    } else {
      setDisplayedQuestions([]);
      setInterviewCompleted(true);
      await handleSpeak("면접이 종료되었습니다. 수고하셨습니다.");
      
      setTimeout(async () => {
        await endAvatarSession(avatar.current, data?.sessionId, console.log);
        // Redirect to the review page
        const qna = JSON.stringify(questionsAndAnswers);
        window.location.href = `/reviewpage?qna=${encodeURIComponent(qna)}`;
      }, 5000); // 5-second delay
    }
  };

  const startInterview = async () => {
    setStartClicked(true);
    if (questionsAndAnswers.length > 0) {
      setDisplayedQuestions([questionsAndAnswers[0].question]);
      setCurrentQuestionIndex(0); // Reset to the first question
      await handleSpeak(questionsAndAnswers[0].question);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 overflow-hidden relative">
      {!startClicked && (
        <div className="absolute inset-0 z-10 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <Button onClick={startInterview} className="bg-green-500 text-white">
            Start Interview
          </Button>
        </div>
      )}
      <Card className={`overflow-hidden ${startClicked ? '' : 'blur-sm'}`}>
        <CardBody className="h-[500px] flex justify-center items-center">
          <div className="flex w-full justify-center gap-4">
            <div className="h-[400px] w-[550px] justify-center items-center flex rounded-lg overflow-hidden">
              {stream ? (
                <div className="relative h-full w-full flex justify-center items-center">
                  <video ref={mediaStream} autoPlay playsInline className="h-full w-auto object-cover">
                    <track kind="captions" />
                  </video>
                </div>
              ) : (
                <Spinner size="lg" color="default" />
              )}
            </div>
            <div className="h-[500px] w-[450px]">
              <FaceDetection width="450px" height="500px" />
            </div>
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col gap-3">
          {startClicked && (
            <>
              <div className="flex justify-center mb-4">
                <Button onClick={isRecording ? handleStopRecording : handleStartRecording} className={`px-4 py-2 font-bold text-white rounded ${isRecording ? "bg-red-500" : "bg-blue-500"}`}>
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
              </div>
              {audioURL && (
                <div className="mt-4">
                  <h2 className="text-xl font-bold mb-2">Recorded Audio:</h2>
                  <audio src={audioURL} controls />
                </div>
              )}
              {error && (
                <div className="mt-4 text-red-500">
                  <h2 className="text-xl font-bold mb-2">Error:</h2>
                  <p>{error}</p>
                </div>
              )}
            </>
          )}
        </CardFooter>
      </Card>
      <div className="mt-4">
        {interviewCompleted ? (
          <>
            <h2 className="text-xl font-bold mb-2">면접이 종료되었습니다</h2>
          </>
        ) : (
          <div className="mb-4">
            {displayedQuestions.length > 0 && (
              <p>
                <strong>Question:</strong> {displayedQuestions[0]}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
