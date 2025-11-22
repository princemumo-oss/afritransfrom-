
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { conversations as initialConversations, users, type Message, type Conversation } from '@/lib/data';
import { Send, Smile, Languages, Loader2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { translateText } from '@/ai/flows/translate-text';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const availableLanguages = ['Español', 'French', 'German', 'Japanese', 'Mandarin', 'Swahili'];
const messageReactions = ['❤️', '😂', '😯', '😢', '😡', '👍'];
const emojiSet = ['😀', '😂', '😍', '🤔', '👋', '🎉', '🔥', '👍', '❤️', '🙏', '💯', '🤣'];


export default function MessagesPage() {
    const currentUser = users.find(u => u.name === 'You');
    const [conversations, setConversations] = useState(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
    const [newMessage, setNewMessage] = useState('');

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

      const handleReaction = (messageId: string, reaction: string) => {
        const updatedConversations = conversations.map(convo => {
          if (convo.id === selectedConversation.id) {
            const updatedMessages = convo.messages.map(msg => {
              if (msg.id === messageId) {
                // Toggle reaction
                const newReaction = msg.reaction === reaction ? undefined : reaction;
                return { ...msg, reaction: newReaction };
              }
              return msg;
            });
            return { ...convo, messages: updatedMessages };
          }
          return convo;
        });
        setConversations(updatedConversations);
        
        // Also update the selected conversation to reflect the change immediately
        const updatedSelectedConvo = updatedConversations.find(c => c.id === selectedConversation.id);
        if (updatedSelectedConvo) {
            setSelectedConversation(updatedSelectedConvo);
        }
      };
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const message: Message = {
            id: `m${Date.now()}`,
            sender: currentUser,
            content: newMessage,
            timestamp: 'Just now'
        };

        const updatedConversations = conversations.map(convo => {
            if (convo.id === selectedConversation.id) {
                return {
                    ...convo,
                    messages: [...convo.messages, message],
                    lastMessage: newMessage,
                    lastMessageTimestamp: 'Just now',
                };
            }
            return convo;
        });

        setConversations(updatedConversations);
        const updatedSelectedConvo = updatedConversations.find(c => c.id === selectedConversation.id);
        if (updatedSelectedConvo) {
            setSelectedConversation(updatedSelectedConvo);
        }
        setNewMessage('');
    };

    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
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
                                        onClick={() => setSelectedConversation(convo)}
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
                                            {message.reaction && (
                                                <div className="absolute -bottom-3 -right-3 rounded-full bg-background p-0.5 shadow-md">
                                                    <span className="text-sm">{message.reaction}</span>
                                                </div>
                                            )}
                                        </div>
                                         <div className={cn("absolute bottom-1 opacity-0 transition-opacity group-hover:opacity-100", message.sender.id === currentUser?.id ? "left-0 -translate-x-full" : "right-0 translate-x-full")}>
                                              <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground">
                                                        <Smile className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-fit p-1">
                                                    <div className="flex gap-1">
                                                        {messageReactions.map(reaction => (
                                                            <Button
                                                            key={reaction}
                                                            variant="ghost"
                                                            size="icon"
                                                            className={cn("rounded-full text-lg hover:bg-accent", message.reaction === reaction && "bg-accent scale-110")}
                                                            onClick={() => handleReaction(message.id, reaction)}
                                                            >
                                                            {reaction}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                             </Popover>
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground" disabled={translatingMessageId === message.id}>
                                                        {translatingMessageId === message.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <Languages className="mr-2 h-4 w-4" />
                                                            <span>Translate</span>
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                {availableLanguages.map(lang => (
                                                                    <DropdownMenuItem key={lang} onClick={() => handleTranslate(message.id, message.content, lang)}>
                                                                        {lang}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>
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
                        <form onSubmit={handleSendMessage} className="relative">
                            <Input
                                placeholder="Type a message..."
                                className="pr-20 rounded-full"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button type="button" variant="ghost" size="icon" className="absolute right-12 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full">
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-fit p-1">
                                    <div className="grid grid-cols-6 gap-1">
                                        {emojiSet.map(emoji => (
                                            <Button
                                                key={emoji}
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full text-lg"
                                                onClick={() => addEmoji(emoji)}
                                            >
                                                {emoji}
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" disabled={!newMessage.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
