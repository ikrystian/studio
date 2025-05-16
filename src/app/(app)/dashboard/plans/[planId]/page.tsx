
"use client";

import * as React from "react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Target, Dumbbell, Coffee, Edit3, PlayCircle, Info, BookOpen, User, Users2, ExternalLink, ListChecks, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { MOCK_DETAILED_TRAINING_PLANS, type DetailedTrainingPlan, MOCK_EXERCISES_DATABASE, type ExerciseInWorkout } from "@/lib/mockData";
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
} from "@/components/ui/alert-dialog"; // Ensure this import is correct

const PENDING_CUSTOM_WORKOUT_KEY = 'pendingCustomWorkoutToStart';


export default function TrainingPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const planId = params.planId as string;

  const [planData, setPlanData] = React.useState<DetailedTrainingPlan | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    // Simulate data fetching
    const timer = setTimeout(() => {
      const foundPlan = MOCK_DETAILED_TRAINING_PLANS.find(p => p.id === planId);
      if (foundPlan) {
        setPlanData(foundPlan);
      } else {
        // Fallback to a default display if plan not found, or redirect
        setPlanData(MOCK_DETAILED_TRAINING_PLANS.find(p => p.id === 'default_plan_details') || null);
        if (!MOCK_DETAILED_TRAINING_PLANS.find(p => p.id === 'default_plan_details')) {
            toast({
                title: "Błąd",
                description: `Nie znaleziono planu o ID: ${planId}.`,
                variant: "destructive",
            });
        }
      }
      setIsLoading(false);
    }, 750); 
    return () => clearTimeout(timer);
  }, [planId, toast]);

  const handleStartWorkout = (dayName: string, workoutId?: string, workoutName?: string) => {
    if (!planData || !workoutId || !workoutName) {
      toast({ title: "Błąd", description: "Nie można rozpocząć tego treningu.", variant: "destructive" });
      return;
    }
    // Try to find the exercises for this workoutId from the general MOCK_EXERCISES_DATABASE
    // This is a simplification. In a real app, workout structures would be more robustly defined.
    // For mock: assume a workout named "Trening A - Full Body" might map to a few exercises.
    // This logic needs to be more sophisticated or workout definitions more complete.

    let exercisesToStart: ExerciseInWorkout[] = [];

    // Simplistic mapping: if a workout has a known ID from MOCK_WORKOUTS, use its exercises
    // For now, we'll mock some exercises if a specific workout ID is provided
    // This is a placeholder for actual workout structure retrieval
    if (workoutId === "wk1") { // Example: "Trening A - Full Body"
        exercisesToStart = [
            { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
            { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 3, defaultReps: "8-10", defaultRest: 120 },
            { id: "ex4", name: "Podciąganie na drążku", defaultSets: 3, defaultReps: "Max", defaultRest: 90 },
        ];
    } else if (workoutId.startsWith("custom_wk_")) { // Generic for other "custom" workouts in mock plan
         exercisesToStart = MOCK_EXERCISES_DATABASE
            .filter(ex => ex.name.toLowerCase().includes(workoutName.split(" (")[0].toLowerCase().substring(0,5)) || ex.category.toLowerCase().includes(workoutName.split(" (")[0].toLowerCase().substring(0,5))) // very basic matching
            .slice(0, 3) // Max 3 exercises for mock
            .map(ex => ({ id: ex.id, name: ex.name, defaultSets: 3, defaultReps: "10", defaultRest: 60 }));
        if(exercisesToStart.length === 0) { // Fallback if no matches
             exercisesToStart.push({id: MOCK_EXERCISES_DATABASE[0].id, name: MOCK_EXERCISES_DATABASE[0].name, defaultSets: 3, defaultReps: "10", defaultRest: 60});
        }
    } else { // Fallback for any other workoutId
        exercisesToStart = [{id: MOCK_EXERCISES_DATABASE[0].id, name: MOCK_EXERCISES_DATABASE[0].name, defaultSets: 3, defaultReps: "10", defaultRest: 60}];
    }

    const customWorkoutToStart = {
        id: `custom-repeat-${planData.id}-${dayName.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
        name: `${workoutName} (z planu: ${planData.name})`,
        exercises: exercisesToStart,
    };
    localStorage.setItem(PENDING_CUSTOM_WORKOUT_KEY, JSON.stringify(customWorkoutToStart));
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
            <CardTitle className="flex items-center gap-2"><Info className="h-6 w-6 text-destructive"/>Błąd Planu</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Nie znaleziono planu</AlertTitle>
              <AlertDescription>
                Przepraszamy, ale nie mogliśmy znaleźć szczegółów dla tego planu treningowego.
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
            <h1 className="text-xl font-bold truncate max-w-xs sm:max-w-md md:max-w-lg" title={planData.name}>
              Szczegóły Planu
            </h1>
          </div>
           <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Funkcja wkrótce!", description: "Edycja planów będzie dostępna niedługo."})}>
              <Edit3 className="mr-2 h-4 w-4" /> Edytuj Plan
            </Button>
             {/* This start button is more of a "Start this whole plan" if applicable, or removed if starting is per-day */}
            {/* <Button size="sm" onClick={() => toast({title: "Funkcja wkrótce!", description: "Rozpoczęcie całego planu (śledzenie) będzie dostępne."})}>
                <PlayCircle className="mr-2 h-4 w-4"/> Rozpocznij Ten Plan
            </Button> */}
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">{planData.name}</CardTitle>
              <CardDescription className="text-md text-muted-foreground pt-1">{planData.description}</CardDescription>
               <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" /> Cel: <span className="font-medium text-foreground">{planData.goal}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" /> Czas trwania: <span className="font-medium text-foreground">{planData.duration}</span>
                </div>
                {planData.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" /> Autor: 
                    <Link href={`/dashboard/profile/${planData.author.toLowerCase().replace(/\s+/g, '_')}`} className="font-medium text-primary hover:underline">{planData.author}</Link>
                  </div>
                )}
              </div>
              {planData.isPublic && <Badge variant="secondary" className="mt-2 w-fit">Plan Publiczny</Badge>}
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListChecks className="h-6 w-6 text-primary"/>Harmonogram Tygodniowy</CardTitle>
              <CardDescription>Struktura treningów i dni odpoczynku w cyklu tygodniowym.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
                <div className="space-y-4">
                  {planData.schedule.map((day, index) => (
                    <Card key={index} className="bg-muted/20 p-4 shadow-sm plan-day-card">
                      <CardTitle className="text-lg font-semibold mb-2">{day.dayName}</CardTitle>
                      {day.isRestDay ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <Coffee className="mr-2 h-5 w-5" />
                          <span>Dzień Odpoczynku</span>
                        </div>
                      ) : day.assignedWorkoutName ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center">
                                <Dumbbell className="mr-2 h-5 w-5 text-primary" />
                                <span className="font-medium">{day.assignedWorkoutName}</span>
                            </div>
                            <Button size="sm" variant="default" onClick={() => handleStartWorkout(day.dayName, day.assignedWorkoutId, day.assignedWorkoutName)} className="w-full sm:w-auto">
                                <PlayCircle className="mr-2 h-4 w-4"/> Rozpocznij Trening Dnia
                            </Button>
                        </div>
                      ) : (
                        <div className="flex items-center text-muted-foreground">
                          <Info className="mr-2 h-5 w-5" />
                          <span>Brak przypisanego treningu</span>
                        </div>
                      )}
                      {day.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">Notatka: {day.notes}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <div className="flex justify-end items-center gap-3 mt-6">
                <Button variant="outline" onClick={() => toast({title: "Funkcja wkrótce", description: "Możliwość duplikowania planu zostanie dodana wkrótce."})}>
                    Duplikuj Plan (Wkrótce)
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" onClick={() => { /* Logic to open confirmation */ }}>
                            Usuń Plan (Wkrótce)
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Czy na pewno chcesz usunąć ten plan?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Ta akcja jest nieodwracalna. Wszystkie dane powiązane z tym planem zostaną trwale usunięte.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                            <AlertDialogAction onClick={() => toast({title: "Funkcja wkrótce", description: "Usuwanie planu będzie dostępne.", variant: "destructive"})}>
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
