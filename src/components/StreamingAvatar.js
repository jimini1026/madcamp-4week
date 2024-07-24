"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Spinner,
} from "@nextui-org/react";
import Image from "next/image"; // import next/image
import { fetchAccessToken } from "../utils/api";
import {
  initializeAvatar,
  startAvatarSession,
  endAvatarSession,
  speakAvatar,
} from "../utils/AvatarControl";
import { startRecording, stopRecording } from "../utils/RecordingControl";
import { initialQuestionsAndAnswers } from "../data/InterviewQuestions";
import FaceDetection from "../components/FaceDetection"; // Adjust the import path if necessary

export default function StreamingAvatar({ essayTitle }) {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState(null);
  const [data, setData] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [startClicked, setStartClicked] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const mediaStream = useRef(null);
  const avatar = useRef(null);
  const cameraStreamRef = useRef(null);

  const avatarIds = ["Wayne_20240711", "josh_lite3_20230714"];
  const voiceIds = [
    "26b2064088674c80b1e5fc5ab1a068ea",
    "433c48a6c8944d89b3b76d2ddcc7176a",
  ];

  const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioURL, setAudioURL] = useState("");
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState(
    initialQuestionsAndAnswers
  );
  const [displayedQuestions, setDisplayedQuestions] = useState([]);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const handleSpeak = async (textToSpeak) => {
    setIsLoadingRepeat(true);
    setCurrentQuestion(textToSpeak);
    if (!initialized || !avatar.current) {
      console.log("Avatar API is not initialized");
      setIsLoadingRepeat(false);
      return;
    }
    await speakAvatar(
      avatar.current,
      textToSpeak,
      data?.sessionId,
      console.log
    );
    setIsLoadingRepeat(false);
  };

  useEffect(() => {
    async function init() {
      const newToken = await fetchAccessToken();
      avatar.current = await initializeAvatar(newToken);
      setInitialized(true);

      const selectedAvatarId = getRandomElement(avatarIds);
      const selectedVoiceId = getRandomElement(voiceIds);

      const res = await startAvatarSession(
        avatar.current,
        selectedAvatarId,
        selectedVoiceId,
        console.log
      );
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
        console.log("Playing avatar stream");
        setAvatarReady(true); // Avatar is ready to play
      };
    }
  }, [stream]);

  useEffect(() => {
    async function setupCamera() {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        cameraStreamRef.current.srcObject = cameraStream;
        cameraStreamRef.current.onloadedmetadata = () => {
          cameraStreamRef.current.play();
          console.log("Playing camera stream");
        };
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupCamera();
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", () =>
      endAvatarSession(avatar.current, data?.sessionId, console.log)
    );
    return () => {
      window.removeEventListener("beforeunload", () =>
        endAvatarSession(avatar.current, data?.sessionId, console.log)
      );
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
        window.location.href = `/reviewpage?qna=${encodeURIComponent(
          qna
        )}&title=${encodeURIComponent(essayTitle)}`;
      }, 5000); // 5-second delay
    }
  };

  const startInterview = async () => {
    setStartClicked(true);
    await handleSpeak("안녕하십니까. 면접을 시작하도록 하겠습니다");
    if (questionsAndAnswers.length > 0) {
      setDisplayedQuestions([questionsAndAnswers[0].question]);
      setCurrentQuestionIndex(0); // Reset to the first question
      await handleSpeak(questionsAndAnswers[0].question);
    }
  };

  return (
    <div className="h-[40.5rem] w-full flex flex-col gap-4 overflow-hidden relative">
      {!startClicked && (
        <div className="absolute inset-0 z-20 flex justify-center items-center bg-gray-800 bg-opacity-50">
          {avatarReady ? (
            <Button
              onClick={startInterview}
              className="bg-transparent text-white border-2 border-white rounded-md"
            >
              시작하기
            </Button>
          ) : (
            <div className="text-white text-2xl">
              준비 중<span className="dot-animate"></span>
            </div>
          )}
        </div>
      )}
      <div
        className={`w-full h-full absolute inset-0 ${
          startClicked ? "" : "blur-sm"
        }`}
        style={{ zIndex: startClicked ? -1 : 10 }}
      ></div>
      <Card className="overflow-hidden">
        <CardBody className="h-[500px] flex justify-center items-center overflow-hidden">
          <div className="flex w-full justify-center gap-4 overflow-hidden">
            <div className="h-[400px] w-[550px] flex items-center justify-center overflow-hidden relative bg-black">
              {stream ? (
                <div className="relative h-full w-full flex justify-center items-center overflow-hidden bg-black">
                  <video
                    ref={mediaStream}
                    autoPlay
                    playsInline
                    className="h-full w-auto object-cover"
                  >
                    <track kind="captions" />
                  </video>
                  {showSubtitles && (
                    <div className="absolute bottom-4 bg-black bg-opacity-50 text-white p-2 rounded">
                      {currentQuestion}
                    </div>
                  )}
                </div>
              ) : (
                <Spinner size="lg" color="default" />
              )}
            </div>
            <div className="h-[400px] w-[550px] flex items-center justify-center overflow-hidden rounded-lg">
              <video
                ref={cameraStreamRef}
                autoPlay
                playsInline
                className="h-full w-auto object-cover"
              >
                <track kind="captions" />
              </video>
            </div>
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col gap-3">
          {startClicked && (
            <>
              <div className="flex justify-center items-center gap-4 mb-4">
                <div
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Image
                    src="/assets/subtitle.png"
                    alt="자막 보기"
                    width={40}
                    height={40}
                  />
                  <span className="text-white">자막 보기</span>
                </div>
                <div
                  onClick={
                    isRecording ? handleStopRecording : handleStartRecording
                  }
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Image
                    src={isRecording ? "/assets/rec.png" : "/assets/bf_rec.png"}
                    alt="Start Recording"
                    width={40}
                    height={40}
                  />
                  <span className="text-white">
                    {isRecording ? "녹음 중" : "녹음 시작"}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardFooter>
      </Card>
      <style jsx>{`
        @keyframes dot-animate {
          0% {
            content: "";
          }
          20% {
            content: ".";
          }
          40% {
            content: "..";
          }
          60% {
            content: "...";
          }
          100% {
            content: "";
          }
        }

        .dot-animate:after {
          content: "";
          animation: dot-animate 2.5s infinite steps(1, end);
        }
      `}</style>
    </div>
  );
}
