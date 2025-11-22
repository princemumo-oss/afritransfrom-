
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { posts } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const categories = ['For You', 'Trending', 'Travel', 'Food', 'Nature', 'Art'];
const exploreImages = PlaceHolderImages.filter(img => img.id.startsWith('post-'));

// Create a map from imageUrl to post for quick lookup
const postByImageUrl = new Map(posts.map(p => [p.mediaUrl, p]));


export default function ExplorePage() {
  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-7xl gap-6">
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
              <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5">
                {exploreImages
                  // Shuffle images for each category to make it look different
                  .sort(() => 0.5 - Math.random())
                  .map((item, index) => {
                    const post = postByImageUrl.get(item.imageUrl);
                    return (
                        <div
                          key={`${category}-${index}`}
                          className="group relative mb-4 block break-inside-avoid overflow-hidden rounded-lg"
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.description}
                            width={500}
                            height={item.height}
                            className="w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={item.imageHint}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                             {post && (
                                <Link href={`/profile/${post.author.id}`} className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8 border-2 border-white">
                                            <AvatarImage src={post.author.avatarUrl} />
                                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <p className="font-semibold">{post.author.name}</p>
                                    </div>
                                    <p className="mt-2 text-sm line-clamp-2">{post.content}</p>
                                </Link>
                             )}
                          </div>
                        </div>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
