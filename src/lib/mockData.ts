
import type { Exercise as SelectableExerciseType } from "@/components/workout/exercise-selection-dialog";
import type { RecordedSet as WorkoutRecordedSet, ExerciseInWorkout as PlanExerciseInWorkout, Workout as ActiveWorkoutType } from "@/app/(app)/dashboard/workout/active/[workoutId]/page";
import type { SelectableWorkout as PlanSelectableWorkout } from "@/components/plans/select-workout-dialog";
import type { RichDayTemplate as PlanRichDayTemplate } from "@/app/(app)/dashboard/plans/create/page";
import type { Measurement } from "@/app/(app)/dashboard/measurements/page";
import type { PersonalBest } from "@/app/(app)/dashboard/personal-bests/page";
import type { ProgressPhoto } from "@/app/(app)/dashboard/progress-photos/page";
import type { WellnessEntry } from "@/app/(app)/dashboard/wellness-journal/page.tsx";
import type { Portion } from "@/components/hydration/add-edit-portion-dialog";
import type { UserGoal, SimpleHistoricalWorkoutSession as StatsSimpleHistoricalWorkoutSession, SimpleMeasurement as StatsSimpleMeasurement, WellnessEntryForStats as StatsWellnessEntryForStats } from "@/app/(app)/dashboard/statistics/page";
import type { MockUser as FeedMockUser, MockPost as FeedMockPost, MockNotification as FeedMockNotification } from "@/app/(app)/dashboard/community/feed/page";
import type { RankingUser as CommunityRankingUser } from "@/app/(app)/dashboard/community/rankings/page"; // Changed from discover page
import type { DiscoverableContent as CommunityDiscoverableContent } from "@/app/(app)/dashboard/community/discover/page";


// --- Original MOCK_EXERCISES_DATABASE (from workout/create & active workout) ---
const INITIAL_MOCK_EXERCISES_DATABASE_DATA: SelectableExerciseType[] = [
  { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", category: "Klatka", instructions: "Opuść sztangę do klatki piersiowej, a następnie dynamicznie wypchnij w górę. Łokcie prowadź pod kątem około 45 stopni względem tułowia.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex2", name: "Przysiady ze sztangą", category: "Nogi", instructions: "Sztangę trzymaj na barkach (low-bar lub high-bar). Zejdź co najmniej do momentu, gdy uda będą równoległe do podłoża. Kolana prowadź na zewnątrz, w linii ze stopami.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex3", name: "Martwy ciąg", category: "Plecy", instructions: "Podejdź do sztangi tak, aby piszczele jej dotykały. Chwyć sztangę nachwytem lub chwytem mieszanym. Utrzymuj proste plecy i podnieś ciężar, prostując biodra i kolana jednocześnie.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex4", name: "Podciąganie na drążku", category: "Plecy", instructions: "Chwyć drążek nachwytem, nieco szerzej niż szerokość barków. Podciągnij się, aż broda znajdzie się nad drążkiem. Kontrolowanie opuszczaj ciało.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex5", name: "Pompki", category: "Klatka", instructions: "Dłonie rozstaw na szerokość barków. Ciało powinno tworzyć prostą linię od głowy do pięt. Opuść klatkę piersiową nisko nad podłogę, a następnie wypchnij się w górę.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex6", name: "Bieg na bieżni", category: "Cardio", instructions: "Ustaw odpowiednią prędkość i nachylenie. Utrzymuj stałe tempo lub wykonuj interwały.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex7", name: "Skakanka", category: "Cardio", instructions: "Skacz rytmicznie, utrzymując lekko ugięte kolana. Kręć skakanką za pomocą nadgarstków.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex8", name: "Rozciąganie dynamiczne", category: "Całe ciało", instructions: "Wykonuj płynne ruchy rozciągające główne grupy mięśniowe, np. wymachy ramion, krążenia bioder, wykroki z rotacją.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex9", name: "Wyciskanie żołnierskie (OHP)", category: "Barki", instructions: "Sztangę trzymaj na wysokości obojczyków. Wypchnij ciężar pionowo nad głowę, blokując łokcie. Kontrolowanie opuść.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex10", name: "Uginanie ramion ze sztangą", category: "Ramiona", instructions: "Trzymaj sztangę podchwytem na szerokość barków. Uginaj ramiona w łokciach, unosząc ciężar do wysokości barków. Unikaj bujania tułowiem.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex11", name: "Plank", category: "Brzuch", instructions: "Oprzyj się na przedramionach i palcach stóp. Ciało powinno tworzyć prostą linię. Napnij mięśnie brzucha i pośladków.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex12", name: "Wiosłowanie sztangą", category: "Plecy", instructions: "Pochyl tułów, utrzymując proste plecy. Chwyć sztangę nachwytem i przyciągaj ją do dolnej części brzucha, ściągając łopatki.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex13", name: "Wykroki", category: "Nogi", instructions: "Zrób duży krok w przód i opuść biodra, aż oba kolana będą zgięte pod kątem 90 stopni. Wróć do pozycji wyjściowej i powtórz drugą nogą.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex14", name: "Unoszenie hantli bokiem", category: "Barki", instructions: "Trzymając hantle w dłoniach, unoś ramiona na boki do wysokości barków. Łokcie lekko ugięte.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex15", name: "Francuskie wyciskanie sztangielki", category: "Ramiona", instructions: "Trzymaj sztangielkę oburącz za głową. Prostuj ramiona, unosząc ciężar nad głowę. Skup się na pracy tricepsów.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex16", name: "Allah Pompki (Modlitewniki)", category: "Brzuch", instructions: "Klęcząc, oprzyj łokcie na podłodze. Zbliżaj głowę do podłogi, zaokrąglając plecy i napinając brzuch.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex17", name: "Przysiad bułgarski", category: "Nogi", instructions: "Jedna noga oparta z tyłu na podwyższeniu. Wykonuj przysiad na nodze wykrocznej, schodząc nisko.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex18", name: "Wyciskanie hantli na ławce skośnej", category: "Klatka", instructions: "Ustaw ławkę pod kątem 30-45 stopni. Wyciskaj hantle, skupiając się na górnej części klatki piersiowej.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex19", name: "Orbitrek (30 min)", category: "Cardio", instructions: "Utrzymuj płynne ruchy, angażując zarówno nogi, jak i ramiona. Dostosuj opór do swoich możliwości.", videoUrl: "https://www.youtube.com/watch?v=example"},
  { id: "ex20", name: "Wall sit (60s)", category: "Nogi", instructions: "Oprzyj plecy o ścianę, zsuwając się, aż uda będą równoległe do podłogi. Utrzymaj pozycję przez określony czas.", videoUrl: "https://www.youtube.com/watch?v=example"},
];
export { INITIAL_MOCK_EXERCISES_DATABASE_DATA as MOCK_EXERCISES_DATABASE };
export type { SelectableExerciseType };

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
  region?: string; // Added from community/discover
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
    region: "Małopolskie",
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
    region: "Śląskie",
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
    workoutId: "wk1",
    workoutName: "Poranny Trening Siłowy",
    workoutType: "Siłowy",
    startTime: "2024-07-29T08:15:00.000Z",
    endTime: "2024-07-29T09:20:00.000Z",
    totalTimeSeconds: 3900,
    recordedSets: {
      ex1: [{ setNumber: 1, weight: "65", reps: "10", rpe: 7 }, { setNumber: 2, weight: "70", reps: "8", rpe: 8}, { setNumber: 3, weight: "70", reps: "7", rpe: 8.5, notes: "Ostatnie ciężko"}],
      ex2: [{ setNumber: 1, weight: "100", reps: "6", rpe: 8 }, { setNumber: 2, weight: "105", reps: "5", rpe: 9, notes: "Nowy PR!"}],
    },
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
      { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 3, defaultReps: "5-8", defaultRest: 120 },
    ],
    difficulty: DifficultyRating.Sredni,
    calculatedTotalVolume: (65*10) + (70*8) + (70*7) + (100*6) + (105*5),
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
];

