import type { Exercise as SelectableExerciseType } from "@/components/workout/exercise-selection-dialog";
import type { RecordedSet as WorkoutRecordedSet, ExerciseInWorkout as PlanExerciseInWorkout, Workout as ActiveWorkoutType } from "@/app/(app)/dashboard/workout/active/[workoutId]/page";
import type { SelectableWorkout as PlanSelectableWorkout } from "@/components/plans/select-workout-dialog";

// Import types that are not exported from their original files, then re-export them
import type { RichDayTemplate as ImportedPlanRichDayTemplate } from "@/app/(app)/dashboard/plans/create/page";
export type PlanRichDayTemplate = ImportedPlanRichDayTemplate;

import type { Measurement as ImportedMeasurement } from "@/app/(app)/dashboard/measurements/page";
export type Measurement = ImportedMeasurement;

import type { PersonalBest as ImportedPersonalBest } from "@/app/(app)/dashboard/personal-bests/page";
export type PersonalBest = ImportedPersonalBest;

import type { ProgressPhoto as ImportedProgressPhoto } from "@/app/(app)/dashboard/progress-photos/page";
export type ProgressPhoto = ImportedProgressPhoto;

import type { WellnessEntry as ImportedWellnessEntry } from "@/app/(app)/dashboard/wellness-journal/page.tsx";
export type WellnessEntry = ImportedWellnessEntry;

import type { Portion as ImportedPortion } from "@/components/hydration/add-edit-portion-dialog";
export type Portion = ImportedPortion;

import type { UserGoal as ImportedUserGoal } from "@/app/(app)/dashboard/statistics/page";
export type UserGoal = ImportedUserGoal;

// --- Original MOCK_EXERCISES_DATABASE (from workout/create & active workout) ---
export const INITIAL_MOCK_EXERCISES_DATABASE_DATA: SelectableExerciseType[] = [
  { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", category: "Klatka", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex2", name: "Przysiady ze sztangą", category: "Nogi", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex3", name: "Martwy ciąg", category: "Plecy", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex4", name: "Podciąganie na drążku", category: "Plecy", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex5", name: "Pompki", category: "Klatka", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex6", name: "Bieg na bieżni", category: "Cardio", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex7", name: "Skakanka", category: "Cardio", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex8", name: "Rozciąganie dynamiczne", category: "Całe ciało", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex9", name: "Wyciskanie żołnierskie (OHP)", category: "Barki", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex10", name: "Uginanie ramion ze sztangą", category: "Ramiona", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex11", name: "Plank", category: "Brzuch", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex12", name: "Wiosłowanie sztangą", category: "Plecy", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex13", name: "Wykroki", category: "Nogi", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex14", name: "Unoszenie hantli bokiem", category: "Barki", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex15", name: "Francuskie wyciskanie sztangielki", category: "Ramiona", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex16", name: "Allah Pompki (Modlitewniki)", category: "Brzuch", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex17", name: "Przysiad bułgarski", category: "Nogi", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex18", name: "Wyciskanie hantli na ławce skośnej", category: "Klatka", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex19", name: "Orbitrek (30 min)", category: "Cardio", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex20", name: "Wall sit (60s)", category: "Nogi", videoUrl: "https://www.youtube.com/watch?v=example"},
];
export { INITIAL_MOCK_EXERCISES_DATABASE_DATA as MOCK_EXERCISES_DATABASE };
export type { SelectableExerciseType };

// --- Exercise Categories for Admin Form ---
export const EXERCISE_CATEGORIES_DIALOG: string[] = [
  "Klatka",
  "Nogi",
  "Plecy",
  "Barki",
  "Ramiona",
  "Brzuch",
  "Cardio",
  "Całe ciało",
  "Inne"
];

// --- User Profile Data ---
export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  fitnessLevel: "Początkujący" | "Średniozaawansowany" | "Zaawansowany" | "Ekspert";
  joinDate: string; // ISO string
  followers: number;
  following: number;
  region?: string;
  recentActivity: Array<{
    id: string;
    type: "workout" | "post" | "achievement" | "plan_completed";
    title: string;
    timestamp: string; // ISO string
    details?: string;
    link?: string;
  }>;
  linkedSocialAccounts?: {
    google?: boolean;
    facebook?: boolean;
  };
  privacySettings?: {
    isActivityPublic: boolean;
    isFriendsListPublic: boolean;
    isSharedPlansPublic: boolean;
  };
  role?: 'client' | 'trener' | 'admin';
  dateOfBirth?: string; // ISO string
  gender?: "male" | "female" | "other" | "prefer_not-to-say";
  weight?: number;
  height?: number;
}

