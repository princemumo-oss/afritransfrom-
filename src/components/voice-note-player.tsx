
"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "./ui/button";

interface VoiceNotePlayerProps {
  src: string;
  duration: number; // in seconds
}

export function VoiceNotePlayer({ src, duration }: VoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTime = audioRef.current ? audioRef.current.currentTime : 0;

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} src={src} preload="auto" />
      <Button
        size="icon"
        variant="ghost"
        onClick={togglePlayPause}
        className="h-8 w-8 shrink-0 rounded-full"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex-1 h-1.5 bg-muted-foreground/30 rounded-full relative">
        <div 
          className="absolute h-full bg-primary rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
         <div 
          className="absolute h-3 w-3 -top-1 bg-primary rounded-full"
          style={{ left: `calc(${progress}% - 6px)` }}
        ></div>
      </div>
      <span className="text-xs font-mono w-12 text-right">
        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
      </span>
    </div>
  );
}
