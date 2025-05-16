
import type { Exercise as SelectableExerciseType } from "@/components/workout/exercise-selection-dialog";

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


// --- Moved from src/app/(app)/dashboard/profile/[userId]/page.tsx ---
export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string; // Added for consistency based on how profile data is stored/retrieved
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
  // Fields from Account Settings for a more complete profile
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

// Mock for current user (this user is logged in)
export const MOCK_CURRENT_USER_PROFILE: UserProfile = {
  id: "current_user_id", // Special ID for logged-in user
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
  role: 'admin', // Current test user can be an admin
  dateOfBirth: new Date(1992, 3, 10).toISOString(),
  gender: "male",
  weight: 80,
  height: 182,
};
// Add current user to the DB so they can be "found" by ID
MOCK_USER_PROFILES_DB.push(MOCK_CURRENT_USER_PROFILE);
