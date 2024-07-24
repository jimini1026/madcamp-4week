// src/components/StreamingAvatar.js
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Spinner,
  Input,
} from "@nextui-org/react";
import { fetchAccessToken } from "../utils/api";
import {
  initializeAvatar,
  startAvatarSession,
  endAvatarSession,
  interruptAvatarSession,
  speakAvatar,
} from "../utils/AvatarControl";
import { startRecording, stopRecording } from "../utils/RecordingControl";
import { initialQuestionsAndAnswers } from "../data/InterviewQuestions";

export default function StreamingAvatar({ essayTitle }) {
  useEffect(() => {
    console.log(essayTitle);
  }, [essayTitle]);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState(null);
  const [debug, setDebug] = useState("");
  const [data, setData] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const mediaStream = useRef(null);
  const avatar = useRef(null);

  const defaultAvatarId = "josh_lite3_20230714";
  const defaultVoiceId = "077ab11b14f04ce0b49b5f6e5cc20979";

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioURL, setAudioURL] = useState("");
  const [error, setError] = useState("");
  const [textInput, setTextInput] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState(
    initialQuestionsAndAnswers
  );
  const [displayedQuestions, setDisplayedQuestions] = useState([]);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const handleSpeak = async (textToSpeak) => {
    setIsLoadingRepeat(true);
    if (!initialized || !avatar.current) {
      setDebug("Avatar API is not initialized");
      setIsLoadingRepeat(false);
      return;
    }
    await speakAvatar(avatar.current, textToSpeak, data?.sessionId, setDebug);
    setIsLoadingRepeat(false);
  };

  useEffect(() => {
    async function init() {
      const newToken = await fetchAccessToken();
      avatar.current = await initializeAvatar(newToken);
      setInitialized(true);
      const res = await startAvatarSession(
        avatar.current,
        defaultAvatarId,
        defaultVoiceId,
        setDebug
      );
      setData(res);
      setStream(avatar.current.mediaStream);
    }
    init();

    return () => {
      endAvatarSession(avatar.current, data?.sessionId, setDebug);
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current.play();
        setDebug("Playing");
      };
    }
  }, [stream]);

  useEffect(() => {
    window.addEventListener("beforeunload", () =>
      endAvatarSession(avatar.current, data?.sessionId, setDebug)
    );
    return () => {
      window.removeEventListener("beforeunload", () =>
        endAvatarSession(avatar.current, data?.sessionId, setDebug)
      );
    };
  }, [initialized]);

  const handleStartRecording = async () => {
    await startRecording(
      mediaRecorderRef,
      setAudioURL,
      setRecognizedText,
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
        await endAvatarSession(avatar.current, data?.sessionId, setDebug);
        // Redirect to the review page
        const qna = JSON.stringify(questionsAndAnswers);
        window.location.href = `/reviewpage?qna=${encodeURIComponent(
          qna
        )}&title=${encodeURIComponent(essayTitle)}`;
      }, 5000); // 5-second delay
    }
  };

  const handleTextSubmit = async (text) => {
    if (text.trim() === "") return;

    setTextInput("");
    const updatedQnA = [...questionsAndAnswers];
    updatedQnA[currentQuestionIndex].answer = text;
    setQuestionsAndAnswers(updatedQnA);

    handleNextQuestion();
  };

  const startInterview = async () => {
    if (questionsAndAnswers.length > 0) {
      setDisplayedQuestions([questionsAndAnswers[0].question]);
      setCurrentQuestionIndex(0); // Reset to the first question
      await handleSpeak(questionsAndAnswers[0].question);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <Card>
        <CardBody className="h-[500px] flex flex-col justify-center items-center">
          {stream ? (
            <div className="h-[500px] w-[900px] justify-center items-center flex rounded-lg overflow-hidden">
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              >
                <track kind="captions" />
              </video>
              <div className="flex flex-col gap-2 absolute bottom-3 right-3">
                <Button
                  size="md"
                  onClick={() =>
                    interruptAvatarSession(
                      avatar.current,
                      data.sessionId,
                      setDebug
                    )
                  }
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  variant="shadow"
                >
                  Interrupt task
                </Button>
                <Button
                  size="md"
                  onClick={() =>
                    endAvatarSession(avatar.current, data.sessionId, setDebug)
                  }
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  variant="shadow"
                >
                  End session
                </Button>
              </div>
            </div>
          ) : (
            <Spinner size="lg" color="default" />
          )}
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col gap-3">
          <div className="flex justify-center mb-4">
            <Button
              onClick={startInterview}
              className="bg-green-500 text-white"
            >
              Start Interview
            </Button>
          </div>
          <div className="flex justify-center mb-4">
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`px-4 py-2 font-bold text-white rounded ${
                isRecording ? "bg-red-500" : "bg-blue-500"
              }`}
            >
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
          <div className="flex flex-col gap-3">
            <Input
              fullWidth
              clearable
              underlined
              labelPlaceholder="Type your message"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <Button
              onClick={() => handleTextSubmit(textInput)}
              className="bg-blue-500 text-white"
            >
              Send to Avatar
            </Button>
          </div>
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
      <p className="font-mono text-right">
        <span className="font-bold">Console:</span>
        <br />
        {debug}
      </p>
    </div>
  );
}
