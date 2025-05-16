
import type { Exercise as SelectableExerciseType } from "@/components/workout/exercise-selection-dialog";
import type { RecordedSet as WorkoutRecordedSet, ExerciseInWorkout as PlanExerciseInWorkout } from "@/app/(app)/dashboard/workout/active/[workoutId]/page";
import type { SelectableWorkout as PlanSelectableWorkout } from "@/components/plans/select-workout-dialog";
import type { RichDayTemplate as PlanRichDayTemplate } from "@/app/(app)/dashboard/plans/create/page";


// This was previously in src/app/(app)/dashboard/workout/create/page.tsx
const INITIAL_MOCK_EXERCISES_DATABASE_DATA: SelectableExerciseType[] = [
  { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", category: "Klatka" },
  { id: "ex2", name: "Przysiady ze sztangą", category: "Nogi" },
  { id: "ex3", name: "Martwy ciąg", category: "Plecy" },
  { id: "ex4", name: "Podciąganie na drążku", category: "Plecy" },
  { id: "ex5", name: "Pompki", category: "Klatka" },
  { id: "ex6", name: "Bieg na bieżni (30 min)", category: "Cardio" },
  { id: "ex7", name: "Skakanka (15 min)", category: "Cardio" },
  { id: "ex8", name: "Rozciąganie dynamiczne", category: "Całe ciało" },
  { id: "ex9", name: "Wyciskanie żołnierskie (OHP)", category: "Barki" },
  { id: "ex10", name: "Uginanie ramion ze sztangą", category: "Ramiona" },
  { id: "ex11", name: "Plank", category: "Brzuch" },
  { id: "ex12", name: "Wiosłowanie sztangą", category: "Plecy" },
  { id: "ex13", name: "Wykroki", category: "Nogi" },
  { id: "ex14", name: "Unoszenie hantli bokiem", category: "Barki" },
  { id: "ex15", name: "Francuskie wyciskanie sztangielki", category: "Ramiona" },
  { id: "ex16", name: "Allah Pompki (Modlitewniki)", category: "Brzuch" },
  { id: "ex17", name: "Przysiad bułgarski", category: "Nogi" },
  { id: "ex18", name: "Wyciskanie hantli na ławce skośnej", category: "Klatka"},
];

export { INITIAL_MOCK_EXERCISES_DATABASE_DATA as MOCK_EXERCISES_DATABASE };
export type { SelectableExerciseType }; // Exporting the type as well if needed by other files directly from mockData


// --- User Profile Data (from src/app/(app)/dashboard/profile/[userId]/page.tsx) ---
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
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
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
  {
    id: "user2",
    fullName: "Krzysztof Kowalski",
    username: "kris_trener",
    email: "krzysztof.kowalski@example.com",
    avatarUrl: "https://placehold.co/200x200.png?text=KK",
    bio: "Certyfikowany trener personalny, specjalista od budowania siły i masy mięśniowej. Pomagam innym osiągać ich cele!",
    fitnessLevel: "Ekspert",
    joinDate: new Date(2021, 1, 10).toISOString(),
    followers: 5200,
    following: 150,
    recentActivity: [
      { id: "act4", type: "plan_completed", title: "Ukończono plan 'Masa XTREME'", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), details: "8 tygodni ciężkiej pracy zaowocowało +5kg masy!", link: "/dashboard/plans/plan-xtreme" },
      { id: "act5", type: "post", title: "Technika martwego ciągu - najczęstsze błędy", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), details: "Sprawdź, czy nie popełniasz tych błędów.", link: "/dashboard/community/feed/post-id-2" },
    ],
    linkedSocialAccounts: { facebook: true },
    privacySettings: { isActivityPublic: true, isFriendsListPublic: false, isSharedPlansPublic: true},
    role: 'trener',
  },
  {
    id: "user3",
    fullName: "Zofia Wójcik",
    username: "zofia_yoga_life",
    email: "zofia.wojcik@example.com",
    avatarUrl: "https://placehold.co/200x200.png?text=ZW",
    bio: "Instruktorka jogi i medytacji. Szukam harmonii między ciałem a umysłem. Namaste.",
    fitnessLevel: "Średniozaawansowany",
    joinDate: new Date(2023, 0, 5).toISOString(),
    followers: 800,
    following: 200,
    recentActivity: [
       { id: "act6", type: "workout", title: "Poranna sesja Vinyasa Jogi", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), details: "60 minut płynnej praktyki", link: "/dashboard/history/some-id2" },
    ],
    privacySettings: { isActivityPublic: false, isFriendsListPublic: true, isSharedPlansPublic: false},
    role: 'client',
  },
];

