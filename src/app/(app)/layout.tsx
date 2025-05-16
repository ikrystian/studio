
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import RootLoading from '@/app/loading'; // Import the root loading component

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
    // Display a full-page loading skeleton while checking authentication status.
    // This assumes RootLoading is suitable for this initial auth check display.
    return <RootLoading />;
  }

  return (
    <>
      <AppHeader />
      <main>{children}</main>
    </>
  );
}
