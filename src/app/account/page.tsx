
"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  LogOut, // Placeholder for login history
  FileText, // Placeholder for export
  Info, // Placeholder for info/links
  AlertTriangle,
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
  // preferences for notifications can be added here
};

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


export default function AccountPage() {
  const { toast } = useToast();
  const [currentUserData, setCurrentUserData] = React.useState(MOCK_USER_DATA);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditingPersonalData, setIsEditingPersonalData] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For specific form submissions

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

  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      personalDataForm.reset({
        fullName: currentUserData.fullName,
        dateOfBirth: currentUserData.dateOfBirth ? parseISO(currentUserData.dateOfBirth) : new Date(),
        gender: currentUserData.gender,
        weight: currentUserData.weight ?? "",
        height: currentUserData.height ?? "",
        fitnessLevel: currentUserData.fitnessLevel,
      });
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
    // Simulate success or error
    if (values.currentPasswordForEmail === "password") { // Simulate correct password
      // setCurrentUserData(prev => ({ ...prev, email: values.newEmail })); // Update UI after backend confirmation
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
    if (values.currentPassword === "password") { // Simulate correct password
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
    if (values.passwordConfirmation === "password") { // Simulate correct password
        toast({ title: "Konto usunięte (Symulacja)", description: "Twoje konto zostało usunięte. Zostaniesz wylogowany.", variant: "destructive" });
        // router.push("/login"); // Redirect to login after deletion
    } else {
        deleteAccountForm.setError("passwordConfirmation", { type: "manual", message: "Nieprawidłowe hasło."});
    }
    setIsSubmitting(false);
  }

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
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-6">
                    <TabsTrigger value="personal-data"><UserCircle2 className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Dane Osobowe</TabsTrigger>
                    <TabsTrigger value="security"><ShieldCheck className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Bezpieczeństwo</TabsTrigger>
                    <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Powiadomienia</TabsTrigger>
                    <TabsTrigger value="delete-account"><Trash2 className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Usuń Konto</TabsTrigger>
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
                             {/* Placeholder for 2FA */}
                            <div className="p-4 border rounded-lg space-y-2">
                                <h3 className="text-lg font-semibold">Weryfikacja Dwuetapowa (2FA)</h3>
                                <p className="text-sm text-muted-foreground">Zwiększ bezpieczeństwo swojego konta.</p>
                                <Button variant="outline" disabled><ShieldCheck className="mr-2 h-4 w-4" /> Skonfiguruj 2FA (Wkrótce)</Button>
                            </div>
                            {/* Placeholder for Linked Accounts */}
                            <div className="p-4 border rounded-lg space-y-2">
                                <h3 className="text-lg font-semibold">Połączone Konta</h3>
                                <p className="text-sm text-muted-foreground">Zarządzaj kontami Google, Facebook itp. połączonymi z Twoim profilem WorkoutWise.</p>
                                <Button variant="outline" disabled><Info className="mr-2 h-4 w-4" /> Zarządzaj Połączonymi Kontami (Wkrótce)</Button>
                            </div>
                            {/* Placeholder for Login History */}
                            <div className="p-4 border rounded-lg space-y-2">
                                <h3 className="text-lg font-semibold">Historia Logowań</h3>
                                <p className="text-sm text-muted-foreground">Przeglądaj ostatnie aktywności logowania na Twoim koncie.</p>
                                <Button variant="outline" disabled><LogOut className="mr-2 h-4 w-4" /> Zobacz Historię Logowań (Wkrótce)</Button>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="notifications">
                     <Card>
                        <CardHeader><CardTitle>Powiadomienia</CardTitle><CardDescription>Zarządzaj preferencjami powiadomień.</CardDescription></CardHeader>
                        <CardContent>
                            <Alert variant="default">
                                <Bell className="h-4 w-4"/> 
                                <AlertTitle>Ustawienia Powiadomień</AlertTitle>
                                <AlertDescription>
                                    Szczegółowe ustawienia powiadomień (np. przypomnienia o treningu, aktywności społecznościowe) znajdują się w głównej sekcji "Ustawienia Aplikacji".
                                    <Button asChild variant="link" className="p-0 h-auto mt-2">
                                        <Link href="/settings">Przejdź do Ustawień Aplikacji <ArrowLeft className="transform rotate-180 ml-1 h-3 w-3" /></Link>
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="delete-account">
                     <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-6 w-6"/>Usuń Konto</CardTitle>
                            <CardDescription>Trwałe usunięcie konta i wszystkich powiązanych danych.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                         <CardFooter className="flex-col items-start space-y-4 pt-6 border-t">
                             <div>
                                <h4 className="font-semibold mb-1 flex items-center gap-1"><FileText className="h-4 w-4"/>Eksport Danych</h4>
                                <p className="text-sm text-muted-foreground mb-2">Przed usunięciem konta możesz chcieć wyeksportować swoje dane.</p>
                                <Button variant="outline" disabled><FileText className="mr-2 h-4 w-4" /> Eksportuj Moje Dane (Wkrótce)</Button>
                             </div>
                             <div>
                                <h4 className="font-semibold mb-1 flex items-center gap-1"><Info className="h-4 w-4"/>Ustawienia Prywatności Profilu</h4>
                                <p className="text-sm text-muted-foreground mb-2">Zarządzaj tym, co inni użytkownicy mogą widzieć na Twoim profilu publicznym.</p>
                                <Button variant="outline" disabled><ShieldCheck className="mr-2 h-4 w-4" /> Ustawienia Prywatności (Wkrótce)</Button>
                             </div>
                         </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </main>
    </div>
  );
}
        
