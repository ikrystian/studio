
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { EditProfilePictureDialog } from "@/components/profile/edit-profile-picture-dialog";
import { ProfilePrivacySettingsDialog, type UserPrivacySettings } from "@/components/profile/profile-privacy-settings-dialog";

// Mock data for the current user - in a real app, this would be fetched
const MOCK_USER_DATA_EDIT = {
  id: "current_user_id",
  fullName: "Jan Kowalski",
  username: "jankowalski_fit",
  bio: "Entuzjasta fitnessu i zdrowego stylu życia.",
  fitnessLevel: "Średniozaawansowany" as "Początkujący" | "Średniozaawansowany" | "Zaawansowany",
  avatarUrl: "https://placehold.co/200x200.png?text=JK",
};

const DEFAULT_PRIVACY_SETTINGS: UserPrivacySettings = {
  isActivityPublic: true,
  isFriendsListPublic: true,
  isSharedPlansPublic: true,
};


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

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentAvatar, setCurrentAvatar] = React.useState(MOCK_USER_DATA_EDIT.avatarUrl);
  const [isEditAvatarOpen, setIsEditAvatarOpen] = React.useState(false);
  const [isPrivacySettingsOpen, setIsPrivacySettingsOpen] = React.useState(false);
  const [privacySettings, setPrivacySettings] = React.useState<UserPrivacySettings>(DEFAULT_PRIVACY_SETTINGS);

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: MOCK_USER_DATA_EDIT.fullName,
      username: MOCK_USER_DATA_EDIT.username,
      bio: MOCK_USER_DATA_EDIT.bio,
      fitnessLevel: MOCK_USER_DATA_EDIT.fitnessLevel,
    },
  });

  React.useEffect(() => {
    // Simulate loading saved privacy settings
    try {
      const storedSettings = localStorage.getItem(PROFILE_PRIVACY_SETTINGS_KEY);
      if (storedSettings) {
        setPrivacySettings(JSON.parse(storedSettings));
      } else {
        setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
      }
    } catch (error) {
        console.error("Error loading privacy settings from localStorage:", error);
        setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
    }
    // Simulate loading current user data for the form (already done in defaultValues)
  }, []);

  async function onSubmit(values: EditProfileFormValues) {
    setIsLoading(true);
    console.log("Updating profile with:", values);
    console.log("Current avatar URL:", currentAvatar);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, update MOCK_USER_DATA_EDIT or a global state/context
    MOCK_USER_DATA_EDIT.fullName = values.fullName;
    MOCK_USER_DATA_EDIT.username = values.username;
    MOCK_USER_DATA_EDIT.bio = values.bio || "";
    MOCK_USER_DATA_EDIT.fitnessLevel = values.fitnessLevel;
    MOCK_USER_DATA_EDIT.avatarUrl = currentAvatar;

    toast({
      title: "Profil zaktualizowany!",
      description: "Twoje zmiany zostały zapisane (symulacja).",
    });
    router.push(`/profile/${MOCK_USER_DATA_EDIT.id}`); // Navigate to view profile
    setIsLoading(false);
  }

  const handleAvatarSave = (newAvatarUrl: string) => {
    setCurrentAvatar(newAvatarUrl);
    // In a real app, you might also trigger a profile data save here or do it separately
    // For now, the main form submission will save the `currentAvatar` conceptually
  };

  const handleSavePrivacySettings = (newSettings: UserPrivacySettings) => {
    setPrivacySettings(newSettings);
    try {
        localStorage.setItem(PROFILE_PRIVACY_SETTINGS_KEY, JSON.stringify(newSettings));
        toast({
            title: "Ustawienia prywatności zapisane!",
            description: "Twoje preferencje prywatności zostały zaktualizowane (symulacja lokalna)."
        });
    } catch (error) {
        console.error("Error saving privacy settings to localStorage:", error);
        toast({
            title: "Błąd zapisu ustawień prywatności",
            variant: "destructive"
        });
    }
    setIsPrivacySettingsOpen(false);
  };


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/profile/${MOCK_USER_DATA_EDIT.id}`}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Profilu</span>
              </Link>
            </Button>
            <Edit3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Edytuj Profil</h1>
          </div>
          <Button form="edit-profile-form" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Zapisz Zmiany
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
                      <FormItem>
                        <FormLabel>Imię i Nazwisko</FormLabel>
                        <FormControl>
                          <Input placeholder="Np. Jan Kowalski" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nazwa Użytkownika</FormLabel>
                        <FormControl>
                          <Input placeholder="Np. jankowalski_fit" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription className="text-xs">Może być używana w linkach do Twojego profilu. Zmiana może być ograniczona.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>O mnie (Bio)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Opowiedz coś o sobie, swoich celach, zainteresowaniach..."
                            {...field}
                            rows={4}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fitnessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poziom Zaawansowania</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz swój poziom" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Początkujący">Początkujący</SelectItem>
                            <SelectItem value="Średniozaawansowany">Średniozaawansowany</SelectItem>
                            <SelectItem value="Zaawansowany">Zaawansowany</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
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
                        Zarządzaj tym, co inni użytkownicy mogą widzieć na Twoim profilu publicznym.
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
