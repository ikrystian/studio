
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import dynamic from 'next/dynamic';
import { ArrowLeft, Save, UserCircle2, Settings2, Edit3, Image as ImageIcon, Loader2, ShieldCheck } from "lucide-react";

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserPrivacySettings } from "@/components/profile/profile-privacy-settings-dialog";
import { MOCK_USER_DATA_EDIT_PROFILE as MOCK_USER_DATA_EDIT, DEFAULT_PRIVACY_SETTINGS } from "@/lib/mockData";

// MOCK BACKEND LOGIC:
// - Initial Data: Profile data is loaded from localStorage (CURRENT_USER_PROFILE_DATA_KEY).
//   If not found, falls back to MOCK_USER_DATA_EDIT (imported from mockData.ts).
// - Privacy Settings: Loaded from localStorage (PROFILE_PRIVACY_SETTINGS_KEY).
// - Saving Profile: Updates are saved back to localStorage (CURRENT_USER_PROFILE_DATA_KEY).
// - Saving Privacy Settings: Updates are saved to localStorage (PROFILE_PRIVACY_SETTINGS_KEY and also
//   updated within the main profile data in localStorage).
// - Avatar Change: Simulates changing avatar; the new (placeholder) URL is saved with the main profile.

const EditProfilePictureDialog = dynamic(() =>
  import("@/components/profile/edit-profile-picture-dialog").then((mod) => mod.EditProfilePictureDialog), {
  loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});

const ProfilePrivacySettingsDialog = dynamic(() =>
  import("@/components/profile/profile-privacy-settings-dialog").then((mod) => mod.ProfilePrivacySettingsDialog), {
  loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});