export const MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR: PlanRichDayTemplate[] = [
  { id: "tpl_push_day", name: "Szablon: Dzień Push", assignedWorkoutId: "template_push", assignedWorkoutName: "Szablon Push (Początkujący)", isRestDay: false },
  { id: "tpl_pull_day", name: "Szablon: Dzień Pull", assignedWorkoutId: "template_pull", assignedWorkoutName: "Szablon Pull (Początkujący)", isRestDay: false },
  { id: "tpl_legs_day", name: "Szablon: Dzień Nóg", assignedWorkoutId: "template_legs", assignedWorkoutName: "Szablon Nogi (Początkujący)", isRestDay: false },
  { id: "tpl_full_body_day", name: "Szablon: Full Body", assignedWorkoutId: "template_full_body_a", assignedWorkoutName: "Szablon Full Body A", isRestDay: false },
  { id: "tpl_active_rest_day", name: "Szablon: Odpoczynek Aktywny", assignedWorkoutId: "wk3", assignedWorkoutName: "Wieczorne Rozciąganie", isRestDay: false },
  { id: "tpl_pure_rest_day", name: "Szablon: Całkowity Odpoczynek", isRestDay: true },
];

// --- From Dashboard Page ---
// Updated DashboardLastWorkout interface to match API response
export interface DashboardLastWorkout {
  id: string;
  name: string;
  date: string; // ISO String for start time
  durationSeconds: number;
  exerciseCount: number;
  calories?: string; // Made optional, as it's not in DB
  link: string;
}
export const MOCK_LAST_WORKOUT_DASHBOARD_OLD: Omit<DashboardLastWorkout, "id" | "durationSeconds" | "exerciseCount"> & { duration: string; exercises: number } = {
  name: 'Full Body Strength - Wtorek',
  date: '2024-07-30',
  duration: '55 min',
  calories: '410 kcal',
  exercises: 6,
  link: '/dashboard/history/hist1',
};

export interface DashboardProgressStats { weightTrend: 'stable' | 'up' | 'down'; currentWeight: string; workoutsThisWeek: number; weeklyGoal: number; }
export const MOCK_PROGRESS_STATS_DASHBOARD: DashboardProgressStats = {
  weightTrend: 'stable',
  currentWeight: '70kg',
  workoutsThisWeek: 3,
  weeklyGoal: 4,
};

