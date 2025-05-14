
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import {
  Dumbbell,
  ArrowLeft,
  PlusCircle,
  Save,
  Trash2,
  ChevronUp,
  ChevronDown,
  XCircle,
  Loader2
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema for an individual exercise
const exerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nazwa ćwiczenia jest wymagana."),
  // Add more exercise-specific fields here if needed, e.g., sets, reps, duration
  // For simplicity, we'll just use name for now.
});

// Schema for the workout form
const workoutFormSchema = z.object({
  workoutName: z.string().min(1, "Nazwa treningu jest wymagana."),
  workoutType: z.string().optional(), // Making it optional as per discussion, provide defaults or "Inny"
  exercises: z.array(exerciseSchema).min(1, "Trening musi zawierać przynajmniej jedno ćwiczenie."),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;
type Exercise = z.infer<typeof exerciseSchema>;

// Simulated available exercises (replace with actual data fetching or modal selection)
const MOCK_EXERCISES_DATABASE = [
  { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej" },
  { id: "ex2", name: "Przysiady ze sztangą" },
  { id: "ex3", name: "Martwy ciąg" },
  { id: "ex4", name: "Podciąganie na drążku" },
  { id: "ex5", name: "Pompki" },
  { id: "ex6", name: "Bieg na bieżni (30 min)" },
  { id: "ex7", name: "Skakanka (15 min)" },
  { id: "ex8", name: "Rozciąganie dynamiczne" },
];

export default function CreateWorkoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  
  // Counter for mock exercise selection to cycle through MOCK_EXERCISES_DATABASE
  const [mockExerciseCounter, setMockExerciseCounter] = React.useState(0);

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      workoutName: "",
      workoutType: "Mieszany", // Default type
      exercises: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const handleAddExercise = () => {
    // Simulate selecting an exercise. In a real app, this would open a modal or navigate.
    const selectedMockExercise = MOCK_EXERCISES_DATABASE[mockExerciseCounter % MOCK_EXERCISES_DATABASE.length];
    append({
      id: crypto.randomUUID(), // Simulate a unique ID for the added instance of exercise
      name: selectedMockExercise.name,
    });
    setMockExerciseCounter(prev => prev + 1);
    form.clearErrors("exercises"); // Clear "at least one exercise" error if it was shown
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

  async function onSubmit(values: WorkoutFormValues) {
    setIsLoading(true);
    setServerError(null);
    console.log("Workout data submitted:", values);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success
    toast({
      title: "Trening zapisany!",
      description: `Trening "${values.workoutName}" został pomyślnie utworzony.`,
      variant: "default",
    });
    router.push("/workout/start"); // Redirect to workout list or dashboard

    // Simulate error (uncomment to test)
    // setServerError("Wystąpił błąd podczas zapisywania treningu. Spróbuj ponownie.");
    // toast({
    //   title: "Błąd zapisu",
    //   description: "Nie udało się zapisać treningu.",
    //   variant: "destructive",
    // });

    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
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
          <Button form="workout-form" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Zapisz Trening
          </Button>
        </div>
      </header>

      {/* Main Content */}
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
                    <CardDescription>Dodaj ćwiczenia do swojego planu treningowego.</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={handleAddExercise} disabled={isLoading}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Dodaj Ćwiczenie
                  </Button>
                </CardHeader>
                <CardContent>
                  {fields.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      <Dumbbell className="mx-auto mb-2 h-12 w-12" />
                      <p>Brak dodanych ćwiczeń.</p>
                      <p>Kliknij "+ Dodaj Ćwiczenie", aby rozpocząć.</p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {fields.map((item, index) => (
                        <li key={item.id}>
                          <Card className="bg-muted/30 p-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.name}</span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMoveExercise(index, "up")}
                                  disabled={index === 0 || isLoading}
                                  aria-label="Przesuń w górę"
                                >
                                  <ChevronUp className="h-5 w-5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMoveExercise(index, "down")}
                                  disabled={index === fields.length - 1 || isLoading}
                                  aria-label="Przesuń w dół"
                                >
                                  <ChevronDown className="h-5 w-5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveExercise(index)}
                                  className="text-destructive hover:text-destructive"
                                  disabled={isLoading}
                                  aria-label="Usuń ćwiczenie"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                            {/* Future: Add fields for sets, reps, duration here if needed */}
                          </Card>
                        </li>
                      ))}
                    </ul>
                  )}
                   {form.formState.errors.exercises && !form.formState.errors.exercises.root && form.formState.errors.exercises.message && (
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
                <Button type="submit" disabled={isLoading || !form.formState.isValid && form.formState.isSubmitted}>
                   {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Zapisz Trening
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
