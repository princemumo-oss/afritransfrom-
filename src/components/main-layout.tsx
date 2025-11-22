

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquare, Users, Settings, Bell, Search, UserPlus, Heart, Zap, QrCode, Sparkles, Compass, Clapperboard, Bot, HardHat, LogOut, Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { User } from '@/lib/data';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Notification } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { QrScannerDialog } from './qr-scanner-dialog';
import { doc } from 'firebase/firestore';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();
  const currentUserDocRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: currentUserData, isLoading: isCurrentUserLoading } = useDoc<User>(currentUserDocRef);
  
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();


  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.replace('/login');
    }
  }, [isUserLoading, authUser, router]);

  useEffect(() => {
    // In a real app, you'd fetch this from a Firestore collection
    // For now, we'll keep it empty since mock data is removed.
    setNotifications([]);
  }, []);
  
  // Close mobile sidebar on navigation
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value;
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
        title: 'Notifications updated',
        description: 'All notifications have been marked as read.',
    });
  };

  const handleLogout = async () => {
    await auth.signOut();
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login'); // Redirect to login page after sign out
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const navItems = [
    { href: '/', icon: Home, label: 'Feed', tooltip: 'Feed', color: 'text-blue-500' },
    { href: '/explore', icon: Compass, label: 'Explore', tooltip: 'Explore', color: 'text-orange-500' },
    { href: '/reels', icon: Clapperboard, label: 'Reels', tooltip: 'Reels', color: 'text-purple-500' },
    { href: '/connect', icon: Zap, label: 'Connect', tooltip: 'Connect', color: 'text-yellow-500' },
    { href: '/messages', icon: MessageSquare, label: 'Messages', tooltip: 'Messages', color: 'text-green-500' },
    { href: '/chatbot', icon: Bot, label: 'Chatbot', tooltip: 'Chatbot', color: 'text-indigo-500' },
    { href: '/friends', icon: Users, label: 'Friends', tooltip: 'Friends', color: 'text-pink-500' },
    { href: '/ai', icon: Sparkles, label: 'AI Tools', tooltip: 'AI Tools', color: 'text-teal-500' },
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'friend_request':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  }

  const handleScanSuccess = (result: string) => {
    setIsScannerOpen(false);
    if (result.startsWith(window.location.origin) && result.includes('/profile/')) {
        router.push(result);
        toast({
            title: 'QR Code Scanned!',
            description: 'Navigating to user profile...',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid QR Code',
            description: 'The scanned QR code does not contain a valid profile URL for this app.',
        });
    }
  };

  if (isUserLoading || !authUser || isCurrentUserLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
    );
  }

  const NotificationsContent = () => (
    <Card className="border-0 shadow-none">
        <CardHeader className='p-4'>
        <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0 max-h-96 overflow-y-auto">
        <div className="flex flex-col">
            {notifications.map((notification) => (
            <div key={notification.id} className={cn("flex items-start gap-3 p-4", !notification.read && "bg-accent/50")}>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-background'>
                    {getNotificationIcon(notification.type)}
                </div>
                <div className="text-sm">
                    <p>
                        <span className="font-semibold">{notification.user.firstName}</span>
                        {notification.type === 'like' && ' liked your post.'}
                        {notification.type === 'comment' && ' commented on your post.'}
                        {notification.type === 'friend_request' && ' sent you a friend request.'}
                    </p>
                    <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                </div>
            </div>
            ))}
            {notifications.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>}
        </div>
        </CardContent>
        <CardFooter className="p-2 border-t">
            <Button variant="link" size="sm" className="w-full" onClick={markAllAsRead} disabled={unreadNotifications === 0}>
            Mark all as read
            </Button>
        </CardFooter>
    </Card>
  )

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="hidden border-r bg-card dark:bg-zinc-900/50 md:flex"
      >
        <SidebarHeader className="border-b justify-center">
          <Link href="/" className="flex items-center justify-center p-2 text-lg font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-primary"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
            </svg>
            <span className="sr-only group-data-[collapsible=icon]:hidden">afritransform</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="flex-1 p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.tooltip} isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon className={cn(item.color)} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
           <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Scan QR Code" onClick={() => setIsScannerOpen(true)}>
                  <div>
                    <QrCode />
                    <span>Scan QR</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Notifications">
                            <div className='relative'>
                                <Bell/>
                                <span>Notifications</span>
                                {unreadNotifications > 0 && (
                                    <span className="absolute right-0 top-0 flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                                    </span>
                                )}
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                    <NotificationsContent />
                </PopoverContent>
             </Popover>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Profile" isActive={pathname.startsWith('/profile')}>
                    <Link href="/profile/me">
                        {currentUserData && <Avatar className="h-7 w-7">
                            <AvatarImage src={currentUserData.avatarUrl} alt={currentUserData.firstName} />
                            <AvatarFallback>{currentUserData.firstName?.charAt(0)}</AvatarFallback>
                        </Avatar>}
                        <span className="truncate">{authUser.displayName || 'Profile'}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
                    <LogOut className="text-red-500" />
                    <span>Log Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />
           <Link href="/" className="text-lg font-bold md:hidden">afritransform</Link>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-muted pl-8 md:w-[280px] lg:w-[320px]"
              onKeyDown={handleSearch}
            />
          </div>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsScannerOpen(true)}>
                <QrCode className="h-5 w-5" />
                <span className="sr-only">Scan QR Code</span>
            </Button>
            <QrScannerDialog
                open={isScannerOpen}
                onOpenChange={setIsScannerOpen}
                onScan={handleScanSuccess}
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute right-0 top-0 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                    </span>
                  )}
                  <span className="sr-only">Toggle notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <NotificationsContent />
              </PopoverContent>
            </Popover>

            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </div>
        </header>
        <SidebarInset>
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </div>
    </div>
  );
}


export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </SidebarProvider>
  );
}
