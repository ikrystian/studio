
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
  Edit2,
  Trophy,
  Share2,
  BarChartHorizontalBig,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format, parseISO, differenceInSeconds } from "date-fns";
import { pl } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

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
import type { Workout, ExerciseInWorkout, RecordedSet } from "./../active/[workoutId]/page"; 
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// MOCK BACKEND LOGIC:
// - Data Source: Workout summary data is received from the Active Workout page via localStorage.
// - PB Suggestions: Simulated based on MOCK_EXISTING_PBS (in-memory array) and the current workout's performance.
// - Save/Share: Saving the workout and sharing to community are simulated.
//   - The workout summary (including notes, difficulty, accepted PBs) would typically be POSTed to a backend.
//   - Sharing to community would involve another API call to create a feed post.
//   - Last workout date is saved to localStorage for the inactivity reminder feature.
// - Discard: Clears the summary data from localStorage.

interface WorkoutSummaryData {
  workoutId: string;
  workoutName: string;
  startTime: string; 
  endTime: string;   
  totalTimeSeconds: number;
  recordedSets: Record<string, RecordedSet[]>; 
  exercises: ExerciseInWorkout[];
  exerciseNotes?: Record<string, string>; 
}

enum DifficultyRating {
  BardzoLatwy = "Bardzo Łatwy",
  Latwy = "Łatwy",
  Sredni = "Średni",
  Trudny = "Trudny",
  BardzoTrudny = "Bardzo Trudny",
  Ekstremalny = "Ekstremalny",
}

interface MockPB {
  value: number | string; 
  reps?: number; 
}
const MOCK_EXISTING_PBS: Record<string, MockPB> = { 
  "ex1": { value: 95, reps: 5 }, 
  "ex2": { value: 130, reps: 5 }, 
  "ex4": { value: "BW", reps: 12 }, 
};

interface PBSuggestion {
  exerciseId: string;
  exerciseName: string;
  achievedValue: string; 
  status: 'suggested' | 'accepted' | 'rejected'; 
}

const MOCK_MOTIVATIONAL_MESSAGES = [
  "Świetna robota! Każdy trening to krok bliżej celu.",
  "Dobra robota! Pamiętaj, że konsekwencja jest kluczem.",
  "Niesamowity wysiłek! Odpocznij i zregeneruj siły.",
  "Trening zaliczony! Jesteś maszyną!",
  "Tak trzymać! Twoja determinacja jest inspirująca.",
  "Cel osiągnięty na dziś! Brawo Ty!",
  "Pamiętaj, progres to nie zawsze ciężar - technika i samopoczucie też są ważne."
];