export const MOCK_USER_PROFILES_DB: UserProfile[] = [
  {
    id: "user1",
    fullName: "Aleksandra Nowicka",
    username: "alex_fit_girl",
    email: "aleksandra.nowicka@example.com",
    avatarUrl: "https://placehold.co/200x200.png?text=AN",
    bio: "Miłośniczka crossfitu i zdrowego stylu życia. W ciągłym ruchu, zawsze gotowa na nowe wyzwanie!",
    fitnessLevel: "Zaawansowany",
    joinDate: new Date(2022, 5, 15).toISOString(),
    followers: 1250,
    following: 300,
    region: "Mazowieckie",
    recentActivity: [
      { id: "act1", type: "workout", title: "Poranny Crossfit WOD", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), details: "Ukończono 'Fran' w 5:30", link: "/dashboard/history/some-id1" },
      { id: "act2", type: "post", title: "Nowy przepis na proteinowe smoothie!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), details: "Idealne po ciężkim treningu...", link: "/dashboard/community/feed/post-id-1" },
      { id: "act3", type: "achievement", title: "Osiągnięto 500 treningów!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), details: "Jubileuszowy trening zaliczony." },
    ],
    linkedSocialAccounts: { google: true },
    privacySettings: { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true},
    role: 'client',
    dateOfBirth: new Date(1995, 8, 20).toISOString(),
    gender: "female",
  },
];

export const MOCK_CURRENT_USER_PROFILE: UserProfile = {
  id: "current_user_id",
  fullName: "Jan Testowy",
  username: "jan_tester",
  email: "jan.tester@example.com",
  avatarUrl: "https://placehold.co/200x200.png?text=JT",
  bio: "Aktywnie testuję LeniwaKluska! Lubię siłownię i bieganie.",
  fitnessLevel: "Średniozaawansowany",
  joinDate: new Date(2023, 8, 1).toISOString(),
  followers: 150,
  following: 75,
  recentActivity: [
    { id: "act7", type: "workout", title: "Wieczorny trening siłowy", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), details: "FBW, 3 serie po 10 powtórzeń", link: "/dashboard/history/some-id3" },
    { id: "act8", type: "achievement", title: "Osiągnięto nowy rekord w przysiadzie!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), details: "100kg x 5!", link: "/dashboard/personal-bests" },
  ],
  linkedSocialAccounts: { google: true, facebook: false },
  privacySettings: { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true},
  role: 'admin',
  dateOfBirth: new Date(1992, 3, 10).toISOString(),
  gender: "male",
  weight: 80,
  height: 182,
};

// Ensure current user is part of the discoverable DB if not already
if (!MOCK_USER_PROFILES_DB.find(u => u.id === MOCK_CURRENT_USER_PROFILE.id)) {
    MOCK_USER_PROFILES_DB.push(MOCK_CURRENT_USER_PROFILE);
}

// --- Workout History Data ---
export enum DifficultyRating {
  BardzoLatwy = "Bardzo Łatwy",
  Latwy = "Łatwy",
  Sredni = "Średni",
  Trudny = "Trudny",
  BardzoTrudny = "Bardzo Trudny",
  Ekstremalny = "Ekstremalny",
}
export type RecordedSet = WorkoutRecordedSet;
export type ExerciseInWorkout = PlanExerciseInWorkout;

export interface HistoricalWorkoutSession {
  id: string;
  workoutId: string;
  workoutName: string;
  workoutType: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  totalTimeSeconds: number;
  recordedSets: Record<string, RecordedSet[]>; // Key is exerciseId
  exercises: ExerciseInWorkout[]; // List of exercises in the original plan
  difficulty?: DifficultyRating;
  generalNotes?: string;
  calculatedTotalVolume: number;
  userId?: string; // For associating with a user
}

export const MOCK_HISTORY_SESSIONS: HistoricalWorkoutSession[] = [
  {
    id: "hist1",
    workoutId: "wk1",
    workoutName: "Poranny Trening Siłowy",
    workoutType: "Siłowy",
    startTime: "2024-07-25T08:00:00.000Z",
    endTime: "2024-07-25T09:00:00.000Z",
    totalTimeSeconds: 3600,
    recordedSets: {
      ex1: [{ setNumber: 1, weight: "60", reps: "10", rpe: 7, notes: "Good form" }, { setNumber: 2, weight: "65", reps: "8", rpe: 8 }],
      ex2: [{ setNumber: 1, weight: "100", reps: "5", rpe: 9, notes: "Heavy but okay" }],
      ex4: [{ setNumber: 1, weight: "BW", reps: "8", rpe: 7 }, { setNumber: 2, weight: "BW", reps: "6", rpe: 8, notes: "Trochę zmęczony" }],
    },
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
      { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 4, defaultReps: "6-8", defaultRest: 120 },
      { id: "ex4", name: "Podciąganie na drążku", defaultSets: 3, defaultReps: "Max", defaultRest: 90 },
    ],
    difficulty: DifficultyRating.Sredni,
    generalNotes: "Feeling strong today! Focused on technique. Może następnym razem dodam ciężaru w przysiadach.",
    calculatedTotalVolume: (60*10) + (65*8) + (100*5),
    userId: "current_user_id"
  },
];

