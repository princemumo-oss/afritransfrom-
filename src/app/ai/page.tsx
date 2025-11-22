
'use client';

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Image, Languages } from 'lucide-react';
import Link from 'next/link';

const aiTools = [
  {
    icon: Languages,
    title: 'Text Translation',
    description: 'Break down language barriers by translating posts and messages into your native language.',
    href: '/messages',
    cta: 'Try in Messages'
  },
  {
    icon: Bot,
    title: 'Content Moderation',
    description: 'Our AI automatically helps filter content to keep the community safe and positive.',
    href: '/',
    cta: 'See in Feed'
  },
   {
    icon: Image,
    title: 'Hashtag Suggestions',
    description: 'Get relevant hashtag suggestions when you create a post to increase its discoverability.',
    href: '/',
    cta: 'Try in a New Post'
  },
];

export default function AiToolsPage() {
  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">AI Tools</h1>
          <p className="text-muted-foreground">
            Explore the smart features that power your experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aiTools.map((tool) => (
            <Card key={tool.title} className="flex flex-col">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <tool.icon className="h-6 w-6" />
                </div>
                <CardTitle className="pt-4">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={tool.href}>
                    {tool.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
