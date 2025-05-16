
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isSameDay, differenceInCalendarDays, isBefore, startOfDay } from "date-fns";
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
import { MOCK_DETAILED_TRAINING_PLANS, MOCK_AVAILABLE_WORKOUTS_FOR_PLAN_EDITOR, MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR, type DetailedTrainingPlan, type PlanDayDetail } from "@/lib/mockData";
import { EditTrainingPlanPageSkeleton } from "@/components/plans/EditTrainingPlanPageSkeleton";

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

const planDaySchema = z.object({
  dayName: z.string(),
  assignedWorkoutId: z.string().nullable().default(null),
  assignedWorkoutName: z.string().nullable().default(null),
  templateId: z.string().nullable().default(null),
  templateName: z.string().nullable().default(null),
  isRestDay: z.boolean().default(false),
});
export type PlanDayFormValues = z.infer<typeof planDaySchema>;

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
    return data.days.some(day => day.assignedWorkoutId || day.templateId || day.isRestDay);
}, {
    message: "Plan musi zawierać przynajmniej jeden przypisany trening, szablon lub dzień odpoczynku.",
    path: ["days"], 
});

type PlanFormValues = z.infer<typeof planFormSchema>;

export default function EditTrainingPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.planId as string;
  const { toast } = useToast();

  const [pageIsLoading, setPageIsLoading] = React.useState(true);
  const [formIsLoading, setFormIsLoading] = React.useState(false); // For form submission
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [initialPlanData, setInitialPlanData] = React.useState<DetailedTrainingPlan | null>(null);

  const [isWorkoutSelectionDialogOpen, setIsWorkoutSelectionDialogOpen] = React.useState(false);
  const [isQuickCreateWorkoutDialogOpen, setIsQuickCreateWorkoutDialogOpen] = React.useState(false);
  const [currentDayIndexToAssign, setCurrentDayIndexToAssign] = React.useState<number | null>(null);

  const [availableWorkouts, setAvailableWorkouts] = React.useState<SelectableWorkout[]>(MOCK_AVAILABLE_WORKOUTS_FOR_PLAN_EDITOR);

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
  
  React.useEffect(() => {
    setPageIsLoading(true);
    // Simulate fetching plan data
    const timer = setTimeout(() => {
      const planData = MOCK_DETAILED_TRAINING_PLANS.find(p => p.id === planId);
      if (planData) {
        setInitialPlanData(planData);
        form.reset({
          planName: planData.name,
          description: planData.description || "",
          startDate: planData.startDate ? parseISO(planData.startDate) : undefined,
          endDate: planData.endDate ? parseISO(planData.endDate) : undefined,
          goal: planData.goal || undefined,
          days: planData.schedule.map(day => ({
            dayName: day.dayName,
            assignedWorkoutId: day.assignedWorkoutId || null,
            assignedWorkoutName: day.assignedWorkoutName || null,
            templateId: day.templateId || null,
            templateName: day.templateName || null,
            isRestDay: day.isRestDay || false,
          })),
        });
         if (planData.startDate) {
          setCalendarViewMonth(startOfMonth(parseISO(planData.startDate)));
        }
      } else {
        toast({ title: "Błąd", description: `Nie znaleziono planu o ID: ${planId}.`, variant: "destructive" });
        router.push("/dashboard/plans");
      }
      setPageIsLoading(false);
    }, 1000); // Simulate network delay
    return () => clearTimeout(timer);
  }, [planId, router, toast, form]);

  const watchedStartDate = form.watch("startDate");
  const [calendarViewMonth, setCalendarViewMonth] = React.useState(watchedStartDate || new Date());

  React.useEffect(() => {
    if (watchedStartDate && !isSameMonth(watchedStartDate, calendarViewMonth)) {
      setCalendarViewMonth(startOfMonth(watchedStartDate));
    } else if (!watchedStartDate && !isSameMonth(new Date(), calendarViewMonth)) {
        setCalendarViewMonth(startOfMonth(new Date()));
    }
  }, [watchedStartDate, calendarViewMonth]);

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
      form.trigger("days");
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

  const handleAssignTemplate = (dayIndex: number, template: RichDayTemplate) => {
    const currentDay = fields[dayIndex];
    update(dayIndex, {
      ...currentDay,
      templateId: template.id,
      templateName: template.name,
      assignedWorkoutId: template.assignedWorkoutId || null,
      assignedWorkoutName: template.assignedWorkoutName || null,
      isRestDay: template.isRestDay || false,
    });
    toast({
        title: "Szablon Przypisany",
        description: `Szablon "${template.name}" został przypisany do dnia: ${fields[dayIndex].dayName}.`
    });
    form.trigger("days");
  };

  const handleMarkAsRestDay = (dayIndex: number) => {
    const currentDay = fields[dayIndex];
    update(dayIndex, { ...currentDay, assignedWorkoutId: null, assignedWorkoutName: null, templateId: null, templateName: null, isRestDay: true });
    form.trigger("days");
  };

  const handleRemoveAssignment = (dayIndex: number) => {
    const currentDay = fields[dayIndex];
    update(dayIndex, { ...currentDay, assignedWorkoutId: null, assignedWorkoutName: null, templateId: null, templateName: null, isRestDay: false });
    form.trigger("days");
  };

  const handleCopyDay = (sourceDayIndex: number) => {
    const dayToCopy = { ...form.getValues(`days.${sourceDayIndex}`) };
    const { dayName, ...configToCopy } = dayToCopy; 
    setCopiedDayConfig(configToCopy as Omit<PlanDayFormValues, 'dayName'>);
    setIsPastingModeActive(true);
    toast({ title: "Dzień Skopiowany", description: `Konfiguracja dnia "${dayName}" skopiowana. Wybierz dzień docelowy.` });
  };

  const handlePasteDay = (targetDayIndex: number) => {
    if (copiedDayConfig) {
      const targetDayName = form.getValues(`days.${targetDayIndex}.dayName`);
      const newDayData = { ...copiedDayConfig, dayName: targetDayName } as PlanDayFormValues;
      update(targetDayIndex, newDayData);
      setCopiedDayConfig(null);
      setIsPastingModeActive(false);
      toast({ title: "Konfiguracja Wklejona", description: `Wklejono do dnia "${targetDayName}".` });
      form.trigger("days");
    }
  };

  const handleCancelPasting = () => {
    setCopiedDayConfig(null);
    setIsPastingModeActive(false);
    toast({ title: "Anulowano Wklejanie" });
  };

  async function onSubmit(values: PlanFormValues) {
    setFormIsLoading(true);
    setServerError(null);
    console.log("Updating Training Plan data:", values);
    console.log("Current available workouts:", availableWorkouts);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate updating in MOCK_DETAILED_TRAINING_PLANS
    const planIndex = MOCK_DETAILED_TRAINING_PLANS.findIndex(p => p.id === planId);
    if (planIndex > -1) {
        MOCK_DETAILED_TRAINING_PLANS[planIndex] = {
            ...MOCK_DETAILED_TRAINING_PLANS[planIndex],
            name: values.planName,
            description: values.description || "",
            startDate: values.startDate?.toISOString(),
            endDate: values.endDate?.toISOString(),
            goal: values.goal || "",
            schedule: values.days.map(day => ({
                dayName: day.dayName,
                assignedWorkoutId: day.assignedWorkoutId || undefined,
                assignedWorkoutName: day.assignedWorkoutName || undefined,
                templateId: day.templateId || undefined,
                templateName: day.templateName || undefined,
                isRestDay: day.isRestDay,
            })),
        };
    }

    toast({
      title: "Plan treningowy zaktualizowany!",
      description: `Plan "${values.planName}" został pomyślnie zaktualizowany (symulacja).`,
    });
    router.push(`/dashboard/plans/${planId}`);
    setFormIsLoading(false);
  }

  const firstDayCurrentMonth = startOfMonth(calendarViewMonth);
  const lastDayCurrentMonth = endOfMonth(calendarViewMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayCurrentMonth, end: lastDayCurrentMonth });

  let startingDayOfWeek = getDay(firstDayCurrentMonth); 
  if (startingDayOfWeek === 0) startingDayOfWeek = 7; 
  const daysBeforeMonth = Array.from({ length: startingDayOfWeek - 1 });

  const getDayAssignment = (date: Date) => {
    const planStartDate = form.watch("startDate");
    if (!planStartDate || isBefore(date, startOfDay(planStartDate))) {
      return null;
    }
    const diff = differenceInCalendarDays(date, startOfDay(planStartDate));
    const dayIndexInCycle = diff % 7;
    return form.watch(`days.${dayIndexInCycle}`);
  };

  if (pageIsLoading) {
    return <EditTrainingPlanPageSkeleton />;
  }
  
  if (!initialPlanData) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <Alert variant="destructive" className="max-w-lg">
                <XCircle className="h-5 w-5" />
                <AlertTitle>Błąd Ładowania Planu</AlertTitle>
                <AlertDescription>
                    Nie udało się załadować danych planu. Sprawdź, czy ID planu jest poprawne lub spróbuj ponownie.
                    <Button asChild variant="link" className="mt-2 block">
                        <Link href="/dashboard/plans">Wróć do Listy Planów</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
           <div className="flex justify-between items-center mb-4">
             <Button variant="outline" size="icon" asChild onClick={() => router.back()}>
                 <Link href={`/dashboard/plans/${planId}`}>
                     <ArrowLeft className="h-5 w-5" />
                     <span className="sr-only">Powrót do Szczegółów Planu</span>
                 </Link>
             </Button>
            {isPastingModeActive ? (
                <Button variant="destructive" onClick={handleCancelPasting} size="sm">
                <XCircle className="mr-2 h-4 w-4" /> Anuluj Wklejanie
                </Button>
            ) : (
                <Button form="edit-training-plan-form" type="submit" disabled={formIsLoading}>
                {formIsLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                Zapisz Zmiany
                </Button>
            )}
          </div>
          <Form {...form}>
            <form id="edit-training-plan-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Edit3 className="h-6 w-6 text-primary"/>Edytuj Plan Treningowy</CardTitle>
                  <CardDescription>Zmodyfikuj nazwę, opis i inne kluczowe dane dla swojego planu.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {serverError && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Błąd</AlertTitle>
                      <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                  )}
                   <FormField control={form.control} name="planName" render={({ field }) => (<FormItem><FormLabel>Nazwa Planu</FormLabel><FormControl><Input placeholder="Np. Mój Plan Siłowy na Masę" {...field} disabled={formIsLoading} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Opis Planu (opcjonalnie)</FormLabel><FormControl><Textarea placeholder="Krótki opis celów, metodologii, itp." {...field} disabled={formIsLoading} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                     <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Data Rozpoczęcia (opcjonalnie)</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")} disabled={formIsLoading}><CalendarDays className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={(date) => {field.onChange(date); if(date) setCalendarViewMonth(startOfMonth(date));}} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || formIsLoading} initialFocus locale={pl} captionLayout="dropdown-buttons" fromYear={new Date().getFullYear() - 5} toYear={new Date().getFullYear() + 5}/></PopoverContent></Popover><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Data Zakończenia (opcjonalnie)</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")} disabled={formIsLoading || !form.watch("startDate")}><CalendarDays className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => (form.getValues("startDate") ? date < form.getValues("startDate")! : date < new Date(new Date().setHours(0,0,0,0))) || formIsLoading} initialFocus locale={pl} captionLayout="dropdown-buttons" fromYear={new Date().getFullYear() - 5} toYear={new Date().getFullYear() + 5}/></PopoverContent></Popover><FormMessage /></FormItem>)} />
                  </div>
                   <FormField control={form.control} name="goal" render={({ field }) => (<FormItem><FormLabel>Cel Planu (opcjonalnie)</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={formIsLoading}><FormControl><SelectTrigger><Target className="mr-2 h-4 w-4" /><SelectValue placeholder="Wybierz główny cel planu" /></SelectTrigger></FormControl><SelectContent>{PLAN_GOALS_OPTIONS.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Struktura Tygodniowa Planu</CardTitle><CardDescription>{isPastingModeActive ? "Wybierz dzień, do którego chcesz wkleić skopiowaną konfigurację." : "Przypisz treningi, szablony dni lub oznacz dni odpoczynku."}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((day, index) => (
                    <Card key={day.id} className="p-4 bg-muted/20">
                        <div className="flex justify-between items-start mb-2"><CardTitle className="text-lg">{day.dayName}</CardTitle>{!isPastingModeActive && (<Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary" onClick={() => handleCopyDay(index)} disabled={formIsLoading}><Copy className="mr-1 h-3 w-3"/> Kopiuj ten dzień</Button>)}</div>
                      <div className="min-h-[40px] mb-3 p-3 border border-dashed rounded-md bg-background flex items-center justify-center">{day.templateName ? (<span className="text-purple-600 dark:text-purple-400 flex items-center"><LayoutDashboard className="mr-2 h-5 w-5"/> {day.templateName}{day.assignedWorkoutName && day.assignedWorkoutId !== MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR.find(t => t.id === day.templateId)?.assignedWorkoutId && <span className="text-xs text-muted-foreground ml-1">(zastąpiony: {day.assignedWorkoutName})</span>}</span>) : day.isRestDay ? (<span className="text-green-600 flex items-center"><Coffee className="mr-2 h-5 w-5"/> Dzień Odpoczynku</span>) : day.assignedWorkoutName ? (<span className="text-primary font-semibold">{day.assignedWorkoutName}</span>) : (<span className="text-muted-foreground">Brak przypisanej aktywności</span>)}</div>
                      <div className="flex flex-wrap gap-2">{isPastingModeActive ? (<Button variant="default" size="sm" onClick={() => handlePasteDay(index)} disabled={formIsLoading}><ClipboardPaste className="mr-2 h-4 w-4" /> Wklej konfigurację tutaj</Button>) : (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" disabled={formIsLoading}><Menu className="mr-2 h-4 w-4"/>{day.assignedWorkoutId || day.templateId || day.isRestDay ? "Zmień Przypisanie" : "Przypisz Aktywność"}</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => handleOpenWorkoutSelectionDialog(index)}><PlusCircle className="mr-2 h-4 w-4"/> Wybierz Istniejący Trening</DropdownMenuItem><DropdownMenuItem onClick={() => handleOpenQuickCreateDialog(index)}><Edit3 className="mr-2 h-4 w-4"/> Szybkie Stwórz Nowy Trening</DropdownMenuItem><DropdownMenuSub><DropdownMenuSubTrigger><LayoutDashboard className="mr-2 h-4 w-4"/> Przypisz Szablon Dnia</DropdownMenuSubTrigger><DropdownMenuSubContent>{MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR.map(template => (<DropdownMenuItem key={template.id} onClick={() => handleAssignTemplate(index, template)}>{template.name}</DropdownMenuItem>))}{MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR.length === 0 && <DropdownMenuItem disabled>Brak zdefiniowanych szablonów</DropdownMenuItem>}</DropdownMenuSubContent></DropdownMenuSub><DropdownMenuSeparator />{!day.isRestDay && (<DropdownMenuItem onClick={() => handleMarkAsRestDay(index)}><Coffee className="mr-2 h-4 w-4"/> Oznacz jako Dzień Odpoczynku</DropdownMenuItem>)}{(day.assignedWorkoutId || day.isRestDay || day.templateId) && (<DropdownMenuItem onClick={() => handleRemoveAssignment(index)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Usuń przypisanie</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>)}</div>
                    </Card>
                  ))}
                   {form.formState.errors.days && typeof form.formState.errors.days.message === 'string' && (<p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.days.message}</p>)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Wizualizacja Kalendarza Planu</CardTitle><CardDescription>{form.watch("startDate") ? "Zobacz, jak Twój 7-dniowy cykl przekłada się na kalendarz." : "Wybierz datę rozpoczęcia planu, aby zobaczyć wizualizację w kalendarzu."}</CardDescription></CardHeader>
                <CardContent>{form.watch("startDate") ? (<><div className="flex items-center justify-between mb-4"><Button variant="outline" size="icon" onClick={() => setCalendarViewMonth(subMonths(calendarViewMonth, 1))}><ChevronLeft className="h-4 w-4" /></Button><h3 className="text-lg font-semibold">{format(calendarViewMonth, "LLLL yyyy", { locale: pl })}</h3><Button variant="outline" size="icon" onClick={() => setCalendarViewMonth(addMonths(calendarViewMonth, 1))}><ChevronRight className="h-4 w-4" /></Button></div><div className="grid grid-cols-7 gap-px border-l border-t bg-border">{["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map(dayLabel => (<div key={dayLabel} className="py-2 text-center text-xs font-medium text-muted-foreground bg-card border-b border-r">{dayLabel}</div>))}{daysBeforeMonth.map((_, i) => (<div key={`empty-start-${i}`} className="bg-muted/30 border-b border-r min-h-[80px]"></div>))}{daysInMonth.map(day => {const assignment = getDayAssignment(day);const isDayBeforeStartDate = isBefore(day, startOfDay(form.watch("startDate")!));let content = null;let bgColor = "bg-card hover:bg-muted/50";let textColor = "text-foreground";if (assignment && !isDayBeforeStartDate) {if (assignment.isRestDay) {content = <><Coffee size={14} className="mr-1 inline-block"/> Odpoczynek</>;bgColor = "bg-green-500/10 hover:bg-green-500/20";textColor = "text-green-700 dark:text-green-400";} else if (assignment.templateName) {content = <><LayoutDashboard size={14} className="mr-1 inline-block"/> {assignment.templateName}</>;bgColor = "bg-purple-500/10 hover:bg-purple-500/20";textColor = "text-purple-700 dark:text-purple-400";} else if (assignment.assignedWorkoutName) {content = assignment.assignedWorkoutName;bgColor = "bg-primary/10 hover:bg-primary/20";textColor = "text-primary";}}return (<div key={day.toString()} className={cn("p-2 border-b border-r min-h-[80px] text-xs relative transition-colors",isSameMonth(day, calendarViewMonth) ? bgColor : "bg-muted/30",isDayBeforeStartDate && isSameMonth(day, calendarViewMonth) ? "opacity-60 bg-muted/50" : "",!isSameMonth(day, calendarViewMonth) ? "text-muted-foreground/50" : textColor)}><span className={cn("font-medium", isSameDay(day, new Date()) && "text-primary font-bold underline")}>{format(day, "d")}</span>{content && <div className="mt-1 text-xs break-words">{content}</div>}</div>);})}{Array.from({ length: (7 - (daysBeforeMonth.length + daysInMonth.length) % 7) % 7 }).map((_, i) => (<div key={`empty-end-${i}`} className="bg-muted/30 border-b border-r min-h-[80px]"></div>))}</div
></>) : (<Alert><CalendarDays className="h-4 w-4"/><AlertTitle>Wizualizacja Niedostępna</AlertTitle><AlertDescription>Aby zobaczyć wizualizację planu w kalendarzu, wybierz najpierw "Datę Rozpoczęcia Planu" w sekcji powyżej.</AlertDescription></Alert>)}</CardContent>
              </Card>
              <div className="flex justify-end space-x-4">{!isPastingModeActive && (<Button type="button" variant="outline" onClick={() => router.push(`/dashboard/plans/${planId}`)} disabled={formIsLoading}>Anuluj</Button>)}{!isPastingModeActive && (<Button type="submit" disabled={formIsLoading}>{formIsLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}Zapisz Zmiany</Button>)}</div>
            </form>
          </Form>
        </div>
      </main>
      <SelectWorkoutDialog isOpen={isWorkoutSelectionDialogOpen} onOpenChange={setIsWorkoutSelectionDialogOpen} availableWorkouts={availableWorkouts} onWorkoutSelected={handleWorkoutSelected}/>
      <QuickCreateWorkoutDialog isOpen={isQuickCreateWorkoutDialogOpen} onOpenChange={setIsQuickCreateWorkoutDialogOpen} onWorkoutCreated={handleQuickWorkoutCreated}/>
    </div>
  );
}
