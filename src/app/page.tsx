'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import CreatePost from '@/components/create-post';
import PostCard from '@/components/post-card';
import { posts as initialPosts, type Post } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { users } from '@/lib/data';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleAddPost = (content: string, photoUrl: string | null) => {
    const currentUser = users.find(u => u.name === 'You');
    if (!currentUser) return;

    const newPost: Post = {
      id: `p${posts.length + 1}`,
      author: currentUser,
      content: content,
      imageUrl: photoUrl ?? undefined,
      imageHint: photoUrl ? 'user uploaded' : undefined,
      timestamp: 'Just now',
      likes: 0,
      comments: [],
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-2xl gap-6">
        <CreatePost onAddPost={handleAddPost} />
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
