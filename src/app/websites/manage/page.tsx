
'use client';

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HardHat } from 'lucide-react';

export default function ManageWebsitesPage() {
  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Manage Your Websites</h1>
          <p className="text-muted-foreground">
            Here you can post updates, add events, and manage your approved websites.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <HardHat className="h-16 w-16 text-muted-foreground mb-4" />
            <CardHeader>
                <CardTitle>Under Construction</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                This management page is currently being built. Soon you'll be able to manage all your website content from here.
                </CardDescription>
            </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
