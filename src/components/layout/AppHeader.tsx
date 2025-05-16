
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, UserCircle, LogOut, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const MOCK_HEADER_USER = {
  name: 'Jan Kowalski',
  avatarUrl: 'https://placehold.co/100x100.png?text=JK',
  initials: 'JK',
  profileLink: '/dashboard/profile/current_user_id',
  accountSettingsLink: '/dashboard/account',
  role: 'admin',
};

export function AppHeader() {
  const router = useRouter();

  const handleLogout = () => {
    console.log("User logging out...");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isUserLoggedIn');
      localStorage.removeItem('loggedInUserEmail');
    }
    router.push('/login?status=logged_out');
  };

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", "app-header")}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 app-header-container">
        <Link href="/dashboard" className="flex items-center gap-2 app-header-logo-link">
          <Dumbbell className="h-7 w-7 text-primary app-header-logo-icon" />
          <span className="text-xl font-bold app-header-title">WorkoutWise</span>
        </Link>

        <div className="flex items-center gap-4 app-header-actions">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full app-header-user-menu-trigger">
                <Avatar className="h-9 w-9 app-header-user-avatar">
                  <AvatarImage src={MOCK_HEADER_USER.avatarUrl} alt={MOCK_HEADER_USER.name} data-ai-hint="profile avatar small"/>
                  <AvatarFallback>{MOCK_HEADER_USER.initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 app-header-user-dropdown" align="end" forceMount>
              <DropdownMenuLabel className="font-normal app-header-user-dropdown-label">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{MOCK_HEADER_USER.name}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="app-header-profile-link-item">
                <Link href={MOCK_HEADER_USER.profileLink}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Mój Profil Publiczny</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="app-header-account-settings-link-item">
                 <Link href={MOCK_HEADER_USER.accountSettingsLink}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span>Ustawienia Konta</span>
                </Link>
              </DropdownMenuItem>
              {MOCK_HEADER_USER.role === 'admin' && (
                <DropdownMenuItem asChild className="app-header-admin-debug-link-item">
                  <Link href="/dashboard/admin/debug">
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span>Admin Debug</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 app-header-logout-button">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Wyloguj</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
