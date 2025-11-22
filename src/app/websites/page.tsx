
'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle, Loader2, Search, Bell, BellOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Initiative, User } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

function InitiativeCard({ initiative, currentUser }: { initiative: Initiative; currentUser: User | null }) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    useEffect(() => {
        if (currentUser?.subscriptions?.includes(initiative.id)) {
            setIsSubscribed(true);
        } else {
            setIsSubscribed(false);
        }
    }, [currentUser, initiative.id]);

    const handleSubscribe = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser) {
            toast({ variant: 'destructive', title: 'You must be logged in to subscribe.' });
            return;
        }

        const userRef = doc(firestore, 'users', currentUser.id);
        const initiativeRef = doc(firestore, 'initiatives', initiative.id);

        if (isSubscribed) {
            // Unsubscribe
            updateDocumentNonBlocking(userRef, { subscriptions: arrayRemove(initiative.id) });
            updateDocumentNonBlocking(initiativeRef, { subscribers: arrayRemove(currentUser.id) });
            toast({ title: `Unsubscribed from ${initiative.name}` });
        } else {
            // Subscribe
            updateDocumentNonBlocking(userRef, { subscriptions: arrayUnion(initiative.id) });
            updateDocumentNonBlocking(initiativeRef, { subscribers: arrayUnion(currentUser.id) });
            toast({ title: `Subscribed to ${initiative.name}!` });
        }
        // The state will update via the useEffect listening to currentUser changes
    };
    
    return (
        <div className="group relative">
            <Card className="flex h-full flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                <CardHeader className="items-center text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <Image src={initiative.logoUrl} alt={`${initiative.name} logo`} width={64} height={64} className="rounded-full object-cover" />
                    </div>
                    <CardTitle>{initiative.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 text-center">
                    <CardDescription>{initiative.description}</CardDescription>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href={`/websites/${initiative.id}`}>
                            Explore Initiative <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
            <Button
                size="icon"
                variant={isSubscribed ? "default" : "outline"}
                className="absolute top-4 right-4 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleSubscribe}
                title={isSubscribed ? `Unsubscribe from ${initiative.name}` : `Subscribe to ${initiative.name}`}
            >
                {isSubscribed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </Button>
        </div>
    );
}


export default function WebsitesPage() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const [searchTerm, setSearchTerm] = useState('');

    // This is a simplified user fetch. In a real app with more user data, this would be in a layout or context.
    const userDocRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const {data: currentUser} = useDoc<User>(userDocRef);


    const initiativesQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'initiatives'), where('status', '==', 'approved')) : null,
        [firestore]
    );

    const { data: approvedInitiatives, isLoading } = useCollection<Initiative>(initiativesQuery);

    const filteredInitiatives = approvedInitiatives?.filter(initiative => 
        initiative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        initiative.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">Websites</h1>
          <p className="text-muted-foreground">
            Discover important initiatives and resources from our partners.
          </p>
           <div className="relative mx-auto max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search websites..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {isLoading ? (
            <Card className="md:col-span-2 flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </Card>
          ) : (
            filteredInitiatives?.map((site) => (
                <InitiativeCard key={site.id} initiative={site} currentUser={currentUser} />
            ))
          )}
            <Card className="flex flex-col border-dashed">
              <CardHeader className="items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                  <PlusCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <CardTitle>Feature Your Website</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 text-center">
                <CardDescription>Want to feature your organization, ministry, or project? Submit your website for review.</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/websites/submit">
                    Submit Website
                  </Link>
                </Button>
              </CardFooter>
            </Card>
        </div>
        {!isLoading && filteredInitiatives?.length === 0 && (
             <p className="text-center text-muted-foreground col-span-1 md:col-span-2">
                No websites found matching your search.
            </p>
        )}
      </div>
    </MainLayout>
  );
}
