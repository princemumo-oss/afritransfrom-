import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { friendRequests, friends } from '@/lib/data';
import { Check, UserPlus, X } from 'lucide-react';

export default function FriendsPage() {
    return (
        <MainLayout>
            <div className="mx-auto grid w-full max-w-4xl gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Friends</h1>
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
                            <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                {friends.map(friend => (
                                    <Card key={friend.id} className="flex flex-col items-center p-4 text-center">
                                        <div className="relative mb-4">
                                            <Avatar className="h-20 w-20">
                                                <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                                                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {friend.onlineStatus === 'online' && (
                                                <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full border-2 border-card bg-green-500" />
                                            )}
                                        </div>
                                        <p className="font-semibold">{friend.name}</p>
                                        <p className="truncate text-sm text-muted-foreground">{friend.bio}</p>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="requests">
                         <Card>
                            <CardHeader>
                                <CardTitle>Friend Requests</CardTitle>
                                <CardDescription>Accept or decline requests from other users.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {friendRequests.map(request => (
                                    <div key={request.user.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-accent">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={request.user.avatarUrl} alt={request.user.name} />
                                                    <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                 {request.user.onlineStatus === 'online' && (
                                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{request.user.name}</p>
                                                <p className="text-sm text-muted-foreground">{request.user.bio}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="outline">
                                                <Check className="h-4 w-4 text-green-500" />
                                            </Button>
                                            <Button size="icon" variant="outline">
                                                <X className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {friendRequests.length === 0 && (
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