export const MOCK_CURRENT_USER_PROFILE: UserProfile = {
  id: "current_user_id",
  fullName: "Jan Testowy",
  username: "jan_tester",
  email: "jan.tester@example.com",
  avatarUrl: "https://placehold.co/200x200.png?text=JT",
  bio: "Aktywnie testuję WorkoutWise! Lubię siłownię i bieganie.",
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
MOCK_USER_PROFILES_DB.push(MOCK_CURRENT_USER_PROFILE);


// --- Workout History Data (from src/app/(app)/dashboard/history/page.tsx) ---
export enum DifficultyRating {
  BardzoLatwy = "Bardzo Łatwy",
  Latwy = "Łatwy",
  Sredni = "Średni",
  Trudny = "Trudny",
  BardzoTrudny = "Bardzo Trudny",
  Ekstremalny = "Ekstremalny",
}

// Re-using types from active workout page for consistency, aliasing them
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
    calculatedTotalVolume: (60*10) + (65*8) + (100*5), // (600 + 520 + 500) = 1620. BW volume not counted here.
    userId: "current_user_id"
  },
  {
    id: "hist2",
    workoutId: "wk2",
    workoutName: "Szybkie Cardio HIIT",
    workoutType: "Cardio",
    startTime: "2024-07-27T17:30:00.000Z",
    endTime: "2024-07-27T18:00:00.000Z",
    totalTimeSeconds: 1800,
    recordedSets: {
      ex6: [{ setNumber: 1, weight: "N/A", reps: "30 min", rpe: 8 }],
    },
    exercises: [{ id: "ex6", name: "Bieg na bieżni (30 min)", defaultSets: 1, defaultReps: "30 min", defaultRest: 0 }],
    difficulty: DifficultyRating.Trudny,
    generalNotes: "Tough session, pushed hard on intervals.",
    calculatedTotalVolume: 0,
    userId: "current_user_id"
  },
  {
    id: "hist3",
    workoutId: "wk1", // Repeating the same workout plan ID
    workoutName: "Poranny Trening Siłowy",
    workoutType: "Siłowy",
    startTime: "2024-07-29T08:15:00.000Z", 
    endTime: "2024-07-29T09:20:00.000Z",
    totalTimeSeconds: 3900,
    recordedSets: {
      ex1: [{ setNumber: 1, weight: "65", reps: "10", rpe: 7 }, { setNumber: 2, weight: "70", reps: "8", rpe: 8}, { setNumber: 3, weight: "70", reps: "7", rpe: 8.5, notes: "Ostatnie ciężko"}],
      ex2: [{ setNumber: 1, weight: "100", reps: "6", rpe: 8 }, { setNumber: 2, weight: "105", reps: "5", rpe: 9, notes: "Nowy PR!"}],
    },
    exercises: [ // Note: This session only did ex1 and ex2 from wk1
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
      { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 3, defaultReps: "5-8", defaultRest: 120 },
    ],
    difficulty: DifficultyRating.Sredni,
    calculatedTotalVolume: (65*10) + (70*8) + (70*7) + (100*6) + (105*5), // 650 + 560 + 490 + 600 + 525 = 2825
    userId: "current_user_id"
  },
  { id: "hist4", workoutId: "wk2", workoutName: "Cardio Popołudniowe", workoutType: "Cardio", startTime: "2024-07-10T16:00:00.000Z", endTime: "2024-07-10T16:45:00.000Z", totalTimeSeconds: 2700, recordedSets: {ex7: [{setNumber: 1, weight: "N/A", reps: "15 min"}]}, exercises: [{id: "ex7", name: "Skakanka (15 min)"}], calculatedTotalVolume: 0, difficulty: DifficultyRating.Latwy, userId: "current_user_id" },
  { id: "hist5", workoutId: "wkCustom1", workoutName: "Trening Siłowy - Nogi", workoutType: "Siłowy", startTime: "2024-07-10T09:00:00.000Z", endTime: "2024-07-10T10:15:00.000Z", totalTimeSeconds: 4500, recordedSets: {ex2: [{setNumber: 1, weight: 80, reps: 10}], ex13: [{setNumber: 1, weight: "20kg each", reps: 12}]}, exercises: [{id: "ex2", name: "Przysiady ze sztangą"}, {id: "ex13", name: "Wykroki"}], calculatedTotalVolume: 12000, difficulty: DifficultyRating.Trudny, userId: "current_user_id" },
  { id: "hist6", workoutId: "wk3", workoutName: "Joga Poranna", workoutType: "Rozciąganie", startTime: "2024-07-18T07:00:00.000Z", endTime: "2024-07-18T07:30:00.000Z", totalTimeSeconds: 1800, recordedSets: {ex8: [{setNumber: 1, weight: "N/A", reps: "30 min"}]}, exercises: [{id:"ex8", name:"Rozciąganie dynamiczne"}], calculatedTotalVolume: 0, difficulty: DifficultyRating.BardzoLatwy, userId: "current_user_id" },
  { id: "hist7", workoutId: "wkCustom2", workoutName: "Trening Mieszany - Całe Ciało", workoutType: "Mieszany", startTime: "2024-08-05T18:00:00.000Z", endTime: "2024-08-05T19:00:00.000Z", totalTimeSeconds: 3600, recordedSets: {ex1: [{setNumber:1, weight: 50, reps: 12}], ex6: [{setNumber:1, weight: "N/A", reps: "20 min"}]}, exercises: [{id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}, {id: "ex6", name: "Bieg na bieżni"}], calculatedTotalVolume: 8000, difficulty: DifficultyRating.Sredni, userId: "current_user_id" },
  { id: "hist8", workoutId: "wkCustom3", workoutName: "Siłówka Wieczorna", workoutType: "Siłowy", startTime: "2024-08-15T20:00:00.000Z", endTime: "2024-08-15T21:15:00.000Z", totalTimeSeconds: 4500, recordedSets: {ex3: [{setNumber:1, weight:120, reps:5}], ex12: [{setNumber:1, weight:70, reps:8}]}, exercises: [{id:"ex3", name:"Martwy ciąg"}, {id:"ex12", name:"Wiosłowanie sztangą"}], calculatedTotalVolume: 15000, difficulty: DifficultyRating.Trudny, userId: "current_user_id" },
];

