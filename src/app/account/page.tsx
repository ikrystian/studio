
"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form"; // Added Controller
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
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
  Image as ImageIcon, // Placeholder for 2FA QR
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
import { TwoFactorAuthDialog } from "@/components/account/two-factor-auth-dialog";
import { ViewBackupCodesDialog } from "@/components/account/view-backup-codes-dialog";
import { Switch } from "@/components/ui/switch"; // Added Switch
import { Label } from "@/components/ui/label"; // Added Label
import type { UserPrivacySettings } from "@/components/profile/profile-privacy-settings-dialog"; // Import UserPrivacySettings


// Mock data - in a real app, this would come from an API
const MOCK_USER_DATA = {
  id: "current_user_id",
  fullName: "Alex Workout",
  email: "alex.workout@example.com",
  dateOfBirth: new Date(1990, 5, 15).toISOString(), // Store as ISO string
  gender: "male" as "male" | "female" | "other" | "prefer_not_to_say",
  weight: 75.5, // kg
  height: 180, // cm
  fitnessLevel: "intermediate" as "beginner" | "intermediate" | "advanced",
};

const PROFILE_PRIVACY_SETTINGS_KEY = "currentUserPrivacySettings";
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


const personalDataSchema = z.object({
  fullName: z.string().min(1, "Imię i nazwisko jest wymagane."),
  dateOfBirth: z.date({
    required_error: "Data urodzenia jest wymagana.",
    invalid_type_error: "Nieprawidłowy format daty.",
  }),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
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

const verify2FACodeSchema = z.object({
    code: z.string().length(6, "Kod musi mieć 6 cyfr.").regex(/^\d{6}$/, "Kod musi składać się z 6 cyfr."),
});
type Verify2FACodeFormValues = z.infer<typeof verify2FACodeSchema>;

const deactivate2FASchema = z.object({
    password: z.string().min(1, "Hasło jest wymagane do deaktywacji 2FA."),
});
type Deactivate2FAFormValues = z.infer<typeof deactivate2FASchema>;



export default function AccountPage() {
  const { toast } = useToast();
  const [currentUserData, setCurrentUserData] = React.useState(MOCK_USER_DATA);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditingPersonalData, setIsEditingPersonalData] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); 

  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = React.useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = React.useState(false);
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = React.useState(false);

  const [privacySettings, setPrivacySettings] = React.useState<UserPrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [isSavingPrivacy, setIsSavingPrivacy] = React.useState(false);


  React.useEffect(() => {
    // Simulate loading privacy settings
    try {
      const storedSettings = localStorage.getItem(PROFILE_PRIVACY_SETTINGS_KEY);
      if (storedSettings) {
        setPrivacySettings(JSON.parse(storedSettings));
      } else {
        setPrivacySettings(DEFAULT_PRIVACY_SETTINGS); // Initialize if not found
      }
    } catch (error) {
      console.error("Error loading privacy settings:", error);
      setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
    }
  }, []);


  const personalDataForm = useForm<PersonalDataFormValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      fullName: currentUserData.fullName,
      dateOfBirth: currentUserData.dateOfBirth ? parseISO(currentUserData.dateOfBirth) : undefined,
      gender: currentUserData.gender,
      weight: currentUserData.weight ?? "",
      height: currentUserData.height ?? "",
      fitnessLevel: currentUserData.fitnessLevel,
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
    // Simulate fetching user data
    setTimeout(() => {
      personalDataForm.reset({
        fullName: currentUserData.fullName,
        dateOfBirth: currentUserData.dateOfBirth ? parseISO(currentUserData.dateOfBirth) : new Date(),
        gender: currentUserData.gender,
        weight: currentUserData.weight ?? "",
        height: currentUserData.height ?? "",
        fitnessLevel: currentUserData.fitnessLevel,
      });
      // Simulate fetching 2FA status
      const stored2FAStatus = localStorage.getItem("workoutWise2FAStatus");
      setIsTwoFactorEnabled(stored2FAStatus === "true");

      setIsLoading(false);
    }, 500);
  }, [currentUserData, personalDataForm]);


  async function onSubmitPersonalData(values: PersonalDataFormValues) {
    setIsSubmitting(true);
    console.log("Aktualizacja danych osobowych:", values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentUserData(prev => ({
        ...prev,
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth.toISOString(),
        gender: values.gender,
        weight: values.weight === "" ? undefined : Number(values.weight),
        height: values.height === "" ? undefined : Number(values.height),
        fitnessLevel: values.fitnessLevel,
    }));
    toast({ title: "Dane osobowe zaktualizowane!", description: "Twoje dane zostały pomyślnie zapisane." });
    setIsEditingPersonalData(false);
    setIsSubmitting(false);
  }

  async function onSubmitChangeEmail(values: ChangeEmailFormValues) {
    setIsSubmitting(true);
    console.log("Zmiana adresu email:", values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (values.currentPasswordForEmail === "password") { 
      toast({ title: "Email zmieniony (Symulacja)", description: `Link weryfikacyjny został wysłany na ${values.newEmail}. Zmiana zostanie zastosowana po potwierdzeniu.`});
      emailForm.reset();
    } else {
      emailForm.setError("currentPasswordForEmail", { type: "manual", message: "Nieprawidłowe obecne hasło." });
    }
    setIsSubmitting(false);
  }

  async function onSubmitChangePassword(values: ChangePasswordFormValues) {
    setIsSubmitting(true);
    console.log("Zmiana hasła:", values);
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
    console.log("Usuwanie konta, potwierdzenie hasłem:", values.passwordConfirmation);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (values.passwordConfirmation === "password") { 
        toast({ title: "Konto usunięte (Symulacja)", description: "Twoje konto zostało usunięte. Zostaniesz wylogowany.", variant: "destructive" });
        // router.push("/login"); 
    } else {
        deleteAccountForm.setError("passwordConfirmation", { type: "manual", message: "Nieprawidłowe hasło."});
    }
    setIsSubmitting(false);
  }

  const handleActivate2FA = () => {
    setIsTwoFactorEnabled(true);
    setBackupCodes(MOCK_BACKUP_CODES); // Simulate generating backup codes
    localStorage.setItem("workoutWise2FAStatus", "true");
    toast({ title: "2FA Aktywowane!", description: "Dwuetapowa weryfikacja została pomyślnie włączona."});
    setShowTwoFactorDialog(false);
    setShowBackupCodesDialog(true); // Show backup codes dialog
  };

  const onDeactivate2FASubmit = async (data: Deactivate2FAFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (data.password === "password") { // Simulate correct password
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
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
    try {
        localStorage.setItem(PROFILE_PRIVACY_SETTINGS_KEY, JSON.stringify(privacySettings));
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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Panelu</span>
              </Link>
            </Button>
            <Settings2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Moje Konto</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-3xl">
            <Tabs defaultValue="personal-data" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-5 mb-6">
                    <TabsTrigger value="personal-data"><UserCircle2 className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Dane Osobowe</TabsTrigger>
                    <TabsTrigger value="security"><ShieldCheck className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Bezpieczeństwo</TabsTrigger>
                    <TabsTrigger value="privacy"><ShieldCheck className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Prywatność Profilu</TabsTrigger>
                    <TabsTrigger value="linked-accounts"><Link className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Połączone Konta</TabsTrigger>
                    <TabsTrigger value="data-management"><FileText className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Zarządzanie Danymi</TabsTrigger>
                </TabsList>

                <TabsContent value="personal-data">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Dane Osobowe</CardTitle>
                                    <CardDescription>Przeglądaj i zarządzaj swoimi danymi osobowymi.</CardDescription>
                                </div>
                                {!isEditingPersonalData && (
                                    <Button variant="outline" onClick={() => {
                                        personalDataForm.reset({ 
                                            fullName: currentUserData.fullName,
                                            dateOfBirth: currentUserData.dateOfBirth ? parseISO(currentUserData.dateOfBirth) : new Date(),
                                            gender: currentUserData.gender,
                                            weight: currentUserData.weight ?? "",
                                            height: currentUserData.height ?? "",
                                            fitnessLevel: currentUserData.fitnessLevel,
                                        });
                                        setIsEditingPersonalData(true);
                                    }} disabled={isLoading || isSubmitting}>
                                        <Edit3 className="mr-2 h-4 w-4"/> Edytuj
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading && !isEditingPersonalData ? (
                                <div className="flex justify-center items-center py-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : isEditingPersonalData ? (
                                <Form {...personalDataForm}>
                                    <form onSubmit={personalDataForm.handleSubmit(onSubmitPersonalData)} className="space-y-6">
                                        <FormField
                                            control={personalDataForm.control}
                                            name="fullName"
                                            render={({ field }) => (
                                            <FormItem><FormLabel>Imię i nazwisko</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={personalDataForm.control}
                                            name="dateOfBirth"
                                            render={({ field }) => (
                                            <FormItem className="flex flex-col"><FormLabel>Data urodzenia</FormLabel>
                                                <Popover><PopoverTrigger asChild><FormControl>
                                                    <Button variant={"outline"} className={cn("w-full sm:w-[280px] justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                                                    </Button></FormControl></PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} locale={pl}/>
                                                </PopoverContent></Popover><FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={personalDataForm.control} name="gender"
                                            render={({ field }) => (
                                            <FormItem className="space-y-3"><FormLabel>Płeć</FormLabel><FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4">
                                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Mężczyzna</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Kobieta</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Inna</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="prefer_not_to_say" /></FormControl><FormLabel className="font-normal">Wolę nie podawać</FormLabel></FormItem>
                                                </RadioGroup></FormControl><FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField control={personalDataForm.control} name="weight" render={({ field }) => (<FormItem><FormLabel><Weight className="inline mr-1 h-4 w-4"/>Waga (kg)</FormLabel><FormControl><Input type="number" placeholder="np. 70" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={personalDataForm.control} name="height" render={({ field }) => (<FormItem><FormLabel><Ruler className="inline mr-1 h-4 w-4"/>Wzrost (cm)</FormLabel><FormControl><Input type="number" placeholder="np. 175" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                        <FormField control={personalDataForm.control} name="fitnessLevel" render={({ field }) => (<FormItem><FormLabel><TrendingUp className="inline mr-1 h-4 w-4"/>Poziom zaawansowania</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz poziom" /></SelectTrigger></FormControl>
                                                <SelectContent><SelectItem value="beginner">Początkujący</SelectItem><SelectItem value="intermediate">Średniozaawansowany</SelectItem><SelectItem value="advanced">Zaawansowany</SelectItem></SelectContent>
                                                </Select><FormMessage /></FormItem>
                                            )}
                                        />
                                        <div className="flex justify-end gap-3 pt-4">
                                            <Button type="button" variant="outline" onClick={() => setIsEditingPersonalData(false)} disabled={isSubmitting}><XCircle className="mr-2 h-4 w-4"/> Anuluj</Button>
                                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4"/>} Zapisz zmiany</Button>
                                        </div>
                                    </form>
                                </Form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between py-2 border-b"><span>Imię i nazwisko:</span> <span className="font-medium">{currentUserData.fullName}</span></div>
                                    <div className="flex justify-between py-2 border-b"><span>Email:</span> <span className="font-medium text-muted-foreground">{currentUserData.email}</span></div>
                                    <div className="flex justify-between py-2 border-b"><span>Data urodzenia:</span> <span className="font-medium">{currentUserData.dateOfBirth ? format(parseISO(currentUserData.dateOfBirth), "PPP", { locale: pl }) : "N/A"}</span></div>
                                    <div className="flex justify-between py-2 border-b"><span>Płeć:</span> <span className="font-medium capitalize">{currentUserData.gender.replace("_", " ")}</span></div>
                                    <div className="flex justify-between py-2 border-b"><span>Waga:</span> <span className="font-medium">{renderDisplayValue(currentUserData.weight, " kg")}</span></div>
                                    <div className="flex justify-between py-2 border-b"><span>Wzrost:</span> <span className="font-medium">{renderDisplayValue(currentUserData.height, " cm")}</span></div>
                                    <div className="flex justify-between py-2 border-b"><span>Poziom zaawansowania:</span> <span className="font-medium capitalize">{currentUserData.fitnessLevel}</span></div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="security">
                     <Card>
                        <CardHeader><CardTitle>Bezpieczeństwo</CardTitle><CardDescription>Zarządzaj swoim adresem email, hasłem i innymi opcjami bezpieczeństwa.</CardDescription></CardHeader>
                        <CardContent className="space-y-8">
                            {/* Change Email Form */}
                            <Form {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(onSubmitChangeEmail)} className="space-y-4 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">Zmień Adres Email</h3>
                                    <Alert variant="default" className="mb-4"><Mail className="h-4 w-4"/> <AlertTitle>Informacja</AlertTitle><AlertDescription>Po zmianie adresu email, wyślemy link weryfikacyjny na nowy adres. Zmiana zostanie zastosowana po potwierdzeniu.</AlertDescription></Alert>
                                    <p className="text-sm text-muted-foreground">Obecny email: <span className="font-medium">{currentUserData.email}</span></p>
                                    <FormField control={emailForm.control} name="newEmail" render={({ field }) => (
                                        <FormItem><FormLabel>Nowy adres email</FormLabel><FormControl><Input type="email" placeholder="nowy@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={emailForm.control} name="currentPasswordForEmail" render={({ field }) => (
                                        <FormItem><FormLabel>Obecne hasło</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4"/>} Zmień Email (Symulacja)</Button>
                                </form>
                            </Form>
                            {/* Change Password Form */}
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onSubmitChangePassword)} className="space-y-4 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">Zmień Hasło</h3>
                                    <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                        <FormItem><FormLabel>Obecne hasło</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                        <FormItem><FormLabel>Nowe hasło</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={passwordForm.control} name="confirmNewPassword" render={({ field }) => (
                                        <FormItem><FormLabel>Potwierdź nowe hasło</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Lock className="mr-2 h-4 w-4"/>} Zmień Hasło (Symulacja)</Button>
                                </form>
                            </Form>
                            {/* 2FA Section */}
                            <Card className="p-4 border rounded-lg">
                                <CardHeader className="p-0 pb-3">
                                    <CardTitle className="text-lg font-semibold">Weryfikacja Dwuetapowa (2FA)</CardTitle>
                                    <CardDescription>Zwiększ bezpieczeństwo swojego konta.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 space-y-3">
                                {isTwoFactorEnabled ? (
                                    <>
                                        <Alert variant="default" className="border-green-500 dark:border-green-400">
                                            <ShieldCheck className="h-4 w-4 text-green-500" />
                                            <AlertTitle className="text-green-700 dark:text-green-300">2FA jest Aktywne</AlertTitle>
                                            <AlertDescription>
                                                Twoje konto jest dodatkowo chronione.
                                            </AlertDescription>
                                        </Alert>
                                        <Button variant="outline" onClick={() => setShowBackupCodesDialog(true)} disabled={isSubmitting} className="w-full sm:w-auto mr-2">
                                            Pokaż Kody Zapasowe
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" disabled={isSubmitting} className="w-full sm:w-auto">
                                                    Dezaktywuj 2FA
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Dezaktywować 2FA?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Aby potwierdzić, wprowadź swoje obecne hasło.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <Form {...deactivate2faForm}>
                                                    <form onSubmit={deactivate2faForm.handleSubmit(onDeactivate2FASubmit)} className="space-y-4">
                                                        <FormField
                                                            control={deactivate2faForm.control}
                                                            name="password"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Obecne hasło</FormLabel>
                                                                    <FormControl><Input type="password" {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel disabled={isSubmitting}>Anuluj</AlertDialogCancel>
                                                            <AlertDialogAction type="submit" disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                                                                {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null}
                                                                Potwierdź i dezaktywuj
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </form>
                                                </Form>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                ) : (
                                     <Button onClick={() => setShowTwoFactorDialog(true)} variant="outline" disabled={isSubmitting}>
                                        <ShieldCheck className="mr-2 h-4 w-4" /> Aktywuj Weryfikację Dwuetapową
                                    </Button>
                                )}
                                </CardContent>
                            </Card>
                             {/* Login History Section */}
                            <Card className="p-4 border rounded-lg">
                                <CardHeader className="p-0 pb-3">
                                    <CardTitle className="text-lg font-semibold">Historia Logowań i Aktywności</CardTitle>
                                    <CardDescription>Przeglądaj ostatnie aktywności na Twoim koncie.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {MOCK_LOGIN_HISTORY.length > 0 ? (
                                        <ul className="space-y-2 text-sm">
                                            {MOCK_LOGIN_HISTORY.slice(0,3).map(item => ( // Show last 3 for brevity
                                                <li key={item.id} className="p-2 border-b last:border-b-0">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">{item.type}</span>
                                                        <span className="text-xs text-muted-foreground">{format(parseISO(item.date), "PPPp", { locale: pl })}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">IP: {item.ip}, Urządzenie: {item.device}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Brak historii logowań do wyświetlenia.</p>
                                    )}
                                     <Button variant="link" size="sm" className="mt-2 p-0 h-auto" disabled>Zobacz pełną historię (Wkrótce)</Button>
                                </CardContent>
                            </Card>

                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="privacy">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/>Ustawienia Prywatności Profilu</CardTitle>
                            <CardDescription>Zarządzaj tym, co inni użytkownicy mogą widzieć na Twoim profilu publicznym.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                    <Label htmlFor="privacy-activity" className="text-base">
                                        Moja Aktywność Publiczna
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Czy inni mogą widzieć Twoje udostępnione treningi, posty, nowe rekordy itp.?
                                    </p>
                                    </div>
                                    <Switch
                                    id="privacy-activity"
                                    checked={privacySettings.isActivityPublic}
                                    onCheckedChange={(checked) => handlePrivacySettingChange("isActivityPublic", checked)}
                                    disabled={isSavingPrivacy}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                    <Label htmlFor="privacy-friends" className="text-base">
                                        Lista Znajomych Publiczna
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Czy inni mogą widzieć listę Twoich znajomych/obserwowanych?
                                    </p>
                                    </div>
                                    <Switch
                                    id="privacy-friends"
                                    checked={privacySettings.isFriendsListPublic}
                                    onCheckedChange={(checked) => handlePrivacySettingChange("isFriendsListPublic", checked)}
                                    disabled={isSavingPrivacy}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                    <Label htmlFor="privacy-plans" className="text-base">
                                        Udostępnione Plany Publiczne
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Czy inni mogą widzieć Twoje udostępnione plany treningowe?
                                    </p>
                                    </div>
                                    <Switch
                                    id="privacy-plans"
                                    checked={privacySettings.isSharedPlansPublic}
                                    onCheckedChange={(checked) => handlePrivacySettingChange("isSharedPlansPublic", checked)}
                                    disabled={isSavingPrivacy}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSavePrivacySettings} disabled={isSavingPrivacy}>
                                {isSavingPrivacy ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4" />}
                                Zapisz Ustawienia Prywatności
                            </Button>
                            <Alert>
                                <Info className="h-4 w-4"/>
                                <AlertTitle>Informacja</AlertTitle>
                                <AlertDescription>
                                    Pamiętaj, że niektóre podstawowe informacje (jak nazwa użytkownika) mogą być zawsze publiczne.
                                    Bardziej szczegółowe ustawienia prywatności (np. dla poszczególnych postów) mogą być dostępne w odpowiednich sekcjach aplikacji.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="linked-accounts">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Link className="mr-0 h-5 w-5 text-primary"/>Połączone Konta</CardTitle>
                            <CardDescription>Zarządzaj kontami Google, Facebook itp. połączonymi z Twoim profilem WorkoutWise.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <Info className="h-4 w-4"/>
                                <AlertTitle>Funkcja w Budowie</AlertTitle>
                                <AlertDescription>
                                    Możliwość łączenia kont z serwisami takimi jak Google czy Facebook zostanie dodana w przyszłości.
                                </AlertDescription>
                            </Alert>
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold">Google</h4>
                                <p className="text-sm text-muted-foreground mb-2">Status: Niepołączono</p>
                                <Button variant="outline" disabled>Połącz z Google (Wkrótce)</Button>
                            </div>
                             <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold">Facebook</h4>
                                <p className="text-sm text-muted-foreground mb-2">Status: Niepołączono</p>
                                <Button variant="outline" disabled>Połącz z Facebook (Wkrótce)</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="data-management">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>Zarządzanie Danymi</CardTitle>
                            <CardDescription>Eksportuj swoje dane lub trwale usuń konto.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             <Card className="p-4">
                                <CardHeader className="p-0 pb-3">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-1"><FileText className="h-4 w-4"/>Eksport Danych</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-2">
                                    <p className="text-sm text-muted-foreground">Możesz zażądać eksportu swoich danych osobowych i treningowych w ustrukturyzowanym formacie.</p>
                                    <Button variant="outline" disabled><FileText className="mr-2 h-4 w-4" /> Rozpocznij eksport (Wkrótce)</Button>
                                     <p className="text-xs text-muted-foreground pt-1">Proces przygotowania danych może zająć trochę czasu. Otrzymasz powiadomienie, gdy plik będzie gotowy do pobrania lub zostanie wysłany na Twój email.</p>
                                </CardContent>
                             </Card>
                             <Card className="border-destructive p-4">
                                <CardHeader className="p-0 pb-3">
                                    <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5"/>Usuń Konto</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Ostrzeżenie!</AlertTitle>
                                        <AlertDescription>
                                            Usunięcie konta jest operacją nieodwracalną. Wszystkie Twoje dane, w tym historia treningów, plany, postępy i ustawienia zostaną trwale usunięte.
                                        </AlertDescription>
                                    </Alert>
                                    <Form {...deleteAccountForm}>
                                        <form onSubmit={deleteAccountForm.handleSubmit(onSubmitDeleteAccount)} className="space-y-4">
                                            <FormField control={deleteAccountForm.control} name="passwordConfirmation" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Potwierdź hasłem</FormLabel>
                                                    <FormControl><Input type="password" placeholder="Wpisz swoje hasło" {...field} /></FormControl>
                                                    <FormDescription>Aby potwierdzić chęć usunięcia konta, wpisz swoje obecne hasło.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" className="w-full" type="button" disabled={!deleteAccountForm.formState.isValid || isSubmitting}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Usuń Moje Konto Na Stałe
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Czy na pewno chcesz usunąć konto?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        To jest Twoja ostatnia szansa na przerwanie tej operacji. Po potwierdzeniu, wszystkie Twoje dane zostaną usunięte i nie będzie można ich odzyskać.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel disabled={isSubmitting}>Anuluj</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={deleteAccountForm.handleSubmit(onSubmitDeleteAccount)} 
                                                        disabled={isSubmitting}
                                                        className="bg-destructive hover:bg-destructive/90"
                                                    >
                                                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                                                        Tak, usuń konto
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </form>
                                    </Form>
                                </CardContent>
                             </Card>
                        </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>
        </div>
      </main>
       <TwoFactorAuthDialog
            isOpen={showTwoFactorDialog}
            onOpenChange={setShowTwoFactorDialog}
            onActivateSuccess={handleActivate2FA}
        />
        <ViewBackupCodesDialog
            isOpen={showBackupCodesDialog}
            onOpenChange={setShowBackupCodesDialog}
            backupCodes={backupCodes}
        />
    </div>
  );
}

    