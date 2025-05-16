
"use client";

import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dumbbell, Zap, Search, ListFilter, ArrowLeft, PlusCircle, PlayCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// MOCK_WORKOUTS_ACTIVE is no longer imported here
import type { Workout } from '@/app/(app)/dashboard/workout/active/[workoutId]/page';


function StretchHorizontal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12h16"/><path d="M4 12l4-4m-4 4l4 4m12-4l-4-4m4 4l-4 4"/>
    </svg>
  );
}

const WORKOUT_TYPES_FILTER = ["Wszystkie", "Siłowy", "Cardio", "Rozciąganie", "Mieszany", "Inny"]; // Expanded for DB types
const ACTIVE_WORKOUT_AUTOSAVE_KEY_PREFIX = "activeWorkoutAutosave_";

interface UnfinishedWorkoutInfo {
  workoutId: string;
  workoutName: string;
  startTime: string;
  autosaveKey: string;
}

export default function StartWorkoutPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [availableWorkouts, setAvailableWorkouts] = React.useState<Workout[]>([]);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedWorkoutType, setSelectedWorkoutType] = React.useState('Wszystkie');
  const [unfinishedWorkoutInfo, setUnfinishedWorkoutInfo] = React.useState<UnfinishedWorkoutInfo | null>(null);
  const [showDiscardConfirmDialog, setShowDiscardConfirmDialog] = React.useState(false);


  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setFetchError(null);
      let foundUnfinished = false;

      // MOCK BACKEND LOGIC: Checks localStorage for any keys starting with ACTIVE_WORKOUT_AUTOSAVE_KEY_PREFIX
      // to find previously started but unfinished workouts.
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(ACTIVE_WORKOUT_AUTOSAVE_KEY_PREFIX)) {
            const savedDataString = localStorage.getItem(key);
            if (savedDataString) {
              try {
                const parsedData = JSON.parse(savedDataString);
                if (parsedData.workoutId && parsedData.workoutName && parsedData.workoutStartTime) {
                  setUnfinishedWorkoutInfo({
                    workoutId: parsedData.workoutId,
                    workoutName: parsedData.workoutName,
                    startTime: parsedData.workoutStartTime,
                    autosaveKey: key,
                  });
                  foundUnfinished = true;
                  break;
                }
              } catch (e) {
                console.error("Error parsing autosaved workout data:", e);
              }
            }
          }
        }
      }
      
      // Fetch workout definitions from the API
      try {
        const response = await fetch('/api/workout-definitions');
        if (!response.ok) {
          throw new Error(`Failed to fetch workout definitions: ${response.statusText}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          setAvailableWorkouts(result.data);
        } else {
          setFetchError(result.message || "Could not load workout definitions.");
          setAvailableWorkouts([]);
        }
      } catch (error) {
        console.error("Error fetching workout definitions:", error);
        setFetchError(error instanceof Error ? error.message : "An unknown error occurred.");
        setAvailableWorkouts([]);
      }

      setIsLoading(false);
    }
    loadData();
  }, []);

  // MOCK BACKEND LOGIC: Simulates discarding an unfinished workout by removing its data from localStorage.
  const handleDiscardUnfinishedWorkout = () => {
    if (unfinishedWorkoutInfo) {
      localStorage.removeItem(unfinishedWorkoutInfo.autosaveKey);
      toast({
        title: "Niezakończony trening odrzucony",
        description: `Usunięto zapisany postęp dla "${unfinishedWorkoutInfo.workoutName}".`,
      });
      setUnfinishedWorkoutInfo(null);
      setShowDiscardConfirmDialog(false);
    }
  };

  const filteredWorkouts = availableWorkouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (workout.exercises.map(ex => ex.name).join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    const workoutType = workout.type || "Inny"; // Fallback if type is not set from DB
    const matchesType = selectedWorkoutType === 'Wszystkie' || workoutType === selectedWorkoutType;
    return matchesSearch && matchesType;
  });

  const getWorkoutIcon = (type: string | undefined) => {
    if (!type) return <Dumbbell className="mr-2 h-5 w-5 text-primary" />;
    switch (type.toLowerCase()) {
      case 'siłowy':
        return <Dumbbell className="mr-2 h-5 w-5 text-primary" />;
      case 'cardio':
        return <Zap className="mr-2 h-5 w-5 text-primary" />;
      case 'rozciąganie':
        return <StretchHorizontal className="mr-2 h-5 w-5 text-primary" />;
      default:
        return <Dumbbell className="mr-2 h-5 w-5 text-primary" />;
    }
  };

  if (isLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Wczytywanie treningów...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
             <Dumbbell className="h-7 w-7 text-primary" />
             <h1 className="text-xl font-bold">Rozpocznij Trening</h1>
          </div>
          <Button asChild>
            <Link href="/dashboard/workout/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Nowy Trening
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">

          {unfinishedWorkoutInfo && (
            <Card className="mb-6 border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <PlayCircle className="h-6 w-6" />
                  Wznów Niezakończony Trening
                </CardTitle>
                <CardDescription>
                  Masz zapisany postęp z poprzedniej sesji.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{unfinishedWorkoutInfo.workoutName}</p>
                <p className="text-sm text-muted-foreground">
                  Rozpoczęty: {format(parseISO(unfinishedWorkoutInfo.startTime), "PPPp", { locale: pl })}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <Link href={`/dashboard/workout/active/${unfinishedWorkoutInfo.workoutId}`}>
                    Kontynuuj Trening
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowDiscardConfirmDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Odrzuć i Zacznij Nowy
                </Button>
              </CardFooter>
            </Card>
          )}

          <AlertDialog open={showDiscardConfirmDialog} onOpenChange={setShowDiscardConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Odrzucić niezakończony trening?</AlertDialogTitle>
                <AlertDialogDescription>
                  Czy na pewno chcesz odrzucić postęp z treningu "{unfinishedWorkoutInfo?.workoutName}"? Tej akcji nie można cofnąć.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={handleDiscardUnfinishedWorkout} className="bg-destructive hover:bg-destructive/90">
                  Potwierdź i odrzuć
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


          <section className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Wybierz Trening z Listy</h2>
            <p className="text-muted-foreground">
              Wybierz jeden z dostępnych treningów lub stwórz własny nowy plan.
            </p>
          </section>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Szukaj treningów (np. Nazwa, Opis)..."
                className="w-full rounded-lg bg-card pl-10 pr-4 py-2 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedWorkoutType} onValueChange={setSelectedWorkoutType}>
                <SelectTrigger className="w-full sm:w-auto min-w-[200px]">
                    <ListFilter className="mr-2 h-5 w-5" />
                    <SelectValue placeholder="Filtruj typ treningu" />
                </SelectTrigger>
                <SelectContent>
                    {WORKOUT_TYPES_FILTER.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <Separator className="my-6" />
          
          {fetchError && (
            <Card className="mb-6 border-destructive bg-destructive/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive-foreground">
                  <AlertTriangle className="h-6 w-6" />
                  Błąd Ładowania Treningów
                </CardTitle>
              </CardHeader>
              <CardContent className="text-destructive-foreground">
                <p>{fetchError}</p>
                <p className="mt-2">Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.</p>
              </CardContent>
            </Card>
          )}


          {!fetchError && filteredWorkouts.length > 0 ? (
            <ScrollArea className=" pr-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredWorkouts.map((workout) => (
                  <Card key={workout.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        {getWorkoutIcon(workout.type)}
                        {workout.name}
                      </CardTitle>
                      <CardDescription>{workout.type || "Niestandardowy"} - {workout.exercises.length} ćw.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">{workout.exercises.map(ex => ex.name).join(', ')}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/dashboard/workout/active/${workout.id}`}>
                          Rozpocznij
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            !fetchError && (
              <div className="mt-10 flex flex-col items-center justify-center text-center">
                <Dumbbell className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Brak dostępnych treningów</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedWorkoutType !== 'Wszystkie' 
                    ? `Nie znaleziono treningów pasujących do Twoich kryteriów.` 
                    : "Nie zdefiniowano jeszcze żadnych treningów. Możesz utworzyć nowy."}
                </p>
                <Button asChild size="lg">
                  <Link href="/dashboard/workout/create">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Utwórz Nowy Trening
                  </Link>
                </Button>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

