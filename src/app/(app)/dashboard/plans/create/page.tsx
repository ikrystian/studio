
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isSameDay, differenceInCalendarDays, isBefore } from "date-fns";
import { pl } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
import dynamic from 'next/dynamic';
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
  LayoutDashboard,
  ClipboardPaste,
  ChevronLeft, 
  ChevronRight, 
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
import type { SelectableWorkout } from "@/components/plans/select-workout-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { QuickCreateWorkoutFormData } from "@/components/plans/quick-create-workout-dialog";
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
import { CreateTrainingPlanPageSkeleton } from "@/components/plans/CreateTrainingPlanPageSkeleton";
// MOCK_AVAILABLE_WORKOUTS_FOR_PLAN_EDITOR and MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR are now imported from centralized mockData
import { MOCK_AVAILABLE_WORKOUTS_FOR_PLAN_EDITOR, MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR } from "@/lib/mockData";

// Lazy load dialogs
const SelectWorkoutDialog = dynamic(() =>
  import("@/components/plans/select-workout-dialog").then((mod) => mod.SelectWorkoutDialog), {
  loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});

const QuickCreateWorkoutDialog = dynamic(() =>
  import("@/components/plans/quick-create-workout-dialog").then((mod) => mod.QuickCreateWorkoutDialog), {
  loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});


// Interface for RichDayTemplate is now implicitly available via MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR.
export interface RichDayTemplate {
  id: string;
  name: string;
  assignedWorkoutId?: string | null;
  assignedWorkoutName?: string | null;
  isRestDay?: boolean;
}

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

// Zod schema for a single day in the plan's weekly schedule.
const planDaySchema = z.object({
  dayName: z.string(),
  assignedWorkoutId: z.string().nullable().default(null),
  assignedWorkoutName: z.string().nullable().default(null),
  templateId: z.string().nullable().default(null), // Store ID of the template
  templateName: z.string().nullable().default(null), // Store name of the template for display
  isRestDay: z.boolean().default(false),
});
export type PlanDayFormValues = z.infer<typeof planDaySchema>;


// Zod schema for the entire training plan form.
const planFormSchema = z.object({
  planName: z.string().min(1, "Nazwa planu jest wymagana."),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  goal: z.string().optional(),
  days: z.array(planDaySchema).length(7, "Plan musi obejmować 7 dni."),
}).refine(data => { // Custom validation for end date vs start date
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    return false;
  }
  return true;
}, {
  message: "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.",
  path: ["endDate"], // Path to the field causing the error
}).refine(data => { // Custom validation ensuring at least one day has an assignment
    return data.days.some(day => day.assignedWorkoutId || day.templateId || day.isRestDay);
}, {
    message: "Plan musi zawierać przynajmniej jeden przypisany trening, szablon lub dzień odpoczynku.",
    path: ["days"], 
});


type PlanFormValues = z.infer<typeof planFormSchema>;

