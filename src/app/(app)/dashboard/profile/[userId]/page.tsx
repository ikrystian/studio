"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation"; // Added useRouter
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  User as UserIcon, // Renamed to avoid conflict with component
  Settings,
  Edit3,
  Users,
  MessageSquare,
  Award,
  Share2,
  CalendarDays,
  Heart,
  BarChart3,
  Link as LinkIcon,
  ShieldCheck,
  Mail,
  Info,
  Loader2,
  ArrowLeft, // For a potential back button if not using global AppHeader one
  UserPlus,
  Check,
  Image as ImageIcon // Lucide Image icon
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MOCK_USER_PROFILES_DB, MOCK_CURRENT_USER_PROFILE, type UserProfile } from "@/lib/mockData";
import { ProfilePrivacySettingsDialog, type UserPrivacySettings } from "@/components/profile/profile-privacy-settings-dialog";

// Key for localStorage
const PROFILE_PRIVACY_SETTINGS_KEY_PREFIX = "userPrivacySettings_";
const USER_FOLLOW_STATUS_KEY_PREFIX = "userFollowStatus_";
const CURRENT_USER_PROFILE_DATA_KEY = "currentUserProfileData";


export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter(); // Added for navigation
  const { toast } = useToast();
  const userId = params.userId as string;

  const [profileData, setProfileData] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [isPrivacySettingsOpen, setIsPrivacySettingsOpen] = React.useState(false);


  React.useEffect(() => {
    setIsLoading(true);
    let userToDisplay: UserProfile | null = null;

    if (typeof window !== 'undefined') {
        const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
        const currentUserProfileStr = localStorage.getItem(CURRENT_USER_PROFILE_DATA_KEY);
        let currentUserFromStorage: UserProfile | null = null;

        if (currentUserProfileStr) {
            try {
                currentUserFromStorage = JSON.parse(currentUserProfileStr);
            } catch (e) { console.error("Error parsing current user profile from storage", e); }
        }

        if (userId === "current_user_id") {
            // If it's current_user_id, try to load from localStorage first
            if (currentUserFromStorage && currentUserFromStorage.email === loggedInUserEmail) {
                userToDisplay = currentUserFromStorage;
            } else {
                 // Fallback to MOCK_CURRENT_USER_PROFILE if localStorage is not set or mismatch
                userToDisplay = MOCK_CURRENT_USER_PROFILE;
                // Optionally, update localStorage if it was missing for the test user
                if (loggedInUserEmail === MOCK_CURRENT_USER_PROFILE.email) {
                   localStorage.setItem(CURRENT_USER_PROFILE_DATA_KEY, JSON.stringify(MOCK_CURRENT_USER_PROFILE));
                }
            }
        } else {
            // For other user IDs, find in the mock DB
            userToDisplay = MOCK_USER_PROFILES_DB.find(p => p.id === userId) || null;
        }
    }


    if (userToDisplay) {
      // Ensure privacySettings are initialized
      if (!userToDisplay.privacySettings) {
        const storedPrivacy = typeof window !== 'undefined' ? localStorage.getItem(`${PROFILE_PRIVACY_SETTINGS_KEY_PREFIX}${userToDisplay.id}`) : null;
        userToDisplay.privacySettings = storedPrivacy ? JSON.parse(storedPrivacy) : {
          isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true
        };
      }
      setProfileData(userToDisplay);

      if (userId !== "current_user_id" && typeof window !== 'undefined') {
        const followStatus = localStorage.getItem(`${USER_FOLLOW_STATUS_KEY_PREFIX}${userId}`);
        setIsFollowing(followStatus === "true");
      }
    } else {
      toast({
        title: "Profil nie znaleziony",
        description: "Nie można załadować danych tego użytkownika.",
        variant: "destructive",
      });
      // Potentially redirect or show a 'not found' state
    }
    setIsLoading(false);
  }, [userId, toast]);

  const handleFollowToggle = () => {
    if (userId === "current_user_id") return; // Cannot follow self

    const newFollowStatus = !isFollowing;
    setIsFollowing(newFollowStatus);
    if (typeof window !== 'undefined') {
        localStorage.setItem(`${USER_FOLLOW_STATUS_KEY_PREFIX}${userId}`, String(newFollowStatus));
    }
    toast({
      title: newFollowStatus ? "Obserwujesz!" : "Przestałeś obserwować",
      description: `Teraz ${newFollowStatus ? "obserwujesz" : "nie obserwujesz już"} ${profileData?.username || "tego użytkownika"}.`,
    });
  };

  const handleSavePrivacySettings = (newSettings: UserPrivacySettings) => {
    if (!profileData) return;
    
    // Update profileData state
    const updatedProfile = { ...profileData, privacySettings: newSettings };
    setProfileData(updatedProfile);

    if (typeof window !== 'undefined') {
        // Update current_user_id's privacy settings in its main storage if it's the current user
        if (profileData.id === "current_user_id") {
            const currentUserDataStr = localStorage.getItem(CURRENT_USER_PROFILE_DATA_KEY);
            if(currentUserDataStr){
                try {
                    const currentUserData = JSON.parse(currentUserDataStr);
                    currentUserData.privacySettings = newSettings; // Update the privacy part
                    localStorage.setItem(CURRENT_USER_PROFILE_DATA_KEY, JSON.stringify(currentUserData));
                } catch (e) {console.error("Failed to update main profile data with privacy settings", e);}
            }
        }
        // Also update the specific privacy key (can be redundant for current user but good for others if they could edit)
        localStorage.setItem(`${PROFILE_PRIVACY_SETTINGS_KEY_PREFIX}${profileData.id}`, JSON.stringify(newSettings));
    }

    toast({
        title: "Ustawienia prywatności zapisane!",
        description: "Twoje preferencje prywatności dla tego profilu zostały zaktualizowane."
    });
    setIsPrivacySettingsOpen(false);
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary"/>
        <p className="mt-4 text-muted-foreground">Ładowanie profilu...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
        <Alert variant="destructive" className="max-w-lg">
          <Info className="h-4 w-4" />
          <AlertTitle>Nie znaleziono profilu</AlertTitle>
          <AlertDescription>
            Przepraszamy, ale nie mogliśmy znaleźć profilu dla ID: {userId}. Mógł zostać usunięty lub link jest nieprawidłowy.
             <Button asChild variant="link" className="mt-2 block p-0 h-auto">
              <Link href="/dashboard/community/discover">Odkryj inne profile</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Check if the current user can view specific parts of the profile based on privacy settings
  // For simplicity, we assume if userId is 'current_user_id', they can see everything.
  // Otherwise, respect privacySettings. This is a basic check; real app would be more complex.
  const canViewActivity = userId === "current_user_id" || (profileData.privacySettings?.isActivityPublic ?? true);
  const canViewFriends = userId === "current_user_id" || (profileData.privacySettings?.isFriendsListPublic ?? true);
  const canViewSharedPlans = userId === "current_user_id" || (profileData.privacySettings?.isSharedPlansPublic ?? true);


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/community/discover">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Odkrywaj</span>
              </Link>
            </Button>
            <UserIcon className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Profil Użytkownika</h1>
          </div>
          {userId === "current_user_id" && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profile/edit">
                <Edit3 className="mr-2 h-4 w-4" /> Edytuj Profil
              </Link>
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="mb-8">
            <CardHeader className="flex flex-col items-center space-y-4 p-6 sm:flex-row sm:space-y-0 sm:space-x-6">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-2 border-primary">
                <AvatarImage src={profileData.avatarUrl} alt={profileData.fullName} data-ai-hint="profile avatar large" />
                <AvatarFallback className="text-4xl">
                    {profileData.fullName.substring(0,1).toUpperCase()}
                    {profileData.fullName.split(' ')[1]?.substring(0,1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <CardTitle className="text-3xl font-bold">{profileData.fullName}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">@{profileData.username}</CardDescription>
                <Badge variant={profileData.role === 'admin' ? 'destructive' : (profileData.role === 'trener' ? 'default' : 'secondary')} className="mt-1">
                  {profileData.role === 'admin' ? 'Administrator' : profileData.role === 'trener' ? 'Trener' : 'Użytkownik'}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">Poziom: {profileData.fitnessLevel}</p>
                <p className="text-xs text-muted-foreground">Dołączył(a): {format(parseISO(profileData.joinDate), "PPP", { locale: pl })}</p>
              </div>
              {userId !== "current_user_id" && (
                <Button onClick={handleFollowToggle} variant={isFollowing ? "secondary" : "default"} className="w-full sm:w-auto mt-4 sm:mt-0">
                  {isFollowing ? <Check className="mr-2 h-4 w-4"/> : <UserPlus className="mr-2 h-4 w-4"/>}
                  {isFollowing ? "Obserwujesz" : "Obserwuj"}
                </Button>
              )}
            </CardHeader>
            {profileData.bio && (
              <CardContent className="border-t pt-4">
                <p className="text-sm text-center sm:text-left">{profileData.bio}</p>
              </CardContent>
            )}
            <CardFooter className="flex flex-col sm:flex-row justify-around gap-4 border-t pt-4 text-center">
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold">{profileData.followers}</span>
                    <span className="text-xs text-muted-foreground">Obserwujący</span>
                </div>
                <Separator orientation="vertical" className="hidden sm:block h-10"/>
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold">{profileData.following}</span>
                    <span className="text-xs text-muted-foreground">Obserwowani</span>
                </div>
                {userId === "current_user_id" && (
                     <Button variant="ghost" size="sm" onClick={() => setIsPrivacySettingsOpen(true)} className="sm:ml-auto mt-2 sm:mt-0">
                        <ShieldCheck className="mr-2 h-4 w-4"/> Ustawienia Prywatności
                    </Button>
                )}
            </CardFooter>
          </Card>

          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="activity"><MessageSquare className="mr-2 h-4 w-4" />Aktywność</TabsTrigger>
              <TabsTrigger value="achievements"><Award className="mr-2 h-4 w-4" />Osiągnięcia</TabsTrigger>
              <TabsTrigger value="shared-plans"><LinkIcon className="mr-2 h-4 w-4" />Udostępnione Plany</TabsTrigger>
              <TabsTrigger value="contact"><Mail className="mr-2 h-4 w-4" />Kontakt</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Ostatnia Aktywność</CardTitle>
                </CardHeader>
                <CardContent>
                  {canViewActivity ? (
                    profileData.recentActivity.length > 0 ? (
                      <ScrollArea className="h-[300px]">
                        <ul className="space-y-4">
                          {profileData.recentActivity.map((activity) => (
                            <li key={activity.id} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                              {activity.type === "workout" && <Dumbbell className="h-5 w-5 text-primary mt-1" />}
                              {activity.type === "post" && <MessageSquare className="h-5 w-5 text-blue-500 mt-1" />}
                              {activity.type === "achievement" && <Award className="h-5 w-5 text-amber-500 mt-1" />}
                              {activity.type === "plan_completed" && <Check className="h-5 w-5 text-green-500 mt-1" />}
                              <div>
                                <Link href={activity.link || "#"} className="font-medium hover:underline">{activity.title}</Link>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(activity.timestamp), "PPPp", { locale: pl })}
                                </p>
                                {activity.details && <p className="text-sm">{activity.details}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    ) : (
                      <p className="text-muted-foreground">Brak niedawnej aktywności do wyświetlenia.</p>
                    )
                  ) : (
                     <Alert variant="default">
                        <ShieldCheck className="h-4 w-4"/>
                        <AlertTitle>Prywatne</AlertTitle>
                        <AlertDescription>Aktywność tego użytkownika jest prywatna.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card>
                <CardHeader><CardTitle>Osiągnięcia i Rekordy</CardTitle></CardHeader>
                <CardContent>
                    <Alert>
                        <Info className="h-4 w-4"/>
                        <AlertTitle>Funkcja w Budowie</AlertTitle>
                        <AlertDescription>
                            Wyświetlanie osiągnięć (np. ukończone wyzwania, odznaki) oraz link do osobistych rekordów użytkownika pojawi się tutaj wkrótce.
                             <Button variant="link" className="p-0 h-auto mt-1 block" asChild>
                                <Link href="/dashboard/personal-bests">Przejdź do swoich rekordów (Placeholder)</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shared-plans">
                 <Card>
                    <CardHeader><CardTitle>Udostępnione Plany Treningowe</CardTitle></CardHeader>
                    <CardContent>
                    {canViewSharedPlans ? (
                        <Alert>
                            <Info className="h-4 w-4"/>
                            <AlertTitle>Funkcja w Budowie</AlertTitle>
                            <AlertDescription>
                                Lista planów treningowych udostępnionych publicznie przez tego użytkownika pojawi się tutaj.
                                <Button variant="link" className="p-0 h-auto mt-1 block" asChild>
                                    <Link href="/dashboard/plans">Przeglądaj swoje plany (Placeholder)</Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert variant="default">
                            <ShieldCheck className="h-4 w-4"/>
                            <AlertTitle>Prywatne</AlertTitle>
                            <AlertDescription>Udostępnione plany tego użytkownika są prywatne.</AlertDescription>
                        </Alert>
                    )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader><CardTitle>Informacje Kontaktowe</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm">Email: <span className="text-muted-foreground">{profileData.email} (Widoczność zależy od ustawień globalnych)</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm">Połączone konta:</span>
                         {profileData.linkedSocialAccounts?.google && <Badge variant="outline">Google</Badge>}
                         {profileData.linkedSocialAccounts?.facebook && <Badge variant="outline">Facebook</Badge>}
                         {(!profileData.linkedSocialAccounts || (!profileData.linkedSocialAccounts.google && !profileData.linkedSocialAccounts.facebook)) && <span className="text-xs text-muted-foreground">Brak</span>}
                    </div>
                     <Alert className="mt-4">
                        <Info className="h-4 w-4"/>
                        <AlertTitle>Funkcja Wiadomości Prywatnych</AlertTitle>
                        <AlertDescription>
                           Możliwość wysyłania wiadomości prywatnych do użytkowników zostanie dodana w przyszłości.
                        </AlertDescription>
                    </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
           <ProfilePrivacySettingsDialog
                isOpen={isPrivacySettingsOpen}
                onOpenChange={setIsPrivacySettingsOpen}
                initialSettings={profileData.privacySettings || { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true}}
                onSave={handleSavePrivacySettings}
            />
        </div>
      </main>
    </div>
  );
}