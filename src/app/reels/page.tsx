
'use client';

import { MainLayout } from '@/components/main-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HardHat } from 'lucide-react';

export default function ReelsPage() {
  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Alert className="max-w-md">
          <HardHat className="h-4 w-4" />
          <AlertTitle>Under Maintenance</AlertTitle>
          <AlertDescription>
            The Reels feature is currently being worked on. Please check back later!
          </AlertDescription>
        </Alert>
      </div>
    </MainLayout>
  );
}
