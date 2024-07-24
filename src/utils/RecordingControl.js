export const startRecording = async (
  mediaRecorderRef,
  setAudioURL,
  setQuestionsAndAnswers,
  currentQuestionIndex,
  questionsAndAnswers,
  handleNextQuestion,
  setError
) => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setError("getUserMedia is not supported in this browser");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    const audioChunks = [];
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);

      // Send audioBlob to server
      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav"); // Ensure the field name matches

        const response = await fetch("/api/recognize", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to send audio to server");
        }

        const result = await response.json();
        const recognizedText = result.transcript;

        const updatedQnA = [...questionsAndAnswers];
        updatedQnA[currentQuestionIndex].answer = recognizedText;
        setQuestionsAndAnswers(updatedQnA);

        handleNextQuestion();
      } catch (err) {
        setError("Failed to send audio to server");
      }
    };

    mediaRecorder.start();
  } catch (err) {
    setError("Failed to start recording");
  }
};

export const stopRecording = (mediaRecorderRef) => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
  }
};
