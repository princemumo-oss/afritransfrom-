
'use client';

import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, Loader2, Bot, User as UserIcon, Copy, Volume2, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { chatWithBot } from '@/ai/flows/chatbot';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/data';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

type Message = {
    id: number;
    role: 'user' | 'model';
    content: string;
};

const botUser = {
    name: 'JANET',
    avatarUrl: '/bot-avatar.png'
};

const initialMessage: Message = {
    id: 0,
    role: 'model',
    content: "Oh, look. A new user. I'm JANET, which stands for Just Another Needless Electronic Thing. What do you want?"
}

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const { user: authUser } = useUser();
    const firestore = useFirestore();
    const currentUserDocRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: currentUser } = useDoc<User>(currentUserDocRef);

    useEffect(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
          }
        }
      }, [messages]);

    useEffect(() => {
        if (audioUrl && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
    }, [audioUrl]);
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
    
        const userMessage: Message = { id: messages.length, role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
    
        try {
          const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }));
          const result = await chatWithBot({ history, message: input });
          
          const botMessage: Message = { id: messages.length + 1, role: 'model', content: result.response };
          setMessages((prev) => [...prev, botMessage]);
    
        } catch (error) {
          console.error('Chatbot error:', error);
          toast({
            variant: 'destructive',
            title: 'An Error Occurred',
            description: 'Could not get a response from the chatbot. Please try again.',
          });
          setMessages(prev => prev.slice(0, -1));
        } finally {
          setIsLoading(false);
        }
      };

      const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
        toast({
            title: 'Message Copied!',
            description: 'The message has been copied to your clipboard.',
        });
      }

      const handlePlayAudio = async (message: Message) => {
        if (playingMessageId === message.id) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setPlayingMessageId(null);
            setAudioUrl(null);
            return;
        }

        setPlayingMessageId(message.id);
        try {
            const result = await textToSpeech({ text: message.content });
            setAudioUrl(result.audio);
        } catch (error) {
            console.error("TTS error:", error);
            toast({
                variant: "destructive",
                title: "Couldn't generate audio",
                description: "There was a problem generating the audio for this message."
            });
            setPlayingMessageId(null);
        }
      };

      const handleAudioEnded = () => {
        setPlayingMessageId(null);
        setAudioUrl(null);
      };

    return (
        <MainLayout>
             <div className="mx-auto grid w-full max-w-3xl gap-6">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-2">
                        <Bot className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">AI Companion</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Your personal AI to talk about anything and everything.
                    </p>
                </div>
                <audio ref={audioRef} src={audioUrl || undefined} onEnded={handleAudioEnded} />
                <Card className="flex flex-col h-[calc(100vh-16rem)]">
                    <CardContent className="flex-1 p-0 flex flex-col">
                        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                            <div className="space-y-6">
                                <AnimatePresence>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className={cn('group relative flex items-start gap-3', message.role === 'user' ? 'justify-end' : '')}>
                                            {message.role === 'model' && (
                                                <Avatar className="h-8 w-8 border">
                                                    <AvatarImage src={botUser.avatarUrl} />
                                                    <AvatarFallback>AI</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={cn('max-w-md rounded-lg p-3 lg:max-w-lg', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                            </div>
                                             {message.role === 'model' && (
                                                <div className="flex-col self-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                                        onClick={() => handleCopyMessage(message.content)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                                        onClick={() => handlePlayAudio(message)}
                                                    >
                                                        {playingMessageId === message.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            )}
                                            {message.role === 'user' && currentUser && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.firstName} />
                                                    <AvatarFallback>{currentUser.firstName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-8 w-8 border">
                                                <AvatarImage src={botUser.avatarUrl} />
                                                <AvatarFallback>AI</AvatarFallback>
                                            </Avatar>
                                            <div className="bg-muted rounded-lg p-3 flex items-center">
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="border-t p-4">
                            <form onSubmit={handleSubmit} className="relative">
                                <Input 
                                    placeholder="Ask me anything..." 
                                    className="pr-12 rounded-full"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isLoading}
                                />
                                <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" disabled={isLoading || !input.trim()}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