export interface DashboardUpcomingReminder { id: string; title: string; time: string; link: string; } // ID changed to string
export const MOCK_UPCOMING_REMINDERS_DASHBOARD: DashboardUpcomingReminder[] = [
  { id: "rem1", title: 'Zaplanowany Trening: Nogi', time: 'Jutro, 18:00', link: '/dashboard/plans/plan1' },
  { id: "rem2", title: 'Sprawdź Tygodniowe Postępy', time: 'Niedziela, 20:00', link: '/dashboard/statistics' },
  { id: "rem3", title: 'Uzupełnij Dziennik Samopoczucia', time: 'Codziennie, 21:00', link: '/dashboard/wellness-journal'},
  { id: "rem4", title: 'Zaplanowany trening: Cardio Boost', time: 'Za 2 dni, 08:00', link: '/dashboard/plans/plan2'},
  { id: "rem5", title: 'Pamiętaj o pomiarach!', time: 'Piątek, 09:00', link: '/dashboard/measurements'},
];

export const MOCK_FITNESS_TIPS_DASHBOARD: string[] = [
  "Pamiętaj o prawidłowej technice – to klucz do unikania kontuzji i maksymalizacji efektów!",
  "Nawodnienie jest kluczowe! Pij wodę regularnie przez cały dzień, nie tylko podczas treningu.",
  "Nie zapominaj o rozgrzewce przed każdym treningiem i rozciąganiu po nim.",
  "Progresywne przeciążenie to podstawa budowania siły i masy mięśniowej.",
  "Odpoczynek i regeneracja są równie ważne jak sam trening. Daj swojemu ciału czas na odbudowę.",
  "Słuchaj swojego ciała. Jeśli czujesz ból (inny niż typowe zmęczenie mięśni), daj sobie odpocząć.",
  "Zbilansowana dieta to 70% sukcesu. Dbaj o to, co jesz!",
  "Małe kroki prowadzą do wielkich zmian. Bądź konsekwentny!",
  "Każdy trening się liczy, nawet ten krótki. Ważne, że działasz!",
  "Nie porównuj swojego rozdziału 1 do czyjegoś rozdziału 20. Skup się na własnej drodze."
];

// --- From Active Workout Page ---
export type Workout = ActiveWorkoutType; // Use existing type
export const MOCK_WORKOUTS_ACTIVE: Workout[] = [
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
      { id: "ex11", name: "Plank", defaultSets: 3, defaultReps: "60s", defaultRest: 45 }, // Corrected ex8 to ex11
      { id: "ex5", name: "Pompki", defaultSets: 3, defaultReps: "15-20", defaultRest: 60 },
    ],
  },
];

export interface MockPastSession { sessionId: string; exerciseId: string; date: string; setsPerformed: { weight: string | number; reps: string | number }[]; }
export const MOCK_WORKOUT_HISTORY_FOR_SUGGESTIONS: MockPastSession[] = [
  { sessionId: 's1', exerciseId: 'ex1', date: '2024-07-15T09:00:00Z', setsPerformed: [{ weight: 60, reps: 10 }, { weight: 60, reps: 10 }, { weight: 60, reps: 9 }] },
  { sessionId: 's2', exerciseId: 'ex1', date: '2024-07-22T09:00:00Z', setsPerformed: [{ weight: 62.5, reps: 8 }, { weight: 62.5, reps: 8 }, { weight: 62.5, reps: 7 }] },
  { sessionId: 's3', exerciseId: 'ex2', date: '2024-07-15T10:00:00Z', setsPerformed: [{ weight: 100, reps: 10 }, { weight: 100, reps: 10 }] },
  { sessionId: 's4', exerciseId: 'ex4', date: '2024-07-15T11:00:00Z', setsPerformed: [{ weight: 'BW', reps: 8 }, { weight: 'BW', reps: 7 }] },
];

// --- From Workout Summary Page ---
export interface MockPB { value: number | string; reps?: number; }
export const MOCK_EXISTING_PBS_SUMMARY: Record<string, MockPB> = {
  "ex1": { value: 95, reps: 5 },
  "ex2": { value: 130, reps: 5 },
  "ex4": { value: "BW", reps: 12 },
};
export const MOCK_MOTIVATIONAL_MESSAGES_SUMMARY: string[] = [
  "Świetna robota! Każdy trening to krok bliżej celu.",
  "Dobra robota! Pamiętaj, że konsekwencja jest kluczem.",
  "Niesamowity wysiłek! Odpocznij i zregeneruj siły.",
  "Trening zaliczony! Jesteś maszyną!",
  "Tak trzymać! Twoja determinacja jest inspirująca.",
  "Cel osiągnięty na dziś! Brawo Ty!",
  "Pamiętaj, progres to nie zawsze ciężar - technika i samopoczucie też są ważne."
];

// --- From Plans List Page ---
export interface TrainingPlanListItem { id: string; name: string; description: string; goal: string; duration: string; icon?: React.ElementType; }
export const MOCK_TRAINING_PLANS_LIST: TrainingPlanListItem[] = [
  { id: 'plan1', name: 'Siła Początkującego Herkulesa', description: 'Kompleksowy plan dla osób rozpoczynających przygodę z treningiem siłowym...', goal: 'Budowa podstawowej siły i masy mięśniowej', duration: '8 tygodni' },
  { id: 'plan2', name: 'Kardio Spalacz Kalorii', description: 'Intensywny plan kardio interwałowego i aerobowego...', goal: 'Redukcja tkanki tłuszczowej i poprawa kondycji', duration: '6 tygodni' },
  { id: 'plan3', name: 'Elastyczność i Mobilność Zen', description: 'Plan skupiony na ćwiczeniach rozciągających, jodze i mobilizacji...', goal: 'Poprawa elastyczności i mobilności', duration: '4 tygodnie' },
  { id: 'plan4', name: 'Domowy Trening Full Body', description: 'Efektywny plan treningowy całego ciała możliwy do wykonania w domu...', goal: 'Utrzymanie formy i wszechstronny rozwój', duration: 'Ciągły' },
];

