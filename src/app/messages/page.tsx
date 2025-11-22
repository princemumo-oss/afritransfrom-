
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { conversations, users } from '@/lib/data';
import { Send, Smile, Languages, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { translateText } from '@/ai/flows/translate-text';
import { cn } from '@/lib/utils';

const availableLanguages = ['Español', 'French', 'German', 'Japanese', 'Mandarin', 'Swahili'];

export default function MessagesPage() {
    const currentUser = users.find(u => u.name === 'You');
    const selectedConversation = conversations[0]; // mock selected conversation

    const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
    const [translatingMessageId, setTranslatingMessageId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleTranslate = async (messageId: string, content: string, language: string) => {
        setTranslatingMessageId(messageId);
        try {
          const targetLanguage = language === 'Español' ? 'Spanish' : language;
          const result = await translateText({ text: content, targetLanguage });
          setTranslatedMessages(prev => ({...prev, [messageId]: result.translatedText}));
        } catch (error) {
          console.error('Translation error:', error);
          toast({
            variant: 'destructive',
            title: 'Translation Failed',
            description: 'Could not translate the message at this time.',
          });
        } finally {
          setTranslatingMessageId(null);
        }
      };

    return (
        <MainLayout>
            <div className="grid h-[calc(100vh-8rem)] w-full grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Messages</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-full">
                            <div className="flex flex-col gap-1 p-2">
                                {conversations.map(convo => (
                                    <button
                                        key={convo.id}
                                        className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-accent', convo.id === selectedConversation.id ? 'bg-accent text-accent-foreground' : '')}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={convo.participant.avatarUrl} alt={convo.participant.name} />
                                                <AvatarFallback>{convo.participant.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                             {convo.participant.onlineStatus === 'online' && (
                                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 truncate">
                                            <div className="font-semibold">{convo.participant.name}</div>
                                            <div className="text-sm text-muted-foreground">{convo.lastMessage}</div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{convo.lastMessageTimestamp}</div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center border-b p-4">
                         <div className="flex items-center gap-3">
                             <div className="relative">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedConversation.participant.avatarUrl} alt={selectedConversation.participant.name} />
                                    <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                 {selectedConversation.participant.onlineStatus === 'online' && (
                                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
                                )}
                            </div>
                            <div className="font-semibold">{selectedConversation.participant.name}</div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-6">
                            {selectedConversation.messages.map(message => (
                                <div key={message.id} className={cn('group relative flex items-start gap-3', message.sender.id === currentUser?.id ? 'justify-end' : '')}>
                                    {message.sender.id !== currentUser?.id && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
                                            <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className="relative">
                                        <div className={cn('max-w-xs rounded-lg p-3 lg:max-w-md', message.sender.id === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                            <p>{message.content}</p>
                                            {translatedMessages[message.id] && (
                                                 <div className="mt-2 border-t pt-2">
                                                    <p className="whitespace-pre-wrap text-sm italic">{translatedMessages[message.id]}</p>
                                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setTranslatedMessages(p => ({...p, [message.id]: ''}))}>
                                                        Show original
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                         <div className={cn("absolute bottom-1 opacity-0 transition-opacity group-hover:opacity-100", message.sender.id === currentUser?.id ? "left-0 -translate-x-full" : "right-0 translate-x-full")}>
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" disabled={translatingMessageId === message.id}>
                                                    {translatingMessageId === message.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    {availableLanguages.map(lang => (
                                                        <DropdownMenuItem key={lang} onClick={() => handleTranslate(message.id, message.content, lang)}>
                                                            {lang}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    {message.sender.id === currentUser?.id && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
                                            <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <div className="border-t p-4">
                        <form className="relative">
                            <Input placeholder="Type a message..." className="pr-20 rounded-full" />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-12 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full">
                                <Smile className="h-5 w-5" />
                            </Button>
                            <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
