
"use client"; // Make this a client component to use hooks

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';
import Image from 'next/image';
import { Dumbbell } from "lucide-react"; // For title next to form if needed

// This component handles the content of the login page.
// The main page component will handle overall layout and auth checks.
function LoginPageContent() {
  return <LoginForm />;
}

export default function LoginPage() {
  const router = useRouter();

  // Check if user is already logged in on component mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
      if (isLoggedIn) {
        router.replace('/dashboard'); // Redirect to dashboard if already logged in
      }
    }
  }, [router]);

  return (
    <main 
      className="flex min-h-screen flex-col md:flex-row text-foreground"
      style={{ 
        backgroundImage: "url('https://placehold.co/1920x1080.png?text=Fitness+Background')", // General placeholder
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      data-ai-hint="gym fitness equipment" // Hint for the full page background
    >
      {/* Image Panel - Hidden on mobile, visible on md and larger */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden">
        {/* This image will be overlaid on the main background, or be the primary visual if main bg is simple */}
        <Image
          src="https://placehold.co/1200x1800.png?text=Workout+Motivation" // Vertical placeholder for panel
          alt="Fitness motivation"
          width={1200}
          height={1800}
          style={{ objectFit: 'cover', opacity: 0.6 }} 
          priority
          className="absolute inset-0 w-full h-full"
          data-ai-hint="fitness workout gym" // Hint specific to this image panel
        />
        <div className="relative z-10 text-center p-8 text-white">
          <Dumbbell className="mx-auto h-24 w-24 text-primary mb-6" />
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">WorkoutWise</h1>
          <p className="text-xl lg:text-2xl text-primary-foreground/90 drop-shadow-md">
            Śledź swoje treningi. Osiągaj swoje cele. Bądź mądrzejszy w treningu.
          </p>
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 bg-background/90 md:bg-background backdrop-blur-md md:backdrop-blur-none">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center text-foreground p-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Ładowanie formularza logowania...</p>
          </div>
        }>
          <LoginPageContent />
        </Suspense>
      </div>
    </main>
  );
}
