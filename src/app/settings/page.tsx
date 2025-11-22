
'use client';

import { useState } from 'react';
import { useTheme } from "next-themes"
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
import { Shield, MessageCircle, Bell, Image as ImageIcon, ShieldCheck, Flag, ShieldQuestion, Users as UsersIcon, LifeBuoy } from 'lucide-react';

export default function SettingsPage() {
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const currentUser = users.find(u => u.name === 'You');

    // States for various settings
    const [name, setName] = useState(currentUser?.name || 'You');
    const [bio, setBio] = useState(currentUser?.bio || 'This is your bio. You can edit it!');
    const [notifications, setNotifications] = useState({
        friendRequests: true,
        comments: true,
        likes: false,
        doNotDisturb: false,
        priorityCloseFriends: true,
        priorityVerified: false,
    });
    const [privacy, setPrivacy] = useState({
        postVisibility: 'public',
        whoCanTag: 'everyone',
        hideOnlineStatus: false,
        sensitiveContentFilter: false,
        locationSharing: true,
    });
    const [messagingSettings, setMessagingSettings] = useState({
        readReceipts: true,
        typingIndicators: true,
        messageReactions: true,
        ephemeralMessages: 'off',
        groupChatPermissions: 'everyone',
    });
    const [mediaSettings, setMediaSettings] = useState({
        autoPlayVideos: true,
        highQualityUploads: 'wifi',
        imageCompression: 'standard',
        downloadPermissions: 'friends',
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

    const handleMessagingSave = () => {
        toast({
            title: 'Messaging Settings Saved',
            description: 'Your messaging preferences have been updated.',
        });
    };

    const handleMediaSave = () => {
        toast({
            title: 'Media Settings Saved',
            description: 'Your media and content preferences have been updated.',
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
                        <CardTitle className="flex items-center gap-2">
                            <Bell />
                            Notifications
                        </CardTitle>
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
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="do-not-disturb">Quiet Hours / Do Not Disturb</Label>
                                <p className="text-sm text-muted-foreground">Temporarily pause all notifications.</p>
                            </div>
                            <Switch 
                                id="do-not-disturb" 
                                checked={notifications.doNotDisturb}
                                onCheckedChange={(checked) => setNotifications(prev => ({...prev, doNotDisturb: checked}))}
                            />
                        </div>
                        <div>
                             <Label>Priority Notifications</Label>
                             <p className="text-sm text-muted-foreground mb-4">Receive notifications from these groups even in Do Not Disturb mode.</p>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm">From Close Friends</p>
                                    <Switch 
                                        id="priority-close-friends"
                                        checked={notifications.priorityCloseFriends}
                                        onCheckedChange={(checked) => setNotifications(prev => ({...prev, priorityCloseFriends: checked}))}
                                    />
                                </div>
                                 <div className="flex items-center justify-between">
                                    <p className="text-sm">From Verified Accounts</p>
                                    <Switch 
                                        id="priority-verified"
                                        checked={notifications.priorityVerified}
                                        onCheckedChange={(checked) => setNotifications(prev => ({...prev, priorityVerified: checked}))}
                                    />
                                </div>
                             </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield />
                            Privacy &amp; Safety
                        </CardTitle>
                        <CardDescription>Control who can see your activity and content.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Control who can see your posts</Label>
                                <p className="text-sm text-muted-foreground">Control who can view your profile and posts.</p>
                            </div>
                            <Select 
                                value={privacy.postVisibility}
                                onValueChange={(value) => setPrivacy(prev => ({...prev, postVisibility: value}))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="friends">Friends Only</SelectItem>
                                    <SelectItem value="private">Only Me</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <Label>Control who can tag or mention you</Label>
                                <p className="text-sm text-muted-foreground">Choose who is allowed to tag you in photos or mention you.</p>
                            </div>
                            <Select
                                value={privacy.whoCanTag}
                                onValueChange={(value) => setPrivacy(prev => ({...prev, whoCanTag: value}))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="everyone">Everyone</SelectItem>
                                    <SelectItem value="friends">Friends Only</SelectItem>
                                    <SelectItem value="no-one">No One</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="hide-online-status">Hide online status</Label>
                                <p className="text-sm text-muted-foreground">Prevent others from seeing when you're online or last seen.</p>
                            </div>
                            <Switch 
                                id="hide-online-status"
                                checked={privacy.hideOnlineStatus}
                                onCheckedChange={(checked) => setPrivacy(prev => ({...prev, hideOnlineStatus: checked}))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="location-sharing">Location Sharing Toggle</Label>
                                <p className="text-sm text-muted-foreground">Enable or disable sharing of your location in posts.</p>
                            </div>
                            <Switch 
                                id="location-sharing"
                                checked={privacy.locationSharing}
                                onCheckedChange={(checked) => setPrivacy(prev => ({...prev, locationSharing: checked}))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="sensitive-content-filter">Sensitive Content Filters</Label>
                                <p className="text-sm text-muted-foreground">AI-assisted moderation to filter sensitive content from your feed.</p>
                            </div>
                            <Switch 
                                id="sensitive-content-filter"
                                checked={privacy.sensitiveContentFilter}
                                onCheckedChange={(checked) => setPrivacy(prev => ({...prev, sensitiveContentFilter: checked}))}
                            />
                        </div>
                         <Separator />
                        <div>
                             <Label>Block / Mute Users</Label>
                             <p className="text-sm text-muted-foreground mb-2">Manage users you have blocked or muted.</p>
                             <Button variant="outline">Manage Blocked Users</Button>
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button onClick={handlePrivacySave}>Save Privacy Settings</Button>
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle />
                            Messaging &amp; Interaction
                        </CardTitle>
                        <CardDescription>Customize your direct messaging experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="read-receipts">Read receipts</Label>
                                <p className="text-sm text-muted-foreground">Allow others to see when you have read their messages.</p>
                            </div>
                            <Switch 
                                id="read-receipts"
                                checked={messagingSettings.readReceipts}
                                onCheckedChange={(checked) => setMessagingSettings(prev => ({...prev, readReceipts: checked}))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="typing-indicators">Typing indicators</Label>
                                <p className="text-sm text-muted-foreground">Allow others to see when you are typing a message.</p>
                            </div>
                            <Switch 
                                id="typing-indicators"
                                checked={messagingSettings.typingIndicators}
                                onCheckedChange={(checked) => setMessagingSettings(prev => ({...prev, typingIndicators: checked}))}
                            />
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="message-reactions">Message reactions</Label>
                                <p className="text-sm text-muted-foreground">Enable or disable emoji reactions on messages.</p>
                            </div>
                            <Switch 
                                id="message-reactions"
                                checked={messagingSettings.messageReactions}
                                onCheckedChange={(checked) => setMessagingSettings(prev => ({...prev, messageReactions: checked}))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Ephemeral messages</Label>
                                <p className="text-sm text-muted-foreground">Set messages to automatically delete after a certain time.</p>
                            </div>
                            <Select
                                value={messagingSettings.ephemeralMessages}
                                onValueChange={(value) => setMessagingSettings(prev => ({...prev, ephemeralMessages: value}))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="off">Off</SelectItem>
                                    <SelectItem value="24h">24 hours</SelectItem>
                                    <SelectItem value="7d">7 days</SelectItem>
                                    <SelectItem value="30d">30 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Group chat permissions</Label>
                                <p className="text-sm text-muted-foreground">Control who can add or remove members from group chats.</p>
                            </div>
                            <Select
                                value={messagingSettings.groupChatPermissions}
                                onValueChange={(value) => setMessagingSettings(prev => ({...prev, groupChatPermissions: value}))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select permission" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="everyone">Everyone</SelectItem>
                                    <SelectItem value="admins">Admins Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleMessagingSave}>Save Messaging Settings</Button>
                    </CardFooter>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon />
                            Media &amp; Content
                        </CardTitle>
                        <CardDescription>Manage your media and content preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="auto-play-videos">Auto-play videos</Label>
                                <p className="text-sm text-muted-foreground">Videos will automatically play as you scroll.</p>
                            </div>
                            <Switch 
                                id="auto-play-videos"
                                checked={mediaSettings.autoPlayVideos}
                                onCheckedChange={(checked) => setMediaSettings(prev => ({...prev, autoPlayVideos: checked}))}
                            />
                        </div>
                        
                        <div>
                            <Label>High-quality uploads</Label>
                            <RadioGroup 
                                value={mediaSettings.highQualityUploads} 
                                onValueChange={(value) => setMediaSettings(prev => ({...prev, highQualityUploads: value as 'wifi' | 'always'}))} 
                                className="mt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="wifi" id="wifi" />
                                    <Label htmlFor="wifi" className="font-normal">Wi-Fi only</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="always" id="always" />
                                    <Label htmlFor="always" className="font-normal">On Cellular and Wi-Fi</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Compression settings</Label>
                                <p className="text-sm text-muted-foreground">Choose the quality for your image and video uploads.</p>
                            </div>
                            <Select
                                value={mediaSettings.imageCompression}
                                onValueChange={(value) => setMediaSettings(prev => ({...prev, imageCompression: value}))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select quality" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="best">Best Quality</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Download permissions</Label>
                                <p className="text-sm text-muted-foreground">Allow others to download and save your posts.</p>
                            </div>
                            <Select
                                value={mediaSettings.downloadPermissions}
                                onValueChange={(value) => setMediaSettings(prev => ({...prev, downloadPermissions: value}))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select permission" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="everyone">Everyone</SelectItem>
                                    <SelectItem value="friends">Friends Only</SelectItem>
                                    <SelectItem value="none">No One</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />
                        <div>
                             <Label>Archive Posts</Label>
                             <p className="text-sm text-muted-foreground mb-2">Hide posts from your profile without deleting them.</p>
                             <Button variant="outline">Manage Archived Posts</Button>
                        </div>

                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleMediaSave}>Save Media Settings</Button>
                    </CardFooter>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck />
                            Community &amp; Safety
                        </CardTitle>
                        <CardDescription>Tools and.
     resources to help you stay safe on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label>Report Abuse or Harassment</Label>
                            <p className="text-sm text-muted-foreground mb-2">Report content or behavior that violates our community guidelines.</p>
                            <Button variant="outline">
                                <Flag className="mr-2 h-4 w-4" /> Report an Issue
                            </Button>
                        </div>
                         <div>
                            <Label>Safety Check</Label>
                            <p className="text-sm text-muted-foreground mb-2">Review your blocked and muted accounts to ensure your safety.</p>
                            <Button variant="outline">
                                <ShieldQuestion className="mr-2 h-4 w-4" /> Review Accounts
                            </Button>
                        </div>
                        <div>
                            <Label>Trusted Contacts</Label>
                            <p className="text-sm text-muted-foreground mb-2">Choose friends who can help you recover your account if you get locked out.</p>
                            <Button variant="outline">
                                <UsersIcon className="mr-2 h-4 w-4" /> Manage Trusted Contacts
                            </Button>
                        </div>
                         <div>
                            <Label>Crisis Resources</Label>
                            <p className="text-sm text-muted-foreground mb-2">Find links to helplines and other support resources.</p>
                            <Button variant="outline">
                                <LifeBuoy className="mr-2 h-4 w-4" /> Get Help
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </MainLayout>
    );

    
}
