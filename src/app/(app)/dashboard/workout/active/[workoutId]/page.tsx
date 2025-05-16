
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
  AlertTriangle,
} from "lucide-react";

import { format, parseISO, isValid as isDateValid } from "date-fns";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
// ProgressionSettings are notionally available for suggestion logic
import type { ProgressionSettings } from "@/context/ProgressionSettingsContext";

// MOCK_EXERCISES_DATABASE and MOCK_WORKOUTS would typically be fetched or come from a global state/DB.
// For this prototype, they are defined here or imported.
const MOCK_EXERCISES_DATABASE: {
  id: string;
  name: string;
  category: string;
  instructions?: string;
  videoUrl?: string;
}[] = [
  {
    id: "ex1",
    name: "Wyciskanie sztangi na ławce płaskiej",
    category: "Klatka",
    instructions:
      "Połóż się na ławce, chwyć sztangę nachwytem szerzej niż barki. Opuść sztangę do klatki piersiowej, a następnie dynamicznie wypchnij w górę.",
  },
  { id: "ex2", name: "Przysiady ze sztangą", category: "Nogi", instructions: "Stań w lekkim rozkroku, sztanga na barkach. Wykonaj przysiad, utrzymując proste plecy, zejdź biodrami poniżej kolan." },
  { id: "ex3", name: "Martwy ciąg", category: "Plecy" },
  { id: "ex4", name: "Podciąganie na drążku", category: "Plecy" },
  { id: "ex5", name: "Pompki", category: "Klatka" },
  { id: "ex6", name: "Bieg na bieżni", category: "Cardio", instructions: "Utrzymuj stałe tempo lub wykonuj interwały." },
  { id: "ex7", name: "Skakanka", category: "Cardio" },
  { id: "ex8", name: "Plank (deska)", category: "Brzuch", instructions: "Oprzyj się na przedramionach i palcach stóp, utrzymując ciało w linii prostej." },
  { id: "ex9", name: "Wyciskanie żołnierskie (OHP)", category: "Barki" },
  { id: "ex10", name: "Uginanie ramion ze sztangą", category: "Ramiona" },
  { id: "ex11", name: "Allahy (brzuszki na wyciągu)", category: "Brzuch" },
  { id: "ex12", name: "Wiosłowanie sztangą", category: "Plecy" },
  { id: "ex13", name: "Wykroki", category: "Nogi" },
  { id: "ex14", name: "Unoszenie hantli bokiem", category: "Barki" },
  { id: "ex15", name: "Francuskie wyciskanie sztangielki", category: "Ramiona" },
  { id: "ex16", name: "Allah Pompki (Modlitewniki)", category: "Brzuch" },
  { id: "ex17", name: "Przysiad bułgarski", category: "Nogi" },
  { id: "ex18", name: "Wyciskanie hantli na ławce skośnej", category: "Klatka"},
  { id: "ex19", name: "Orbitrek (30 min)", category: "Cardio", instructions: "Utrzymuj stałe tempo lub wykonuj interwały."},
  { id: "ex20", name: "Wall sit (60s)", category: "Nogi", instructions: "Oprzyj plecy o ścianę, nogi ugięte pod kątem 90 stopni, jakbyś siedział na krześle."},
];

export interface ExerciseInWorkout {
  id: string;
  name: string;
  defaultSets?: number;
  defaultReps?: string; // e.g., "8-10", "Max", "30s"
  defaultRest?: number; // in seconds
}

export interface Workout {
  id: string;
  name: string;
  exercises: ExerciseInWorkout[];
}

// MOCK_WORKOUTS simulate a list of predefined workouts a user can start.
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
      { id: "ex6", name: "Bieg na bieżni", defaultSets: 1, defaultReps: "30 min", defaultRest: 0 },
      { id: "ex8", name: "Plank (deska)", defaultSets: 3, defaultReps: "60s", defaultRest: 45 },
      { id: "ex5", name: "Pompki", defaultSets: 3, defaultReps: "15-20", defaultRest: 60 },
    ],
  },
];

export interface RecordedSet {
  setNumber: number;
  weight: number | string | "N/A"; // Allow "N/A" for bodyweight or non-weighted exercises
  reps: number | string; // Can be number of reps, or string like "Max", "30s"
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
}

interface EditingSetInfo {
  exerciseId: string;
  setIndex: number;
  setData: RecordedSet; // To store the original data of the set being edited
}

// MOCK_WORKOUT_HISTORY_FOR_SUGGESTIONS simulates past performance data for exercises.
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
];
// Key for storing progression settings in localStorage.
const PROGRESSION_SETTINGS_LOCAL_STORAGE_KEY = "workoutWiseProgressionSettings";
// Key prefix for storing autosaved active workout data in localStorage.
const ACTIVE_WORKOUT_AUTOSAVE_KEY_PREFIX = "activeWorkoutAutosave_";
// Key for storing a custom workout structure temporarily when starting from a plan.
const PENDING_CUSTOM_WORKOUT_KEY = 'pendingCustomWorkoutToStart';

// Zod schema for validating individual set input.
const setFormSchema = z.object({
  weight: z.string().optional(), // Weight can be string (e.g., "BW") or number
  reps: z.string().min(1, "Wartość jest wymagana (np. powtórzenia, czas, dystans)."), // Reps/time/distance
  rpe: z.coerce.number().min(1).max(10).optional().or(z.literal("")), // RPE must be 1-10 or empty
  notes: z.string().optional(),
});

type SetFormValues = z.infer<typeof setFormSchema>;

const DEFAULT_REST_TIME = 60; // Default rest time in seconds if not specified by exercise

// Determines how an exercise should be tracked (e.g., weight & reps, time, distance).
type ExerciseTrackingType = "weight_reps" | "time" | "distance" | "reps_only" | "other";

function getExerciseTrackingType(exerciseName: string, category?: string): ExerciseTrackingType {
  const lowerName = exerciseName.toLowerCase();
  const lowerCategory = category?.toLowerCase();

  if (lowerName.includes("bieg") || lowerName.includes("rower") || lowerName.includes("orbitrek") || lowerName.includes("wiosłowanie") || lowerName.includes("skakanka") || lowerCategory === "cardio") {
    if (lowerName.includes("km") || lowerName.includes("metr") || lowerName.includes("dystans")) return "distance";
    if (lowerName.includes("min") || lowerName.includes("sek") || lowerName.includes("godz") || lowerName.includes("czas")) return "time";
    return "time"; // Default for cardio if not specified
  }
  if (lowerName.includes("plank") || lowerName.includes("deska") || lowerName.includes("wall sit")) return "time";
  if (lowerName.includes("podciąganie") || lowerName.includes("pompki") || lowerName.includes("dipy")) return "reps_only";
  return "weight_reps"; // Default for most strength exercises
}

