
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  UserCircle2,
  Settings2,
  PlusCircle,
  Eye,
  ClipboardList,
  Users,
  BookOpen,
  MessageSquare,
  Dumbbell,
  Award,
  Trash2,
  Loader2,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import type { UserPrivacySettings } from "@/components/profile/profile-privacy-settings-dialog";

interface MockActivityItem {
  id: string;
  type: "new_post" | "shared_workout" | "achieved_pb";
  content: string;
  timestamp: string;
  link?: string;
  workoutName?: string;
  pbValue?: string;
}

interface MockFriend {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
}

interface MockSharedPlan {
  id: string;
  name: string;
  goal: string;
  description?: string;
  icon?: React.ElementType;
}

interface MockUserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  fitnessLevel: "Początkujący" | "Średniozaawansowany" | "Zaawansowany";
  joinDate: string;
  stats?: {
    completedWorkouts: number;
    followers: number;
    following: number;
  };
  activities?: MockActivityItem[];
  friends?: MockFriend[];
  sharedPlans?: MockSharedPlan[];
  privacySettings?: UserPrivacySettings;
  role?: 'client' | 'trener' | 'admin';
}

const LOGGED_IN_USER_ID = "current_user_id"; // This should ideally come from a global auth context

export const MOCK_USER_PROFILES_DB: MockUserProfile[] = [
  {
    id: LOGGED_IN_USER_ID,
    fullName: "Jan Kowalski",
    username: "jankowalski_fit",
    email: "jan.kowalski@example.com",
    avatarUrl: "https://placehold.co/200x200.png?text=JK",
    bio: "Entuzjasta fitnessu i zdrowego stylu życia. Dążę do ciągłego rozwoju i przekraczania własnych granic. Lubię dzielić się swoimi postępami i motywować innych!",
    fitnessLevel: "Średniozaawansowany",
    joinDate: "2023-05-15T10:00:00.000Z",
    stats: { completedWorkouts: 125, followers: 256, following: 180 },
    activities: [
      { id: "act1", type: "shared_workout", content: "Ukończyłem dzisiaj mocny trening nóg!", workoutName: "Trening Nóg #3", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), link: "/dashboard/history/hist1" },
      { id: "act2", type: "new_post", content: "Nowy tydzień, nowe cele! Kto ze mną? 💪 #motywacja", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
      { id: "act3", type: "achieved_pb", content: "Nowy rekord w wyciskaniu!", workoutName: "Wyciskanie sztangi na ławce płaskiej", pbValue: "105kg x 3", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), link: "/dashboard/personal-bests" },
    ],
    friends: [
      { id: "user2", name: "Anna Fit", username: "annafit_active", avatarUrl: "https://placehold.co/100x100.png?text=AF" },
      { id: "user3", name: "Piotr Trener", username: "piotr_coach", avatarUrl: "https://placehold.co/100x100.png?text=PT" },
      { id: "user4", name: "Kasia Biegaczka", username: "kasiaruns", avatarUrl: "https://placehold.co/100x100.png?text=KB" },
      { id: "user5", name: "Marek Siłacz", username: "marek_strong", avatarUrl: "https://placehold.co/100x100.png?text=MS" },
      { id: "user6", name: "Ola Joga", username: "olajoga", avatarUrl: "https://placehold.co/100x100.png?text=OJ" },
    ],
    sharedPlans: [
      { id: "plan1", name: "Mój Plan Siłowy na Masę", goal: "Budowa masy mięśniowej", description: "Sprawdzony plan na 8 tygodni, skupiony na progresji siłowej.", icon: Dumbbell },
      { id: "plan2", name: "Przygotowanie do Półmaratonu", goal: "Poprawa wytrzymałości", description: "12-tygodniowy plan biegowy dla średniozaawansowanych.", icon: BookOpen },
    ],
    privacySettings: { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true },
    role: 'admin',
  },
  {
    id: "user2",
    fullName: "Anna Fit",
    username: "annafit_active",
    email: "anna.fit@example.com",
    avatarUrl: "https://placehold.co/200x200.png?text=AF",
    bio: "Miłośniczka jogi, biegania i zdrowego odżywiania. Codziennie staram się być lepszą wersją siebie.",
    fitnessLevel: "Zaawansowany",
    joinDate: "2022-11-01T14:30:00.000Z",
    stats: { completedWorkouts: 350, followers: 1024, following: 300 },
    activities: [
      { id: "act_anna1", type: "new_post", content: "Poranna joga na plaży - najlepszy start dnia! 🧘‍♀️☀️", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    ],
    friends: [ { id: LOGGED_IN_USER_ID, name: "Jan Kowalski", username: "jankowalski_fit", avatarUrl: "https://placehold.co/100x100.png?text=JK" }],
    sharedPlans: [ { id: "plan_joga", name: "Joga dla Początkujących", goal: "Poprawa elastyczności", description: "Delikatny plan wprowadzający do świata jogi."} ],
    privacySettings: { isActivityPublic: true, isFriendsListPublic: false, isSharedPlansPublic: true },
    role: 'client',
  },
  {
    id: "user3",
    fullName: "Piotr Trener",
    username: "piotr_coach",
    email: "piotr.coach@example.com",
    avatarUrl: "https://placehold.co/200x200.png?text=PT",
    bio: "Certyfikowany trener personalny. Pomagam osiągać cele!",
    fitnessLevel: "Zaawansowany",
    joinDate: "2021-01-20T12:00:00.000Z",
    stats: { completedWorkouts: 500, followers: 1500, following: 100 },
    activities: [],
    friends: [],
    sharedPlans: [],
    privacySettings: { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true },
    role: 'trener',
  },
   { 
    id: "krystian_bpcoders", 
    fullName: "Krystian Koder", 
    username: "krystian_bpcoders", 
    email: "krystian@bpcoders.pl", 
    avatarUrl: "https://placehold.co/200x200.png?text=KK", 
    fitnessLevel: "Zaawansowany", 
    joinDate: new Date().toISOString(), 
    role: 'admin', 
    bio: "Koduję i trenuję!",
    stats: { completedWorkouts: 10, followers: 5, following: 2 },
    activities: [], 
    friends: [], 
    sharedPlans: [],
    privacySettings: { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true },
  },
];

