import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | WorkoutWise',
  description: 'Create your WorkoutWise account.',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="space-y-6 rounded-lg bg-card p-8 shadow-xl">
        <h1 className="text-4xl font-bold text-foreground">Create Your Account</h1>
        <p className="text-lg text-muted-foreground">This is where the registration form will be.</p>
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Registration is not yet implemented.</p>
            <Button asChild size="lg">
            <Link href="/login">Back to Login</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
