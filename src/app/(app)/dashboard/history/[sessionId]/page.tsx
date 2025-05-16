
"use client";

import * as React from "react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Info, History as HistoryIcon, Loader2 } from 'lucide-react';
import { WorkoutSessionDetailSkeleton } from "@/components/history/WorkoutSessionDetailSkeleton"; // Import skeleton

export default function WorkoutSessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 750); // Adjust delay as needed
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isLoading) {
    return <WorkoutSessionDetailSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 md:p-8 text-foreground">
       <header className="sticky top-16 z-30 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50 mb-8">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/history">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Historii</span>
              </Link>
            </Button>
            <HistoryIcon className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Szczegóły Sesji Treningowej</h1>
          </div>
        </div>
      </header>
      <Card className="w-full max-w-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
                <Info className="h-6 w-6 text-primary" />
                Sesja Treningowa
            </CardTitle>
            <CardDescription>ID Sesji: <span className="font-semibold text-primary">{sessionId}</span></CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Ta sekcja jest w budowie. Wkrótce będziesz mógł tutaj przeglądać szczegółowe dane dotyczące tej konkretnej sesji treningowej, w tym wykonane ćwiczenia, serie, powtórzenia, notatki i inne statystyki.
          </p>
          <p className="text-sm text-muted-foreground">
            Na przykład, mogłyby tu być wyświetlane:
          </p>
          <ul className="list-disc list-inside text-left text-sm text-muted-foreground my-4 ml-4">
            <li>Nazwa oryginalnego treningu</li>
            <li>Dokładna data i godzina rozpoczęcia/zakończenia</li>
            <li>Lista ćwiczeń z zapisanymi seriami (ciężar, powtórzenia, RPE)</li>
            <li>Notatki do poszczególnych ćwiczeń i ogólne notatki do sesji</li>
            <li>Ocena trudności treningu</li>
            <li>Porównanie z poprzednim wykonaniem tego samego treningu (jeśli dotyczy)</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/dashboard/history">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wróć do Historii Treningów
              </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
