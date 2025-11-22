
"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Send, Loader2, Sparkles, X, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  filterContentAndSuggestHashtags,
  type ContentFilteringAndHashtagSuggestionsOutput,
} from '@/ai/flows/content-filtering-hashtag-suggestions';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/data';
import { Badge } from './ui/badge';

type CreatePostProps = {
    onAddPost: (content: string, mediaUrl: string | null, mediaType: 'image' | 'video' | null) => void;
};


export default function CreatePost({ onAddPost }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{url: string; type: 'image' | 'video'} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ContentFilteringAndHashtagSuggestionsOutput | null>(null);
  const { toast } = useToast();
  
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const currentUserDocRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: currentUser } = useDoc<User>(currentUserDocRef);
  
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handlePhotoUpload = () => {
    if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.click();
    }
  };
  
  const handleVideoUpload = () => {
      if (fileInputRef.current) {
          fileInputRef.current.accept = 'video/*';
          fileInputRef.current.click();
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
      if (!fileType) {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Please select an image or a video file.'
        });
        return;
      }
      
      // In a real app, you would upload to Firebase Storage here and get a URL.
      // For now, we'll use a data URL which is not scalable.
      reader.onloadend = () => {
        setMedia({ url: reader.result as string, type: fileType});
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleAnalyzeAndPost = async () => {
    if (!content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Post',
        description: 'You cannot create an empty post.',
      });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await filterContentAndSuggestHashtags({ 
        content: analysisResult ? analysisResult.filteredContent : content,
        photoDataUri: media?.type === 'image' ? media.url : undefined
      });

      if (!result.isContentAllowed) {
        toast({
          variant: 'destructive',
          title: 'Content Not Allowed',
          description: 'Your post violates our content policy and cannot be published.',
        });
      } else {
        setContent(result.filteredContent);
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not analyze post. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    if (!analysisResult) return;
    
    onAddPost(analysisResult.filteredContent, media?.url ?? null, media?.type ?? null);
    
    toast({
        title: 'Post Published!',
        description: "Your post is now live for your friends to see.",
    });
    setContent('');
    setMedia(null);
    setAnalysisResult(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }
  
  const addHashtag = (hashtag: string) => {
    setContent(prev => `${prev.trim()} ${hashtag}`);
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.firstName} />
            <AvatarFallback>{currentUser?.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-2 min-h-24"
              disabled={isLoading || !!analysisResult}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {media && (
              <div className="relative mb-2">
                {media.type === 'image' ? (
                    <Image
                        src={media.url}
                        alt="New post preview"
                        width={600}
                        height={400}
                        className="rounded-lg object-cover w-full"
                        data-ai-hint="user uploaded image"
                    />
                ) : (
                    <video
                        src={media.url}
                        controls
                        className="rounded-lg object-cover w-full"
                        data-ai-hint="user uploaded video"
                    />
                )}
                 <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={removeMedia}
                  disabled={isLoading || !!analysisResult}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {analysisResult && analysisResult.suggestedHashtags.length > 0 && (
              <div className="my-4">
                <p className="text-sm font-medium mb-2 text-muted-foreground">Suggested Hashtags (click to add):</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.suggestedHashtags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-accent" onClick={() => addHashtag(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handlePhotoUpload} disabled={isLoading || !!analysisResult}>
                        <ImageIcon className="h-5 w-5 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleVideoUpload} disabled={isLoading || !!analysisResult}>
                        <Video className="h-5 w-5 text-blue-500" />
                    </Button>
                </div>
              {analysisResult ? (
                <Button onClick={handlePublish}>
                  <Send className="mr-2 h-4 w-4" /> Publish
                </Button>
              ) : (
                <Button onClick={handleAnalyzeAndPost} disabled={!content.trim() || isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4 text-yellow-300" />
                  )}
                  {isLoading ? 'Analyzing...' : 'Post'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
