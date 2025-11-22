
'use client';

import { useRef, useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Send, Music } from 'lucide-react';
import { users } from '@/lib/data';
import { cn } from '@/lib/utils';

const reels = [
  {
    id: 1,
    user: users[0],
    videoUrl: 'https://storage.googleapis.com/static.afritransform.com/pexels-man-in-blue-suit-jacket-standing-on-stage-in-front-of-people-in-a-concert-6689035%20(2160p).mp4',
    caption: 'Best concert of my life! The energy was insane 🔥 #livemusic #concert',
    audio: 'Original Audio by @alice',
    likes: '12.3k',
    comments: '452',
  },
  {
    id: 2,
    user: users[1],
    videoUrl: 'https://storage.googleapis.com/static.afritransform.com/pexels-pressmaster-10147427%20(2160p).mp4',
    caption: 'Morning coffee routine ☕️ What\'s your go-to brew?',
    audio: 'lofi hip hop - chill beats to relax/study to',
    likes: '5,8k',
    comments: '198',
  },
  {
    id: 3,
    user: users[2],
    videoUrl: 'https://storage.googleapis.com/static.afritransform.com/pexels-lital-levi-19253459%20(2160p).mp4',
    caption: 'Exploring the great outdoors. Nothing beats this view. #hiking #nature',
    audio: 'Upbeat Acoustic - SunnyDays',
    likes: '22.1k',
    comments: '889',
  },
];

export default function ReelsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentReel, setCurrentReel] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = entry.target as HTMLVideoElement;
            video.play();
            const reelIndex = parseInt(video.dataset.index || '0', 10);
            setCurrentReel(reelIndex);
          } else {
             const video = entry.target as HTMLVideoElement;
             video.pause();
             video.currentTime = 0;
          }
        });
      },
      { threshold: 0.7 }
    );

    const videos = containerRef.current?.querySelectorAll('video');
    videos?.forEach((video) => observer.observe(video));

    return () => {
      videos?.forEach((video) => observer.unobserve(video));
    };
  }, []);

  return (
    <MainLayout>
      <div className="relative flex h-[calc(100vh-8rem)] w-full items-center justify-center bg-black">
        <div 
            ref={containerRef}
            className="h-full w-full max-w-sm snap-y snap-mandatory overflow-y-scroll rounded-lg"
        >
          {reels.map((reel, index) => (
            <div key={reel.id} className="relative h-full w-full snap-start">
              <video
                src={reel.videoUrl}
                loop
                muted
                playsInline
                data-index={index}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={reel.user.avatarUrl} />
                    <AvatarFallback>{reel.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">{reel.user.handle}</p>
                  <Button variant="outline" size="sm" className="h-6 bg-transparent text-white">Follow</Button>
                </div>
                <p className="mt-2 text-sm">{reel.caption}</p>
                 <div className="mt-2 flex items-center gap-2 text-sm">
                    <Music className="h-4 w-4" />
                    <p className='truncate'>{reel.audio}</p>
                </div>
              </div>
              <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4 text-white">
                <Button variant="ghost" size="icon" className="h-12 w-12 flex-col gap-1 text-white hover:bg-white/20 hover:text-white">
                  <Heart className="h-7 w-7" />
                  <span className="text-xs">{reel.likes}</span>
                </Button>
                 <Button variant="ghost" size="icon" className="h-12 w-12 flex-col gap-1 text-white hover:bg-white/20 hover:text-white">
                  <MessageCircle className="h-7 w-7" />
                  <span className="text-xs">{reel.comments}</span>
                </Button>
                 <Button variant="ghost" size="icon" className="h-12 w-12 text-white hover:bg-white/20 hover:text-white">
                  <Send className="h-7 w-7" />
                </Button>
                <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarImage src={reel.user.avatarUrl} />
                </Avatar>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

