"use client";

import Image from 'next/image';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Languages, Loader2, RefreshCcw } from 'lucide-react';
import type { Post } from '@/lib/data';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { translateText } from '@/ai/flows/translate-text';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

type PostCardProps = {
  post: Post;
};

const reactions = ['❤️', '😂', '😯', '😢', '😡', '👍'];
const availableLanguages = ['Spanish', 'French', 'German', 'Japanese', 'Mandarin', 'Swahili'];

export default function PostCard({ post }: PostCardProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleReaction = (reaction: string) => {
    if (selectedReaction === reaction) {
      setSelectedReaction(null);
      setLikeCount(likeCount - 1);
    } else if (selectedReaction) {
      setSelectedReaction(reaction);
    } else {
      setSelectedReaction(reaction);
      setLikeCount(likeCount + 1);
    }
  };

  const getLikeButtonContent = () => {
    if (selectedReaction) {
      return (
        <>
          <span className="text-xl">{selectedReaction}</span> {likeCount}
        </>
      );
    }
    return (
      <>
        <Heart className="h-4 w-4" /> {likeCount}
      </>
    );
  };

  const handleTranslate = async (language: string) => {
    setIsTranslating(true);
    setTranslatedContent(null);
    try {
      const result = await translateText({ text: post.content, targetLanguage: language });
      setTranslatedContent(result.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: 'Could not translate the post at this time.',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 gap-1">
          <p className="font-semibold">{post.author.name}</p>
          <p className="text-sm text-muted-foreground">{post.timestamp}</p>
        </div>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled={isTranslating}>
                   {isTranslating ? <Loader2 className="animate-spin" /> : <Languages className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {availableLanguages.map(lang => (
                    <DropdownMenuItem key={lang} onClick={() => handleTranslate(lang)}>
                        {lang}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
        
        {isTranslating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Translating...</span>
            </div>
        )}

        {translatedContent && (
            <div className="mt-4 space-y-2 rounded-md border bg-accent/50 p-3">
                 <p className="text-sm font-semibold text-muted-foreground">Translated from {post.author.name}</p>
                 <p className="whitespace-pre-wrap text-sm">{translatedContent}</p>
                 <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setTranslatedContent(null)}>
                     Show original
                 </Button>
            </div>
        )}

        {post.mediaUrl && (
          <div className="relative mt-4 aspect-video overflow-hidden rounded-lg border">
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
