

'use client';

import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Message, type Conversation, type User } from '@/lib/data';
import { Send, Smile, Languages, Loader2, MoreHorizontal, Mic, Phone, PhoneOff, VideoOff, MicOff, Video, PhoneIncoming, Plus, Flame, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { translateText } from '@/ai/flows/translate-text';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { VoiceNotePlayer } from '@/components/voice-note-player';
import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { useWebRTC } from '@/hooks/use-webrtc';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, doc, getDoc, orderBy, updateDoc, Timestamp } from 'firebase/firestore';
import { NewChatDialog } from '@/components/new-chat-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { isSameDay, isYesterday, subDays } from 'date-fns';

const availableLanguages = ['Español', 'French', 'German', 'Japanese', 'Mandarin', 'Swahili'];
const messageReactions = ['❤️', '😂', '😯', '😢', '😡', '👍'];
const emojiSet = ['😀', '😂', '😍', '🤔', '👋', '🎉', '🔥', '👍', '❤️', '🙏', '💯', '🤣'];


export default function MessagesPage() {
    const { user: firebaseUser } = useUser();
    const firestore = useFirestore();
    
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
    const [translatingMessageId, setTranslatingMessageId] = useState<string | null>(null);
    const { toast } = useToast();

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingStartTimeRef = useRef<number | null>(null);
    
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    // WebRTC state
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const { startCall, joinCall, hangUp, localStream, remoteStream, isInCall, toggleMute, toggleVideo } = useWebRTC(localVideoRef, remoteVideoRef, firebaseUser?.uid);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{ callId: string; from: User } | null>(null);
    
    const currentUserProfileQuery = useMemoFirebase(() => firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null, [firestore, firebaseUser]);
    const {data: currentUser} = useDoc<User>(currentUserProfileQuery);

    const callsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'calls') : null, [firestore]);

     // Fetch conversations for the current user
    const conversationsQuery = useMemoFirebase(() => 
        firebaseUser ? query(collection(firestore, 'chats'), where('members', 'array-contains', firebaseUser.uid)) : null,
        [firestore, firebaseUser]
    );

    // This is a separate effect to listen to real-time updates for conversations
    useEffect(() => {
        if (!conversationsQuery || !firebaseUser) return;
    
        const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
            const convos = await Promise.all(
                snapshot.docs.map(async (convoDoc) => {
                    const convoData = convoDoc.data();
                    const participantId = convoData.members.find((id: string) => id !== firebaseUser.uid);
                    if (!participantId) return null;
                    const userRef = doc(firestore, 'users', participantId);
                    const userSnap = await getDoc(userRef);
                    return { id: convoDoc.id, ...convoData, participant: userSnap.data() };
                })
            );
            const validConvos = convos.filter(Boolean);
            setConversations(validConvos);

            // Update selected conversation with new data
             if (selectedConversation) {
                const updatedSelected = validConvos.find(c => c.id === selectedConversation.id);
                if (updatedSelected) {
                    setSelectedConversation(updatedSelected);
                }
            } else if (validConvos.length > 0) {
                 setSelectedConversation(validConvos[0]);
            }
        });
    
        return () => unsubscribe();
    }, [conversationsQuery, firebaseUser, firestore, selectedConversation]);


    // Fetch messages for the selected conversation
    const messagesQuery = useMemoFirebase(() => 
        selectedConversation ? query(collection(firestore, 'chats', selectedConversation.id, 'messages'), orderBy('createdAt', 'asc')) : null,
        [selectedConversation, firestore]
    );
    const { data: messages, isLoading: isLoadingMessages } = useCollection(messagesQuery);

    // Listen for typing status
    useEffect(() => {
        if (!selectedConversation || !firebaseUser) return;
        const chatDocRef = doc(firestore, 'chats', selectedConversation.id);
        
        const unsub = onSnapshot(chatDocRef, (doc) => {
            const data = doc.data();
            if (data?.typing) {
                const otherUserId = selectedConversation.participant.id;
                setIsTyping(data.typing[otherUserId] || false);
            }
        });
        
        return () => unsub();
    }, [selectedConversation, firebaseUser, firestore]);


    useEffect(() => {
        if (!currentUser || !callsCollection) return;

        const q = query(callsCollection, where('calleeId', '==', currentUser.id), where("answer", "==", null));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            for (const change of snapshot.docChanges()) {
                if (change.type === "added") {
                    const callData = change.doc.data();
                    const offererId = callData.offer.uid;
                    
                    const userRef = doc(firestore, 'users', offererId);
                    const userSnap = await getDoc(userRef);
                    const fromUser = userSnap.data() as User;
                    if (fromUser) {
                        setIncomingCall({ callId: change.doc.id, from: fromUser });
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [currentUser, callsCollection, firestore]);

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
    
    const handleStartCall = async (callType: 'video' | 'audio') => {
        if (!selectedConversation) return;
        // For simplicity, both start a video call. User can disable camera.
        await startCall(selectedConversation.participant.id);
        toast({
            title: 'Calling...',
            description: `Calling ${selectedConversation.participant.firstName}.`,
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
        if (!selectedConversation) return;
        const messageRef = doc(firestore, 'chats', selectedConversation.id, 'messages', messageId);
        updateDoc(messageRef, { reaction });
      };
    
      const sendMessage = async (message: { content?: string, audioUrl?: string, audioDuration?: number }) => {
        if (!firebaseUser || !selectedConversation) return;
  
        const now = new Date();
        const chatRef = doc(firestore, 'chats', selectedConversation.id);
        const messagesCol = collection(chatRef, 'messages');
        
        // Streak logic
        let newStreak = 1;
        const lastTimestamp = selectedConversation.streak?.lastMessageTimestamp?.toDate();
        
        if (lastTimestamp) {
            if (isYesterday(lastTimestamp)) {
                newStreak = (selectedConversation.streak?.count || 0) + 1;
            } else if (isSameDay(lastTimestamp, now)) {
                newStreak = selectedConversation.streak?.count || 1;
            }
        }
  
        // Update chat document with new streak and last message info
        await updateDoc(chatRef, {
            lastMessage: message.content ? message.content : 'Voice Message',
            lastMessageTimestamp: serverTimestamp(),
            streak: {
                count: newStreak,
                lastMessageTimestamp: serverTimestamp()
            }
        });
  
        await addDoc(messagesCol, {
            ...message,
            senderId: firebaseUser.uid,
            createdAt: serverTimestamp()
        });
  
        setNewMessage('');
        handleTyping(false);
      }
    
    const handleTyping = (isTyping: boolean) => {
        if (!selectedConversation || !firebaseUser) return;
        const chatDocRef = doc(firestore, 'chats', selectedConversation.id);
        updateDoc(chatDocRef, {
            [`typing.${firebaseUser.uid}`]: isTyping
        });
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        } else {
             handleTyping(true);
        }

        typingTimeoutRef.current = setTimeout(() => {
            handleTyping(false);
            typingTimeoutRef.current = null;
        }, 3000); // 3 seconds of inactivity
    };


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        sendMessage({ content: newMessage });
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
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
                
                // Here you would upload the blob to Firebase Storage and get a URL
                // For now, we'll use the local blob URL which will only work on this client
                sendMessage({
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

    const filteredConversations = conversations.filter(convo => {
        const participantName = `${convo.participant.firstName} ${convo.participant.lastName}`.toLowerCase();
        return participantName.includes(searchTerm.toLowerCase());
    });

    if (!currentUser) {
        return <MainLayout><div className="flex items-center justify-center h-full">Loading...</div></MainLayout>
    }

    return (
        <MainLayout>
             {incomingCall && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                    <Card className="p-6 text-center">
                        <Avatar className="w-24 h-24 mx-auto mb-4">
                            <AvatarImage src={incomingCall.from.avatarUrl} />
                            <AvatarFallback>{incomingCall.from.firstName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle>Incoming Call</CardTitle>
                        <CardDescription className="mb-6">{incomingCall.from.firstName} is calling...</CardDescription>
                        <div className="flex gap-4 justify-center">
                            <Button variant="destructive" onClick={() => setIncomingCall(null)}>Decline</Button>
                            <Button className="bg-green-500 hover:bg-green-600" onClick={handleAnswerCall}>Accept</Button>
                        </div>
                    </Card>
                </div>
            )}
             <NewChatDialog
                open={isNewChatOpen}
                onOpenChange={setIsNewChatOpen}
                onConversationSelect={setSelectedConversation}
            />
            <div className="grid h-[calc(100vh-8rem)] w-full grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
                <Card className="hidden flex-col md:flex">
                    <CardHeader className="flex flex-col gap-4">
                        <div className="flex flex-row items-center justify-between">
                            <CardTitle>Messages</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsNewChatOpen(true)}>
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search conversations..." 
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-full">
                            <div className="flex flex-col gap-1 p-2">
                                {isLoadingMessages && <p className="text-center text-muted-foreground p-4">Loading...</p>}
                                {filteredConversations.map(convo => (
                                    <button
                                        key={convo.id}
                                        onClick={() => setSelectedConversation(convo)}
                                        className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-accent', selectedConversation?.id === convo.id ? 'bg-accent text-accent-foreground' : '')}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={convo.participant.avatarUrl} alt={convo.participant.firstName} />
                                                <AvatarFallback>{convo.participant.firstName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                             {convo.participant.onlineStatus === 'online' && (
                                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 truncate">
                                            <div className="font-semibold">{convo.participant.firstName} {convo.participant.lastName}</div>
                                            <div className="text-sm text-muted-foreground">{convo.lastMessage}</div>
                                        </div>
                                        <div className="flex flex-col items-end text-xs text-muted-foreground">
                                            <span>{convo.lastMessageTimestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {convo.streak?.count > 0 && (
                                                <div className="flex items-center gap-1 text-orange-500">
                                                    <span>{convo.streak.count}</span>
                                                    <Flame className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {selectedConversation ? (
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                         <div className="flex items-center gap-3">
                             <div className="relative">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedConversation.participant.avatarUrl} alt={selectedConversation.participant.firstName} />
                                    <AvatarFallback>{selectedConversation.participant.firstName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                 {selectedConversation.participant.onlineStatus === 'online' && (
                                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
                                )}
                            </div>
                            <div className="font-semibold">{selectedConversation.participant.firstName} {selectedConversation.participant.lastName}</div>
                        </div>
                        {!isInCall && (
                             <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleStartCall('audio')}>
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleStartCall('video')}>
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
                                    <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded-md text-sm">{selectedConversation.participant.firstName}</div>
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
                            <ScrollArea className="h-full">
                            <div className="space-y-6">
                                {isLoadingMessages && <p className='text-center text-muted-foreground'>Loading messages...</p>}
                                {messages?.map(message => (
                                    <div key={message.id} className={cn('group relative flex items-start gap-3', message.senderId === currentUser?.id ? 'justify-end' : '')}>
                                        {message.senderId !== currentUser?.id && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={selectedConversation.participant.avatarUrl} alt={selectedConversation.participant.firstName} />
                                                <AvatarFallback>{selectedConversation.participant.firstName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className="relative">
                                            <div className={cn('max-w-xs rounded-lg p-3 lg:max-w-md', message.senderId === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
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
                                            <div className={cn("absolute bottom-1 opacity-0 transition-opacity group-hover:opacity-100", message.senderId === currentUser?.id ? "left-0 -translate-x-full" : "right-0 translate-x-full")}>
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
                                        {message.senderId === currentUser?.id && currentUser &&(
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.firstName} />
                                                <AvatarFallback>{currentUser.firstName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                                <AnimatePresence>
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex items-center gap-3"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={selectedConversation.participant.avatarUrl} alt={selectedConversation.participant.firstName} />
                                            <AvatarFallback>{selectedConversation.participant.firstName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
                                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></span>
                                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></span>
                                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"></span>
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                            </ScrollArea>
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
                                        onChange={onInputChange}
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
                ) : (
                    <Card className="flex items-center justify-center">
                        <p className="text-muted-foreground">Select a conversation to start messaging.</p>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}

    

    


