
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
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
  Edit3, // Keep Edit3 if used for general edit icons, but not for the dialog
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
import { ExerciseSelectionDialog, type Exercise as SelectableExercise } from "@/components/workout/exercise-selection-dialog";
// Removed import for EditExerciseParametersDialog
import { QuickAddExerciseDialog, type QuickAddExerciseFormData } from "@/components/workout/quick-add-exercise-dialog";

// Initial mock database - will be turned into state
const INITIAL_MOCK_EXERCISES_DATABASE: SelectableExercise[] = [
  { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", category: "Klatka" },
  { id: "ex2", name: "Przysiady ze sztangą", category: "Nogi" },
  { id: "ex3", name: "Martwy ciąg", category: "Plecy" },
  { id: "ex4", name: "Podciąganie na drążku", category: "Plecy" },
  { id: "ex5", name: "Pompki", category: "Klatka" },
  { id: "ex6", name: "Bieg na bieżni (30 min)", category: "Cardio" },
  { id: "ex7", name: "Skakanka (15 min)", category: "Cardio" },
  { id: "ex8", name: "Rozciąganie dynamiczne", category: "Całe ciało" },
  { id: "ex9", name: "Wyciskanie żołnierskie (OHP)", category: "Barki" },
  { id: "ex10", name: "Uginanie ramion ze sztangą", category: "Ramiona" },
  { id: "ex11", name: "Plank", category: "Brzuch" },
  { id: "ex12", name: "Wiosłowanie sztangą", category: "Plecy" },
  { id: "ex13", name: "Wykroki", category: "Nogi" },
  { id: "ex14", name: "Unoszenie hantli bokiem", category: "Barki" },
  { id: "ex15", name: "Francuskie wyciskanie sztangielki", category: "Ramiona" },
  { id: "ex16", name: "Allah Pompki (Modlitewniki)", category: "Brzuch" },
  { id: "ex17", name: "Przysiad bułgarski", category: "Nogi" },
  { id: "ex18", name: "Wyciskanie hantli na ławce skośnej", category: "Klatka"},
];
export { INITIAL_MOCK_EXERCISES_DATABASE as MOCK_EXERCISES_DATABASE };


// Schema for an individual exercise in the workout form
const exerciseInWorkoutSchema = z.object({
  id: z.string(), // Keep as string if UUIDs are generated on client or come from mock
  name: z.string().min(1, "Nazwa ćwiczenia jest wymagana."),
  sets: z.coerce.number({invalid_type_error: "Serie muszą być liczbą."}).positive("Liczba serii musi być dodatnia.").optional().or(z.literal("")),
  reps: z.string().optional(), // e.g., "8-10", "Max", "30s"
  restTimeSeconds: z.coerce.number({invalid_type_error: "Czas odpoczynku musi być liczbą."}).int("Czas odpoczynku musi być liczbą całkowitą.").min(0, "Czas odpoczynku nie może być ujemny.").optional().or(z.literal("")),
  targetRpe: z.string().optional(), // e.g., "7-8"
  exerciseNotes: z.string().optional(),
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  
  const [isExerciseSelectionDialogOpen, setIsExerciseSelectionDialogOpen] = React.useState(false);
  const [isQuickAddExerciseDialogOpen, setIsQuickAddExerciseDialogOpen] = React.useState(false);

  const [masterExerciseList, setMasterExerciseList] = React.useState<SelectableExercise[]>(INITIAL_MOCK_EXERCISES_DATABASE);

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
    setIsExerciseSelectionDialogOpen(true);
  };

  const handleExercisesSelected = (selectedExercises: { id: string; name: string }[]) => {
    const exercisesToAppend = selectedExercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: undefined, // Default to undefined or a sensible default like 3
        reps: undefined, // Default to undefined or "8-12"
        restTimeSeconds: undefined, // Default to undefined or 60
        targetRpe: undefined,
        exerciseNotes: undefined,
    }));
    append(exercisesToAppend);
    if (form.formState.errors.exercises && typeof form.formState.errors.exercises.message === 'string') {
        form.clearErrors("exercises.root.message" as any); // Clear general array error
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

  const handleQuickExerciseCreated = (newExerciseData: { name: string; category: string }) => {
    const newDbExercise: SelectableExercise = {
      id: uuidv4(), // Generate unique ID for the new exercise
      name: newExerciseData.name,
      category: newExerciseData.category,
    };
    
    // Add to master list (simulating save to DB)
    setMasterExerciseList(prev => [...prev, newDbExercise]);

    // Add to current workout form
    append({
      id: newDbExercise.id,
      name: newDbExercise.name,
      sets: undefined,
      reps: undefined,
      restTimeSeconds: undefined,
      targetRpe: undefined,
      exerciseNotes: undefined,
    });

    toast({
      title: "Ćwiczenie Dodane!",
      description: `"${newDbExercise.name}" zostało dodane do bazy i obecnego treningu.`,
    });
    setIsQuickAddExerciseDialogOpen(false); // Close the dialog
    if (form.formState.errors.exercises && typeof form.formState.errors.exercises.message === 'string') {
        form.clearErrors("exercises.root.message" as any);
        form.clearErrors("exercises");
    }
  };


  async function onSubmit(values: WorkoutFormValues) {
    setIsLoading(true);
    setServerError(null);
    console.log("Workout data submitted:", values);
    console.log("Current Master Exercise List:", masterExerciseList); // To verify quick-adds

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Trening zapisany (Symulacja)!",
      description: (
        <div>
          <p>Trening "{values.workoutName}" został pomyślnie utworzony (symulacja).</p>
          {/* 
          <p className="mt-2">Co chcesz teraz zrobić?</p>
          <div className="flex gap-2 mt-1">
            <Button size="sm" onClick={() => router.push(`/workout/active/${'mock-new-id'}`)}>Rozpocznij ten trening</Button>
            <Button size="sm" variant="outline" onClick={() => router.push('/workout/start')}>Wróć do listy</Button>
          </div>
          */}
        </div>
      ),
      variant: "default",
      duration: 5000, // Longer duration for the example with buttons
    });
    router.push("/workout/start"); // Or wherever appropriate after saving

    setIsLoading(false);
  }


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/workout/start">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do wyboru treningu</span>
              </Link>
            </Button>
            <Dumbbell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Stwórz Nowy Trening</h1>
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

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
                  <Button type="button" variant="outline" onClick={handleOpenExerciseSelectionDialog} disabled={isLoading}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Dodaj z Bazy
                  </Button>
                </CardHeader>
                <CardContent>
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
                          <Card className="bg-muted/30 p-4">
                            <div className="flex items-start justify-between gap-2 mb-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-lg pt-1">{index + 1}.</span>
                                <span className="font-medium text-lg pt-1">{item.name}</span>
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
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`exercises.${index}.sets`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Serie</FormLabel>
                                      <FormControl><Input type="number" placeholder="Np. 3" {...field} onChange={e => field.onChange(e.target.value === '' ? "" : Number(e.target.value))} value={field.value === undefined ? "" : field.value} disabled={isLoading} /></FormControl>
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
                                      <FormControl><Input placeholder="Np. 8-10 lub 30s" {...field} value={field.value ?? ""} disabled={isLoading} /></FormControl>
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
                                      <FormControl><Input type="number" placeholder="Np. 60" {...field} onChange={e => field.onChange(e.target.value === '' ? "" : Number(e.target.value))} value={field.value === undefined ? "" : field.value} disabled={isLoading} /></FormControl>
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
                                      <FormControl><Input placeholder="Np. 7-8" {...field} value={field.value ?? ""} disabled={isLoading} /></FormControl>
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
                                    <FormControl><Textarea rows={2} placeholder="Np. skup się na technice, wolna faza negatywna" {...field} value={field.value ?? ""} disabled={isLoading} /></FormControl>
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
                     <p className="text-sm font-medium text-destructive mt-2">
                       {form.formState.errors.exercises.message}
                     </p>
                   )}
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.push('/workout/start')} disabled={isLoading}>
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

    