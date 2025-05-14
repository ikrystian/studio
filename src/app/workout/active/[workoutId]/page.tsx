
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Save,
  Square,
  Timer,
  Weight,
  Repeat,
  TrendingUp,
  Info,
  ListChecks,
  SkipForward,
  Dumbbell,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Trash2,
  StickyNote,
  Lightbulb,
  Edit2, 
  Edit3, 
  HelpCircle,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { ProgressionSettings } from "@/app/settings/progression-model/page";


// Simulated exercise database (can be expanded or moved)
const MOCK_EXERCISES_DATABASE: { id: string; name: string; category: string, instructions?: string, videoUrl?: string }[] = [
  { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", category: "Klatka", instructions: "Połóż się na ławce, chwyć sztangę nachwytem szerzej niż barki. Opuść sztangę do klatki piersiowej, a następnie dynamicznie wypchnij w górę." },
  { id: "ex2", name: "Przysiady ze sztangą", category: "Nogi", instructions: "Stań w lekkim rozkroku, sztanga na barkach. Wykonaj przysiad, utrzymując proste plecy, zejdź biodrami poniżej kolan." },
  { id: "ex3", name: "Martwy ciąg", category: "Plecy", instructions: "Stań blisko sztangi, stopy na szerokość bioder. Złap sztangę nachwytem lub chwytem mieszanym. Podnieś sztangę, prostując biodra i kolana, utrzymując proste plecy." },
  { id: "ex4", name: "Podciąganie na drążku", category: "Plecy", instructions: "Złap drążek nachwytem szerzej niż barki. Podciągnij się, aż broda znajdzie się nad drążkiem. Kontrolowanie opuść ciało." },
  { id: "ex5", name: "Pompki", category: "Klatka", instructions: "Przyjmij pozycję podporu przodem, dłonie na szerokość barków. Opuść ciało, uginając łokcie, aż klatka piersiowa znajdzie się blisko podłoża. Wypchnij ciało w górę." },
  { id: "ex6", name: "Bieg na bieżni (30 min)", category: "Cardio", instructions: "Ustaw odpowiednią prędkość i nachylenie na bieżni. Utrzymuj stałe tempo przez określony czas." },
  { id: "ex7", name: "Skakanka (15 min)", category: "Cardio", instructions: "Skacz na skakance, zmieniając tempo i styl dla urozmaicenia."},
  { id: "ex8", name: "Plank (deska)", category: "Brzuch", instructions: "Oprzyj się na przedramionach i palcach stóp, utrzymując ciało w linii prostej od głowy do pięt."},
  { id: "ex9", name: "Wyciskanie żołnierskie (OHP)", category: "Barki", instructions: "Stań prosto, sztanga na wysokości obojczyków. Wypchnij sztangę pionowo nad głowę, blokując łokcie. Kontrolowanie opuść." },
  { id: "ex10", name: "Uginanie ramion ze sztangą", category: "Ramiona", instructions: "Stań prosto, chwyć sztangę podchwytem na szerokość barków. Ugnij ramiona, unosząc sztangę w kierunku barków. Opuść kontrolowanie." },
  { id: "ex11", name: "Allahy (brzuszki na wyciągu)", category: "Brzuch", instructions: "Klęcząc przodem do wyciągu górnego, chwyć linkę i przyciągaj ją w dół, wykonując skłon tułowia."},
  { id: "ex12", name: "Wiosłowanie sztangą", category: "Plecy", instructions: "Pochyl tułów, utrzymując proste plecy. Chwyć sztangę nachwytem. Przyciągnij sztangę do dolnej części brzucha, ściągając łopatki. Opuść kontrolowanie." },
];

export interface ExerciseInWorkout {
  id: string;
  name: string;
  defaultSets?: number;
  defaultReps?: string;
  defaultRest?: number; // seconds
}

export interface Workout {
  id: string;
  name: string;
  exercises: ExerciseInWorkout[];
}

const MOCK_WORKOUTS: Workout[] = [
  {
    id: "wk1",
    name: "Poranny Trening Siłowy",
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
      { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 4, defaultReps: "6-8", defaultRest: 120 },
      { id: "ex4", name: "Podciąganie na drążku", defaultSets: 3, defaultReps: "Max", defaultRest: 90 },
    ],
  },
  {
    id: "wk2",
    name: "Szybkie Cardio i Core",
    exercises: [
      { id: "ex6", name: "Bieg na bieżni (30 min)", defaultSets: 1, defaultReps: "30 min", defaultRest: 0 },
      { id: "ex8", name: "Plank (deska)", defaultSets: 3, defaultReps: "60s", defaultRest: 45 },
      { id: "ex5", name: "Pompki", defaultSets: 3, defaultReps: "15-20", defaultRest: 60 },
    ],
  },
];

