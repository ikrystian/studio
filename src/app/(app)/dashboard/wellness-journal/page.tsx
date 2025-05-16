
"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
import {
  ArrowLeft,
  HeartPulse,
  CalendarIcon as CalendarDays, 
  Smile,
  Zap,
  Bed,
  StickyNote,
  Save,
  Trash2,
  Loader2,
  ListChecks,
  XCircle,
  Brain, 
  Accessibility, 
  Users, 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WellnessJournalPageSkeleton } from "@/components/wellness-journal/WellnessJournalPageSkeleton"; // Added import

export interface WellnessEntry {
  id: string;
  date: string; // ISO string
  wellBeing: number; // 1-5 scale
  energyLevel: number; // 1-5 scale
  sleepQuality: number; // 1-5 scale
  stressLevel?: number; // 1-5 scale
  muscleSoreness?: number; // 1-5 scale
  context?: string; 
  notes?: string;
}

const wellnessEntrySchema = z.object({
  date: z.date({ required_error: "Data wpisu jest wymagana." }),
  wellBeing: z.coerce.number().min(1, "Ocena jest wymagana.").max(5),
  energyLevel: z.coerce.number().min(1, "Ocena jest wymagana.").max(5),
  sleepQuality: z.coerce.number().min(1, "Ocena jest wymagana.").max(5),
  stressLevel: z.coerce.number().min(1).max(5).optional().or(z.literal("")),
  muscleSoreness: z.coerce.number().min(1).max(5).optional().or(z.literal("")),
  context: z.string().optional(),
  notes: z.string().optional(),
});

type WellnessEntryFormValues = z.infer<typeof wellnessEntrySchema>;

const RATING_OPTIONS = [
  { value: 1, label: "1 - Bardzo niski / Bardzo źle" },
  { value: 2, label: "2 - Niski / Źle" },
  { value: 3, label: "3 - Średni / Średnio" },
  { value: 4, label: "4 - Wysoki / Dobrze" },
  { value: 5, label: "5 - Bardzo wysoki / Bardzo dobrze" },
];

const SORENESS_RATING_OPTIONS = [
    { value: 1, label: "1 - Brak bólu" },
    { value: 2, label: "2 - Lekki ból" },
    { value: 3, label: "3 - Umiarkowany ból" },
    { value: 4, label: "4 - Silny ból" },
    { value: 5, label: "5 - Bardzo silny ból" },
];

const CONTEXT_OPTIONS = [
    { value: "general", label: "Ogólny" },
    { value: "before_workout", label: "Przed treningiem" },
    { value: "after_workout", label: "Po treningu" },
    { value: "morning", label: "Rano" },
    { value: "evening", label: "Wieczorem" },
    { value: "other", label: "Inny (opisz w notatkach)"},
];


const INITIAL_MOCK_ENTRIES: WellnessEntry[] = [
  {
    id: uuidv4(),
    date: new Date(2024, 6, 28).toISOString(),
    wellBeing: 4,
    energyLevel: 3,
    sleepQuality: 5,
    stressLevel: 2,
    muscleSoreness: 3,
    context: "after_workout",
    notes: "Dobry dzień, trochę zmęczony po treningu nóg.",
  },
  {
    id: uuidv4(),
    date: new Date(2024, 6, 29).toISOString(),
    wellBeing: 5,
    energyLevel: 5,
    sleepQuality: 4,
    stressLevel: 1,
    muscleSoreness: 1,
    context: "morning",
    notes: "Pełen energii!",
  },
];