// --- Training Plan Detail Data ---
export interface PlanDayDetail {
  dayName: string;
  assignedWorkoutId?: string;
  assignedWorkoutName?: string;
  isRestDay: boolean;
  notes?: string;
  templateId?: string | null;
  templateName?: string | null;
}

export interface DetailedTrainingPlan {
  id: string;
  name: string;
  description: string;
  goal: string;
  duration: string;
  schedule: PlanDayDetail[];
  author?: string;
  isPublic?: boolean;
  startDate?: string; // ISO string, optional
  endDate?: string; // ISO string, optional
}

export const MOCK_DETAILED_TRAINING_PLANS: DetailedTrainingPlan[] = [
  {
    id: 'plan1',
    name: 'Siła Początkującego Herkulesa (Detale)',
    description: 'Kompleksowy plan dla osób rozpoczynających przygodę z treningiem siłowym, skupiony na podstawowych ćwiczeniach wielostawowych. Ten plan zakłada 3 dni treningowe w tygodniu i 4 dni odpoczynku.',
    goal: 'Budowa siły',
    duration: '8 tygodni',
    author: 'Krzysztof Trener',
    isPublic: true,
    startDate: new Date(2024, 6, 1).toISOString(),
    endDate: new Date(2024, 8, 23).toISOString(),
    schedule: [
      { dayName: "Poniedziałek", assignedWorkoutId: "wk1", assignedWorkoutName: "Trening A - Full Body (Wyciskanie, Przysiady, Podciąganie)", isRestDay: false, notes: "Skup się na technice, nie na ciężarze." },
      { dayName: "Wtorek", isRestDay: true, notes: "Aktywny odpoczynek: spacer lub lekkie rozciąganie." },
      { dayName: "Środa", assignedWorkoutId: "custom_wk_fb_b", assignedWorkoutName: "Trening B - Full Body (OHP, Martwy Ciąg, Wiosłowanie)", isRestDay: false, notes: "Utrzymaj napięcie mięśniowe." },
      { dayName: "Czwartek", isRestDay: true },
      { dayName: "Piątek", assignedWorkoutId: "custom_wk_fb_c", assignedWorkoutName: "Trening C - Full Body (Warianty ćwiczeń A i B, Akcesoria)", isRestDay: false, notes: "Możesz spróbować dodać minimalnie ciężaru." },
      { dayName: "Sobota", isRestDay: true, notes: "Dłuższy spacer, regeneracja." },
      { dayName: "Niedziela", isRestDay: true, notes: "Pełna regeneracja" },
    ],
  },
];

// --- Measurements Data ---
export const MOCK_MEASUREMENTS: Measurement[] = [
  {
    id: "m1",
    date: new Date(2024, 6, 1).toISOString(),
    weight: 75.5,
    notes: "Początek nowego planu treningowego"
  },
];

