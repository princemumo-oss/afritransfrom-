
'use client';

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { showcasedInitiatives } from '@/lib/data';

export default function ShowcasePage() {
  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Showcase</h1>
          <p className="text-muted-foreground">
            Discover important initiatives and resources from our partners.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {showcasedInitiatives.map((site) => (
             <Link href={`/showcase/${site.id}`} key={site.id} className="group">
                <Card className="flex h-full flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                <CardHeader className="items-center text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Image src={site.logoUrl} alt={`${site.name} logo`} width={64} height={64} className="rounded-full" />
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
          ))}
            <Card className="flex flex-col border-dashed">
              <CardHeader className="items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                  <PlusCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <CardTitle>Showcase Your Initiative</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 text-center">
                <CardDescription>Want to feature your organization, ministry, or project? Contact us to learn more about partnership opportunities.</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="secondary">
                  <a href="mailto:showcase@afritransform.com">
                    Contact Us
                  </a>
                </Button>
              </CardFooter>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
