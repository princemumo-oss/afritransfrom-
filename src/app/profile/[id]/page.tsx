'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import PostCard from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { users as initialUsers, posts as allPosts, type User } from '@/lib/data';
import { Briefcase, GraduationCap, Heart, Home, Link as LinkIcon, Pen, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { EditProfileDialog } from '@/components/edit-profile-dialog';

function InfoItem({ icon: Icon, text }: { icon: React.ElementType, text: string | undefined }) {
    if (!text) return null;
    return (
        <div className="flex items-center gap-3 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{text}</span>
        </div>
    );
}

export default function ProfilePage() {
    const params = useParams<{ id: string }>();
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const userId = params.id === 'me' ? users.find(u => u.name === 'You')?.id : params.id;
    const user = users.find(u => u.id === userId);
    const userPosts = allPosts.filter(p => p.author.id === userId);
    const userFriends = users.filter(u => u.id !== userId && u.id !== '5'); // Exclude current user and 'You'

    const handleProfileUpdate = (updatedUser: User) => {
        setUsers(currentUsers => currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    if (!user) {
        return <MainLayout><div>User not found</div></MainLayout>;
    }

    return (
        <MainLayout>
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <Card className="overflow-hidden">
                    <div className="h-48 bg-muted" style={{ backgroundImage: `url('https://picsum.photos/seed/${userId}/1200/300')`, backgroundSize: 'cover', backgroundPosition: 'center' }} data-ai-hint="profile banner"></div>
                    <CardContent className="relative -mt-16 flex flex-col items-center p-6 text-center sm:flex-row sm:items-end sm:text-left">
                        <Avatar className="h-32 w-32 border-4 border-background">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="text-5xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="mt-4 flex-1 sm:ml-6">
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <p className="mt-1 text-muted-foreground">{user.bio}</p>
                        </div>
                        <div className="mt-4 flex gap-2 sm:mt-0">
                            {params.id === 'me' ? (
                                <>
                                    <Button onClick={() => setIsEditDialogOpen(true)}>
                                        <Pen className="mr-2 h-4 w-4" /> Edit Profile
                                    </Button>
                                    <EditProfileDialog
                                        user={user}
                                        open={isEditDialogOpen}
                                        onOpenChange={setIsEditDialogOpen}
                                        onProfileUpdate={handleProfileUpdate}
                                    />
                                </>
                            ) : (
                                <Button>
                                    <UserPlus className="mr-2 h-4 w-4" /> Add Friend
                                </Button>
                            )}
                            <Button variant="outline">Message</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InfoItem icon={Briefcase} text={user.work ? `${user.work.position} at ${user.work.company}` : undefined} />
                                <InfoItem icon={GraduationCap} text={user.education ? `Studied ${user.education.degree} at ${user.education.school}`: undefined} />
                                <InfoItem icon={Home} text={user.location} />
                                <InfoItem icon={Heart} text={user.relationshipStatus} />
                                {user.website && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{user.website}</a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {user.hobbies && user.hobbies.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hobbies</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {user.hobbies.map(hobby => (
                                        <Badge key={hobby} variant="secondary">{hobby}</Badge>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                         <Card>
                            <CardHeader>
                                <CardTitle>Friends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-2">
                                    {userFriends.slice(0, 9).map(friend => (
                                        <Link key={friend.id} href={`/profile/${friend.id}`} title={friend.name}>
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                                                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    ))}
                                </div>
                                {userFriends.length > 9 && (
                                    <Button variant="link" className="mt-2 w-full">View all friends</Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        <Tabs defaultValue="posts" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="posts">Posts</TabsTrigger>
                                <TabsTrigger value="family">Family</TabsTrigger>
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
                            <TabsContent value="family">
                                {user.family && user.family.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {user.family.map((member, index) => (
                                            <Card key={index} className="p-4 text-center">
                                                <p className="font-semibold">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.relation}</p>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                     <Card>
                                        <CardContent className="p-6 text-center text-muted-foreground">
                                            No family information provided.
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
