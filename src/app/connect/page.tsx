
'use client';

import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PhoneOff, SkipForward, Video, VideoOff, Send, Mic, MicOff, Phone, PhoneIncoming } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { users } from '@/lib/data';
import type { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChatBubbleManager } from '@/components/chat-bubble-manager';
import { Input } from '@/components/ui/input';
import { useChatBubbles } from '@/hooks/use-chat-bubbles';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useWebRTC } from '@/hooks/use-webrtc';
import { collection, onSnapshot, query, where, getDocs, doc } from 'firebase/firestore';

export default function ConnectPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedUser, setConnectedUser] = useState<User | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ callId: string; from: string } | null>(null);
  
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const { addBubble } = useChatBubbles();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { startCall, joinCall, hangUp, localStream, remoteStream, isInCall, toggleMute, toggleVideo: toggleWebRTCVideo } = useWebRTC(localVideoRef, remoteVideoRef, currentUser?.uid);

  const callsCollection = useMemoFirebase(() => collection(firestore, 'calls'), [firestore]);

  useEffect(() => {
    if (!currentUser || !callsCollection) return;

    const q = query(callsCollection, where("answer", "==", null));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const callData = change.doc.data();
                if(callData.offer.uid !== currentUser.uid) {
                    setIncomingCall({ callId: change.doc.id, from: callData.offer.uid });
                }
            }
        });
    });

    return () => unsubscribe();

  }, [currentUser, callsCollection]);


  useEffect(() => {
    if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        setHasCameraPermission(true);
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  
  const handleStartCall = async () => {
    if (!callsCollection || !currentUser) return;
    setIsConnecting(true);
    const availableUsers = users.filter(u => u.id !== currentUser.uid);
    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    setConnectedUser(randomUser);

    await startCall(randomUser.id);
    setIsConnecting(false);
    toast({
        title: 'Calling...',
        description: `Calling ${randomUser.name}.`,
    });
  }
  
  const handleAnswerCall = async () => {
    if(incomingCall){
        await joinCall(incomingCall.callId);
        const caller = users.find(u => u.id === incomingCall.from);
        setConnectedUser(caller || null);
        setIncomingCall(null);
    }
  }

  const handleHangUp = () => {
    hangUp();
    setConnectedUser(null);
    setIncomingCall(null);
  };

  const toggleMic = () => {
      toggleMute(!isMicMuted);
      setIsMicMuted(!isMicMuted);
  }
  
  const toggleVideo = () => {
      toggleWebRTCVideo(!isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !currentUser) return;
    
    // In a real app, this would send the message over a WebSocket or WebRTC data channel.
    const currentUserData = users.find(u => u.id === currentUser.uid);
    if (!currentUserData) return;

    addBubble({
        user: currentUserData,
        text: chatMessage
    });
    
    if(connectedUser) {
        setTimeout(() => {
            addBubble({
                user: connectedUser,
                text: "I'm just a simulation, but that's cool!"
            })
        }, 1500);
    }
    
    setChatMessage('');
  }

  return (
    <MainLayout>
      <div className="relative mx-auto grid w-full max-w-4xl gap-6">
        <ChatBubbleManager />
        <div className="text-center">
          <h1 className="text-3xl font-bold">Connect</h1>
          <p className="text-muted-foreground">Talk to random people from across the platform.</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <video ref={localVideoRef} className={cn("h-full w-full object-cover", (!localStream || isVideoMuted) && 'hidden')} autoPlay muted />
                {(!localStream || isVideoMuted) && (
                  <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                    <VideoOff className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Your camera is off</p>
                  </div>
                )}
                 <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
                    You
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                 {isInCall && connectedUser ? (
                    <>
                        <video ref={remoteVideoRef} className="h-full w-full object-cover" autoPlay />
                         <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
                            {connectedUser.name}
                        </div>
                    </>
                ) : (
                     <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                        {isConnecting ? (
                            <>
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-dashed border-primary"></div>
                                <p className="mt-4 text-muted-foreground">Connecting...</p>
                            </>
                        ) : (
                           <>
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="/placeholder.svg" alt="Remote user" />
                                    <AvatarFallback>?</AvatarFallback>
                                </Avatar>
                                <p className="mt-4 text-muted-foreground">Waiting for a user...</p>
                           </>
                        )}
                    </div>
                )}
              </div>
            </div>
             {hasCameraPermission === false && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        To use Connect, you must allow access to your camera and microphone. Please enable permissions in your browser settings and then click "Start Connecting".
                    </AlertDescription>
                </Alert>
             )}
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="flex justify-center gap-4">
                 {!isInCall && !isConnecting ? (
                  <>
                    <Button size="lg" onClick={handleStartCall} disabled={isConnecting}>
                       <Phone className='mr-2' /> Call Random
                    </Button>
                    {incomingCall && (
                        <Button size="lg" onClick={handleAnswerCall} className="bg-green-500 hover:bg-green-600">
                          <PhoneIncoming className="mr-2" /> Answer Call
                        </Button>
                    )}
                  </>
              ) : (
                <>
                    <Button size="lg" variant="outline" onClick={toggleMic} className="rounded-full w-14 h-14">
                        {isMicMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        <span className="sr-only">{isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                    </Button>
                     <Button size="lg" variant="outline" onClick={toggleVideo} className="rounded-full w-14 h-14">
                        {isVideoMuted ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                        <span className="sr-only">{isVideoMuted ? 'Turn on Camera' : 'Turn off Camera'}</span>
                    </Button>
                    <Button size="lg" variant="secondary" onClick={handleStartCall} disabled={isConnecting} className="rounded-full w-14 h-14">
                        <SkipForward className="h-6 w-6" />
                        <span className="sr-only">Next</span>
                    </Button>
                    <Button size="lg" variant="destructive" onClick={handleHangUp} className="rounded-full w-14 h-14">
                        <PhoneOff className="h-6 w-6" />
                        <span className="sr-only">End Call</span>
                    </Button>
                </>
              )}
              </div>

               {isInCall && (
                  <form onSubmit={handleSendMessage} className="w-full max-w-lg flex gap-2">
                    <Input 
                        placeholder="Say something..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        className="rounded-full"
                    />
                    <Button type="submit" size="icon" className="rounded-full">
                        <Send className="h-5 w-5" />
                    </Button>
                  </form>
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

    