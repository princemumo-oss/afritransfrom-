
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import PostCard from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { users as initialUsers, posts as allPosts, type User, type Badge as BadgeType, badges as allBadges, type Question } from '@/lib/data';
import { Briefcase, GraduationCap, Heart, Home, Link as LinkIcon, Pen, UserPlus, CheckCircle, Smile, Rocket, Feather, Users, Award, HelpCircle, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { SetMoodDialog } from '@/components/set-mood-dialog';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QnaSection } from '@/components/qna-section';
import { QrCodeDialog } from '@/components/qr-code-dialog';

function InfoItem({ icon: Icon, text }: { icon: React.ElementType, text: string | undefined }) {
    if (!text) return null;
    return (
        <div className="flex items-center gap-3 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{text}</span>
        </div>
    );
}

const badgeIcons: { [key: string]: React.ElementType } = {
  Rocket,
  Feather,
  Users,
};

export default function ProfilePage() {
    const params = useParams<{ id: string }>();
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false);
    const [isQrCodeOpen, setIsQrCodeOpen] = useState(false);

    // This is a workaround for a Next.js bug with dynamic routes in App Router.
    const id = params.id;

    const currentUser = users.find(u => u.name === 'You');
    const userId = id === 'me' ? currentUser?.id : id;
    const user = users.find(u => u.id === userId);
    const userPosts = allPosts.filter(p => p.author.id === userId);
    const userFriends = users.filter(u => u.id !== userId && u.id !== '5'); // Exclude current user and 'You'

    const handleProfileUpdate = (updatedUser: User) => {
        setUsers(currentUsers => currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleMoodUpdate = (mood: User['mood']) => {
        if(user) {
            handleProfileUpdate({ ...user, mood });
        }
    }

    const handleQuestionSubmit = (questionText: string) => {
        if (!user || !currentUser) return;
        const newQuestion: Question = {
            id: `q${(user.questions?.length || 0) + 1}`,
            questioner: currentUser,
            questionText,
            timestamp: 'Just now'
        };
        const updatedUser = { ...user, questions: [...(user.questions || []), newQuestion] };
        handleProfileUpdate(updatedUser);
    }
    
    const handleAnswerSubmit = (questionId: string, answerText: string) => {
        if (!user) return;
        const updatedQuestions = user.questions?.map(q => q.id === questionId ? {...q, answerText} : q);
        const updatedUser = { ...user, questions: updatedQuestions };
        handleProfileUpdate(updatedUser);
    }

    // Effect to clear expired moods
    useEffect(() => {
        if (user?.mood && user.mood.expiresAt < Date.now()) {
            handleMoodUpdate(undefined);
        }
    }, [user]);
    
    if (!user) {
        return <MainLayout><div>User not found</div></MainLayout>;
    }
    
    const isCurrentUserProfile = id === 'me';
    const moodExpired = user.mood && user.mood.expiresAt < Date.now();


    return (
        <MainLayout>
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <Card className="overflow-hidden">
                    <div className="h-48 bg-muted" style={{ backgroundImage: `url('https://picsum.photos/seed/${userId}/1200/300')`, backgroundSize: 'cover', backgroundPosition: 'center' }} data-ai-hint="profile banner"></div>
                    <CardContent className="relative -mt-16 p-6">
                        <div className="flex flex-col items-center sm:flex-row sm:items-end">
                            <div className="relative">
                                <Avatar className="h-32 w-32 border-4 border-background">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback className="text-5xl">{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {user.onlineStatus === 'online' && (
                                    <span className="absolute bottom-4 right-4 block h-5 w-5 rounded-full border-2 border-background bg-green-500" />
                                )}
                                {user.mood && !moodExpired && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-card text-2xl">
                                                    {user.mood.emoji}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{user.mood.text}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            <div className="mt-4 flex-1 text-center sm:ml-6 sm:text-left">
                                <div className="flex items-center justify-center gap-2 sm:justify-start">
                                    <h1 className="text-3xl font-bold">{user.name}</h1>
                                    {user.verified && <CheckCircle className="h-6 w-6 text-primary" />}
                                </div>
                                <p className="text-muted-foreground">@{user.handle}</p>
                                <p className="mt-2 text-muted-foreground">{user.bio}</p>
                                 <div className="mt-4 flex justify-center gap-6 text-sm text-muted-foreground sm:justify-start">
                                    <div><span className="font-bold text-foreground">{userPosts.length}</span> Posts</div>
                                    <div><span className="font-bold text-foreground">{user.followers}</span> Followers</div>
                                    <div><span className="font-bold text-foreground">{user.following}</span> Following</div>
                                </div>
                            </div>
                            <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
                                {isCurrentUserProfile ? (
                                    <>
                                        <Button variant="outline" size="icon" onClick={() => setIsQrCodeOpen(true)}>
                                            <QrCode className="h-4 w-4" />
                                            <span className="sr-only">My QR Code</span>
                                        </Button>
                                        <Button onClick={() => setIsMoodDialogOpen(true)}>
                                            <Smile className="mr-2 h-4 w-4" /> Set Mood
                                        </Button>
                                        <Button onClick={() => setIsEditDialogOpen(true)}>
                                            <Pen className="mr-2 h-4 w-4" /> Edit Profile
                                        </Button>
                                        <EditProfileDialog
                                            user={user}
                                            open={isEditDialogOpen}
                                            onOpenChange={setIsEditDialogOpen}
                                            onProfileUpdate={handleProfileUpdate}
                                        />
                                        <SetMoodDialog
                                            user={user}
                                            open={isMoodDialogOpen}
                                            onOpenChange={setIsMoodDialogOpen}
                                            onMoodUpdate={handleMoodUpdate}
                                        />
                                        <QrCodeDialog
                                            user={user}
                                            open={isQrCodeOpen}
                                            onOpenChange={setIsQrCodeOpen}
                                        />
                                    </>
                                ) : (
                                    <>
                                    <Button>
                                        <UserPlus className="mr-2 h-4 w-4" /> Add Friend
                                    </Button>
                                    <Button variant="outline">Message</Button>
                                    </>
                                )}
                            </div>
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
                         {user.badges && user.badges.length > 0 && (
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="text-yellow-500" />
                                        Badges
                                    </Title>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {user.badges.map(badge => {
                                        const Icon = badgeIcons[badge.icon] || Award;
                                        return (
                                            <TooltipProvider key={badge.name}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center gap-3">
                                                            <Icon className="h-6 w-6 text-muted-foreground" />
                                                            <p className="font-semibold">{badge.name}</p>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{badge.description}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}
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
                                            <div className="relative">
                                                <Avatar className="h-16 w-16">
                                                    <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                                                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {friend.onlineStatus === 'online' && (
                                                    <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                                                )}
                                            </div>
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
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="posts">Posts</TabsTrigger>
                                <TabsTrigger value="family">Family</TabsTrigger>
                                <TabsTrigger value="qna">Q&A</TabsTrigger>
                            </TabsList>
                            <TabsContent value="posts" className="space-y-6">
                                {userPosts.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        {userPosts.map(post => <PostCard key={post.id} post={post} />)}
                                    </div>
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
                            <TabsContent value="qna">
                                <QnaSection 
                                    user={user}
                                    isCurrentUserProfile={isCurrentUserProfile}
                                    onQuestionSubmit={handleQuestionSubmit}
                                    onAnswerSubmit={handleAnswerSubmit}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
