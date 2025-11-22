'use client';

import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { conversations as initialConversations, users, type Message, type Conversation, type User } from '@/lib/data';
import { Send, Smile, Languages, Loader2, MoreHorizontal, Mic, Phone, PhoneOff, VideoOff, MicOff, Video, PhoneIncoming } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { translateText } from '@/ai/flows/translate-text';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { VoiceNotePlayer } from '@/components/voice-note-player';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useWebRTC } from '@/hooks/use-webrtc';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const availableLanguages = ['Español', 'French', 'German', 'Japanese', 'Mandarin', 'Swahili'];
const messageReactions = ['❤️', '😂', '😯', '😢', '😡', '👍'];
const emojiSet = ['😀', '😂', '😍', '🤔', '👋', '🎉', '🔥', '👍', '❤️', '🙏', '💯', '🤣'];


export default function MessagesPage() {
    const { user: firebaseUser } = useUser();
    const firestore = useFirestore();
    const currentUser = users.find(u => u.id === firebaseUser?.uid) || users.find(u => u.name === 'You');
    const [conversations, setConversations] = useState(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
    const [newMessage, setNewMessage] = useState('');

    const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
    const [translatingMessageId, setTranslatingMessageId] = useState<string | null>(null);
    const { toast } = useToast();

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingStartTimeRef = useRef<number | null>(null);

    // WebRTC state
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const { startCall, joinCall, hangUp, localStream, remoteStream, isInCall, toggleMute, toggleVideo } = useWebRTC(localVideoRef, remoteVideoRef, currentUser?.id);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{ callId: string; from: User } | null>(null);

    const callsCollection = useMemoFirebase(() => collection(firestore, 'calls'), [firestore]);

    useEffect(() => {
        if (!currentUser || !callsCollection) return;

        const q = query(callsCollection, where("answer", "==", null));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const callData = change.doc.data();
                    const offererId = callData.offer.uid;
                    // Check if the call is for the current user and not initiated by the current user
                    if (offererId !== currentUser.id) {
                       const participantInCall = conversations.some(c => c.participant.id === offererId);
                       if (participantInCall) {
                         const fromUser = users.find(u => u.id === offererId);
                         if (fromUser) {
                             setIncomingCall({ callId: change.doc.id, from: fromUser });
                         }
                       }
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [currentUser, callsCollection, conversations]);

     useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);
    
    const handleStartCall = async () => {
        if (!selectedConversation) return;
        await startCall(selectedConversation.participant.id);
        toast({
            title: 'Calling...',
            description: `Calling ${selectedConversation.participant.name}.`,
        });
    };
    
    const handleAnswerCall = async () => {
        if (incomingCall) {
            const conversationWithCaller = conversations.find(c => c.participant.id === incomingCall.from.id);
            if (conversationWithCaller) {
                setSelectedConversation(conversationWithCaller);
            }
            await joinCall(incomingCall.callId);
            setIncomingCall(null);
        }
    };
    
    const handleHangUp = () => {
        hangUp();
    };

    const toggleLocalMic = () => {
        const newMutedState = !isMicMuted;
        toggleMute(newMutedState);
        setIsMicMuted(newMutedState);
    };

    const toggleLocalVideo = () => {
        const newVideoState = !isVideoMuted;
        toggleVideo(newVideoState);
        setIsVideoMuted(newVideoState);
    };


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
        
        const updatedSelectedConvo = updatedConversations.find(c => c.id === selectedConversation.id);
        if (updatedSelectedConvo) {
            setSelectedConversation(updatedSelectedConvo);
        }
      };
    
    const sendMessage = (message: Omit<Message, 'id' | 'sender' | 'timestamp'>) => {
      if (!currentUser) return;

      const finalMessage: Message = {
          ...message,
          id: `m${Date.now()}`,
          sender: currentUser,
          timestamp: 'Just now'
      };

      const updatedConversations = conversations.map(convo => {
          if (convo.id === selectedConversation.id) {
              return {
                  ...convo,
                  messages: [...convo.messages, finalMessage],
                  lastMessage: finalMessage.audioUrl ? 'Voice Note' : finalMessage.content,
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
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        sendMessage({ content: newMessage });
    };

    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const duration = recordingStartTimeRef.current ? (Date.now() - recordingStartTimeRef.current) / 1000 : 0;
                
                sendMessage({
                    content: '',
                    audioUrl,
                    audioDuration: Math.round(duration)
                });
                
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current.start();
            recordingStartTimeRef.current = Date.now();
            setIsRecording(true);
            toast({ title: "Recording started..." });

        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast({
                variant: 'destructive',
                title: "Microphone Access Denied",
                description: "Please allow microphone access in your browser settings."
            });
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast({ title: "Recording stopped." });
        }
    };

    return (
        <MainLayout>
             {incomingCall && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                    <Card className="p-6 text-center">
                        <Avatar className="w-24 h-24 mx-auto mb-4">
                            <AvatarImage src={incomingCall.from.avatarUrl} />
                            <AvatarFallback>{incomingCall.from.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle>Incoming Call</CardTitle>
                        <CardDescription className="mb-6">{incomingCall.from.name} is calling...</CardDescription>
                        <div className="flex gap-4 justify-center">
                            <Button variant="destructive" onClick={() => setIncomingCall(null)}>Decline</Button>
                            <Button className="bg-green-500 hover:bg-green-600" onClick={handleAnswerCall}>Accept</Button>
                        </div>
                    </Card>
                </div>
            )}
            <div className="grid h-[calc(100vh-8rem)] w-full grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
                <Card className="flex-col md:flex hidden">
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
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
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
                        {!isInCall && (
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={handleStartCall}>
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleStartCall}>
                                    <Video className="h-5 w-5" />
                                </Button>
                             </div>
                        )}
                    </CardHeader>

                    {isInCall ? (
                        <CardContent className="flex-1 p-0 flex flex-col">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-border relative">
                                <div className="bg-background relative">
                                    <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
                                    <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded-md text-sm">You</div>
                                </div>
                                <div className="bg-background relative">
                                    <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
                                    <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded-md text-sm">{selectedConversation.participant.name}</div>
                                </div>
                            </div>
                             <CardFooter className="flex justify-center gap-4 p-4 border-t">
                                <Button size="lg" variant="outline" onClick={toggleLocalMic} className="rounded-full w-14 h-14">
                                    {isMicMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                                </Button>
                                <Button size="lg" variant="outline" onClick={toggleLocalVideo} className="rounded-full w-14 h-14">
                                    {isVideoMuted ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                                </Button>
                                <Button size="lg" variant="destructive" onClick={handleHangUp} className="rounded-full w-14 h-14">
                                    <PhoneOff className="h-6 w-6" />
                                </Button>
                            </CardFooter>
                        </CardContent>
                    ) : (
                    <>
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
                                            {message.audioUrl ? (
                                                    <VoiceNotePlayer src={message.audioUrl} duration={message.audioDuration ?? 0} />
                                            ) : (
                                                    <p>{message.content}</p>
                                            )}
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
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground" disabled={translatingMessageId === message.id || !!message.audioUrl}>
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
                            {isRecording ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-red-500">
                                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                                        <span>Recording...</span>
                                    </div>
                                    <Button onClick={stopRecording}>Stop</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="relative">
                                    <Input
                                        placeholder="Type a message..."
                                        className="pr-20 rounded-full"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    {newMessage.trim() === '' ? (
                                        <Button type="button" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" onClick={startRecording}>
                                            <Mic className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                    <>
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
                                    </>
                                    )}
                                </form>
                            )}
                        </div>
                    </>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
}
