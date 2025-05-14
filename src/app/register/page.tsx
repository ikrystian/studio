
import { RegistrationForm } from '@/components/auth/registration-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | WorkoutWise',
  description: 'Create your WorkoutWise account.',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <RegistrationForm />
    </main>
  );
}

    