
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { CameraOff } from 'lucide-react';

interface QrScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (result: string) => void;
}

export function QrScannerDialog({
  open,
  onOpenChange,
  onScan,
}: QrScannerDialogProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
        if (!open) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
            }
            return;
        }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(cameraStream);
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use the scanner.',
        });
      }
    };

    getCameraPermission();

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }
  }, [open, toast]);

  useEffect(() => {
    let animationFrameId: number;

    const scanQrCode = () => {
        if (videoRef.current && canvasRef.current && hasCameraPermission && stream) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });

                if (code) {
                    onScan(code.data);
                    onOpenChange(false);
                    return; // Stop scanning once a code is found
                }
            }
        }
        animationFrameId = requestAnimationFrame(scanQrCode);
    };

    if (open && hasCameraPermission) {
      animationFrameId = requestAnimationFrame(scanQrCode);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [open, hasCameraPermission, onScan, onOpenChange, stream]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Point your camera at a user's QR code to visit their profile.
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            autoPlay
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <CameraOff className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Camera Access Denied</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Enable camera permissions in your browser to scan QR codes.
                </p>
            </div>
          )}
           <div className="absolute inset-0 border-[20px] border-black/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]">
                <div className="relative h-full w-full">
                    {/* Corners */}
                    <div className="absolute -top-5 -left-5 h-16 w-16 border-l-4 border-t-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute -top-5 -right-5 h-16 w-16 border-r-4 border-t-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute -bottom-5 -left-5 h-16 w-16 border-l-4 border-b-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute -bottom-5 -right-5 h-16 w-16 border-r-4 border-b-4 border-primary rounded-br-lg"></div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
