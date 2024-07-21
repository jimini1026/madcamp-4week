"use client";

import { Configuration, StreamingAvatarApi } from "@heygen/streaming-avatar";
import { Button, Card, CardBody, CardFooter, Divider, Spinner, Input } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function StreamingAvatar() {
  const gemini = new GoogleGenerativeAI("AIzaSyDpk9XhKNa4ICbXDNHvyBpc-VvmkMHGm5Y");

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

  let currentAvatarId = defaultAvatarId;
  let currentVoiceId = defaultVoiceId;

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioURL, setAudioURL] = useState('');
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState("");
  const [geminiResponse, setGeminiResponse] = useState("");

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      return "";
    }
  }

  async function startSession(retry = false) {
    setIsLoadingSession(true);
    await updateToken();
    if (!avatar.current) {
      setDebug("Avatar API is not initialized");
      setIsLoadingSession(false);
      return;
    }
    try {
      const res = await avatar.current.createStartAvatar(
        {
          newSessionRequest: {
            quality: "low",
            avatarName: currentAvatarId,
            voice: { voiceId: currentVoiceId },
          },
        },
        setDebug
      );
      setData(res);
      setStream(avatar.current.mediaStream);

      setTimeout(() => {
        window.location.reload();
      }, 14 * 60 * 1000);
    } catch (error) {
      console.error("Error starting avatar session:", error);
      setDebug(`Error: ${error.message}`);
      if (error.message.includes("This custom voice ID may not be supported.") && !retry) {
        setDebug("Retrying with default voice ID...");
        currentVoiceId = defaultVoiceId;
        await startSession(true);
      } else {
        setDebug(`There was an error starting the session. ${error.message}`);
      }
      setIsLoadingSession(false);
    }
  }

  async function updateToken() {
    const newToken = await fetchAccessToken();
    avatar.current = new StreamingAvatarApi(
      new Configuration({ accessToken: newToken })
    );

    const startTalkCallback = (e) => {
      console.log("Avatar started talking", e);
    };

    const stopTalkCallback = (e) => {
      console.log("Avatar stopped talking", e);
    };

    avatar.current.addEventHandler("avatar_start_talking", startTalkCallback);
    avatar.current.addEventHandler("avatar_stop_talking", stopTalkCallback);

    setInitialized(true);
  }

  async function handleInterrupt() {
    if (!initialized || !avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    await avatar.current
      .interrupt({ interruptRequest: { sessionId: data?.sessionId } })
      .catch((e) => {
        setDebug(e.message);
      });
  }

  async function endSession() {
    if (!initialized || !avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    await avatar.current.stopAvatar(
      { stopSessionRequest: { sessionId: data?.sessionId } },
      setDebug
    );
    setStream(undefined);
  }

  async function handleSpeak(textToSpeak) {
    setIsLoadingRepeat(true);
    if (!initialized || !avatar.current) {
      setDebug("Avatar API is not initialized");
      setIsLoadingRepeat(false);
      return;
    }
    await avatar.current
      .speak({ taskRequest: { text: textToSpeak, sessionId: data?.sessionId } })
      .catch((e) => {
        setDebug(e.message);
        setIsLoadingRepeat(false);
      });
    setIsLoadingRepeat(false);
  }

  useEffect(() => {
    async function init() {
      const newToken = await fetchAccessToken();
      avatar.current = new StreamingAvatarApi(
        new Configuration({ accessToken: newToken, jitterBuffer: 200 })
      );
      setInitialized(true);
      await startSession();
    }
    init();

    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        if (mediaStream.current) {
          mediaStream.current.play();
          setDebug("Playing");
        }
      };
    }
  }, [mediaStream, stream]);

  useEffect(() => {
    window.addEventListener("beforeunload", endSession);
    return () => {
      window.removeEventListener("beforeunload", endSession);
    };
  }, [initialized]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorderRef.current.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
          const response = await fetch('/api/recognize', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          if (data.error) {
            setError(data.error);
          } else {
            await handleTextSubmit(data.transcript); // Send the transcript to Gemini
          }
        } catch (err) {
          setError('Failed to send audio to server');
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to start recording');
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleTextSubmit = async (prompt) => {
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt, {
        temperature: 0.2,
        presence_penalty: 0.5,
      });
      const response = result.response;
      const text = await response.text();

      if (text) {
        console.log(text);
        setGeminiResponse(text);
        await handleSpeak(text); // Speak the response immediately
      }
    } catch (error) {
      setDebug(`Error fetching Gemini response: ${error.message}`);
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
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              >
                <track kind="captions" />
              </video>
              <div className="flex flex-col gap-2 absolute bottom-3 right-3">
                <Button
                  size="md"
                  onClick={handleInterrupt}
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  variant="shadow"
                >
                  Interrupt task
                </Button>
                <Button
                  size="md"
                  onClick={endSession}
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300  text-white rounded-lg"
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
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`px-4 py-2 font-bold text-white rounded ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
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
            <Button onClick={() => handleTextSubmit(textInput)} className="bg-blue-500 text-white">
              Send to Gemini
            </Button>
          </div>
          {geminiResponse && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">Gemini Response:</h2>
              <p>{geminiResponse}</p>
            </div>
          )}
        </CardFooter>
      </Card>
      <p className="font-mono text-right">
        <span className="font-bold">Console:</span>
        <br />
        {debug}
      </p>
    </div>
  );
}
