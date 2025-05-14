
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
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
  Copy,
  Menu, 
  LayoutDashboard, // For templates
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
import { QuickCreateWorkoutDialog, type QuickCreateWorkoutFormData } from "@/components/plans/quick-create-workout-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";


const INITIAL_MOCK_AVAILABLE_WORKOUTS: SelectableWorkout[] = [
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

const MOCK_DAY_TEMPLATES = [
  { id: "tpl_push", name: "Szablon: Dzień Push (Klatka, Barki, Triceps)" },
  { id: "tpl_pull", name: "Szablon: Dzień Pull (Plecy, Biceps)" },
  { id: "tpl_legs", name: "Szablon: Dzień Nóg" },
  { id: "tpl_full_body", name: "Szablon: Full Body Workout" },
  { id: "tpl_active_rest", name: "Szablon: Odpoczynek Aktywny (np. Joga, Spacer)" },
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
  templateId: z.string().nullable().default(null), // New
  templateName: z.string().nullable().default(null), // New
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
}).refine(data => {
    // Ensure at least one day has some assignment (workout, template, or rest)
    return data.days.some(day => day.assignedWorkoutId || day.templateId || day.isRestDay);
}, {
    message: "Plan musi zawierać przynajmniej jeden przypisany trening, szablon lub dzień odpoczynku.",
    path: ["days"], 
});


type PlanFormValues = z.infer<typeof planFormSchema>;

