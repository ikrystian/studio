"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CalendarDays,
  Target,
  Dumbbell,
  Coffee,
  Edit3,
  PlayCircle,
  Info,
  BookOpen,
  User,
  Users2,
  ExternalLink,
  ListChecks,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// DATABASE INTEGRATION: Plan details are now fetched from the SQLite database via API endpoint.
// Starting a workout involves storing its structure in localStorage for the active workout page.
import { type ExerciseInWorkout } from "@/lib/mockData";

// Define types for database integration
interface PlanDayDetail {
  dayName: string;
  assignedWorkoutId?: string;
  assignedWorkoutName?: string;
  isRestDay: boolean;
  notes?: string;
  templateId?: string | null;
  templateName?: string | null;
}

interface DetailedTrainingPlan {
  id: string;
  name: string;
  description: string;
  goal: string;
  duration: string;
  schedule: PlanDayDetail[];
  author?: {
    id: string;
    fullName: string;
    username: string;
  };
  isPublic: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}
import { TrainingPlanDetailPageSkeleton } from "@/components/plans/TrainingPlanDetailPageSkeleton";
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

// MOCK BACKEND LOGIC: Key used to pass workout data to the active workout page via localStorage.
const PENDING_CUSTOM_WORKOUT_KEY = "pendingCustomWorkoutToStart";

