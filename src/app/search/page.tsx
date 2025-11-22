
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import PostCard from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { posts as allPosts, users as allUsers } from '@/lib/data';
import type { Post, User } from '@/lib/data';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

    useEffect(() => {
        if (query) {
            const lowercasedQuery = query.toLowerCase();
            
            const users = allUsers.filter(user =>
                user.name.toLowerCase().includes(lowercasedQuery) ||
                user.bio.toLowerCase().includes(lowercasedQuery)
            );
            setFilteredUsers(users);

            const posts = allPosts.filter(post => 
                post.content.toLowerCase().includes(lowercasedQuery) || 
                post.author.name.toLowerCase().includes(lowercasedQuery)
            );
            setFilteredPosts(posts);
        } else {
            setFilteredUsers([]);
            setFilteredPosts([]);
        }
    }, [query]);

    if (!query) {
        return (
            <div className="text-center text-muted-foreground">
                Please enter a search term to begin.
            </div>
        );
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
                                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <p className="font-semibold">{user.name}</p>
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
