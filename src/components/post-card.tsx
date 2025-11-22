
"use client";

import Image from 'next/image';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Smile } from 'lucide-react';
import type { Post } from '@/lib/data';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type PostCardProps = {
  post: Post;
};

const reactions = ['❤️', '😂', '😯', '😢', '😡', '👍'];

export default function PostCard({ post }: PostCardProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleReaction = (reaction: string) => {
    if (selectedReaction === reaction) {
      // User is deselecting their reaction
      setSelectedReaction(null);
      setLikeCount(likeCount - 1);
    } else if (selectedReaction) {
      // User is changing their reaction, count stays same
      setSelectedReaction(reaction);
    } else {
      // User is adding a new reaction
      setSelectedReaction(reaction);
      setLikeCount(likeCount + 1);
    }
  }

  const getLikeButtonContent = () => {
    if (selectedReaction) {
      // If there is a reaction, show the reaction and the count
      return (
        <>
          <span className="text-xl">{selectedReaction}</span> {likeCount}
        </>
      );
    }
    // If there's no reaction, show the heart icon and the count
    return (
      <>
        <Heart className="h-4 w-4" /> {likeCount}
      </>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="font-semibold">{post.author.name}</p>
          <p className="text-sm text-muted-foreground">{post.timestamp}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
        {post.mediaUrl && (
          <div className="relative aspect-video overflow-hidden rounded-lg border">
            {post.mediaType === 'image' ? (
              <Image
                src={post.mediaUrl}
                alt="Post image"
                fill
                className="object-cover"
                data-ai-hint={post.imageHint}
              />
            ) : (
              <video
                src={post.mediaUrl}
                controls
                className="h-full w-full object-cover"
                data-ai-hint="user uploaded video"
              />
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <div className="flex gap-1">
          <Popover>
            <PopoverTrigger asChild>
               <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "flex items-center gap-2 text-muted-foreground", 
                  selectedReaction ? "text-primary" : "hover:text-primary"
                )}
              >
                {getLikeButtonContent()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-fit gap-1 p-1">
              {reactions.map(reaction => (
                <Button
                  key={reaction}
                  variant="ghost"
                  size="icon"
                  className={cn("rounded-full text-xl hover:bg-accent", selectedReaction === reaction && "bg-accent scale-110")}
                  onClick={() => handleReaction(reaction)}
                >
                  {reaction}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <MessageCircle className="h-4 w-4" /> {post.comments.length}
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </CardFooter>
    </Card>
  );
}
