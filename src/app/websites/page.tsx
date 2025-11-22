
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Initiative } from '@/lib/data';
import { Input } from '@/components/ui/input';

export default function WebsitesPage() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');

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
                <Link href={`/websites/${site.id}`} key={site.id} className="group">
                    <Card className="flex h-full flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                    <CardHeader className="items-center text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <Image src={site.logoUrl} alt={`${site.name} logo`} width={64} height={64} className="rounded-full object-cover" />
                        </div>
                        <CardTitle>{site.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 text-center">
                        <CardDescription>{site.description}</CardDescription>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <div>
                             Explore Initiative <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </Button>
                    </CardFooter>
                    </Card>
                </Link>
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
