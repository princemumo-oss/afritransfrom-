"use client";

import Image from 'next/image';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { Post } from '@/lib/data';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type PostCardProps = {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
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
        {post.imageUrl && (
          <div className="relative aspect-video overflow-hidden rounded-lg border">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover"
              data-ai-hint={post.imageHint}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleLike} className={cn("flex items-center gap-2 text-muted-foreground", isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500")}>
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} /> {likeCount}
          </Button>
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
