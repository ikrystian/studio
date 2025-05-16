
"use client";

import * as React from "react";
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { format, parseISO, isValid } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Info, History as HistoryIcon, Loader2, Dumbbell, Clock, TrendingUp, ListOrdered, RotateCcw, Edit3, Target } from 'lucide-react';
import { WorkoutSessionDetailSkeleton } from "@/components/history/WorkoutSessionDetailSkeleton";
import { MOCK_HISTORY_SESSIONS, type HistoricalWorkoutSession, type RecordedSet } from "@/lib/mockData"; // Import from centralized mockData
import { useToast } from "@/hooks/use-toast"; // Import useToast

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  return `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
};

const calculateExerciseVolume = (sets: RecordedSet[]): number => {
  let volume = 0;
  sets.forEach(set => {
    const weight = parseFloat(String(set.weight));
    const reps = parseInt(String(set.reps), 10);
    if (!isNaN(weight) && !isNaN(reps) && weight > 0 && reps > 0) {
      volume += weight * reps;
    }
  });
  return volume;
};

export default function WorkoutSessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params
  const { toast } = useToast(); // Initialize toast
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] = React.useState<HistoricalWorkoutSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);
    // Simulate data fetching
    const timer = setTimeout(() => {
      const foundSession = MOCK_HISTORY_SESSIONS.find(s => s.id === sessionId);
      if (foundSession) {
        setSessionData(foundSession);
      } else {
        setError(`Nie znaleziono sesji treningowej o ID: ${sessionId}`);
        toast({
            title: "Błąd",
            description: `Nie znaleziono sesji treningowej o ID: ${sessionId}`,
            variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 750); 
    return () => clearTimeout(timer);
  }, [sessionId, toast]);

  const handleRepeatWorkout = () => {
    if (sessionData) {
      router.push(`/dashboard/workout/active/${sessionData.workoutId}?repeatSessionId=${sessionData.id}`);
    }
  };

  if (isLoading) {
    return <WorkoutSessionDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
        <Alert variant="destructive" className="max-w-lg">
          <Info className="h-4 w-4" />
          <AlertTitle>Błąd ładowania sesji</AlertTitle>
          <AlertDescription>
            {error}
            <Button asChild variant="link" className="mt-2 block p-0 h-auto">
              <Link href="/dashboard/history">Wróć do Historii</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!sessionData) {
    // Should be caught by error state, but as a fallback
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
             <Alert variant="destructive" className="max-w-lg">
                <Info className="h-4 w-4" />
                <AlertTitle>Brak Danych</AlertTitle>
                <AlertDescription>
                    Nie można wyświetlić szczegółów tej sesji.
                    <Button asChild variant="link" className="mt-2 block p-0 h-auto">
                    <Link href="/dashboard/history">Wróć do Historii</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
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
            <h1 className="text-xl font-bold truncate max-w-xs sm:max-w-md md:max-w-lg" title={sessionData.workoutName}>
              {sessionData.workoutName}
            </h1>
          </div>
          <Button onClick={handleRepeatWorkout} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" /> Powtórz Trening
          </Button>
        </div>
      </header>
      
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{sessionData.workoutName}</CardTitle>
              <CardDescription>
                Data: {isValid(parseISO(sessionData.startTime)) ? format(parseISO(sessionData.startTime), "PPPp", { locale: pl }) : "Nieprawidłowa data"}
                <br />
                Typ: {sessionData.workoutType}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Czas Trwania</p>
                    <p>{formatTime(sessionData.totalTimeSeconds)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Całkowita Objętość</p>
                    <p>{sessionData.calculatedTotalVolume.toLocaleString('pl-PL')} kg</p>
                  </div>
                </div>
                {sessionData.difficulty && (
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md sm:col-span-2">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Ocena Trudności</p>
                      <p>{sessionData.difficulty}</p>
                    </div>
                  </div>
                )}
              </div>
              {sessionData.generalNotes && (
                <div>
                  <h4 className="font-semibold mb-1 mt-3 flex items-center gap-1"><Edit3 className="h-4 w-4"/>Notatki Ogólne do Sesji:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/20 p-3 rounded-md">{sessionData.generalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListOrdered className="h-6 w-6 text-primary"/>Wykonane Ćwiczenia</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionData.exercises.filter(ex => sessionData.recordedSets[ex.id]?.length > 0).length > 0 ? (
                <ScrollArea className="max-h-[60vh] pr-3">
                  <ul className="space-y-6">
                    {sessionData.exercises.map((exercise) => {
                      const sets = sessionData.recordedSets[exercise.id];
                      if (!sets || sets.length === 0) return null;
                      
                      const exerciseVolume = calculateExerciseVolume(sets);

                      return (
                        <li key={exercise.id} className="pb-4 border-b last:border-b-0">
                          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-primary/80"/>
                            {exercise.name}
                          </h3>
                          {exerciseVolume > 0 && (
                              <p className="text-xs text-muted-foreground mb-2">Objętość dla ćwiczenia: {exerciseVolume.toLocaleString('pl-PL')} kg</p>
                          )}
                          <Table className="text-xs sm:text-sm">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[15%]">Seria</TableHead>
                                <TableHead className="w-[25%]">Ciężar</TableHead>
                                <TableHead className="w-[25%]">Powt./Czas</TableHead>
                                <TableHead className="w-[15%] text-center">RPE</TableHead>
                                <TableHead className="w-[20%]">Notatki</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sets.map((set, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{set.setNumber}</TableCell>
                                  <TableCell>{set.weight}</TableCell>
                                  <TableCell>{set.reps}</TableCell>
                                  <TableCell className="text-center">{set.rpe || "-"}</TableCell>
                                  <TableCell className="italic text-muted-foreground truncate max-w-[100px] sm:max-w-[150px]" title={set.notes || undefined}>
                                    {set.notes || "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nie zarejestrowano żadnych serii dla ćwiczeń w tej sesji.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
