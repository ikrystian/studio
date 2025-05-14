
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
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
  Weight as WeightIcon, // Renamed to avoid conflict
  LineChart as LineChartIcon,
  Save,
  XCircle,
  PlusCircle,
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
import type { HistoricalWorkoutSession as OriginalHistoricalWorkoutSession } from "../page";
import type { RecordedSet as OriginalRecordedSet, ExerciseInWorkout, Workout } from "@/app/workout/active/[workoutId]/page";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent as EditDialogContent, // Renaming to avoid conflict
  DialogDescription as EditDialogDescription,
  DialogFooter as EditDialogFooter,
  DialogHeader as EditDialogHeader,
  DialogTitle as EditDialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";


// Make types mutable for editing
interface RecordedSet extends OriginalRecordedSet {
  // id might be useful if sets could be added/removed with persistence
}

interface HistoricalWorkoutSession extends OriginalHistoricalWorkoutSession {
  recordedSets: Record<string, RecordedSet[]>;
  generalNotes?: string;
  difficulty?: DifficultyRating;
}

enum DifficultyRating {
  BardzoLatwy = "Bardzo Łatwy",
  Latwy = "Łatwy",
  Sredni = "Średni",
  Trudny = "Trudny",
  BardzoTrudny = "Bardzo Trudny",
  Ekstremalny = "Ekstremalny",
}

const editHistoricalSessionSchema = z.object({
  difficulty: z.nativeEnum(DifficultyRating).optional(),
  generalNotes: z.string().optional(),
  // We'll handle sets separately as it's an array of objects
});
type EditHistoricalSessionFormValues = z.infer<typeof editHistoricalSessionSchema>;


// Re-using MOCK_HISTORY_SESSIONS for simplicity in this example
const MOCK_HISTORY_SESSIONS_FOR_DETAIL: HistoricalWorkoutSession[] = [
  {
    id: "hist1",
    workoutId: "wk1", // Original template ID
    workoutName: "Poranny Trening Siłowy",
    workoutType: "Siłowy",
    startTime: "2024-07-25T08:00:00.000Z",
    endTime: "2024-07-25T09:00:00.000Z",
    totalTimeSeconds: 3600,
    recordedSets: {
      ex1: [{ setNumber: 1, weight: "60", reps: "10", notes: "Good form" }, { setNumber: 2, weight: "65", reps: "8" }] as RecordedSet[],
      ex2: [{ setNumber: 1, weight: "100", reps: "5" }] as RecordedSet[],
    },
    exercises: [ // This is the planned structure
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
      { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 4, defaultReps: "6-8", defaultRest: 120 },
    ],
    difficulty: DifficultyRating.Sredni,
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
      ex6: [{ setNumber: 1, weight: "N/A", reps: "30 min" }] as RecordedSet[],
    },
    exercises: [{ id: "ex6", name: "Bieg na bieżni (30 min)", defaultSets: 1, defaultReps: "30 min", defaultRest: 0 }],
    difficulty: DifficultyRating.Trudny,
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
      ex1: [{ setNumber: 1, weight: "65", reps: "10" }, { setNumber: 2, weight: "70", reps: "8"}, { setNumber: 3, weight: "70", reps: "7"}] as RecordedSet[],
      ex2: [{ setNumber: 1, weight: "100", reps: "6" }, { setNumber: 2, weight: "105", reps: "5"}] as RecordedSet[],
      ex4: [{ setNumber: 1, weight: "BW", reps: "8" }, { setNumber: 2, weight: "BW", reps: "7"}] as RecordedSet[],
    },
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
      { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 3, defaultReps: "5-8", defaultRest: 120 },
      { id: "ex4", name: "Podciąganie na drążku", defaultSets: 3, defaultReps: "Max", defaultRest: 75 },
    ],
    difficulty: DifficultyRating.Sredni,
    calculatedTotalVolume: (65*10) + (70*8) + (70*7) + (100*6) + (105*5),
  },
];

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours > 0 ? String(hours).padStart(2, "0") + "h " : ""}${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
};

const PENDING_CUSTOM_WORKOUT_KEY = 'pendingCustomWorkoutToStart';

