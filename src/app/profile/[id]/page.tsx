

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import PostCard from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type User, type Question, type Badge as BadgeType } from '@/lib/data';
import { Briefcase, GraduationCap, Heart, Home, Link as LinkIcon, Pen, UserPlus, CheckCircle, Smile, Rocket, Feather, Users, Award, HelpCircle, QrCode, UserCheck, UserX, Hourglass, Languages, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { SetMoodDialog } from '@/components/set-mood-dialog';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { QnaSection } from '@/components/qna-section';
import { QrCodeDialog } from '@/components/qr-code-dialog';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, getDoc, onSnapshot, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { translateText } from '@/ai/flows/translate-text';

const availableLanguages = ['Español', 'French', 'German', 'Japanese', 'Mandarin', 'Swahili'];

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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false);
    const [isQrCodeOpen, setIsQrCodeOpen] = useState(false);
    const { toast } = useToast();

    const [translatedBio, setTranslatedBio] = useState<string | null>(null);
    const [isTranslatingBio, setIsTranslatingBio] = useState(false);

    const firestore = useFirestore();
    const { user: authUser } = useUser();

    // This is a workaround for a Next.js bug with dynamic routes in App Router.
    const id = params.id;
    const isCurrentUserProfile = id === 'me';
    const userId = isCurrentUserProfile ? authUser?.uid : id;

    const userProfileDocRef = useMemoFirebase(() => userId ? doc(firestore, 'users', userId) : null, [firestore, userId]);
    const { data: user, isLoading: isUserLoading } = useDoc<User>(userProfileDocRef);

    const userPostsQuery = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'posts') : null, [firestore, userId]);
    const { data: userPosts, isLoading: arePostsLoading } = useCollection(userPostsQuery);

    const [userFriends, setUserFriends] = useState<User[]>([]);
    const [friendStatus, setFriendStatus] = useState<'friends' | 'pending_them' | 'pending_me' | 'not_friends'>('not_friends');


     useEffect(() => {
        if (!user || !authUser || isCurrentUserProfile) return;

        // Check if they are friends
        if (user.friends?.includes(authUser.uid)) {
            setFriendStatus('friends');
            return;
        }

        // Check for pending friend requests
        const friendRequestsRef = collection(firestore, 'friend_requests');
        
        // Check if I sent a request to them
        const q1 = query(friendRequestsRef, where('requesterId', '==', authUser.uid), where('receiverId', '==', user.id), where('status', '==', 'pending'));
        getDocs(q1).then(snap => {
            if (!snap.empty) setFriendStatus('pending_them');
        });

        // Check if they sent a request to me
        const q2 = query(friendRequestsRef, where('requesterId', '==', user.id), where('receiverId', '==', authUser.uid), where('status', '==', 'pending'));
        getDocs(q2).then(snap => {
            if (!snap.empty) setFriendStatus('pending_me');
        });

    }, [user, authUser, firestore, isCurrentUserProfile]);

    useEffect(() => {
        if (!user || !user.friends || user.friends.length === 0) {
            setUserFriends([]);
            return;
        };
        const friendPromises = user.friends.map(friendId => getDoc(doc(firestore, 'users', friendId)));
        Promise.all(friendPromises).then(friendDocs => {
            const friendData = friendDocs.filter(doc => doc.exists()).map(doc => doc.data() as User);
            setUserFriends(friendData);
        });
    }, [user, firestore]);
    
    const handleProfileUpdate = (updatedData: Partial<User>) => {
        if (!userProfileDocRef) return;
        updateDocumentNonBlocking(userProfileDocRef, updatedData);
    };

    const handleMoodUpdate = (mood: User['mood']) => {
        handleProfileUpdate({ mood });
    }

    const handleQuestionSubmit = (questionText: string) => {
        if (!user || !authUser) return;
        // In a real app, you'd get the current user's profile data
        const newQuestion = {
            id: `q${(user.questions?.length || 0) + 1}`,
            questionerId: authUser.uid,
            questionText,
            timestamp: new Date().toISOString()
        };
        const updatedQuestions = [...(user.questions || []), newQuestion];
        handleProfileUpdate({ questions: updatedQuestions as any[] });
    }
    
    const handleAnswerSubmit = (questionId: string, answerText: string) => {
        if (!user) return;
        const updatedQuestions = user.questions?.map(q => q.id === questionId ? {...q, answerText} : q);
        handleProfileUpdate({ questions: updatedQuestions });
    }

    const handleAddFriend = () => {
        if (!authUser || !user) return;
        
        const friendRequest = {
            requesterId: authUser.uid,
            receiverId: user.id,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        addDocumentNonBlocking(collection(firestore, 'friend_requests'), friendRequest);
        setFriendStatus('pending_them');
        toast({ title: 'Friend request sent!' });
    };

    const handleCancelFriendRequest = async () => {
        if (!authUser || !user) return;
        const friendRequestsRef = collection(firestore, 'friend_requests');
        const q = query(friendRequestsRef, where('requesterId', '==', authUser.uid), where('receiverId', '==', user.id), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            deleteDoc(doc.ref);
        });
        setFriendStatus('not_friends');
        toast({ title: 'Friend request canceled.' });
    };
    
    const handleTranslateBio = async (language: string) => {
        if (!user?.bio) return;
        setIsTranslatingBio(true);
        setTranslatedBio(null);
        try {
            const result = await translateText({ text: user.bio, targetLanguage: language });
            setTranslatedBio(result.translatedText);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Translation failed' });
        } finally {
            setIsTranslatingBio(false);
        }
    };

    const FriendStatusButton = () => {
        switch (friendStatus) {
            case 'friends':
                return <Button variant="secondary"><UserCheck className="mr-2 h-4 w-4" /> Friends</Button>;
            case 'pending_them':
                return <Button variant="secondary" onClick={handleCancelFriendRequest}><Hourglass className="mr-2 h-4 w-4" /> Request Sent</Button>;
            case 'pending_me':
                // This case should be handled on the /friends page, but we can show a state
                return <Button variant="secondary"><UserPlus className="mr-2 h-4 w-4" /> Respond to Request</Button>;
            default:
                return <Button onClick={handleAddFriend}><UserPlus className="mr-2 h-4 w-4" /> Add Friend</Button>;
        }
    };

    // Effect to clear expired moods
    useEffect(() => {
        if (user?.mood && user.mood.expiresAt < Date.now()) {
            handleMoodUpdate(undefined);
        }
    }, [user]);
    
    if (isUserLoading) {
        return <MainLayout><div>Loading profile...</div></MainLayout>;
    }

    if (!user) {
        return <MainLayout><div>User not found</div></MainLayout>;
    }
    
    const moodExpired = user.mood && user.mood.expiresAt < Date.now();

    return (
        <MainLayout>
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <Card className="overflow-hidden">
                    <div className="h-48 bg-muted" style={{ backgroundImage: `url(${user.coverPhotoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} data-ai-hint="profile banner"></div>
                    <CardContent className="relative -mt-16 p-6">
                        <div className="flex flex-col items-center sm:flex-row sm:items-end">
                            <div className="relative">
                                <Avatar className="h-32 w-32 border-4 border-background">
                                    <AvatarImage src={user.avatarUrl} alt={user.firstName} />
                                    <AvatarFallback className="text-5xl">{user.firstName?.charAt(0)}</AvatarFallback>
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
                                    <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                                    {user.verificationStatus === 'verified' && <CheckCircle className="h-6 w-6 text-primary" />}
                                </div>
                                <div className="flex items-center justify-center gap-2 sm:justify-start">
                                    <p className="text-muted-foreground">@{user.handle}</p>
                                    {user.pronouns && <p className="text-sm text-muted-foreground">&bull; {user.pronouns}</p>}
                                </div>
                                <div className="mt-2 text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                                     <p>{user.bio}</p>
                                     {user.bio && !isCurrentUserProfile && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" disabled={isTranslatingBio}>
                                                    {isTranslatingBio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {availableLanguages.map(lang => (
                                                    <DropdownMenuItem key={lang} onClick={() => handleTranslateBio(lang)}>{lang}</DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                     )}
                                </div>
                                 {translatedBio && (
                                    <div className="mt-2 text-left text-sm italic text-muted-foreground border-l-2 pl-2">
                                        {translatedBio}
                                        <Button variant="link" size="sm" className="p-1 h-auto" onClick={() => setTranslatedBio(null)}>(show original)</Button>
                                    </div>
                                 )}
                                 <div className="mt-4 flex justify-center gap-6 text-sm text-muted-foreground sm:justify-start">
                                    <div><span className="font-bold text-foreground">{userPosts?.length || 0}</span> Posts</div>
                                    <div><span className="font-bold text-foreground">{user.followers || 0}</span> Followers</div>
                                    <div><span className="font-bold text-foreground">{user.following || 0}</span> Following</div>
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
                                    <FriendStatusButton />
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
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {user.badges.map((badge: BadgeType) => {
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
                                {userFriends.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {userFriends.slice(0, 9).map(friend => (
                                            <Link key={friend.id} href={`/profile/${friend.id}`} title={`${friend.firstName} ${friend.lastName}`}>
                                                <div className="relative">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarImage src={friend.avatarUrl} alt={`${friend.firstName} ${friend.lastName}`} />
                                                        <AvatarFallback>{friend.firstName?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    {friend.onlineStatus === 'online' && (
                                                        <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground">No friends to show.</p>
                                )}
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
                                <TabsTrigger value="qna">Q&amp;A</TabsTrigger>
                            </TabsList>
                            <TabsContent value="posts" className="space-y-6">
                                {arePostsLoading ? (
                                    <Card><CardContent className="p-6 text-center text-muted-foreground">Loading posts...</CardContent></Card>
                                ) : userPosts && userPosts.length > 0 ? (
                                    userPosts.map(post => <PostCard key={post.id} post={{...post, author: user, comments:[], likes: post.likeIds?.length || 0}} />)
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

    