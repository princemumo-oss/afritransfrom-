
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquare, Users, Settings, Bell, Search, UserPlus, Heart, Zap, QrCode } from 'lucide-react';
import React from 'react';

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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { users } from '@/lib/data';
import type { Notification } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { QrScannerDialog } from './qr-scanner-dialog';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = users.find(u => u.name === 'You');

  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    // In a real app, you'd fetch this from an API
    import('@/lib/data').then(data => setNotifications(data.notifications));
  }, []);

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

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const navItems = [
    { href: '/', icon: Home, label: 'Feed', tooltip: 'Feed', color: 'text-sky-500' },
    { href: '/messages', icon: MessageSquare, label: 'Messages', tooltip: 'Messages', color: 'text-purple-500' },
    { href: '/friends', icon: Users, label: 'Friends', tooltip: 'Friends', color: 'text-emerald-500' },
    { href: '/connect', icon: Zap, label: 'Connect', tooltip: 'Connect', color: 'text-yellow-500' },
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
    // Assuming the QR code contains a URL to the profile
    setIsScannerOpen(false);
    // basic validation
    if (result.startsWith('http') || result.startsWith('/')) {
        router.push(result);
        toast({
            title: 'QR Code Scanned!',
            description: 'Navigating to user profile...',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid QR Code',
            description: 'The scanned QR code does not contain a valid URL.',
        });
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="hidden border-r bg-card dark:bg-zinc-900/50 md:flex"
      >
        <SidebarHeader className="border-b">
          <Link href="/" className="flex items-center gap-2 p-2 text-lg font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
            </svg>
            <span className="group-data-[collapsible=icon]:hidden">afritransform</span>
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
                <SidebarMenuButton asChild tooltip="Profile" isActive={pathname.startsWith('/profile')}>
                    <Link href="/profile/me">
                        {currentUser && <Avatar className="h-7 w-7">
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>}
                        <span className="truncate">{currentUser?.name ?? 'Profile'}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search everything..."
              className="w-full rounded-lg bg-card pl-8 md:w-[280px] lg:w-[320px]"
              onKeyDown={handleSearch}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
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
                  <Bell className="h-5 w-5 text-yellow-500" />
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
                <Card className="border-0 shadow-none">
                  <CardHeader className='p-4'>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={cn("flex items-start gap-3 p-4", !notification.read && "bg-accent/50")}>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-background'>
                             {getNotificationIcon(notification.type)}
                          </div>
                          <div className="text-sm">
                              <p>
                                  <span className="font-semibold">{notification.user.name}</span>
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
              </PopoverContent>
            </Popover>

            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link href="/settings">
                <Settings className="h-5 w-5 text-gray-500" />
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
