
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, LineChart as LineChartIcon, CalendarDays, TrendingUp, WeightIcon, DumbbellIcon, AlertTriangle } from "lucide-react";
import { format, parseISO, startOfWeek, getWeek, getMonth, getYear } from "date-fns";
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
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

// Mock data (ideally imported from a shared location or fetched)
// Simplified HistoricalWorkoutSession for this page
interface SimpleHistoricalWorkoutSession {
  id: string;
  workoutName: string;
  startTime: string; // ISO string
  recordedSets: Record<string, { weight: string | number; reps: string | number }[]>;
  exercises: { id: string; name: string }[];
}

const MOCK_HISTORY_SESSIONS_STATS: SimpleHistoricalWorkoutSession[] = [
  {
    id: "hist1", workoutName: "Poranny Trening Siłowy", startTime: "2024-07-01T08:00:00.000Z", 
    recordedSets: { ex1: [{ weight: "60", reps: "10" }, { weight: "65", reps: "8" }] },
    exercises: [{ id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}]
  },
  {
    id: "hist2", workoutName: "Szybkie Cardio HIIT", startTime: "2024-07-03T17:30:00.000Z",
    recordedSets: {}, exercises: []
  },
  { 
    id: "hist3", workoutName: "Poranny Trening Siłowy", startTime: "2024-07-08T08:15:00.000Z",
    recordedSets: { ex1: [{ weight: "65", reps: "10" }, { weight: "70", reps: "8" }], ex2: [{ weight: "100", reps: "6"}] },
    exercises: [{ id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}, {id: "ex2", name: "Przysiady ze sztangą"}]
  },
   { 
    id: "hist4", workoutName: "Wieczorny Trening Nóg", startTime: "2024-07-10T19:00:00.000Z",
    recordedSets: { ex2: [{ weight: "105", reps: "5" }, { weight: "110", reps: "5" }] },
    exercises: [{id: "ex2", name: "Przysiady ze sztangą"}]
  },
  { 
    id: "hist5", workoutName: "Poranny Trening Siłowy", startTime: "2024-07-15T08:00:00.000Z",
    recordedSets: { ex1: [{ weight: "70", reps: "8" }, { weight: "70", reps: "7" }] },
    exercises: [{ id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}]
  },
  { 
    id: "hist6", workoutName: "Full Body Workout", startTime: "2024-07-22T10:00:00.000Z",
    recordedSets: { ex1: [{ weight: "75", reps: "5" }], ex2: [{ weight: "110", reps: "5" }] },
    exercises: [{ id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}, {id: "ex2", name: "Przysiady ze sztangą"}]
  },
];

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
    { id: "all", name: "Wszystkie Ćwiczenia (dla częstotliwości)"},
    { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej" },
    { id: "ex2", name: "Przysiady ze sztangą" },
];


export default function StatisticsPage() {
  const [selectedExerciseIdForVolume, setSelectedExerciseIdForVolume] = React.useState<string>("ex1");

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

  const exerciseVolumeData = React.useMemo(() => {
    if (selectedExerciseIdForVolume === "all") return [];
    return MOCK_HISTORY_SESSIONS_STATS
      .filter(session => session.exercises.some(ex => ex.id === selectedExerciseIdForVolume))
      .map(session => {
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
        return {
          date: format(parseISO(session.startTime), "dd MMM yy", { locale: pl }),
          sessionDate: parseISO(session.startTime), // for sorting
          Volume: volume,
        };
      })
      .filter(item => item.Volume > 0) // Only show sessions where volume was recorded for this exercise
      .sort((a,b) => a.sessionDate.getTime() - b.sessionDate.getTime());
  }, [selectedExerciseIdForVolume]);

  const chartConfig = {
    count: { label: "Liczba Treningów", color: "hsl(var(--chart-1))" },
    Waga: { label: "Waga (kg)", color: "hsl(var(--chart-2))" },
    Volume: { label: `Objętość (${MOCK_EXERCISES_FOR_STATS_FILTER.find(ex => ex.id === selectedExerciseIdForVolume)?.name || ''})`, color: "hsl(var(--chart-3))" }
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
          {/* Placeholder for global filters like date range */}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto space-y-8">

          <Card>
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
                    <ChartTooltip cursor={true} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              ) : (
                 <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <AlertTriangle className="mr-2 h-5 w-5" /> Brak danych do wyświetlenia wykresu częstotliwości.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><WeightIcon className="h-6 w-6 text-primary" />Trend Wagi</CardTitle>
              <CardDescription>Zmiany Twojej wagi w czasie.</CardDescription>
            </CardHeader>
            <CardContent>
              {weightTrendData.length > 1 ? ( // Need at least 2 points for a line
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={weightTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="Waga" stroke="var(--color-Waga)" strokeWidth={2} dot={{ fill: "var(--color-Waga)" }} activeDot={{ r: 6 }}/>
                  </LineChart>
                </ChartContainer>
              ) : (
                 <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <AlertTriangle className="mr-2 h-5 w-5" /> Za mało danych, aby wyświetlić trend wagi. Dodaj więcej pomiarów.
                </div>
              )}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Dane pochodzą z sekcji "Pomiary".
                </p>
              </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DumbbellIcon className="h-6 w-6 text-primary" />Trend Objętości dla Ćwiczenia</CardTitle>
              <CardDescription>Całkowita objętość (ciężar x powtórzenia) dla wybranego ćwiczenia w kolejnych sesjach.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Select value={selectedExerciseIdForVolume} onValueChange={setSelectedExerciseIdForVolume}>
                        <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="Wybierz ćwiczenie do analizy objętości" />
                        </SelectTrigger>
                        <SelectContent>
                        {MOCK_EXERCISES_FOR_STATS_FILTER.filter(ex => ex.id !== "all").map(exercise => (
                            <SelectItem key={exercise.id} value={exercise.id}>{exercise.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
              {exerciseVolumeData.length > 1 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={exerciseVolumeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="Volume" name={`Objętość (${MOCK_EXERCISES_FOR_STATS_FILTER.find(ex => ex.id === selectedExerciseIdForVolume)?.name})`} stroke="var(--color-Volume)" strokeWidth={2} dot={{ fill: "var(--color-Volume)" }} activeDot={{ r: 6 }}/>
                  </LineChart>
                </ChartContainer>
              ) : (
                 <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <AlertTriangle className="mr-2 h-5 w-5" /> 
                    {selectedExerciseIdForVolume === "all" ? "Wybierz ćwiczenie, aby zobaczyć trend objętości." : "Za mało danych dla wybranego ćwiczenia, aby wyświetlić trend objętości."}
                </div>
              )}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Analiza objętości dla ćwiczeń siłowych z zarejestrowanym ciężarem i powtórzeniami.
                </p>
              </CardFooter>
          </Card>

        </div>
      </main>
    </div>
  );
}

