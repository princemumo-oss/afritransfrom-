'use client';

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const showcasedWebsites = [
  {
    name: 'Arise Africa Initiative',
    description: 'Follow the President of Arise Africa, Bishop John Munyasya Kimanzi, for updates, teachings, and guidance on how to join the movement.',
    logoUrl: '/arise-africa-logo.png',
    href: 'https://www.facebook.com/johnmunyasyakimanzi',
    cta: 'Follow on Facebook',
  },
  // Add more websites here in the future
];

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
          {showcasedWebsites.map((site) => (
            <Card key={site.name} className="flex flex-col">
              <CardHeader className="items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Image src={site.logoUrl} alt={`${site.name} logo`} width={64} height={64} className="rounded-full" />
                </div>
                <CardTitle>{site.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 text-center">
                <CardDescription>{site.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={site.href} target="_blank" rel="noopener noreferrer">
                    {site.cta} <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
