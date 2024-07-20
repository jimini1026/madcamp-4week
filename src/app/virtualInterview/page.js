"use client";

import React, { useState, useRef } from 'react';

export default function VirtualInterview() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioURL, setAudioURL] = useState('');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

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

        // 서버에 오디오 데이터 전송
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
          console.log('Sending audio to server...');
          console.log('Audio Blob:', audioBlob);
          console.log('Form Data:', formData.get('audio'));

          const response = await fetch('/api/recognize', {
            method: 'POST',
            body: formData,
          });

          console.log('Server response:', response);

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          console.log('Response data:', data);
          
          if (data.error) {
            setError(data.error);
          } else {
            setTranscript(data.transcript);
          }
        } catch (err) {
          console.error('Fetch error:', err);
          setError('Failed to send audio to server');
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording');
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">모의면접 페이지</h1>
      <div className="flex justify-center mb-4">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`px-4 py-2 font-bold text-white rounded ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {isRecording ? '녹음 중지' : '녹음 시작'}
        </button>
      </div>
      {audioURL && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">녹음된 오디오:</h2>
          <audio src={audioURL} controls />
        </div>
      )}
      {transcript && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">변환된 텍스트:</h2>
          <p>{transcript}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-500">
          <h2 className="text-xl font-bold mb-2">오류:</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
