
import { Skeleton } from '@/components/ui/skeleton';
import { Dumbbell, Loader2 } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Skeleton for AppHeader */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-primary/50 animate-pulse" />
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </header>

      {/* Skeleton for main content area - Generic loading screen */}
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Ładowanie aplikacji...</p>
      </main>
    </div>
  );
}
