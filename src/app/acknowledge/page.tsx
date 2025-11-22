
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Globe, Target, BookOpen, Users, Handshake, ExternalLink } from 'lucide-react';

export default function AcknowledgePage() {
  const router = useRouter();

  const handleProceed = () => {
    router.replace('/'); // Use replace so user can't go back to this page
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to the Arise Africa Initiative</CardTitle>
          <CardDescription className="text-lg">
            Before you begin, please take a moment to understand the vision that powers this platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">✨ The Birth of the Vision</h3>
            <p className="text-muted-foreground">
              On 6th November 2006, Bishop John Munyasya Kimanzi preached in Yuma, Arizona. Later that week, on 7th November in Atlanta, Georgia, he had a life-changing dream during the burial of Archbishop Benson Idahosa. A voice cried out, “A son of Africa has rested! A seed has been buried and it will no longer remain alone!”
            </p>
            <p className="text-muted-foreground">
              The Holy Spirit led him to Joshua 1:2: “Moses my servant is dead, NOW therefore arise, go over this Jordan….” The message was clear: “My servant Archbishop Idahosa has rested, arise therefore my son and go to Africa to raise the second generation.” After ten years of intensive training, in October 2017, the Arise Africa Movement was launched.
            </p>
          </div>

          <div className="space-y-4">
             <h3 className="text-xl font-semibold">🌟 Vision & Mission</h3>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">Vision</h4>
                <p className="text-muted-foreground">To raise a new generation of African leaders, rooted in faith, empowered by the Holy Spirit, and committed to transforming Africa spiritually, socially, and globally.</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-semibold">Motto</h4>
                    <p className="text-muted-foreground">“Arise, Africa — for the glory of God and the blessing of the world.”</p>
                </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">📖 Core Principles</h3>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                <li><span className="font-semibold">Faithfulness:</span> Anchored in God’s Word and Spirit.</li>
                <li><span className="font-semibold">Leadership:</span> Equipping a second generation of African leaders.</li>
                <li><span className="font-semibold">Unity:</span> Building bridges across nations and denominations.</li>
                <li><span className="font-semibold">Transformation:</span> Empowering Africa to rise in influence and impact.</li>
                <li><span className="font-semibold">Global Mission:</span> Extending Africa’s voice and grace to the world.</li>
            </ul>
          </div>
          
           <div className="space-y-4 rounded-lg border bg-background p-4">
             <h3 className="text-xl font-semibold flex items-center gap-2"><Handshake /> Join the Movement</h3>
             <p className="text-muted-foreground">
              Today, Arise Africa has reached more than 10 African nations and is expanding globally. Ministers from Kenya, Nigeria, Botswana, Ghana, and beyond are part of this dream. Arise Africa is a call to action. Partners, leaders, and believers are invited to join hands in this God-given mission.
            </p>
             <a 
                href="https://www.facebook.com/johnmunyasyakimanzi" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Follow Bishop John Munyasya Kimanzi on Facebook <ExternalLink className="h-4 w-4" />
            </a>
          </div>

        </CardContent>
        <CardFooter className="flex-col gap-4">
            <p className="text-sm font-semibold text-muted-foreground">“From Africa to the nations — the vision lives on.”</p>
          <Button size="lg" className="w-full" onClick={handleProceed}>
            Acknowledge & Proceed to Feed
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    