const editProfileSchema = z.object({
  fullName: z.string().min(1, "Imię i nazwisko jest wymagane."),
  username: z.string().min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki.").regex(/^[a-zA-Z0-9_.]+$/, "Nazwa użytkownika może zawierać tylko litery, cyfry, kropki i podkreślenia."),
  bio: z.string().max(300, "Opis nie może przekraczać 300 znaków.").optional(),
  fitnessLevel: z.enum(["Początkujący", "Średniozaawansowany", "Zaawansowany"], {
    required_error: "Poziom zaawansowania jest wymagany.",
  }),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

const PROFILE_PRIVACY_SETTINGS_KEY = "currentUserPrivacySettings";
const CURRENT_USER_PROFILE_DATA_KEY = "currentUserProfileData";

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = React.useState(true);

  const [currentAvatar, setCurrentAvatar] = React.useState(MOCK_USER_DATA_EDIT.avatarUrl);
  const [isEditAvatarOpen, setIsEditAvatarOpen] = React.useState(false);

  const [isPrivacySettingsOpen, setIsPrivacySettingsOpen] = React.useState(false);
  const [privacySettings, setPrivacySettings] = React.useState<UserPrivacySettings>(DEFAULT_PRIVACY_SETTINGS);

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: "",
      username: "",
      bio: "",
      fitnessLevel: undefined,
    },
  });

  React.useEffect(() => {
    setIsFetchingInitialData(true);
    // MOCK BACKEND LOGIC: Load profile data from localStorage on mount.
    if (typeof window !== 'undefined') {
      try {
        const storedProfileStr = localStorage.getItem(CURRENT_USER_PROFILE_DATA_KEY);
        const storedPrivacyStr = localStorage.getItem(PROFILE_PRIVACY_SETTINGS_KEY);

        let profileToLoad = MOCK_USER_DATA_EDIT;
        if (storedProfileStr) {
            const storedProfile = JSON.parse(storedProfileStr);
            const loggedInEmail = localStorage.getItem('loggedInUserEmail');
            if (loggedInEmail && storedProfile.email === loggedInEmail) {
                 profileToLoad = { ...MOCK_USER_DATA_EDIT, ...storedProfile };
            }
        }

        form.reset({
          fullName: profileToLoad.fullName,
          username: profileToLoad.username,
          bio: profileToLoad.bio || "",
          fitnessLevel: profileToLoad.fitnessLevel,
        });
        setCurrentAvatar(profileToLoad.avatarUrl);

        if (storedPrivacyStr) {
          setPrivacySettings(JSON.parse(storedPrivacyStr));
        } else {
          setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
        }

      } catch (error) {
        console.error("Error loading data from localStorage for edit profile:", error);
        form.reset({
          fullName: MOCK_USER_DATA_EDIT.fullName,
          username: MOCK_USER_DATA_EDIT.username,
          bio: MOCK_USER_DATA_EDIT.bio || "",
          fitnessLevel: MOCK_USER_DATA_EDIT.fitnessLevel,
        });
        setCurrentAvatar(MOCK_USER_DATA_EDIT.avatarUrl);
        setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
      }
    }
    // setIsFetchingInitialData(false); // Removed: now handled by no-skeleton approach
  }, [form]);

  // MOCK BACKEND LOGIC: Simulates updating user profile by saving to localStorage.
  async function onSubmit(values: EditProfileFormValues) {
    setIsLoading(true);
    console.log("Updating profile with:", values);
    console.log("Current avatar URL:", currentAvatar);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (typeof window !== 'undefined') {
        try {
            const existingProfileStr = localStorage.getItem(CURRENT_USER_PROFILE_DATA_KEY);
            let profileToSave = MOCK_USER_DATA_EDIT;
            if (existingProfileStr) {
                 profileToSave = JSON.parse(existingProfileStr);
            }
            profileToSave = {
                ...profileToSave,
                fullName: values.fullName,
                username: values.username,
                bio: values.bio || "",
                fitnessLevel: values.fitnessLevel,
                avatarUrl: currentAvatar,
            };
            localStorage.setItem(CURRENT_USER_PROFILE_DATA_KEY, JSON.stringify(profileToSave));
            toast({
              title: "Profil zaktualizowany!",
              description: "Twoje zmiany zostały zapisane.",
            });
            router.push(`/dashboard/profile/current_user_id`);
        } catch (e) {
            toast({ title: "Błąd zapisu", description: "Nie udało się zapisać profilu w localStorage.", variant: "destructive"});
            console.error("Error saving profile to localStorage:", e);
        }
    }
    setIsLoading(false);
  }

  const handleAvatarSave = (newAvatarUrl: string) => {
    // MOCK BACKEND LOGIC: `currentAvatar` state is updated. The actual "save"
    // of this URL happens when the main form is submitted.
    setCurrentAvatar(newAvatarUrl);
    toast({ title: "Zdjęcie profilowe zaktualizowane (podgląd)", description: "Zmiany zostaną zapisane po kliknięciu 'Zapisz Zmiany'." });
  };

  // MOCK BACKEND LOGIC: Saves privacy settings to localStorage.
  const handleSavePrivacySettings = (newSettings: UserPrivacySettings) => {
    setPrivacySettings(newSettings);
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(PROFILE_PRIVACY_SETTINGS_KEY, JSON.stringify(newSettings));
            const profileDataStr = localStorage.getItem(CURRENT_USER_PROFILE_DATA_KEY);
            if (profileDataStr) {
                try {
                    const profileData = JSON.parse(profileDataStr);
                    profileData.privacySettings = newSettings;
                    localStorage.setItem(CURRENT_USER_PROFILE_DATA_KEY, JSON.stringify(profileData));
                } catch (e) { console.error("Error updating privacy settings in profile data:", e); }
            }
            toast({
                title: "Ustawienia prywatności zapisane!",
                description: "Twoje preferencje prywatności profilu zostały zaktualizowane."
            });
        } catch (error) {
            console.error("Error saving privacy settings to localStorage:", error);
            toast({
                title: "Błąd zapisu ustawień prywatności",
                variant: "destructive"
            });
        }
    }
    setIsPrivacySettingsOpen(false);
  };

  // if (isFetchingInitialData) { // Removed for no-skeleton approach
  //     return (
  //       <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
  //           <Loader2 className="h-12 w-12 animate-spin text-primary"/>
  //           <p className="mt-4 text-muted-foreground">Ładowanie danych profilu...</p>
  //       </div>
  //     );
  // }


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/dashboard/profile/${MOCK_USER_DATA_EDIT.id}`}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Profilu</span>
              </Link>
            </Button>
            <Edit3 className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Edytuj Profil</h1>
          </div>
          <Button form="edit-profile-form" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Zapisz Zmiany
          </Button>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          <Form {...form}>
            <form id="edit-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Zdjęcie Profilowe</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={currentAvatar} alt={form.getValues("fullName")} data-ai-hint="profile avatar large" />
                    <AvatarFallback className="text-4xl">
                      {form.getValues("fullName")?.substring(0,1).toUpperCase()}
                      {form.getValues("fullName")?.split(' ')[1]?.substring(0,1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline" onClick={() => setIsEditAvatarOpen(true)}>
                    <ImageIcon className="mr-2 h-4 w-4" /> Zmień Zdjęcie Profilowe
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dane Osobowe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem><FormLabel>Imię i Nazwisko</FormLabel><FormControl><Input placeholder="Np. Jan Kowalski" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem><FormLabel>Nazwa Użytkownika</FormLabel><FormControl><Input placeholder="Np. jankowalski_fit" {...field} disabled={isLoading} /></FormControl><FormDescription className="text-xs">Może być używana w linkach do Twojego profilu. Zmiana może być ograniczona.</FormDescription><FormMessage /></FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem><FormLabel>O mnie (Bio)</FormLabel><FormControl><Textarea placeholder="Opowiedz coś o sobie, swoich celach, zainteresowaniach..." {...field} rows={4} disabled={isLoading}/></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fitnessLevel"
                    render={({ field }) => (
                      <FormItem><FormLabel>Poziom Zaawansowania</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz swój poziom" /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="Początkujący">Początkujący</SelectItem><SelectItem value="Średniozaawansowany">Średniozaawansowany</SelectItem><SelectItem value="Zaawansowany">Zaawansowany</SelectItem></SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/>Ustawienia Prywatności Profilu</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Zarządzaj tym, co inni użytkownicy mogą widzieć na Twoim profilu publicznym. Zmiany zapisywane są natychmiast.
                    </p>
                    <Button type="button" variant="outline" onClick={() => setIsPrivacySettingsOpen(true)}>
                        <Settings2 className="mr-2 h-4 w-4" /> Otwórz Ustawienia Prywatności
                    </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                 <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Zapisz Zmiany
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
      <EditProfilePictureDialog
        isOpen={isEditAvatarOpen}
        onOpenChange={setIsEditAvatarOpen}
        currentAvatarUrl={currentAvatar}
        onSave={handleAvatarSave}
      />
      <ProfilePrivacySettingsDialog
        isOpen={isPrivacySettingsOpen}
        onOpenChange={setIsPrivacySettingsOpen}
        initialSettings={privacySettings}
        onSave={handleSavePrivacySettings}
      />
    </div>
  );
}
