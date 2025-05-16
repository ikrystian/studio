
import { Loader2 } from "lucide-react";

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Ładowanie strony logowania...</p>
    </main>
  );
}