export default function CreateTrainingPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pageIsLoading, setPageIsLoading] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false); // For form submission
  const [serverError, setServerError] = React.useState<string | null>(null);

  // State for dialogs and managing workout assignment
  const [isWorkoutSelectionDialogOpen, setIsWorkoutSelectionDialogOpen] = React.useState(false);
  const [isQuickCreateWorkoutDialogOpen, setIsQuickCreateWorkoutDialogOpen] = React.useState(false);
  const [currentDayIndexToAssign, setCurrentDayIndexToAssign] = React.useState<number | null>(null);

  // Simulates a global list of available workouts, including those quickly created.
  const [availableWorkouts, setAvailableWorkouts] = React.useState<SelectableWorkout[]>(MOCK_AVAILABLE_WORKOUTS_FOR_PLAN_EDITOR);

  // State for copy/paste functionality
  const [copiedDayConfig, setCopiedDayConfig] = React.useState<Omit<PlanDayFormValues, 'dayName'> | null>(null);
  const [isPastingModeActive, setIsPastingModeActive] = React.useState(false);
  
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

  // Simulate page loading for skeleton visibility
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPageIsLoading(false);
    }, 750); 
    return () => clearTimeout(timer);
  }, []);
  
  // Watch for start date changes to update the calendar view month
  const watchedStartDate = form.watch("startDate");
  const [calendarViewMonth, setCalendarViewMonth] = React.useState(watchedStartDate || new Date());

  React.useEffect(() => {
    if (watchedStartDate && !isSameMonth(watchedStartDate, calendarViewMonth)) {
      setCalendarViewMonth(startOfMonth(watchedStartDate));
    } else if (!watchedStartDate && !isSameMonth(new Date(), calendarViewMonth)) {
        // If startDate is cleared or not set, default calendar to current month
        setCalendarViewMonth(startOfMonth(new Date()));
    }
  }, [watchedStartDate, calendarViewMonth]);


  // useFieldArray for managing the dynamic list of days in the form
  const { fields, update } = useFieldArray({
    control: form.control,
    name: "days",
  });

  // Opens the dialog to select an existing workout for a specific day.
  const handleOpenWorkoutSelectionDialog = (dayIndex: number) => {
    setCurrentDayIndexToAssign(dayIndex);
    setIsWorkoutSelectionDialogOpen(true);
  };

  // Opens the dialog for quickly creating a new workout to assign to a day.
  const handleOpenQuickCreateDialog = (dayIndex: number) => {
    setCurrentDayIndexToAssign(dayIndex);
    setIsQuickCreateWorkoutDialogOpen(true);
  };

  // Callback when a workout is selected from the dialog.
  // Updates the form state for the specified day.
  const handleWorkoutSelected = (workout: SelectableWorkout) => {
    if (currentDayIndexToAssign !== null) {
      const currentDay = fields[currentDayIndexToAssign];
      update(currentDayIndexToAssign, {
        ...currentDay,
        assignedWorkoutId: workout.id,
        assignedWorkoutName: workout.name,
        templateId: null, // Clear template if workout is directly assigned
        templateName: null,
        isRestDay: false, // Not a rest day if a workout is assigned
      });
      form.trigger("days"); // Trigger validation for the 'days' array
    }
    setIsWorkoutSelectionDialogOpen(false);
    setCurrentDayIndexToAssign(null);
  };

  // Callback when a new workout is created via the quick add dialog.
  // Simulates adding to a global DB and updates the form.
  const handleQuickWorkoutCreated = (newWorkoutData: QuickCreateWorkoutFormData) => {
     // Simulate creating a new workout object
     const newWorkout: SelectableWorkout = {
      id: uuidv4(), // Assign a new unique ID
      name: newWorkoutData.name,
      type: newWorkoutData.workoutType || "Mieszany", // Default type if not specified
    };
    // Simulate adding to a master list of workouts (would be an API call)
    setAvailableWorkouts(prev => [...prev, newWorkout]);

    if (currentDayIndexToAssign !== null) {
      // Assign the newly created workout to the selected day
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
       // This case might happen if Quick Add is accessed globally, not for a specific day.
       toast({
        title: "Trening Utworzony!",
        description: `Trening "${newWorkout.name}" został utworzony i dodany do listy dostępnych treningów.`,
      });
    }
    setIsQuickCreateWorkoutDialogOpen(false);
    setCurrentDayIndexToAssign(null);
  };

  // Assigns a pre-defined day template to a specific day in the plan.
  const handleAssignTemplate = (dayIndex: number, template: RichDayTemplate) => {
    const currentDay = fields[dayIndex];
    update(dayIndex, {
      ...currentDay,
      templateId: template.id,
      templateName: template.name,
      assignedWorkoutId: template.assignedWorkoutId || null, // Use workout from template if any
      assignedWorkoutName: template.assignedWorkoutName || null,
      isRestDay: template.isRestDay || false, // Mark as rest day if template specifies
    });
    toast({
        title: "Szablon Przypisany",
        description: `Szablon "${template.name}" został przypisany do dnia: ${fields[dayIndex].dayName}.`
    });
    form.trigger("days"); 
  };


  // Marks a specific day as a rest day.
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

  // Clears any assignment (workout, template, rest day) from a specific day.
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

  // Copies the configuration of a source day (excluding its name).
  const handleCopyDay = (sourceDayIndex: number) => {
    const dayToCopy = { ...form.getValues(`days.${sourceDayIndex}`) };
    const { dayName, ...configToCopy } = dayToCopy; // Exclude dayName, as it's fixed
    setCopiedDayConfig(configToCopy as Omit<PlanDayFormValues, 'dayName'>);
    setIsPastingModeActive(true);
    toast({
      title: "Dzień Skopiowany",
      description: `Konfiguracja dnia "${dayName}" została skopiowana. Wybierz dzień docelowy, aby wkleić.`,
    });
  };

  // Pastes the copied day configuration to a target day.
  const handlePasteDay = (targetDayIndex: number) => {
    if (copiedDayConfig) {
      const targetDayName = form.getValues(`days.${targetDayIndex}.dayName`); // Preserve target day's name
      const newDayData = { ...copiedDayConfig, dayName: targetDayName } as PlanDayFormValues;
      update(targetDayIndex, newDayData);
      setCopiedDayConfig(null); // Clear clipboard
      setIsPastingModeActive(false); // Exit pasting mode
      toast({
        title: "Konfiguracja Wklejona",
        description: `Skopiowana konfiguracja została wklejona do dnia "${targetDayName}".`,
      });
      form.trigger("days"); 
    }
  };

  // Cancels the pasting mode.
  const handleCancelPasting = () => {
    setCopiedDayConfig(null);
    setIsPastingModeActive(false);
    toast({
      title: "Anulowano Wklejanie",
      description: "Operacja wklejania konfiguracji dnia została anulowana.",
    });
  };


  // Simulates submitting the plan data to a backend.
  async function onSubmit(values: PlanFormValues) {
    setIsLoading(true);
    setServerError(null);
    console.log("Training Plan data submitted (simulated save):", values);
    // In a real application, an API call would be made here.
    // The `availableWorkouts` state simulates a DB that might have been updated by Quick Add.
    console.log("Current available workouts (after potential quick adds):", availableWorkouts);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, this would be where you handle the response from your API.
    // For this prototype, we assume success.
    toast({
      title: "Plan treningowy zapisany!",
      description: `Plan "${values.planName}" został pomyślnie utworzony (symulacja).`,
      variant: "default",
    });
    router.push("/dashboard/plans"); // Redirect to plans list after "successful" save
    setIsLoading(false);
  }
  
  // Calendar visualization data
  const firstDayCurrentMonth = startOfMonth(calendarViewMonth);
  const lastDayCurrentMonth = endOfMonth(calendarViewMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayCurrentMonth, end: lastDayCurrentMonth });

  let startingDayOfWeek = getDay(firstDayCurrentMonth); // Sunday is 0, adjust for Monday start
  if (startingDayOfWeek === 0) startingDayOfWeek = 7; // Sunday becomes 7th day (if Monday is 1st)
  const daysBeforeMonth = Array.from({ length: startingDayOfWeek - 1 });

  // Function to get the assignment for a specific date in the calendar view.
  const getDayAssignment = (date: Date) => {
    const planStartDate = form.watch("startDate");
    if (!planStartDate || isBefore(date, startOfDay(planStartDate))) {
      return null; // No assignment before plan start date
    }
    const diff = differenceInCalendarDays(date, startOfDay(planStartDate));
    const dayIndexInCycle = diff % 7; // Determine which day of the 7-day cycle it is
    return form.watch(`days.${dayIndexInCycle}`);
  };

  if (pageIsLoading) {
    return <CreateTrainingPlanPageSkeleton />;
  }


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-end mb-4">
            {isPastingModeActive ? (
                <Button variant="destructive" onClick={handleCancelPasting} size="sm">
                <XCircle className="mr-2 h-4 w-4" /> Anuluj Wklejanie
                </Button>
            ) : (
                <Button form="training-plan-form" type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                Zapisz Plan
                </Button>
            )}
          </div>
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
                                onSelect={(date) => {
                                    field.onChange(date);
                                    if(date) setCalendarViewMonth(startOfMonth(date)); // Update calendar view on date change
                                }}
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
                  <CardDescription>
                    {isPastingModeActive
                      ? "Wybierz dzień, do którego chcesz wkleić skopiowaną konfigurację."
                      : "Przypisz treningi, szablony dni lub oznacz dni odpoczynku."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((day, index) => (
                    <Card key={day.id} className="p-4 bg-muted/20">
                        <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-lg">{day.dayName}</CardTitle>
                            {!isPastingModeActive && (
                              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary" onClick={() => handleCopyDay(index)} disabled={isLoading}>
                                 <Copy className="mr-1 h-3 w-3"/> Kopiuj ten dzień
                              </Button>
                            )}
                        </div>
                      {/* Display area for assigned workout/template/rest day */}
                      <div className="min-h-[40px] mb-3 p-3 border border-dashed rounded-md bg-background flex items-center justify-center">
                        {day.templateName ? (
                            <span className="text-purple-600 dark:text-purple-400 flex items-center">
                                <LayoutDashboard className="mr-2 h-5 w-5"/> {day.templateName}
                                {/* Show if manually assigned workout overrides template's workout */}
                                {day.assignedWorkoutName && day.assignedWorkoutId !== MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR.find(t => t.id === day.templateId)?.assignedWorkoutId && 
                                 <span className="text-xs text-muted-foreground ml-1">(zastąpiony: {day.assignedWorkoutName})</span>}
                            </span>
                        ) : day.isRestDay ? (
                          <span className="text-green-600 flex items-center"><Coffee className="mr-2 h-5 w-5"/> Dzień Odpoczynku</span>
                        ) : day.assignedWorkoutName ? (
                          <span className="text-primary font-semibold">{day.assignedWorkoutName}</span>
                        ) : (
                          <span className="text-muted-foreground">Brak przypisanej aktywności</span>
                        )}
                      </div>
                      {/* Action buttons for the day */}
                      <div className="flex flex-wrap gap-2">
                        {isPastingModeActive ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePasteDay(index)}
                            disabled={isLoading}
                          >
                            <ClipboardPaste className="mr-2 h-4 w-4" /> Wklej konfigurację tutaj
                          </Button>
                        ) : (
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
                              <DropdownMenuItem onClick={() => handleOpenQuickCreateDialog(index)}>
                                <Edit3 className="mr-2 h-4 w-4"/> Szybkie Stwórz Nowy Trening
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                      <LayoutDashboard className="mr-2 h-4 w-4"/> Przypisz Szablon Dnia
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                      {MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR.map(template => (
                                          <DropdownMenuItem key={template.id} onClick={() => handleAssignTemplate(index, template)}>
                                              {template.name}
                                          </DropdownMenuItem>
                                      ))}
                                      {MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR.length === 0 && <DropdownMenuItem disabled>Brak zdefiniowanych szablonów</DropdownMenuItem>}
                                  </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              {!day.isRestDay && (
                                  <DropdownMenuItem onClick={() => handleMarkAsRestDay(index)}>
                                  <Coffee className="mr-2 h-4 w-4"/> Oznacz jako Dzień Odpoczynku
                                  </DropdownMenuItem>
                              )}
                               {(day.assignedWorkoutId || day.isRestDay || day.templateId) && ( // Show remove only if something is assigned
                                  <DropdownMenuItem onClick={() => handleRemoveAssignment(index)} className="text-destructive focus:text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4"/> Usuń przypisanie
                                  </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </Card>
                  ))}
                   {/* Display array-level validation error for 'days' */}
                   {form.formState.errors.days && typeof form.formState.errors.days.message === 'string' && (
                     <p className="text-sm font-medium text-destructive mt-2">
                       {form.formState.errors.days.message}
                     </p>
                   )}
                </CardContent>
              </Card>

              {/* Calendar Visualization Card */}
               <Card>
                <CardHeader>
                    <CardTitle>Wizualizacja Kalendarza Planu</CardTitle>
                     <CardDescription>
                        {form.watch("startDate") ? "Zobacz, jak Twój 7-dniowy cykl przekłada się na kalendarz." : "Wybierz datę rozpoczęcia planu, aby zobaczyć wizualizację w kalendarzu."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {form.watch("startDate") ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <Button variant="outline" size="icon" onClick={() => setCalendarViewMonth(subMonths(calendarViewMonth, 1))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <h3 className="text-lg font-semibold">
                                    {format(calendarViewMonth, "LLLL yyyy", { locale: pl })}
                                </h3>
                                <Button variant="outline" size="icon" onClick={() => setCalendarViewMonth(addMonths(calendarViewMonth, 1))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-7 gap-px border-l border-t bg-border">
                                {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map(dayLabel => (
                                    <div key={dayLabel} className="py-2 text-center text-xs font-medium text-muted-foreground bg-card border-b border-r">{dayLabel}</div>
                                ))}
                                {daysBeforeMonth.map((_, i) => (
                                     <div key={`empty-start-${i}`} className="bg-muted/30 border-b border-r min-h-[80px]"></div>
                                ))}
                                {daysInMonth.map(day => {
                                    const assignment = getDayAssignment(day);
                                    const isDayBeforeStartDate = isBefore(day, startOfDay(form.watch("startDate")!));
                                    let content = null;
                                    let bgColor = "bg-card hover:bg-muted/50";
                                    let textColor = "text-foreground";

                                    if (assignment && !isDayBeforeStartDate) {
                                        if (assignment.isRestDay) {
                                            content = <><Coffee size={14} className="mr-1 inline-block"/> Odpoczynek</>;
                                            bgColor = "bg-green-500/10 hover:bg-green-500/20";
                                            textColor = "text-green-700 dark:text-green-400";
                                        } else if (assignment.templateName) { 
                                            content = <><LayoutDashboard size={14} className="mr-1 inline-block"/> {assignment.templateName}</>;
                                            bgColor = "bg-purple-500/10 hover:bg-purple-500/20";
                                            textColor = "text-purple-700 dark:text-purple-400";
                                        } else if (assignment.assignedWorkoutName) {
                                            content = assignment.assignedWorkoutName;
                                            bgColor = "bg-primary/10 hover:bg-primary/20";
                                            textColor = "text-primary";
                                        }
                                    }
                                    
                                    return (
                                        <div 
                                            key={day.toString()} 
                                            className={cn(
                                                "p-2 border-b border-r min-h-[80px] text-xs relative transition-colors",
                                                isSameMonth(day, calendarViewMonth) ? bgColor : "bg-muted/30",
                                                // Apply opacity if day is before start date but in current month view
                                                isDayBeforeStartDate && isSameMonth(day, calendarViewMonth) ? "opacity-60 bg-muted/50" : "",
                                                // Dim text for days not in current month view
                                                !isSameMonth(day, calendarViewMonth) ? "text-muted-foreground/50" : textColor
                                            )}
                                        >
                                            <span className={cn("font-medium", isSameDay(day, new Date()) && "text-primary font-bold underline")}>
                                                {format(day, "d")}
                                            </span>
                                            {content && <div className="mt-1 text-xs break-words">{content}</div>}
                                        </div>
                                    );
                                })}
                                {Array.from({ length: (7 - (daysBeforeMonth.length + daysInMonth.length) % 7) % 7 }).map((_, i) => (
                                   <div key={`empty-end-${i}`} className="bg-muted/30 border-b border-r min-h-[80px]"></div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <Alert>
                            <CalendarDays className="h-4 w-4"/>
                            <AlertTitle>Wizualizacja Niedostępna</AlertTitle>
                            <AlertDescription>
                                Aby zobaczyć wizualizację planu w kalendarzu, wybierz najpierw "Datę Rozpoczęcia Planu" w sekcji powyżej.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
               </Card>

              <div className="flex justify-end space-x-4">
                 {!isPastingModeActive && (
                    <Button type="button" variant="outline" onClick={() => router.push('/dashboard/plans')} disabled={isLoading}>
                    Anuluj
                    </Button>
                 )}
                {!isPastingModeActive && (
                    <Button type="submit" disabled={isLoading || (form.formState.isSubmitted && !form.formState.isValid)}>
                   {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Zapisz Plan
                    </Button>
                )}
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
