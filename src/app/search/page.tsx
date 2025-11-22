

'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import PostCard from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { Post, User } from '@/lib/data';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

function SearchResults() {
    const searchParams = useSearchParams();
    const queryTerm = searchParams.get('q') || '';
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();

    useEffect(() => {
        const search = async () => {
            if (!queryTerm || !firestore) return;

            setIsLoading(true);
            const lowercasedQuery = queryTerm.toLowerCase();
            
            // This is a simplified search. For production, you would use a dedicated search service like Algolia or Elasticsearch.
            // Searching users by name (requires creating composite indexes in Firestore for more complex queries)
            try {
                const usersCol = collection(firestore, 'users');
                // Simple search by first name, would be better to have a searchable field
                const userQuery = query(usersCol, where('firstName', '>=', lowercasedQuery), where('firstName', '<=', lowercasedQuery + '\uf8ff'));
                const userSnap = await getDocs(userQuery);
                const users = userSnap.docs.map(doc => doc.data() as User);
                setFilteredUsers(users);
            } catch(e) {
                console.error("Could not search users", e);
                setFilteredUsers([]);
            }

            // Searching posts
            try {
                 const postsCol = collection(firestore, 'global_posts');
                // This is also a very simple search and not scalable.
                const postSnap = await getDocs(postsCol);
                const postsData = postSnap.docs.map(doc => ({...doc.data(), id: doc.id}));

                const relevantPosts = postsData.filter(post => post.content.toLowerCase().includes(lowercasedQuery));
                
                const postsWithAuthors = await Promise.all(
                    relevantPosts.map(async (post) => {
                        const userRef = doc(firestore, 'users', post.authorId);
                        const userSnap = await getDoc(userRef);
                        return { ...post, author: userSnap.data() as User } as Post;
                    })
                );

                setFilteredPosts(postsWithAuthors);

            } catch(e) {
                 console.error("Could not search posts", e);
                 setFilteredPosts([]);
            }


            setIsLoading(false);
        };

        search();
    }, [queryTerm, firestore]);

    if (!queryTerm) {
        return (
            <div className="text-center text-muted-foreground">
                Please enter a search term to begin.
            </div>
        );
    }
    
    if (isLoading) {
        return <div className="text-center text-muted-foreground">Searching...</div>;
    }

    return (
        <div className="mx-auto grid w-full max-w-4xl gap-8">
            <div>
                <h2 className="mb-4 text-xl font-bold">Users ({filteredUsers.length})</h2>
                {filteredUsers.length > 0 ? (
                    <Card>
                        <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredUsers.map(user => (
                                <Link key={user.id} href={`/profile/${user.id}`}>
                                    <Card className="flex flex-col items-center p-4 text-center hover:bg-accent">
                                        <Avatar className="mb-4 h-20 w-20">
                                            <AvatarImage src={user.avatarUrl} alt={user.firstName} />
                                            <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>
                                    </Card>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                    <p className="text-muted-foreground">No users found.</p>
                )}
            </div>

            <div>
                <h2 className="mb-4 text-xl font-bold">Posts ({filteredPosts.length})</h2>
                {filteredPosts.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No posts found.</p>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <MainLayout>
            <Suspense fallback={<div>Loading search results...</div>}>
                <SearchResultsWrapper />
            </Suspense>
        </MainLayout>
    );
}

// Wrapper component to use useSearchParams
function SearchResultsWrapper() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    
    return (
        <>
            <h1 className="mb-6 text-2xl font-bold">
                Search Results for &quot;{query}&quot;
            </h1>
            <SearchResults />
        </>
    );
}
