import React, { useRef, useState, useEffect } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { langs } from '@uiw/codemirror-extensions-langs';
import ReactCodeMirror from '@uiw/react-codemirror';
import { Configuration, StreamingAvatarApi } from '@heygen/streaming-avatar';

export default function StreamingAvatarCode() {
  return (
    <div className="w-full flex flex-col gap-2">
      <p>This SDK supports the following behavior:</p>
      <ul>
        <li>
          <div className="flex flex-row gap-2">
            <p className="text-indigo-400 font-semibold">Start:</p> Start the
            streaming avatar session
          </div>
        </li>
        <li>
          <div className="flex flex-row gap-2">
            <p className="text-indigo-400 font-semibold">Close:</p> Close the
            streaming avatar session
          </div>
        </li>
        <li>
          <div className="flex flex-row gap-2">
            <p className="text-indigo-400 font-semibold">Speak:</p> Repeat the
            input
          </div>
        </li>
      </ul>
      <Card>
        <CardBody>
          <ReactCodeMirror
            editable={false}
            extensions={[langs.typescript()]}
            height="700px"
            theme="light"
            value={TEXT}
          />
        </CardBody>
      </Card>
    </div>
  );
}

const TEXT = `
  import React, { useState, useRef, useEffect } from 'react';
  import { Configuration, StreamingAvatarApi, NewSessionData } from '@heygen/streaming-avatar';

  export default function App() {
    // Media stream used by the video player to display the avatar
    const [stream, setStream] = useState(null);
    const mediaStream = useRef(null);

    // Instantiate the streaming avatar api using your access token
    const avatar = useRef(new StreamingAvatarApi(
        new Configuration({accessToken: '<REPLACE_WITH_ACCESS_TOKEN>'})
    ));

    // State holding streaming avatar session data
    const [sessionData, setSessionData] = useState(null);

    // Function to start the streaming avatar session
    async function start(){
      const res = await avatar.current.createStartAvatar({
        newSessionRequest: {
          // Define the session variables during creation
          quality: "medium", // low, medium, high
          avatarName: '<REPLACE_WITH_AVATAR_ID>', 
          voice: { voiceId: '<REPLACE_WITH_VOICE_ID>' }
        }
      });
      setSessionData(res);
    }

    // Function to stop the streaming avatar session
    async function stop(){
      await avatar.current.stopAvatar({ stopSessionRequest: { sessionId: sessionData?.sessionId } });
    }

    // Function which passes in text to the avatar to repeat
    async function handleSpeak(){
      await avatar.current.speak({ taskRequest: { text: '<TEXT_TO_SAY>', sessionId: sessionData?.sessionId } }).catch((e) => {
        console.error(e);
      });
    }

    useEffect(() => {
      // Handles the display of the streaming avatar
      if (stream && mediaStream.current) {
        mediaStream.current.srcObject = stream;
        mediaStream.current.onloadedmetadata = () => {
          mediaStream.current.play();
        }
      }
    }, [mediaStream, stream]);

    return (
      <div className="w-full">
        <video playsInline autoPlay width={500} ref={mediaStream}/>
      </div>
    );
  }
`;