// --- Personal Bests Data ---
export const MOCK_PERSONAL_BESTS: PersonalBest[] = [
  {
    id: "pb1",
    exerciseId: "ex1",
    exerciseName: "Wyciskanie sztangi na ławce płaskiej",
    value: 80,
    reps: 5,
    date: new Date(2024, 6, 20).toISOString(),
    notes: "Nowy rekord!"
  },
];

// --- Progress Photos Data ---
export const MOCK_PROGRESS_PHOTOS: ProgressPhoto[] = [
  {
    id: "pp1",
    date: new Date(2024, 6, 1).toISOString(),
    photoUrl: "https://placehold.co/300x400.png?text=Front+Start",
    notes: "Zdjęcia startowe"
  },
];

// --- Wellness Journal Data ---
export const MOCK_WELLNESS_ENTRIES: WellnessEntry[] = [
  {
    id: "w1",
    date: new Date(2024, 7, 20).toISOString(),
    sleep: 7.5,
    stress: 3,
    energy: 4,
    mood: 4,
    notes: "Dobry dzień, czuję się wypoczęty"
  },
];

// --- Hydration Data ---
export const MOCK_PORTIONS: Portion[] = [
  { id: "p1", name: "Szklanka wody", amount: 250, isDefault: true },
  { id: "p2", name: "Butelka 0.5L", amount: 500, isDefault: true },
];

// --- User Goals Data ---
export const MOCK_USER_GOALS: UserGoal[] = [
  {
    id: "goal1",
    type: "weight_loss",
    targetValue: 70,
    currentValue: 75,
    unit: "kg",
    deadline: new Date(2024, 11, 31),
    isActive: true
  },
];

// --- Dashboard-specific Data ---
export interface DashboardLastWorkout {
  id: string;
  name: string;
  date: string; // ISO string
  durationSeconds: number;
  exerciseCount: number;
  calories: string;
  link: string;
}

export interface DashboardProgressStats {
  currentWeight: string;
  weightTrend: string;
  workoutsThisWeek: number;
  weeklyGoal: number;
}

export interface DashboardUpcomingReminder {
  id: string;
  title: string;
  time: string;
  link: string;
}

export const MOCK_PROGRESS_STATS_DASHBOARD: DashboardProgressStats = {
  currentWeight: "74.2 kg",
  weightTrend: "-0.8 kg",
  workoutsThisWeek: 3,
  weeklyGoal: 4
};

export const MOCK_UPCOMING_REMINDERS_DASHBOARD: DashboardUpcomingReminder[] = [
  {
    id: "reminder1",
    title: "Trening nóg - Plan Siłowy",
    time: "Jutro o 18:00",
    link: "/dashboard/workout/start"
  },
  {
    id: "reminder2",
    title: "Pomiar wagi - cotygodniowy",
    time: "Piątek o 8:00",
    link: "/dashboard/measurements"
  }
];

export const MOCK_FITNESS_TIPS_DASHBOARD: string[] = [
  "Pamiętaj o rozgrzewce przed każdym treningiem - zmniejsza ryzyko kontuzji o 50%.",
  "Pij wodę regularnie podczas treningu. Nawet 2% odwodnienia może obniżyć wydajność.",
  "Sen to klucz do regeneracji. Staraj się spać 7-9 godzin każdej nocy.",
  "Progresywne przeciążenie to podstawa rozwoju siły - stopniowo zwiększaj ciężary.",
  "Białko po treningu pomaga w regeneracji mięśni. Spożyj je w ciągu 2 godzin.",
  "Nie trenuj tych samych grup mięśniowych codziennie - daj im czas na regenerację.",
  "Technika jest ważniejsza niż ciężar. Lepiej wykonać ćwiczenie poprawnie z mniejszym obciążeniem.",
  "Cardio nie tylko spala kalorie, ale też wzmacnia serce i poprawia kondycję.",
  "Rozciąganie po treningu pomaga w regeneracji i zwiększa elastyczność.",
  "Słuchaj swojego ciała - czasami odpoczynek jest ważniejszy niż trening."
];

// --- Additional Mock Data for SQLite Database ---

// Community Feed Data
export interface FeedMockComment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

export interface FeedMockPost {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  postType: string;
  workoutSummaryDetails?: any;
  timestamp: string;
  likes: number;
  comments: FeedMockComment[];
  likedByCurrentUser?: boolean;
}

