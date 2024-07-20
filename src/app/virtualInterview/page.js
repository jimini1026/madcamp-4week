"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function VirtualInterview() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioURL, setAudioURL] = useState('');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize the router

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
            setTranscript(data.transcript);
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

  const handleNavigate = () => {
    router.push('/streamingavatar');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Virtual Interview Page</h1>
      <div className="flex justify-center mb-4">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`px-4 py-2 font-bold text-white rounded ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
      {audioURL && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Recorded Audio:</h2>
          <audio src={audioURL} controls />
        </div>
      )}
      {transcript && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Transcript:</h2>
          <p>{transcript}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-500">
          <h2 className="text-xl font-bold mb-2">Error:</h2>
          <p>{error}</p>
        </div>
      )}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleNavigate}
          className="px-4 py-2 font-bold text-white bg-green-500 rounded"
        >
          Go to Streaming Avatar
        </button>
      </div>
    </div>
  );
}
