
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Save,
  Square,
  Timer,
  Weight,
  Repeat,
  TrendingUp,
  Info,
  ListChecks,
  SkipForward,
  Dumbbell,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Trash2,
  StickyNote,
  Lightbulb,
  Edit2,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";


// Simulated exercise database (can be expanded or moved)
const MOCK_EXERCISES_DATABASE: { id: string; name: string; category: string, instructions?: string, videoUrl?: string }[] = [
  { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", category: "Klatka", instructions: "Połóż się na ławce, chwyć sztangę nachwytem szerzej niż barki. Opuść sztangę do klatki piersiowej, a następnie dynamicznie wypchnij w górę." },
  { id: "ex2", name: "Przysiady ze sztangą", category: "Nogi", instructions: "Stań w lekkim rozkroku, sztanga na barkach. Wykonaj przysiad, utrzymując proste plecy, zejdź biodrami poniżej kolan." },
  { id: "ex3", name: "Martwy ciąg", category: "Plecy", instructions: "Stań blisko sztangi, stopy na szerokość bioder. Złap sztangę nachwytem lub chwytem mieszanym. Podnieś sztangę, prostując biodra i kolana, utrzymując proste plecy." },
  { id: "ex4", name: "Podciąganie na drążku", category: "Plecy", instructions: "Złap drążek nachwytem szerzej niż barki. Podciągnij się, aż broda znajdzie się nad drążkiem. Kontrolowanie opuść ciało." },
  { id: "ex5", name: "Pompki", category: "Klatka", instructions: "Przyjmij pozycję podporu przodem, dłonie na szerokość barków. Opuść ciało, uginając łokcie, aż klatka piersiowa znajdzie się blisko podłoża. Wypchnij ciało w górę." },
  { id: "ex6", name: "Bieg na bieżni (30 min)", category: "Cardio", instructions: "Ustaw odpowiednią prędkość i nachylenie na bieżni. Utrzymuj stałe tempo przez określony czas." },
];

// Simulated workout data
export interface ExerciseInWorkout {
  id: string;
  name: string;
  defaultSets?: number;
  defaultReps?: string;
  defaultRest?: number; // seconds
}

export interface Workout {
  id: string;
  name: string;
  exercises: ExerciseInWorkout[];
}

const MOCK_WORKOUTS: Workout[] = [
  {
    id: "wk1",
    name: "Poranny Trening Siłowy",
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
      { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 4, defaultReps: "10-12", defaultRest: 120 },
      { id: "ex4", name: "Podciąganie na drążku", defaultSets: 3, defaultReps: "Max", defaultRest: 90 },
    ],
  },
  {
    id: "wk2",
    name: "Szybkie Cardio HIIT",
    exercises: [
      { id: "ex6", name: "Bieg na bieżni (30 min)", defaultSets: 1, defaultReps: "30 min", defaultRest: 0 },
      { id: "ex5", name: "Pompki", defaultSets: 3, defaultReps: "15-20", defaultRest: 60 },
    ],
  },
];

export interface RecordedSet {
  setNumber: number;
  weight: number | string;
  reps: number | string;
  rpe?: number;
  notes?: string;
}

// Simplified mock history for progression suggestions
interface MockSetRecord { weight: string | number; reps: string | number; }
interface MockPastSession {
  sessionId: string;
  exerciseId: string;
  date: string; // ISO
  setsPerformed: MockSetRecord[];
}
const MOCK_WORKOUT_HISTORY_FOR_SUGGESTIONS: MockPastSession[] = [
  { sessionId: 's1', exerciseId: 'ex1', date: '2024-07-15T09:00:00Z', setsPerformed: [{ weight: 60, reps: 10 }, { weight: 60, reps: 10 }, { weight: 60, reps: 9 }] },
  { sessionId: 's2', exerciseId: 'ex1', date: '2024-07-22T09:00:00Z', setsPerformed: [{ weight: 62.5, reps: 8 }, { weight: 62.5, reps: 8 }, { weight: 62.5, reps: 7 }] },
  { sessionId: 's3', exerciseId: 'ex2', date: '2024-07-15T10:00:00Z', setsPerformed: [{ weight: 100, reps: 10 }, { weight: 100, reps: 10 }] },
  { sessionId: 's4', exerciseId: 'ex4', date: '2024-07-15T11:00:00Z', setsPerformed: [{ weight: 'BW', reps: 8 }, { weight: 'BW', reps: 7 }] },
];


const setFormSchema = z.object({
  weight: z.string().min(1, "Waga jest wymagana."),
  reps: z.string().min(1, "Liczba powtórzeń jest wymagana."),
  rpe: z.coerce.number().min(1).max(10).optional().or(z.literal("")),
  notes: z.string().optional(),
});

