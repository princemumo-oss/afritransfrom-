
'use client';

import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, getDoc, updateDoc, deleteDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { Check, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { addFriend } from '@/app/friends/actions';

export default function FriendsPage() {
    const firestore = useFirestore();
    const { user: currentUser } = useUser();
    const { toast } = useToast();

    // Friend Requests
    const friendRequestsQuery = useMemoFirebase(() => 
        currentUser ? query(collection(firestore, 'friend_requests'), where('receiverId', '==', currentUser.uid), where('status', '==', 'pending')) : null,
        [firestore, currentUser]
    );
    const { data: friendRequestDocs, isLoading: isLoadingRequests } = useCollection(friendRequestsQuery);
    
    const [friendRequests, setFriendRequests] = useState<any[]>([]);

    useEffect(() => {
        if (!friendRequestDocs) return;

        const fetchRequestUsers = async () => {
            const requests = await Promise.all(
                friendRequestDocs.map(async (req) => {
                    const userRef = doc(firestore, 'users', req.requesterId);
                    const userSnap = await getDoc(userRef);
                    return { ...req, user: userSnap.data() };
                })
            );
            setFriendRequests(requests);
        };
        fetchRequestUsers();

    }, [friendRequestDocs, firestore]);

    // Friends
    const [friends, setFriends] = useState<User[]>([]);
    const currentUserProfileQuery = useMemoFirebase(() => currentUser ? doc(firestore, 'users', currentUser.uid) : null, [firestore, currentUser]);
    
    useEffect(() => {
        if (!currentUserProfileQuery) return;
        const unsub = onSnapshot(currentUserProfileQuery, async (snap) => {
            const userData = snap.data();
            if (userData && userData.friends) {
                if (userData.friends.length === 0) {
                    setFriends([]);
                    return;
                }
                const friendPromises = userData.friends.map((friendId: string) => getDoc(doc(firestore, 'users', friendId)));
                const friendDocs = await Promise.all(friendPromises);
                const friendData = friendDocs.map(doc => doc.data() as User);
                setFriends(friendData);
            }
        });
        return () => unsub();
    }, [currentUserProfileQuery, firestore]);


    const handleRequest = async (request: any, newStatus: 'accepted' | 'rejected') => {
        const requestRef = doc(firestore, 'friend_requests', request.id);
        try {
            if (newStatus === 'accepted') {
                await addFriend(request.requesterId, request.receiverId);
                await updateDoc(requestRef, { status: 'accepted' });
            } else {
                await deleteDoc(requestRef);
            }
            toast({ title: `Friend request ${newStatus}.` });
        } catch (error) {
            console.error("Error handling friend request", error);
            toast({ variant: 'destructive', title: 'Something went wrong.' });
        }
    };


    return (
        <MainLayout>
            <div className="mx-auto grid w-full max-w-4xl gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Friends</h1>
                        <p className="text-muted-foreground">Manage your connections.</p>
                    </div>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Friend
                    </Button>
                </div>
                
                <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="all">All Friends ({friends.length})</TabsTrigger>
                        <TabsTrigger value="requests">Friend Requests ({friendRequests.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                        <Card>
                             <CardContent className="p-4 space-y-4">
                                {friends.map(friend => (
                                    <div key={friend.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-accent">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={friend.avatarUrl} alt={`${friend.firstName} ${friend.lastName}`} />
                                                    <AvatarFallback>{friend.firstName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                 {friend.onlineStatus === 'online' && (
                                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{friend.firstName} {friend.lastName}</p>
                                                <p className="text-sm text-muted-foreground">{friend.bio}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline">Message</Button>
                                    </div>
                                ))}
                                 {friends.length === 0 && (
                                    <p className="p-4 text-center text-muted-foreground">You haven't added any friends yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="requests">
                         <Card>
                            <CardContent className="space-y-4 p-4">
                                {(isLoadingRequests && friendRequests.length === 0) && <p className="p-4 text-center text-muted-foreground">Loading requests...</p>}
                                {friendRequests.map(request => (
                                    <div key={request.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-accent">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={request.user.avatarUrl} alt={request.user.firstName} />
                                                    <AvatarFallback>{request.user.firstName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                 {request.user.onlineStatus === 'online' && (
                                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{request.user.firstName} {request.user.lastName}</p>
                                                <p className="text-sm text-muted-foreground">{request.user.bio}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="outline" className="text-green-500 hover:bg-green-500/10 hover:text-green-600" onClick={() => handleRequest(request, 'accepted')}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="text-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={() => handleRequest(request, 'rejected')}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {!isLoadingRequests && friendRequests.length === 0 && (
                                    <p className="p-4 text-center text-muted-foreground">You have no new friend requests.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