export default function WorkoutHistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] = React.useState<HistoricalWorkoutSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  const [isEditingSession, setIsEditingSession] = React.useState(false);
  const [editedSessionData, setEditedSessionData] = React.useState<HistoricalWorkoutSession | null>(null);


  const editForm = useForm<EditHistoricalSessionFormValues>({
    resolver: zodResolver(editHistoricalSessionSchema),
  });

  React.useEffect(() => {
    setIsLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      const foundSession = MOCK_HISTORY_SESSIONS_FOR_DETAIL.find(s => s.id === sessionId);
      if (foundSession) {
        const deepCopiedSession = JSON.parse(JSON.stringify(foundSession)) as HistoricalWorkoutSession;
        setSessionData(deepCopiedSession);
      } else {
        toast({ title: "Błąd", description: "Nie znaleziono sesji treningowej.", variant: "destructive" });
        router.replace("/history");
      }
      setIsLoading(false);
    }, 500);
  }, [sessionId, router, toast]);

  const handleDeleteSession = async () => {
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    // In a real app, you'd make an API call here to delete from DB
    toast({
      title: "Sesja usunięta",
      description: `Sesja treningowa "${sessionData?.workoutName}" została (symulacyjnie) usunięta.`,
      variant: "default",
    });
    router.replace("/history"); // Go back to history list
  };

  const handleStartEditSession = () => {
    if (sessionData) {
      const deepCopy: HistoricalWorkoutSession = JSON.parse(JSON.stringify(sessionData));
      setEditedSessionData(deepCopy);
      editForm.reset({
        difficulty: deepCopy.difficulty,
        generalNotes: deepCopy.generalNotes || "",
      });
      setIsEditingSession(true);
    }
  };

  const handleCancelEdit = () => {
    setEditedSessionData(null);
    setIsEditingSession(false);
    editForm.reset(); 
    toast({ title: "Edycja anulowana", variant: "default" });
  };

  const onEditSubmit = async (values: EditHistoricalSessionFormValues) => {
    if (!editedSessionData) return;
    setIsDeleting(true); // Re-use isDeleting for saving spinner

    const finalEditedData: HistoricalWorkoutSession = {
        ...editedSessionData,
        difficulty: values.difficulty,
        generalNotes: values.generalNotes,
        // recordedSets would be updated if set editing was implemented here
    };
    
    console.log("Saving edited historical session data (simulation):", finalEditedData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSessionData(finalEditedData); // Update main data with edited copy
    setIsEditingSession(false);
    setEditedSessionData(null);
    setIsDeleting(false);
    toast({ title: "Zmiany zapisane!", description: "Dane sesji treningowej zostały zaktualizowane.", variant: "default" });
  };
  
  const handleSetInputChange = (exerciseId: string, setIndex: number, field: keyof RecordedSet, value: string | number) => {
    setEditedSessionData(prev => {
      if (!prev) return null;
      const newEditedData = JSON.parse(JSON.stringify(prev)) as HistoricalWorkoutSession;
      const sets = newEditedData.recordedSets[exerciseId];
      if (sets && sets[setIndex]) {
        (sets[setIndex] as any)[field] = value;
        // Recalculate total volume if weight or reps changed
        if (field === 'weight' || field === 'reps') {
            let totalVolume = 0;
            Object.values(newEditedData.recordedSets).forEach(exerciseSets => {
                exerciseSets.forEach(s => {
                const w = parseFloat(String(s.weight));
                const r = parseInt(String(s.reps), 10);
                if (!isNaN(w) && !isNaN(r) && w > 0 && r > 0) {
                    totalVolume += w * r;
                }
                });
            });
            newEditedData.calculatedTotalVolume = totalVolume;
        }
      }
      return newEditedData;
    });
  };
  
  const handleAddNewSet = (exerciseId: string) => {
    setEditedSessionData(prev => {
      if (!prev) return null;
      const newEditedData = JSON.parse(JSON.stringify(prev)) as HistoricalWorkoutSession;
      const sets = newEditedData.recordedSets[exerciseId] || [];
      const newSetNumber = sets.length + 1;
      sets.push({ setNumber: newSetNumber, weight: "", reps: "", rpe: undefined, notes: "" });
      newEditedData.recordedSets[exerciseId] = sets;
      return newEditedData;
    });
  };

  const handleDeleteEditedSet = (exerciseId: string, setIndexToDelete: number) => {
     setEditedSessionData(prev => {
      if (!prev) return null;
      const newEditedData = JSON.parse(JSON.stringify(prev)) as HistoricalWorkoutSession;
      let sets = newEditedData.recordedSets[exerciseId];
      if (sets) {
        sets = sets.filter((_, index) => index !== setIndexToDelete)
                   .map((s, i) => ({ ...s, setNumber: i + 1 })); 
        newEditedData.recordedSets[exerciseId] = sets;
        // Recalculate total volume
        let totalVolume = 0;
        Object.values(newEditedData.recordedSets).forEach(exerciseSets => {
            exerciseSets.forEach(s => {
            const w = parseFloat(String(s.weight));
            const r = parseInt(String(s.reps), 10);
            if (!isNaN(w) && !isNaN(r) && w > 0 && r > 0) {
                totalVolume += w * r;
            }
            });
        });
        newEditedData.calculatedTotalVolume = totalVolume;
      }
      return newEditedData;
    });
    toast({ title: "Seria usunięta z edycji", variant: "default"});
  };

  const handleRepeatWorkout = () => {
    if (sessionData && sessionData.exercises && sessionData.exercises.length > 0) {
        const temporaryWorkout: Workout = {
            id: `custom-repeat-${Date.now()}`,
            name: `Powtórzenie: ${sessionData.workoutName}`,
            exercises: sessionData.exercises.map(ex => ({ // Ensure we pass full ExerciseInWorkout objects
                id: ex.id,
                name: ex.name,
                defaultSets: ex.defaultSets,
                defaultReps: ex.defaultReps,
                defaultRest: ex.defaultRest,
            })),
        };
        try {
            localStorage.setItem(PENDING_CUSTOM_WORKOUT_KEY, JSON.stringify(temporaryWorkout));
            router.push(`/workout/active/${temporaryWorkout.id}`);
        } catch (error) {
            console.error("Error saving custom workout to localStorage for repeat:", error);
            toast({
                title: "Błąd",
                description: "Nie udało się przygotować treningu do powtórzenia.",
                variant: "destructive",
            });
        }
    } else {
      toast({
        title: "Nie można powtórzyć",
        description: "Brak danych o ćwiczeniach w tej historycznej sesji.",
        variant: "destructive",
      });
    }
  };

  const dataToDisplay = isEditingSession && editedSessionData ? editedSessionData : sessionData;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Ładowanie szczegółów sesji...</p>
      </div>
    );
  }

  if (!dataToDisplay) {
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
            <h1 className="text-xl font-bold truncate max-w-xs sm:max-w-md" title={dataToDisplay.workoutName}>
              {dataToDisplay.workoutName}
            </h1>
          </div>
           {isEditingSession ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit} disabled={isDeleting}>
                <XCircle className="mr-2 h-4 w-4" /> Anuluj Edycję
              </Button>
              <Button onClick={editForm.handleSubmit(onEditSubmit)} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4" />}
                Zapisz Zmiany
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleStartEditSession}>
              <Edit className="mr-2 h-4 w-4" /> Edytuj Wpis
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{dataToDisplay.workoutName}</CardTitle>
              <CardDescription>
                Data: {format(parseISO(dataToDisplay.startTime), "PPPp", { locale: pl })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Całkowity Czas</p>
                    <p>{formatTime(dataToDisplay.totalTimeSeconds)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <WeightIcon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Całkowity Ciężar</p>
                    <p>{dataToDisplay.calculatedTotalVolume.toLocaleString('pl-PL')} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                    <BarChart className="h-5 w-5 text-primary" />
                    <div>
                        <p className="font-semibold">Ocena Trudności</p>
                        {isEditingSession ? (
                            <Controller
                                control={editForm.control}
                                name="difficulty"
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isDeleting}
                                    >
                                        <SelectTrigger className="h-8 text-xs w-full">
                                            <SelectValue placeholder="Oceń trudność..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(DifficultyRating).map(level => (
                                                <SelectItem key={level} value={level}>{level}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        ) : (
                            <p>{dataToDisplay.difficulty || "Nie oceniono"}</p>
                        )}
                    </div>
                </div>
              </div>
               
                <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-1 flex items-center gap-1"><StickyNote className="h-4 w-4 text-primary"/> Ogólne Notatki:</h4>
                    {isEditingSession ? (
                        <Controller
                            control={editForm.control}
                            name="generalNotes"
                            render={({ field }) => (
                                <Textarea
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    placeholder="Dodaj ogólne notatki do treningu..."
                                    rows={3}
                                    disabled={isDeleting}
                                />
                            )}
                        />
                    ) : (
                         <p className="text-sm text-muted-foreground whitespace-pre-wrap">{dataToDisplay.generalNotes || "Brak ogólnych notatek."}</p>
                    )}
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListOrdered className="h-6 w-6 text-primary"/>Wykonane Ćwiczenia</CardTitle>
            </CardHeader>
            <CardContent>
              {dataToDisplay.exercises.filter(ex => dataToDisplay.recordedSets[ex.id]?.length > 0 || (isEditingSession && editedSessionData?.recordedSets[ex.id]?.length > 0)).length > 0 ? (
                <ul className="space-y-6">
                  {dataToDisplay.exercises.map((exercise) => {
                    const setsToDisplay = dataToDisplay.recordedSets[exercise.id];
                    
                    if (!setsToDisplay || setsToDisplay.length === 0) return null;

                    return (
                      <li key={exercise.id}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-lg">{exercise.name}</h3>
                            {!isEditingSession && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/statistics?exerciseId=${exercise.id}&exerciseName=${encodeURIComponent(exercise.name)}`}>
                                        <LineChartIcon className="mr-2 h-4 w-4"/> Zobacz postęp
                                    </Link>
                                </Button>
                            )}
                        </div>
                        <ul className="space-y-2 pl-1 text-sm">
                          {setsToDisplay.map((set, index) => (
                            <li key={`set-${exercise.id}-${index}`} className={`p-3 rounded-md ${isEditingSession ? 'bg-muted/60' : 'bg-muted/30'}`}>
                              {isEditingSession && editedSessionData ? (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-xs">Seria {set.setNumber}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteEditedSet(exercise.id, index)} disabled={isDeleting}>
                                        <Trash2 className="h-3 w-3"/>
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input 
                                        placeholder="Ciężar (kg/opis)" 
                                        value={String(set.weight)} 
                                        onChange={(e) => handleSetInputChange(exercise.id, index, 'weight', e.target.value)}
                                        className="h-8 text-xs"
                                        disabled={isDeleting}
                                    />
                                    <Input 
                                        placeholder="Powt./Czas/Dystans" 
                                        value={String(set.reps)} 
                                        onChange={(e) => handleSetInputChange(exercise.id, index, 'reps', e.target.value)}
                                        className="h-8 text-xs"
                                        disabled={isDeleting}
                                    />
                                  </div>
                                  <Input 
                                      placeholder="RPE (1-10, opcjonalne)" 
                                      type="number"
                                      value={String(set.rpe || "")} 
                                      onChange={(e) => handleSetInputChange(exercise.id, index, 'rpe', e.target.value)}
                                      className="h-8 text-xs"
                                      disabled={isDeleting}
                                  />
                                  <Textarea 
                                      placeholder="Notatki do serii (opcjonalne)" 
                                      value={set.notes || ""} 
                                      onChange={(e) => handleSetInputChange(exercise.id, index, 'notes', e.target.value)}
                                      rows={2}
                                      className="text-xs"
                                      disabled={isDeleting}
                                  />
                                </div>
                              ) : (
                                <>
                                  <span className="font-medium">Seria {set.setNumber}:</span> {set.weight} x {set.reps} powt.
                                  {set.rpe && <span className="text-muted-foreground"> (RPE: {set.rpe})</span>}
                                  {set.notes && <p className="italic text-xs text-muted-foreground/80 mt-0.5"> - Notatka: {set.notes}</p>}
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                        {isEditingSession && (
                            <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => handleAddNewSet(exercise.id)} disabled={isDeleting}>
                                <PlusCircle className="mr-1 h-3 w-3"/> Dodaj Serię do {exercise.name}
                            </Button>
                        )}
                        {dataToDisplay.exercises.filter(ex => dataToDisplay.recordedSets[ex.id]?.length > 0).indexOf(exercise) < dataToDisplay.exercises.filter(ex => dataToDisplay.recordedSets[ex.id]?.length > 0).length - 1 && (
                            <Separator className="my-4"/>
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

          {!isEditingSession && (
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Dumbbell className="h-6 w-6 text-primary"/>Akcje</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={handleRepeatWorkout}>
                      <Repeat className="mr-2 h-4 w-4" /> Powtórz Trening
                  </Button>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full sm:w-auto" disabled={isDeleting}>
                              {isDeleting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Trash2 className="mr-2 h-4 w-4" />}
                               Usuń Wpis
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
          )}
        </div>
      </main>
    </div>
  );
}
    
