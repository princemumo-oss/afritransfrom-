'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { MainLayout } from '@/components/main-layout';
import { type Initiative, type User, type InitiativeMessage } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft, ShoppingCart, Loader2, Send, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { InitiativeEvent, Product } from '@/lib/data';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


function MediaGallery({ events }: { events: InitiativeEvent[] | undefined }) {
  if (!events || events.length === 0) {
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
             <DialogHeader>
                <DialogTitle className="sr-only">{event.title}</DialogTitle>
                <DialogDescription className="sr-only">{event.description}</DialogDescription>
            </DialogHeader>
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

function ProductGallery({ products }: { products: Product[] | undefined }) {
    if (!products || products.length === 0) {
        return <p className="text-center text-muted-foreground">No products available at this time.</p>;
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(product => (
                <Card key={product.id} className="flex flex-col">
                    <CardHeader className="p-0">
                        <div className="relative aspect-video overflow-hidden rounded-t-lg">
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-4">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center p-4 pt-0">
                        <p className="font-bold">{product.price}</p>
                        <Button asChild size="sm">
                            <a href={product.purchaseUrl} target="_blank" rel="noopener noreferrer">
                                <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
                            </a>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

function CommunityChat({ initiative, currentUser }: { initiative: Initiative; currentUser: User | null }) {
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState('');

    const messagesQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'initiatives', initiative.id, 'messages'), orderBy('createdAt', 'asc')) : null
    , [firestore, initiative.id]);
    
    const { data: messages, isLoading } = useCollection<InitiativeMessage>(messagesQuery);
    
    const isAllowedToChat = currentUser && (currentUser.id === initiative.submittedBy || initiative.subscribers?.includes(currentUser.id));

    if (!isAllowedToChat) {
        return (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Join the Conversation</h3>
                <p className="mt-2 text-sm text-muted-foreground">Subscribe to this website to participate in the community chat.</p>
            </Card>
        );
    }
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const messagesCol = collection(firestore, 'initiatives', initiative.id, 'messages');
        addDocumentNonBlocking(messagesCol, {
            senderId: currentUser.id,
            senderName: `${currentUser.firstName} ${currentUser.lastName}`,
            senderAvatarUrl: currentUser.avatarUrl,
            content: newMessage,
            createdAt: serverTimestamp(),
        });
        setNewMessage('');
    }

    return (
        <Card className="flex flex-col h-[60vh]">
            <CardContent className="flex-1 p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                         {isLoading && <div className="text-center text-muted-foreground">Loading messages...</div>}
                         {messages?.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-3", message.senderId === currentUser.id ? 'justify-end' : '')}>
                                {message.senderId !== currentUser.id && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={message.senderAvatarUrl} alt={message.senderName} />
                                        <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className="max-w-xs rounded-lg p-3 lg:max-w-md bg-muted">
                                    <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                                    <p>{message.content}</p>
                                </div>
                                {message.senderId === currentUser.id && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.firstName} />
                                        <AvatarFallback>{currentUser.firstName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {messages?.length === 0 && !isLoading && <div className="text-center text-muted-foreground">No messages yet. Start the conversation!</div>}
                    </div>
                </ScrollArea>
                <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="relative">
                        <Input
                            placeholder="Send a message to the community..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}


export default function InitiativeDetailPage() {
  const params = useParams();
  const initiativeId = params.id as string;
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const userDocRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: currentUser } = useDoc<User>(userDocRef);

  const initiativeDocRef = useMemoFirebase(() => 
    firestore && initiativeId ? doc(firestore, 'initiatives', initiativeId) : null,
    [firestore, initiativeId]
  );
  const { data: initiative, isLoading } = useDoc<Initiative>(initiativeDocRef);

  if (isLoading) {
    return (
        <MainLayout>
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        </MainLayout>
    );
  }

  if (!initiative) {
    return (
      <MainLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Website not found</h1>
          <p className="text-muted-foreground">The requested page could not be located.</p>
          <Button asChild className="mt-4">
            <Link href="/websites">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Websites
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
            <Link href="/websites">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Websites
            </Link>
        </Button>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col items-center gap-6 p-6 text-center md:flex-row md:text-left">
            <Image src={initiative.logoUrl} alt={`${initiative.name} logo`} width={96} height={96} className="flex-shrink-0 rounded-full object-cover" />
            <div className="space-y-1.5">
              <CardTitle className="text-3xl">{initiative.name}</CardTitle>
              <CardDescription>{initiative.description}</CardDescription>
            </div>
            {initiative.websiteUrl && (
                <div className="flex-shrink-0 md:ml-auto">
                    <Button asChild>
                        <a href={initiative.websiteUrl} target="_blank" rel="noopener noreferrer">
                            Visit Website <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="past-events">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="past-events">Past Events</TabsTrigger>
                <TabsTrigger value="upcoming-events">Upcoming Events</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="chat">Community Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="past-events" className="mt-4">
                <MediaGallery events={initiative.events?.past} />
              </TabsContent>
              <TabsContent value="upcoming-events" className="mt-4">
                <MediaGallery events={initiative.events?.upcoming} />
              </TabsContent>
              <TabsContent value="products" className="mt-4">
                <ProductGallery products={initiative.products || []} />
              </TabsContent>
              <TabsContent value="chat" className="mt-4">
                 <CommunityChat initiative={initiative} currentUser={currentUser} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

    