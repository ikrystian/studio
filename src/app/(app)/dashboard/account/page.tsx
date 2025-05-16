
"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  UserCircle2,
  Edit3,
  Save,
  XCircle,
  Loader2,
  CalendarIcon,
  Weight,
  Ruler,
  TrendingUp,
  Mail,
  Lock,
  ShieldCheck,
  Bell,
  Trash2,
  Settings2,
  LogOut,
  FileText,
  Info,
  AlertTriangle,
  Link2 as LinkIcon, // For linked accounts
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { UserPrivacySettings } from "@/components/profile/profile-privacy-settings-dialog";
import { AccountSettingsPageSkeleton } from "@/components/account/AccountSettingsPageSkeleton";
import { PersonalDataSection } from "@/components/account/sections/PersonalDataSection";
import { SecurityManagementSection } from "@/components/account/sections/SecurityManagementSection";
import { ProfilePrivacyManagementSection } from "@/components/account/sections/ProfilePrivacyManagementSection";
import { LinkedAccountsManagementSection } from "@/components/account/sections/LinkedAccountsManagementSection";
import { AccountDataManagementSection } from "@/components/account/sections/AccountDataManagementSection";
import type { UserProfile } from "@/lib/mockData"; // Import UserProfile

const TwoFactorAuthDialog = dynamic(() =>
  import("@/components/account/two-factor-auth-dialog").then((mod) => mod.TwoFactorAuthDialog), {
  loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});

const ViewBackupCodesDialog = dynamic(() =>
  import("@/components/account/view-backup-codes-dialog").then((mod) => mod.ViewBackupCodesDialog), {
  loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});

// Default user data structure - in a real app, this would come from context or API
// Updated to match UserProfile structure where applicable
const DEFAULT_USER_ACCOUNT_DATA: UserProfile = {
  id: "current_user_id",
  fullName: "Użytkownik Testowy",
  username: "test_user_account",
  email: "test@example.com",
  avatarUrl: "https://placehold.co/100x100.png?text=TU",
  joinDate: new Date().toISOString(),
  followers: 0,
  following: 0,
  recentActivity: [],
  role: 'client',
  dateOfBirth: new Date(1990, 5, 15).toISOString(),
  gender: "male" as "male" | "female" | "other" | "prefer_not_to_say",
  weight: 75.5,
  height: 180,
  fitnessLevel: "intermediate" as "beginner" | "intermediate" | "advanced" | "Ekspert", // Ensure fitnessLevel type matches UserProfile
  // isTwoFactorEnabled: false, // This will be a separate state
  privacySettings: { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true },
};

const PROFILE_PRIVACY_SETTINGS_KEY = "currentUserPrivacySettings";
const CURRENT_USER_PROFILE_DATA_KEY = "currentUserProfileData";

const DEFAULT_PRIVACY_SETTINGS: UserPrivacySettings = {
  isActivityPublic: true,
  isFriendsListPublic: true,
  isSharedPlansPublic: true,
};

const MOCK_LOGIN_HISTORY = [
    {id: "lh1", date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), type: "Logowanie", ip: "192.168.1.10 (Przybliżone)", device: "Chrome na Windows"},
    {id: "lh2", date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), type: "Zmiana hasła", ip: "89.123.45.67 (Przybliżone)", device: "Safari na iPhone"},
    {id: "lh3", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), type: "Logowanie", ip: "192.168.1.12 (Przybliżone)", device: "Aplikacja mobilna Android"},
];

const MOCK_BACKUP_CODES = ["1A2B-C3D4", "E5F6-G7H8", "I9J0-K1L2", "M3N4-O5P6", "Q7R8-S9T0"];

// Schemas remain here as they are tied to forms managed by this parent page.
const personalDataSchema = z.object({
  fullName: z.string().min(1, "Imię i nazwisko jest wymagane."),
  dateOfBirth: z.date({
    required_error: "Data urodzenia jest wymagana.",
    invalid_type_error: "Nieprawidłowy format daty.",
  }),
  gender: z.enum(["male", "female"], {
    required_error: "Płeć jest wymagana.",
  }),
  weight: z.coerce
    .number({ invalid_type_error: "Waga musi być liczbą."})
    .positive("Waga musi być dodatnia.")
    .min(1, "Waga musi wynosić co najmniej 1 kg.")
    .max(500, "Waga nie może przekraczać 500 kg.")
    .optional()
    .or(z.literal("")),
  height: z.coerce
    .number({ invalid_type_error: "Wzrost musi być liczbą."})
    .positive("Wzrost musi być dodatni.")
    .min(50, "Wzrost musi wynosić co najmniej 50 cm.")
    .max(300, "Wzrost nie może przekraczać 300 cm.")
    .optional()
    .or(z.literal("")),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Poziom zaawansowania jest wymagany.",
  }),
});

