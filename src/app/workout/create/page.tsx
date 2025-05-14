
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
  Edit3, // For editing exercise parameters
  PlusSquare, // For quick add exercise button
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
import { EditExerciseParametersDialog, type ExerciseParametersFormValues } from "@/components/workout/edit-exercise-parameters-dialog";
import { QuickAddExerciseDialog, type QuickAddExerciseFormData } from "@/components/workout/quick-add-exercise-dialog"; // Updated import

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

// Schema for an individual exercise in the workout form
const exerciseInWorkoutSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nazwa ćwiczenia jest wymagana."),
  sets: z.coerce.number().positive("Liczba serii musi być dodatnia.").optional(),
  reps: z.string().optional(), // e.g., "8-10", "Max", "30s"
  restTimeSeconds: z.coerce.number().positive("Czas odpoczynku musi być dodatni.").optional(),
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
  const [isEditParamsDialogOpen, setIsEditParamsDialogOpen] = React.useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = React.useState<number | null>(null);
  const [isQuickAddExerciseDialogOpen, setIsQuickAddExerciseDialogOpen] = React.useState(false);

  // Manage the master list of exercises in state
  const [masterExerciseList, setMasterExerciseList] = React.useState<SelectableExercise[]>(INITIAL_MOCK_EXERCISES_DATABASE);

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      workoutName: "",
      workoutType: "Mieszany",
      exercises: [],
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
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
        // Initialize with undefined or default parameters
        sets: undefined, 
        reps: undefined,
        restTimeSeconds: undefined,
        targetRpe: undefined,
        exerciseNotes: undefined,
    }));
    append(exercisesToAppend);
    if (form.formState.errors.exercises) {
        form.clearErrors("exercises");
    }
  };

  const handleOpenEditParamsDialog = (index: number) => {
    setEditingExerciseIndex(index);
    setIsEditParamsDialogOpen(true);
  };

  const handleSaveExerciseParameters = (index: number, params: ExerciseParametersFormValues) => {
    const currentExercise = fields[index];
    update(index, {
      ...currentExercise,
      sets: params.sets,
      reps: params.reps,
      restTimeSeconds: params.restTimeSeconds,
      targetRpe: params.targetRpe,
      exerciseNotes: params.exerciseNotes,
    });
    setIsEditParamsDialogOpen(false);
    setEditingExerciseIndex(null);
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
      id: uuidv4(), // Generate a unique ID for the "database"
      name: newExerciseData.name,
      category: newExerciseData.category,
    };

    // Simulate adding to global exercise DB
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
    setIsQuickAddExerciseDialogOpen(false); // Close dialog after adding
  };


  async function onSubmit(values: WorkoutFormValues) {
    setIsLoading(true);
    setServerError(null);
    console.log("Workout data submitted:", values);
    console.log("Current Master Exercise List:", masterExerciseList); // Log updated master list

    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Trening zapisany (Symulacja)!",
      description: (
        <div>
          <p>Trening "{values.workoutName}" został pomyślnie utworzony (symulacja).</p>
        </div>
      ),
      variant: "default",
    });
    router.push("/workout/start"); 

    setIsLoading(false);
  }

  const currentEditingExerciseData = editingExerciseIndex !== null ? fields[editingExerciseIndex] : undefined;

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
                    <ul className="space-y-4">
                      {fields.map((item, index) => (
                        <li key={item.id}> 
                          <Card className="bg-muted/30 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-grow">
                                <span className="font-medium">{item.name}</span>
                                <div className="text-xs text-muted-foreground space-x-2 mt-1">
                                  {item.sets && <span>Serie: {item.sets}</span>}
                                  {item.reps && <span>Powt: {item.reps}</span>}
                                  {item.restTimeSeconds && <span>Odp: {item.restTimeSeconds}s</span>}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditParamsDialog(index)}
                                  disabled={isLoading}
                                  aria-label="Edytuj parametry ćwiczenia"
                                  className="h-8 w-8"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
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
        availableExercises={masterExerciseList} // Use state managed list
        onExercisesSelected={handleExercisesSelected}
      />
      {editingExerciseIndex !== null && currentEditingExerciseData && (
         <EditExerciseParametersDialog
            isOpen={isEditParamsDialogOpen}
            onOpenChange={setIsEditParamsDialogOpen}
            exerciseData={{
                name: currentEditingExerciseData.name,
                sets: currentEditingExerciseData.sets,
                reps: currentEditingExerciseData.reps,
                restTimeSeconds: currentEditingExerciseData.restTimeSeconds,
                targetRpe: currentEditingExerciseData.targetRpe,
                exerciseNotes: currentEditingExerciseData.exerciseNotes,
            }}
            onSave={(params) => handleSaveExerciseParameters(editingExerciseIndex, params)}
         />
      )}
      <QuickAddExerciseDialog
        isOpen={isQuickAddExerciseDialogOpen}
        onOpenChange={setIsQuickAddExerciseDialogOpen}
        onExerciseCreated={handleQuickExerciseCreated}
      />
    </div>
  );
}

    