// --- Training Plan Detail Data ---
export interface PlanDayDetail {
  dayName: string; 
  assignedWorkoutId?: string;
  assignedWorkoutName?: string;
  isRestDay: boolean;
  notes?: string; 
  templateId?: string | null; // Added for edit page compatibility
  templateName?: string | null; // Added for edit page compatibility
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
  // Potentially other fields like creationDate, lastUpdated, etc.
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
    startDate: new Date(2024, 6, 1).toISOString(), // July 1st, 2024
    endDate: new Date(2024, 8, 23).toISOString(),   // Sept 23rd, 2024
    schedule: [
      { dayName: "Poniedziałek", assignedWorkoutId: "wk1", assignedWorkoutName: "Trening A - Full Body (Wyciskanie, Przysiady, Podciąganie)", isRestDay: false, notes: "Skup się na technice, nie na ciężarze." },
      { dayName: "Wtorek", isRestDay: true, notes: "Aktywny odpoczynek: spacer lub lekkie rozciąganie." },
      { dayName: "Środa", assignedWorkoutId: "custom_wk_fb_b", assignedWorkoutName: "Trening B - Full Body (OHP, Martwy Ciąg, Wiosłowanie)", isRestDay: false, notes: "Utrzymaj napięcie mięśniowe." },
      { dayName: "Czwartek", isRestDay: true },
      { dayName: "Piątek", assignedWorkoutId: "custom_wk_fb_c", assignedWorkoutName: "Trening C - Full Body (Warianty ćwiczeń A i B, Akcesoria)", isRestDay: false, notes: "Możesz spróbować dodać minimalnie ciężaru." },
      { dayName: "Sobota", isRestDay: true, notes: "Dłuższy spacer, regeneracja." },
      { dayName: "Niedziela", isRestDay: true, notes: "Przygotuj posiłki na kolejny tydzień." },
    ],
  },
  {
    id: 'plan2',
    name: 'Kardio Spalacz Kalorii (Detale)',
    description: 'Intensywny plan kardio interwałowego i aerobowego, mający na celu maksymalizację spalania kalorii i poprawę wydolności. Zaplanowane 5 sesji kardio w tygodniu.',
    goal: 'Redukcja tkanki tłuszczowej',
    duration: '6 tygodni',
    author: 'Aleksandra Fit',
    isPublic: true,
    schedule: [
      { dayName: "Poniedziałek", assignedWorkoutId: "wk2", assignedWorkoutName: "HIIT Szybki Spalacz (Bieg, Pompki, Plank)", isRestDay: false },
      { dayName: "Wtorek", assignedWorkoutId: "custom_cardio_steady", assignedWorkoutName: "Cardio Stabilne Tempo (Rower)", isRestDay: false, notes: "30-40 min w strefie 2." },
      { dayName: "Środa", assignedWorkoutId: "custom_hiit_2", assignedWorkoutName: "HIIT Interwały Mocy (Skakanka, Burpees)", isRestDay: false },
      { dayName: "Czwartek", isRestDay: true, notes: "Lekkie rozciąganie." },
      { dayName: "Piątek", assignedWorkoutId: "custom_cardio_long", assignedWorkoutName: "Długie Kardio Wytrzymałościowe (Bieg)", isRestDay: false, notes: "45-60 min spokojnym tempem." },
      { dayName: "Sobota", assignedWorkoutId: "custom_active_recovery", assignedWorkoutName: "Aktywna Regeneracja (Pływanie lub Joga)", isRestDay: false },
      { dayName: "Niedziela", isRestDay: true },
    ],
  },
  {
    id: 'plan3',
    name: 'Elastyczność i Mobilność Zen (Detale)',
    description: 'Plan skupiony na ćwiczeniach rozciągających, jodze i mobilizacji stawów, idealny dla poprawy zakresu ruchu i relaksu.',
    goal: 'Poprawa elastyczności',
    duration: '4 tygodnie',
    author: 'Zofia Wójcik',
    isPublic: false,
    schedule: [
      { dayName: "Poniedziałek", assignedWorkoutId: "custom_stretch_1", assignedWorkoutName: "Poranne Rozciąganie Całego Ciała", isRestDay: false },
      { dayName: "Wtorek", isRestDay: true },
      { dayName: "Środa", assignedWorkoutId: "custom_yoga_flow", assignedWorkoutName: "Płynna Joga Vinyasa", isRestDay: false },
      { dayName: "Czwartek", isRestDay: true },
      { dayName: "Piątek", assignedWorkoutId: "custom_mobility_work", assignedWorkoutName: "Mobilizacja Stawów Biodrowych i Barków", isRestDay: false },
      { dayName: "Sobota", isRestDay: true },
      { dayName: "Niedziela", assignedWorkoutId: "custom_relax_stretch", assignedWorkoutName: "Wieczorne Rozciąganie Relaksacyjne", isRestDay: false },
    ],
  },
  {
    id: 'default_plan_details',
    name: 'Przykładowy Plan Treningowy (Detale)',
    description: 'To jest ogólny plan treningowy. Dostosuj go do swoich potrzeb lub wybierz inny z listy.',
    goal: 'Ogólny rozwój',
    duration: 'Elastyczny',
    schedule: [
      { dayName: "Poniedziałek", assignedWorkoutName: "Trening Całego Ciała A", isRestDay: false },
      { dayName: "Wtorek", isRestDay: true, notes: "Aktywny odpoczynek" },
      { dayName: "Środa", assignedWorkoutName: "Trening Całego Ciała B", isRestDay: false },
      { dayName: "Czwartek", isRestDay: true },
      { dayName: "Piątek", assignedWorkoutName: "Trening Całego Ciała C", isRestDay: false },
      { dayName: "Sobota", isRestDay: true },
      { dayName: "Niedziela", isRestDay: true, notes: "Pełna regeneracja" },
    ],
  },
];