// --- From Measurements Page ---
export const INITIAL_MOCK_MEASUREMENTS: Measurement[] = [
  { id: "uuid1", date: new Date(2024, 6, 1).toISOString(), weight: 75.5, bodyParts: [{ name: "Klatka piersiowa (cm)", value: 100 }, { name: "Talia (cm)", value: 80 }], notes: "Pierwszy pomiar." },
  { id: "uuid2", date: new Date(2024, 6, 15).toISOString(), weight: 74.8, bodyParts: [{ name: "Klatka piersiowa (cm)", value: 99.5 }, { name: "Talia (cm)", value: 79 }] },
  { id: "uuid3", date: new Date(2024, 7, 1).toISOString(), weight: 74.0, bodyParts: [{ name: "Klatka piersiowa (cm)", value: 99 }, { name: "Talia (cm)", value: 78 }, { name: "Biodra (cm)", value: 94 }], notes: "Czuję się lżej." },
];
export const USER_HEIGHT_CM_MEASUREMENTS: number | null = 175;
export const PREDEFINED_BODY_PARTS = [
  { key: "chest", name: "Klatka piersiowa (cm)", label: "Klatka" },
  { key: "waist", name: "Talia (cm)", label: "Talia" },
  { key: "hips", name: "Biodra (cm)", label: "Biodra" },
  { key: "bicepsL", name: "Biceps lewy (cm)", label: "Biceps L." },
  { key: "bicepsR", name: "Biceps prawy (cm)", label: "Biceps P." },
  { key: "thighL", name: "Udo lewe (cm)", label: "Udo L." },
  { key: "thighR", name: "Udo prawe (cm)", label: "Udo P." },
  { key: "calfL", name: "Łydka lewa (cm)", label: "Łydka L." },
  { key: "calfR", name: "Łydka prawa (cm)", label: "Łydka P." },
  { key: "shoulders", name: "Barki (cm)", label: "Barki" },
  { key: "neck", name: "Szyja (cm)", label: "Szyja" },
  { key: "forearmL", name: "Przedramię lewe (cm)", label: "Przedramię L."},
  { key: "forearmR", name: "Przedramię prawe (cm)", label: "Przedramię P."},
];


// --- From Personal Bests Page ---
export const INITIAL_MOCK_PBS: PersonalBest[] = [
  { id: "pb1", exerciseId: "ex1", exerciseName: "Wyciskanie sztangi na ławce płaskiej", recordType: "weight_reps", value: { weight: 100, reps: 5 }, date: new Date(2024, 6, 15).toISOString(), notes: "Nowy rekord!" },
  { id: "pb2", exerciseId: "ex2", exerciseName: "Przysiady ze sztangą", recordType: "weight_reps", value: { weight: 140, reps: 3 }, date: new Date(2024, 7, 1).toISOString() },
  { id: "pb3", exerciseId: "ex6", exerciseName: "Bieg na bieżni (30 min)", recordType: "time_seconds", value: { timeSeconds: 30 * 60 }, date: new Date(2024, 5, 20).toISOString(), notes: "Najszybsze 30 min na bieżni." },
  { id: "pb4", exerciseId: "ex4", exerciseName: "Podciąganie na drążku", recordType: "max_reps", value: { weight: "BW", reps: 15 }, date: new Date(2024, 7, 10).toISOString(), notes: "Pierwszy raz 15 podciągnięć!" },
];
export const RECORD_TYPE_LABELS_PBS: Record<PersonalBest["recordType"], string> = {
  weight_reps: "Ciężar x Powtórzenia",
  max_reps: "Maks. Powtórzeń",
  time_seconds: "Czas",
  distance_km: "Dystans",
};

// --- From Progress Photos Page ---
export const INITIAL_MOCK_PHOTOS: ProgressPhoto[] = [
  { id: "photo1", imageUrl: `https://placehold.co/400x600.png?text=Poczatek&random=${Math.random()}`, date: new Date(2024, 5, 1).toISOString(), description: "Początek redukcji." },
  { id: "photo2", imageUrl: `https://placehold.co/400x600.png?text=Miesiac+1&random=${Math.random()}`, date: new Date(2024, 6, 1).toISOString(), description: "Po miesiącu." },
  { id: "photo3", imageUrl: `https://placehold.co/400x600.png?text=Miesiac+2&random=${Math.random()}`, date: new Date(2024, 7, 1).toISOString(), description: "Widoczne zmiany!" },
];

