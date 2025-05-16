
"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BarChart3, LineChart as LineChartIcon, CalendarDays, TrendingUp, WeightIcon as WeightLucideIcon, DumbbellIcon, AlertTriangle, PieChartIcon, ImageIcon, FileDown, Filter, Info, ArrowRightLeft, Target, Edit, Trash2, PlusCircle, Save, Loader2, ChevronDown } from "lucide-react";
import { format, parseISO, getWeek, getYear, startOfDay, endOfDay, isValid, isWithinInterval, isBefore, isAfter } from "date-fns";
import { pl } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";

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
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddGoalDialog, type AddGoalFormData } from "@/components/statistics/add-goal-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
import { StatisticsPageSkeleton } from "@/components/statistics/StatisticsPageSkeleton"; // Added import


// Mock data (ideally imported from a shared location or fetched)
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
    recordedSets: { ex6: [{ weight: "N/A", reps: "30min"}] }, exercises: [{id: "ex6", name: "Bieg na bieżni"}]
  },
  {
    id: "hist3", workoutName: "Trening Siłowy Całego Ciała", startTime: "2024-07-08T08:15:00.000Z",
    recordedSets: {
      ex1: [{ weight: "65", reps: "10" }, { weight: "70", reps: "8" }],
      ex2: [{ weight: "100", reps: "6"}],
      ex4: [{ weight: "BW", reps: "8"}]
    },
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"},
      {id: "ex2", name: "Przysiady ze sztangą"},
      {id: "ex4", name: "Podciąganie na drążku"}
    ]
  },
   {
    id: "hist4", workoutName: "Wieczorny Trening Nóg", startTime: "2024-07-10T19:00:00.000Z",
    recordedSets: { ex2: [{ weight: "105", reps: "5" }, { weight: "110", reps: "5" }] },
    exercises: [{id: "ex2", name: "Przysiady ze sztangą"}]
  },
  {
    id: "hist5", workoutName: "Trening Barków i Ramion", startTime: "2024-07-15T08:00:00.000Z",
    recordedSets: {
      ex9: [{ weight: "25", reps: "10" }],
      ex10: [{ weight: "15", reps: "12"}]
    },
    exercises: [
        { id: "ex9", name: "Wyciskanie żołnierskie (OHP)"},
        { id: "ex10", name: "Uginanie ramion ze sztangą"}
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
        { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"},
        {id: "ex2", name: "Przysiady ze sztangą"},
        { id: "ex12", name: "Wiosłowanie sztangą"}
    ]
  },
  {
    id: "hist7", workoutName: "Klatka i Triceps", startTime: "2024-06-20T09:00:00.000Z",
    recordedSets: { ex1: [{ weight: "55", reps: "12" }], ex5: [{weight:"BW", reps: "15"}] },
    exercises: [{ id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}, {id: "ex5", name: "Pompki"}]
  },
];

const EXERCISE_CATEGORIES_MAP: { [exerciseId: string]: string } = {
  "ex1": "Klatka", "ex2": "Nogi", "ex3": "Plecy", "ex4": "Plecy", "ex5": "Klatka",
  "ex6": "Cardio", "ex7": "Cardio", "ex8": "Całe ciało", "ex9": "Barki",
  "ex10": "Ramiona", "ex11": "Brzuch", "ex12": "Plecy", "ex13": "Nogi",
  "ex14": "Barki", "ex15": "Ramiona", "ex16": "Brzuch", "ex17": "Nogi",
  "ex18": "Klatka",
};

const ALL_UNIQUE_EXERCISES = Array.from(new Set(MOCK_HISTORY_SESSIONS_STATS.flatMap(s => s.exercises.map(e => ({ id: e.id, name: e.name }))).map(e => JSON.stringify(e)))).map(s => JSON.parse(s) as {id: string; name: string});
const ALL_UNIQUE_MUSCLE_GROUPS = Array.from(new Set(Object.values(EXERCISE_CATEGORIES_MAP))).sort();


interface SimpleMeasurement {
  id: string;
  date: string; // ISO string
  weight: number;
}
const MOCK_MEASUREMENTS_STATS: SimpleMeasurement[] = [
  { id: "m1", date: new Date(2024, 5, 15).toISOString(), weight: 76.0 }, 
  { id: "m2", date: new Date(2024, 6, 1).toISOString(), weight: 75.5 },  
  { id: "m3", date: new Date(2024, 6, 8).toISOString(), weight: 75.0 },  
  { id: "m4", date: new Date(2024, 6, 15).toISOString(), weight: 74.8 }, 
  { id: "m5", date: new Date(2024, 6, 22).toISOString(), weight: 74.5 }, 
  { id: "m6", date: new Date(2024, 6, 29).toISOString(), weight: 74.0 }, 
];

interface WellnessEntryForStats {
  date: string; 
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
  { date: "2024-06-20", wellBeing: 4, energyLevel: 4, sleepQuality: 4 },
];

export interface UserGoal extends AddGoalFormData {
  id: string;
  currentValue: number;
}

const INITIAL_USER_GOALS: UserGoal[] = [
  { id: "goal1", goalName: "Przysiad 120kg x 5", metric: "Przysiady ze sztangą - Objętość", currentValue: (110 * 5), targetValue: (120 * 5), deadline: parseISO("2024-12-31"), notes: "Cel na koniec roku" },
  { id: "goal2", goalName: "Wyciskanie 80kg", metric: "Wyciskanie sztangi na ławce płaskiej - Max Ciężar", currentValue: 75, targetValue: 80, deadline: parseISO("2024-10-30"), notes: "Cel na jesień" },
  { id: "goal3", goalName: "Trenuj 4x w tygodniu", metric: "Częstotliwość treningów", currentValue: 3, targetValue: 4, deadline: undefined, notes: "Cel regularności" },
];


