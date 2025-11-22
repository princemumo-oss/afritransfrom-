
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { type Reel } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Send, Music, Play, Pause } from 'lucide-react';
import { Progress } from './ui/progress';

interface ReelPlayerProps {
  reel: Reel;
  isActive: boolean;
}

export function ReelPlayer({ reel, isActive }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (isActive) {
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        video.pause();
        video.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', () => {
        // Here you would typically trigger moving to the next reel
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        className="h-full w-full object-cover"
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 p-4 rounded-full">
            <Play className="h-12 w-12 text-white" fill="white" />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-end">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={reel.author.avatarUrl} />
                <AvatarFallback>{reel.author.firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-bold">{reel.author.handle}</span>
              <Button size="sm" variant="outline" className="h-auto px-2 py-0.5 text-xs bg-transparent text-white border-white">
                Follow
              </Button>
            </div>
            <p className="text-sm">{reel.caption}</p>
            <div className="flex items-center gap-2 text-sm">
                <Music className="h-4 w-4" />
                <span>Original Audio</span>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <Button variant="ghost" size="icon" className="h-auto p-0 flex flex-col items-center text-white hover:bg-transparent hover:text-white">
                <Heart className="h-8 w-8" />
                <span className="text-xs">{reel.likes}</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-auto p-0 flex flex-col items-center text-white hover:bg-transparent hover:text-white">
                <MessageCircle className="h-8 w-8" />
                <span className="text-xs">{reel.comments}</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-auto p-0 flex flex-col items-center text-white hover:bg-transparent hover:text-white">
                <Send className="h-8 w-8" />
            </Button>
             <Avatar className="h-10 w-10 border-2 border-white animate-[spin_4s_linear_infinite]">
                <AvatarImage src={reel.author.avatarUrl} />
            </Avatar>
          </div>
        </div>
         <Progress value={progress} className="h-1 mt-2 bg-white/30 [&>div]:bg-white" />
      </div>
    </div>
  );
}
