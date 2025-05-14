import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | WorkoutWise',
  description: 'Your WorkoutWise dashboard.',
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="space-y-6 rounded-lg bg-card p-8 shadow-xl">
        <h1 className="text-4xl font-bold text-foreground">Welcome to the Dashboard!</h1>
        <p className="text-lg text-muted-foreground">You have successfully logged in.</p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/login">Log Out</Link>
        </Button>
      </div>
    </div>
  );
}
