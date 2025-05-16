
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import dynamic from 'next/dynamic';
import {
  Dumbbell,
  ArrowLeft,
  PlusCircle,
  Save,
  Trash2,
  ChevronUp,
  ChevronDown,
  XCircle,
  Loader2,
  PlusSquare,
  Copy,
  ClipboardList,
  Edit3,
  AlertTriangle, 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Exercise as SelectableExerciseType } from "@/components/workout/exercise-selection-dialog";
import type { QuickAddExerciseFormData } from "@/components/workout/quick-add-exercise-dialog";
// MOCK BACKEND LOGIC:
// - Master Exercise List: Fetched from `/api/exercises` (SQLite DB).
// - Quick Add Exercise: A new exercise is saved to the SQLite DB via `/api/exercises/create`.
//   The client-side `masterExerciseList` is updated optimistically.
// - Save Workout: The complete workout definition is POSTed to `/api/workout-definitions/create` (SQLite DB).

const ExerciseSelectionDialog = dynamic(() =>
  import("@/components/workout/exercise-selection-dialog").then((mod) => mod.ExerciseSelectionDialog), {
  loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});

const QuickAddExerciseDialog = dynamic(() =>
  import("@/components/workout/quick-add-exercise-dialog").then((mod) => mod.QuickAddExerciseDialog), {
  loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});


const exerciseInWorkoutSchema = z.object({
  id: z.string(), 
  name: z.string().min(1, "Nazwa ćwiczenia jest wymagana."),
  sets: z.union([z.coerce.number({invalid_type_error: "Serie muszą być liczbą."}).positive("Liczba serii musi być dodatnia.").optional().nullable(), z.literal("")]),
  reps: z.string().optional().nullable(),
  restTimeSeconds: z.union([z.coerce.number({invalid_type_error: "Czas odpoczynku musi być liczbą."}).int("Czas odpoczynku musi być liczbą całkowitą.").min(0, "Czas odpoczynku nie może być ujemny.").optional().nullable(), z.literal("")]),
  targetRpe: z.string().optional().nullable(),
  exerciseNotes: z.string().optional().nullable(),
});

export type ExerciseInWorkoutFormValues = z.infer<typeof exerciseInWorkoutSchema>;

