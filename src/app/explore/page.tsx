
import Image from 'next/image';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const categories = ['For You', 'Trending', 'Travel', 'Food', 'Nature', 'Art'];
const exploreImages = PlaceHolderImages.filter(img => img.id.startsWith('post-'));

export default function ExplorePage() {
  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Explore</h1>
          <p className="text-muted-foreground">
            Discover new content and creators from around the world.
          </p>
        </div>

        <Tabs defaultValue="For You" className="w-full">
          <div className="flex justify-center">
            <TabsList>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {exploreImages
                  // Shuffle images for each category to make it look different
                  .sort(() => 0.5 - Math.random())
                  .map((item, index) => (
                    <Card
                      key={`${category}-${index}`}
                      className="group relative aspect-square overflow-hidden"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.description}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={item.imageHint}
                      />
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