interface ComparisonMetrics {
  workoutCount: number;
  totalVolume: number;
}

interface ComparisonPeriodData {
  startDate?: Date;
  endDate?: Date;
  metrics: ComparisonMetrics;
}
interface ComparisonResults {
  periodA: ComparisonPeriodData;
  periodB: ComparisonPeriodData;
}


export default function StatisticsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const exerciseIdFromQuery = searchParams.get("exerciseId");
  const exerciseNameFromQuery = searchParams.get("exerciseName");

  const [pageIsLoading, setPageIsLoading] = React.useState(true); // Added state for skeleton
  const [selectedGlobalStartDate, setSelectedGlobalStartDate] = React.useState<Date | undefined>();
  const [selectedGlobalEndDate, setSelectedGlobalEndDate] = React.useState<Date | undefined>();
  const [selectedExerciseIds, setSelectedExerciseIds] = React.useState<string[]>([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = React.useState<string[]>([]);
  
  const [processedHistorySessions, setProcessedHistorySessions] = React.useState<SimpleHistoricalWorkoutSession[]>([]);
  const [processedMeasurements, setProcessedMeasurements] = React.useState<SimpleMeasurement[]>([]);
  const [processedWellnessEntries, setProcessedWellnessEntries] = React.useState<WellnessEntryForStats[]>([]);

  const [periodAStartDate, setPeriodAStartDate] = React.useState<Date | undefined>();
  const [periodAEndDate, setPeriodAEndDate] = React.useState<Date | undefined>();
  const [periodBStartDate, setPeriodBStartDate] = React.useState<Date | undefined>();
  const [periodBEndDate, setPeriodBEndDate] = React.useState<Date | undefined>();
  const [comparisonResults, setComparisonResults] = React.useState<ComparisonResults | null>(null);
  
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = React.useState(false);
  const [userGoals, setUserGoals] = React.useState<UserGoal[]>(INITIAL_USER_GOALS);
  const [goalToDelete, setGoalToDelete] = React.useState<UserGoal | null>(null);
  const [isDeletingGoal, setIsDeletingGoal] = React.useState(false);
  const [printingChartId, setPrintingChartId] = React.useState<string | null>(null);


  const volumeChartExercises = React.useMemo(() => {
    const uniqueExercisesInProcessedSessions = new Set<string>();
    const exercises = processedHistorySessions.flatMap(s => s.exercises.map(e => ({ id: e.id, name: e.name })));
    const unique = [];
    for (const ex of exercises) {
        if (!uniqueExercisesInProcessedSessions.has(ex.id)) {
            unique.push(ex);
            uniqueExercisesInProcessedSessions.add(ex.id);
        }
    }
    return unique.sort((a,b) => a.name.localeCompare(b.name));
  }, [processedHistorySessions]);

  const initialSelectedExerciseId = React.useMemo(() => {
    if (exerciseIdFromQuery && volumeChartExercises.some(ex => ex.id === exerciseIdFromQuery)) {
      return exerciseIdFromQuery;
    }
    return volumeChartExercises.length > 0 ? volumeChartExercises[0].id : "";
  }, [exerciseIdFromQuery, volumeChartExercises]);

  const [selectedExerciseIdForVolume, setSelectedExerciseIdForVolume] = React.useState<string>(initialSelectedExerciseId);
  
  React.useEffect(() => {
     if (exerciseIdFromQuery && volumeChartExercises.some(ex => ex.id === exerciseIdFromQuery)) {
      setSelectedExerciseIdForVolume(exerciseIdFromQuery);
    } else if (!exerciseIdFromQuery && volumeChartExercises.length > 0 && !volumeChartExercises.some(ex => ex.id === selectedExerciseIdForVolume)) {
      setSelectedExerciseIdForVolume(volumeChartExercises[0].id);
    } else if (volumeChartExercises.length === 0) {
      setSelectedExerciseIdForVolume("");
    }
  }, [exerciseIdFromQuery, volumeChartExercises, selectedExerciseIdForVolume]);


  React.useEffect(() => {
    if (exerciseIdFromQuery && typeof window !== 'undefined' && !pageIsLoading) { 
      const timer = setTimeout(() => {
        const element = document.getElementById('exercise-volume-chart-card');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
           const selectedExercise = ALL_UNIQUE_EXERCISES.find(ex => ex.id === selectedExerciseIdForVolume); 
           const messageExerciseName = exerciseNameFromQuery || selectedExercise?.name || "wybranego ćwiczenia";
           
           if (ALL_UNIQUE_EXERCISES.some(ex => ex.id === exerciseIdFromQuery)) {
             toast({
                title: "Analiza Ćwiczenia",
                description: `Wyświetlanie trendu objętości dla: ${messageExerciseName}.`,
             });
           } else {
             toast({
                title: "Uwaga",
                description: `Nie można było automatycznie wybrać ćwiczenia '${exerciseNameFromQuery || exerciseIdFromQuery}' dla wykresu objętości. Wyświetlono statystyki dla '${selectedExercise?.name || 'domyślnego ćwiczenia'}'.`,
                variant: "default",
                duration: 7000,
            });
           }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [exerciseIdFromQuery, exerciseNameFromQuery, toast, selectedExerciseIdForVolume, pageIsLoading]);

  const handleApplyGlobalFilters = React.useCallback(() => {
    let filteredSessions = MOCK_HISTORY_SESSIONS_STATS;
    let filteredMeasurementsData = MOCK_MEASUREMENTS_STATS;
    let filteredWellness = MOCK_WELLNESS_ENTRIES_FOR_STATS;

    const sDate = selectedGlobalStartDate ? startOfDay(selectedGlobalStartDate) : null;
    const eDate = selectedGlobalEndDate ? endOfDay(selectedGlobalEndDate) : null;

    if (sDate || eDate) {
      filteredSessions = filteredSessions.filter(session => {
        const sessionDate = parseISO(session.startTime);
        if (!isValid(sessionDate)) return false;
        let inRange = true;
        if (sDate && isBefore(sessionDate, sDate)) inRange = false;
        if (eDate && isAfter(sessionDate, eDate)) inRange = false;
        return inRange;
      });
      filteredMeasurementsData = filteredMeasurementsData.filter(m => {
        const measurementDate = parseISO(m.date);
        if (!isValid(measurementDate)) return false;
        let inRange = true;
        if (sDate && isBefore(measurementDate, sDate)) inRange = false;
        if (eDate && isAfter(measurementDate, eDate)) inRange = false;
        return inRange;
      });
      filteredWellness = filteredWellness.filter(w => {
          const wellnessDate = parseISO(w.date);
          if (!isValid(wellnessDate)) return false;
          let inRange = true;
          if (sDate && isBefore(wellnessDate, sDate)) inRange = false;
          if (eDate && isAfter(wellnessDate, eDate)) inRange = false;
          return inRange;
      });
    }

    if (selectedExerciseIds.length > 0) {
      filteredSessions = filteredSessions.filter(session => 
        session.exercises.some(ex => selectedExerciseIds.includes(ex.id))
      );
    }

    if (selectedMuscleGroups.length > 0) {
      filteredSessions = filteredSessions.filter(session => 
        session.exercises.some(ex => {
          const category = EXERCISE_CATEGORIES_MAP[ex.id];
          return category && selectedMuscleGroups.includes(category);
        })
      );
    }
    
    setProcessedHistorySessions(filteredSessions);
    setProcessedMeasurements(filteredMeasurementsData);
    setProcessedWellnessEntries(filteredWellness);

    const currentVolumeExercises = new Set(filteredSessions.flatMap(s => s.exercises.map(e => e.id)));
    if (selectedExerciseIdForVolume && !currentVolumeExercises.has(selectedExerciseIdForVolume)) {
        const firstAvailable = Array.from(currentVolumeExercises)[0];
        setSelectedExerciseIdForVolume(firstAvailable || "");
    }


    toast({
        title: "Filtry Zastosowane",
        description: `Dane zostały przefiltrowane. Znaleziono ${filteredSessions.length} sesji treningowych.`,
    });

  }, [selectedGlobalStartDate, selectedGlobalEndDate, selectedExerciseIds, selectedMuscleGroups, toast, selectedExerciseIdForVolume]);
  
  React.useEffect(() => {
    setPageIsLoading(true);
    const timer = setTimeout(() => {
      handleApplyGlobalFilters(); // Apply initial filters or load all data
      setPageIsLoading(false);
    }, 750); // Simulate initial data load
    return () => clearTimeout(timer);
  }, [handleApplyGlobalFilters]); // Rerun if filter logic changes


  const workoutFrequencyData = React.useMemo(() => {
    const workoutsByWeek: { [week: string]: number } = {};
    processedHistorySessions.forEach(session => {
      const date = parseISO(session.startTime);
      if (!isValid(date)) return;
      const year = getYear(date);
      const weekNumber = getWeek(date, { locale: pl, weekStartsOn: 1 });
      const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;
      workoutsByWeek[weekKey] = (workoutsByWeek[weekKey] || 0) + 1;
    });
    return Object.entries(workoutsByWeek)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [processedHistorySessions]);

  const weightTrendData = React.useMemo(() => {
    return processedMeasurements
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .map(m => ({
        date: format(parseISO(m.date), "dd MMM yy", { locale: pl }),
        Waga: m.weight,
      }));
  }, [processedMeasurements]);

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
    processedWellnessEntries.forEach(entry => {
      const entryDate = parseISO(entry.date); 
      if(isValid(entryDate)) {
        wellnessDataMap.set(format(entryDate, "yyyy-MM-dd"), entry);
      }
    });

    processedHistorySessions.forEach(session => {
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

        const sessionDateObj = parseISO(session.startTime);
        if (!isValid(sessionDateObj)) return;

        const sessionDateStr = format(sessionDateObj, "yyyy-MM-dd");
        const displayDateStr = format(sessionDateObj, "dd MMM yy", { locale: pl });
        const wellnessEntry = wellnessDataMap.get(sessionDateStr);

        const dataPoint: any = {
          date: displayDateStr,
          sessionDate: sessionDateObj,
        };
        if (volume > 0) { 
            dataPoint.Volume = volume;
        }

        if (wellnessEntry) {
          if (selectedWellnessMetrics.includes('wellBeing') && wellnessEntry.wellBeing !== undefined) dataPoint.wellBeing = wellnessEntry.wellBeing;
          if (selectedWellnessMetrics.includes('energyLevel') && wellnessEntry.energyLevel !== undefined) dataPoint.energyLevel = wellnessEntry.energyLevel;
          if (selectedWellnessMetrics.includes('sleepQuality') && wellnessEntry.sleepQuality !== undefined) dataPoint.sleepQuality = wellnessEntry.sleepQuality;
        }
        if (dataPoint.Volume !== undefined || 
            (selectedWellnessMetrics.includes('wellBeing') && dataPoint.wellBeing !== undefined) ||
            (selectedWellnessMetrics.includes('energyLevel') && dataPoint.energyLevel !== undefined) ||
            (selectedWellnessMetrics.includes('sleepQuality') && dataPoint.sleepQuality !== undefined)
           ) {
             mergedData.push(dataPoint);
        }
      }
    });
    return mergedData.sort((a,b) => a.sessionDate.getTime() - b.sessionDate.getTime());
  }, [selectedExerciseIdForVolume, selectedWellnessMetrics, processedHistorySessions, processedWellnessEntries]);


  const muscleGroupProportionData = React.useMemo(() => {
    const categoryCounts: { [category: string]: number } = {};
    processedHistorySessions.forEach(session => {
      session.exercises.forEach(exercise => {
        const category = EXERCISE_CATEGORIES_MAP[exercise.id] || "Inne";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
    });
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [processedHistorySessions]);

  const calculateMetricsForPeriod = (startDate?: Date, endDate?: Date): ComparisonMetrics => {
    let workoutCount = 0;
    let totalVolume = 0;

    const periodSessions = MOCK_HISTORY_SESSIONS_STATS.filter(session => { 
        const sessionDate = parseISO(session.startTime);
        if (!isValid(sessionDate)) return false;

        let withinPeriod = true;
        if (startDate && sessionDate < startOfDay(startDate)) withinPeriod = false;
        if (endDate && sessionDate > endOfDay(endDate)) withinPeriod = false;
        return withinPeriod;
    });

    workoutCount = periodSessions.length;

    periodSessions.forEach(session => {
        Object.values(session.recordedSets).forEach(exerciseSets => {
            exerciseSets.forEach(set => {
                const weight = parseFloat(String(set.weight));
                const reps = parseInt(String(set.reps), 10);
                if (!isNaN(weight) && !isNaN(reps) && weight > 0 && reps > 0) {
                    totalVolume += weight * reps;
                }
            });
        });
    });
    return { workoutCount, totalVolume };
  };


  const handleComparePeriods = () => {
    if (!periodAStartDate || !periodAEndDate || !periodBStartDate || !periodBEndDate) {
        toast({
            title: "Błąd",
            description: "Wybierz pełne zakresy dat dla obu okresów do porównania.",
            variant: "destructive",
        });
        setComparisonResults(null);
        return;
    }
     if (isBefore(periodAEndDate, periodAStartDate) || isBefore(periodBEndDate, periodBStartDate)) {
        toast({
            title: "Błąd Zakresu Dat",
            description: "Data końcowa nie może być wcześniejsza niż data początkowa dla okresu.",
            variant: "destructive",
        });
        setComparisonResults(null);
        return;
    }

    const metricsA = calculateMetricsForPeriod(periodAStartDate, periodAEndDate);
    const metricsB = calculateMetricsForPeriod(periodBStartDate, periodBEndDate);

    setComparisonResults({
        periodA: { startDate: periodAStartDate, endDate: periodAEndDate, metrics: metricsA },
        periodB: { startDate: periodBStartDate, endDate: periodBEndDate, metrics: metricsB },
    });

    toast({
        title: "Porównanie Wygenerowane",
        description: "Wyniki porównania okresów są gotowe.",
    });
  };

  const handleAddGoal = (data: AddGoalFormData) => {
    const newGoal: UserGoal = {
      id: uuidv4(),
      goalName: data.goalName,
      metric: data.metric,
      currentValue: data.currentValue === "" || data.currentValue === undefined ? 0 : Number(data.currentValue),
      targetValue: data.targetValue, 
      deadline: data.deadline,
      notes: data.notes,
    };
    setUserGoals(prev => [...prev, newGoal].sort((a,b) => {
        if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime();
        if (a.deadline) return -1; 
        if (b.deadline) return 1; 
        return 0; 
    }));
    toast({
      title: "Cel Dodany!",
      description: `Cel "${newGoal.goalName}" został pomyślnie dodany.`
    });
    setIsAddGoalDialogOpen(false);
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;
    setIsDeletingGoal(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setUserGoals(prev => prev.filter(goal => goal.id !== goalToDelete.id));
    toast({
      title: "Cel Usunięty",
      description: `Cel "${goalToDelete.goalName}" został usunięty.`
    });
    setGoalToDelete(null);
    setIsDeletingGoal(false);
  };

  const handlePrintChart = (chartCardId: string) => {
    setPrintingChartId(chartCardId);
  };

  React.useEffect(() => {
    if (printingChartId) {
      const printTimeout = setTimeout(() => { 
        if (typeof window !== 'undefined') window.print();
        setPrintingChartId(null); 
      }, 100); 
      return () => clearTimeout(printTimeout);
    }
  }, [printingChartId]);


  const arrayToCSV = (data: any[], headers?: string[]): string => {
    if (!data || data.length === 0) {
        return "";
    }
    const actualHeaders = headers || Object.keys(data[0]);
    const csvRows = [actualHeaders.join(";")];
    data.forEach(row => {
        const values = actualHeaders.map(header => {
            const escaped = ('' + (row[header] === undefined || row[header] === null ? '' : row[header])).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(";"));
    });
    return csvRows.join("\r\n");
  };

  const downloadCSV = (csvString: string, filename: string) => {
    if (!csvString || typeof window === 'undefined') return;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const exportChartDataToCSV = (data: any[], filename: string, chartHeaders?: {key: string, label: string}[]) => {
    if (!data || data.length === 0) {
        toast({ title: "Brak danych", description: "Nie ma danych do wyeksportowania dla tego wykresu.", variant: "destructive"});
        return;
    }
    let headersToUse: string[];
    let exportableData = data;

    if (chartHeaders) {
        headersToUse = chartHeaders.map(h => h.label);
        exportableData = data.map(row => {
            const newRow: {[key: string]: any} = {};
            chartHeaders.forEach(h => {
                newRow[h.label] = row.hasOwnProperty(h.key) ? row[h.key] : "";
            });
            return newRow;
        });
    } else {
        headersToUse = Object.keys(data[0]);
    }
    
    const csvString = arrayToCSV(exportableData, headersToUse);
    downloadCSV(csvString, filename);
    toast({ title: "Eksport CSV", description: `Dane wykresu "${filename}" zostały pobrane.`});
  };

 const handleMultiSelectChange = (
    currentSelected: string[],
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentSelected.includes(value)) {
      setter(currentSelected.filter((item) => item !== value));
    } else {
      setter([...currentSelected, value]);
    }
  };

  const handleSelectAll = (
    allOptions: { id: string }[] | string[],
    currentSelected: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentSelected.length === allOptions.length) {
      setter([]); // Deselect all
    } else {
      if (typeof allOptions[0] === 'string') {
        setter(allOptions as string[]);
      } else {
        setter((allOptions as { id: string }[]).map(option => option.id));
      }
    }
  };


  const chartConfig = {
    count: { label: "Liczba Treningów", color: "hsl(var(--chart-1))" },
    Waga: { label: "Waga (kg)", color: "hsl(var(--chart-2))" },
    Volume: { label: `Objętość (${ALL_UNIQUE_EXERCISES.find(ex => ex.id === selectedExerciseIdForVolume)?.name || 'wybranego ćwiczenia'})`, color: "hsl(var(--chart-3))" },
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
    sleepQuality: { label: "Sen (1-5)", color: "hsl(var(--chart-2))" },
  } as const;

  if (pageIsLoading) {
    return <StatisticsPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto space-y-6">

        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-primary"/>Globalny Filtr Danych</CardTitle>
              <CardDescription>Wybierz zakres dat oraz inne kryteria, aby dostosować wyświetlane statystyki. Zmiany zostaną zastosowane po kliknięciu "Zastosuj Filtry".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  date={selectedGlobalStartDate}
                  onDateChange={setSelectedGlobalStartDate}
                  label="Data od (opcjonalnie)"
                  disabled={(date) => selectedGlobalEndDate ? isAfter(date, selectedGlobalEndDate) : false}
                />
                <DatePicker
                  date={selectedGlobalEndDate}
                  onDateChange={setSelectedGlobalEndDate}
                  label="Data do (opcjonalnie)"
                  disabled={(date) => selectedGlobalStartDate ? isBefore(date, selectedGlobalStartDate) : false}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                            <DumbbellIcon className="mr-2 h-4 w-4"/>
                            Wybierz ćwiczenia ({selectedExerciseIds.length} zazn.)
                            <ChevronDown className="ml-auto h-4 w-4 opacity-50"/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <div className="p-2 border-b">
                             <Label className="flex items-center">
                                <Checkbox
                                    checked={selectedExerciseIds.length === ALL_UNIQUE_EXERCISES.length && ALL_UNIQUE_EXERCISES.length > 0}
                                    indeterminate={selectedExerciseIds.length > 0 && selectedExerciseIds.length < ALL_UNIQUE_EXERCISES.length}
                                    onCheckedChange={() => handleSelectAll(ALL_UNIQUE_EXERCISES, selectedExerciseIds, setSelectedExerciseIds)}
                                    className="mr-2"
                                    disabled={ALL_UNIQUE_EXERCISES.length === 0}
                                />
                                Zaznacz/Odznacz wszystkie
                            </Label>
                        </div>
                        <ScrollArea className="h-[200px] p-2">
                            {ALL_UNIQUE_EXERCISES.length > 0 ? ALL_UNIQUE_EXERCISES.map(exercise => (
                                <Label key={exercise.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                                    <Checkbox
                                        id={`ex-filter-${exercise.id}`}
                                        checked={selectedExerciseIds.includes(exercise.id)}
                                        onCheckedChange={() => handleMultiSelectChange(selectedExerciseIds, exercise.id, setSelectedExerciseIds)}
                                    />
                                    <span>{exercise.name}</span>
                                </Label>
                            )) : <p className="text-xs text-muted-foreground p-2">Brak ćwiczeń do filtrowania.</p>}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                            <DumbbellIcon className="mr-2 h-4 w-4"/> 
                            Wybierz grupy mięśniowe ({selectedMuscleGroups.length} zazn.)
                            <ChevronDown className="ml-auto h-4 w-4 opacity-50"/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                         <div className="p-2 border-b">
                             <Label className="flex items-center">
                                <Checkbox
                                    checked={selectedMuscleGroups.length === ALL_UNIQUE_MUSCLE_GROUPS.length && ALL_UNIQUE_MUSCLE_GROUPS.length > 0}
                                    indeterminate={selectedMuscleGroups.length > 0 && selectedMuscleGroups.length < ALL_UNIQUE_MUSCLE_GROUPS.length}
                                    onCheckedChange={() => handleSelectAll(ALL_UNIQUE_MUSCLE_GROUPS, selectedMuscleGroups, setSelectedMuscleGroups)}
                                    className="mr-2"
                                    disabled={ALL_UNIQUE_MUSCLE_GROUPS.length === 0}
                                />
                                Zaznacz/Odznacz wszystkie
                            </Label>
                        </div>
                        <ScrollArea className="h-[200px] p-2">
                            {ALL_UNIQUE_MUSCLE_GROUPS.length > 0 ? ALL_UNIQUE_MUSCLE_GROUPS.map(group => (
                                <Label key={group} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                                    <Checkbox
                                        id={`mg-filter-${group}`}
                                        checked={selectedMuscleGroups.includes(group)}
                                        onCheckedChange={() => handleMultiSelectChange(selectedMuscleGroups, group, setSelectedMuscleGroups)}
                                    />
                                    <span>{group}</span>
                                </Label>
                            )) : <p className="text-xs text-muted-foreground p-2">Brak grup mięśniowych do filtrowania.</p>}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleApplyGlobalFilters} className="print-hide">
                <Filter className="mr-2 h-4 w-4"/>Zastosuj Filtry
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card id="workout-frequency-chart-card" className={cn(printingChartId === "workout-frequency-chart-card" && "printable-chart-area")}>
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
              <CardFooter className="flex justify-end print-hide">
                 <TooltipProvider>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handlePrintChart("workout-frequency-chart-card")}><ImageIcon className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj wykres jako Obraz/PDF</p></TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => exportChartDataToCSV(workoutFrequencyData, "czestotliwosc_treningow.csv", [{key: 'week', label: 'Tydzień'}, {key: 'count', label: 'Liczba Treningów'}])} disabled={workoutFrequencyData.length === 0}><FileDown className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj dane jako CSV</p></TooltipContent></Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>

            <Card id="weight-trend-chart-card" className={cn(printingChartId === "weight-trend-chart-card" && "printable-chart-area")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><WeightLucideIcon className="h-6 w-6 text-primary" />Trend Wagi</CardTitle>
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
              <CardFooter className="justify-between print-hide">
                  <p className="text-xs text-muted-foreground">Dane pochodzą z sekcji "Pomiary".</p>
                  <div>
                    <TooltipProvider>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handlePrintChart("weight-trend-chart-card")}><ImageIcon className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj wykres jako Obraz/PDF</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => exportChartDataToCSV(weightTrendData, "trend_wagi.csv", [{key: 'date', label: 'Data'}, {key: 'Waga', label: 'Waga (kg)'}])} disabled={weightTrendData.length === 0}><FileDown className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj dane jako CSV</p></TooltipContent></Tooltip>
                    </TooltipProvider>
                  </div>
              </CardFooter>
            </Card>
          </div>

          <Card id="exercise-volume-chart-card" className={cn("lg:col-span-2", printingChartId === "exercise-volume-chart-card" && "printable-chart-area")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DumbbellIcon className="h-6 w-6 text-primary" />Trend Objętości dla Ćwiczenia</CardTitle>
              <CardDescription>Całkowita objętość (ciężar x powtórzenia) dla wybranego ćwiczenia w kolejnych sesjach, z opcjonalną nakładką danych z dziennika samopoczucia.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4 print-hide">
                    <Select value={selectedExerciseIdForVolume} onValueChange={setSelectedExerciseIdForVolume}>
                        <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="Wybierz ćwiczenie do analizy objętości" />
                        </SelectTrigger>
                        <SelectContent>
                        {volumeChartExercises.map(exercise => (
                            <SelectItem key={exercise.id} value={exercise.id}>{exercise.name}</SelectItem>
                        ))}
                         {volumeChartExercises.length === 0 && <SelectItem value="" disabled>Brak ćwiczeń do wyboru (zastosuj filtry)</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
                <Card className="p-4 print-hide mb-4">
                    <Label className="text-sm font-medium mb-2 block">Nakładka Danych z Dziennika Samopoczucia:</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                        {['wellBeing', 'energyLevel', 'sleepQuality'].map(metricKey => (
                            <div key={metricKey} className="flex items-center space-x-2">
                            <Checkbox
                                id={`wellness-${metricKey}`}
                                checked={selectedWellnessMetrics.includes(metricKey)}
                                onCheckedChange={() => handleWellnessMetricToggle(metricKey)}
                            />
                            <Label htmlFor={`wellness-${metricKey}`} className="text-sm font-normal">
                                {metricKey === 'wellBeing' ? 'Samopoczucie' : metricKey === 'energyLevel' ? 'Energia' : 'Sen'}
                            </Label>
                            </div>
                        ))}
                    </div>
                </Card>

              {exerciseVolumeData.length >= 1 ? ( 
                <ChartContainer config={chartConfig} className="h-[350px] w-full mt-4">
                  <LineChart data={exerciseVolumeData} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis yAxisId="left" dataKey="Volume" domain={['auto', 'auto']} tickLine={false} axisLine={false} tickMargin={8} name="Objętość" />
                    {selectedWellnessMetrics.length > 0 && (
                       <YAxis yAxisId="right" orientation="right" domain={[1,5]} allowDecimals={false} tickCount={5} tickLine={false} axisLine={false} tickMargin={8} name="Ocena (1-5)" />
                    )}
                    <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line yAxisId="left" type="monotone" dataKey="Volume" name={chartConfig.Volume.label} stroke="var(--color-Volume)" strokeWidth={2} dot={{ fill: "var(--color-Volume)" }} activeDot={{ r: 6 }} connectNulls={false}/>
                    {selectedWellnessMetrics.includes('wellBeing') && <Line yAxisId="right" type="monotone" dataKey="wellBeing" name="Samopoczucie" stroke={chartConfig.wellBeing.color} strokeWidth={2} dot={{ fill: chartConfig.wellBeing.color }} activeDot={{ r: 6 }} connectNulls={false} />}
                    {selectedWellnessMetrics.includes('energyLevel') && <Line yAxisId="right" type="monotone" dataKey="energyLevel" name="Energia" stroke={chartConfig.energyLevel.color} strokeWidth={2} dot={{ fill: chartConfig.energyLevel.color }} activeDot={{ r: 6 }} connectNulls={false} />}
                    {selectedWellnessMetrics.includes('sleepQuality') && <Line yAxisId="right" type="monotone" dataKey="sleepQuality" name="Sen" stroke={chartConfig.sleepQuality.color} strokeWidth={2} dot={{ fill: chartConfig.sleepQuality.color }} activeDot={{ r: 6 }} connectNulls={false} />}
                  </LineChart>
                </ChartContainer>
              ) : (
                 <div className="flex items-center justify-center h-[350px] text-muted-foreground mt-4">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    {!selectedExerciseIdForVolume || selectedExerciseIdForVolume === "all" ? "Wybierz ćwiczenie, aby zobaczyć trend objętości." : "Za mało danych dla wybranego ćwiczenia, aby wyświetlić trend objętości."}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between print-hide">
                <p className="text-xs text-muted-foreground">
                  Analiza objętości dla ćwiczeń siłowych z zarejestrowanym ciężarem i powtórzeniami.
                </p>
                 <div>
                    <TooltipProvider>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handlePrintChart("exercise-volume-chart-card")}><ImageIcon className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj wykres jako Obraz/PDF</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => {
                        const headers = [{key: 'date', label: 'Data'}, {key: 'Volume', label: 'Objętość'}];
                        if (selectedWellnessMetrics.includes('wellBeing')) headers.push({key: 'wellBeing', label: 'Samopoczucie'});
                        if (selectedWellnessMetrics.includes('energyLevel')) headers.push({key: 'energyLevel', label: 'Energia'});
                        if (selectedWellnessMetrics.includes('sleepQuality')) headers.push({key: 'sleepQuality', label: 'Sen'});
                        exportChartDataToCSV(exerciseVolumeData, "trend_objetosci_cwiczenia.csv", headers);
                    }} disabled={exerciseVolumeData.length === 0}><FileDown className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj dane jako CSV</p></TooltipContent></Tooltip>
                    </TooltipProvider>
                  </div>
              </CardFooter>
          </Card>

          <Card id="muscle-group-chart-card" className={cn("lg:col-span-2", printingChartId === "muscle-group-chart-card" && "printable-chart-area")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-6 w-6 text-primary" />Proporcje Trenowanych Grup Mięśniowych</CardTitle>
              <CardDescription>Rozkład wykonanych ćwiczeń według grup mięśniowych (na podstawie wszystkich zarejestrowanych treningów w wybranym globalnie okresie).</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {muscleGroupProportionData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[350px] w-full max-w-lg">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <RechartsTooltip content={<ChartTooltipContent nameKey="name" hideIndicator />} />
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
             <CardFooter className="justify-between print-hide">
                <p className="text-xs text-muted-foreground">
                  Kategorie grup mięśniowych są mapowane na podstawie wykonanych ćwiczeń.
                </p>
                 <div>
                    <TooltipProvider>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handlePrintChart("muscle-group-chart-card")}><ImageIcon className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj wykres jako Obraz/PDF</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => exportChartDataToCSV(muscleGroupProportionData, "proporcje_grup_miesniowych.csv", [{key: 'name', label: 'Grupa Mięśniowa'}, {key: 'value', label: 'Liczba Ćwiczeń'}])} disabled={muscleGroupProportionData.length === 0}><FileDown className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Eksportuj dane jako CSV</p></TooltipContent></Tooltip>
                    </TooltipProvider>
                  </div>
              </CardFooter>
          </Card>

          <Card className="print-hide">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ArrowRightLeft className="h-6 w-6 text-primary" />Porównaj Okresy</CardTitle>
              <CardDescription>Porównaj swoje statystyki między dwoma wybranymi okresami.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 mt-4">
                <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold text-center">Okres A</h4>
                    <DatePicker
                        date={periodAStartDate}
                        onDateChange={setPeriodAStartDate}
                        label="Data od (Okres A)"
                        disabled={(date) => periodAEndDate ? isAfter(date, periodAEndDate) : false}
                    />
                    <DatePicker
                        date={periodAEndDate}
                        onDateChange={setPeriodAEndDate}
                        label="Data do (Okres A)"
                        disabled={(date) => periodAStartDate ? isBefore(date, periodAStartDate) : false}
                    />
                </div>
                 <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold text-center">Okres B</h4>
                    <DatePicker
                        date={periodBStartDate}
                        onDateChange={setPeriodBStartDate}
                        label="Data od (Okres B)"
                        disabled={(date) => periodBEndDate ? isAfter(date, periodBEndDate) : false}
                    />
                    <DatePicker
                        date={periodBEndDate}
                        onDateChange={setPeriodBEndDate}
                        label="Data do (Okres B)"
                        disabled={(date) => periodBStartDate ? isBefore(date, periodBStartDate) : false}
                    />
                </div>
              </div>
              <Button onClick={handleComparePeriods} className="w-full sm:w-auto">
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Porównaj Okresy
              </Button>

              {comparisonResults && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-semibold">Wyniki Porównania</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p className="text-sm">
                        <strong>Okres A:</strong> {comparisonResults.periodA.startDate ? format(comparisonResults.periodA.startDate, "PPP", {locale:pl}) : 'N/A'} - {comparisonResults.periodA.endDate ? format(comparisonResults.periodA.endDate, "PPP", {locale:pl}) : 'N/A'}
                    </p>
                    <p className="text-sm">
                        <strong>Okres B:</strong> {comparisonResults.periodB.startDate ? format(comparisonResults.periodB.startDate, "PPP", {locale:pl}) : 'N/A'} - {comparisonResults.periodB.endDate ? format(comparisonResults.periodB.endDate, "PPP", {locale:pl}) : 'N/A'}
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Metryka</TableHead>
                            <TableHead className="text-right">Okres A</TableHead>
                            <TableHead className="text-right">Okres B</TableHead>
                            <TableHead className="text-right">Różnica</TableHead>
                            <TableHead className="text-right">Zmiana %</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[
                            {
                                label: "Liczba Treningów",
                                valueA: comparisonResults.periodA.metrics.workoutCount,
                                valueB: comparisonResults.periodB.metrics.workoutCount,
                                unit: " treningi/ów"
                            },
                            {
                                label: "Całkowita Objętość",
                                valueA: comparisonResults.periodA.metrics.totalVolume,
                                valueB: comparisonResults.periodB.metrics.totalVolume,
                                unit: " kg"
                            }
                        ].map(item => {
                            const diff = item.valueB - item.valueA;
                            const percentageChange = item.valueA !== 0 ? ((diff / item.valueA) * 100).toFixed(1) : (item.valueB !== 0 ? (diff > 0 ? "∞" : "-∞") : "0.0"); 
                            return (
                                <TableRow key={item.label}>
                                    <TableCell className="font-medium">{item.label}</TableCell>
                                    <TableCell className="text-right">{item.valueA.toLocaleString('pl-PL')}{item.unit}</TableCell>
                                    <TableCell className="text-right">{item.valueB.toLocaleString('pl-PL')}{item.unit}</TableCell>
                                    <TableCell className={`text-right font-semibold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : ''}`}>
                                        {diff > 0 ? '+' : ''}{diff.toLocaleString('pl-PL')}{item.unit}
                                    </TableCell>
                                     <TableCell className={`text-right font-semibold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : ''}`}>
                                        {diff > 0 ? '+' : ''}{percentageChange}%
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <AlertDialog open={!!goalToDelete} onOpenChange={(isOpen) => !isOpen && setGoalToDelete(null)}>
            <Card className="print-hide">
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-6 w-6 text-primary"/>Moje Cele</CardTitle>
                <CardDescription>Definiuj i śledź swoje cele treningowe i pomiarowe.</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Lista Celów</h3>
                    <Button onClick={() => setIsAddGoalDialogOpen(true)} >
                        <PlusCircle className="mr-2 h-4 w-4"/> Dodaj Nowy Cel
                    </Button>
                </div>
                <div className="space-y-3">
                    {userGoals.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Nie zdefiniowano jeszcze żadnych celów.</p>
                    )}
                    {userGoals.map(goal => (
                        <Card key={goal.id} className="p-4 bg-muted/30">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold">{goal.goalName}</h4>
                                    <p className="text-xs text-muted-foreground">Metryka: {goal.metric}</p>
                                    {goal.deadline && <p className="text-xs text-muted-foreground">Termin: {format(goal.deadline, "PPP", {locale: pl})}</p>}
                                </div>
                                <div className="flex items-center gap-1 print-hide">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast({title: "Edycja Celu (Wkrótce)", description: "Możliwość edycji celów zostanie dodana w przyszłości."})}>
                                        <Edit className="h-4 w-4"/>
                                        <span className="sr-only">Edytuj cel</span>
                                    </Button>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setGoalToDelete(goal)}>
                                            <Trash2 className="h-4 w-4"/>
                                            <span className="sr-only">Usuń cel</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Postęp</span>
                                    <span>{goal.currentValue.toLocaleString('pl-PL')} / {goal.targetValue.toLocaleString('pl-PL')} {(goal.metric.includes('(kg)') || goal.metric.includes('Objętość')) ? 'kg' : (goal.metric.includes('(cm)') ? 'cm' : '')}</span>
                                </div>
                                <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2" />
                            </div>
                            {goal.notes && <p className="text-xs text-muted-foreground mt-2 italic">Notatka: {goal.notes}</p>}
                        </Card>
                    ))}
                    </div>
                    {goalToDelete && (
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Usunąć cel?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Czy na pewno chcesz usunąć cel "{goalToDelete.goalName}"?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setGoalToDelete(null)} disabled={isDeletingGoal}>Anuluj</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteGoal} disabled={isDeletingGoal} className="bg-destructive hover:bg-destructive/90">
                                    {isDeletingGoal ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Usuń
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    )}
                </CardContent>
            </Card>
          </AlertDialog>
          <AddGoalDialog 
            isOpen={isAddGoalDialogOpen} 
            onOpenChange={setIsAddGoalDialogOpen}
            onSave={handleAddGoal} 
          />
        </div>
      </main>
    </div>
  );
}