// --- From Wellness Journal Page ---
export const INITIAL_MOCK_WELLNESS_ENTRIES: WellnessEntry[] = [
  { id: "well1", date: new Date(2024, 6, 28).toISOString(), wellBeing: 4, energyLevel: 3, sleepQuality: 5, stressLevel: 2, muscleSoreness: 3, context: "after_workout", notes: "Dobry dzień." },
  { id: "well2", date: new Date(2024, 6, 29).toISOString(), wellBeing: 5, energyLevel: 5, sleepQuality: 4, stressLevel: 1, muscleSoreness: 1, context: "morning", notes: "Pełen energii!" },
];
export const RATING_OPTIONS_WELLNESS = [
  { value: 1, label: "1 - Bardzo niski / Bardzo źle" },
  { value: 2, label: "2 - Niski / Źle" },
  { value: 3, label: "3 - Średni / Średnio" },
  { value: 4, label: "4 - Wysoki / Dobrze" },
  { value: 5, label: "5 - Bardzo wysoki / Bardzo dobrze" },
];
export const SORENESS_RATING_OPTIONS_WELLNESS = [
    { value: 1, label: "1 - Brak bólu" },
    { value: 2, label: "2 - Lekki ból" },
    { value: 3, label: "3 - Umiarkowany ból" },
    { value: 4, label: "4 - Silny ból" },
    { value: 5, label: "5 - Bardzo silny ból" },
];
export const CONTEXT_OPTIONS_WELLNESS = [
    { value: "general", label: "Ogólny" },
    { value: "before_workout", label: "Przed treningiem" },
    { value: "after_workout", label: "Po treningu" },
    { value: "morning", label: "Rano" },
    { value: "evening", label: "Wieczorem" },
    { value: "other", label: "Inny (opisz w notatkach)"},
];

// --- From Hydration Page ---
export const DEFAULT_HYDRATION_PORTIONS: Portion[] = [
    { id: "default-glass", name: "Szklanka", amount: 250 },
    { id: "default-bottle-small", name: "Mała Butelka", amount: 500 },
    { id: "default-bottle-large", name: "Duża Butelka", amount: 1000 },
];
export interface ReminderSettings {
    enabled: boolean;
    intervalMinutes: number;
    startTime: string;
    endTime: string;
    playSound: boolean;
}
export const DEFAULT_REMINDER_SETTINGS_HYDRATION: ReminderSettings = {
    enabled: false,
    intervalMinutes: 60,
    startTime: "08:00",
    endTime: "22:00",
    playSound: false,
};


