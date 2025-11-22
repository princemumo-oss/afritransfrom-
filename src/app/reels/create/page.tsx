'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Video, Upload, Send, Loader2, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const reelSchema = z.object({
  caption: z.string().max(2200, 'Caption is too long').optional(),
});

type ReelFormValues = z.infer<typeof reelSchema>;

function CreateReelPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'upload'; // 'upload' or 'camera'

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [step, setStep] = useState(1); // 1: Capture/Upload, 2: Edit/Publish
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ReelFormValues>({
    resolver: zodResolver(reelSchema),
    defaultValues: {
      caption: '',
    },
  });

  // Camera Logic
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (mode === 'camera' && step === 1) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaRecorderRef.current = new MediaRecorder(stream);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access camera.' });
      router.push('/reels');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
      const chunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setMedia({ url, type: 'video' });
        setStep(2);
        stopCamera();
      };
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      const url = URL.createObjectURL(file);
      // For this demo, we use blob URLs. In a real app, you'd upload to cloud storage.
      setMedia({ url, type });
      setStep(2);
    }
  };

  const handlePublish = async (data: ReelFormValues) => {
    if (!media || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'No media or user found.' });
      return;
    }
    setIsSubmitting(true);

    try {
        // In a real app, upload blob to Firebase Storage and get a permanent URL.
        // For this demo, this will only work temporarily in the browser session.
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const storyData = {
            authorId: user.uid,
            mediaUrl: media.url, // Placeholder: Use the blob URL directly
            mediaType: media.type,
            caption: data.caption,
            createdAt: serverTimestamp(),
            expiresAt: expiresAt,
        };

        await addDocumentNonBlocking(collection(firestore, 'stories'), storyData);

        toast({ title: 'Reel Published!', description: 'Your reel is now live.' });
        router.push('/reels');
    } catch (error) {
        console.error('Error publishing reel:', error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not publish your reel.' });
        setIsSubmitting(false);
    }
  };
  
  const resetFlow = () => {
    setMedia(null);
    setStep(1);
    form.reset();
  }

  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-lg gap-6">
        <div className="relative">
            <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2" onClick={() => step === 1 ? router.back() : setStep(1)}>
                <ArrowLeft />
            </Button>
            <h1 className="text-center text-2xl font-bold">
                {step === 1 ? 'Create Reel' : 'Edit & Post'}
            </h1>
        </div>
        
        {step === 1 && (
            <Card>
                {mode === 'camera' ? (
                    <CardContent className="p-4">
                        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                            <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                        </div>
                        <Button className="w-full mt-4" onClick={isRecording ? handleStopRecording : handleStartRecording}>
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </Button>
                    </CardContent>
                ) : (
                    <CardContent className="p-4 flex flex-col items-center justify-center h-64 border-dashed border-2 rounded-lg">
                        <Upload className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 font-semibold">Upload a video or photo</h3>
                        <p className="text-sm text-muted-foreground">Select a file from your device to share.</p>
                        <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>Select File</Button>
                        <input type="file" ref={fileInputRef} accept="video/*,image/*" onChange={handleFileChange} className="hidden" />
                    </CardContent>
                )}
            </Card>
        )}

        {step === 2 && media && (
            <Card>
                <CardHeader>
                    <CardTitle>Add Details</CardTitle>
                    <CardDescription>Add a caption and post your reel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                             {media.type === 'image' ? (
                                <img src={media.url} alt="Preview" className="rounded-lg object-cover aspect-[9/16]" />
                            ) : (
                                <video src={media.url} muted loop className="rounded-lg object-cover aspect-[9/16]" />
                            )}
                        </div>
                        <form id="reel-form" onSubmit={form.handleSubmit(handlePublish)} className="col-span-2">
                             <Textarea
                                placeholder="Write a caption..."
                                {...form.register('caption')}
                                className="min-h-32"
                            />
                        </form>
                    </div>
                    <div className="flex justify-between">
                         <Button variant="outline" onClick={resetFlow} disabled={isSubmitting}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Start Over
                        </Button>
                        <Button type="submit" form="reel-form" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Post
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
    </MainLayout>
  );
}


export default function CreateReelPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateReelPageContent />
        </Suspense>
    )
}