export interface RecordedSet {
  setNumber: number;
  weight: number | string;
  reps: number | string;
  rpe?: number;
  notes?: string;
}

interface EditingSetInfo {
  exerciseId: string;
  setIndex: number; 
  setData: RecordedSet; 
}

interface MockSetRecord { weight: string | number; reps: string | number; }
interface MockPastSession {
  sessionId: string;
  exerciseId: string;
  date: string; // ISO
  setsPerformed: MockSetRecord[];
}
const MOCK_WORKOUT_HISTORY_FOR_SUGGESTIONS: MockPastSession[] = [
  { sessionId: 's1', exerciseId: 'ex1', date: '2024-07-15T09:00:00Z', setsPerformed: [{ weight: 60, reps: 10 }, { weight: 60, reps: 10 }, { weight: 60, reps: 9 }] },
  { sessionId: 's2', exerciseId: 'ex1', date: '2024-07-22T09:00:00Z', setsPerformed: [{ weight: 62.5, reps: 8 }, { weight: 62.5, reps: 8 }, { weight: 62.5, reps: 7 }] },
  { sessionId: 's3', exerciseId: 'ex2', date: '2024-07-15T10:00:00Z', setsPerformed: [{ weight: 100, reps: 10 }, { weight: 100, reps: 10 }] },
  { sessionId: 's4', exerciseId: 'ex4', date: '2024-07-15T11:00:00Z', setsPerformed: [{ weight: 'BW', reps: 8 }, { weight: 'BW', reps: 7 }] },
  { sessionId: 's5', exerciseId: 'ex8', date: '2024-07-18T10:00:00Z', setsPerformed: [{ weight: 'N/A', reps: '60s' }, { weight: 'N/A', reps: '50s'}] },
  { sessionId: 's6', exerciseId: 'ex6', date: '2024-07-20T08:00:00Z', setsPerformed: [{ weight: 'Poziom 7', reps: '30 min' }] },
];
const PROGRESSION_SETTINGS_LOCAL_STORAGE_KEY = "workoutWiseProgressionSettings";


const setFormSchema = z.object({
  weight: z.string().optional(), // Now optional, as it might not apply to time/distance
  reps: z.string().min(1, "Wartość jest wymagana (np. powtórzenia, czas, dystans)."),
  rpe: z.coerce.number().min(1).max(10).optional().or(z.literal("")),
  notes: z.string().optional(),
});

type SetFormValues = z.infer<typeof setFormSchema>;

const DEFAULT_REST_TIME = 60; // seconds

type ExerciseTrackingType = 'weight_reps' | 'time' | 'distance' | 'reps_only' | 'other';

function getExerciseTrackingType(exerciseName: string, category?: string): ExerciseTrackingType {
  const lowerName = exerciseName.toLowerCase();
  const lowerCategory = category?.toLowerCase();

  if (lowerName.includes('bieg') || lowerName.includes('rower') || lowerName.includes('orbitrek') || lowerName.includes('wiosł') || lowerCategory === 'cardio') {
    if (lowerName.includes('km') || lowerName.includes('metr') || lowerName.includes('dystans')) return 'distance';
    if (lowerName.includes('min') || lowerName.includes('sek') || lowerName.includes('godz') || lowerName.includes('czas')) return 'time';
    return 'time'; // Default for cardio if not explicitly distance or time in name
  }
  if (lowerName.includes('plank') || lowerName.includes('deska') || lowerName.includes('wall sit')) {
    return 'time';
  }
  if (lowerName.includes('podciąganie') || lowerName.includes('pompki') || lowerName.includes('dipy')) {
    // Could be weight_reps if weighted, or reps_only if bodyweight. For form purposes, 'reps_only' guides placeholder.
    return 'reps_only';
  }
  return 'weight_reps';
}


interface ProgressionSuggestion {
  suggestionText: string;
  suggestedValues?: { weight?: string | number; reps?: string | number };
  reasoning?: string;
}


