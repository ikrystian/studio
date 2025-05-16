
import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image'; // Import next/image

export const metadata: Metadata = {
  title: 'Login | WorkoutWise',
  description: 'Login to your WorkoutWise account.',
};

// Wrap the component that uses useSearchParams in Suspense
function LoginPageContent() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row bg-background text-foreground">
      {/* Image Panel - Hidden on mobile, visible on md and larger */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative items-center justify-center bg-muted overflow-hidden">
        <Image
          src="https://placehold.co/1200x1800.png" // Taller image for better coverage
          alt="Fitness motivation"
          fill
          style={{ objectFit: 'cover' }} // Ensures image covers the div
          priority // Load image faster as it's important for LCP on desktop
          data-ai-hint="fitness workout gym"
        />
        {/* You can add an overlay or text on top of the image here if needed */}
        {/* e.g. <div className="absolute inset-0 bg-black/30"></div> */}
      </div>

      {/* Login Form Panel */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12">
        <Suspense fallback={<div className="text-foreground text-center p-10">Loading login form...</div>}>
          <LoginPageContent />
        </Suspense>
      </div>
    </main>
  );
}
