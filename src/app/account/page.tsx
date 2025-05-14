
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

export default function AccountPage() {
  const { toast } = useToast();
  const [currentUserData, setCurrentUserData] = React.useState(MOCK_USER_DATA);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditingPersonalData, setIsEditingPersonalData] = React.useState(false);

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

  React.useEffect(() => {
    // Simulate fetching user data
    setIsLoading(true);
    setTimeout(() => {
      // In a real app, fetch MOCK_USER_DATA from API
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
    setIsLoading(true);
    console.log("Aktualizacja danych osobowych:", values);
    // Simulate API call
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

    toast({
      title: "Dane osobowe zaktualizowane!",
      description: "Twoje dane zostały pomyślnie zapisane.",
    });
    setIsEditingPersonalData(false);
    setIsLoading(false);
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
                <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="personal-data"><UserCircle2 className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Dane Osobowe</TabsTrigger>
                    <TabsTrigger value="security" disabled><ShieldCheck className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Bezpieczeństwo</TabsTrigger>
                    <TabsTrigger value="notifications" disabled><Bell className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Powiadomienia</TabsTrigger>
                    <TabsTrigger value="delete-account" disabled><Trash2 className="mr-2 h-4 w-4 sm:hidden md:inline-block"/>Usuń Konto</TabsTrigger>
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
                                        personalDataForm.reset({ // Reset form to current data before editing
                                            fullName: currentUserData.fullName,
                                            dateOfBirth: currentUserData.dateOfBirth ? parseISO(currentUserData.dateOfBirth) : new Date(),
                                            gender: currentUserData.gender,
                                            weight: currentUserData.weight ?? "",
                                            height: currentUserData.height ?? "",
                                            fitnessLevel: currentUserData.fitnessLevel,
                                        });
                                        setIsEditingPersonalData(true);
                                    }} disabled={isLoading}>
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
                                            <FormItem>
                                                <FormLabel>Imię i nazwisko</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={personalDataForm.control}
                                            name="dateOfBirth"
                                            render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Data urodzenia</FormLabel>
                                                <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("w-full sm:w-[280px] justify-start text-left font-normal",!field.value && "text-muted-foreground")}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                                                    </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                    mode="single" selected={field.value} onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} locale={pl}
                                                    />
                                                </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={personalDataForm.control}
                                            name="gender"
                                            render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Płeć</FormLabel>
                                                <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4">
                                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Mężczyzna</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Kobieta</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Inna</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="prefer_not_to_say" /></FormControl><FormLabel className="font-normal">Wolę nie podawać</FormLabel></FormItem>
                                                </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={personalDataForm.control}
                                                name="weight"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel><Weight className="inline mr-1 h-4 w-4"/>Waga (kg)</FormLabel>
                                                    <FormControl><Input type="number" placeholder="np. 70" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={personalDataForm.control}
                                                name="height"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel><Ruler className="inline mr-1 h-4 w-4"/>Wzrost (cm)</FormLabel>
                                                    <FormControl><Input type="number" placeholder="np. 175" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={personalDataForm.control}
                                            name="fitnessLevel"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel><TrendingUp className="inline mr-1 h-4 w-4"/>Poziom zaawansowania</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Wybierz poziom" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="beginner">Początkujący</SelectItem>
                                                    <SelectItem value="intermediate">Średniozaawansowany</SelectItem>
                                                    <SelectItem value="advanced">Zaawansowany</SelectItem>
                                                </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-end gap-3 pt-4">
                                            <Button type="button" variant="outline" onClick={() => setIsEditingPersonalData(false)} disabled={isLoading}>
                                                <XCircle className="mr-2 h-4 w-4"/> Anuluj
                                            </Button>
                                            <Button type="submit" disabled={isLoading}>
                                                {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4"/>} Zapisz zmiany
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between py-2 border-b"><span>Imię i nazwisko:</span> <span className="font-medium">{currentUserData.fullName}</span></div>
                                    <div className="flex justify-between py-2 border-b"><span>Email:</span> <span className="font-medium text-muted-foreground">{currentUserData.email} (nieedytowalny w tej sekcji)</span></div>
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
                        <CardHeader><CardTitle>Bezpieczeństwo</CardTitle><CardDescription>Zarządzaj swoim adresem email i hasłem.</CardDescription></CardHeader>
                        <CardContent><Alert variant="default"><Mail className="h-4 w-4"/> <AlertTitle>Sekcja w budowie</AlertTitle><AlertDescription>Funkcje zmiany emaila i hasła zostaną dodane wkrótce.</AlertDescription></Alert></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="notifications">
                     <Card>
                        <CardHeader><CardTitle>Powiadomienia</CardTitle><CardDescription>Zarządzaj preferencjami powiadomień.</CardDescription></CardHeader>
                        <CardContent><Alert variant="default"><Bell className="h-4 w-4"/> <AlertTitle>Sekcja w budowie</AlertTitle><AlertDescription>Ustawienia powiadomień będą dostępne wkrótce. Możesz zarządzać przypomnieniami o treningu w głównej sekcji Ustawień.</AlertDescription></Alert></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="delete-account">
                     <Card>
                        <CardHeader><CardTitle>Usuń Konto</CardTitle><CardDescription>Trwałe usunięcie konta i wszystkich danych.</CardDescription></CardHeader>
                        <CardContent><Alert variant="destructive"><Trash2 className="h-4 w-4"/> <AlertTitle>Sekcja w budowie</AlertTitle><AlertDescription>Możliwość usunięcia konta zostanie dodana wkrótce.</AlertDescription></Alert></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </main>
    </div>
  );
}

    