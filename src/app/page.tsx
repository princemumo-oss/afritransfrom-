'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import CreatePost from '@/components/create-post';
import PostCard from '@/components/post-card';
import { type Post } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { useFirestore, useUser, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, getDoc, doc } from 'firebase/firestore';

export default function Home() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  
  const globalPostsQuery = useMemoFirebase(() => collection(firestore, 'global_posts'), [firestore]);
  const { data: postDocs, isLoading } = useCollection(globalPostsQuery);

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!postDocs) return;

    const fetchAuthors = async () => {
        const postsWithAuthors = await Promise.all(
            postDocs.map(async (post) => {
                const userRef = doc(firestore, 'users', post.authorId);
                const userSnap = await getDoc(userRef);
                const author = userSnap.data();
                // Format timestamp
                const timestamp = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now';
                return { ...post, author, timestamp, comments: [], likes: post.likeIds?.length || 0 };
            })
        );
        setPosts(postsWithAuthors as Post[]);
    };

    fetchAuthors();
  }, [postDocs, firestore]);

  const handleAddPost = (content: string, mediaUrl: string | null, mediaType: 'image' | 'video' | null) => {
    if (!currentUser) return;

    const postsCollection = collection(firestore, 'global_posts');
    const userPostsCollection = collection(firestore, 'users', currentUser.uid, 'posts');

    const newPost = {
      authorId: currentUser.uid,
      content: content,
      mediaUrl: mediaUrl ?? null,
      mediaType: mediaType ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeIds: []
    };
    
    // Add to global posts
    addDocumentNonBlocking(postsCollection, newPost)
        .then(docRef => {
            // Also add to user's own posts subcollection
            if(docRef) {
                const userPostRef = doc(userPostsCollection, docRef.id);
                addDocumentNonBlocking(userPostRef, newPost);
            }
        });
  };

  return (
    <MainLayout>
      <div className="mx-auto grid w-full max-w-2xl gap-6">
        <CreatePost onAddPost={handleAddPost} />
        <Separator />
        <div className="flex flex-col gap-6">
          {isLoading && <p className="text-center text-muted-foreground">Loading posts...</p>}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
