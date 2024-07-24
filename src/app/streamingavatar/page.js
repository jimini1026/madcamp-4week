"use client";

import { useSearchParams } from "next/navigation";
import StreamingAvatar from "../../components/StreamingAvatar";
import { useEffect, useState } from "react";

export default function StreamingAvatarPage() {
  const searchParams = useSearchParams();
  const [essayTitle, setEssayTitle] = useState("");

  useEffect(() => {
    const title = searchParams.get("title");
    if (title) {
      setEssayTitle(decodeURIComponent(title));
    } else {
      console.error("Title is not defined in query params");
    }
  }, [searchParams]);

  return (
    <div>
      <StreamingAvatar essayTitle={essayTitle} />
    </div>
  );
}
