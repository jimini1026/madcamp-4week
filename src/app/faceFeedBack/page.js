// src/app/faceFeedback/page.js
"use client";

import FaceDetection from "../../components/FaceDetection";

const FaceFeedback = () => {
  return (
    <div>
      <h1>AI 면접</h1>
      <FaceDetection />
    </div>
  );
};

export default FaceFeedback;