export default function WellnessJournalPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true); // For skeleton
  const [entries, setEntries] = React.useState<WellnessEntry[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [entryToDelete, setEntryToDelete] = React.useState<WellnessEntry | null>(null);

  const form = useForm<WellnessEntryFormValues>({
    resolver: zodResolver(wellnessEntrySchema),
    defaultValues: {
      date: new Date(),
      wellBeing: 3,
      energyLevel: 3,
      sleepQuality: 3,
      stressLevel: "",
      muscleSoreness: "",
      context: "general",
      notes: "",
    },
  });

  React.useEffect(() => {
    setIsLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setEntries(INITIAL_MOCK_ENTRIES);
      setIsLoading(false);
    }, 750); // Simulate network delay
  }, []);

  async function onSubmit(values: WellnessEntryFormValues) {
    setIsSaving(true);
    const newEntry: WellnessEntry = {
      id: uuidv4(),
      date: values.date.toISOString(),
      wellBeing: values.wellBeing,
      energyLevel: values.energyLevel,
      sleepQuality: values.sleepQuality,
      stressLevel: values.stressLevel === "" ? undefined : Number(values.stressLevel),
      muscleSoreness: values.muscleSoreness === "" ? undefined : Number(values.muscleSoreness),
      context: values.context === "general" || !values.context ? undefined : values.context,
      notes: values.notes,
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    setEntries(prev => [newEntry, ...prev].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
    toast({ title: "Wpis zapisany", description: "Twój wpis do dziennika samopoczucia został dodany." });
    form.reset({
      date: new Date(),
      wellBeing: 3,
      energyLevel: 3,
      sleepQuality: 3,
      stressLevel: "",
      muscleSoreness: "",
      context: "general",
      notes: "",
    });
    setIsSaving(false);
  }

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    setIsSaving(true); 
    await new Promise(resolve => setTimeout(resolve, 500));
    setEntries(prev => prev.filter(e => e.id !== entryToDelete.id));
    toast({ title: "Wpis usunięty", description: "Wpis został pomyślnie usunięty z dziennika." });
    setEntryToDelete(null);
    setIsSaving(false);
  };

  const getRatingLabel = (value: number | undefined | "", type: 'general' | 'soreness' = 'general'): string => {
    if (value === undefined || value === null || value === "") return "-";
    const options = type === 'soreness' ? SORENESS_RATING_OPTIONS : RATING_OPTIONS;
    const numericValue = Number(value); // Ensure it's a number for comparison
    return options.find(opt => opt.value === numericValue)?.label || String(numericValue);
  };
  
  const getContextLabel = (value?: string): string => {
    if (!value || value === "general") return "Ogólny";
    return CONTEXT_OPTIONS.find(opt => opt.value === value)?.label || value;
  }

  if (isLoading) {
    return <WellnessJournalPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-primary" /> Dodaj Nowy Wpis
              </CardTitle>
              <CardDescription>Zarejestruj swoje samopoczucie, poziom energii, jakość snu i inne metryki.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data Wpisu</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full sm:w-[280px] justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isSaving}
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
                              disabled={(date) => date > new Date() || isSaving}
                              initialFocus
                              locale={pl}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="wellBeing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Smile className="mr-2 h-4 w-4"/>Ogólne Samopoczucie</FormLabel>
                          <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)} disabled={isSaving}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Oceń (1-5)" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RATING_OPTIONS.map(opt => <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="energyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Zap className="mr-2 h-4 w-4"/>Poziom Energii</FormLabel>
                          <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)} disabled={isSaving}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Oceń (1-5)" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RATING_OPTIONS.map(opt => <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sleepQuality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Bed className="mr-2 h-4 w-4"/>Jakość Snu</FormLabel>
                          <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)} disabled={isSaving}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Oceń (1-5)" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RATING_OPTIONS.map(opt => <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="stressLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Brain className="mr-2 h-4 w-4"/>Poziom Stresu (opcjonalnie)</FormLabel>
                          <Select 
                            onValueChange={(val) => field.onChange(val === "none" ? "" : Number(val))} 
                            value={field.value === "" || field.value === undefined ? "none" : String(field.value)} 
                            disabled={isSaving}
                          >
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Oceń (1-5)" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">- Brak oceny -</SelectItem>
                              {RATING_OPTIONS.map(opt => <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="muscleSoreness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Accessibility className="mr-2 h-4 w-4"/>Bolesność Mięśni (DOMS) (opcjonalnie)</FormLabel>
                           <Select 
                             onValueChange={(val) => field.onChange(val === "none" ? "" : Number(val))} 
                             value={field.value === "" || field.value === undefined ? "none" : String(field.value)} 
                             disabled={isSaving}
                           >
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Oceń (1-5)" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">- Brak oceny -</SelectItem>
                              {SORENESS_RATING_OPTIONS.map(opt => <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="context"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Users className="mr-2 h-4 w-4"/>Kontekst wpisu (opcjonalnie)</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value || "general"} disabled={isSaving}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Wybierz kontekst..." /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONTEXT_OPTIONS.map(opt => <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><StickyNote className="mr-2 h-4 w-4"/>Notatki (opcjonalne)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Jak się czułeś/aś? Co mogło wpłynąć na Twoje samopoczucie?" {...field} disabled={isSaving} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Zapisz Wpis
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <AlertDialog open={!!entryToDelete} onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEntryToDelete(null);
            }
          }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-6 w-6 text-primary" /> Historia Wpisów
                </CardTitle>
                <CardDescription>Przeglądaj swoje poprzednie wpisy w dzienniku samopoczucia.</CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <HeartPulse className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Brak zapisanych wpisów w dzienniku.</p>
                    <p className="text-sm text-muted-foreground">Dodaj swój pierwszy wpis powyżej.</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[400px] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Samopoczucie</TableHead>
                          <TableHead>Energia</TableHead>
                          <TableHead>Sen</TableHead>
                          <TableHead className="hidden sm:table-cell">Stres</TableHead>
                          <TableHead className="hidden sm:table-cell">DOMS</TableHead>
                          <TableHead className="hidden md:table-cell">Kontekst</TableHead>
                          <TableHead className="hidden lg:table-cell">Notatki</TableHead>
                          <TableHead className="text-right">Akcje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{format(parseISO(entry.date), "PPP", { locale: pl })}</TableCell>
                            <TableCell>{getRatingLabel(entry.wellBeing)}</TableCell>
                            <TableCell>{getRatingLabel(entry.energyLevel)}</TableCell>
                            <TableCell>{getRatingLabel(entry.sleepQuality)}</TableCell>
                            <TableCell className="hidden sm:table-cell">{getRatingLabel(entry.stressLevel)}</TableCell>
                            <TableCell className="hidden sm:table-cell">{getRatingLabel(entry.muscleSoreness, 'soreness')}</TableCell>
                            <TableCell className="hidden md:table-cell">{getContextLabel(entry.context)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[150px] truncate" title={entry.notes || undefined}>
                              {entry.notes || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setEntryToDelete(entry)} className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Usuń</span>
                                  </Button>
                              </AlertDialogTrigger>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
            
            {entryToDelete && ( 
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usunąć wpis z dziennika?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz usunąć ten wpis z dnia {format(parseISO(entryToDelete.date), "PPP", { locale: pl })}? Tej akcji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSaving}><XCircle className="mr-2 h-4 w-4"/>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteEntry} disabled={isSaving} className="bg-destructive hover:bg-destructive/90">
                    {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Trash2 className="mr-2 h-4 w-4" />}
                    Potwierdź i usuń
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            )}
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}
