"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import { ArrowLeft, BarChart3, LineChart as LineChartIcon, CalendarDays, TrendingUp, WeightIcon, DumbbellIcon, AlertTriangle, PieChartIcon, ImageIcon, FileDown } from "lucide-react";
import { format, parseISO, getWeek, getYear } from "date-fns";
import { pl } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { DatePicker } from "@/components/ui/date-picker"; // Assuming you have this from Shadcn
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddGoalDialog } from "@/components/statistics/add-goal-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


// Mock data (ideally imported from a shared location or fetched)
// Simplified HistoricalWorkoutSession for this page
interface SimpleHistoricalWorkoutSession {
  id: string;
  workoutName: string;
  startTime: string; // ISO string
  recordedSets: Record<string, { weight: string | number; reps: string | number }[]>;
  exercises: { id: string; name: string }[];
}

// Updated MOCK_HISTORY_SESSIONS_STATS for muscle group chart diversity
const MOCK_HISTORY_SESSIONS_STATS: SimpleHistoricalWorkoutSession[] = [
  {
    id: "hist1", workoutName: "Poranny Trening Siłowy", startTime: "2024-07-01T08:00:00.000Z", 
    recordedSets: { ex1: [{ weight: "60", reps: "10" }, { weight: "65", reps: "8" }] },
    exercises: [{ id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}] // Klatka
  },
  {
    id: "hist2", workoutName: "Szybkie Cardio HIIT", startTime: "2024-07-03T17:30:00.000Z",
    recordedSets: { ex6: [{ weight: "N/A", reps: "30min"}] }, exercises: [{id: "ex6", name: "Bieg na bieżni"}] // Cardio
  },
  { 
    id: "hist3", workoutName: "Trening Siłowy Całego Ciała", startTime: "2024-07-08T08:15:00.000Z",
    recordedSets: { 
      ex1: [{ weight: "65", reps: "10" }, { weight: "70", reps: "8" }], 
      ex2: [{ weight: "100", reps: "6"}],
      ex4: [{ weight: "BW", reps: "8"}] 
    },
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}, // Klatka
      {id: "ex2", name: "Przysiady ze sztangą"}, // Nogi
      {id: "ex4", name: "Podciąganie na drążku"} // Plecy
    ]
  },
   { 
    id: "hist4", workoutName: "Wieczorny Trening Nóg", startTime: "2024-07-10T19:00:00.000Z",
    recordedSets: { ex2: [{ weight: "105", reps: "5" }, { weight: "110", reps: "5" }] },
    exercises: [{id: "ex2", name: "Przysiady ze sztangą"}] // Nogi
  },
  { 
    id: "hist5", workoutName: "Trening Barków i Ramion", startTime: "2024-07-15T08:00:00.000Z",
    recordedSets: { 
      ex9: [{ weight: "25", reps: "10" }], 
      ex10: [{ weight: "15", reps: "12"}] 
    },
    exercises: [
        { id: "ex9", name: "Wyciskanie żołnierskie (OHP)"}, // Barki
        { id: "ex10", name: "Uginanie ramion ze sztangą"} // Ramiona
    ]
  },
  { 
    id: "hist6", workoutName: "Full Body Workout", startTime: "2024-07-22T10:00:00.000Z",
    recordedSets: { 
        ex1: [{ weight: "75", reps: "5" }], 
        ex2: [{ weight: "110", reps: "5" }],
        ex12: [{ weight: "60", reps: "8"}]
    },
    exercises: [
        { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}, // Klatka
        {id: "ex2", name: "Przysiady ze sztangą"}, // Nogi
        {id: "ex12", name: "Wiosłowanie sztangą"} // Plecy
    ]
  },
];

