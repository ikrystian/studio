
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ClipboardEdit,
  ArrowLeft,
  Save,
  Trash2,
  CalendarDays,
  Target,
  PlusCircle,
  Coffee,
  XCircle,
  Edit3,
  Loader2,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { SelectWorkoutDialog, type SelectableWorkout } from "@/components/plans/select-workout-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Mock data for available workouts to select from
const MOCK_AVAILABLE_WORKOUTS: SelectableWorkout[] = [
  { id: "wk1", name: "Poranny Trening Siłowy", type: "Siłowy" },
  { id: "wk2", name: "Szybkie Cardio HIIT", type: "Cardio" },
  { id: "wk3", name: "Wieczorne Rozciąganie", type: "Rozciąganie" },
  { id: "wk4", name: "Trening Brzucha Express", type: "Siłowy" },
  { id: "wk5", name: "Długie Wybieganie", type: "Cardio" },
  { id: "template_full_body_a", name: "Szablon Full Body A", type: "Siłowy"},
  { id: "template_push", name: "Szablon Push", type: "Siłowy"},
  { id: "template_pull", name: "Szablon Pull", type: "Siłowy"},
  { id: "template_legs", name: "Szablon Legs", type: "Siłowy"},
];

const PLAN_GOALS_OPTIONS = [
  "Budowa siły",
  "Redukcja tkanki tłuszczowej",
  "Poprawa kondycji",
  "Utrzymanie formy",
  "Wszechstronny rozwój",
  "Poprawa elastyczności",
  "Inny",
];

const DAYS_OF_WEEK = [
  "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"
];

const planDaySchema = z.object({
  dayName: z.string(),
  assignedWorkoutId: z.string().nullable().default(null),
  assignedWorkoutName: z.string().nullable().default(null),
  isRestDay: z.boolean().default(false),
});

const planFormSchema = z.object({
  planName: z.string().min(1, "Nazwa planu jest wymagana."),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  goal: z.string().optional(),
  days: z.array(planDaySchema).length(7, "Plan musi obejmować 7 dni."),
}).refine(data => {
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    return false;
  }
  return true;
}, {
  message: "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.",
  path: ["endDate"],
});

type PlanFormValues = z.infer<typeof planFormSchema>;