type PersonalDataFormValues = z.infer<typeof personalDataSchema>;

const changeEmailSchema = z.object({
  newEmail: z.string().email("Nieprawidłowy format email.").min(1, "Nowy email jest wymagany."),
  currentPasswordForEmail: z.string().min(1, "Hasło jest wymagane do zmiany emaila."),
});
type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Obecne hasło jest wymagane."),
  newPassword: z.string().min(8, "Nowe hasło musi mieć co najmniej 8 znaków."),
  confirmNewPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane."),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Nowe hasła nie pasują do siebie.",
  path: ["confirmNewPassword"],
});
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const deleteAccountSchema = z.object({
  passwordConfirmation: z.string().min(1, "Hasło jest wymagane do usunięcia konta."),
});
type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

const deactivate2FASchema = z.object({
    password: z.string().min(1, "Hasło jest wymagane do deaktywacji 2FA."),
});
type Deactivate2FAFormValues = z.infer<typeof deactivate2FASchema>;

export default function AccountSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditingPersonalData, setIsEditingPersonalData] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [currentUserAccountData, setCurrentUserAccountData] = React.useState<UserProfile>(DEFAULT_USER_ACCOUNT_DATA);

  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = React.useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = React.useState(false);
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = React.useState(false);

  const [privacySettings, setPrivacySettings] = React.useState<UserPrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [isSavingPrivacy, setIsSavingPrivacy] = React.useState(false);


  const personalDataForm = useForm<PersonalDataFormValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      fullName: currentUserAccountData.fullName,
      dateOfBirth: currentUserAccountData.dateOfBirth ? parseISO(currentUserAccountData.dateOfBirth) : new Date(),
      gender: currentUserAccountData.gender as "male" | "female",
      weight: currentUserAccountData.weight ?? "",
      height: currentUserAccountData.height ?? "",
      fitnessLevel: currentUserAccountData.fitnessLevel as "beginner" | "intermediate" | "advanced",
    },
  });

  const emailForm = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "", currentPasswordForEmail: "" },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });
  
  const deleteAccountForm = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { passwordConfirmation: ""},
  });

  const deactivate2faForm = useForm<Deactivate2FAFormValues>({
    resolver: zodResolver(deactivate2FASchema),
    defaultValues: { password: "" },
  });

  React.useEffect(() => {
    setIsLoading(true);

    let loadedProfileData = DEFAULT_USER_ACCOUNT_DATA;
    let loaded2FAStatus = false;
    let loadedPrivacySettings = DEFAULT_PRIVACY_SETTINGS;

    if (typeof window !== 'undefined') {
      try {
        const storedProfileStr = localStorage.getItem(CURRENT_USER_PROFILE_DATA_KEY);
        if (storedProfileStr) {
          const parsedProfile = JSON.parse(storedProfileStr);
          loadedProfileData = { ...DEFAULT_USER_ACCOUNT_DATA, ...parsedProfile };
        }
        
        const stored2FAStatusStr = localStorage.getItem("workoutWise2FAStatus");
        loaded2FAStatus = stored2FAStatusStr === "true";
        
        const storedPrivacyStr = localStorage.getItem(PROFILE_PRIVACY_SETTINGS_KEY);
        if (storedPrivacyStr) {
          loadedPrivacySettings = JSON.parse(storedPrivacyStr);
        } else if (loadedProfileData.privacySettings) { // Fallback to privacy settings from profile data
          loadedPrivacySettings = loadedProfileData.privacySettings;
        }
      } catch (error) {
        console.error("Error loading account data from localStorage:", error);
      }
    }

    setCurrentUserAccountData(loadedProfileData);
    personalDataForm.reset({
      fullName: loadedProfileData.fullName,
      dateOfBirth: loadedProfileData.dateOfBirth ? parseISO(loadedProfileData.dateOfBirth) : new Date(),
      gender: loadedProfileData.gender as "male" | "female",
      weight: loadedProfileData.weight ?? "",
      height: loadedProfileData.height ?? "",
      fitnessLevel: loadedProfileData.fitnessLevel as "beginner" | "intermediate" | "advanced",
    });
    setIsTwoFactorEnabled(loaded2FAStatus);
    setPrivacySettings(loadedPrivacySettings);

    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 750); 

    return () => clearTimeout(timer);
  }, [personalDataForm]);


  async function onSubmitPersonalData(values: PersonalDataFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedAccountData: UserProfile = {
        ...currentUserAccountData,
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth.toISOString(),
        gender: values.gender,
        weight: values.weight === "" || values.weight === undefined ? undefined : Number(values.weight),
        height: values.height === "" || values.height === undefined ? undefined : Number(values.height),
        fitnessLevel: values.fitnessLevel,
    };
    setCurrentUserAccountData(updatedAccountData);

    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_PROFILE_DATA_KEY, JSON.stringify(updatedAccountData));
    }

    toast({ title: "Dane osobowe zaktualizowane!", description: "Twoje dane zostały pomyślnie zapisane." });
    setIsEditingPersonalData(false);
    setIsSubmitting(false);
  }

  async function onSubmitChangeEmail(values: ChangeEmailFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (values.currentPasswordForEmail === "password") { 
      setCurrentUserAccountData(prev => ({...prev, email: values.newEmail}));
      if (typeof window !== 'undefined') {
        const profileDataStr = localStorage.getItem(CURRENT_USER_PROFILE_DATA_KEY);
        if (profileDataStr) {
            try {
                const profileData = JSON.parse(profileDataStr);
                profileData.email = values.newEmail;
                localStorage.setItem(CURRENT_USER_PROFILE_DATA_KEY, JSON.stringify(profileData));
            } catch (e) { console.error("Error updating email in profile data:", e); }
        }
      }
      toast({ title: "Email zmieniony (Symulacja)", description: `Link weryfikacyjny został wysłany na ${values.newEmail}. Zmiana zostanie zastosowana po potwierdzeniu.`});
      emailForm.reset();
    } else {
      emailForm.setError("currentPasswordForEmail", { type: "manual", message: "Nieprawidłowe obecne hasło." });
    }
    setIsSubmitting(false);
  }

  async function onSubmitChangePassword(values: ChangePasswordFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (values.currentPassword === "password") { 
      toast({ title: "Hasło zmienione (Symulacja)", description: "Twoje hasło zostało pomyślnie zaktualizowane."});
      passwordForm.reset();
    } else {
      passwordForm.setError("currentPassword", { type: "manual", message: "Nieprawidłowe obecne hasło." });
    }
    setIsSubmitting(false);
  }
  
  async function onSubmitDeleteAccount(values: DeleteAccountFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (values.passwordConfirmation === "password") { 
        toast({ title: "Konto usunięte (Symulacja)", description: "Twoje konto zostało usunięte. Zostaniesz wylogowany.", variant: "destructive" });
        if (typeof window !== 'undefined') {
            localStorage.clear(); 
            window.location.href = "/login?status=account_deleted";
        }
    } else {
        deleteAccountForm.setError("passwordConfirmation", { type: "manual", message: "Nieprawidłowe hasło."});
    }
    setIsSubmitting(false);
  }

  const handleActivate2FA = () => {
    setIsTwoFactorEnabled(true);
    setBackupCodes(MOCK_BACKUP_CODES); 
    localStorage.setItem("workoutWise2FAStatus", "true");
    toast({ title: "2FA Aktywowane!", description: "Dwuetapowa weryfikacja została pomyślnie włączona."});
    setShowTwoFactorDialog(false);
    setShowBackupCodesDialog(true);
  };

  const onDeactivate2FASubmit = async (data: Deactivate2FAFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (data.password === "password") {
        setIsTwoFactorEnabled(false);
        localStorage.removeItem("workoutWise2FAStatus");
        setBackupCodes([]);
        toast({ title: "2FA Dezaktywowane", description: "Dwuetapowa weryfikacja została wyłączona.", variant: "default"});
        deactivate2faForm.reset();
    } else {
        deactivate2faForm.setError("password", { type: "manual", message: "Nieprawidłowe hasło." });
    }
    setIsSubmitting(false);
  };

  const handlePrivacySettingChange = (key: keyof UserPrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePrivacySettings = async () => {
    setIsSavingPrivacy(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
        localStorage.setItem(PROFILE_PRIVACY_SETTINGS_KEY, JSON.stringify(privacySettings));
        if (typeof window !== 'undefined') {
            const profileDataStr = localStorage.getItem(CURRENT_USER_PROFILE_DATA_KEY);
            if (profileDataStr) {
                try {
                    const profileData = JSON.parse(profileDataStr);
                    profileData.privacySettings = privacySettings;
                    localStorage.setItem(CURRENT_USER_PROFILE_DATA_KEY, JSON.stringify(profileData));
                } catch (e) { console.error("Error updating privacy settings in profile data:", e); }
            }
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
    } finally {
        setIsSavingPrivacy(false);
    }
  };

  const renderDisplayValue = (value: string | number | undefined | null, unit = "", defaultValue = "N/A") => {
    if (value === undefined || value === null || value === "") return defaultValue;
    return `${value}${unit}`;
  }

  if (isLoading) {
    return <AccountSettingsPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Panelu</span>
              </Link>
            </Button>
            <Settings2 className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Moje Konto</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
            <Tabs defaultValue="personal-data" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
                    <TabsTrigger value="personal-data"><UserCircle2 className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Dane</TabsTrigger>
                    <TabsTrigger value="security"><ShieldCheck className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Bezpieczeństwo</TabsTrigger>
                    <TabsTrigger value="privacy"><ShieldCheck className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Prywatność</TabsTrigger>
                    <TabsTrigger value="linked-accounts"><LinkIcon className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Połączone</TabsTrigger>
                    <TabsTrigger value="data-management"><FileText className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Dane</TabsTrigger>
                </TabsList>

                <TabsContent value="personal-data">
                    <PersonalDataSection
                        isEditing={isEditingPersonalData}
                        setIsEditing={setIsEditingPersonalData}
                        isSubmitting={isSubmitting}
                        currentUserAccountData={currentUserAccountData}
                        personalDataForm={personalDataForm}
                        onSubmitPersonalData={onSubmitPersonalData}
                        renderDisplayValue={renderDisplayValue}
                    />
                </TabsContent>

                <TabsContent value="security">
                    <SecurityManagementSection
                        isSubmitting={isSubmitting}
                        currentUserAccountData={currentUserAccountData}
                        emailForm={emailForm}
                        onSubmitChangeEmail={onSubmitChangeEmail}
                        passwordForm={passwordForm}
                        onSubmitChangePassword={onSubmitChangePassword}
                        isTwoFactorEnabled={isTwoFactorEnabled}
                        setShowTwoFactorDialog={setShowTwoFactorDialog}
                        setShowBackupCodesDialog={setShowBackupCodesDialog}
                        deactivate2faForm={deactivate2faForm}
                        onDeactivate2FASubmit={onDeactivate2FASubmit}
                        loginHistory={MOCK_LOGIN_HISTORY}
                    />
                </TabsContent>

                <TabsContent value="privacy">
                    <ProfilePrivacyManagementSection
                        privacySettings={privacySettings}
                        handlePrivacySettingChange={handlePrivacySettingChange}
                        isSavingPrivacy={isSavingPrivacy}
                        handleSavePrivacySettings={handleSavePrivacySettings}
                    />
                </TabsContent>

                <TabsContent value="linked-accounts">
                    <LinkedAccountsManagementSection />
                </TabsContent>

                 <TabsContent value="data-management">
                    <AccountDataManagementSection
                        isSubmitting={isSubmitting}
                        deleteAccountForm={deleteAccountForm}
                        onSubmitDeleteAccount={onSubmitDeleteAccount}
                    />
                 </TabsContent>
            </Tabs>
        </div>
      </main>
       <TwoFactorAuthDialog isOpen={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog} onActivateSuccess={handleActivate2FA} />
       <ViewBackupCodesDialog isOpen={showBackupCodesDialog} onOpenChange={setShowBackupCodesDialog} backupCodes={backupCodes} />
    </div>
  );
}
