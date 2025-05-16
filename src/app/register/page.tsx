
"use client"; // Make this a client component to use hooks

import * as React from "react";
import { useRouter } from "next/navigation";
import { RegistrationForm } from '@/components/auth/registration-form';
import type { Metadata } from 'next'; // Metadata is fine here but won't be dynamic

// Cannot use generateMetadata in client components
// export const metadata: Metadata = {
//   title: 'Register | WorkoutWise',
//   description: 'Create your WorkoutWise account.',
// };

export default function RegisterPage() {
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <RegistrationForm />
    </main>
  );
}
