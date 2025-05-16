
// Placeholder for /plans/[planId] page
"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
// import type { Metadata } from 'next'; // Metadata cannot be dynamic in client components easily

// If you need dynamic metadata, this should be a server component or use a different approach.
// export async function generateMetadata({ params }: { params: { planId: string } }): Promise<Metadata> {
//   return {
//     title: `Szczegóły Planu ${params.planId} | WorkoutWise`,
//   };
// }

export default function TrainingPlanDetailPage() {
  const params = useParams();
  const planId = params.planId as string;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
      <div className="text-center">
        <Info className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Szczegóły Planu Treningowego</h1>
        <p className="text-muted-foreground mb-1">ID Planu: <span className="font-semibold text-primary">{planId}</span></p>
        <p className="text-muted-foreground mb-6">
          Ta sekcja jest w budowie. Wkrótce będziesz mógł tutaj przeglądać szczegóły wybranego planu treningowego.
        </p>
        <Button asChild>
          <Link href="/dashboard/plans"> {/* Updated link to new path */}
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć do Listy Planów
          </Link>
        </Button>
      </div>
    </div>
  );
}
