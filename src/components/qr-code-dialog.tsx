
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type User } from '@/lib/data';
import QRCode from "react-qr-code";
import { useEffect, useState } from 'react';


interface QrCodeDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrCodeDialog({
  user,
  open,
  onOpenChange,
}: QrCodeDialogProps) {
  const [profileUrl, setProfileUrl] = useState('');

  useEffect(() => {
    // Ensure this runs only on the client where window is defined
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/profile/${user.id}`;
      setProfileUrl(url);
    }
  }, [user.id]);
  
  if (!profileUrl) {
    return null; // Or a loading spinner
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>My QR Code</DialogTitle>
          <DialogDescription>
            Share this code to let others find your profile instantly.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-white p-4 rounded-lg flex items-center justify-center">
            <QRCode value={profileUrl} size={256} />
        </div>
        <p className='text-center text-muted-foreground text-sm'>
            Scan this with the app camera to visit {user.name}'s profile.
        </p>
      </DialogContent>
    </Dialog>
  );
}