export default function CreateTrainingPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  
  const [isWorkoutSelectionDialogOpen, setIsWorkoutSelectionDialogOpen] = React.useState(false);
  const [isQuickCreateWorkoutDialogOpen, setIsQuickCreateWorkoutDialogOpen] = React.useState(false);
  const [currentDayIndexToAssign, setCurrentDayIndexToAssign] = React.useState<number | null>(null);

  const [availableWorkouts, setAvailableWorkouts] = React.useState<SelectableWorkout[]>(INITIAL_MOCK_AVAILABLE_WORKOUTS);

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
        templateId: null,
        templateName: null,
        isRestDay: false,
      })),
    },
  });

  const { fields, update } = useFieldArray({
    control: form.control,
    name: "days",
  });

  const handleOpenWorkoutSelectionDialog = (dayIndex: number) => {
    setCurrentDayIndexToAssign(dayIndex);
    setIsWorkoutSelectionDialogOpen(true);
  };

  const handleOpenQuickCreateDialog = (dayIndex: number) => {
    setCurrentDayIndexToAssign(dayIndex);
    setIsQuickCreateWorkoutDialogOpen(true);
  };

  const handleWorkoutSelected = (workout: SelectableWorkout) => {
    if (currentDayIndexToAssign !== null) {
      const currentDay = fields[currentDayIndexToAssign];
      update(currentDayIndexToAssign, {
        ...currentDay,
        assignedWorkoutId: workout.id,
        assignedWorkoutName: workout.name,
        templateId: null,
        templateName: null,
        isRestDay: false,
      });
       form.trigger("days"); // Manually trigger validation for the 'days' array
    }
    setIsWorkoutSelectionDialogOpen(false);
    setCurrentDayIndexToAssign(null);
  };
  
  const handleQuickWorkoutCreated = (newWorkoutData: QuickCreateWorkoutFormData) => {
    const newWorkout: SelectableWorkout = {
      id: uuidv4(),
      name: newWorkoutData.name,
      type: newWorkoutData.workoutType || "Mieszany", 
    };

    setAvailableWorkouts(prev => [...prev, newWorkout]);

    if (currentDayIndexToAssign !== null) {
      const currentDay = fields[currentDayIndexToAssign];
      update(currentDayIndexToAssign, {
        ...currentDay,
        assignedWorkoutId: newWorkout.id,
        assignedWorkoutName: newWorkout.name,
        templateId: null,
        templateName: null,
        isRestDay: false,
      });
       toast({
        title: "Trening Utworzony i Przypisany!",
        description: `Trening "${newWorkout.name}" został utworzony i przypisany do dnia: ${fields[currentDayIndexToAssign].dayName}.`,
      });
       form.trigger("days");
    } else {
       toast({
        title: "Trening Utworzony!",
        description: `Trening "${newWorkout.name}" został utworzony i dodany do listy dostępnych treningów.`,
      });
    }
    setIsQuickCreateWorkoutDialogOpen(false);
    setCurrentDayIndexToAssign(null);
  };

  const handleAssignTemplate = (dayIndex: number, template: { id: string; name: string }) => {
    const currentDay = fields[dayIndex];
    update(dayIndex, {
      ...currentDay,
      templateId: template.id,
      templateName: template.name,
      assignedWorkoutId: null,
      assignedWorkoutName: null,
      isRestDay: false,
    });
    toast({
        title: "Szablon Przypisany",
        description: `Szablon "${template.name}" został przypisany do dnia: ${fields[dayIndex].dayName}.`
    });
    form.trigger("days");
  };


  const handleMarkAsRestDay = (dayIndex: number) => {
    const currentDay = fields[dayIndex];
    update(dayIndex, {
      ...currentDay,
      assignedWorkoutId: null,
      assignedWorkoutName: null,
      templateId: null,
      templateName: null,
      isRestDay: true,
    });
     form.trigger("days");
  };

  const handleRemoveAssignment = (dayIndex: number) => {
    const currentDay = fields[dayIndex];
    update(dayIndex, {
      ...currentDay,
      assignedWorkoutId: null,
      assignedWorkoutName: null,
      templateId: null,
      templateName: null,
      isRestDay: false,
    });
    form.trigger("days");
  };

  async function onSubmit(values: PlanFormValues) {
    setIsLoading(true);
    setServerError(null);
    console.log("Training Plan data submitted:", values);
    console.log("Current available workouts:", availableWorkouts);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // The Zod schema now handles this validation:
    // const hasAnyAssignment = values.days.some(day => day.assignedWorkoutId || day.templateId || day.isRestDay);
    // if (!hasAnyAssignment) {
    //     form.setError("days", { type: "manual", message: "Plan musi zawierać przynajmniej jeden trening, szablon lub dzień odpoczynku."});
    //     setIsLoading(false);
    //     return;
    // }

    toast({
      title: "Plan treningowy zapisany!",
      description: `Plan "${values.planName}" został pomyślnie utworzony (symulacja).`,
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
                                captionLayout="dropdown-buttons" 
                                fromYear={new Date().getFullYear() - 5} 
                                toYear={new Date().getFullYear() + 5}
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
                                captionLayout="dropdown-buttons" 
                                fromYear={new Date().getFullYear() - 5} 
                                toYear={new Date().getFullYear() + 5}
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
                  <CardDescription>Przypisz treningi, szablony dni lub oznacz dni odpoczynku.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((day, index) => (
                    <Card key={day.id} className="p-4 bg-muted/20">
                        <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-lg">{day.dayName}</CardTitle>
                            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary" onClick={() => toast({title: "Funkcja 'Kopiuj dzień' wkrótce!", description: "Możliwość kopiowania konfiguracji dnia będzie dostępna w przyszłości."})}>
                               <Copy className="mr-1 h-3 w-3"/> Kopiuj dzień (Wkrótce)
                            </Button>
                        </div>
                      <div className="min-h-[40px] mb-3 p-3 border border-dashed rounded-md bg-background flex items-center justify-center">
                        {day.templateName ? (
                          <span className="text-purple-600 dark:text-purple-400 flex items-center"><LayoutDashboard className="mr-2 h-5 w-5"/> {day.templateName}</span>
                        ) : day.isRestDay ? (
                          <span className="text-green-600 flex items-center"><Coffee className="mr-2 h-5 w-5"/> Dzień Odpoczynku</span>
                        ) : day.assignedWorkoutName ? (
                          <span className="text-primary font-semibold">{day.assignedWorkoutName}</span>
                        ) : (
                          <span className="text-muted-foreground">Brak przypisanej aktywności</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isLoading}>
                              <Menu className="mr-2 h-4 w-4"/> 
                              {day.assignedWorkoutId || day.templateId || day.isRestDay ? "Zmień Przypisanie" : "Przypisz Aktywność"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleOpenWorkoutSelectionDialog(index)}>
                              <PlusCircle className="mr-2 h-4 w-4"/> Wybierz Istniejący Trening
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <LayoutDashboard className="mr-2 h-4 w-4"/> Przypisz Szablon Dnia
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {MOCK_DAY_TEMPLATES.map(template => (
                                        <DropdownMenuItem key={template.id} onClick={() => handleAssignTemplate(index, template)}>
                                            {template.name}
                                        </DropdownMenuItem>
                                    ))}
                                    {MOCK_DAY_TEMPLATES.length === 0 && <DropdownMenuItem disabled>Brak zdefiniowanych szablonów</DropdownMenuItem>}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem onClick={() => handleOpenQuickCreateDialog(index)}>
                              <Edit3 className="mr-2 h-4 w-4"/> Szybkie Stwórz Nowy Trening
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!day.isRestDay && (
                                <DropdownMenuItem onClick={() => handleMarkAsRestDay(index)}>
                                <Coffee className="mr-2 h-4 w-4"/> Oznacz jako Dzień Odpoczynku
                                </DropdownMenuItem>
                            )}
                             {(day.assignedWorkoutId || day.isRestDay || day.templateId) && (
                                <DropdownMenuItem onClick={() => handleRemoveAssignment(index)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/> Usuń przypisanie
                                </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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

               <Card>
                <CardHeader>
                    <CardTitle>Wizualizacja Kalendarza Planu</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <CalendarDays className="h-4 w-4"/>
                        <AlertTitle>Funkcja w budowie!</AlertTitle>
                        <AlertDescription>
                        Widok kalendarza dla tego planu będzie dostępny tutaj w przyszłości. Pozwoli on na wizualne zarządzanie dniami treningowymi i odpoczynku.
                        </AlertDescription>
                    </Alert>
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
        isOpen={isWorkoutSelectionDialogOpen}
        onOpenChange={setIsWorkoutSelectionDialogOpen}
        availableWorkouts={availableWorkouts}
        onWorkoutSelected={handleWorkoutSelected}
      />
      <QuickCreateWorkoutDialog
        isOpen={isQuickCreateWorkoutDialogOpen}
        onOpenChange={setIsQuickCreateWorkoutDialogOpen}
        onWorkoutCreated={handleQuickWorkoutCreated}
      />
    </div>
  );
}