type SetFormValues = z.infer<typeof setFormSchema>;

const DEFAULT_REST_TIME = 60; // seconds

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const workoutId = params.workoutId as string;

  const [isLoading, setIsLoading] = React.useState(true);
  const [currentWorkout, setCurrentWorkout] = React.useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = React.useState(0);

  const [recordedSets, setRecordedSets] = React.useState<Record<string, RecordedSet[]>>({});
  const [exerciseNotes, setExerciseNotes] = React.useState<Record<string, string>>({});

  const [workoutStartTime, setWorkoutStartTime] = React.useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState(0); // in seconds

  const [restTimer, setRestTimer] = React.useState(0);
  const [isResting, setIsResting] = React.useState(false);
  const restIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const [progressionSuggestion, setProgressionSuggestion] = React.useState<string | null>(null);

  const setForm = useForm<SetFormValues>({
    resolver: zodResolver(setFormSchema),
    defaultValues: { weight: "", reps: "", rpe: "", notes: "" },
  });

  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundWorkout = MOCK_WORKOUTS.find((w) => w.id === workoutId);
      if (foundWorkout) {
        setCurrentWorkout(foundWorkout);
        setWorkoutStartTime(new Date());
      } else {
        toast({ title: "Błąd", description: "Nie znaleziono treningu.", variant: "destructive" });
        router.push("/workout/start");
      }
      setIsLoading(false);
    }, 500);
  }, [workoutId, router, toast]);

  React.useEffect(() => {
    if (!workoutStartTime || isResting) return;
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [workoutStartTime, isResting]);

  React.useEffect(() => {
    if (isResting && restTimer > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimer((prev) => prev - 1);
      }, 1000);
    } else if (restTimer <= 0 && isResting) {
      setIsResting(false);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      toast({ title: "Koniec odpoczynku!", description: "Czas na następną serię!", variant: "default" });
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isResting, restTimer, toast]);

  const currentExercise = currentWorkout?.exercises[currentExerciseIndex];
  const currentExerciseDetails = currentExercise ? MOCK_EXERCISES_DATABASE.find(ex => ex.id === currentExercise.id) : null;

  React.useEffect(() => {
    if (currentExercise) {
      const getSuggestion = (exerciseId: string, history: MockPastSession[]): string | null => {
        const relevantSessions = history
          .filter(session => session.exerciseId === exerciseId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (relevantSessions.length > 0) {
          const lastSession = relevantSessions[0];
          const lastSet = lastSession.setsPerformed[0];

          if (lastSet) {
            const lastWeight = lastSet.weight;
            const lastReps = lastSet.reps;
            const datePerformed = new Date(lastSession.date).toLocaleDateString('pl-PL');

            if (typeof lastWeight === 'number' && typeof lastReps === 'number') {
              const suggestedWeight = lastWeight + 2.5;
              return `Ostatnio (${datePerformed}): ${lastWeight}kg x ${lastReps} powt. Sugestia: spróbuj dziś ${suggestedWeight}kg na ${lastReps} powt. lub podobną liczbę powtórzeń.`;
            } else if (lastWeight === 'BW') {
              return `Ostatnio (${datePerformed}): ${lastWeight} x ${lastReps} powt. Sugestia: spróbuj dziś więcej powtórzeń lub rozważ dodanie obciążenia.`;
            } else {
               return `Ostatnio (${datePerformed}): ${lastWeight} x ${lastReps} powt. Skup się na technice i liczbie powtórzeń.`;
            }
          }
        }
        return "Pierwszy raz to ćwiczenie? Daj z siebie wszystko i zanotuj wyniki!";
      };
      setProgressionSuggestion(getSuggestion(currentExercise.id, MOCK_WORKOUT_HISTORY_FOR_SUGGESTIONS));
       setForm.reset({
        weight: recordedSets[currentExercise.id]?.[recordedSets[currentExercise.id].length -1]?.weight?.toString() || "", // Pre-fill with last set's weight for this exercise
        reps: "",
        rpe: "",
        notes: ""
      });
    }
  }, [currentExercise, recordedSets]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? String(hours).padStart(2, "0") + ":" : ""}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleAddSet = (values: SetFormValues) => {
    if (!currentExercise) return;

    const newSet: RecordedSet = {
      setNumber: (recordedSets[currentExercise.id]?.length || 0) + 1,
      weight: isNaN(parseFloat(values.weight)) ? values.weight : parseFloat(values.weight),
      reps: isNaN(parseInt(values.reps, 10)) ? values.reps : parseInt(values.reps, 10),
      rpe: values.rpe ? Number(values.rpe) : undefined,
      notes: values.notes || undefined,
    };

    setRecordedSets((prev) => ({
      ...prev,
      [currentExercise.id]: [...(prev[currentExercise.id] || []), newSet],
    }));

    setForm.reset({ weight: String(newSet.weight), reps: "", rpe: "", notes: "" });

    const restDuration = currentExercise.defaultRest || DEFAULT_REST_TIME;
    setRestTimer(restDuration);
    setIsResting(true);
    toast({
      title: `Seria ${newSet.setNumber} zapisana!`,
      description: `Rozpoczynam ${restDuration}s odpoczynku.`,
    });
  };

  const handleDeleteSet = (exerciseId: string, setIndexToDelete: number) => {
    setRecordedSets((prev) => {
      const setsForExercise = prev[exerciseId] || [];
      const updatedSets = setsForExercise
        .filter((_, index) => index !== setIndexToDelete)
        .map((s, i) => ({ ...s, setNumber: i + 1 })); // Re-number sets
      return {
        ...prev,
        [exerciseId]: updatedSets,
      };
    });
    toast({
      title: "Seria usunięta",
      description: `Seria została pomyślnie usunięta.`,
      variant: "default",
    });
  };

  const handleExerciseNotesChange = (exerciseId: string, notes: string) => {
    setExerciseNotes(prev => ({ ...prev, [exerciseId]: notes }));
  };

  const handleSkipRest = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setIsResting(false);
    setRestTimer(0);
    toast({ title: "Odpoczynek pominięty", variant: "default" });
  };

  const handleNextExercise = () => {
    if (currentWorkout && currentExerciseIndex < currentWorkout.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setIsResting(false);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    } else {
      toast({ title: "To ostatnie ćwiczenie!", description: "Możesz teraz zakończyć trening.", variant: "default"});
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setIsResting(false);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    }
  };

  const handleFinishWorkout = () => {
    setIsLoading(true);
    if (!currentWorkout || !workoutStartTime) {
        toast({ title: "Błąd", description: "Nie można zakończyć treningu.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    const summaryData = {
        workoutId: currentWorkout.id,
        workoutName: currentWorkout.name,
        startTime: workoutStartTime.toISOString(),
        endTime: new Date().toISOString(),
        totalTimeSeconds: elapsedTime,
        recordedSets: recordedSets,
        exercises: currentWorkout.exercises,
        exerciseNotes: exerciseNotes,
    };

    try {
        localStorage.setItem('workoutSummaryData', JSON.stringify(summaryData));
        toast({
            title: "Trening Zakończony!",
            description: "Przekierowuję do podsumowania...",
            variant: "default",
        });
        router.push(`/workout/summary`);
    } catch (error) {
        console.error("Error saving summary data to localStorage:", error);
        toast({ title: "Błąd zapisu", description: "Nie udało się zapisać danych do podsumowania.", variant: "destructive"});
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading || !currentWorkout || !currentExercise) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Ładowanie treningu...</p>
      </div>
    );
  }

  const exerciseProgress = ((currentExerciseIndex + 1) / currentWorkout.exercises.length) * 100;
  const setsForCurrentExercise = recordedSets[currentExercise.id] || [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" asChild>
                <Link href="/workout/start" aria-label="Wróć do wyboru treningów">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            <Dumbbell className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold truncate max-w-xs sm:max-w-md" title={currentWorkout.name}>
              {currentWorkout.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isLoading}>
                  <Square className="mr-2 h-4 w-4" /> Zakończ
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Zakończyć trening?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz zakończyć obecny trening? Postęp zostanie zapisany.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFinishWorkout} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2"/> : null}
                    Potwierdź i zakończ
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Ćwiczenie {currentExerciseIndex + 1} z {currentWorkout.exercises.length}</span>
              <span>{Math.round(exerciseProgress)}%</span>
            </div>
            <Progress value={exerciseProgress} className="h-2" />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                {currentExercise.name}
              </CardTitle>
              {currentExerciseDetails?.category && (
                <CardDescription>Kategoria: {currentExerciseDetails.category}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {currentExerciseDetails?.instructions && (
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1" className="border-b-0">
                          <AccordionTrigger className="text-sm hover:no-underline py-2">
                              <Info className="mr-2 h-4 w-4"/> Pokaż instrukcje
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm pb-2">
                              {currentExerciseDetails.instructions}
                              {currentExerciseDetails.videoUrl && (
                                  <a href={currentExerciseDetails.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block mt-2">
                                      Zobacz wideo
                                  </a>
                              )}
                          </AccordionContent>
                      </AccordionItem>
                  </Accordion>
              )}
               {progressionSuggestion && (
                <Alert variant="default" className="border-primary/50">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-primary">Sugestia Progresji</AlertTitle>
                  <AlertDescription>{progressionSuggestion}</AlertDescription>
                </Alert>
              )}
               <div className="space-y-2">
                <Label htmlFor={`exercise-notes-${currentExercise.id}`} className="flex items-center gap-1 text-sm font-medium">
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                  Notatki do ćwiczenia (opcjonalne)
                </Label>
                <Textarea
                  id={`exercise-notes-${currentExercise.id}`}
                  placeholder="Np. jak czułeś to ćwiczenie, na co zwrócić uwagę następnym razem..."
                  value={exerciseNotes[currentExercise.id] || ""}
                  onChange={(e) => handleExerciseNotesChange(currentExercise.id, e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {isResting && (
            <Card className="mb-6 bg-primary/10 border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                  <Timer className="h-6 w-6" /> Odpoczynek
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-6xl font-bold text-primary">{formatTime(restTimer)}</p>
                <Progress value={(restTimer / (currentExercise.defaultRest || DEFAULT_REST_TIME)) * 100} className="h-2 mt-4 bg-primary/20 [&>div]:bg-primary" />
              </CardContent>
              <CardFooter>
                <Button onClick={handleSkipRest} variant="secondary" className="w-full">
                  <SkipForward className="mr-2 h-4 w-4" /> Pomiń odpoczynek
                </Button>
              </CardFooter>
            </Card>
          )}

          {!isResting && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-6 w-6 text-primary" /> Rejestruj Serię
                  {currentExercise.defaultSets && setsForCurrentExercise.length < currentExercise.defaultSets ?
                    ` (Sugerowana: ${setsForCurrentExercise.length + 1} z ${currentExercise.defaultSets})` :
                    (setsForCurrentExercise.length > 0 ? ` (Seria ${setsForCurrentExercise.length + 1})` : ` (Seria 1)`)
                  }
                </CardTitle>
                 {currentExercise.defaultReps && <CardDescription>Sugerowane powtórzenia: {currentExercise.defaultReps}</CardDescription>}
              </CardHeader>
              <CardContent>
                <Form {...setForm}>
                  <form onSubmit={setForm.handleSubmit(handleAddSet)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={setForm.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center"><Weight className="mr-1 h-4 w-4"/>Ciężar (kg/opis)</FormLabel>
                            <FormControl>
                              <Input placeholder="np. 50 lub BW" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={setForm.control}
                        name="reps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center"><Repeat className="mr-1 h-4 w-4"/>Powtórzenia</FormLabel>
                            <FormControl>
                              <Input placeholder="np. 10 lub Max" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <FormField
                        control={setForm.control}
                        name="rpe"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center"><TrendingUp className="mr-1 h-4 w-4"/>RPE (1-10, opcjonalne)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="np. 8" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={setForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center"><StickyNote className="mr-1 h-4 w-4"/>Notatki do serii (opcjonalne)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Np. Zapas 2 powtórzeń, dobra technika" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <Button type="submit" className="w-full sm:w-auto" disabled={setForm.formState.isSubmitting}>
                       {setForm.formState.isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4" />}
                      Zapisz Serię
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {setsForCurrentExercise.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" /> Zapisane Serie ({setsForCurrentExercise.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {setsForCurrentExercise.map((set, index) => (
                    <li key={index} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-muted/50 rounded-md text-sm gap-2">
                      <div className="flex-grow">
                        <span className="font-semibold">Seria {set.setNumber}: </span>
                        <span>{set.weight} x {set.reps} powt.</span>
                        {set.rpe && <span className="ml-2 text-muted-foreground">(RPE: {set.rpe})</span>}
                        {set.notes && <p className="text-xs text-muted-foreground mt-1 italic">Notatka: {set.notes}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 self-start sm:self-center"
                        onClick={() => currentExercise && handleDeleteSet(currentExercise.id, index)}
                        aria-label="Usuń serię"
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Usuń
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}


          <div className="mt-8 flex justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={handlePreviousExercise}
              disabled={currentExerciseIndex === 0 || isLoading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Poprzednie ćwiczenie
            </Button>
            {currentExerciseIndex < currentWorkout.exercises.length - 1 ? (
                 <Button onClick={handleNextExercise} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                    Następne ćwiczenie <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="mr-2 h-4 w-4" /> Zakończ Trening i Zapisz
                        </Button>
                    </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Zakończyć trening?</AlertDialogTitle>
                        <AlertDialogDescription>
                            To było ostatnie ćwiczenie. Czy na pewno chcesz zakończyć i zapisać trening?
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFinishWorkout} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2"/> : null}
                            Zakończ i Zapisz
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
