// src/utils/RecordingControl.js
export async function startRecording(
    mediaRecorderRef,
    setAudioURL,
    setRecognizedText,
    setQuestionsAndAnswers,
    currentQuestionIndex,
    questionsAndAnswers,
    handleNextQuestion,
    setError
  ) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];
  
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
  
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
  
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");
  
        try {
          const response = await fetch("/api/recognize", {
            method: "POST",
            body: formData,
          });
  
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
  
          const data = await response.json();
          if (data.error) {
            setError(data.error);
          } else {
            setRecognizedText(data.transcript);
            const updatedQnA = [...questionsAndAnswers];
            updatedQnA[currentQuestionIndex].answer = data.transcript;
            setQuestionsAndAnswers(updatedQnA);
  
            handleNextQuestion();
          }
        } catch (err) {
          setError("Failed to send audio to server");
        }
      };
  
      mediaRecorderRef.current.start();
    } catch (err) {
      setError("Failed to start recording");
    }
  }
  
  export function stopRecording(mediaRecorderRef) {
    mediaRecorderRef.current.stop();
  }
  