export default function WorkoutSummaryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [summaryData, setSummaryData] = React.useState<WorkoutSummaryData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [generalNotes, setGeneralNotes] = React.useState("");
  const [difficulty, setDifficulty] = React.useState<DifficultyRating | undefined>(undefined);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false);
  const [pbSuggestions, setPbSuggestions] = React.useState<PBSuggestion[]>([]);
  const [shareToCommunity, setShareToCommunity] = React.useState(false);
  const [communityPostComment, setCommunityPostComment] = React.useState("");
  const [showShareConfirmDialog, setShowShareConfirmDialog] = React.useState(false);

  React.useEffect(() => {
    // MOCK BACKEND LOGIC: Load workout summary data from localStorage.
    // This data is temporarily stored by the ActiveWorkoutPage upon finishing a workout.
    const dataString = localStorage.getItem('workoutSummaryData');
    if (dataString) {
      try {
        const parsedData: WorkoutSummaryData = JSON.parse(dataString);
        if (parsedData.startTime && parsedData.endTime) {
            parsedData.totalTimeSeconds = differenceInSeconds(parseISO(parsedData.endTime), parseISO(parsedData.startTime));
        }
        setSummaryData(parsedData);

        // MOCK BACKEND LOGIC: Simulate PB suggestion logic.
        const suggestions: PBSuggestion[] = [];
        parsedData.exercises.forEach(exercise => {
          const sets = parsedData.recordedSets[exercise.id];
          if (sets && sets.length > 0) {
            const bestSetForExercise = sets.reduce((best, current) => {
              const currentWeightNum = parseFloat(String(current.weight));
              const currentRepsNum = parseInt(String(current.reps), 10);
              if (isNaN(currentWeightNum) || isNaN(currentRepsNum)) return best; 
              const bestWeightNum = parseFloat(String(best.weight));
              const bestRepsNum = parseInt(String(best.reps), 10);
              if (isNaN(bestWeightNum) || currentWeightNum > bestWeightNum) return current;
              if (currentWeightNum === bestWeightNum && (isNaN(bestRepsNum) || currentRepsNum > bestRepsNum)) return current;
              return best;
            }, { weight: 0, reps: 0, setNumber: 0 } as RecordedSet); 

            if (bestSetForExercise.setNumber > 0) { 
                const achievedWeight = bestSetForExercise.weight;
                const achievedReps = bestSetForExercise.reps;
                const achievedValueStr = `${achievedWeight}${typeof achievedWeight === 'number' ? 'kg' : ''} x ${achievedReps}powt.`;
                const existingPb = MOCK_EXISTING_PBS[exercise.id];
                let isNewPb = false;
                if (!existingPb) {
                    isNewPb = true; 
                } else {
                    const existingPbWeight = typeof existingPb.value === 'string' && existingPb.value.toUpperCase() === 'BW' ? 'BW' : parseFloat(String(existingPb.value));
                    const existingPbReps = existingPb.reps ? parseInt(String(existingPb.reps), 10) : 0;
                    const currentAchievedWeightNum = typeof achievedWeight === 'string' && achievedWeight.toUpperCase() === 'BW' ? 'BW' : parseFloat(String(achievedWeight));
                    const currentAchievedRepsNum = parseInt(String(achievedReps), 10);
                    if(currentAchievedWeightNum === 'BW' && existingPbWeight === 'BW') {
                        if (!isNaN(currentAchievedRepsNum) && currentAchievedRepsNum > existingPbReps) isNewPb = true;
                    } else if (typeof currentAchievedWeightNum === 'number' && typeof existingPbWeight === 'number') {
                        if (!isNaN(currentAchievedWeightNum) && !isNaN(currentAchievedRepsNum)) {
                             if (currentAchievedWeightNum > existingPbWeight) isNewPb = true;
                             else if (currentAchievedWeightNum === existingPbWeight && currentAchievedRepsNum > existingPbReps) isNewPb = true;
                        }
                    } else if (typeof currentAchievedWeightNum === 'number' && existingPbWeight === 'BW') {
                         if (!isNaN(currentAchievedWeightNum) && currentAchievedWeightNum > 0) isNewPb = true;
                    }
                }
                if (isNewPb) {
                    suggestions.push({
                        exerciseId: exercise.id,
                        exerciseName: exercise.name,
                        achievedValue: achievedValueStr,
                        status: 'suggested',
                    });
                }
            }
          }
        });
        setPbSuggestions(suggestions);

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
  
  // MOCK BACKEND LOGIC: Simulates saving the workout summary. In a real app, this would be an API call.
  // If `shareToCommunity` is true, it also simulates posting to a community feed.
  // Persists `lastWorkoutDate` to localStorage for inactivity reminder feature.
  const performSaveAndShare = async () => {
    if (!summaryData) return;
    setIsSaving(true);
    const acceptedPbs = pbSuggestions.filter(s => s.status === 'accepted').map(s => ({ exercise: s.exerciseName, value: s.achievedValue }));
    
    const fullSummaryToSave = {
      ...summaryData,
      difficulty,
      generalNotes,
      exerciseNotes: summaryData.exerciseNotes, 
      calculatedTotalVolume: calculateTotalVolume(),
      acceptedPbs, 
      sharedToCommunity: shareToCommunity,
      communityPostComment: shareToCommunity ? communityPostComment : undefined,
      userId: "testUser123", 
    };
    console.log("Saving workout summary (mock):", fullSummaryToSave);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      localStorage.setItem('workoutWiseLastWorkoutDate', new Date().toISOString());
    } catch (e) {
      console.error("Failed to save last workout date to localStorage", e);
    }

    const randomMotivationalMessage = MOCK_MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOCK_MOTIVATIONAL_MESSAGES.length)];
    let toastDescription = `${randomMotivationalMessage}`;
    if (shareToCommunity) {
        toastDescription += " Został również udostępniony w Społeczności (symulacja)!";
    }

    toast({
      title: "Trening Zapisany!",
      description: toastDescription,
      variant: "default",
      duration: 7000,
    });
    localStorage.removeItem('workoutSummaryData'); 
    router.push("/dashboard/history"); 
    setIsSaving(false);
    setShowShareConfirmDialog(false);
  };


  const handleSaveWorkout = () => {
    if (shareToCommunity) {
      setShowShareConfirmDialog(true);
    } else {
      performSaveAndShare();
    }
  };

  // MOCK BACKEND LOGIC: Simulates discarding the workout summary by removing it from localStorage.
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
    setShowDiscardDialog(false);
  };

  // MOCK BACKEND LOGIC: Updates the status of a PB suggestion in memory.
  // In a real app, accepting would trigger saving the PB to a database.
  const handlePbSuggestion = (exerciseId: string, newStatus: 'accepted' | 'rejected') => {
    setPbSuggestions(prev => prev.map(s => s.exerciseId === exerciseId ? { ...s, status: newStatus } : s));
    toast({
        title: `Sugestia PB dla ${pbSuggestions.find(s => s.exerciseId === exerciseId)?.exerciseName}`,
        description: newStatus === 'accepted' ? "Zaakceptowano jako nowy rekord!" : "Odrzucono sugestię.",
    });
  };

  const volumePerExerciseChartData = React.useMemo(() => {
    if (!summaryData) return [];
    return summaryData.exercises
      .map(exercise => {
        const sets = summaryData.recordedSets[exercise.id] || [];
        let volume = 0;
        sets.forEach(set => {
          const weight = parseFloat(String(set.weight));
          const reps = parseInt(String(set.reps), 10);
          if (!isNaN(weight) && !isNaN(reps) && weight > 0 && reps > 0) {
            volume += weight * reps;
          }
        });
        return { name: exercise.name, volume };
      })
      .filter(item => item.volume > 0); 
  }, [summaryData]);

  const setsPerExerciseChartData = React.useMemo(() => {
    if (!summaryData) return [];
    return summaryData.exercises
      .map(exercise => {
        const setsCount = (summaryData.recordedSets[exercise.id] || []).length;
        return { name: exercise.name, sets: setsCount };
      })
      .filter(item => item.sets > 0); 
  }, [summaryData]);

  const chartConfig = {
    volume: { label: "Objętość (kg)", color: "hsl(var(--chart-1))" },
    sets: { label: "Liczba Serii", color: "hsl(var(--chart-2))" },
  } as const;


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
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Podsumowanie Treningu</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{summaryData.workoutName}</CardTitle>
              <CardDescription>
                Data: {format(parseISO(summaryData.startTime), "PPPp", { locale: pl })}
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
              <CardTitle className="flex items-center gap-2"><BarChartHorizontalBig className="h-6 w-6 text-primary"/>Wizualizacja Danych Treningu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {volumePerExerciseChartData.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Całkowita Objętość na Ćwiczenie</h3>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={volumePerExerciseChartData} layout="vertical" margin={{ right: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" dataKey="volume" />
                      <YAxis type="category" dataKey="name" width={150} interval={0} tick={{ fontSize: 12 }} />
                      <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent indicator="dot" />} />
                      <Bar dataKey="volume" fill="var(--color-volume)" radius={4} barSize={20} />
                    </BarChart>
                  </ChartContainer>
                </div>
              ) : (
                <Alert variant="default">
                  <Info className="h-4 w-4"/>
                  <AlertTitle>Brak danych do wykresu objętości</AlertTitle>
                  <AlertDescription>Nie zarejestrowano wystarczających danych (ciężar i powtórzenia) do wygenerowania wykresu objętości.</AlertDescription>
                </Alert>
              )}
              {setsPerExerciseChartData.length > 0 ? (
                 <div>
                  <h3 className="text-lg font-semibold mb-2 mt-6">Liczba Serii na Ćwiczenie</h3>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={setsPerExerciseChartData} layout="vertical" margin={{ right: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" dataKey="sets" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={150} interval={0} tick={{ fontSize: 12 }} />
                      <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent indicator="dot" />} />
                      <Bar dataKey="sets" fill="var(--color-sets)" radius={4} barSize={20} />
                    </BarChart>
                  </ChartContainer>
                </div>
              ) : (
                 <Alert variant="default">
                  <Info className="h-4 w-4"/>
                  <AlertTitle>Brak danych do wykresu liczby serii</AlertTitle>
                  <AlertDescription>Nie zarejestrowano żadnych serii dla ćwiczeń w tym treningu.</AlertDescription>
                </Alert>
              )}
            </CardContent>
             <CardFooter>
                <Alert variant="default">
                    <BarChartHorizontalBig className="h-4 w-4"/>
                    <AlertTitle>Więcej Wykresów (Wkrótce)</AlertTitle>
                    <AlertDescription>
                        Bardziej szczegółowe wizualizacje i analizy (np. porównanie z poprzednim wykonaniem, rozkład na grupy mięśniowe, TUT) będą dostępne w przyszłości.
                    </AlertDescription>
                </Alert>
             </CardFooter>
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
                    const suggestion = pbSuggestions.find(s => s.exerciseId === exercise.id);

                    if (!sets || sets.length === 0) return null; 

                    return (
                      <li key={exercise.id}>
                        <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>
                        {suggestion && (
                            <Alert variant={suggestion.status === 'accepted' ? 'default' : 'default'} className={`mb-2 ${suggestion.status === 'accepted' ? 'border-green-500 bg-green-500/10' : 'border-blue-500/50 bg-blue-500/10'}`}>
                                <Trophy className={`h-4 w-4 ${suggestion.status === 'accepted' ? 'text-green-500' : 'text-blue-500'}`} />
                                <AlertTitle className={`${suggestion.status === 'accepted' ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'}`}>
                                    {suggestion.status === 'accepted' ? "Rekord Zaakceptowany!" : "Potencjalny Nowy Rekord!"}
                                </AlertTitle>
                                <AlertDescription>
                                    Osiągnięto: {suggestion.achievedValue}
                                    {suggestion.status === 'suggested' && (
                                        <div className="mt-2 flex gap-2">
                                            <Button size="sm" onClick={() => handlePbSuggestion(exercise.id, 'accepted')} variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                                                <CheckCircle className="mr-1 h-4 w-4"/>Akceptuj PB
                                            </Button>
                                            <Button size="sm" onClick={() => handlePbSuggestion(exercise.id, 'rejected')} variant="outline">
                                                <XCircle className="mr-1 h-4 w-4"/>Odrzuć
                                            </Button>
                                        </div>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                        {exerciseNote && (
                          <div className="mb-2 p-2 text-sm bg-muted/30 border rounded-md">
                            <p className="flex items-center gap-1 font-medium"><Edit2 className="h-4 w-4"/>Notatka do ćwiczenia:</p>
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
                <Label htmlFor="difficulty" className="block text-sm font-medium mb-1">Ocena Trudności Treningu</Label>
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
                <Label htmlFor="generalNotes" className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <StickyNote className="h-4 w-4"/>Notatki Ogólne do Treningu (opcjonalne)
                </Label>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-primary"/>Udostępnij w Społeczności</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="share-community-switch"
                  checked={shareToCommunity}
                  onCheckedChange={setShareToCommunity}
                  disabled={isSaving}
                />
                <Label htmlFor="share-community-switch">Udostępnij ten trening</Label>
              </div>
              {shareToCommunity && (
                <div>
                  <Label htmlFor="community-comment">Dodaj komentarz do posta (opcjonalne)</Label>
                  <Textarea
                    id="community-comment"
                    placeholder="Np. Świetny trening! Polecam!"
                    value={communityPostComment}
                    onChange={(e) => setCommunityPostComment(e.target.value)}
                    rows={3}
                    className="mt-1"
                    disabled={isSaving}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
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
                    <AlertDialogCancel disabled={isSaving} onClick={() => setShowDiscardDialog(false)}>Anuluj</AlertDialogCancel>
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

          <AlertDialog open={showShareConfirmDialog} onOpenChange={setShowShareConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Potwierdź Udostępnienie w Społeczności</AlertDialogTitle>
                <AlertDialogDescription>
                  Czy na pewno chcesz udostępnić ten trening: <span className="font-semibold">{summaryData.workoutName}</span>?
                  <br />
                  {communityPostComment ? (
                    <>Twój komentarz: <span className="italic">"{communityPostComment}"</span></>
                  ) : (
                    "Udostępnisz bez dodatkowego komentarza."
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSaving} onClick={() => setShowShareConfirmDialog(false)}>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={performSaveAndShare} disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Share2 className="mr-2 h-4 w-4"/>}
                  Udostępnij i Zapisz
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </main>
    </div>
  );
}
