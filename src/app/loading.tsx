
import { Loader2 } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">Ładowanie aplikacji...</p>
    </div>
  );
}