const workoutFormSchema = z.object({
  workoutName: z.string().min(1, "Nazwa treningu jest wymagana."),
  workoutType: z.string().optional(),
  exercises: z.array(exerciseInWorkoutSchema).min(1, "Trening musi zawierać przynajmniej jedno ćwiczenie."),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;


export default function CreateWorkoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pageIsLoading, setPageIsLoading] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false); 
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [exerciseFetchError, setExerciseFetchError] = React.useState<string | null>(null);

  const [isExerciseSelectionDialogOpen, setIsExerciseSelectionDialogOpen] = React.useState(false);
  const [isQuickAddExerciseDialogOpen, setIsQuickAddExerciseDialogOpen] = React.useState(false);

  const [masterExerciseList, setMasterExerciseList] = React.useState<SelectableExerciseType[]>([]);

  React.useEffect(() => {
    async function fetchExercises() {
      setPageIsLoading(true);
      setExerciseFetchError(null);
      try {
        // MOCK BACKEND LOGIC: Fetch master list of exercises from the API (SQLite DB).
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Nie udało się załadować listy ćwiczeń. Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setMasterExerciseList(data.data);
        } else {
          throw new Error(data.message || "Nie udało się załadować ćwiczeń (odpowiedź API bez sukcesu).");
        }
      } catch (error: any) {
        console.error("Error fetching exercises for create page:", error);
        setExerciseFetchError(error.message || "Wystąpił nieznany błąd podczas ładowania ćwiczeń.");
        setMasterExerciseList([]); 
        toast({ title: "Błąd Ładowania Ćwiczeń", description: error.message || "Spróbuj odświeżyć stronę.", variant: "destructive" });
      } finally {
        setPageIsLoading(false);
      }
    }
    fetchExercises();
  }, [toast]);


  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      workoutName: "",
      workoutType: "Mieszany",
      exercises: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const handleOpenExerciseSelectionDialog = () => {
    if (exerciseFetchError) {
        toast({ title: "Błąd Ładowania Ćwiczeń", description: "Nie można otworzyć okna wyboru, ponieważ lista ćwiczeń nie została załadowana.", variant: "destructive"});
        return;
    }
    setIsExerciseSelectionDialogOpen(true);
  };

  const handleExercisesSelected = (selectedExercises: { id: string; name: string }[]) => {
    const exercisesToAppend = selectedExercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: "",
        reps: "",
        restTimeSeconds: "",
        targetRpe: "",
        exerciseNotes: "",
    }));
    append(exercisesToAppend);
    if (form.formState.errors.exercises && typeof form.formState.errors.exercises.message === 'string') {
        form.clearErrors("exercises.root.message" as any);
        form.clearErrors("exercises");
    }
  };

  const handleRemoveExercise = (index: number) => {
    remove(index);
  };

  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      move(index, index - 1);
    } else if (direction === "down" && index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  const handleOpenQuickAddExerciseDialog = () => {
    setIsQuickAddExerciseDialogOpen(true);
  };

  // MOCK BACKEND LOGIC: After a new exercise is successfully saved to DB via API (handled in dialog),
  // update the client-side master list and append to current workout form.
  const handleQuickExerciseCreated = (newDbExercise: SelectableExerciseType) => {
    setMasterExerciseList(prev => [...prev, newDbExercise]); // Add to client-side master list
    append({ // Append to current workout form
      id: newDbExercise.id,
      name: newDbExercise.name,
      sets: "",
      reps: "",
      restTimeSeconds: "",
      targetRpe: "",
      exerciseNotes: "",
    });
    toast({
      title: "Ćwiczenie Zapisane i Dodane!",
      description: `"${newDbExercise.name}" zostało zapisane w bazie i dodane do tego treningu.`,
    });
    setIsQuickAddExerciseDialogOpen(false);
    if (form.formState.errors.exercises && typeof form.formState.errors.exercises.message === 'string') {
        form.clearErrors("exercises.root.message" as any);
        form.clearErrors("exercises");
    }
  };

  const handleCopyFromPrevious = (index: number) => {
    if (index === 0) return;
    const previousExerciseData = form.getValues(`exercises.${index - 1}`);
    form.setValue(`exercises.${index}.sets`, previousExerciseData.sets || "");
    form.setValue(`exercises.${index}.reps`, previousExerciseData.reps || "");
    form.setValue(`exercises.${index}.restTimeSeconds`, previousExerciseData.restTimeSeconds || "");
    form.setValue(`exercises.${index}.targetRpe`, previousExerciseData.targetRpe || "");
    form.setValue(`exercises.${index}.exerciseNotes`, previousExerciseData.exerciseNotes || "");
    toast({
      title: "Parametry Skopiowane",
      description: `Parametry zostały skopiowane z ćwiczenia: ${previousExerciseData.name}.`,
    });
  };

  const handleLoadMockDefaults = (index: number) => {
    form.setValue(`exercises.${index}.sets`, 3);
    form.setValue(`exercises.${index}.reps`, "10");
    form.setValue(`exercises.${index}.restTimeSeconds`, 60);
    form.setValue(`exercises.${index}.targetRpe`, "7");
    form.setValue(`exercises.${index}.exerciseNotes`, "Załadowano domyślne parametry (symulacja).");
    toast({
      title: "Domyślne Parametry Załadowane (Symulacja)",
      description: `Ustawiono domyślne wartości dla ćwiczenia: ${form.getValues(`exercises.${index}.name`)}.`,
    });
  };

  // MOCK BACKEND LOGIC: Submits the new workout definition to the `/api/workout-definitions/create` endpoint,
  // which then saves it to the SQLite database.
  async function onSubmit(values: WorkoutFormValues) {
    setIsLoading(true);
    setServerError(null);
    const payload = {
      workoutName: values.workoutName,
      workoutType: values.workoutType,
      exercises: values.exercises.map(ex => ({
        id: ex.id, 
        name: ex.name, 
        sets: ex.sets,
        reps: ex.reps,
        restTimeSeconds: ex.restTimeSeconds,
        targetRpe: ex.targetRpe,
        exerciseNotes: ex.exerciseNotes,
      })),
    };
    console.log("Submitting workout data to API:", payload);
    try {
      const response = await fetch('/api/workout-definitions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast({
          title: "Trening zapisany!",
          description: `Trening "${values.workoutName}" został pomyślnie zapisany w bazie danych.`,
          variant: "default",
        });
        router.push("/dashboard/workout/start"); 
      } else {
        setServerError(result.message || "Wystąpił błąd podczas zapisywania treningu.");
        toast({
          title: "Błąd Zapisu",
          description: result.message || "Nie udało się zapisać treningu.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("API call error:", error);
      setServerError("Nie udało się połączyć z serwerem. Spróbuj ponownie później.");
      toast({
        title: "Błąd Połączenia",
        description: "Nie udało się połączyć z serwerem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (pageIsLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Wczytywanie edytora treningów...</p>
        </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/workout/start">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do wyboru treningu</span>
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Stwórz Nowy Trening</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleOpenQuickAddExerciseDialog} disabled={isLoading}>
              <PlusSquare className="mr-2 h-4 w-4" /> Szybkie Dodaj Ćwiczenie
            </Button>
            <Button form="workout-form" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Zapisz Trening
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <Form {...form}>
            <form id="workout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Szczegóły Treningu</CardTitle>
                  <CardDescription>Nadaj swojemu nowemu treningowi nazwę i opcjonalnie określ jego typ.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {serverError && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Błąd</AlertTitle>
                      <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                  )}
                  <FormField
                    control={form.control}
                    name="workoutName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nazwa Treningu</FormLabel>
                        <FormControl>
                          <Input placeholder="Np. Mój Trening Siłowy Poniedziałek" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription>
                          Wpisz chwytliwą nazwę dla swojego planu treningowego.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workoutType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typ Treningu</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz typ treningu (opcjonalne)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Siłowy">Siłowy</SelectItem>
                            <SelectItem value="Cardio">Cardio</SelectItem>
                            <SelectItem value="Rozciąganie">Rozciąganie</SelectItem>
                            <SelectItem value="Mieszany">Mieszany</SelectItem>
                            <SelectItem value="Inny">Inny</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Określ główny charakter tego treningu.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Ćwiczenia</CardTitle>
                    <CardDescription>Dodaj ćwiczenia i skonfiguruj ich parametry.</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={handleOpenExerciseSelectionDialog} disabled={isLoading || !!exerciseFetchError}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Dodaj z Bazy
                  </Button>
                </CardHeader>
                <CardContent>
                  {exerciseFetchError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Błąd Ładowania Listy Ćwiczeń</AlertTitle>
                        <AlertDescription>
                            {exerciseFetchError} Spróbuj odświeżyć stronę. Nie można dodać ćwiczeń z bazy. Możesz skorzystać z opcji "Szybkie Dodaj Ćwiczenie".
                        </AlertDescription>
                    </Alert>
                  )}
                  {fields.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      <Dumbbell className="mx-auto mb-2 h-12 w-12" />
                      <p>Brak dodanych ćwiczeń.</p>
                      <p>Kliknij "+ Dodaj z Bazy" lub "Szybkie Dodaj Ćwiczenie", aby rozpocząć.</p>
                    </div>
                  ) : (
                    <ul className="space-y-6">
                      {fields.map((item, index) => (
                        <li key={item.id}> 
                          <Card className="bg-card p-4 shadow-md">
                            <div className="flex items-start justify-between gap-2 mb-4">
                              <div className="flex items-center gap-2 flex-grow min-w-0">
                                <span className="font-semibold text-lg text-primary shrink-0">{index + 1}.</span>
                                <span className="font-medium text-lg truncate" title={item.name}>{item.name}</span>
                              </div>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMoveExercise(index, "up")}
                                  disabled={index === 0 || isLoading}
                                  aria-label="Przesuń w górę"
                                  className="h-8 w-8"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMoveExercise(index, "down")}
                                  disabled={index === fields.length - 1 || isLoading}
                                  aria-label="Przesuń w dół"
                                  className="h-8 w-8"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveExercise(index)}
                                  className="text-destructive hover:text-destructive h-8 w-8"
                                  disabled={isLoading}
                                  aria-label="Usuń ćwiczenie"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyFromPrevious(index)}
                                  disabled={isLoading}
                                  className="text-xs"
                                >
                                  <Copy className="mr-1 h-3 w-3" /> Kopiuj z pop.
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleLoadMockDefaults(index)}
                                disabled={isLoading}
                                className="text-xs"
                              >
                                <ClipboardList className="mr-1 h-3 w-3" /> Domyślne
                              </Button>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`exercises.${index}.sets`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Serie</FormLabel>
                                      <FormControl><Input type="number" placeholder="Np. 3" {...field} onChange={e => field.onChange(e.target.value === '' ? "" : Number(e.target.value))} value={field.value === null || field.value === undefined ? "" : field.value} disabled={isLoading} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`exercises.${index}.reps`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Powtórzenia/Czas</FormLabel>
                                      <FormControl><Input placeholder="Np. 8-10 lub 30s" {...field} value={field.value === null || field.value === undefined ? "" : field.value} disabled={isLoading} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`exercises.${index}.restTimeSeconds`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Odpoczynek (s)</FormLabel>
                                      <FormControl><Input type="number" placeholder="Np. 60" {...field} onChange={e => field.onChange(e.target.value === '' ? "" : Number(e.target.value))} value={field.value === null || field.value === undefined ? "" : field.value} disabled={isLoading} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`exercises.${index}.targetRpe`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Docelowe RPE (opcjonalne)</FormLabel>
                                      <FormControl><Input placeholder="Np. 7-8" {...field} value={field.value === null || field.value === undefined ? "" : field.value} disabled={isLoading} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name={`exercises.${index}.exerciseNotes`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Notatki do ćwiczenia (opcjonalne)</FormLabel>
                                    <FormControl><Textarea rows={2} placeholder="Np. skup się na technice, wolna faza negatywna" {...field} value={field.value === null || field.value === undefined ? "" : field.value} disabled={isLoading} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  )}
                   {form.formState.errors.exercises && typeof form.formState.errors.exercises.message === 'string' && (
                     <p className="text-sm font-medium text-destructive mt-4">
                       {form.formState.errors.exercises.message}
                     </p>
                   )}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4 mt-8">
                 <Button type="button" variant="outline" onClick={() => router.push('/dashboard/workout/start')} disabled={isLoading}>
                  Anuluj
                 </Button>
                <Button type="submit" disabled={isLoading || (form.formState.isSubmitted && !form.formState.isValid)}>
                   {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Zapisz Trening
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
      <ExerciseSelectionDialog
        isOpen={isExerciseSelectionDialogOpen}
        onOpenChange={setIsExerciseSelectionDialogOpen}
        availableExercises={masterExerciseList}
        onExercisesSelected={handleExercisesSelected}
      />
      <QuickAddExerciseDialog
        isOpen={isQuickAddExerciseDialogOpen}
        onOpenChange={setIsQuickAddExerciseDialogOpen}
        onExerciseCreated={handleQuickExerciseCreated}
      />
    </div>
  );
}
