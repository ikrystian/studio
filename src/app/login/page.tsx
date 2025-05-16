
import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';

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
    <main 
      className="flex min-h-screen flex-col items-center justify-center bg-background bg-cover bg-center p-4 sm:p-6 md:p-8"
      style={{ backgroundImage: "url('https://placehold.co/1920x1080.png')" }}
      data-ai-hint="gym background"
    >
      <Suspense fallback={<div className="text-foreground">Loading...</div>}> {/* Fallback UI for Suspense */}
        <LoginPageContent />
      </Suspense>
    </main>
  );
}
