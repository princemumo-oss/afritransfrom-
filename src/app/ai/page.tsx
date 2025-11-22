
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Image, Languages, PenLine, Loader2, Copy } from 'lucide-react';
import Link from 'next/link';
import { generateStory } from '@/ai/flows/story-generator';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const aiTools = [
  {
    icon: Languages,
    title: 'Text Translation',
    description: 'Break down language barriers by translating posts and messages into your native language.',
    href: '/messages',
    cta: 'Try in Messages'
  },
  {
    icon: Bot,
    title: 'Content Moderation',
    description: 'Our AI automatically helps filter content to keep the community safe and positive.',
    href: '/',
    cta: 'See in Feed'
  },
   {
    icon: Image,
    title: 'Hashtag Suggestions',
    description: 'Get relevant hashtag suggestions when you create a post to increase its discoverability.',
    href: '/',
    cta: 'Try in a New Post'
  },
];

function StoryGenerator() {
    const [prompt, setPrompt] = useState('');
    const [story, setStory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
  
    const handleGenerateStory = async () => {
      if (!prompt.trim()) {
        toast({
          variant: 'destructive',
          title: 'Prompt is empty',
          description: 'Please enter a prompt to generate a story.',
        });
        return;
      }
      setIsLoading(true);
      setStory('');
      try {
        const result = await generateStory({ prompt });
        setStory(result.story);
      } catch (error) {
        console.error('Story generation error:', error);
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: 'Could not generate the story at this time.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    const handleCopyStory = () => {
        if (!story) return;
        navigator.clipboard.writeText(story);
        toast({
            title: 'Story Copied!',
            description: 'The story has been copied to your clipboard.',
        });
    }
  
    return (
      <Card className="col-span-1 flex flex-col md:col-span-2 lg:col-span-3">
        <CardHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PenLine className="h-6 w-6" />
          </div>
          <CardTitle className="pt-4">Story Generator</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <CardDescription>
            Unleash your creativity! Give our AI a prompt and watch it write a unique story for you.
          </CardDescription>
          <div className="flex gap-2">
            <Input 
                placeholder="e.g., A robot who discovers music..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
            />
            <Button onClick={handleGenerateStory} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
            </Button>
          </div>
          {story && (
             <Card className='bg-muted/50 relative'>
                <CardContent className='p-4'>
                    <p className='text-sm whitespace-pre-wrap'>{story}</p>
                </CardContent>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground"
                    onClick={handleCopyStory}
                >
                    <Copy className="h-4 w-4" />
                </Button>
             </Card>
          )}
        </CardContent>
      </Card>
    );
  }

export default function AiToolsPage() {
  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">AI Tools</h1>
          <p className="text-muted-foreground">
            Explore the smart features that power your experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aiTools.map((tool) => (
            <Card key={tool.title} className="flex flex-col">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <tool.icon className="h-6 w-6" />
                </div>
                <CardTitle className="pt-4">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={tool.href}>
                    {tool.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
           <StoryGenerator />
        </div>
      </div>
    </MainLayout>
  );
}