// Structure for progression suggestions.
interface ProgressionSuggestion {
  suggestionText: string;
  suggestedValues?: { weight?: string | number; reps?: string | number };
  reasoning?: string;
}

// Structure for autosaving workout state.
interface AutoSavedWorkoutState {
  workoutId: string;
  workoutName?: string; // Name of the workout being performed
  recordedSets: Record<string, RecordedSet[]>; // Sets recorded so far
  currentExerciseIndex: number; // Index of the current exercise
  exerciseNotes: Record<string, string>; // Notes for each exercise
  workoutStartTime: string; // ISO string of when the workout started
  elapsedTime: number; // Elapsed time in seconds
  // exercises?: ExerciseInWorkout[]; // Optionally save the exercise list if it can be dynamic
}

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const workoutId = params?.workoutId as string | undefined; // Get workoutId from URL
  // Dynamically create the autosave key based on the workoutId.
  const ACTIVE_WORKOUT_AUTOSAVE_KEY = workoutId ? `${ACTIVE_WORKOUT_AUTOSAVE_KEY_PREFIX}${workoutId}` : '';


  const [isLoading, setIsLoading] = React.useState(true);
  const [currentWorkout, setCurrentWorkout] = React.useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = React.useState(0);
  const [recordedSets, setRecordedSets] = React.useState<Record<string, RecordedSet[]>>({}); // exerciseId -> RecordedSet[]
  const [exerciseNotes, setExerciseNotes] = React.useState<Record<string, string>>({}); // exerciseId -> notes
  const [editingSetInfo, setEditingSetInfo] = React.useState<EditingSetInfo | null>(null);
  const [workoutStartTime, setWorkoutStartTime] = React.useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState(0); // in seconds
  const [restTimer, setRestTimer] = React.useState(0); // in seconds
  const [isResting, setIsResting] = React.useState(false);
  const restIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const [progressionSuggestion, setProgressionSuggestion] = React.useState<ProgressionSuggestion | null>(null);
  const [userProgressionSettings, setUserProgressionSettings] = React.useState<ProgressionSettings | null>(null);
  const [showResumeDialog, setShowResumeDialog] = React.useState(false);
  const [savedWorkoutData, setSavedWorkoutData] = React.useState<AutoSavedWorkoutState | null>(null);

  const setForm = useForm<SetFormValues>({
    resolver: zodResolver(setFormSchema),
    defaultValues: { weight: "", reps: "", rpe: "", notes: "" },
  });

  // Effect for initializing the workout:
  // 1. Checks for a valid workoutId.
  // 2. Tries to load a custom workout passed via PENDING_CUSTOM_WORKOUT_KEY (e.g., from a plan).
  // 3. If no custom workout, checks localStorage for an autosaved session for the current workoutId.
  // 4. If autosaved data found, prompts the user to resume or discard.
  // 5. If no custom or autosaved data, loads the workout from MOCK_WORKOUTS.
  // 6. Loads user's progression settings from localStorage.
  React.useEffect(() => {
    if (!workoutId) {
      toast({ title: "Błąd", description: "Nieprawidłowy identyfikator treningu.", variant: "destructive" });
      router.push("/dashboard/workout/start");
      return;
    }

    setIsLoading(true);
    let workoutDataLoaded = false;

    // Step 1: Try to load custom pending workout (e.g., started from a plan)
    // This data is stored temporarily in localStorage by the plan detail page.
    const customWorkoutString = localStorage.getItem(PENDING_CUSTOM_WORKOUT_KEY);
    if (customWorkoutString) {
      try {
        const customWorkout: Workout = JSON.parse(customWorkoutString);
        // Ensure the pending workout ID matches the current page's workoutId
        if (customWorkout.id === workoutId) {
          setCurrentWorkout(customWorkout);
          if (!workoutStartTime) setWorkoutStartTime(new Date()); // Start timer if not already started
          localStorage.removeItem(PENDING_CUSTOM_WORKOUT_KEY); // Clear after loading
          workoutDataLoaded = true;
        }
      } catch (e) { console.error("Error parsing custom workout:", e); localStorage.removeItem(PENDING_CUSTOM_WORKOUT_KEY); }
    }
    
    // Step 2: If not a custom workout, try to load autosaved data
    // Autosaved data allows resuming a previously interrupted session.
    if (!workoutDataLoaded) {
      try {
        const autoSavedDataString = localStorage.getItem(ACTIVE_WORKOUT_AUTOSAVE_KEY);
        if (autoSavedDataString) {
          const parsedData: AutoSavedWorkoutState = JSON.parse(autoSavedDataString);
           // Check if autosave is for current workout or a specific type of custom-repeat workout
           if (parsedData.workoutId === workoutId || workoutId.startsWith("custom-repeat-")) { 
            setSavedWorkoutData(parsedData);
            setShowResumeDialog(true); // Show dialog to ask user if they want to resume
            // Loading will pause here until user makes a choice in handleResumeWorkout.
            return; 
           } else {
             // Autosave is for a different workout, so remove it.
             localStorage.removeItem(ACTIVE_WORKOUT_AUTOSAVE_KEY);
           }
        }
      } catch (error) { console.error("Error loading autosaved data:", error); localStorage.removeItem(ACTIVE_WORKOUT_AUTOSAVE_KEY); }
    }

    // Step 3: If no custom workout and no resume dialog, load from MOCK_WORKOUTS
    // This is for starting a fresh, predefined workout.
    if (!workoutDataLoaded && !showResumeDialog) {
      const foundWorkout = MOCK_WORKOUTS.find((w) => w.id === workoutId);
      if (foundWorkout) {
        setCurrentWorkout(foundWorkout);
        if (!workoutStartTime) setWorkoutStartTime(new Date()); // Start timer if not already started
        workoutDataLoaded = true;
      }
    }

    // If no workout data could be loaded by any means, show error and redirect.
    if (!workoutDataLoaded) {
      toast({ title: "Błąd", description: "Nie znaleziono treningu.", variant: "destructive" });
      router.push("/dashboard/workout/start");
      return;
    }
    
    // Load user's progression settings from localStorage.
    // These settings influence how progression suggestions are made.
    try {
      const storedSettings = localStorage.getItem(PROGRESSION_SETTINGS_LOCAL_STORAGE_KEY);
      if (storedSettings) setUserProgressionSettings(JSON.parse(storedSettings));
    } catch (error) { console.error("Error loading progression settings:", error); }

    setIsLoading(false);

  }, [workoutId, router, toast, ACTIVE_WORKOUT_AUTOSAVE_KEY, workoutStartTime]); // workoutStartTime dependency is important for re-triggering if it changes.


  // Handles user's choice from the "Resume Workout" dialog.
  const handleResumeWorkout = React.useCallback((resume: boolean) => {
    if (resume && savedWorkoutData) {
      // User chose to resume: load state from savedWorkoutData.
      let baseWorkout = MOCK_WORKOUTS.find(w => w.id === savedWorkoutData.workoutId);
      
      // If currentWorkout is not set, or if it's different from the one in savedWorkoutData,
      // try to set it from MOCK_WORKOUTS. This handles resuming standard predefined workouts.
      if (!currentWorkout || (baseWorkout && currentWorkout.id !== baseWorkout.id)) {
        setCurrentWorkout(baseWorkout || null); // Set to null if baseWorkout is somehow not found (shouldn't happen with valid autosave)
      }
      // For custom-repeat workouts, currentWorkout should have been set from PENDING_CUSTOM_WORKOUT_KEY
      // logic before this resume dialog was even shown. If not, it's an edge case.
      // The name and exercises from savedWorkoutData might be more reliable if currentWorkout is minimal.

      setRecordedSets(savedWorkoutData.recordedSets);
      setCurrentExerciseIndex(savedWorkoutData.currentExerciseIndex);
      setExerciseNotes(savedWorkoutData.exerciseNotes);
      if (savedWorkoutData.workoutStartTime && isDateValid(parseISO(savedWorkoutData.workoutStartTime))) {
        setWorkoutStartTime(parseISO(savedWorkoutData.workoutStartTime));
      } else if (!workoutStartTime) {
        // Fallback if saved time is invalid and no startTime is set yet
        setWorkoutStartTime(new Date());
      }
      setElapsedTime(savedWorkoutData.elapsedTime);
      toast({ title: "Trening wznowiony." });
    } else {
      // User chose to discard or no valid saved data: start fresh.
      clearAutoSavedWorkout(); // Clear any existing autosave.
      toast({ title: "Poprzedni postęp odrzucony.", description: "Rozpoczynanie nowego treningu." });
      // If it wasn't a custom-repeat workout (which would have been loaded via PENDING_CUSTOM_WORKOUT_KEY),
      // reload it from MOCK_WORKOUTS.
      if (!workoutId?.startsWith("custom-repeat-")) {
        const foundWorkout = MOCK_WORKOUTS.find((w) => w.id === workoutId);
        if (foundWorkout) {
          setCurrentWorkout(foundWorkout);
          if (!workoutStartTime) setWorkoutStartTime(new Date()); // Ensure start time is set for a new session
          // Reset workout-specific states
          setRecordedSets({});
          setCurrentExerciseIndex(0);
          setExerciseNotes({});
          setElapsedTime(0);
        }
      } else if (currentWorkout && !workoutStartTime) {
          // This case handles if a custom-repeat workout was loaded (currentWorkout is set)
          // but the user chose to discard autosave, and workoutStartTime wasn't set.
          setWorkoutStartTime(new Date());
          setRecordedSets({});
          setCurrentExerciseIndex(0);
          setExerciseNotes({});
          setElapsedTime(0);
      }
    }
    setShowResumeDialog(false);
    setSavedWorkoutData(null); // Clear the temporary saved data state
    setIsLoading(false); // Ensure loading is false after decision
  }, [savedWorkoutData, ACTIVE_WORKOUT_AUTOSAVE_KEY, toast, workoutId, currentWorkout, workoutStartTime, clearAutoSavedWorkout]);


  // Clears the autosaved workout data from localStorage.
  const clearAutoSavedWorkout = React.useCallback(() => {
    if (ACTIVE_WORKOUT_AUTOSAVE_KEY) {
      localStorage.removeItem(ACTIVE_WORKOUT_AUTOSAVE_KEY);
    }
  }, [ACTIVE_WORKOUT_AUTOSAVE_KEY]);

  // Effect for autosaving the current workout state to localStorage.
  // This runs whenever key workout states change, ensuring progress isn't lost.
  React.useEffect(() => {
    // Only autosave if not loading, a workout is active, a start time exists, and an autosave key is defined.
    if (!isLoading && currentWorkout && workoutStartTime && ACTIVE_WORKOUT_AUTOSAVE_KEY) {
      const autoSaveData: AutoSavedWorkoutState = {
        workoutId: currentWorkout.id,
        workoutName: currentWorkout.name,
        recordedSets,
        currentExerciseIndex,
        exerciseNotes,
        workoutStartTime: workoutStartTime.toISOString(),
        elapsedTime,
        // Optionally, could save currentWorkout.exercises if they might be dynamically generated or altered during the session.
      };
      localStorage.setItem(ACTIVE_WORKOUT_AUTOSAVE_KEY, JSON.stringify(autoSaveData));
    }
  }, [recordedSets, currentExerciseIndex, exerciseNotes, workoutStartTime, elapsedTime, isLoading, currentWorkout, ACTIVE_WORKOUT_AUTOSAVE_KEY]);

  // Effect for managing the main workout timer (elapsedTime).
  React.useEffect(() => {
    // Timer runs if workout has started, not resting, not loading, a workout is loaded, and resume dialog isn't shown.
    if (!workoutStartTime || isResting || isLoading || !currentWorkout || showResumeDialog) return;
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timerInterval); // Cleanup on unmount or when dependencies change
  }, [workoutStartTime, isResting, isLoading, currentWorkout, showResumeDialog]);

  // Effect for managing the rest timer.
  React.useEffect(() => {
    if (isResting && restTimer > 0) {
      restIntervalRef.current = setInterval(() => setRestTimer((prev) => prev - 1), 1000);
    } else if (restTimer <= 0 && isResting) {
      // Rest finished
      setIsResting(false);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      toast({ title: "Koniec odpoczynku!", description: "Czas na następną serię!", variant: "default" });
    }
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); }; // Cleanup
  }, [isResting, restTimer, toast]);

  const currentExercise = currentWorkout?.exercises[currentExerciseIndex];
  const currentExerciseDetails = currentExercise ? MOCK_EXERCISES_DATABASE.find((ex) => ex.id === currentExercise.id) : null;
  const currentExerciseTrackingType = currentExercise ? getExerciseTrackingType(currentExercise.name, currentExerciseDetails?.category) : "weight_reps";

  // Effect for generating progression suggestions when the current exercise changes.
  // It uses user settings and mock history to provide guidance.
  React.useEffect(() => {
    if (currentExercise && !isLoading && !showResumeDialog) { // Ensure not loading and dialog is not active
        // This function simulates a backend/AI call to get progression suggestions.
        const getSuggestion = (
            exerciseId: string,
            exerciseName: string,
            trackingType: ExerciseTrackingType,
            history: MockPastSession[],
            settings: ProgressionSettings | null
        ): ProgressionSuggestion | null => {
            // Default suggestion if progression is off or no history/model selected.
            if (!settings?.enableProgression) return { suggestionText: "Sugestie progresji są wyłączone.", reasoning: "Aby włączyć, przejdź do Ustawienia > Modelowanie Progresji Obciążenia." };
            
            let baseSuggestionText = "Pierwszy raz to ćwiczenie? Daj z siebie wszystko!";
            let baseReasoning = "Brak historii dla tego ćwiczenia lub nie wybrano modelu progresji.";
            let suggestedValues: ProgressionSuggestion["suggestedValues"] = undefined;

            // For time/distance exercises, suggestions are more general.
            if (trackingType === "time" || trackingType === "distance") {
                 baseSuggestionText = `Dla ${exerciseName}: skup się na poprawie wyniku z ostatniego razu lub celuj w ${currentExercise.defaultReps || "założony cel"}.`;
                 baseReasoning = "Automatyczne sugestie dla ćwiczeń na czas/dystans są ogólne.";
                 // Check last performance if history exists.
                 const relevantSessions = history.filter(s => s.exerciseId === exerciseId).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
                 if (relevantSessions.length > 0) {
                    const lastVal = relevantSessions[0].setsPerformed[0]?.reps; // Assuming 'reps' field holds time/distance for these types
                    if(lastVal) baseSuggestionText = `Ostatnio: ${lastVal}. Spróbuj pobić ten wynik!`;
                 }
                return { suggestionText: baseSuggestionText, reasoning: baseReasoning };
            }

            // For weight/reps based exercises:
            const relevantSessions = history.filter(s => s.exerciseId === exerciseId).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

            if (relevantSessions.length > 0) {
                const lastSession = relevantSessions[0];
                const lastSet = lastSession.setsPerformed[0]; // Simplification: considering first set of last relevant session for suggestion.
                if (lastSet) {
                    const lastWeight = lastSet.weight;
                    const lastReps = lastSet.reps;
                    const datePerformed = format(parseISO(lastSession.date), "PPP", {locale: pl});
                    baseReasoning = `Na podstawie ostatniego treningu z ${datePerformed} (${lastWeight}${typeof lastWeight === 'number' ? 'kg' : ''} x ${lastReps} powt.)`;

                    // Apply selected progression model
                    if (settings.selectedModel === "linear_weight" && typeof lastWeight === 'number' && typeof lastReps === 'number') {
                        const increment = settings.linearWeightIncrement || 2.5; // Default increment if not set
                        suggestedValues = { weight: lastWeight + increment, reps: lastReps };
                        baseSuggestionText = `Sugestia (Liniowa - Ciężar): Spróbuj ${suggestedValues.weight}kg x ${suggestedValues.reps} powt.`;
                        baseReasoning += ` i modelu 'Liniowa (Ciężar)' (+${increment}kg). Warunek: ${settings.linearWeightCondition || "brak"}`;
                    } else if (settings.selectedModel === "linear_reps" && typeof lastReps === 'number') {
                        const increment = settings.linearRepsIncrement || 1;
                        suggestedValues = { weight: lastWeight, reps: lastReps + increment };
                        baseSuggestionText = `Sugestia (Liniowa - Powtórzenia): Spróbuj ${suggestedValues.weight}${typeof suggestedValues.weight === 'number' ? 'kg': ''} x ${suggestedValues.reps} powt.`;
                        baseReasoning += ` i modelu 'Liniowa (Powtórzenia)' (+${increment} powt.). Warunek: ${settings.linearRepsCondition || "brak"}`;
                    } else if (settings.selectedModel === "double_progression" && settings.doubleProgressionRepRange) {
                        const [minRepsStr, maxRepsStr] = settings.doubleProgressionRepRange.split('-');
                        const minReps = parseInt(minRepsStr, 10);
                        const maxReps = parseInt(maxRepsStr, 10);
                        if (typeof lastWeight === 'number' && typeof lastReps === 'number' && !isNaN(minReps) && !isNaN(maxReps)) {
                            if (lastReps >= maxReps) { // If max reps hit, increase weight
                                const weightIncrement = settings.doubleProgressionWeightIncrement || 2.5;
                                suggestedValues = { weight: lastWeight + weightIncrement, reps: minReps };
                                baseSuggestionText = `Sugestia (Podwójna Prog.): Osiągnięto max powt. (${lastReps}). Spróbuj ${suggestedValues.weight}kg x ${suggestedValues.reps} powt.`;
                                baseReasoning += ` i modelu 'Podwójna Progresja'. Zwiększ ciężar o ${weightIncrement}kg, celuj w ${minReps} powt.`;
                            } else { // Else, increase reps
                                suggestedValues = { weight: lastWeight, reps: lastReps + (settings.linearRepsIncrement || 1) };
                                baseSuggestionText = `Sugestia (Podwójna Prog.): Celuj w ${minReps}-${maxReps} powt. z ${lastWeight}kg. Spróbuj o ${settings.linearRepsIncrement || 1} powt. więcej.`;
                                baseReasoning += ` i modelu 'Podwójna Progresja'. Celuj w zakres ${settings.doubleProgressionRepRange} powt.`;
                            }
                        } else {
                             baseSuggestionText = `Ostatnio (${datePerformed}): ${lastWeight}${typeof lastWeight === 'number' ? 'kg' : ''} x ${lastReps} powt. Skonfiguruj Podwójną Progresję.`;
                             baseReasoning += `. Upewnij się, że zakres powtórzeń i przyrost są zdefiniowane.`;
                        }
                    } else { // No specific model matched or model is 'none'
                         baseSuggestionText = `Ostatnio (${datePerformed}): ${lastWeight}${typeof lastWeight === 'number' ? 'kg' : ''} x ${lastReps} powt. Dostosuj. Nie wybrano modelu progresji.`;
                         baseReasoning += `. Sprawdź Ustawienia Progresji.`;
                    }
                }
            }
            return { suggestionText: baseSuggestionText, suggestedValues, reasoning: baseReasoning };
        };
      setProgressionSuggestion(getSuggestion(currentExercise.id, currentExercise.name, currentExerciseTrackingType, MOCK_WORKOUT_HISTORY_FOR_SUGGESTIONS, userProgressionSettings));

      // Reset set form if not editing or if exercise changed
      if (!editingSetInfo || editingSetInfo.exerciseId !== currentExercise.id) {
        setEditingSetInfo(null); // Clear any previous editing state
        const setsForThisExercise = recordedSets[currentExercise.id] || [];
        const lastSetForThisExercise = setsForThisExercise[setsForThisExercise.length - 1];
        // Set default weight for the form based on the last recorded set for this exercise
        let defaultWeight = "";
        if (currentExerciseTrackingType === "weight_reps" || currentExerciseTrackingType === "reps_only") {
            defaultWeight = lastSetForThisExercise?.weight?.toString() || "";
        } else if (currentExerciseTrackingType === "time" || currentExerciseTrackingType === "distance") {
            defaultWeight = lastSetForThisExercise?.weight?.toString() || "N/A"; // For intensity/level
        }
        setForm.reset({ weight: defaultWeight, reps: "", rpe: "", notes: "" });
      }
    }
  }, [currentExercise, recordedSets, userProgressionSettings, editingSetInfo, setForm, currentExerciseTrackingType, isLoading, showResumeDialog]); // Added isLoading and showResumeDialog

  // Helper to format time for display (HH:MM:SS or MM:SS).
  const formatTimeDisplay = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? String(hours).padStart(2, "0") + ":" : ""}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Handles saving a new set or updating an existing one.
  const handleSaveSetSubmit = (values: SetFormValues) => {
    if (!currentExercise) return;
    const setEntry: Omit<RecordedSet, "setNumber"> = {
      weight: (currentExerciseTrackingType === "time" || currentExerciseTrackingType === "distance") && (!values.weight || values.weight.trim() === "") ? "N/A" : values.weight || "N/A",
      reps: values.reps, // This holds value for reps, time, or distance
      rpe: values.rpe ? Number(values.rpe) : undefined,
      notes: values.notes || undefined,
    };

    if (editingSetInfo && editingSetInfo.exerciseId === currentExercise.id) {
      // Update existing set
      const updatedSetsForExercise = [...(recordedSets[currentExercise.id] || [])];
      updatedSetsForExercise[editingSetInfo.setIndex] = { ...updatedSetsForExercise[editingSetInfo.setIndex], ...setEntry };
      setRecordedSets((prev) => ({ ...prev, [currentExercise.id]: updatedSetsForExercise }));
      toast({ title: "Seria zaktualizowana!" });
      setEditingSetInfo(null); // Exit editing mode
      // Reset form to defaults for next new set, using the just-edited set's weight as a base
      let defaultWeightForNext = String(setEntry.weight);
      if((currentExerciseTrackingType === "time" || currentExerciseTrackingType === "distance") && defaultWeightForNext.trim() === "") defaultWeightForNext = "N/A";
      setForm.reset({ weight: defaultWeightForNext, reps: "", rpe: "", notes: "" });
    } else {
      // Add new set
      const newSet: RecordedSet = { ...setEntry, setNumber: (recordedSets[currentExercise.id]?.length || 0) + 1 };
      setRecordedSets((prev) => ({ ...prev, [currentExercise.id]: [...(prev[currentExercise.id] || []), newSet] }));
      // Reset form for next set, using new set's weight as default for next
      let defaultWeightForNext = String(newSet.weight);
      if((currentExerciseTrackingType === "time" || currentExerciseTrackingType === "distance") && defaultWeightForNext.trim() === "") defaultWeightForNext = "N/A";
      setForm.reset({ weight: defaultWeightForNext, reps: "", rpe: "", notes: "" });
      // Start rest timer
      const restDuration = currentExercise.defaultRest || DEFAULT_REST_TIME;
      setRestTimer(restDuration);
      setIsResting(true);
      toast({ title: `Seria ${newSet.setNumber} zapisana!`, description: `Rozpoczynam ${restDuration}s odpoczynku.` });
    }
  };

  // Initiates editing of a previously recorded set.
  const handleStartEditSet = (exerciseId: string, setIndex: number) => {
    const setBeingEdited = recordedSets[exerciseId]?.[setIndex];
    if (setBeingEdited) {
      setEditingSetInfo({ exerciseId, setIndex, setData: { ...setBeingEdited } }); // Store original data
      // Populate form with the data of the set being edited.
      setForm.reset({ weight: String(setBeingEdited.weight), reps: String(setBeingEdited.reps), rpe: setBeingEdited.rpe ? String(setBeingEdited.rpe) : "", notes: setBeingEdited.notes || "" });
      // Stop rest timer if it was running
      setIsResting(false);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      setRestTimer(0);
    }
  };

  // Cancels editing a set and resets the form.
  const handleCancelEdit = () => {
    setEditingSetInfo(null);
    // Reset form to defaults (e.g., based on last set if any, or empty)
    const setsForThisExercise = currentExercise ? recordedSets[currentExercise.id] || [] : [];
    const lastSetForThisExercise = setsForThisExercise[setsForThisExercise.length - 1];
    let defaultWeight = "";
    if (currentExerciseTrackingType === "weight_reps" || currentExerciseTrackingType === "reps_only") defaultWeight = lastSetForThisExercise?.weight?.toString() || "";
    else if (currentExerciseTrackingType === "time" || currentExerciseTrackingType === "distance") defaultWeight = lastSetForThisExercise?.weight?.toString() || "N/A";
    setForm.reset({ weight: defaultWeight, reps: "", rpe: "", notes: "" });
  };

  // Deletes a specific set for an exercise.
  const handleDeleteSet = (exerciseId: string, setIndexToDelete: number) => {
    setRecordedSets((prev) => {
      const setsForExercise = prev[exerciseId] || [];
      const updatedSets = setsForExercise.filter((_, index) => index !== setIndexToDelete).map((s, i) => ({ ...s, setNumber: i + 1 })); // Renumber sets
      return { ...prev, [exerciseId]: updatedSets };
    });
    // If the deleted set was being edited, cancel edit mode.
    if (editingSetInfo && editingSetInfo.exerciseId === exerciseId && editingSetInfo.setIndex === setIndexToDelete) handleCancelEdit();
    // If a later set was being edited, adjust its index.
    else if (editingSetInfo && editingSetInfo.exerciseId === exerciseId && editingSetInfo.setIndex > setIndexToDelete) setEditingSetInfo((info) => info ? { ...info, setIndex: info.setIndex - 1 } : null);
    toast({ title: "Seria usunięta", variant: "default" });
  };

  const handleExerciseNotesChange = (exerciseId: string, notes: string) => setExerciseNotes((prev) => ({ ...prev, [exerciseId]: notes }));
  const handleSkipRest = () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); setIsResting(false); setRestTimer(0); toast({ title: "Odpoczynek pominięty", variant: "default" }); };

  // Navigates to the next exercise in the workout.
  const handleNextExercise = () => {
    if (currentWorkout && currentExerciseIndex < currentWorkout.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setIsResting(false); if (restIntervalRef.current) clearInterval(restIntervalRef.current); setRestTimer(0); setEditingSetInfo(null);
    } else toast({ title: "To ostatnie ćwiczenie!", description: "Możesz teraz zakończyć trening.", variant: "default" });
  };

  // Navigates to the previous exercise.
  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setIsResting(false); if (restIntervalRef.current) clearInterval(restIntervalRef.current); setRestTimer(0); setEditingSetInfo(null);
    }
  };

  // Finalizes the workout, saves summary data to localStorage, and navigates to the summary page.
  const handleFinishWorkout = () => {
    setIsLoading(true); // Show loading state during finish process
    if (!currentWorkout || !workoutStartTime) { toast({ title: "Błąd", description: "Nie można zakończyć treningu.", variant: "destructive" }); setIsLoading(false); return; }
    const summaryData = {
      workoutId: currentWorkout.id, workoutName: currentWorkout.name, startTime: workoutStartTime.toISOString(), endTime: new Date().toISOString(), totalTimeSeconds: elapsedTime, recordedSets, exercises: currentWorkout.exercises, exerciseNotes, // Include exercise-specific notes
    };
    try {
      localStorage.setItem('workoutSummaryData', JSON.stringify(summaryData));
      clearAutoSavedWorkout(); // Clear autosave once workout is finished
      toast({ title: "Trening Zakończony!", description: "Przekierowuję do podsumowania...", variant: "default" });
      router.push(`/dashboard/workout/summary`);
    } catch (error) { console.error("Error saving summary data:", error); toast({ title: "Błąd zapisu", description: "Nie udało się zapisać danych.", variant: "destructive" }); setIsLoading(false); }
    // setIsLoading(false) will be implicitly handled by navigation or if error occurs
  };

  // Applies progression suggestion values to the set form.
  const handleApplySuggestion = () => {
    if (progressionSuggestion?.suggestedValues) {
      const { weight, reps } = progressionSuggestion.suggestedValues;
      if (weight !== undefined && (currentExerciseTrackingType === "weight_reps" || currentExerciseTrackingType === "reps_only")) setForm.setValue("weight", String(weight));
      if (reps !== undefined) setForm.setValue("reps", String(reps));
      toast({ title: "Sugestia zastosowana!", description: "Pola formularza zostały zaktualizowane." });
    }
  };
  // Shows the reasoning behind a progression suggestion in a toast.
  const handleShowReasoning = () => { if (progressionSuggestion?.reasoning) toast({ title: "Logika Sugestii", description: progressionSuggestion.reasoning, duration: 10000 }); };

  // Dynamically gets the label for weight/reps fields based on exercise type.
  const getSetFormFieldLabel = (fieldName: "weight" | "reps"): string => {
    if (fieldName === "weight") {
      switch (currentExerciseTrackingType) {
        case "time": case "distance": return "Intensywność / Poziom (opcjonalne)";
        case "reps_only": return "Obciążenie Dodatkowe (kg/opis, opcjonalne)";
        default: return "Ciężar (kg/opis)";
      }
    } else { // fieldName === "reps"
      switch (currentExerciseTrackingType) {
        case "time": return "Czas Trwania";
        case "distance": return "Dystans";
        default: return "Powtórzenia";
      }
    }
  };
  // Dynamically gets placeholder text for weight/reps fields.
  const getSetFormFieldPlaceholder = (fieldName: "weight" | "reps"): string => {
    if (fieldName === "weight") {
      switch (currentExerciseTrackingType) {
        case "time": case "distance": return "np. Poziom 5, 150W";
        case "reps_only": return "np. BW, +10kg";
        default: return "np. 50 lub BW";
      }
    } else { // fieldName === "reps"
      const defaultReps = currentExercise?.defaultReps; if (defaultReps) return defaultReps; // Use planned reps if available
      switch (currentExerciseTrackingType) {
        case "time": return "np. 30s, 2min30s";
        case "distance": return "np. 5km, 1000m";
        default: return "np. 10 lub Max";
      }
    }
  };

  // Show loading skeleton if initial data isn't ready and not showing resume dialog.
  if (isLoading && !currentWorkout && !showResumeDialog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 dashboard-active-workout-loading">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Ładowanie treningu...</p>
      </div>
    );
  }

  // Show resume dialog if autosaved data exists.
  if (showResumeDialog && savedWorkoutData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 dashboard-active-workout-resume-dialog-wrapper">
        <AlertDialog open={showResumeDialog} onOpenChange={(isOpen) => { if (!isOpen) handleResumeWorkout(false); /* Default to discard if closed by other means */ }}>
          <AlertDialogContent className="active-workout-resume-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Niezakończony Trening</AlertDialogTitle>
              <AlertDialogDescription>
                Znaleziono niezakończony trening "{savedWorkoutData.workoutName || "Poprzedni Trening"}" z dnia{" "}
                {savedWorkoutData.workoutStartTime && isDateValid(parseISO(savedWorkoutData.workoutStartTime)) ? format(parseISO(savedWorkoutData.workoutStartTime), "PPP", {locale: pl}) : "nieznana data"}.
                Czy chcesz go kontynuować?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleResumeWorkout(false)} className="resume-dialog-discard-button">Odrzuć i zacznij od nowa</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleResumeWorkout(true)} className="resume-dialog-continue-button">Kontynuuj Trening</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
  
  // If workout data isn't loaded properly after all checks, show error.
  if (!currentWorkout || !currentExercise) {
     if (!isLoading) { // Only show if not in initial loading state
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 dashboard-active-workout-error">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Błąd Treningu</AlertTitle>
            <AlertDescription>Nie można załadować danych treningu. Spróbuj ponownie.</AlertDescription>
            <Button onClick={() => router.push("/dashboard/workout/start")} className="mt-4">Wróć do wyboru</Button>
          </Alert>
        </div>
      );
    }
    return null; // Or a more specific loading indicator if still somehow loading
  }

  const exerciseProgress = ((currentExerciseIndex + 1) / currentWorkout.exercises.length) * 100;
  const setsForCurrentExercise = recordedSets[currentExercise.id] || [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground dashboard-active-workout-page">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 active-workout-header">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="active-workout-back-button">
              <Link href="/dashboard/workout/start" aria-label="Wróć do wyboru treningów"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <Dumbbell className="h-7 w-7 text-primary active-workout-logo-icon" />
            <h1 className="text-xl font-bold truncate max-w-xs sm:max-w-md active-workout-name-title" title={currentWorkout.name}>{currentWorkout.name}</h1>
          </div>
          <div className="flex items-center gap-3 active-workout-header-controls">
            <div className="flex items-center gap-1 text-sm font-medium active-workout-elapsed-time-display">
              <Clock className="h-4 w-4" />
              <span>{formatTimeDisplay(elapsedTime)}</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isLoading && currentWorkout != null} className="active-workout-finish-button-trigger">
                  <Square className="mr-2 h-4 w-4" /> Zakończ
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="active-workout-finish-dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Zakończyć trening?</AlertDialogTitle>
                  <AlertDialogDescription>Czy na pewno chcesz zakończyć obecny trening? Postęp zostanie zapisany.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading && currentWorkout != null}>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFinishWorkout} disabled={isLoading && currentWorkout != null} className="active-workout-finish-confirm-button">
                    {isLoading && currentWorkout != null ? <Loader2 className="animate-spin mr-2" /> : null}
                    Potwierdź i zakończ
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 active-workout-main-content">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6 active-workout-progress-bar-section">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Ćwiczenie {currentExerciseIndex + 1} z {currentWorkout.exercises.length}</span>
              <span>{Math.round(exerciseProgress)}%</span>
            </div>
            <Progress value={exerciseProgress} className="h-2" />
          </div>

          <Card className="mb-6 active-workout-current-exercise-card">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" /> {currentExercise.name}
              </CardTitle>
              {currentExerciseDetails?.category && (
                <CardDescription>Kategoria: {currentExerciseDetails.category} (Typ śledzenia: {currentExerciseTrackingType})</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {currentExerciseDetails?.instructions && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="text-sm hover:no-underline py-2 exercise-instructions-trigger"><Info className="mr-2 h-4 w-4" /> Pokaż instrukcje</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm pb-2 exercise-instructions-content">
                      {currentExerciseDetails.instructions}
                      {currentExerciseDetails.videoUrl && <a href={currentExerciseDetails.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block mt-2">Zobacz wideo</a>}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              {progressionSuggestion && (
                <Alert variant="default" className="border-primary/50 progression-suggestion-alert">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-primary">Sugestia Progresji</AlertTitle>
                  <AlertDescription>{progressionSuggestion.suggestionText}</AlertDescription>
                  <div className="mt-3 flex gap-2 items-center">
                    <Button variant="ghost" size="sm" onClick={handleApplySuggestion} disabled={!progressionSuggestion.suggestedValues || currentExerciseTrackingType === "time" || currentExerciseTrackingType === "distance"} className="apply-suggestion-button">
                      <CheckCircle className="mr-2 h-4 w-4" /> Zastosuj sugestię
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShowReasoning} disabled={!progressionSuggestion.reasoning} className="h-7 w-7 show-reasoning-button" title="Dlaczego taka sugestia?">
                      <HelpCircle className="h-4 w-4" /><span className="sr-only">Dlaczego taka sugestia?</span>
                    </Button>
                  </div>
                </Alert>
              )}
              <div className="space-y-2 exercise-notes-section">
                <Label htmlFor={`exercise-notes-${currentExercise.id}`} className="flex items-center gap-1 text-sm font-medium"><Edit2 className="h-4 w-4 text-muted-foreground" />Notatki do ćwiczenia (opcjonalne)</Label>
                <Textarea id={`exercise-notes-${currentExercise.id}`} placeholder="Np. jak czułeś to ćwiczenie..." value={exerciseNotes[currentExercise.id] || ""} onChange={(e) => handleExerciseNotesChange(currentExercise.id, e.target.value)} rows={3} className="text-sm" />
              </div>
            </CardContent>
          </Card>

          {isResting && !editingSetInfo && (
            <Card className="mb-6 bg-primary/10 border-primary/30 active-workout-rest-timer-card">
              <CardHeader><CardTitle className="text-xl flex items-center gap-2 text-primary"><Timer className="h-6 w-6" /> Odpoczynek</CardTitle></CardHeader>
              <CardContent className="text-center">
                <p className="text-6xl font-bold text-primary rest-timer-display">{formatTimeDisplay(restTimer)}</p>
                <Progress value={(restTimer / (currentExercise.defaultRest || DEFAULT_REST_TIME)) * 100} className="h-2 mt-4 bg-primary/20 [&>div]:bg-primary" />
              </CardContent>
              <CardFooter><Button onClick={handleSkipRest} variant="secondary" className="w-full skip-rest-button"><SkipForward className="mr-2 h-4 w-4" /> Pomiń odpoczynek</Button></CardFooter>
            </Card>
          )}

          {(!isResting || editingSetInfo) && (
            <Card className="mb-6 active-workout-set-logging-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 set-logging-title">
                  <ListChecks className="h-6 w-6 text-primary" />
                  {editingSetInfo ? `Edytuj Serię ${editingSetInfo.setData.setNumber}` : `Rejestruj Serię`}
                  {!editingSetInfo && currentExercise.defaultSets && setsForCurrentExercise.length < currentExercise.defaultSets ? ` (Sugerowana: ${setsForCurrentExercise.length + 1} z ${currentExercise.defaultSets})`
                   : !editingSetInfo && setsForCurrentExercise.length > 0 ? ` (Seria ${setsForCurrentExercise.length + 1})`
                   : !editingSetInfo ? ` (Seria 1)` : ""}
                </CardTitle>
                {currentExercise.defaultReps && !editingSetInfo && <CardDescription>Sugerowany cel: {currentExercise.defaultReps}</CardDescription>}
              </CardHeader>
              <CardContent>
                <Form {...setForm}>
                  <form onSubmit={setForm.handleSubmit(handleSaveSetSubmit)} className="space-y-4 set-logging-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={setForm.control} name="weight" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><Weight className="mr-1 h-4 w-4" />{getSetFormFieldLabel("weight")}</FormLabel><FormControl><Input placeholder={getSetFormFieldPlaceholder("weight")} {...field} className="set-weight-input" /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={setForm.control} name="reps" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><Repeat className="mr-1 h-4 w-4" />{getSetFormFieldLabel("reps")}</FormLabel><FormControl><Input placeholder={getSetFormFieldPlaceholder("reps")} {...field} className="set-reps-input" /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={setForm.control} name="rpe" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><TrendingUp className="mr-1 h-4 w-4" />RPE (1-10, opcjonalne)</FormLabel><FormControl><Input type="number" placeholder="np. 8" {...field} className="set-rpe-input" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={setForm.control} name="notes" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><StickyNote className="mr-1 h-4 w-4" />Notatki do serii (opcjonalne)</FormLabel><FormControl><Textarea placeholder="Np. Zapas 2 powtórzeń..." {...field} className="set-notes-input" /></FormControl><FormMessage /></FormItem>)} />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" className="w-full sm:flex-1 save-set-button" disabled={setForm.formState.isSubmitting}>
                        {setForm.formState.isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                        {editingSetInfo ? "Zaktualizuj Serię" : "Zapisz Serię"}
                      </Button>
                      {editingSetInfo && <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto cancel-edit-set-button"><XCircle className="mr-2 h-4 w-4" /> Anuluj Edycję</Button>}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {setsForCurrentExercise.length > 0 && (
            <Card className="mb-6 active-workout-recorded-sets-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-6 w-6 text-green-500" /> Zapisane Serie ({setsForCurrentExercise.length})</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {setsForCurrentExercise.map((set, index) => (
                    <li key={`${currentExercise.id}-set-${index}`} className="flex flex-col sm:flex-row justify-between sm:items-start p-3 bg-muted/50 rounded-md text-sm gap-2 recorded-set-item">
                      <div className="flex-grow">
                        <span className="font-semibold">Seria {set.setNumber}: </span>
                        {(currentExerciseTrackingType === "weight_reps" || currentExerciseTrackingType === "reps_only") && (<span>{set.weight} x {set.reps} powt.</span>)}
                        {currentExerciseTrackingType === "time" && (<span>{getSetFormFieldLabel("reps")}: {set.reps} {set.weight !== "N/A" && set.weight !== "" ? `(Intensywność: ${set.weight})` : ""}</span>)}
                        {currentExerciseTrackingType === "distance" && (<span>{getSetFormFieldLabel("reps")}: {set.reps} {set.weight !== "N/A" && set.weight !== "" ? `(Intensywność: ${set.weight})` : ""}</span>)}
                        {set.rpe && <span className="ml-2 text-muted-foreground">(RPE: {set.rpe})</span>}
                        {set.notes && <p className="text-xs text-muted-foreground mt-1 italic">Notatka do serii: {set.notes}</p>}
                      </div>
                      <div className="flex gap-2 self-start sm:self-center flex-shrink-0">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 edit-set-button" onClick={() => handleStartEditSet(currentExercise.id, index)} aria-label="Edytuj serię" disabled={!!editingSetInfo}><Edit3 className="mr-1 h-4 w-4" /> Edytuj</Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 delete-set-button" onClick={() => currentExercise && handleDeleteSet(currentExercise.id, index)} aria-label="Usuń serię" disabled={!!editingSetInfo}><Trash2 className="mr-1 h-4 w-4" /> Usuń</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 flex justify-between items-center gap-4 active-workout-navigation-buttons">
            <Button variant="outline" onClick={handlePreviousExercise} disabled={currentExerciseIndex === 0 || (isLoading && currentWorkout != null) || !!editingSetInfo} className="previous-exercise-button"><ChevronLeft className="mr-2 h-4 w-4" /> Poprzednie ćwiczenie</Button>
            {currentExerciseIndex < currentWorkout.exercises.length - 1 ? (
              <Button onClick={handleNextExercise} disabled={(isLoading && currentWorkout != null) || !!editingSetInfo} className="bg-primary hover:bg-primary/90 next-exercise-button">Następne ćwiczenie <ChevronRight className="ml-2 h-4 w-4" /></Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={(isLoading && currentWorkout != null) || !!editingSetInfo} className="bg-green-600 hover:bg-green-700 text-white active-workout-finish-and-save-button"><CheckCircle className="mr-2 h-4 w-4" /> Zakończ Trening i Zapisz</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="active-workout-finish-save-dialog">
                  <AlertDialogHeader><AlertDialogTitle>Zakończyć trening?</AlertDialogTitle><AlertDialogDescription>To było ostatnie ćwiczenie. Czy na pewno chcesz zakończyć i zapisać trening?</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading && currentWorkout != null}>Anuluj</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinishWorkout} disabled={isLoading && currentWorkout != null} className="finish-save-confirm-button">
                      {isLoading && currentWorkout != null ? <Loader2 className="animate-spin mr-2" /> : null}
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