export interface FeedMockNotification {
  id: string;
  recipientUserId: string;
  user: { id: string };
  type: string;
  relatedPostId?: string;
  relatedCommentId?: string;
  postContentPreview: string;
  link?: string;
  read: boolean;
  timestamp: string;
}

export const ALL_MOCK_POSTS_FEED: FeedMockPost[] = [
  {
    id: "post1",
    userId: "user1",
    content: "Właśnie ukończyłam świetny trening nóg! 💪 Czuję się niesamowicie!",
    postType: "workout_summary",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 15,
    comments: [
      {
        id: "comment1",
        userId: "user2",
        text: "Świetna robota! Inspirujesz mnie do działania 💪",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
      },
      {
        id: "comment2",
        userId: "current_user_id",
        text: "Gratulacje! Jak długo trwał trening?",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ],
    likedByCurrentUser: false
  },
  {
    id: "post2",
    userId: "user2",
    content: "Nowy rekord w martwym ciągu - 120kg! Ciężka praca się opłaca 🔥",
    postType: "personal_best",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likes: 28,
    comments: [
      {
        id: "comment3",
        userId: "user1",
        text: "Wow! To jest niesamowite! 🔥",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString()
      },
      {
        id: "comment4",
        userId: "current_user_id",
        text: "Brawo! Jaka była Twoja poprzednia najlepsza próba?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
      }
    ],
    likedByCurrentUser: true
  }
];

export const MOCK_USERS_FEED = MOCK_USER_PROFILES_DB;

export const INITIAL_MOCK_NOTIFICATIONS_FEED: FeedMockNotification[] = [
  {
    id: "notif1",
    recipientUserId: "current_user_id",
    user: { id: "user1" },
    type: "like",
    relatedPostId: "post1",
    postContentPreview: "Aleksandra polubiła Twój post",
    link: "/dashboard/community/feed",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
];

// Renamed exports to match SQLite imports
export const INITIAL_MOCK_MEASUREMENTS = MOCK_MEASUREMENTS;
export const INITIAL_MOCK_PHOTOS = MOCK_PROGRESS_PHOTOS;
export const INITIAL_MOCK_WELLNESS_ENTRIES = MOCK_WELLNESS_ENTRIES;
export const DEFAULT_HYDRATION_PORTIONS = MOCK_PORTIONS;
export const INITIAL_USER_GOALS_STATS = MOCK_USER_GOALS;
export const INITIAL_MOCK_PBS = MOCK_PERSONAL_BESTS;

// User data for profile editing
export const MOCK_USER_DATA_EDIT_PROFILE = {
  id: "edit_profile_user",
  email: "edit.profile@example.com",
  fullName: "Edytowalny Użytkownik",
  username: "editable_user",
  avatarUrl: "https://placehold.co/200x200.png?text=EU",
  bio: "Użytkownik do testowania edycji profilu",
  fitnessLevel: "Początkujący" as const,
  joinDate: new Date(2024, 0, 1).toISOString(),
  dateOfBirth: new Date(1990, 5, 15).toISOString(),
  gender: "prefer_not-to-say" as const,
  weight: 70,
  height: 175,
  role: "client" as const
};

// Day templates for plan editor
export const MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR: PlanRichDayTemplate[] = [
  {
    id: "template1",
    name: "Dzień Siłowy - Góra",
    assignedWorkoutId: "wk1",
    assignedWorkoutName: "Trening Górnej Partii",
    isRestDay: false,
    description: "Fokus na klatkę, plecy i ramiona"
  },
  {
    id: "template2",
    name: "Dzień Odpoczynku",
    isRestDay: true,
    description: "Aktywny odpoczynek lub pełna regeneracja"
  }
];

// Active workouts
export interface Workout {
  id: string;
  name: string;
  type: string;
  description?: string;
  exercises: ExerciseInWorkout[];
}

export const MOCK_WORKOUTS_ACTIVE: Workout[] = [
  {
    id: "wk1",
    name: "Poranny Trening Siłowy",
    type: "Siłowy",
    description: "Kompleksowy trening na całe ciało",
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
      { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 4, defaultReps: "6-8", defaultRest: 120 },
      { id: "ex4", name: "Podciąganie na drążku", defaultSets: 3, defaultReps: "Max", defaultRest: 90 },
    ]
  }
];