
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

interface HeaderUserState {
  name: string;
  avatarUrl: string;
  initials: string;
  role: 'client' | 'trener' | 'admin';
}

const DEFAULT_HEADER_USER: HeaderUserState = {
  name: 'Gość',
  avatarUrl: '',
  initials: 'GO',
  role: 'client',
};

export function AppHeader() {
  const router = useRouter();
  const [headerUser, setHeaderUser] = React.useState<HeaderUserState>(DEFAULT_HEADER_USER);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProfileData = localStorage.getItem('currentUserProfileData');
      const loggedInEmail = localStorage.getItem('loggedInUserEmail');

      if (storedProfileData && loggedInEmail) {
        try {
          const profile = JSON.parse(storedProfileData);
          if (profile.email === loggedInEmail) { // Ensure data matches logged-in user
            setHeaderUser({
              name: profile.fullName || 'Użytkownik',
              avatarUrl: profile.avatarUrl || `https://placehold.co/100x100.png?text=${profile.fullName?.substring(0,1)}${profile.fullName?.split(' ')[1]?.substring(0,1) || ''}`,
              initials: `${profile.fullName?.substring(0,1)}${profile.fullName?.split(' ')[1]?.substring(0,1) || ''}`.toUpperCase() || 'U',
              role: profile.role || 'client', // Assuming role is stored in profileData
            });
          } else {
             // Logged-in email doesn't match stored profile, reset to default or handle error
             setHeaderUser(DEFAULT_HEADER_USER);
             console.warn("Logged in email mismatch with stored profile data for AppHeader.");
          }
        } catch (e) {
          console.error("Error parsing currentUserProfileData for AppHeader:", e);
          setHeaderUser(DEFAULT_HEADER_USER);
        }
      } else if (loggedInEmail === "test@example.com" && !storedProfileData) {
        // Fallback for test@example.com if its profile wasn't explicitly created by registration
         setHeaderUser({
            name: 'Test User',
            avatarUrl: 'https://placehold.co/100x100.png?text=TU',
            initials: 'TU',
            role: 'admin', // Test user might be admin
          });
      }
      else {
        setHeaderUser(DEFAULT_HEADER_USER);
      }
    }
  }, []); // Runs once on mount client-side

  const handleLogout = () => {
    console.log("User logging out...");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isUserLoggedIn');
      localStorage.removeItem('loggedInUserEmail');
      localStorage.removeItem('currentUserProfileData'); // Clear profile on logout
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
                  <AvatarImage src={headerUser.avatarUrl} alt={headerUser.name} data-ai-hint="profile avatar small"/>
                  <AvatarFallback>{headerUser.initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 app-header-user-dropdown" align="end" forceMount>
              <DropdownMenuLabel className="font-normal app-header-user-dropdown-label">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{headerUser.name}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="app-header-profile-link-item">
                <Link href="/dashboard/profile/current_user_id">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Mój Profil Publiczny</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="app-header-account-settings-link-item">
                 <Link href="/dashboard/account">
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span>Ustawienia Konta</span>
                </Link>
              </DropdownMenuItem>
                <DropdownMenuItem asChild className="app-header-admin-debug-link-item">
                  {/* Added a comment to force re-evaluation by Next.js */}
                  {/* Admin Debug Link */}
                  <Link href="/dashboard/admin/debug">
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span>Admin Debug</span>
                  </Link>
                </DropdownMenuItem>
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