export default function CreateTrainingPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isWorkoutDialogOpeng, setIsWorkoutDialogOpen] = React.useState(false);
  const [currentDayIndexToAssign, setCurrentDayIndexToAssign] = React.useState<number | null>(null);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      planName: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      goal: undefined,
      days: DAYS_OF_WEEK.map(dayName => ({
        dayName,
        assignedWorkoutId: null,
        assignedWorkoutName: null,
        isRestDay: false,
      })),
    },
  });

  const { fields, update } = useFieldArray({
    control: form.control,
    name: "days",
  });

  const handleOpenWorkoutDialog = (dayIndex: number) => {
    setCurrentDayIndexToAssign(dayIndex);
    setIsWorkoutDialogOpen(true);
  };

  const handleWorkoutSelected = (workout: SelectableWorkout) => {
    if (currentDayIndexToAssign !== null) {
      const currentDay = fields[currentDayIndexToAssign];
      update(currentDayIndexToAssign, {
        ...currentDay,
        assignedWorkoutId: workout.id,
        assignedWorkoutName: workout.name,
        isRestDay: false,
      });
    }
    setIsWorkoutDialogOpen(false);
    setCurrentDayIndexToAssign(null);
  };

  const handleMarkAsRestDay = (dayIndex: number) => {
    const currentDay = fields[dayIndex];
    update(dayIndex, {
      ...currentDay,
      assignedWorkoutId: null,
      assignedWorkoutName: null,
      isRestDay: true,
    });
  };

  const handleRemoveAssignment = (dayIndex: number) => {
    const currentDay = fields[dayIndex];
    update(dayIndex, {
      ...currentDay,
      assignedWorkoutId: null,
      assignedWorkoutName: null,
      isRestDay: false,
    });
  };

  async function onSubmit(values: PlanFormValues) {
    setIsLoading(true);
    setServerError(null);
    console.log("Training Plan data submitted:", values);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Example of checking if at least one day has an assignment (either workout or rest)
    const hasAnyAssignment = values.days.some(day => day.assignedWorkoutId || day.isRestDay);
    if (!hasAnyAssignment) {
        form.setError("days", { type: "manual", message: "Plan musi zawierać przynajmniej jeden trening lub dzień odpoczynku."});
        // Or use a general serverError state
        // setServerError("Plan musi zawierać przynajmniej jeden trening lub dzień odpoczynku.");
        setIsLoading(false);
        return;
    }


    toast({
      title: "Plan treningowy zapisany!",
      description: `Plan "${values.planName}" został pomyślnie utworzony.`,
      variant: "default",
    });
    router.push("/plans");
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/plans">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Listy Planów</span>
              </Link>
            </Button>
            <ClipboardEdit className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Stwórz Nowy Plan Treningowy</h1>
          </div>
          <Button form="training-plan-form" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Zapisz Plan
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          <Form {...form}>
            <form id="training-plan-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Podstawowe Informacje o Planie</CardTitle>
                  <CardDescription>Podaj nazwę, opis i inne kluczowe dane dla Twojego planu.</CardDescription>
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
                    name="planName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nazwa Planu</FormLabel>
                        <FormControl>
                          <Input placeholder="Np. Mój Plan Siłowy na Masę" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opis Planu (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Krótki opis celów, metodologii, itp." {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data Rozpoczęcia (opcjonalnie)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={isLoading}
                                >
                                  <CalendarDays className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || isLoading}
                                initialFocus
                                locale={pl}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data Zakończenia (opcjonalnie)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={isLoading || !form.watch("startDate")}
                                >
                                  <CalendarDays className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => 
                                  (form.getValues("startDate") ? date < form.getValues("startDate")! : date < new Date(new Date().setHours(0,0,0,0))) 
                                  || isLoading
                                }
                                initialFocus
                                locale={pl}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cel Planu (opcjonalnie)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <Target className="mr-2 h-4 w-4" />
                              <SelectValue placeholder="Wybierz główny cel planu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PLAN_GOALS_OPTIONS.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Struktura Tygodniowa Planu</CardTitle>
                  <CardDescription>Przypisz treningi do poszczególnych dni tygodnia lub oznacz je jako dni odpoczynku.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((day, index) => (
                    <Card key={day.id} className="p-4 bg-muted/20">
                      <CardTitle className="text-lg mb-2">{day.dayName}</CardTitle>
                      <div className="min-h-[40px] mb-3 p-3 border border-dashed rounded-md bg-background flex items-center justify-center">
                        {day.isRestDay ? (
                          <span className="text-green-600 flex items-center"><Coffee className="mr-2 h-5 w-5"/> Dzień Odpoczynku</span>
                        ) : day.assignedWorkoutName ? (
                          <span className="text-primary font-semibold">{day.assignedWorkoutName}</span>
                        ) : (
                          <span className="text-muted-foreground">Brak przypisanego treningu</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenWorkoutDialog(index)}
                          disabled={isLoading}
                        >
                          {day.assignedWorkoutId ? <Edit3 className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                          {day.assignedWorkoutId ? "Zmień Trening" : "Dodaj Trening"}
                        </Button>
                        {!day.isRestDay && (
                           <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleMarkAsRestDay(index)}
                            disabled={isLoading}
                          >
                            <Coffee className="mr-2 h-4 w-4"/> Oznacz jako Dzień Odpoczynku
                          </Button>
                        )}
                        {(day.assignedWorkoutId || day.isRestDay) && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveAssignment(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="mr-2 h-4 w-4"/> Usuń przypisanie
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                   {form.formState.errors.days && typeof form.formState.errors.days.message === 'string' && (
                     <p className="text-sm font-medium text-destructive mt-2">
                       {form.formState.errors.days.message}
                     </p>
                   )}
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.push('/plans')} disabled={isLoading}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={isLoading}>
                   {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Zapisz Plan
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
      <SelectWorkoutDialog
        isOpen={isWorkoutDialogOpeng}
        onOpenChange={setIsWorkoutDialogOpen}
        availableWorkouts={MOCK_AVAILABLE_WORKOUTS}
        onWorkoutSelected={handleWorkoutSelected}
      />
    </div>
  );
}

    