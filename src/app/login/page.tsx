
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Suspense fallback={<div>Loading...</div>}> {/* Fallback UI for Suspense */}
        <LoginPageContent />
      </Suspense>
    </main>
  );
}

    