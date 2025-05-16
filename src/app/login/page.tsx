
"use client"; // Make this a client component to use hooks

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next'; // Metadata is fine here but won't be dynamic
import { Suspense } from 'react';
import Image from 'next/image';

// Cannot use generateMetadata in client components
// export const metadata: Metadata = {
//   title: 'Login | WorkoutWise',
//   description: 'Login to your WorkoutWise account.',
// };

function LoginPageContent() {
  return <LoginForm />;
}

export default function LoginPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
      if (isLoggedIn) {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  return (
    <main 
      className="flex min-h-screen flex-col md:flex-row text-foreground"
      style={{ 
        backgroundImage: "url('https://placehold.co/1920x1080.png')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }}
      data-ai-hint="gym background"
    >
      {/* Image Panel - Hidden on mobile, visible on md and larger */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative items-center justify-center bg-muted/30 backdrop-blur-sm overflow-hidden">
        <Image
          src="https://placehold.co/1200x1800.png"
          alt="Fitness motivation"
          fill
          style={{ objectFit: 'cover', opacity: 0.8 }} 
          priority
          data-ai-hint="fitness workout gym"
        />
      </div>

      {/* Login Form Panel */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 bg-background/80 md:bg-background/90 backdrop-blur-md md:backdrop-blur-none rounded-lg md:rounded-none">
        <Suspense fallback={<div className="text-foreground text-center p-10">Loading login form...</div>}>
          <LoginPageContent />
        </Suspense>
      </div>
    </main>
  );
}
