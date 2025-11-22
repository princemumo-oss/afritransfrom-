
'use client';

import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PhoneOff, SkipForward, Video, VideoOff, Send, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { users } from '@/lib/data';
import type { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChatBubbleManager } from '@/components/chat-bubble-manager';
import { Input } from '@/components/ui/input';
import { useChatBubbles } from '@/hooks/use-chat-bubbles';


export default function ConnectPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedUser, setConnectedUser] = useState<User | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);


  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { addBubble } = useChatBubbles();
  const currentUser = users.find(u => u.name === 'You');

  useEffect(() => {
    // Clean up streams on component unmount
    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getCameraPermission = async () => {
    if (hasCameraPermission) {
      startConnection();
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasCameraPermission(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      startConnection();
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera and microphone permissions in your browser settings.',
      });
    }
  };

  const startConnection = () => {
    setIsConnecting(true);
    setCallActive(false);

    // Simulate finding a random user
    setTimeout(() => {
      const availableUsers = users.filter(u => u.name !== 'You');
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      setConnectedUser(randomUser);
      setIsConnecting(false);
      setCallActive(true);
      toast({
        title: 'Connected!',
        description: `You are now talking to ${randomUser.name}.`,
      });
    }, 2000);
  };
  
  const endCall = () => {
      setCallActive(false);
      setConnectedUser(null);
      // In a real app, you would also stop the remote stream
  }

  const toggleMic = () => {
      if (localVideoRef.current?.srcObject) {
          const stream = localVideoRef.current.srcObject as MediaStream;
          stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
          setIsMicMuted(!isMicMuted);
      }
  }
  
  const toggleVideo = () => {
      if (localVideoRef.current?.srcObject) {
          const stream = localVideoRef.current.srcObject as MediaStream;
          stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
          setIsVideoMuted(!isVideoMuted);
      }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !currentUser) return;
    
    // In a real app, this would send the message over a WebSocket or WebRTC data channel.
    // For this simulation, we'll just add it to the local user's screen.
    // To make it look like the other person is replying, we can alternate who the bubble is from.
    addBubble({
        user: currentUser,
        text: chatMessage
    });
    
    // Simulate a reply from the connected user
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
                <video ref={localVideoRef} className={cn("h-full w-full object-cover", (!hasCameraPermission || isVideoMuted) && 'hidden')} autoPlay muted />
                {(!hasCameraPermission || isVideoMuted) && (
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
                 {callActive && connectedUser ? (
                    <>
                        {/* In a real app, this would be a remote stream */}
                        <video ref={remoteVideoRef} className="h-full w-full object-cover" autoPlay poster={connectedUser.avatarUrl} />
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
                 {!callActive && !isConnecting ? (
                 <Button size="lg" onClick={getCameraPermission} disabled={isConnecting}>
                    {isConnecting ? 'Connecting...' : 'Start Connecting'}
                </Button>
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
                    <Button size="lg" variant="secondary" onClick={startConnection} disabled={isConnecting} className="rounded-full w-14 h-14">
                        <SkipForward className="h-6 w-6" />
                        <span className="sr-only">Next</span>
                    </Button>
                    <Button size="lg" variant="destructive" onClick={endCall} className="rounded-full w-14 h-14">
                        <PhoneOff className="h-6 w-6" />
                        <span className="sr-only">End Call</span>
                    </Button>
                </>
              )}
              </div>

               {callActive && (
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