// --- From Statistics Page ---
export const MOCK_HISTORY_SESSIONS_FOR_STATS: StatsSimpleHistoricalWorkoutSession[] = [
  { id: "hist1", workoutName: "Poranny Trening Siłowy", startTime: "2024-07-01T08:00:00.000Z", recordedSets: { ex1: [{ weight: "60", reps: "10" }] }, exercises: [{ id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}] },
  { id: "hist2", workoutName: "Szybkie Cardio HIIT", startTime: "2024-07-03T17:30:00.000Z", recordedSets: { ex6: [{ weight: "N/A", reps: "30min"}] }, exercises: [{id: "ex6", name: "Bieg na bieżni"}] },
  { id: "hist3", workoutName: "Trening Siłowy Całego Ciała", startTime: "2024-07-08T08:15:00.000Z", recordedSets: { ex1: [{ weight: "65", reps: "10" }, { weight: "70", reps: "8" }], ex2: [{ weight: "100", reps: "6"}], ex4: [{ weight: "BW", reps: "8"}] }, exercises: [ { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}, {id: "ex2", name: "Przysiady ze sztangą"}, {id: "ex4", name: "Podciąganie na drążku"} ] },
  { id: "hist4", workoutName: "Wieczorny Trening Nóg", startTime: "2024-07-10T19:00:00.000Z", recordedSets: { ex2: [{ weight: "105", reps: "5" }, { weight: "110", reps: "5" }] }, exercises: [{id: "ex2", name: "Przysiady ze sztangą"}] },
  { id: "hist5", workoutName: "Trening Barków i Ramion", startTime: "2024-07-15T08:00:00.000Z", recordedSets: { ex9: [{ weight: "25", reps: "10" }], ex10: [{ weight: "15", reps: "12"}] }, exercises: [ { id: "ex9", name: "Wyciskanie żołnierskie (OHP)"}, { id: "ex10", name: "Uginanie ramion ze sztangą"} ] },
  { id: "hist6", workoutName: "Full Body Workout", startTime: "2024-07-22T10:00:00.000Z", recordedSets: { ex1: [{ weight: "75", reps: "5" }], ex2: [{ weight: "110", reps: "5" }], ex12: [{ weight: "60", reps: "8"}] }, exercises: [ { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}, {id: "ex2", name: "Przysiady ze sztangą"}, { id: "ex12", name: "Wiosłowanie sztangą"} ] },
  { id: "hist7", workoutName: "Klatka i Triceps", startTime: "2024-06-20T09:00:00.000Z", recordedSets: { ex1: [{ weight: "55", reps: "12" }], ex5: [{weight:"BW", reps: "15"}] }, exercises: [{ id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej"}, {id: "ex5", name: "Pompki"}] },
];
export const MOCK_MEASUREMENTS_FOR_STATS: StatsSimpleMeasurement[] = [
  { id: "m1", date: new Date(2024, 5, 15).toISOString(), weight: 76.0 },
  { id: "m2", date: new Date(2024, 6, 1).toISOString(), weight: 75.5 },
  { id: "m3", date: new Date(2024, 6, 8).toISOString(), weight: 75.0 },
  { id: "m4", date: new Date(2024, 6, 15).toISOString(), weight: 74.8 },
  { id: "m5", date: new Date(2024, 6, 22).toISOString(), weight: 74.5 },
  { id: "m6", date: new Date(2024, 6, 29).toISOString(), weight: 74.0 },
];
export const MOCK_WELLNESS_ENTRIES_FOR_STATS_PAGE: StatsWellnessEntryForStats[] = [
  { date: "2024-07-01", wellBeing: 4, energyLevel: 3, sleepQuality: 5 },
  { date: "2024-07-03", wellBeing: 3, energyLevel: 4, sleepQuality: 3 },
  { date: "2024-07-08", wellBeing: 5, energyLevel: 5, sleepQuality: 4 },
  { date: "2024-07-10", wellBeing: 2, energyLevel: 2, sleepQuality: 2 },
  { date: "2024-07-15", wellBeing: 4, energyLevel: 4, sleepQuality: 5 },
  { date: "2024-07-22", wellBeing: 3, energyLevel: 3, sleepQuality: 4 },
  { date: "2024-06-20", wellBeing: 4, energyLevel: 4, sleepQuality: 4 },
];
export const INITIAL_USER_GOALS_STATS: UserGoal[] = [
  { id: "goal1", goalName: "Przysiad 120kg x 5", metric: "Przysiady ze sztangą - Objętość", currentValue: (110 * 5), targetValue: (120 * 5), deadline: new Date("2024-12-31"), notes: "Cel na koniec roku" },
  { id: "goal2", goalName: "Wyciskanie 80kg", metric: "Wyciskanie sztangi na ławce płaskiej - Max Ciężar", currentValue: 75, targetValue: 80, deadline: new Date("2024-10-30"), notes: "Cel na jesień" },
  { id: "goal3", goalName: "Trenuj 4x w tygodniu", metric: "Częstotliwość treningów", currentValue: 3, targetValue: 4, deadline: undefined, notes: "Cel regularności" },
];
export const EXERCISE_CATEGORIES_MAP_STATS: { [exerciseId: string]: string } = { "ex1": "Klatka", "ex2": "Nogi", "ex3": "Plecy", "ex4": "Plecy", "ex5": "Klatka", "ex6": "Cardio", "ex7": "Cardio", "ex8": "Całe ciało", "ex9": "Barki", "ex10": "Ramiona", "ex11": "Brzuch", "ex12": "Plecy", "ex13": "Nogi", "ex14": "Barki", "ex15": "Ramiona", "ex16": "Brzuch", "ex17": "Nogi", "ex18": "Klatka"};
export const MOCK_GOAL_METRICS_STATS = [ "Waga (kg)", "Obwód talii (cm)", "Przysiad - Objętość (kg*powt)", "Przysiad - Max Ciężar (kg)", "Wyciskanie sztangi - Max Ciężar (kg)", "Częstotliwość treningów (treningi/tydz.)", "Czas biegu na 5km (minuty)", "Całkowita objętość tygodniowa (kg)", "Liczba kroków dziennie", ];

// --- From Community Feed Page ---
export const MOCK_USERS_FEED: FeedMockUser[] = [
  { id: "user1", name: "Aleksandra Fit", avatarUrl: "https://placehold.co/100x100.png?text=AF" },
  { id: "user2", name: "Krzysztof Trener", avatarUrl: "https://placehold.co/100x100.png?text=KT" },
  { id: "user3", name: "Fitness Explorer", avatarUrl: "https://placehold.co/100x100.png?text=FE" },
  { id: "currentUser", name: "Jan Kowalski (Ty)", avatarUrl: "https://placehold.co/100x100.png?text=JK" },
];
export const ALL_MOCK_POSTS_FEED: FeedMockPost[] = [
  { id: "post1", userId: "user1", content: "Dzisiejszy poranny bieg był niesamowity! Piękne widoki i nowa życiówka na 5km! 🏃‍♀️💨 #bieganie #motywacja", imageUrl: "https://placehold.co/600x400.png?text=Morning+Run", postType: 'image_post', likes: 25, likedByCurrentUser: false, comments: [ { id: "comment1-1", userId: "user2", userName: MOCK_USERS_FEED.find(u=>u.id==="user2")!.name, avatarUrl: MOCK_USERS_FEED.find(u=>u.id==="user2")!.avatarUrl, text: "Gratulacje! Świetna forma!", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() }, ], timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "post2", userId: "user2", content: "Ukończyłem właśnie 'Morderczy Trening Nóg'! Czuję, że żyję! 🔥", postType: 'workout_summary', workoutSummaryDetails: { name: 'Morderczy Trening Nóg', duration: '1h 15min', volume: '12,500 kg' }, likes: 42, likedByCurrentUser: true, comments: [ { id: "comment2-1", userId: "user1", userName: MOCK_USERS_FEED.find(u=>u.id==="user1")!.name, avatarUrl: MOCK_USERS_FEED.find(u=>u.id==="user1")!.avatarUrl, text: "Już nie mogę się doczekać!", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() }, { id: "comment2-2", userId: "user3", userName: MOCK_USERS_FEED.find(u=>u.id==="user3")!.name, avatarUrl: MOCK_USERS_FEED.find(u=>u.id==="user3")!.avatarUrl, text: "Wygląda ciekawie!", timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() }, ], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: "post3", userId: "user3", content: "Jakie są Wasze ulubione zdrowe przekąski po treningu? Szukam inspiracji! 🍎🍌🥜", postType: 'text_only', likes: 15, likedByCurrentUser: false, comments: [], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "post4", userId: "user1", content: "Dziś rest day, ale jutro wracam do gry! Plan na jutro: trening PUSH.", postType: 'text_only', likes: 18, likedByCurrentUser: false, comments: [], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  { id: "post5", userId: "user2", content: "Check out this new healthy recipe I tried! So delicious and easy to make. #healthyfood #recipe", imageUrl: "https://placehold.co/600x400.png?text=Healthy+Recipe", postType: 'image_post', likes: 33, likedByCurrentUser: true, comments: [], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
  { id: "post6", userId: "currentUser", content: "Właśnie ukończyłem trening 'Siła Całego Ciała'. Jest moc!", postType: 'workout_summary', workoutSummaryDetails: { name: 'Siła Całego Ciała', duration: '0h 55min', volume: '8,200 kg' }, likes: 10, likedByCurrentUser: false, comments: [], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() },
];
export const INITIAL_MOCK_NOTIFICATIONS_FEED: FeedMockNotification[] = [
  { id: "notif1", type: 'like', user: MOCK_USERS_FEED[0], postContentPreview: "Ukończyłem właśnie 'Morderczy Trening Nóg'...", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), read: false },
  { id: "notif2", type: 'comment', user: MOCK_USERS_FEED[1], postContentPreview: "Jakie są Wasze ulubione zdrowe przekąski...", timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), read: false },
  { id: "notif3", type: 'new_post', user: MOCK_USERS_FEED[0], postContentPreview: "Dziś rest day, ale jutro wracam...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true },
  { id: "notif4", type: 'follow', user: MOCK_USERS_FEED[2], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: false },
];
export const POSTS_PER_PAGE_FEED = 3;
export const CURRENT_USER_ID_FEED = "currentUser";

// --- From Community Discover Page ---
export const MOCK_REGIONS_DISCOVER: string[] = ["Wszystkie", "Mazowieckie", "Małopolskie", "Śląskie", "Dolnośląskie", "Wielkopolskie", "Pomorskie", "Łódzkie", "Kujawsko-Pomorskie"];
export const MOCK_DISCOVERABLE_CONTENT_COMMUNITY: CommunityDiscoverableContent[] = [
  { id: "wk1", title: "Siła Początkującego Herkulesa", type: "Trening", category: "Siłowy", description: "Podstawowy trening siłowy dla osób zaczynających.", author: "Krzysztof Trener", imageUrl: "https://placehold.co/600x400.png?text=Siła+Początkującego" },
  { id: "plan1", title: "Spalacz Kalorii - Plan HIIT", type: "Plan Treningowy", category: "Redukcja", description: "6-tygodniowy plan interwałowy dla maksymalnego spalania.", author: "Aleksandra Fit", imageUrl: "https://placehold.co/600x400.png?text=Plan+HIIT" },
  { id: "wk2", title: "Domowy Trening Full Body", type: "Trening", category: "Ogólnorozwojowy", description: "Efektywny trening całego ciała bez specjalistycznego sprzętu.", author: "Fitness Explorer", imageUrl: "https://placehold.co/600x400.png?text=Full+Body+Dom" },
  { id: "plan2", title: "Joga dla Spokoju Ducha - Plan 4 Tygodnie", type: "Plan Treningowy", category: "Rozciąganie", description: "Codzienne sesje jogi dla poprawy elastyczności i relaksu.", author: "Maria Joginka", imageUrl: "https://placehold.co/600x400.png?text=Joga+Plan" },
  { id: "wk3", title: "Przygotowanie do Maratonu - Bieg Średniodystansowy", type: "Trening", category: "Cardio", description: "Trening biegowy 10-15km w ramach przygotowań do maratonu.", author: "Piotr Biegacz", imageUrl: "https://placehold.co/600x400.png?text=Bieg+Maraton"},
  { id: "plan3", title: "Budowa Masy Mięśniowej - Split 4-dniowy", type: "Plan Treningowy", category: "Budowa masy", description: "Intensywny plan splitowy dla zaawansowanych, ukierunkowany na hipertrofię.", author: "Tomasz Strongman", imageUrl: "https://placehold.co/600x400.png?text=Budowa+Masy" },
  { id: "wk4", title: "Rowerowa Trasa Widokowa (30km)", type: "Trening", category: "Cardio", description: "Relaksująca, ale wymagająca trasa rowerowa po okolicy.", author: "Anna Kolarz" },
];
export const CONTENT_CATEGORIES_DISCOVER: string[] = ["Wszystkie", "Siłowy", "Cardio", "Redukcja", "Ogólnorozwojowy", "Rozciąganie", "Budowa masy"];
export const CONTENT_TYPES_DISCOVER: string[] = ["Wszystkie", "Trening", "Plan Treningowy"];


// --- From Community Rankings Page ---
export const MOCK_RANKING_USERS_COMMUNITY: CommunityRankingUser[] = [
  { id: "user1", name: "Aleksandra Mistrzyni", avatarUrl: "https://placehold.co/100x100.png?text=AM", score: 0, completedWorkouts: 150, totalVolumeLifted: 250000, weeklyActivityScore: 950 },
  { id: "user2", name: "Krzysztof Siłacz", avatarUrl: "https://placehold.co/100x100.png?text=KS", score: 0, completedWorkouts: 120, totalVolumeLifted: 300000, weeklyActivityScore: 800 },
  { id: "user3", name: "Fitness Maniak", avatarUrl: "https://placehold.co/100x100.png?text=FM", score: 0, completedWorkouts: 200, totalVolumeLifted: 180000, weeklyActivityScore: 920 },
  { id: "user4", name: "Maria Biegaczka", avatarUrl: "https://placehold.co/100x100.png?text=MB", score: 0, completedWorkouts: 90, totalVolumeLifted: 50000, weeklyActivityScore: 700 },
  { id: "user5", name: "Piotr Wytrwały", avatarUrl: "https://placehold.co/100x100.png?text=PW", score: 0, completedWorkouts: 180, totalVolumeLifted: 220000, weeklyActivityScore: 880 },
  { id: "user6", name: "Jan Niezłomny", avatarUrl: "https://placehold.co/100x100.png?text=JN", score: 0, completedWorkouts: 50, totalVolumeLifted: 100000, weeklyActivityScore: 500 },
  { id: "user7", name: "Ewa Aktywna", avatarUrl: "https://placehold.co/100x100.png?text=EA", score: 0, completedWorkouts: 110, totalVolumeLifted: 150000, weeklyActivityScore: 750 },
  { id: "user8", name: "Tomasz Cel", avatarUrl: "https://placehold.co/100x100.png?text=TC", score: 0, completedWorkouts: 130, totalVolumeLifted: 190000, weeklyActivityScore: 820 },
  { id: "user9", name: "Zofia Zdrowa", avatarUrl: "https://placehold.co/100x100.png?text=ZZ", score: 0, completedWorkouts: 70, totalVolumeLifted: 80000, weeklyActivityScore: 600 },
  { id: "user10", name: "Adam Workout", avatarUrl: "https://placehold.co/100x100.png?text=AW", score: 0, completedWorkouts: 160, totalVolumeLifted: 270000, weeklyActivityScore: 900 },
];
export type RankingCategoryKey = "completedWorkouts" | "totalVolumeLifted" | "weeklyActivityScore";


// --- From Profile Edit Page & Account Settings Page ---
export const MOCK_USER_DATA_EDIT_PROFILE = {
  id: "current_user_id",
  fullName: "Użytkownik Testowy",
  username: "test_user_account",
  email: "test@example.com",
  bio: "To jest przykładowy opis bio dla użytkownika testowego.",
  fitnessLevel: "Średniozaawansowany" as "Początkujący" | "Średniozaawansowany" | "Zaawansowany",
  avatarUrl: "https://placehold.co/200x200.png?text=TU",
  joinDate: new Date().toISOString(), // For consistency if used elsewhere
  dateOfBirth: new Date(1990, 5, 15).toISOString(),
  gender: "male" as "male" | "female",
  weight: 75.5,
  height: 180,
};
export interface UserPrivacySettings {
  isActivityPublic: boolean;
  isFriendsListPublic: boolean;
  isSharedPlansPublic: boolean;
}
export const DEFAULT_PRIVACY_SETTINGS: UserPrivacySettings = {
  isActivityPublic: true,
  isFriendsListPublic: true,
  isSharedPlansPublic: true,
};
export const MOCK_LOGIN_HISTORY_ACCOUNT_PAGE = [
    {id: "lh1", date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), type: "Logowanie", ip: "192.168.1.10 (Przybliżone)", device: "Chrome na Windows"},
    {id: "lh2", date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), type: "Zmiana hasła", ip: "89.123.45.67 (Przybliżone)", device: "Safari na iPhone"},
    {id: "lh3", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), type: "Logowanie", ip: "192.168.1.12 (Przybliżone)", device: "Aplikacja mobilna Android"},
];
export const MOCK_BACKUP_CODES_ACCOUNT_PAGE = ["1A2B-C3D4", "E5F6-G7H8", "I9J0-K1L2", "M3N4-O5P6", "Q7R8-S9T0"];


// --- From Settings/Reminders Page ---
export const MOCK_PLANS_FOR_REMINDERS_SETTINGS = [
    { id: "plan1", name: "Mój Plan Siłowy Wiosna" },
    { id: "plan2", name: "Przygotowanie do Maratonu Lato" },
    { id: "plan3", name: "Joga dla Początkujących - Lipiec" },
];
export const DAYS_OF_WEEK_REMINDERS = [
  { id: "monday", label: "Poniedziałek" }, { id: "tuesday", label: "Wtorek" },
  { id: "wednesday", label: "Środa" }, { id: "thursday", label: "Czwartek" },
  { id: "friday", label: "Piątek" }, { id: "saturday", label: "Sobota" },
  { id: "sunday", label: "Niedziela" },
] as const;

// --- From Quick Add Exercise Dialog & Exercise Selection Dialog (workout create page) ---
export const EXERCISE_CATEGORIES_DIALOG = [ "Wszystkie", "Klatka", "Plecy", "Nogi", "Barki", "Ramiona", "Brzuch", "Cardio", "Całe ciało", "Inne" ];

// --- From Plan Create/Edit Page ---
export const PLAN_GOALS_OPTIONS_PLAN_FORM = [ "Budowa siły", "Redukcja tkanki tłuszczowej", "Poprawa kondycji", "Utrzymanie formy", "Wszechstronny rozwój", "Poprawa elastyczności", "Inny", ];
export const DAYS_OF_WEEK_PLAN_FORM = [ "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela" ];
export const WORKOUT_TYPES_PLAN_QUICK_CREATE = [ "Siłowy", "Cardio", "Rozciąganie", "Mieszany", "Inny", ];

// --- From Registration Form ---
export const FITNESS_LEVEL_OPTIONS_REGISTRATION = ["beginner", "intermediate", "advanced"];

// --- From Workout Start Page ---
export const WORKOUT_TYPES_FILTER_START_WORKOUT = ["Wszystkie", "Siłowy", "Cardio", "Rozciąganie"];

