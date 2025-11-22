
'use client';

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const aiPersonas = [
  {
    name: 'JANET',
    description: 'A sarcastic, meta, and slightly mischievous AI companion. She knows she\'s an AI but doesn\'t take herself too seriously.',
    icon: <Bot className="h-8 w-8 text-purple-500" />,
    href: '/chatbot/janet',
    cta: 'Talk to JANET',
  },
  {
    name: 'Prince',
    description: 'A helpful and knowledgeable assistant. Prince is professional, clear, and provides supportive guidance.',
    icon: <MessageCircle className="h-8 w-8 text-blue-500" />,
    href: '/chatbot/prince',
    cta: 'Ask Prince',
  },
];

export default function ChatbotHubPage() {
  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">AI Companions</h1>
          <p className="text-muted-foreground">
            Choose an AI to talk with. Each has a unique personality.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {aiPersonas.map((persona) => (
            <Card key={persona.name} className="flex flex-col">
              <CardHeader className="items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {persona.icon}
                </div>
                <CardTitle>{persona.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 text-center">
                <CardDescription>{persona.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={persona.href}>
                    {persona.cta} <ArrowRight className="ml-2 h-4 w-4" />
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
