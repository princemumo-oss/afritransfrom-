"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Send, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  filterContentAndSuggestHashtags,
  type ContentFilteringAndHashtagSuggestionsOutput,
} from '@/ai/flows/content-filtering-hashtag-suggestions';
import { users } from '@/lib/data';
import { Badge } from './ui/badge';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ContentFilteringAndHashtagSuggestionsOutput | null>(null);
  const { toast } = useToast();
  const currentUser = users.find(u => u.name === 'You');

  const handlePhotoUpload = () => {
    // This is a mock. In a real app, this would open a file picker.
    const mockPhoto = 'https://picsum.photos/seed/newpost/600/400';
    setPhoto(mockPhoto);
  };

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
      // In a real app, if a photo is selected, you'd convert it to a data URI.
      // For this example, we'll pass undefined for photoDataUri.
      const result = await filterContentAndSuggestHashtags({ content });
      if (!result.isContentAllowed) {
        toast({
          variant: 'destructive',
          title: 'Content Not Allowed',
          description: 'Your post violates our content policy and cannot be published.',
        });
      } else {
        setAnalysisResult(result);
      }
    } catch (error) {
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
    // In a real app, this would save the post to the database
    toast({
        title: 'Post Published!',
        description: "Your post is now live for your friends to see.",
    });
    setContent('');
    setPhoto(null);
    setAnalysisResult(null);
  }
  
  const addHashtag = (hashtag: string) => {
    setContent(prev => `${prev.trim()} ${hashtag}`);
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name} />
            <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-2 min-h-24"
              disabled={isLoading || !!analysisResult}
            />
            {photo && (
              <div className="relative mb-2">
                <Image
                  src={photo}
                  alt="New post preview"
                  width={600}
                  height={400}
                  className="rounded-lg object-cover w-full"
                  data-ai-hint="placeholder image"
                />
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
              <Button variant="ghost" size="icon" onClick={handlePhotoUpload} disabled={isLoading || !!analysisResult}>
                <ImageIcon className="h-5 w-5 text-green-500" />
              </Button>
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
