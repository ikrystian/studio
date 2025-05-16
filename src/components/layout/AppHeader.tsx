
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Corrected from 'next/navigation'
import { Dumbbell, UserCircle, LogOut, Settings2 } from 'lucide-react'; // Added Settings2 for consistency
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

// Mock user data for the header - Updated to match profile data
const MOCK_HEADER_USER = {
  name: 'Jan Kowalski', // Matched with MOCK_USER_PROFILES_DB for current_user_id
  avatarUrl: 'https://placehold.co/100x100.png?text=JK', // Matched
  initials: 'JK', // Matched
  profileLink: '/dashboard/profile/current_user_id', 
  accountSettingsLink: '/dashboard/account', 
};

export function AppHeader() {
  const router = useRouter();

  const handleLogout = () => {
    console.log("User logging out...");
    router.push('/login?status=logged_out'); 
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Dumbbell className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">WorkoutWise</span>
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={MOCK_HEADER_USER.avatarUrl} alt={MOCK_HEADER_USER.name} data-ai-hint="profile avatar small"/>
                  <AvatarFallback>{MOCK_HEADER_USER.initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{MOCK_HEADER_USER.name}</p>
                  {/* <p className="text-xs leading-none text-muted-foreground">
                    placeholder@example.com 
                  </p> */}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={MOCK_HEADER_USER.profileLink}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Mój Profil Publiczny</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href={MOCK_HEADER_USER.accountSettingsLink}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span>Ustawienia Konta</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