export default function ActiveWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const workoutId = params.workoutId as string;

  const [isLoading, setIsLoading] = React.useState(true);
  const [currentWorkout, setCurrentWorkout] = React.useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = React.useState(0);

  const [recordedSets, setRecordedSets] = React.useState<Record<string, RecordedSet[]>>({});
  const [exerciseNotes, setExerciseNotes] = React.useState<Record<string, string>>({});
  const [editingSetInfo, setEditingSetInfo] = React.useState<EditingSetInfo | null>(null);


  const [workoutStartTime, setWorkoutStartTime] = React.useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState(0); 

  const [restTimer, setRestTimer] = React.useState(0);
  const [isResting, setIsResting] = React.useState(false);
  const restIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const [progressionSuggestion, setProgressionSuggestion] = React.useState<ProgressionSuggestion | null>(null);
  const [userProgressionSettings, setUserProgressionSettings] = React.useState<ProgressionSettings | null>(null);


  const setForm = useForm<SetFormValues>({
    resolver: zodResolver(setFormSchema),
    defaultValues: { weight: "", reps: "", rpe: "", notes: "" },
  });

  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundWorkout = MOCK_WORKOUTS.find((w) => w.id === workoutId);
      if (foundWorkout) {
        setCurrentWorkout(foundWorkout);
        if (!workoutStartTime) { // Set start time only once
            setWorkoutStartTime(new Date());
        }
        try {
          const storedSettings = localStorage.getItem(PROGRESSION_SETTINGS_LOCAL_STORAGE_KEY);
          if (storedSettings) {
            setUserProgressionSettings(JSON.parse(storedSettings));
          }
        } catch (error) {
          console.error("Error loading progression settings:", error);
        }
      } else {
        toast({ title: "Błąd", description: "Nie znaleziono treningu.", variant: "destructive" });
        router.push("/workout/start");
      }
      setIsLoading(false);
    }, 500);
  }, [workoutId, router, toast, workoutStartTime]); // Added workoutStartTime to deps

  React.useEffect(() => {
    if (!workoutStartTime || isResting) return; 
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [workoutStartTime, isResting]);

  React.useEffect(() => {
    if (isResting && restTimer > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimer((prev) => prev - 1);
      }, 1000);
    } else if (restTimer <= 0 && isResting) {
      setIsResting(false);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      toast({ title: "Koniec odpoczynku!", description: "Czas na następną serię!", variant: "default" });
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isResting, restTimer, toast]);

  const currentExercise = currentWorkout?.exercises[currentExerciseIndex];
  const currentExerciseDetails = currentExercise ? MOCK_EXERCISES_DATABASE.find(ex => ex.id === currentExercise.id) : null;
  const currentExerciseTrackingType = currentExercise ? getExerciseTrackingType(currentExercise.name, currentExerciseDetails?.category) : 'weight_reps';


  React.useEffect(() => {
    if (currentExercise) {
      const getSuggestion = (
        exerciseId: string,
        exerciseName: string,
        trackingType: ExerciseTrackingType,
        history: MockPastSession[],
        settings: ProgressionSettings | null
      ): ProgressionSuggestion | null => {
        
        const noSuggestion = { 
          suggestionText: "Brak sugestii dla tego typu ćwiczenia lub ustawień.",
          reasoning: "Modele progresji są głównie dla ćwiczeń siłowych (ciężar/powtórzenia)."
        };

        if (!settings?.enableProgression) {
          return { 
            suggestionText: "Sugestie progresji są wyłączone w ustawieniach.",
            reasoning: "Aby włączyć, przejdź do Ustawienia > Ustawienia Progresji Obciążenia."
          };
        }
        
        if (trackingType === 'time' || trackingType === 'distance') {
            return {
                suggestionText: `Dla ${exerciseName}: skup się na poprawie wyniku z ostatniego razu lub celuj w ${currentExercise.defaultReps || 'założony cel'}.`,
                reasoning: "Automatyczne sugestie dla ćwiczeń na czas/dystans - wkrótce!"
            };
        }

        const relevantSessions = history
          .filter(session => session.exerciseId === exerciseId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let baseSuggestionText = "Pierwszy raz to ćwiczenie? Daj z siebie wszystko i zanotuj wyniki!";
        let baseReasoning = "Brak historii dla tego ćwiczenia lub zastosowano domyślną sugestię.";
        let suggestedValues: ProgressionSuggestion['suggestedValues'] = undefined;

        if (relevantSessions.length > 0) {
          const lastSession = relevantSessions[0];
          const lastSet = lastSession.setsPerformed[0]; 
          if (lastSet) {
            const lastWeight = lastSet.weight;
            const lastReps = lastSet.reps;
            const datePerformed = new Date(lastSession.date).toLocaleDateString('pl-PL');
            
            baseReasoning = `Na podstawie ostatniego treningu z ${datePerformed} (${lastWeight}${typeof lastWeight === 'number' ? 'kg' : ''} x ${lastReps} powt.)`;

            if (settings.selectedModel === "linear_weight" && typeof lastWeight === 'number' && typeof lastReps === 'number') {
              const increment = settings.linearWeightIncrement || 2.5;
              suggestedValues = { weight: lastWeight + increment, reps: lastReps };
              baseSuggestionText = `Sugestia (Liniowa - Ciężar): Spróbuj ${suggestedValues.weight}kg x ${suggestedValues.reps} powt.`;
              baseReasoning += ` i modelu progresji 'Liniowa (Ciężar)' (+${increment}kg).`;
            } else if (settings.selectedModel === "linear_reps" && typeof lastReps === 'number') {
              const increment = settings.linearRepsIncrement || 1;
              suggestedValues = { weight: lastWeight, reps: lastReps + increment };
              baseSuggestionText = `Sugestia (Liniowa - Powtórzenia): Spróbuj ${suggestedValues.weight}${typeof suggestedValues.weight === 'number' ? 'kg' : ''} x ${suggestedValues.reps} powt.`;
              baseReasoning += ` i modelu progresji 'Liniowa (Powtórzenia)' (+${increment} powt.).`;
            } else if (settings.selectedModel === "double_progression" && settings.doubleProgressionRepRange) {
                const [minReps, maxReps] = (settings.doubleProgressionRepRange.split('-').map(Number) || [8,12]);
                if (typeof lastWeight === 'number' && typeof lastReps === 'number' && lastReps >= maxReps) {
                    const weightIncrement = settings.doubleProgressionWeightIncrement || 2.5;
                    suggestedValues = {weight: lastWeight + weightIncrement, reps: minReps};
                    baseSuggestionText = `Sugestia (Podwójna Progresja): Osiągnięto max powt. (${lastReps}). Spróbuj ${suggestedValues.weight}kg x ${suggestedValues.reps} powt.`;
                    baseReasoning += ` i modelu 'Podwójna Progresja'. Osiągnięto górny zakres powtórzeń, zwiększ ciężar o ${weightIncrement}kg i celuj w ${minReps} powt.`;
                } else {
                    suggestedValues = {weight: lastWeight, reps: lastReps}; 
                    baseSuggestionText = `Sugestia (Podwójna Progresja): Celuj w ${settings.doubleProgressionRepRange} powt. z ${lastWeight}${typeof lastWeight === 'number' ? 'kg' : ''}.`;
                    baseReasoning += ` i modelu 'Podwójna Progresja'. Celuj w zakres ${settings.doubleProgressionRepRange} powt.`;
                }
            } else {
                 baseSuggestionText = `Ostatnio (${datePerformed}): ${lastWeight}${typeof lastWeight === 'number' ? 'kg' : ''} x ${lastReps} powt. Dostosuj parametry.`;
            }
          }
        }
        return { suggestionText: baseSuggestionText, suggestedValues, reasoning: baseReasoning };
      };
      setProgressionSuggestion(getSuggestion(currentExercise.id, currentExercise.name, currentExerciseTrackingType, MOCK_WORKOUT_HISTORY_FOR_SUGGESTIONS, userProgressionSettings));
      
      if (!editingSetInfo || editingSetInfo.exerciseId !== currentExercise.id) {
        setEditingSetInfo(null); 
        const setsForThisExercise = recordedSets[currentExercise.id] || [];
        const lastSetForThisExercise = setsForThisExercise[setsForThisExercise.length -1];
        
        let defaultWeight = "";
        if (currentExerciseTrackingType === 'weight_reps' || currentExerciseTrackingType === 'reps_only') {
            defaultWeight = lastSetForThisExercise?.weight?.toString() || "";
        } else if (currentExerciseTrackingType === 'time' || currentExerciseTrackingType === 'distance') {
            defaultWeight = lastSetForThisExercise?.weight?.toString() || "N/A"; // Or "" if intensity isn't usually logged
        }

        setForm.reset({
          weight: defaultWeight,
          reps: "", // Reps/Time/Distance always cleared for new set
          rpe: "",
          notes: ""
        });
      }
    }
  }, [currentExercise, recordedSets, userProgressionSettings, editingSetInfo, setForm, currentExerciseTrackingType]);


  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? String(hours).padStart(2, "0") + ":" : ""}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleSaveSetSubmit = (values: SetFormValues) => {
    if (!currentExercise) return;

    const setEntry: Omit<RecordedSet, 'setNumber'> = {
      weight: (currentExerciseTrackingType === 'time' || currentExerciseTrackingType === 'distance') && (!values.weight || values.weight.trim() === "") ? "N/A" : values.weight || "N/A",
      reps: values.reps, // Already validated as string min 1
      rpe: values.rpe ? Number(values.rpe) : undefined,
      notes: values.notes || undefined,
    };

    if (editingSetInfo && editingSetInfo.exerciseId === currentExercise.id) {
      const updatedSetsForExercise = [...(recordedSets[currentExercise.id] || [])];
      updatedSetsForExercise[editingSetInfo.setIndex] = {
        ...updatedSetsForExercise[editingSetInfo.setIndex], 
        ...setEntry,
      };
      setRecordedSets(prev => ({
        ...prev,
        [currentExercise.id]: updatedSetsForExercise,
      }));
      toast({ title: "Seria zaktualizowana!" });
      setEditingSetInfo(null); 
      
      let defaultWeightForNext = String(setEntry.weight);
       if ((currentExerciseTrackingType === 'time' || currentExerciseTrackingType === 'distance') && defaultWeightForNext.trim() === "") {
            defaultWeightForNext = "N/A";
       }

      setForm.reset({ weight: defaultWeightForNext, reps: "", rpe: "", notes: "" });

    } else {
      const newSet: RecordedSet = {
        ...setEntry,
        setNumber: (recordedSets[currentExercise.id]?.length || 0) + 1,
      };
      setRecordedSets((prev) => ({
        ...prev,
        [currentExercise.id]: [...(prev[currentExercise.id] || []), newSet],
      }));
      
      let defaultWeightForNext = String(newSet.weight);
      if ((currentExerciseTrackingType === 'time' || currentExerciseTrackingType === 'distance') && defaultWeightForNext.trim() === "") {
            defaultWeightForNext = "N/A";
      }
      setForm.reset({ weight: defaultWeightForNext, reps: "", rpe: "", notes: "" });

      const restDuration = currentExercise.defaultRest || DEFAULT_REST_TIME;
      setRestTimer(restDuration);
      setIsResting(true);
      toast({
        title: `Seria ${newSet.setNumber} zapisana!`,
        description: `Rozpoczynam ${restDuration}s odpoczynku.`,
      });
    }
  };
  
  const handleStartEditSet = (exerciseId: string, setIndex: number) => {
    const setBeingEdited = recordedSets[exerciseId]?.[setIndex];
    if (setBeingEdited) {
      setEditingSetInfo({ exerciseId, setIndex, setData: { ...setBeingEdited } });
      setForm.reset({
        weight: String(setBeingEdited.weight),
        reps: String(setBeingEdited.reps),
        rpe: setBeingEdited.rpe ? String(setBeingEdited.rpe) : "",
        notes: setBeingEdited.notes || ""
      });
      setIsResting(false); 
      if(restIntervalRef.current) clearInterval(restIntervalRef.current);
      setRestTimer(0);
    }
  };

  const handleCancelEdit = () => {
    setEditingSetInfo(null);
    const setsForThisExercise = currentExercise ? recordedSets[currentExercise.id] || [] : [];
    const lastSetForThisExercise = setsForThisExercise[setsForThisExercise.length -1];
    
    let defaultWeight = "";
    if (currentExerciseTrackingType === 'weight_reps' || currentExerciseTrackingType === 'reps_only') {
        defaultWeight = lastSetForThisExercise?.weight?.toString() || "";
    } else if (currentExerciseTrackingType === 'time' || currentExerciseTrackingType === 'distance') {
        defaultWeight = lastSetForThisExercise?.weight?.toString() || "N/A";
    }

    setForm.reset({
        weight: defaultWeight,
        reps: "",
        rpe: "",
        notes: ""
    });
  };

  const handleDeleteSet = (exerciseId: string, setIndexToDelete: number) => {
    setRecordedSets((prev) => {
      const setsForExercise = prev[exerciseId] || [];
      const updatedSets = setsForExercise
        .filter((_, index) => index !== setIndexToDelete)
        .map((s, i) => ({ ...s, setNumber: i + 1 })); 
      return {
        ...prev,
        [exerciseId]: updatedSets,
      };
    });
    if (editingSetInfo && editingSetInfo.exerciseId === exerciseId && editingSetInfo.setIndex === setIndexToDelete) {
      handleCancelEdit(); 
    } else if (editingSetInfo && editingSetInfo.exerciseId === exerciseId && editingSetInfo.setIndex > setIndexToDelete) {
      // Adjust the index of the set being edited if a preceding set is deleted
      setEditingSetInfo(info => info ? ({ ...info, setIndex: info.setIndex - 1 }) : null);
    }
    toast({
      title: "Seria usunięta",
      description: `Seria została pomyślnie usunięta.`,
      variant: "default",
    });
  };

  const handleExerciseNotesChange = (exerciseId: string, notes: string) => {
    setExerciseNotes(prev => ({ ...prev, [exerciseId]: notes }));
  };

  const handleSkipRest = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setIsResting(false);
    setRestTimer(0);
    toast({ title: "Odpoczynek pominięty", variant: "default" });
  };

  const handleNextExercise = () => {
    if (currentWorkout && currentExerciseIndex < currentWorkout.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setIsResting(false); 
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      setRestTimer(0);
      setEditingSetInfo(null); 
    } else {
      toast({ title: "To ostatnie ćwiczenie!", description: "Możesz teraz zakończyć trening.", variant: "default"});
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setIsResting(false); 
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      setRestTimer(0);
      setEditingSetInfo(null); 
    }
  };

  const handleFinishWorkout = () => {
    setIsLoading(true); 
    if (!currentWorkout || !workoutStartTime) {
        toast({ title: "Błąd", description: "Nie można zakończyć treningu.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    const summaryData = {
        workoutId: currentWorkout.id, 
        workoutName: currentWorkout.name,
        startTime: workoutStartTime.toISOString(),
        endTime: new Date().toISOString(),
        totalTimeSeconds: elapsedTime,
        recordedSets: recordedSets,
        exercises: currentWorkout.exercises, 
        exerciseNotes: exerciseNotes,
    };

    try {
        localStorage.setItem('workoutSummaryData', JSON.stringify(summaryData));
        toast({
            title: "Trening Zakończony!",
            description: "Przekierowuję do podsumowania...",
            variant: "default",
        });
        router.push(`/workout/summary`); 
    } catch (error) {
        console.error("Error saving summary data to localStorage:", error);
        toast({ title: "Błąd zapisu", description: "Nie udało się zapisać danych do podsumowania.", variant: "destructive"});
        setIsLoading(false); 
    }
  };
  
  const handleApplySuggestion = () => {
    if (progressionSuggestion?.suggestedValues) {
      const { weight, reps } = progressionSuggestion.suggestedValues;
      if (weight !== undefined && (currentExerciseTrackingType === 'weight_reps' || currentExerciseTrackingType === 'reps_only')) {
        setForm.setValue('weight', String(weight));
      }
      if (reps !== undefined) {
        setForm.setValue('reps', String(reps));
      }
      toast({ title: "Sugestia zastosowana!", description: "Pola formularza zostały zaktualizowane." });
    }
  };

  const handleShowReasoning = () => {
    if (progressionSuggestion?.reasoning) {
      toast({
        title: "Logika Sugestii",
        description: progressionSuggestion.reasoning,
        duration: 10000, 
      });
    }
  };

  const getSetFormFieldLabel = (fieldName: 'weight' | 'reps'): string => {
    if (fieldName === 'weight') {
      switch (currentExerciseTrackingType) {
        case 'time':
        case 'distance':
          return "Intensywność / Poziom (opcjonalne)";
        case 'reps_only':
          return "Obciążenie Dodatkowe (kg/opis, opcjonalne)";
        default: // weight_reps or other
          return "Ciężar (kg/opis)";
      }
    } else { // reps field
      switch (currentExerciseTrackingType) {
        case 'time':
          return "Czas Trwania";
        case 'distance':
          return "Dystans";
        default: // weight_reps, reps_only or other
          return "Powtórzenia";
      }
    }
  };

 const getSetFormFieldPlaceholder = (fieldName: 'weight' | 'reps'): string => {
    if (fieldName === 'weight') {
      switch (currentExerciseTrackingType) {
        case 'time':
        case 'distance':
          return "np. Poziom 5, 150W";
        case 'reps_only':
          return "np. BW, +10kg";
        default:
          return "np. 50 lub BW";
      }
    } else { // reps field
      const defaultReps = currentExercise?.defaultReps;
      if (defaultReps) return defaultReps;
      switch (currentExerciseTrackingType) {
        case 'time':
          return "np. 30s, 2min30s";
        case 'distance':
          return "np. 5km, 1000m";
        default:
          return "np. 10 lub Max";
      }
    }
  };


  if (isLoading && !currentWorkout ) { 
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Ładowanie treningu...</p>
      </div>
    );
  }
  
  if (!currentWorkout || !currentExercise) {
    return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Błąd Treningu</AlertTitle>
                <AlertDescription>Nie można załadować danych treningu. Spróbuj ponownie.</AlertDescription>
                 <Button onClick={() => router.push("/workout/start")} className="mt-4">Wróć do wyboru</Button>
            </Alert>
        </div>
    );
  }

  const exerciseProgress = ((currentExerciseIndex + 1) / currentWorkout.exercises.length) * 100;
  const setsForCurrentExercise = recordedSets[currentExercise.id] || [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" asChild>
                <Link href="/workout/start" aria-label="Wróć do wyboru treningów">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            <Dumbbell className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold truncate max-w-xs sm:max-w-md" title={currentWorkout.name}>
              {currentWorkout.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isLoading && currentWorkout != null}>
                  <Square className="mr-2 h-4 w-4" /> Zakończ
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Zakończyć trening?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz zakończyć obecny trening? Postęp zostanie zapisany.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading && currentWorkout != null}>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFinishWorkout} disabled={isLoading && currentWorkout != null}>
                    {(isLoading && currentWorkout != null) ? <Loader2 className="animate-spin mr-2"/> : null}
                    Potwierdź i zakończ
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Ćwiczenie {currentExerciseIndex + 1} z {currentWorkout.exercises.length}</span>
              <span>{Math.round(exerciseProgress)}%</span>
            </div>
            <Progress value={exerciseProgress} className="h-2" />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                {currentExercise.name}
              </CardTitle>
              {currentExerciseDetails?.category && (
                <CardDescription>Kategoria: {currentExerciseDetails.category} (Typ śledzenia: {currentExerciseTrackingType})</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {currentExerciseDetails?.instructions && (
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1" className="border-b-0">
                          <AccordionTrigger className="text-sm hover:no-underline py-2">
                              <Info className="mr-2 h-4 w-4"/> Pokaż instrukcje
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm pb-2">
                              {currentExerciseDetails.instructions}
                              {currentExerciseDetails.videoUrl && (
                                  <a href={currentExerciseDetails.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block mt-2">
                                      Zobacz wideo
                                  </a>
                              )}
                          </AccordionContent>
                      </AccordionItem>
                  </Accordion>
              )}
               {progressionSuggestion && (
                <Alert variant="default" className="border-primary/50">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-primary">Sugestia Progresji</AlertTitle>
                  <AlertDescription>{progressionSuggestion.suggestionText}</AlertDescription>
                   <div className="mt-3 flex gap-2 items-center">
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleApplySuggestion}
                        disabled={!progressionSuggestion.suggestedValues || currentExerciseTrackingType === 'time' || currentExerciseTrackingType === 'distance'}
                       >
                         <CheckCircle className="mr-2 h-4 w-4"/> Zastosuj sugestię
                       </Button>
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleShowReasoning}
                        disabled={!progressionSuggestion.reasoning}
                        className="h-7 w-7"
                        title="Dlaczego taka sugestia?"
                       >
                         <HelpCircle className="h-4 w-4"/>
                         <span className="sr-only">Dlaczego taka sugestia?</span>
                       </Button>
                   </div>
                </Alert>
              )}
               <div className="space-y-2">
                <Label htmlFor={`exercise-notes-${currentExercise.id}`} className="flex items-center gap-1 text-sm font-medium">
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                  Notatki do ćwiczenia (opcjonalne)
                </Label>
                <Textarea
                  id={`exercise-notes-${currentExercise.id}`}
                  placeholder="Np. jak czułeś to ćwiczenie, na co zwrócić uwagę następnym razem..."
                  value={exerciseNotes[currentExercise.id] || ""}
                  onChange={(e) => handleExerciseNotesChange(currentExercise.id, e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {isResting && !editingSetInfo && (
            <Card className="mb-6 bg-primary/10 border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                  <Timer className="h-6 w-6" /> Odpoczynek
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-6xl font-bold text-primary">{formatTime(restTimer)}</p>
                <Progress value={(restTimer / (currentExercise.defaultRest || DEFAULT_REST_TIME)) * 100} className="h-2 mt-4 bg-primary/20 [&>div]:bg-primary" />
              </CardContent>
              <CardFooter>
                <Button onClick={handleSkipRest} variant="secondary" className="w-full">
                  <SkipForward className="mr-2 h-4 w-4" /> Pomiń odpoczynek
                </Button>
              </CardFooter>
            </Card>
          )}

          {(!isResting || editingSetInfo) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-6 w-6 text-primary" /> 
                  {editingSetInfo ? `Edytuj Serię ${editingSetInfo.setData.setNumber}` : `Rejestruj Serię`}
                  {!editingSetInfo && currentExercise.defaultSets && setsForCurrentExercise.length < currentExercise.defaultSets ?
                    ` (Sugerowana: ${setsForCurrentExercise.length + 1} z ${currentExercise.defaultSets})` :
                    (!editingSetInfo && setsForCurrentExercise.length > 0 ? ` (Seria ${setsForCurrentExercise.length + 1})` : (!editingSetInfo ? ` (Seria 1)`: ''))
                  }
                </CardTitle>
                 {currentExercise.defaultReps && !editingSetInfo && <CardDescription>Sugerowany cel: {currentExercise.defaultReps}</CardDescription>}
              </CardHeader>
              <CardContent>
                <Form {...setForm}>
                  <form onSubmit={setForm.handleSubmit(handleSaveSetSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={setForm.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center"><Weight className="mr-1 h-4 w-4"/>{getSetFormFieldLabel('weight')}</FormLabel>
                            <FormControl>
                              <Input placeholder={getSetFormFieldPlaceholder('weight')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={setForm.control}
                        name="reps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center"><Repeat className="mr-1 h-4 w-4"/>{getSetFormFieldLabel('reps')}</FormLabel>
                            <FormControl>
                              <Input placeholder={getSetFormFieldPlaceholder('reps')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <FormField
                        control={setForm.control}
                        name="rpe"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center"><TrendingUp className="mr-1 h-4 w-4"/>RPE (1-10, opcjonalne)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="np. 8" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={setForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center"><StickyNote className="mr-1 h-4 w-4"/>Notatki do serii (opcjonalne)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Np. Zapas 2 powtórzeń, dobra technika" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button type="submit" className="w-full sm:flex-1" disabled={setForm.formState.isSubmitting}>
                           {setForm.formState.isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4" />}
                          {editingSetInfo ? "Zaktualizuj Serię" : "Zapisz Serię"}
                        </Button>
                        {editingSetInfo && (
                            <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto">
                                <XCircle className="mr-2 h-4 w-4" /> Anuluj Edycję
                            </Button>
                        )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {setsForCurrentExercise.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" /> Zapisane Serie ({setsForCurrentExercise.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {setsForCurrentExercise.map((set, index) => (
                    <li key={`${currentExercise.id}-set-${index}`} className="flex flex-col sm:flex-row justify-between sm:items-start p-3 bg-muted/50 rounded-md text-sm gap-2">
                      <div className="flex-grow">
                        <span className="font-semibold">Seria {set.setNumber}: </span>
                        { (currentExerciseTrackingType === 'weight_reps' || currentExerciseTrackingType === 'reps_only') && <span>{set.weight} x {set.reps} powt.</span> }
                        { currentExerciseTrackingType === 'time' && <span>{getSetFormFieldLabel('reps')}: {set.reps} {set.weight !== 'N/A' && set.weight !== '' ? `(Intensywność: ${set.weight})` : ''}</span> }
                        { currentExerciseTrackingType === 'distance' && <span>{getSetFormFieldLabel('reps')}: {set.reps} {set.weight !== 'N/A' && set.weight !== '' ? `(Intensywność: ${set.weight})` : ''}</span> }
                        {set.rpe && <span className="ml-2 text-muted-foreground">(RPE: {set.rpe})</span>}
                        {set.notes && <p className="text-xs text-muted-foreground mt-1 italic">Notatka: {set.notes}</p>}
                      </div>
                      <div className="flex gap-2 self-start sm:self-center flex-shrink-0">
                         <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => handleStartEditSet(currentExercise.id, index)}
                            aria-label="Edytuj serię"
                            disabled={!!editingSetInfo} 
                          >
                            <Edit3 className="mr-1 h-4 w-4" /> Edytuj
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => currentExercise && handleDeleteSet(currentExercise.id, index)}
                            aria-label="Usuń serię"
                             disabled={!!editingSetInfo} 
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Usuń
                          </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 flex justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={handlePreviousExercise}
              disabled={currentExerciseIndex === 0 || (isLoading && currentWorkout != null) || !!editingSetInfo}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Poprzednie ćwiczenie
            </Button>
            {currentExerciseIndex < currentWorkout.exercises.length - 1 ? (
                 <Button onClick={handleNextExercise} disabled={(isLoading && currentWorkout != null) || !!editingSetInfo} className="bg-primary hover:bg-primary/90">
                    Następne ćwiczenie <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={(isLoading && currentWorkout != null) || !!editingSetInfo} className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="mr-2 h-4 w-4" /> Zakończ Trening i Zapisz
                        </Button>
                    </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Zakończyć trening?</AlertDialogTitle>
                        <AlertDialogDescription>
                            To było ostatnie ćwiczenie. Czy na pewno chcesz zakończyć i zapisać trening?
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading && currentWorkout != null}>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFinishWorkout} disabled={isLoading && currentWorkout != null}>
                            {(isLoading && currentWorkout != null) ? <Loader2 className="animate-spin mr-2"/> : null}
                            Zakończ i Zapisz
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

