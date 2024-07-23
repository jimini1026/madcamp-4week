// src/components/CameraFeed.js
import React, { useEffect, useRef, useState } from "react";

export default function CameraFeed() {
  const [cameraStream, setCameraStream] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(stream);
        if (cameraRef.current) {
          cameraRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing the camera: ", error);
      }
    }
    startCamera();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <video
      ref={cameraRef}
      autoPlay
      playsInline
      className="absolute top-0 left-0 w-[200px] h-[200px] rounded-lg"
      style={{ objectFit: "cover" }}
    >
      <track kind="captions" />
    </video>
  );
}
