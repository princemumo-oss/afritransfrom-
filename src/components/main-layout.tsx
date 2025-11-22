'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Users, Settings, Bell, Search } from 'lucide-react';

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

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = users.find(u => u.name === 'You');

  const navItems = [
    { href: '/', icon: Home, label: 'Feed', tooltip: 'Feed' },
    { href: '/messages', icon: MessageSquare, label: 'Messages', tooltip: 'Messages' },
    { href: '/friends', icon: Users, label: 'Friends', tooltip: 'Friends' },
  ];

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
            <span className="group-data-[collapsible=icon]:hidden">LinkUp</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="flex-1 p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.tooltip} isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon />
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
              placeholder="Search..."
              className="w-full rounded-lg bg-card pl-8 md:w-[280px] lg:w-[320px]"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
             <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
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
