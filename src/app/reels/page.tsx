'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/main-layout';
import { type Reel } from '@/lib/data';
import { ReelPlayer } from '@/components/reel-player';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clapperboard, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, getDoc, orderBy } from 'firebase/firestore';

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();

  const storiesQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'stories') : null
  , [firestore]);

  const { data: storyDocs, isLoading } = useCollection(storiesQuery);
  
  useEffect(() => {
    if (!storyDocs) return;

    const fetchAuthors = async () => {
        const reelsWithAuthors = await Promise.all(
            storyDocs.map(async (story) => {
                const userRef = doc(firestore, 'users', story.authorId);
                const userSnap = await getDoc(userRef);
                const author = userSnap.data();
                // This is a simplified version of Reel, mapping from Story
                return { 
                  id: story.id,
                  author: author,
                  videoUrl: story.mediaUrl,
                  caption: story.caption || '',
                  likes: story.likeIds?.length || 0,
                  comments: 0 // Comments not implemented for stories yet
                } as Reel;
            })
        );
        setReels(reelsWithAuthors);
    };

    fetchAuthors();
  }, [storyDocs, firestore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setCurrentReelIndex(index);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5,
      }
    );

    const elements = containerRef.current?.querySelectorAll('.reel-item');
    if (elements) {
      elements.forEach((el) => observer.observe(el));
    }

    return () => {
      if (elements) {
        elements.forEach((el) => observer.unobserve(el));
      }
    };
  }, [reels]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    )
  }

  if (reels.length === 0) {
    return (
      <MainLayout>
        <div className="flex h-full w-full items-center justify-center">
          <Alert className="max-w-md">
            <Clapperboard className="h-4 w-4" />
            <AlertTitle>No Reels to Show</AlertTitle>
            <AlertDescription>
              There are no reels available at the moment. Be the first to create one!
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center bg-black rounded-lg">
        <div
          ref={containerRef}
          className="relative h-full w-full max-w-sm snap-y snap-mandatory overflow-y-auto"
        >
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              data-index={index}
              className="reel-item h-full w-full snap-start flex items-center justify-center"
            >
              <ReelPlayer
                reel={reel}
                isActive={index === currentReelIndex}
              />
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
