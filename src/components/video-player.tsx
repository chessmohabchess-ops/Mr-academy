"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  courseId: string;
  lessonId: string;
  initialPosition?: number;
};

export function VideoPlayer({ src, courseId, lessonId, initialPosition = 0 }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.currentTime = initialPosition;

    const onPause = async () => {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          lessonId,
          watchedSeconds: Math.floor(video.currentTime),
          lastPositionSeconds: Math.floor(video.currentTime),
          completed: false,
        }),
      });
    };

    const onEnded = async () => {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          lessonId,
          watchedSeconds: Math.floor(video.duration || video.currentTime),
          lastPositionSeconds: Math.floor(video.duration || video.currentTime),
          completed: true,
        }),
      });
    };

    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [courseId, lessonId, initialPosition]);

  return <video ref={ref} src={src} controls className="w-full rounded-3xl bg-black" />;
}
