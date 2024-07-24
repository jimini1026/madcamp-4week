"use client";

import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";

const FaceDetection = ({ width, height }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    };

    loadModels();
  }, []);

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;

        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (!detections || detections.length === 0) {
          setFeedback("No faces detected");
          return;
        }

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        if (resizedDetections.length > 0) {
          const expressions = resizedDetections[0].expressions;
          const landmarks = resizedDetections[0].landmarks;
          const maxExpression = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b
          );

          // 시선 처리 감지
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          const nose = landmarks.getNose();

          const eyeDirection = (leftEye[0].x + rightEye[3].x) / 2 - nose[3].x;

          if (eyeDirection > 10 || eyeDirection < -10) {
            setFeedback("시선을 면접관에게 맞춰주세요.");
          } else if (expressions.neutral > 0.3 || expressions.angry > 0.2) {
            setFeedback(
              "표정이 너무 굳어있습니다. 편안한 표정을 지어 면접관에게 좋은 인상을 주세요."
            );
          } else if (expressions.disgusted > 0.2 || expressions.fearful > 0.2) {
            setFeedback(
              "표정이 부자연스럽습니다. 부드러운 표정을 유지해주세요."
            );
          } else if (expressions.happy > 0.02) {
            setFeedback("좋은 표정입니다! 계속 유지하세요.");
          } else if (expressions.surprised > 0.2) {
            setFeedback("표정이 너무 과합니다. 자연스럽게 유지해주세요.");
          } else if (expressions.sad > 0.2) {
            setFeedback("슬퍼 보입니다. 밝은 표정을 지어보세요.");
          } else {
            setFeedback("좋은 표정입니다! 계속 유지하세요.");
          }
        }
      }
    }, 500); // 500ms마다 업데이트
  };

  return (
    <div style={{ position: "relative", width, height }}>
      <Webcam
        ref={webcamRef}
        onPlay={handleVideoOnPlay} // onPlay 이벤트 핸들러 설정
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          zIndex: 8,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          zIndex: 9,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          zIndex: 10,
          color: "white",
          background: "rgba(0, 0, 0, 0.5)",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        {feedback}
      </div>
    </div>
  );
};

export default FaceDetection;
