
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { users } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const { toast } = useToast();
    const currentUser = users.find(u => u.name === 'You');

    // States for various settings
    const [name, setName] = useState(currentUser?.name || 'You');
    const [bio, setBio] = useState(currentUser?.bio || 'This is your bio. You can edit it!');
    const [theme, setTheme] = useState('system');
    const [notifications, setNotifications] = useState({
        friendRequests: true,
        comments: true,
        likes: false,
    });
    const [privacy, setPrivacy] = useState({
        profileVisibility: 'public',
        contentFilter: false,
    });
    
    const handleProfileSave = () => {
        toast({
            title: 'Profile Saved',
            description: 'Your profile information has been updated.',
        });
        // In a real app, you would update the user data here
    };

    const handlePrivacySave = () => {
        toast({
            title: 'Privacy Settings Saved',
            description: 'Your privacy preferences have been updated.',
        });
    };


    return (
        <MainLayout>
            <div className="mx-auto grid w-full max-w-4xl gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings, theme, and notification preferences.
                    </p>
                </div>
                <Separator />
                
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Update your public profile information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleProfileSave}>Save Changes</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Theme</CardTitle>
                        <CardDescription>Choose how afritransform looks and feels.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                                <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    Light
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                                <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    Dark
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                                <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    System
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Manage how you receive notifications.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="friend-requests">Friend Requests</Label>
                                <p className="text-sm text-muted-foreground">Receive a notification when someone sends you a friend request.</p>
                            </div>
                            <Switch 
                                id="friend-requests" 
                                checked={notifications.friendRequests}
                                onCheckedChange={(checked) => setNotifications(prev => ({...prev, friendRequests: checked}))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="comments">Comments on your posts</Label>
                                <p className="text-sm text-muted-foreground">Get notified when someone comments on one of your posts.</p>
                            </div>
                            <Switch 
                                id="comments" 
                                checked={notifications.comments}
                                onCheckedChange={(checked) => setNotifications(prev => ({...prev, comments: checked}))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="likes">Likes on your posts</Label>
                                <p className="text-sm text-muted-foreground">Get notified when someone likes one of your posts.</p>
                            </div>
                            <Switch 
                                id="likes" 
                                checked={notifications.likes}
                                onCheckedChange={(checked) => setNotifications(prev => ({...prev, likes: checked}))}
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Privacy & Safety</CardTitle>
                        <CardDescription>Control who can see your activity and content.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Profile Visibility</Label>
                                <p className="text-sm text-muted-foreground">Control who can view your profile.</p>
                            </div>
                            <Select 
                                value={privacy.profileVisibility}
                                onValueChange={(value) => setPrivacy(prev => ({...prev, profileVisibility: value}))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="friends">Friends Only</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Content Moderation</Label>
                                <p className="text-sm text-muted-foreground">Filter sensitive content from your feed.</p>
                            </div>
                            <Switch 
                                id="content-filter"
                                checked={privacy.contentFilter}
                                onCheckedChange={(checked) => setPrivacy(prev => ({...prev, contentFilter: checked}))}
                            />
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button onClick={handlePrivacySave}>Save Privacy Settings</Button>
                    </CardFooter>
                </Card>
            </div>
        </MainLayout>
    );
}
