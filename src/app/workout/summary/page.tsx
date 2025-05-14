
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dumbbell,
  Clock,
  TrendingUp,
  StickyNote,
  ListOrdered,
  Save,
  Trash2,
  AlertTriangle,
  Info,
  CalendarDays,
  Flame,
  Weight,
  Loader2,
  Edit2, // For exercise notes icon
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Workout, ExerciseInWorkout, RecordedSet } from "../active/[workoutId]/page";
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

interface WorkoutSummaryData {
  workoutId: string;
  workoutName: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  totalTimeSeconds: number;
  recordedSets: Record<string, RecordedSet[]>; // exerciseId -> sets
  exercises: ExerciseInWorkout[];
  exerciseNotes?: Record<string, string>; // Added for exercise-specific notes
}

enum DifficultyRating {
  BardzoLatwy = "Bardzo Łatwy",
  Latwy = "Łatwy",
  Sredni = "Średni",
  Trudny = "Trudny",
  BardzoTrudny = "Bardzo Trudny",
  Ekstremalny = "Ekstremalny",
}

export default function WorkoutSummaryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [summaryData, setSummaryData] = React.useState<WorkoutSummaryData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [generalNotes, setGeneralNotes] = React.useState("");
  const [difficulty, setDifficulty] = React.useState<DifficultyRating | undefined>(undefined);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const dataString = localStorage.getItem('workoutSummaryData');
    if (dataString) {
      try {
        const parsedData: WorkoutSummaryData = JSON.parse(dataString);
        setSummaryData(parsedData);
      } catch (error) {
        console.error("Error parsing summary data from localStorage:", error);
        toast({ title: "Błąd", description: "Nie udało się załadować podsumowania treningu.", variant: "destructive" });
        router.replace("/dashboard"); 
      }
    } else {
      toast({ title: "Brak danych", description: "Nie znaleziono danych do podsumowania treningu.", variant: "destructive" });
      router.replace("/dashboard"); 
    }
    setIsLoading(false);
  }, [router, toast]);

  const calculateTotalVolume = React.useCallback(() => {
    if (!summaryData) return 0;
    let totalVolume = 0;
    Object.values(summaryData.recordedSets).forEach(exerciseSets => {
      exerciseSets.forEach(set => {
        const weight = parseFloat(String(set.weight));
        const reps = parseInt(String(set.reps), 10);
        if (!isNaN(weight) && !isNaN(reps) && weight > 0 && reps > 0) {
          totalVolume += weight * reps;
        }
      });
    });
    return totalVolume;
  }, [summaryData]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? String(hours).padStart(2, "0") + "h " : ""}${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  };

  const handleSaveWorkout = async () => {
    if (!summaryData) return;
    setIsSaving(true);
    const fullSummaryToSave = {
      ...summaryData,
      difficulty,
      generalNotes, // General notes for the whole workout
      exerciseNotes: summaryData.exerciseNotes, // Exercise specific notes are already in summaryData
      calculatedTotalVolume: calculateTotalVolume(),
    };
    console.log("Saving workout summary:", fullSummaryToSave);


    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Trening Zapisany!",
      description: "Twoje podsumowanie treningu zostało zapisane.",
      variant: "default"
    });
    localStorage.removeItem('workoutSummaryData');
    router.push("/dashboard");
    setIsSaving(false);
  };

  const handleDiscardWorkout = async () => {
    setIsSaving(true); 
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.removeItem('workoutSummaryData');
    toast({
      title: "Trening Odrzucony",
      description: "Podsumowanie treningu zostało odrzucone.",
      variant: "default" 
    });
    router.push("/dashboard");
    setIsSaving(false);
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Ładowanie podsumowania...</p>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Błąd Krytyczny</AlertTitle>
          <AlertDescription>
            Nie udało się załadować danych podsumowania. Spróbuj ponownie później lub skontaktuj się z pomocą techniczną.
            <Button onClick={() => router.push('/dashboard')} className="mt-4 w-full">Wróć do Panelu</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const totalVolume = calculateTotalVolume();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Podsumowanie Treningu</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{summaryData.workoutName}</CardTitle>
              <CardDescription>
                Data: {new Date(summaryData.startTime).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Całkowity Czas</p>
                  <p>{formatTime(summaryData.totalTimeSeconds)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <Weight className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Całkowity Podniesiony Ciężar</p>
                  <p>{totalVolume.toLocaleString('pl-PL')} kg</p>
                  <p className="text-xs text-muted-foreground">(Suma: ciężar x powtórzenia dla serii numerycznych)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListOrdered className="h-6 w-6 text-primary"/>Wykonane Ćwiczenia</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryData.exercises.filter(ex => summaryData.recordedSets[ex.id]?.length > 0).length > 0 ? (
                <ul className="space-y-4">
                  {summaryData.exercises.map((exercise) => {
                    const sets = summaryData.recordedSets[exercise.id];
                    const exerciseNote = summaryData.exerciseNotes?.[exercise.id];
                    if (!sets || sets.length === 0) return null;

                    return (
                      <li key={exercise.id}>
                        <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>
                        {exerciseNote && (
                          <div className="mb-2 p-2 text-sm bg-blue-500/10 border border-blue-500/30 rounded-md">
                            <p className="flex items-center gap-1 font-medium text-blue-700 dark:text-blue-400"><Edit2 className="h-4 w-4"/>Notatka do ćwiczenia:</p>
                            <p className="text-muted-foreground italic whitespace-pre-wrap">{exerciseNote}</p>
                          </div>
                        )}
                        <ul className="space-y-1 pl-4 text-sm text-muted-foreground">
                          {sets.map((set, index) => (
                            <li key={index} className="list-disc list-inside">
                              Seria {set.setNumber}: {set.weight} x {set.reps} powt.
                              {set.rpe && ` (RPE: ${set.rpe})`}
                              {set.notes && <span className="italic"> - Notatka do serii: {set.notes}</span>}
                            </li>
                          ))}
                        </ul>
                        {summaryData.exercises.filter(ex => summaryData.recordedSets[ex.id]?.length > 0).indexOf(exercise) < summaryData.exercises.filter(ex => summaryData.recordedSets[ex.id]?.length > 0).length - 1 && (
                            <Separator className="my-3"/>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-muted-foreground">Nie zarejestrowano żadnych serii dla tego treningu.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary"/>Ocena i Notatki Ogólne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium mb-1">Ocena Trudności Treningu</label>
                <Select onValueChange={(value) => setDifficulty(value as DifficultyRating)} value={difficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Wybierz poziom trudności..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DifficultyRating).map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="generalNotes" className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <StickyNote className="h-4 w-4"/>Notatki Ogólne do Treningu (opcjonalne)
                </label>
                <Textarea
                  id="generalNotes"
                  placeholder="Jak poszło? Coś do zapamiętania na przyszłość?"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto" disabled={isSaving}>
                        <Trash2 className="mr-2 h-4 w-4" /> Odrzuć Trening
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Odrzucić trening?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Czy na pewno chcesz odrzucić ten trening? Dane nie zostaną zapisane w historii. Tej akcji nie można cofnąć.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSaving}>Anuluj</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDiscardWorkout} disabled={isSaving} className="bg-destructive hover:bg-destructive/90">
                        {isSaving ? <Loader2 className="animate-spin mr-2"/> : null}
                        Potwierdź i odrzuć
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleSaveWorkout} className="w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4" />}
              Zapisz i Zakończ
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
