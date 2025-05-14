
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ArrowLeft,
  FileText,
  Clock,
  Dumbbell,
  ListOrdered,
  TrendingUp,
  StickyNote,
  Edit,
  Trash2,
  Repeat,
  Loader2,
  AlertTriangle,
  BarChart,
  Weight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { HistoricalWorkoutSession } from "../page"; // Import from parent

// Re-using MOCK_HISTORY_SESSIONS for simplicity in this example
// In a real app, you'd fetch this session by ID from a backend
const MOCK_HISTORY_SESSIONS_FOR_DETAIL: HistoricalWorkoutSession[] = [
  {
    id: "hist1",
    workoutId: "wk1",
    workoutName: "Poranny Trening Siłowy",
    workoutType: "Siłowy",
    startTime: "2024-07-25T08:00:00.000Z",
    endTime: "2024-07-25T09:00:00.000Z",
    totalTimeSeconds: 3600,
    recordedSets: {
      ex1: [{ setNumber: 1, weight: "60", reps: "10", notes: "Good form" }, { setNumber: 2, weight: "65", reps: "8" }],
      ex2: [{ setNumber: 1, weight: "100", reps: "5" }],
    },
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
      { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 4, defaultReps: "10-12", defaultRest: 120 },
    ],
    difficulty: "Średni" as any, // Cast for mock data
    generalNotes: "Feeling strong today!",
    calculatedTotalVolume: (60*10) + (65*8) + (100*5),
  },
  {
    id: "hist2",
    workoutId: "wk2",
    workoutName: "Szybkie Cardio HIIT",
    workoutType: "Cardio",
    startTime: "2024-07-27T17:30:00.000Z",
    endTime: "2024-07-27T18:00:00.000Z",
    totalTimeSeconds: 1800,
    recordedSets: {
      ex6: [{ setNumber: 1, weight: "N/A", reps: "30 min" }],
    },
    exercises: [{ id: "ex6", name: "Bieg na bieżni (30 min)", defaultSets: 1, defaultReps: "30 min", defaultRest: 0 }],
    difficulty: "Trudny" as any, // Cast for mock data
    generalNotes: "Tough session, pushed hard.",
    calculatedTotalVolume: 0,
  },
   {
    id: "hist3",
    workoutId: "wk1",
    workoutName: "Poranny Trening Siłowy",
    workoutType: "Siłowy",
    startTime: "2024-07-29T08:15:00.000Z",
    endTime: "2024-07-29T09:20:00.000Z",
    totalTimeSeconds: 3900,
    recordedSets: {
      ex1: [{ setNumber: 1, weight: "65", reps: "10" }, { setNumber: 2, weight: "70", reps: "8"}, { setNumber: 3, weight: "70", reps: "7"}],
      ex2: [{ setNumber: 1, weight: "100", reps: "6" }, { setNumber: 2, weight: "105", reps: "5"}],
      ex4: [{ setNumber: 1, weight: "BW", reps: "8" }, { setNumber: 2, weight: "BW", reps: "7"}],
    },
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej" },
      { id: "ex2", name: "Przysiady ze sztangą" },
      { id: "ex4", name: "Podciąganie na drążku" },
    ],
    difficulty: "Średni" as any,
    calculatedTotalVolume: (65*10) + (70*8) + (70*7) + (100*6) + (105*5),
  },
];


const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours > 0 ? String(hours).padStart(2, "0") + "h " : ""}${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
};

export default function WorkoutHistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] = React.useState<HistoricalWorkoutSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const foundSession = MOCK_HISTORY_SESSIONS_FOR_DETAIL.find(s => s.id === sessionId);
      if (foundSession) {
        setSessionData(foundSession);
      } else {
        toast({ title: "Błąd", description: "Nie znaleziono sesji treningowej.", variant: "destructive" });
        router.replace("/history");
      }
      setIsLoading(false);
    }, 500);
  }, [sessionId, router, toast]);

  const handleDeleteSession = async () => {
    setIsDeleting(true);
    // Simulate API call for deletion
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Sesja usunięta",
      description: `Sesja treningowa "${sessionData?.workoutName}" została usunięta.`,
      variant: "default",
    });
    router.replace("/history");
    setIsDeleting(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Ładowanie szczegółów sesji...</p>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Błąd Krytyczny</AlertTitle>
          <AlertDescription>
            Nie udało się załadować danych sesji.
            <Button onClick={() => router.push('/history')} className="mt-4 w-full">Wróć do Historii</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/history">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Historii</span>
              </Link>
            </Button>
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold truncate max-w-xs sm:max-w-md" title={sessionData.workoutName}>
              {sessionData.workoutName}
            </h1>
          </div>
          {/* Placeholder for potential actions like share, export */}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{sessionData.workoutName}</CardTitle>
              <CardDescription>
                Data: {format(parseISO(sessionData.startTime), "PPPp", { locale: pl })}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Całkowity Czas</p>
                  <p>{formatTime(sessionData.totalTimeSeconds)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <Weight className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Całkowity Ciężar</p>
                  <p>{sessionData.calculatedTotalVolume.toLocaleString('pl-PL')} kg</p>
                </div>
              </div>
              {sessionData.difficulty && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <BarChart className="h-5 w-5 text-primary" /> {/* Placeholder icon */}
                  <div>
                    <p className="font-semibold">Ocena Trudności</p>
                    <p>{sessionData.difficulty}</p>
                  </div>
                </div>
              )}
            </CardContent>
             {sessionData.generalNotes && (
                <CardFooter className="flex-col items-start pt-4 border-t">
                    <h4 className="font-semibold mb-1 flex items-center gap-1"><StickyNote className="h-4 w-4 text-primary"/> Ogólne Notatki:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sessionData.generalNotes}</p>
                </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListOrdered className="h-6 w-6 text-primary"/>Wykonane Ćwiczenia</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionData.exercises.filter(ex => sessionData.recordedSets[ex.id]?.length > 0).length > 0 ? (
                <ul className="space-y-4">
                  {sessionData.exercises.map((exercise) => {
                    const sets = sessionData.recordedSets[exercise.id];
                    if (!sets || sets.length === 0) return null;

                    return (
                      <li key={exercise.id}>
                        <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>
                        <ul className="space-y-1 pl-4 text-sm text-muted-foreground">
                          {sets.map((set, index) => (
                            <li key={index} className="list-disc list-inside">
                              Seria {set.setNumber}: {set.weight} x {set.reps} powt.
                              {set.rpe && ` (RPE: ${set.rpe})`}
                              {set.notes && <span className="italic text-xs block pl-2"> - Notatka: {set.notes}</span>}
                            </li>
                          ))}
                        </ul>
                        {sessionData.exercises.filter(ex => sessionData.recordedSets[ex.id]?.length > 0).indexOf(exercise) < sessionData.exercises.filter(ex => sessionData.recordedSets[ex.id]?.length > 0).length - 1 && (
                            <Separator className="my-3"/>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-muted-foreground">Nie zarejestrowano żadnych serii dla tej sesji.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Dumbbell className="h-6 w-6 text-primary"/>Akcje</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="w-full sm:w-auto" disabled> {/* Placeholder */}
                    <Repeat className="mr-2 h-4 w-4" /> Powtórz Trening
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" disabled> {/* Placeholder */}
                    <Edit className="mr-2 h-4 w-4" /> Edytuj Wpis
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto" disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" /> Usuń Wpis
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Usunąć wpis z historii?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Czy na pewno chcesz usunąć tę sesję treningową z historii? Tej akcji nie można cofnąć.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSession} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? <Loader2 className="animate-spin mr-2"/> : null}
                            Potwierdź i usuń
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
