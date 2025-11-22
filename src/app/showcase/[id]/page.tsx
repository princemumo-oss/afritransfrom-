
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { MainLayout } from '@/components/main-layout';
import { showcasedInitiatives, type InitiativeEvent } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

function MediaGallery({ events }: { events: InitiativeEvent[] }) {
  if (events.length === 0) {
    return <p className="text-center text-muted-foreground">No events to display.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {events.map((event, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg">
              {event.type === 'image' ? (
                <Image src={event.url} alt={event.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <video src={event.url} className="h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-2">
                <p className="text-xs font-semibold text-white">{event.title}</p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-2">
             {event.type === 'image' ? (
                <Image src={event.url} alt={event.title} width={1920} height={1080} className="max-h-[80vh] w-full rounded-lg object-contain" />
              ) : (
                <video src={event.url} controls autoPlay className="max-h-[80vh] w-full rounded-lg" />
              )}
               <div className="p-4">
                  <h3 className="font-bold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

export default function InitiativeDetailPage() {
  const params = useParams();
  const initiative = showcasedInitiatives.find((site) => site.id === params.id);

  if (!initiative) {
    return (
      <MainLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Initiative not found</h1>
          <p className="text-muted-foreground">The requested page could not be located.</p>
          <Button asChild className="mt-4">
            <Link href="/showcase">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Showcase
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Button asChild variant="outline" size="sm">
            <Link href="/showcase">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Showcase
            </Link>
        </Button>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col items-center gap-6 p-6 text-center md:flex-row md:text-left">
            <Image src={initiative.logoUrl} alt={`${initiative.name} logo`} width={96} height={96} className="flex-shrink-0 rounded-full" />
            <div className="space-y-1.5">
              <CardTitle className="text-3xl">{initiative.name}</CardTitle>
              <CardDescription>{initiative.description}</CardDescription>
            </div>
            <div className="flex-shrink-0 md:ml-auto">
                <Button asChild>
                    <Link href={initiative.href} target="_blank" rel="noopener noreferrer">
                        {initiative.cta} <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="past-events">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="past-events">Past Events</TabsTrigger>
                <TabsTrigger value="upcoming-events">Upcoming Events</TabsTrigger>
              </TabsList>
              <TabsContent value="past-events" className="mt-4">
                <MediaGallery events={initiative.events.past} />
              </TabsContent>
              <TabsContent value="upcoming-events" className="mt-4">
                <MediaGallery events={initiative.events.upcoming} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
