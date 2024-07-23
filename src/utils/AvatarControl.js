// src/utils/AvatarControl.js
import { Configuration, StreamingAvatarApi } from "@heygen/streaming-avatar";

export async function initializeAvatar(token) {
  const avatar = new StreamingAvatarApi(
    new Configuration({ accessToken: token, jitterBuffer: 200 })
  );
  return avatar;
}

export async function startAvatarSession(avatar, avatarId, voiceId, setDebug) {
  try {
    const res = await avatar.createStartAvatar(
      {
        newSessionRequest: {
          quality: "low",
          avatarName: avatarId,
          voice: { voiceId: voiceId },
        },
      },
      setDebug
    );
    return res;
  } catch (error) {
    console.error("Error starting avatar session:", error);
    setDebug(`Error: ${error.message}`);
    throw error;
  }
}

export async function endAvatarSession(avatar, sessionId, setDebug) {
  try {
    await avatar.stopAvatar(
      { stopSessionRequest: { sessionId: sessionId } },
      setDebug
    );
  } catch (error) {
    setDebug(`Error ending session: ${error.message}`);
  }
}

export async function interruptAvatarSession(avatar, sessionId, setDebug) {
  try {
    await avatar.interrupt({ interruptRequest: { sessionId: sessionId } });
  } catch (error) {
    setDebug(`Error interrupting session: ${error.message}`);
  }
}

export async function speakAvatar(avatar, text, sessionId, setDebug) {
  try {
    await avatar.speak({ taskRequest: { text: text, sessionId: sessionId } });
  } catch (error) {
    setDebug(`Error speaking: ${error.message}`);
  }
}
