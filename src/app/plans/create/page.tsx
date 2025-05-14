
// Placeholder for /plans/create page
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stwórz Nowy Plan | WorkoutWise',
  description: 'Zdefiniuj swój nowy plan treningowy.',
};

export default function CreateTrainingPlanPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
      <div className="text-center">
        <Construction className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Tworzenie Nowego Planu</h1>
        <p className="text-muted-foreground mb-6">
          Ta sekcja jest w budowie. Wkrótce będziesz mógł tutaj tworzyć spersonalizowane plany treningowe!
        </p>
        <Button asChild>
          <Link href="/plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć do Listy Planów
          </Link>
        </Button>
      </div>
    </div>
  );
}
