import { MainLayout } from '@/components/main-layout';
import PostCard from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { users, posts as allPosts } from '@/lib/data';
import { UserPlus } from 'lucide-react';

export default function ProfilePage({ params }: { params: { id: string } }) {
    const userId = params.id === 'me' ? users.find(u => u.name === 'You')?.id : params.id;
    const user = users.find(u => u.id === userId);
    const userPosts = allPosts.filter(p => p.author.id === userId);
    const userFriends = users.filter(u => u.id !== userId);

    if (!user) {
        return <MainLayout><div>User not found</div></MainLayout>;
    }

    return (
        <MainLayout>
            <div className="mx-auto w-full max-w-4xl space-y-6">
                <Card>
                    <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start">
                        <Avatar className="h-28 w-28 border-4 border-background">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <p className="text-muted-foreground">{user.bio}</p>
                            <div className="mt-4 flex justify-center gap-2 sm:justify-start">
                                {params.id === 'me' ? (
                                    <Button>Edit Profile</Button>
                                ) : (
                                    <Button>
                                        <UserPlus className="mr-2 h-4 w-4" /> Add Friend
                                    </Button>
                                )}
                                <Button variant="outline">Message</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="friends">Friends</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts" className="space-y-6">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => <PostCard key={post.id} post={post} />)
                        ) : (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No posts yet.
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                    <TabsContent value="friends">
                         <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {userFriends.slice(0, 8).map(friend => (
                                <Card key={friend.id} className="flex flex-col items-center p-4 text-center">
                                    <Avatar className="mb-2 h-16 w-16">
                                        <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-semibold">{friend.name}</p>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