const PrivacyRestrictedMessage = () => (
    <p className="text-muted-foreground text-center py-6">
      Właściciel profilu ograniczył widoczność tej sekcji.
    </p>
);

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const userId = params.userId as string;

  const [profileData, setProfileData] = React.useState<MockUserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [friendToRemove, setFriendToRemove] = React.useState<MockFriend | null>(null);

  const [loggedInUserIdFromStorage, setLoggedInUserIdFromStorage] = React.useState<string | null>(null);
  const isOwnProfile = loggedInUserIdFromStorage ? userId === loggedInUserIdFromStorage : userId === LOGGED_IN_USER_ID;


  React.useEffect(() => {
    setIsLoading(true);
    let effectiveLoggedInUserId = LOGGED_IN_USER_ID;
    
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('loggedInUserEmail');
      if (storedEmail) {
        const userFromDb = MOCK_USER_PROFILES_DB.find(u => u.email === storedEmail);
        if (userFromDb) {
          effectiveLoggedInUserId = userFromDb.id;
        }
      }
      setLoggedInUserIdFromStorage(effectiveLoggedInUserId);
    }


    setTimeout(() => {
      let foundProfile = MOCK_USER_PROFILES_DB.find((p) => p.id === userId);
      
      if (foundProfile) {
        if (userId === effectiveLoggedInUserId) {
            try {
                const storedProfileData = typeof window !== 'undefined' ? localStorage.getItem('currentUserProfileData') : null;
                if (storedProfileData) {
                   const parsedLocalStorageProfile = JSON.parse(storedProfileData);
                   foundProfile = { ...foundProfile, ...parsedLocalStorageProfile, id: foundProfile.id, email: foundProfile.email};
                }
                const storedPrivacySettings = typeof window !== 'undefined' ? localStorage.getItem("currentUserPrivacySettings") : null;
                if (storedPrivacySettings) {
                    foundProfile = { ...foundProfile, privacySettings: JSON.parse(storedPrivacySettings) };
                } else if (!foundProfile.privacySettings) {
                    foundProfile = { ...foundProfile, privacySettings: { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true } };
                }
            } catch (e) {
                console.error("Error loading/merging data for current_user_id:", e);
                 if (!foundProfile.privacySettings) {
                   foundProfile = { ...foundProfile, privacySettings: { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true } };
                }
            }
        } else {
            if (!foundProfile.privacySettings) {
                 foundProfile = { ...foundProfile, privacySettings: { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true } };
            }
        }

        setProfileData(JSON.parse(JSON.stringify(foundProfile)));
        
        if (userId !== effectiveLoggedInUserId) {
          const loggedInUser = MOCK_USER_PROFILES_DB.find(u => u.id === effectiveLoggedInUserId);
          const isActuallyFollowing = loggedInUser?.friends?.some(f => f.id === userId);
          setIsFollowing(!!isActuallyFollowing);
        }
      } else {
        setProfileData(null);
      }
      setIsLoading(false);
    }, 500);
  }, [userId]);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Przestałeś obserwować" : "Zacząłeś obserwować",
      description: `Symulacja (od)obserwowania użytkownika ${profileData?.fullName || profileData?.username}.`,
    });
  };

  const handleRemoveFriend = async () => {
    if (!friendToRemove || !profileData || !profileData.friends || !isOwnProfile) return;
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 750));

    setProfileData(prev => {
      if (!prev || !prev.friends) return prev;
      const updatedFriends = prev.friends.filter(f => f.id !== friendToRemove.id);
      const updatedProfileData = { ...prev, friends: updatedFriends };
      
      if (prev.id === loggedInUserIdFromStorage && typeof window !== 'undefined') {
          localStorage.setItem('currentUserProfileData', JSON.stringify(updatedProfileData));
      }
      return updatedProfileData;
    });
    toast({ title: "Znajomy usunięty", description: `Usunięto ${friendToRemove.name} z listy znajomych.` });
    setFriendToRemove(null);
    setIsSubmitting(false);
  };

  const getActivityIcon = (type: MockActivityItem['type']) => {
    switch (type) {
      case 'new_post': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'shared_workout': return <Dumbbell className="h-5 w-5 text-green-500" />;
      case 'achieved_pb': return <Award className="h-5 w-5 text-yellow-500" />;
      default: return <ClipboardList className="h-5 w-5 text-muted-foreground" />;
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <UserCircle2 className="h-24 w-24 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Nie znaleziono profilu</h1>
        <p className="text-muted-foreground mb-6">
          Przykro nam, ale profil o podanym ID nie istnieje lub nie jest dostępny.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/community/discover">
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Odkrywania
          </Link>
        </Button>
      </div>
    );
  }
  
  const canViewActivity = isOwnProfile || (profileData.privacySettings?.isActivityPublic ?? true);
  const canViewFriends = isOwnProfile || (profileData.privacySettings?.isFriendsListPublic ?? true);
  const canViewSharedPlans = isOwnProfile || (profileData.privacySettings?.isSharedPlansPublic ?? true);


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/community">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Społeczności</span>
              </Link>
            </Button>
            <UserCircle2 className="h-7 w-7 text-primary" /> 
            <h1 className="text-xl font-bold truncate max-w-xs sm:max-w-sm">
              Profil: {profileData.username}
            </h1>
          </div>
          {isOwnProfile && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/account')}>
                <Settings2 className="mr-2 h-4 w-4" /> Ustawienia Konta
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/profile/edit')}>
                <Edit3 className="mr-2 h-4 w-4" /> Edytuj Profil
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="mb-6">
            <CardHeader className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                <AvatarImage src={profileData.avatarUrl} alt={profileData.fullName} data-ai-hint="profile avatar large"/>
                <AvatarFallback className="text-4xl">{profileData.fullName?.substring(0, 1).toUpperCase()}{profileData.fullName?.split(' ')[1]?.substring(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <CardTitle className="text-3xl">{profileData.fullName}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">@{profileData.username}</CardDescription>
                <p className="mt-2 text-sm">{profileData.bio || "Brak opisu."}</p>
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Poziom: <span className="font-semibold text-primary">{profileData.fitnessLevel}</span></span>
                  <Separator orientation="vertical" className="h-4 hidden sm:block" />
                  <span>Dołączył: {format(parseISO(profileData.joinDate), "PPP", { locale: pl })}</span>
                </div>
                {!isOwnProfile && (
                     <p className="mt-2 text-xs text-muted-foreground">
                        Widoczność treści w zakładkach zależy od ustawień prywatności właściciela profilu.
                     </p>
                 )}
              </div>
              {!isOwnProfile && (
                <Button onClick={handleFollowToggle} variant={isFollowing ? "secondary" : "default"} className="w-full mt-4 sm:w-auto sm:mt-0">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {isFollowing ? "Obserwujesz" : "Obserwuj"}
                </Button>
              )}
            </CardHeader>
            {profileData.stats && (
              <CardFooter className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
                  <span className="text-xl font-bold">{profileData.stats.completedWorkouts}</span>
                  <span className="text-xs text-muted-foreground">Ukończone Treningi</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
                  <span className="text-xl font-bold">{profileData.stats.followers}</span>
                  <span className="text-xs text-muted-foreground">Obserwujący</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
                  <span className="text-xl font-bold">{profileData.stats.following}</span>
                  <span className="text-xs text-muted-foreground">Obserwowani</span>
                </div>
              </CardFooter>
            )}
          </Card>

          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="activity"><ClipboardList className="mr-2 h-4 w-4" />Aktywność</TabsTrigger>
              <TabsTrigger value="friends"><Users className="mr-2 h-4 w-4" />Znajomi</TabsTrigger>
              <TabsTrigger value="shared-plans"><BookOpen className="mr-2 h-4 w-4" />Plany</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card>
                <CardHeader><CardTitle>Ostatnia Aktywność</CardTitle></CardHeader>
                <CardContent>
                  {canViewActivity ? (
                    profileData.activities && profileData.activities.length > 0 ? (
                      <ScrollArea className="max-h-[400px]">
                        <ul className="space-y-4 pr-3">
                          {profileData.activities.map(activity => (
                            <li key={activity.id} className="p-4 border rounded-lg shadow-sm bg-card hover:bg-muted/50 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                                <div className="flex-1">
                                  <p className="text-sm">{activity.content}
                                    {activity.type === "shared_workout" && activity.workoutName && (
                                      <Link href={activity.link || "#"} className="text-primary hover:underline ml-1 font-semibold">
                                        ({activity.workoutName})
                                      </Link>
                                    )}
                                    {activity.type === "achieved_pb" && activity.workoutName && (
                                      <Link href={activity.link || "#"} className="text-yellow-600 dark:text-yellow-400 hover:underline ml-1 font-semibold">
                                        {activity.workoutName} - {activity.pbValue}
                                      </Link>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true, locale: pl })}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    ) : (
                      <p className="text-muted-foreground text-center py-6">Brak aktywności do wyświetlenia.</p>
                    )
                  ) : (
                    <PrivacyRestrictedMessage />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <AlertDialog open={!!friendToRemove} onOpenChange={(isOpen) => !isOpen && setFriendToRemove(null)}>
              <TabsContent value="friends">
                <Card>
                  <CardHeader><CardTitle>Znajomi / Obserwowani</CardTitle></CardHeader>
                  <CardContent>
                    {canViewFriends ? (
                        profileData.friends && profileData.friends.length > 0 ? (
                        <ScrollArea className="max-h-[400px]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-3">
                            {profileData.friends.map(friend => (
                              <Card key={friend.id} className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={friend.avatarUrl} alt={friend.name} data-ai-hint="profile avatar small" />
                                    <AvatarFallback>{friend.name.substring(0, 1)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <Link href={`/dashboard/profile/${friend.id}`} className="font-semibold hover:underline">{friend.name}</Link>
                                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
                                  </div>
                                </div>
                                <CardFooter className="p-0 pt-3 flex gap-2">
                                  <Button variant="outline" size="sm" className="flex-1" asChild>
                                    <Link href={`/dashboard/profile/${friend.id}`}><Eye className="mr-1 h-3 w-3" /> Profil</Link>
                                  </Button>
                                  {isOwnProfile && (
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => setFriendToRemove(friend)}>
                                        <Trash2 className="mr-1 h-3 w-3" /> Usuń
                                      </Button>
                                    </AlertDialogTrigger>
                                  )}
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <p className="text-muted-foreground text-center py-6">Brak znajomych do wyświetlenia.</p>
                      )
                    ) : (
                        <PrivacyRestrictedMessage />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              {friendToRemove && ( 
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Usunąć znajomego?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Czy na pewno chcesz usunąć {friendToRemove.name} (@{friendToRemove.username}) ze swojej listy znajomych?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting} onClick={() => setFriendToRemove(null)}>Anuluj</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveFriend} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                      {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      Potwierdź i usuń
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              )}
            </AlertDialog>

            <TabsContent value="shared-plans">
              <Card>
                <CardHeader><CardTitle>Udostępnione Plany Treningowe</CardTitle></CardHeader>
                <CardContent>
                 {canViewSharedPlans ? (
                    profileData.sharedPlans && profileData.sharedPlans.length > 0 ? (
                    <ScrollArea className="max-h-[400px]">
                      <div className="space-y-4 pr-3">
                        {profileData.sharedPlans.map(plan => {
                          let IconComponent: React.ElementType = BookOpen; 
                          if (plan.icon) {
                            if (typeof plan.icon === 'function' || typeof plan.icon === 'string') {
                                IconComponent = plan.icon;
                            } else {
                                console.warn(\`Invalid icon type provided for plan "\${plan.name}". Expected function or string, got \${typeof plan.icon}. Defaulting to BookOpen.\`);
                            }
                          }
                          return (
                            <Card key={plan.id} className="p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-3">
                                <IconComponent className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <Link href={`/dashboard/plans/${plan.id}`} className="font-semibold text-lg hover:underline">{plan.name}</Link>
                                  <p className="text-xs text-muted-foreground">Cel: {plan.goal}</p>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{plan.description || "Brak opisu."}</p>
                                </div>
                              </div>
                              <CardFooter className="p-0 pt-3">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/dashboard/plans/${plan.id}`}>Zobacz szczegóły</Link>
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">Brak udostępnionych planów treningowych.</p>
                  )
                 ) : (
                    <PrivacyRestrictedMessage />
                 )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

    