// --- Data for Create/Edit Plan Page ---
export const MOCK_AVAILABLE_WORKOUTS_FOR_PLAN_EDITOR: PlanSelectableWorkout[] = [
  { id: "wk1", name: "Poranny Trening Siłowy", type: "Siłowy" },
  { id: "wk2", name: "Szybkie Cardio HIIT", type: "Cardio" },
  { id: "wk3", name: "Wieczorne Rozciąganie", type: "Rozciąganie" },
  { id: "wk4", name: "Trening Brzucha Express", type: "Siłowy" },
  { id: "wk5", name: "Długie Wybieganie", type: "Cardio" },
  { id: "template_full_body_a", name: "Szablon Full Body A", type: "Siłowy"},
  { id: "template_push", name: "Szablon Push (Początkujący)", type: "Siłowy"},
  { id: "template_pull", name: "Szablon Pull (Początkujący)", type: "Siłowy"},
  { id: "template_legs", name: "Szablon Nogi (Początkujący)", type: "Siłowy"},
  // Add any newly created "quick workouts" here if we want them persisted across sessions in mock
];

export const MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR: PlanRichDayTemplate[] = [
  { id: "tpl_push_day", name: "Szablon: Dzień Push", assignedWorkoutId: "template_push", assignedWorkoutName: "Szablon Push (Początkujący)", isRestDay: false },
  { id: "tpl_pull_day", name: "Szablon: Dzień Pull", assignedWorkoutId: "template_pull", assignedWorkoutName: "Szablon Pull (Początkujący)", isRestDay: false },
  { id: "tpl_legs_day", name: "Szablon: Dzień Nóg", assignedWorkoutId: "template_legs", assignedWorkoutName: "Szablon Nogi (Początkujący)", isRestDay: false },
  { id: "tpl_full_body_day", name: "Szablon: Full Body", assignedWorkoutId: "template_full_body_a", assignedWorkoutName: "Szablon Full Body A", isRestDay: false },
  { id: "tpl_active_rest_day", name: "Szablon: Odpoczynek Aktywny", assignedWorkoutId: "wk3", assignedWorkoutName: "Wieczorne Rozciąganie", isRestDay: false },
  { id: "tpl_pure_rest_day", name: "Szablon: Całkowity Odpoczynek", isRestDay: true },
];