export default function TrainingPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const planId = params.planId as string;

  const [planData, setPlanData] = React.useState<DetailedTrainingPlan | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // DATABASE INTEGRATION: Exercise database state
  const [exercisesDatabase, setExercisesDatabase] = React.useState<
    Array<{
      id: string;
      name: string;
      category: string;
    }>
  >([]);

  // DATABASE INTEGRATION: Fetch exercises from database
  React.useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises");
        const data = await response.json();
        if (data.success && data.exercises) {
          setExercisesDatabase(data.exercises);
        }
      } catch (error) {
        console.error("Error fetching exercises from database:", error);
        // Keep empty array as fallback
      }
    };

    fetchExercises();
  }, []);

  React.useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/training-plans/${planId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setPlanData(data.data);
        } else {
          setError(data.message || "Plan treningowy nie został znaleziony");
          toast({
            title: "Błąd",
            description:
              data.message || `Nie znaleziono planu o ID: ${planId}.`,
            variant: "destructive",
          });
        }
      } catch (err) {
        const errorMessage = "Błąd podczas ładowania planu treningowego";
        setError(errorMessage);
        toast({
          title: "Błąd połączenia",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("Error fetching plan details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanDetails();
  }, [planId, toast]);

  // MOCK BACKEND LOGIC: Simulates initiating a workout.
  // It prepares workout data (potentially from mock templates) and stores it in localStorage
  // for the '/dashboard/workout/active/[workoutId]' page to pick up.
  const handleStartWorkout = (
    dayName: string,
    workoutId?: string,
    workoutName?: string
  ) => {
    if (!planData || !workoutId || !workoutName) {
      toast({
        title: "Błąd",
        description: "Nie można rozpocząć tego treningu.",
        variant: "destructive",
      });
      return;
    }

    let exercisesToStart: ExerciseInWorkout[] = [];

    // MOCK BACKEND LOGIC: Simple exercise generation based on workout ID or name.
    // In a real app, these exercises would come from the workout definition in a database.
    if (workoutId === "wk1") {
      exercisesToStart = [
        {
          id: "ex1",
          name: "Wyciskanie sztangi na ławce płaskiej",
          defaultSets: 3,
          defaultReps: "8-10",
          defaultRest: 90,
        },
        {
          id: "ex2",
          name: "Przysiady ze sztangą",
          defaultSets: 3,
          defaultReps: "8-10",
          defaultRest: 120,
        },
        {
          id: "ex4",
          name: "Podciąganie na drążku",
          defaultSets: 3,
          defaultReps: "Max",
          defaultRest: 90,
        },
      ];
    } else if (workoutId.startsWith("custom_wk_")) {
      exercisesToStart = exercisesDatabase
        .filter(
          (ex) =>
            ex.name
              .toLowerCase()
              .includes(
                workoutName.split(" (")[0].toLowerCase().substring(0, 5)
              ) ||
            ex.category
              .toLowerCase()
              .includes(
                workoutName.split(" (")[0].toLowerCase().substring(0, 5)
              )
        )
        .slice(0, 3)
        .map((ex) => ({
          id: ex.id,
          name: ex.name,
          defaultSets: 3,
          defaultReps: "10",
          defaultRest: 60,
        }));
      if (exercisesToStart.length === 0 && exercisesDatabase.length > 0) {
        exercisesToStart.push({
          id: exercisesDatabase[0].id,
          name: exercisesDatabase[0].name,
          defaultSets: 3,
          defaultReps: "10",
          defaultRest: 60,
        });
      }
    } else {
      // Fallback for other workout IDs - uses a default exercise.
      if (exercisesDatabase.length > 0) {
        exercisesToStart = [
          {
            id: exercisesDatabase[0].id,
            name: exercisesDatabase[0].name,
            defaultSets: 3,
            defaultReps: "10",
            defaultRest: 60,
          },
        ];
      } else {
        // Ultimate fallback if no exercises are loaded
        exercisesToStart = [
          {
            id: "ex1",
            name: "Wyciskanie sztangi na ławce płaskiej",
            defaultSets: 3,
            defaultReps: "10",
            defaultRest: 60,
          },
        ];
      }
    }

    const customWorkoutToStart = {
      id: `custom-repeat-${planData.id}-${dayName
        .toLowerCase()
        .replace(/\s/g, "-")}-${Date.now()}`,
      name: `${workoutName} (z planu: ${planData.name})`,
      exercises: exercisesToStart,
    };
    // MOCK BACKEND LOGIC: Uses localStorage to pass the workout data to the active workout page.
    localStorage.setItem(
      PENDING_CUSTOM_WORKOUT_KEY,
      JSON.stringify(customWorkoutToStart)
    );
    router.push(`/dashboard/workout/active/${customWorkoutToStart.id}`);
  };

  if (isLoading) {
    return <TrainingPlanDetailPageSkeleton />;
  }

  if (!planData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-6 w-6 text-destructive" />
              Błąd Planu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Nie znaleziono planu</AlertTitle>
              <AlertDescription>
                Przepraszamy, ale nie mogliśmy znaleźć szczegółów dla tego planu
                treningowego.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/plans">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wróć do Listy Planów
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/plans">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Listy Planów</span>
              </Link>
            </Button>
            <BookOpen className="h-7 w-7 text-primary" />
            <h1
              className="text-xl font-bold truncate max-w-xs sm:max-w-md md:max-w-lg"
              title={planData.name}
            >
              Szczegóły Planu
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/plans/edit/${planId}`)}
            >
              <Edit3 className="mr-2 h-4 w-4" /> Edytuj Plan
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                {planData.name}
              </CardTitle>
              <CardDescription className="text-md text-muted-foreground pt-1">
                {planData.description}
              </CardDescription>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" /> Cel:{" "}
                  <span className="font-medium text-foreground">
                    {planData.goal}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" /> Czas trwania:{" "}
                  <span className="font-medium text-foreground">
                    {planData.duration}
                  </span>
                </div>
                {planData.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" /> Autor:
                    <Link
                      href={`/dashboard/profile/${planData.author.username
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {planData.author.fullName}
                    </Link>
                  </div>
                )}
              </div>
              {planData.isPublic && (
                <Badge variant="secondary" className="mt-2 w-fit">
                  Plan Publiczny
                </Badge>
              )}
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-primary" />
                Harmonogram Tygodniowy
              </CardTitle>
              <CardDescription>
                Struktura treningów i dni odpoczynku w cyklu tygodniowym.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[calc(100vh-20rem)]">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full space-y-2"
                >
                  {planData.schedule.map((day, index) =>
                    day.isRestDay || !day.assignedWorkoutName ? (
                      <Card
                        key={index}
                        className="bg-muted/20 p-4 shadow-sm plan-day-card"
                      >
                        <CardTitle className="text-lg font-semibold mb-1">
                          {day.dayName}
                        </CardTitle>
                        {day.isRestDay ? (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <Coffee className="mr-2 h-5 w-5" />
                            <span>Dzień Odpoczynku</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-muted-foreground">
                            <Info className="mr-2 h-5 w-5" />
                            <span>Brak przypisanego treningu</span>
                          </div>
                        )}
                        {day.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            Notatka: {day.notes}
                          </p>
                        )}
                      </Card>
                    ) : (
                      <AccordionItem
                        value={`day-${index}`}
                        key={index}
                        className="border-none"
                      >
                        <Card className="bg-muted/20 shadow-sm plan-day-card overflow-hidden">
                          <div className="flex flex-row items-center justify-between p-4 data-[state=open]:border-b data-[state=open]:border-border">
                            <AccordionTrigger className="flex-1 hover:no-underline focus:no-underline p-0 text-left group">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold mb-1 flex items-center gap-2">
                                  {day.dayName}
                                  <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </CardTitle>
                                <div className="flex items-center text-sm">
                                  <Dumbbell className="mr-2 h-4 w-4 text-primary" />
                                  <span className="font-medium">
                                    {day.assignedWorkoutName}
                                  </span>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                handleStartWorkout(
                                  day.dayName,
                                  day.assignedWorkoutId,
                                  day.assignedWorkoutName
                                );
                              }}
                              className="ml-4 flex-shrink-0"
                            >
                              <PlayCircle className="mr-2 h-4 w-4" /> Rozpocznij
                            </Button>
                          </div>
                          <AccordionContent className="p-4 text-sm">
                            {day.notes && (
                              <p className="text-xs text-muted-foreground mb-3 italic">
                                Notatka do dnia: {day.notes}
                              </p>
                            )}
                            <h4 className="font-semibold mb-1">
                              Szczegóły Treningu (Placeholder):
                            </h4>
                            <p className="text-muted-foreground mb-1">
                              Cel: Skupienie na{" "}
                              {exercisesDatabase.find(
                                (ex) =>
                                  ex.id === day.assignedWorkoutId?.split("_")[0]
                              )?.category || "ogólnej sile"}
                              .
                            </p>
                            <ul className="list-disc list-inside pl-2 text-muted-foreground">
                              <li>
                                Przykładowe ćwiczenie 1 (np.{" "}
                                {exercisesDatabase.length > 0
                                  ? exercisesDatabase[
                                      index % exercisesDatabase.length
                                    ]?.name || "Wyciskanie"
                                  : "Wyciskanie"}
                                )
                              </li>
                              <li>Przykładowe ćwiczenie 2</li>
                              <li>Przykładowe ćwiczenie 3</li>
                            </ul>
                            <p className="mt-2 text-xs text-primary">
                              (Pełna lista ćwiczeń i serii będzie dostępna po
                              integracji z modułem edycji treningów)
                            </p>
                          </AccordionContent>
                        </Card>
                      </AccordionItem>
                    )
                  )}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex justify-end items-center gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() =>
                toast({
                  title: "Funkcja wkrótce",
                  description:
                    "Możliwość duplikowania planu zostanie dodana wkrótce.",
                })
              }
            >
              Duplikuj Plan (Wkrótce)
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Usuń Plan (Wkrótce)</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Czy na pewno chcesz usunąć ten plan?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Ta akcja jest nieodwracalna. Wszystkie dane powiązane z tym
                    planem zostaną trwale usunięte.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      toast({
                        title: "Funkcja wkrótce",
                        description: "Usuwanie planu będzie dostępne.",
                        variant: "destructive",
                      })
                    }
                  >
                    Potwierdź i Usuń
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </main>
    </div>
  );
}