const EXERCISE_CATEGORIES_MAP: { [exerciseId: string]: string } = {
  "ex1": "Klatka",
  "ex2": "Nogi",
  "ex3": "Plecy",
  "ex4": "Plecy",
  "ex5": "Klatka", // Pompki
  "ex6": "Cardio", // Bieg
  "ex7": "Cardio", // Skakanka
  "ex8": "Całe ciało", // Rozciąganie dynamiczne
  "ex9": "Barki", // OHP
  "ex10": "Ramiona", // Uginanie ramion
  "ex11": "Brzuch", // Plank
  "ex12": "Plecy", // Wiosłowanie
  "ex13": "Nogi", // Wykroki
  "ex14": "Barki", // Unoszenie hantli
  "ex15": "Ramiona", // Francuskie wyciskanie
  "ex16": "Brzuch", // Allah Pompki
  "ex17": "Nogi", // Przysiad bułgarski
  "ex18": "Klatka", // Wyciskanie hantli skos
};


interface SimpleMeasurement {
  id: string;
  date: string; // ISO string
  weight: number;
}
const MOCK_MEASUREMENTS_STATS: SimpleMeasurement[] = [
  { id: "m1", date: new Date(2024, 6, 1).toISOString(), weight: 75.5 },
  { id: "m2", date: new Date(2024, 6, 8).toISOString(), weight: 75.0 },
  { id: "m3", date: new Date(2024, 6, 15).toISOString(), weight: 74.8 },
  { id: "m4", date: new Date(2024, 6, 22).toISOString(), weight: 74.5 },
  { id: "m5", date: new Date(2024, 6, 29).toISOString(), weight: 74.0 },
];

