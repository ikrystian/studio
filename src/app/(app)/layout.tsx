
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { Loader2 } from 'lucide-react'; // For a minimal loader

export default function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
      if (!isLoggedIn) {
        // Redirect to login and indicate session might have expired or user is not logged in
        router.replace('/login?session_expired=true');
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [router]);

  if (isCheckingAuth) {
    // Display a minimal loader while checking authentication status.
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Sprawdzanie sesji...</p>
        </div>
    );
  }

  // Wrap content in a div with suppressHydrationWarning
  return (
    <div suppressHydrationWarning={true}>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
