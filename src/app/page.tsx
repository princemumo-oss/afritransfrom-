import { MainLayout } from '@/components/main-layout';
import CreatePost from '@/components/create-post';
import PostCard from '@/components/post-card';
import { posts } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-2xl gap-6">
        <CreatePost />
        <Separator />
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