const MOCK_EXERCISES_FOR_STATS_FILTER = [
    // { id: "all", name: "Wszystkie Ćwiczenia (dla częstotliwości)"}, // Removed 'all' as it's not for volume
    { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej" },
    { id: "ex2", name: "Przysiady ze sztangą" },
    { id: "ex4", name: "Podciąganie na drążku" },
    { id: "ex9", name: "Wyciskanie żołnierskie (OHP)" },
    { id: "ex10", name: "Uginanie ramion ze sztangą" },
    { id: "ex12", name: "Wiosłowanie sztangą" },
];

interface WellnessEntryForStats {
  date: string; // ISO string date part only for matching
  wellBeing?: number;
  energyLevel?: number;
  sleepQuality?: number;
}

const MOCK_WELLNESS_ENTRIES_FOR_STATS: WellnessEntryForStats[] = [
  { date: "2024-07-01", wellBeing: 4, energyLevel: 3, sleepQuality: 5 },
  { date: "2024-07-03", wellBeing: 3, energyLevel: 4, sleepQuality: 3 },
  { date: "2024-07-08", wellBeing: 5, energyLevel: 5, sleepQuality: 4 },
  { date: "2024-07-10", wellBeing: 2, energyLevel: 2, sleepQuality: 2 },
  { date: "2024-07-15", wellBeing: 4, energyLevel: 4, sleepQuality: 5 },
  { date: "2024-07-22", wellBeing: 3, energyLevel: 3, sleepQuality: 4 },
];

// Mock goals data
const MOCK_USER_GOALS = [
  { id: "goal1", name: "Przysiad 120kg x 5", metric: "Przysiady ze sztangą - Objętość", currentValue: 110 * 5, targetValue: 120 * 5, unit: "kg*powt", deadline: "2024-12-31" },
  { id: "goal2", name: "Wyciskanie 80kg", metric: "Wyciskanie sztangi na ławce płaskiej - Max Ciężar", currentValue: 75, targetValue: 80, unit: "kg", deadline: "2024-10-30" },
  { id: "goal3", name: "Trenuj 4x w tygodniu", metric: "Częstotliwość treningów", currentValue: 3, targetValue: 4, unit: "treningi/tydz.", deadline: null },
];


export default function StatisticsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const exerciseIdFromQuery = searchParams.get("exerciseId");
  const exerciseNameFromQuery = searchParams.get("exerciseName");
  
  const [selectedGlobalStartDate, setSelectedGlobalStartDate] = React.useState<Date | undefined>();
  const [selectedGlobalEndDate, setSelectedGlobalEndDate] = React.useState<Date | undefined>();
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = React.useState(false);

  // Determine exercises valid for the volume chart
  const volumeChartExercises = React.useMemo(() =>
    MOCK_EXERCISES_FOR_STATS_FILTER.filter(ex => ex.id !== "all"), // Ensure 'all' is excluded if it was there
    []
  );
  
  const initialSelectedExerciseId = volumeChartExercises.length > 0 ? volumeChartExercises[0].id : "";
  const [selectedExerciseIdForVolume, setSelectedExerciseIdForVolume] = React.useState<string>(initialSelectedExerciseId);

  React.useEffect(() => {
    if (exerciseIdFromQuery) {
      const isValidForVolumeChart = volumeChartExercises.some(ex => ex.id === exerciseIdFromQuery);
      if (isValidForVolumeChart) {
        setSelectedExerciseIdForVolume(exerciseIdFromQuery);
      } else if (volumeChartExercises.length > 0) {
        setSelectedExerciseIdForVolume(volumeChartExercises[0].id); // Fallback to the first valid exercise
        toast({
          title: "Uwaga",
          description: `Nie można było automatycznie wybrać ćwiczenia '${exerciseNameFromQuery || exerciseIdFromQuery}' dla wykresu objętości. Wyświetlono statystyki dla '${volumeChartExercises[0].name}'.`,
          variant: "default",
          duration: 7000,
        });
      }
      // If volumeChartExercises is empty, selectedExerciseIdForVolume remains its initial value.
    }
  }, [exerciseIdFromQuery, exerciseNameFromQuery, toast, volumeChartExercises]);


  React.useEffect(() => {
    if (exerciseIdFromQuery) { // Scroll if any exerciseId was passed, even if selection defaulted
      const timer = setTimeout(() => {
        const element = document.getElementById('exercise-volume-chart-card');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
           if (volumeChartExercises.some(ex => ex.id === exerciseIdFromQuery)) { // Check if the exact exercise was selected for the toast
            toast({
              title: "Analiza Ćwiczenia",
              description: `Wyświetlanie trendu objętości dla: ${exerciseNameFromQuery || exerciseIdFromQuery}.`,
            });
          }
        }
      }, 150); // Slightly increased delay
      return () => clearTimeout(timer);
    }
  }, [exerciseIdFromQuery, exerciseNameFromQuery, toast, volumeChartExercises]);


  const workoutFrequencyData = React.useMemo(() => {
    const workoutsByWeek: { [week: string]: number } = {};
    MOCK_HISTORY_SESSIONS_STATS.forEach(session => {
      const date = parseISO(session.startTime);
      const year = getYear(date);
      const weekNumber = getWeek(date, { locale: pl, weekStartsOn: 1 });
      const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;
      workoutsByWeek[weekKey] = (workoutsByWeek[weekKey] || 0) + 1;
    });
    return Object.entries(workoutsByWeek)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, []);

  const weightTrendData = React.useMemo(() => {
    return MOCK_MEASUREMENTS_STATS
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .map(m => ({
        date: format(parseISO(m.date), "dd MMM yy", { locale: pl }),
        Waga: m.weight,
      }));
  }, []);

  const [selectedWellnessMetrics, setSelectedWellnessMetrics] = React.useState<string[]>([]);

  const handleWellnessMetricToggle = (metricKey: string) => {
    setSelectedWellnessMetrics(prev =>
      prev.includes(metricKey)
        ? prev.filter(m => m !== metricKey)
        : [...prev, metricKey]
    );
  };

  const exerciseVolumeData = React.useMemo(() => {
    if (!selectedExerciseIdForVolume || selectedExerciseIdForVolume === "all") return [];
    
    const mergedData: Array<{
      date: string;
      sessionDate: Date;
      Volume?: number;
      wellBeing?: number;
      energyLevel?: number;
      sleepQuality?: number;
    }> = [];

    const wellnessDataMap = new Map<string, WellnessEntryForStats>();
    MOCK_WELLNESS_ENTRIES_FOR_STATS.forEach(entry => {
      wellnessDataMap.set(format(parseISO(entry.date), "yyyy-MM-dd"), entry);
    });

    MOCK_HISTORY_SESSIONS_STATS.forEach(session => {
      if (session.exercises.some(ex => ex.id === selectedExerciseIdForVolume)) {
        let volume = 0;
        const setsForExercise = session.recordedSets[selectedExerciseIdForVolume];
        if (setsForExercise) {
          setsForExercise.forEach(set => {
            const weight = parseFloat(String(set.weight));
            const reps = parseInt(String(set.reps), 10);
            if (!isNaN(weight) && !isNaN(reps) && weight > 0 && reps > 0) {
              volume += weight * reps;
            }
          });
        }
        
        const sessionDateStr = format(parseISO(session.startTime), "yyyy-MM-dd");
        const displayDateStr = format(parseISO(session.startTime), "dd MMM yy", { locale: pl });
        const wellnessEntry = wellnessDataMap.get(sessionDateStr);

        const dataPoint: any = {
          date: displayDateStr,
          sessionDate: parseISO(session.startTime),
          Volume: volume > 0 ? volume : undefined, // Only include if volume > 0
        };

        if (wellnessEntry) {
          if (selectedWellnessMetrics.includes('wellBeing')) dataPoint.wellBeing = wellnessEntry.wellBeing;
          if (selectedWellnessMetrics.includes('energyLevel')) dataPoint.energyLevel = wellnessEntry.energyLevel;
          if (selectedWellnessMetrics.includes('sleepQuality')) dataPoint.sleepQuality = wellnessEntry.sleepQuality;
        }
        if (dataPoint.Volume !== undefined) { // Only add datapoint if there is volume for this exercise
             mergedData.push(dataPoint);
        }
      }
    });
    return mergedData.sort((a,b) => a.sessionDate.getTime() - b.sessionDate.getTime());
  }, [selectedExerciseIdForVolume, selectedWellnessMetrics]);


  const muscleGroupProportionData = React.useMemo(() => {
    const categoryCounts: { [category: string]: number } = {};
    MOCK_HISTORY_SESSIONS_STATS.forEach(session => {
      session.exercises.forEach(exercise => {
        const category = EXERCISE_CATEGORIES_MAP[exercise.id] || "Inne";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
    });
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, []);

  const chartConfig = {
    count: { label: "Liczba Treningów", color: "hsl(var(--chart-1))" },
    Waga: { label: "Waga (kg)", color: "hsl(var(--chart-2))" },
    Volume: { label: `Objętość (${MOCK_EXERCISES_FOR_STATS_FILTER.find(ex => ex.id === selectedExerciseIdForVolume)?.name || 'wybranego ćwiczenia'})`, color: "hsl(var(--chart-3))" },
    Klatka: { label: "Klatka", color: "hsl(var(--chart-1))" },
    Nogi: { label: "Nogi", color: "hsl(var(--chart-2))" },
    Plecy: { label: "Plecy", color: "hsl(var(--chart-3))" },
    Barki: { label: "Barki", color: "hsl(var(--chart-4))" },
    Ramiona: { label: "Ramiona", color: "hsl(var(--chart-5))" },
    Cardio: { label: "Cardio", color: "hsl(var(--chart-1))" }, 
    Brzuch: { label: "Brzuch", color: "hsl(var(--chart-2))" },
    "Całe ciało": { label: "Całe ciało", color: "hsl(var(--chart-3))"},
    Inne: { label: "Inne", color: "hsl(var(--chart-4))" },
    wellBeing: { label: "Samopoczucie (1-5)", color: "hsl(var(--chart-4))" },
    energyLevel: { label: "Energia (1-5)", color: "hsl(var(--chart-5))" },
    sleepQuality: { label: "Sen (1-5)", color: "hsl(var(--chart-2))" }, // Re-using color
  } as const;

  const handleApplyGlobalFilters = () => {
    toast({
      title: "Filtry Zastosowane (Symulacja)",
      description: `Dane zostałyby przefiltrowane dla zakresu od ${selectedGlobalStartDate ? format(selectedGlobalStartDate, "PPP", {locale: pl}) : " początku"} do ${selectedGlobalEndDate ? format(selectedGlobalEndDate, "PPP", {locale: pl}) : " końca"}.`,
    });
    // In a real app, this would trigger re-fetching or re-calculating data
  };


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Panelu</span>
              </Link>
            </Button>
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Statystyki i Analiza</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto space-y-6">

        <Card>
            <CardHeader>
              <CardTitle>Globalny Filtr Danych</CardTitle>
              <CardDescription>Wybierz zakres dat oraz inne filtry, aby dostosować wyświetlane statystyki.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  date={selectedGlobalStartDate}
                  onDateChange={setSelectedGlobalStartDate}
                  label="Data od"
                  disabled={(date) => selectedGlobalEndDate ? date > selectedGlobalEndDate : false}
                />
                <DatePicker
                  date={selectedGlobalEndDate}
                  onDateChange={setSelectedGlobalEndDate}
                  label="Data do"
                  disabled={(date) => selectedGlobalStartDate ? date < selectedGlobalStartDate : false}
                />
              </div>
              <div className="space-y-2">
                <Label>Wybierz ćwiczenia (placeholder)</Label>
                <p className="text-sm text-muted-foreground">Tu pojawi się multiselect/checkboxy do wyboru ćwiczeń (funkcja wkrótce).</p>
              </div>
              <div className="space-y-2">
                <Label>Wybierz grupy mięśniowe (placeholder)</Label>
                <p className="text-sm text-muted-foreground">Tu pojawi się multiselect/checkboxy do wyboru grup mięśniowych (funkcja wkrótce).</p>
              </div>
               <Button onClick={handleApplyGlobalFilters} disabled={!selectedGlobalStartDate && !selectedGlobalEndDate}>Zastosuj Filtry</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-6 w-6 text-primary" />Częstotliwość Treningów</CardTitle>
                <CardDescription>Liczba wykonanych treningów w poszczególnych tygodniach.</CardDescription>
              </CardHeader>
              <CardContent>
                {workoutFrequencyData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={workoutFrequencyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <AlertTriangle className="mr-2 h-5 w-5" /> Brak danych do wyświetlenia wykresu częstotliwości.
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                 <TooltipProvider>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled><ImageIcon className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj wykres (Wkrótce)</p></TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled><FileDown className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj dane CSV (Wkrótce)</p></TooltipContent></Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><WeightIcon className="h-6 w-6 text-primary" />Trend Wagi</CardTitle>
                <CardDescription>Zmiany Twojej wagi w czasie.</CardDescription>
              </CardHeader>
              <CardContent>
                {weightTrendData.length > 1 ? ( 
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart data={weightTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                      <Line type="monotone" dataKey="Waga" stroke="var(--color-Waga)" strokeWidth={2} dot={{ fill: "var(--color-Waga)" }} activeDot={{ r: 6 }}/>
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <AlertTriangle className="mr-2 h-5 w-5" /> Za mało danych, aby wyświetlić trend wagi. Dodaj więcej pomiarów.
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between">
                  <p className="text-xs text-muted-foreground">Dane pochodzą z sekcji "Pomiary".</p>
                  <div>
                    <TooltipProvider>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled><ImageIcon className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj wykres (Wkrótce)</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled><FileDown className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj dane CSV (Wkrótce)</p></TooltipContent></Tooltip>
                    </TooltipProvider>
                  </div>
              </CardFooter>
            </Card>
          </div>
          
          <Card id="exercise-volume-chart-card" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DumbbellIcon className="h-6 w-6 text-primary" />Trend Objętości dla Ćwiczenia</CardTitle>
              <CardDescription>Całkowita objętość (ciężar x powtórzenia) dla wybranego ćwiczenia w kolejnych sesjach, z opcjonalną nakładką danych z dziennika samopoczucia.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Select value={selectedExerciseIdForVolume} onValueChange={setSelectedExerciseIdForVolume}>
                        <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="Wybierz ćwiczenie do analizy objętości" />
                        </SelectTrigger>
                        <SelectContent>
                        {volumeChartExercises.map(exercise => (
                            <SelectItem key={exercise.id} value={exercise.id}>{exercise.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
              {exerciseVolumeData.length > 1 ? (
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <LineChart data={exerciseVolumeData} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis yAxisId="left" dataKey="Volume" domain={['auto', 'auto']} tickLine={false} axisLine={false} tickMargin={8} />
                    {selectedWellnessMetrics.length > 0 && (
                       <YAxis yAxisId="right" orientation="right" domain={[1,5]} allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                    )}
                    <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line yAxisId="left" type="monotone" dataKey="Volume" name={`Objętość (${MOCK_EXERCISES_FOR_STATS_FILTER.find(ex => ex.id === selectedExerciseIdForVolume)?.name})`} stroke="var(--color-Volume)" strokeWidth={2} dot={{ fill: "var(--color-Volume)" }} activeDot={{ r: 6 }}/>
                    {selectedWellnessMetrics.includes('wellBeing') && <Line yAxisId="right" type="monotone" dataKey="wellBeing" name="Samopoczucie" stroke={chartConfig.wellBeing.color} strokeWidth={2} dot={{ fill: chartConfig.wellBeing.color }} activeDot={{ r: 6 }}/>}
                    {selectedWellnessMetrics.includes('energyLevel') && <Line yAxisId="right" type="monotone" dataKey="energyLevel" name="Energia" stroke={chartConfig.energyLevel.color} strokeWidth={2} dot={{ fill: chartConfig.energyLevel.color }} activeDot={{ r: 6 }}/>}
                    {selectedWellnessMetrics.includes('sleepQuality') && <Line yAxisId="right" type="monotone" dataKey="sleepQuality" name="Sen" stroke={chartConfig.sleepQuality.color} strokeWidth={2} dot={{ fill: chartConfig.sleepQuality.color }} activeDot={{ r: 6 }}/>}
                  </LineChart>
                </ChartContainer>
              ) : (
                 <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                    <AlertTriangle className="mr-2 h-5 w-5" /> 
                    {!selectedExerciseIdForVolume || selectedExerciseIdForVolume === "all" ? "Wybierz ćwiczenie, aby zobaczyć trend objętości." : "Za mało danych dla wybranego ćwiczenia, aby wyświetlić trend objętości."}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
                <p className="text-xs text-muted-foreground">
                  Analiza objętości dla ćwiczeń siłowych z zarejestrowanym ciężarem i powtórzeniami.
                </p>
                 <div>
                    <TooltipProvider>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled><ImageIcon className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj wykres (Wkrótce)</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled><FileDown className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj dane CSV (Wkrótce)</p></TooltipContent></Tooltip>
                    </TooltipProvider>
                  </div>
              </CardFooter>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Nakładka Danych z Dziennika Samopoczucia</CardTitle>
                <CardDescription>Wybierz metryki z dziennika samopoczucia, aby nałożyć je na wykres Trendu Objętości dla Ćwiczenia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {['wellBeing', 'energyLevel', 'sleepQuality'].map(metricKey => {
                    const metricLabel = chartConfig[metricKey as keyof typeof chartConfig]?.label || metricKey;
                    return (
                        <div key={metricKey} className="flex items-center space-x-2">
                            <Checkbox
                                id={`wellness-${metricKey}`}
                                checked={selectedWellnessMetrics.includes(metricKey)}
                                onCheckedChange={() => handleWellnessMetricToggle(metricKey)}
                            />
                            <Label htmlFor={`wellness-${metricKey}`} className="font-normal">{metricLabel}</Label>
                        </div>
                    );
                })}
            </CardContent>
          </Card>

           <Card className="lg:col-span-2"> 
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-6 w-6 text-primary" />Proporcje Trenowanych Grup Mięśniowych</CardTitle>
              <CardDescription>Rozkład wykonanych ćwiczeń według grup mięśniowych (na podstawie wszystkich zarejestrowanych treningów).</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {muscleGroupProportionData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[350px] w-full max-w-lg">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" hideIndicator />} />
                      <Pie
                        data={muscleGroupProportionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {muscleGroupProportionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || `hsl(var(--chart-${(index % 5) + 1}))`} />
                        ))}
                      </Pie>
                      <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  <AlertTriangle className="mr-2 h-5 w-5" /> Brak danych do wyświetlenia proporcji grup mięśniowych.
                </div>
              )}
            </CardContent>
             <CardFooter className="justify-between">
                <p className="text-xs text-muted-foreground">
                  Kategorie grup mięśniowych są mapowane na podstawie wykonanych ćwiczeń.
                </p>
                 <div>
                    <TooltipProvider>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled><ImageIcon className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj wykres (Wkrótce)</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" disabled><FileDown className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj dane CSV (Wkrótce)</p></TooltipContent></Tooltip>
                    </TooltipProvider>
                  </div>
              </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Porównaj Okresy (Wkrótce)</CardTitle>
              <CardDescription>Porównaj swoje statystyki między dwoma wybranymi okresami.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>Funkcja w Budowie</AlertTitle>
                <AlertDescription>
                  Możliwość porównywania okresów zostanie dodana w przyszłości. Będziesz mógł wybrać dwa zakresy dat i zobaczyć porównanie kluczowych metryk.
                </AlertDescription>
              </Alert>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Okres A - Data od</Label>
                    <DatePicker disabled />
                  </div>
                  <div>
                    <Label>Okres A - Data do</Label>
                    <DatePicker disabled />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Okres B - Data od</Label>
                    <DatePicker disabled />
                  </div>
                  <div>
                    <Label>Okres B - Data do</Label>
                    <DatePicker disabled />
                  </div>
                </div>
                <Button disabled>Porównaj (Wkrótce)</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moje Cele (Wkrótce)</CardTitle>
              <CardDescription>Definiuj i śledź swoje cele treningowe i pomiarowe.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Lista Celów</h3>
                <Button onClick={() => setIsAddGoalDialogOpen(true)} disabled>+ Dodaj Nowy Cel (Wkrótce)</Button>
              </div>
              <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>Funkcja w Budowie</AlertTitle>
                <AlertDescription>
                  Możliwość definiowania i śledzenia celów zostanie dodana w przyszłości. Będziesz mógł tu ustawiać cele, np. "Przysiad 100kg" i monitorować postęp.
                </AlertDescription>
              </Alert>
              <div className="mt-4 space-y-3">
                {MOCK_USER_GOALS.map(goal => (
                  <div key={goal.id} className="p-3 border rounded-md bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.name}</span>
                      <span className="text-xs text-muted-foreground">Cel: {goal.targetValue}{goal.unit}</span>
                    </div>
                    <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Aktualnie: {goal.currentValue}{goal.unit} {goal.deadline ? `(do: ${format(parseISO(goal.deadline), "PPP", {locale: pl})})` : ''}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <AddGoalDialog isOpen={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen} />

        </div>
      </main>
    </div>
  );
}

// Helper DatePicker component if not globally available (example)
// interface DatePickerProps {
//   date?: Date;
//   onDateChange?: (date?: Date) => void;
//   label?: string;
//   disabled?: boolean | ((date: Date) => boolean);
// }
// const DatePicker: React.FC<DatePickerProps> = ({ date, onDateChange, label, disabled }) => (
//   <div className="space-y-1">
//     {label && <Label>{label}</Label>}
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button
//           variant={"outline"}
//           className={cn(
//             "w-full justify-start text-left font-normal",
//             !date && "text-muted-foreground"
//           )}
//           disabled={typeof disabled === 'boolean' ? disabled : false}
//         >
//           <CalendarDays className="mr-2 h-4 w-4" />
//           {date ? format(date, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0">
//         <Calendar
//           mode="single"
//           selected={date}
//           onSelect={onDateChange}
//           disabled={typeof disabled === 'function' ? disabled : (typeof disabled === 'boolean' ? () => disabled : undefined)}
//           initialFocus
//           locale={pl}
//         />
//       </PopoverContent>
//     </Popover>
//   </div>
// );
// Note: A proper DatePicker component should be imported from ui/date-picker or similar if it exists.
// For this prototype, I'm assuming a similar component is available or that this simplified one is acceptable.
// The provided code uses `import { DatePicker } from "@/components/ui/date-picker";`
// If this component doesn't exist, it needs to be created or the usage adapted.
// For now, I'll assume it exists and takes these props.
// I'll remove this comment and the inline DatePicker if a proper one is used from `ui/date-picker`.

// I will assume `components/ui/date-picker.tsx` looks something like this for the props used:
/*
// components/ui/date-picker.tsx (Example structure for props used)
"use client"
import * as React from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarProps } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "./label";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date?: Date) => void;
  label?: string;
  disabled?: CalendarProps["disabled"];
  className?: string;
}

export function DatePicker({ date, onDateChange, label, disabled, className }: DatePickerProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={typeof disabled === 'boolean' ? disabled : false} // Simplified disabled prop
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={disabled}
            initialFocus
            locale={pl}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
*/