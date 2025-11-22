
'use client';

import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PhoneOff, SkipForward, Video, VideoOff, Send, Mic, MicOff, Phone, PhoneIncoming } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChatBubbleManager } from '@/components/chat-bubble-manager';
import { Input } from '@/components/ui/input';
import { useChatBubbles } from '@/hooks/use-chat-bubbles';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useWebRTC } from '@/hooks/use-webrtc';
import { collection, onSnapshot, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function ConnectPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedUser, setConnectedUser] = useState<User | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ callId: string; from: User } | null>(null);
  
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const { addBubble } = useChatBubbles();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { startCall, joinCall, hangUp, localStream, remoteStream, isInCall, toggleMute, toggleVideo: toggleWebRTCVideo } = useWebRTC(localVideoRef, remoteVideoRef, currentUser?.uid);

  const callsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'calls') : null, [firestore]);
  const usersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);

  useEffect(() => {
    if (!currentUser || !callsCollection) return;

    const q = query(callsCollection, where("calleeId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
                const callData = change.doc.data();
                // Ensure it's a new call we haven't processed and it has an offer
                if (callData.offer && !callData.answer) {
                    const userSnap = await getDoc(doc(firestore, 'users', callData.offer.uid));
                    if(userSnap.exists()){
                        setIncomingCall({ callId: change.doc.id, from: userSnap.data() as User });
                    }
                }
            }
        });
    });

    return () => unsubscribe();

  }, [currentUser, callsCollection, firestore]);


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
    if (!usersCollection || !currentUser) return;
    setIsConnecting(true);

    try {
        await hangUp(); // Hang up any previous call before starting a new one
        setConnectedUser(null);

        const usersSnapshot = await getDocs(usersCollection);
        const allUsers = usersSnapshot.docs
            .map(doc => doc.data() as User)
            .filter(u => u.id !== currentUser.uid);

        if (allUsers.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No one to call',
                description: 'There are no other users available to call right now.',
            });
            setIsConnecting(false);
            return;
        }

        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        
        await startCall(randomUser.id);
        setConnectedUser(randomUser);

        toast({
            title: 'Calling...',
            description: `Calling ${randomUser.firstName}.`,
        });

    } catch (error) {
        console.error("Error starting call:", error);
        toast({
            variant: 'destructive',
            title: 'Could not start call',
            description: 'There was an issue finding a user to connect with.',
        });
    } finally {
        setIsConnecting(false);
    }
  }
  
  const handleAnswerCall = async () => {
    if(incomingCall){
        await joinCall(incomingCall.callId);
        setConnectedUser(incomingCall.from);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !currentUser || !firestore) return;
    
    const currentUserSnap = await getDoc(doc(firestore, 'users', currentUser.uid));
    if (!currentUserSnap.exists()) return;
    const currentUserData = currentUserSnap.data() as User;


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
                            {connectedUser.firstName}
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
