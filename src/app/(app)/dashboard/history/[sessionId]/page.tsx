"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Info,
  History as HistoryIcon,
  Loader2,
  Dumbbell,
  Clock,
  TrendingUp,
  ListOrdered,
  RotateCcw,
  Edit3,
  Target,
} from "lucide-react";
// DATABASE INTEGRATION:
// - Data Source: The `sessionId` from the URL is used to fetch a specific session
//   from the SQLite database via the API endpoint `/api/workout-sessions/[sessionId]`.
// - Operations:
//   - "Repeat Workout": Navigates to the active workout page, passing the original workoutId
//     and current sessionId. The active workout page loads this past session from database.
//   - No data modification happens on this page itself.
import { type RecordedSet } from "@/lib/mockData";

// DATABASE INTEGRATION: Interface for session details from API
interface HistoricalWorkoutSession {
  id: string;
  workoutId?: string;
  workoutName: string;
  workoutType?: string;
  startTime: string;
  endTime: string;
  totalTimeSeconds: number;
  difficulty?: string;
  generalNotes?: string;
  calculatedTotalVolume?: number;
  exercises: Array<{
    id: string;
    name: string;
    defaultSets?: number;
    defaultReps?: string;
    defaultRest?: number;
  }>;
  recordedSets: Record<
    string,
    Array<{
      setNumber: number;
      weight?: string;
      reps?: string;
      rpe?: number;
      notes?: string;
    }>
  >;
}
import { useToast } from "@/hooks/use-toast";

// Helper to format time from seconds to a readable string
const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0)
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
      2,
      "0"
    )}m`;
  return `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(
    2,
    "0"
  )}s`;
};

// Calculates the total volume for a single exercise based on its recorded sets.
const calculateExerciseVolume = (sets: RecordedSet[]): number => {
  let volume = 0;
  sets.forEach((set) => {
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
  const searchParams = useSearchParams(); // Get search params for potential future use (e.g., `?source=plan`)
  const { toast } = useToast();
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] =
    React.useState<HistoricalWorkoutSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // DATABASE INTEGRATION: Fetch session data from database via API
  React.useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/workout-sessions/${sessionId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setSessionData(data.data);
        } else {
          const errorMessage =
            data.message ||
            `Nie znaleziono sesji treningowej o ID: ${sessionId}`;
          setError(errorMessage);
          toast({
            title: "Błąd",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (err) {
        const errorMessage = "Błąd połączenia z serwerem";
        setError(errorMessage);
        toast({
          title: "Błąd połączenia",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("Error fetching session data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId, toast]);

  // DATABASE INTEGRATION: Handles the "Repeat Workout" button click.
  // It navigates to the active workout page, passing the original workoutId and current sessionId
  // as query parameters. The active workout page loads data from this specific past session from database.
  const handleRepeatWorkout = () => {
    if (sessionData) {
      // Use workoutId if available, otherwise use sessionId as fallback
      const workoutIdToUse = sessionData.workoutId || sessionData.id;
      router.push(
        `/dashboard/workout/active/${workoutIdToUse}?repeatSessionId=${sessionData.id}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Ładowanie szczegółów sesji...
        </p>
      </div>
    );
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
    // This case should ideally be caught by the error state if a session isn't found.
    // It serves as a fallback if `foundSession` is null but `error` wasn't set.
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
            <h1
              className="text-xl font-bold truncate max-w-xs sm:max-w-md md:max-w-lg"
              title={sessionData.workoutName}
            >
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
          {/* Overview Card: Displays general session information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {sessionData.workoutName}
              </CardTitle>
              <CardDescription>
                Data:{" "}
                {isValid(parseISO(sessionData.startTime))
                  ? format(parseISO(sessionData.startTime), "PPPp", {
                      locale: pl,
                    })
                  : "Nieprawidłowa data"}
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
                    {/* Total volume is calculated and stored in database */}
                    <p>
                      {(sessionData.calculatedTotalVolume || 0).toLocaleString(
                        "pl-PL"
                      )}{" "}
                      kg
                    </p>
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
                  <h4 className="font-semibold mb-1 mt-3 flex items-center gap-1">
                    <Edit3 className="h-4 w-4" />
                    Notatki Ogólne do Sesji:
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/20 p-3 rounded-md">
                    {sessionData.generalNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercises Card: Lists all exercises performed and their sets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="h-6 w-6 text-primary" />
                Wykonane Ćwiczenia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filter out exercises that have no recorded sets to avoid empty entries */}
              {sessionData.exercises.filter(
                (ex) => sessionData.recordedSets[ex.id]?.length > 0
              ).length > 0 ? (
                <ScrollArea className="max-h-[60vh] pr-3">
                  {" "}
                  {/* Scroll for long lists */}
                  <ul className="space-y-6">
                    {sessionData.exercises.map((exercise) => {
                      const sets = sessionData.recordedSets[exercise.id];
                      if (!sets || sets.length === 0) return null; // Skip if no sets recorded for this exercise

                      const exerciseVolume = calculateExerciseVolume(sets);

                      return (
                        <li
                          key={exercise.id}
                          className="pb-4 border-b last:border-b-0"
                        >
                          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-primary/80" />
                            {exercise.name}
                          </h3>
                          {exerciseVolume > 0 && ( // Only show volume if it's calculable
                            <p className="text-xs text-muted-foreground mb-2">
                              Objętość dla ćwiczenia:{" "}
                              {exerciseVolume.toLocaleString("pl-PL")} kg
                            </p>
                          )}
                          <Table className="text-xs sm:text-sm">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[15%]">Seria</TableHead>
                                <TableHead className="w-[25%]">
                                  Ciężar/Intens.
                                </TableHead>
                                <TableHead className="w-[25%]">
                                  Powt./Czas
                                </TableHead>
                                <TableHead className="w-[15%] text-center">
                                  RPE
                                </TableHead>
                                <TableHead className="w-[20%]">
                                  Notatki
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sets.map((set, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {set.setNumber}
                                  </TableCell>
                                  <TableCell>{set.weight}</TableCell>
                                  <TableCell>{set.reps}</TableCell>
                                  <TableCell className="text-center">
                                    {set.rpe || "-"}
                                  </TableCell>
                                  <TableCell
                                    className="italic text-muted-foreground truncate max-w-[100px] sm:max-w-[150px]"
                                    title={set.notes || undefined}
                                  >
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
                <p className="text-muted-foreground text-center py-4">
                  Nie zarejestrowano żadnych serii dla ćwiczeń w tej sesji.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
