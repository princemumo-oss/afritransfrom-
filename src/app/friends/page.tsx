
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
                                                    <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                                                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                 {friend.onlineStatus === 'online' && (
                                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{friend.name}</p>
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
                                            <Button size="icon" variant="outline" className="text-green-500 hover:bg-green-500/10 hover:text-green-600">
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="text-red-500 hover:bg-red-500/10 hover:text-red-600">
                                                <X className="h-4 w-4" />
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
