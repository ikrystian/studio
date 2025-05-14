
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft, BellRing, Save, Loader2, AlertCircle, CalendarDays, Info, RefreshCw } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { pl } from "date-fns/locale";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"; // Added for inactivity days

const DAYS_OF_WEEK = [
  { id: "monday", label: "Poniedziałek" },
  { id: "tuesday", label: "Wtorek" },
  { id: "wednesday", label: "Środa" },
  { id: "thursday", label: "Czwartek" },
  { id: "friday", label: "Piątek" },
  { id: "saturday", label: "Sobota" },
  { id: "sunday", label: "Niedziela" },
] as const;

const MOCK_PLANS_FOR_REMINDERS = [
    { id: "plan1", name: "Mój Plan Siłowy Wiosna" },
    { id: "plan2", name: "Przygotowanie do Maratonu Lato" },
    { id: "plan3", name: "Redukcja Wakacyjna" },
];

const REMINDER_SETTINGS_LOCAL_STORAGE_KEY = "workoutWiseReminderSettings";

const reminderSettingsSchema = z.object({
  enableReminders: z.boolean().default(false),
  reminderType: z.enum(["regular", "plan_based", "inactivity"]).default("regular"),
  reminderDays: z.array(z.string()).optional(),
  reminderHour: z.string().optional(),
  reminderMinute: z.string().optional(),
  activePlanId: z.string().optional(),
  daysForInactivityReminder: z.coerce.number().int().positive("Liczba dni musi być dodatnia.").optional(),
  playSound: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.enableReminders) {
    if (data.reminderType === "regular") {
      if (!data.reminderDays || data.reminderDays.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Wybierz co najmniej jeden dzień dla przypomnień regularnych.",
          path: ["reminderDays"],
        });
      }
      if (!data.reminderHour) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Godzina przypomnienia jest wymagana.", path: ["reminderHour"] });
      }
      if (!data.reminderMinute) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Minuta przypomnienia jest wymagana.", path: ["reminderMinute"] });
      }
    } else if (data.reminderType === "plan_based") {
      if (!data.activePlanId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wybierz plan treningowy.", path: ["activePlanId"] });
      }
      if (!data.reminderHour) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Godzina przypomnienia jest wymagana.", path: ["reminderHour"] });
      }
      if (!data.reminderMinute) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Minuta przypomnienia jest wymagana.", path: ["reminderMinute"] });
      }
    } else if (data.reminderType === "inactivity") {
      if (!data.daysForInactivityReminder || data.daysForInactivityReminder <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Podaj poprawną liczbę dni (większą od 0).",
          path: ["daysForInactivityReminder"],
        });
      }
    }
  }
});


type ReminderSettingsFormValues = z.infer<typeof reminderSettingsSchema>;

// Default values for the form
const defaultReminderValues: ReminderSettingsFormValues = {
  enableReminders: false,
  reminderType: "regular",
  reminderDays: [],
  reminderHour: "17",
  reminderMinute: "00",
  activePlanId: undefined,
  daysForInactivityReminder: 3,
  playSound: false,
};


export default function ReminderSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = React.useState(true);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission>('default');
  const [lastWorkoutDateString, setLastWorkoutDateString] = React.useState<string | null>(null);

  const form = useForm<ReminderSettingsFormValues>({
    resolver: zodResolver(reminderSettingsSchema),
    defaultValues: defaultReminderValues,
  });

  const checkAndSimulateInactivityReminder = React.useCallback((settings: ReminderSettingsFormValues, lastWorkoutDateStr: string | null) => {
    if (
      settings.enableReminders &&
      settings.reminderType === "inactivity" &&
      settings.daysForInactivityReminder &&
      lastWorkoutDateStr
    ) {
      try {
        const lastWorkout = parseISO(lastWorkoutDateStr);
        const daysPassed = differenceInDays(new Date(), lastWorkout);
        if (daysPassed >= settings.daysForInactivityReminder) {
          toast({
            title: "Symulacja Przypomnienia o Braku Aktywności",
            description: `Nie trenowałeś od ${daysPassed} dni (ustawiono ${settings.daysForInactivityReminder} dni). Czas na ruch!`,
            variant: "default",
            duration: 7000,
          });
        }
      } catch (error) {
        console.error("Error processing last workout date for inactivity reminder:", error);
      }
    }
  }, [toast]);


  React.useEffect(() => {
    async function fetchSettings() {
      setIsFetchingSettings(true);
      let loadedSettings = { ...defaultReminderValues }; // Start with defaults
      try {
        const storedSettings = localStorage.getItem(REMINDER_SETTINGS_LOCAL_STORAGE_KEY);
        if (storedSettings) {
          loadedSettings = { ...loadedSettings, ...JSON.parse(storedSettings) };
        }
        form.reset(loadedSettings);

        if (typeof window !== "undefined" && "Notification" in window) {
          setNotificationPermission(Notification.permission);
        }

        const storedLastWorkoutDate = localStorage.getItem('workoutWiseLastWorkoutDate');
        setLastWorkoutDateString(storedLastWorkoutDate);
        
        // Initial check for inactivity reminder after loading everything
        if (storedLastWorkoutDate) {
            checkAndSimulateInactivityReminder(loadedSettings, storedLastWorkoutDate);
        }

      } catch (error) {
        console.error("Error loading reminder settings:", error);
        toast({
          title: "Błąd ładowania",
          description: "Nie udało się załadować ustawień przypomnień.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingSettings(false);
      }
    }
    fetchSettings();
  }, [form, toast, checkAndSimulateInactivityReminder]);


  async function onSubmit(values: ReminderSettingsFormValues) {
    setIsLoading(true);
    setServerError(null);
    console.log("Reminder settings submitted:", values);

    try {
      localStorage.setItem(REMINDER_SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(values));
      toast({
        title: "Ustawienia Zapisane!",
        description: "Twoje preferencje dotyczące przypomnień zostały zaktualizowane.",
        variant: "default",
      });
      // Perform inactivity check again with new settings
      checkAndSimulateInactivityReminder(values, lastWorkoutDateString);

    } catch (error) {
      console.error("Error saving reminder settings:", error);
      setServerError("Nie udało się zapisać ustawień. Spróbuj ponownie.");
      toast({ title: "Błąd Zapisu", description: "Nie udało się zapisać ustawień.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  }

  const handleRequestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === 'granted') {
        toast({ title: "Pozwolenie już udzielone", description: "Masz już włączone powiadomienia dla tej strony.", variant: "default" });
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          toast({ title: "Pozwolenie udzielone!", description: "Powiadomienia zostały włączone.", variant: "default" });
        } else if (permission === 'denied') {
          toast({ title: "Pozwolenie odrzucone", description: "Nie będziesz otrzymywać powiadomień. Możesz to zmienić w ustawieniach przeglądarki.", variant: "destructive", duration: 7000 });
        } else {
          toast({ title: "Pozwolenie nieudzielone", description: "Status pozwolenia nieznany. Spróbuj ponownie.", variant: "default" });
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        toast({ title: "Błąd", description: "Nie udało się poprosić o pozwolenie na powiadomienia.", variant: "destructive" });
      }
    } else {
      toast({ title: "Powiadomienia nieobsługiwane", description: "Twoja przeglądarka nie wspiera powiadomień systemowych.", variant: "destructive" });
    }
  };

  const watchEnableReminders = form.watch("enableReminders");
  const watchReminderType = form.watch("reminderType");

  if (isFetchingSettings) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Ładowanie ustawień przypomnień...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/settings">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Ustawień</span>
              </Link>
            </Button>
            <BellRing className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Przypomnienia o Treningu</h1>
          </div>
          <Button form="reminder-settings-form" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Zapisz Ustawienia
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-2xl">
          <Form {...form}>
            <form id="reminder-settings-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                    <CardTitle>Ustawienia Powiadomień Systemowych</CardTitle>
                </CardHeader>
                <CardContent>
                    {notificationPermission === 'granted' ? (
                        <Alert variant="default" className="border-green-500">
                            <CheckCircle className="h-4 w-4 text-green-500"/>
                            <AlertTitle className="text-green-700 dark:text-green-300">Pozwolenie na powiadomienia: Udzielone</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-300">
                                Będziesz otrzymywać powiadomienia systemowe z tej aplikacji.
                            </AlertDescription>
                        </Alert>
                    ) : notificationPermission === 'denied' ? (
                         <Alert variant="destructive">
                            <XCircle className="h-4 w-4"/>
                            <AlertTitle>Pozwolenie na powiadomienia: Odrzucone</AlertTitle>
                            <AlertDescription>
                                Aby otrzymywać powiadomienia, musisz zezwolić na nie w ustawieniach swojej przeglądarki dla tej strony.
                                <Button variant="link" size="sm" className="p-0 h-auto mt-1" onClick={handleRequestNotificationPermission}>Spróbuj ponownie poprosić o pozwolenie</Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                         <Alert>
                            <Info className="h-4 w-4"/>
                            <AlertTitle>Pozwolenie na powiadomienia: Wymagane</AlertTitle>
                            <AlertDescription>
                                Aby otrzymywać przypomnienia jako powiadomienia systemowe, musisz udzielić pozwolenia.
                                <Button variant="default" size="sm" className="mt-2" onClick={handleRequestNotificationPermission}>Poproś o pozwolenie na powiadomienia (Symulacja)</Button>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle>Ogólne Ustawienia Przypomnień</CardTitle>
                  <CardDescription>Włącz lub wyłącz przypomnienia i skonfiguruj ich podstawowe parametry.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {serverError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Błąd Zapisu</AlertTitle>
                      <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                  )}
                  <FormField
                    control={form.control}
                    name="enableReminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Włącz przypomnienia o treningu</FormLabel>
                          <FormDescription>
                            Otrzymuj powiadomienia, aby nie przegapić zaplanowanych aktywności.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {watchEnableReminders && (
                    <>
                      <FormField
                        control={form.control}
                        name="reminderType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Typ przypomnienia</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || !watchEnableReminders}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Wybierz typ przypomnienia" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="regular">Regularne (dni tygodnia i godzina)</SelectItem>
                                        <SelectItem value="plan_based">Powiązane z aktywnym planem</SelectItem>
                                        <SelectItem value="inactivity">Przypomnienie o braku aktywności</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                      />
                    
                      {watchReminderType === "regular" && (
                        <>
                          <FormField
                            control={form.control}
                            name="reminderDays"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel className="text-base">Dni przypomnień</FormLabel>
                                  <FormDescription>
                                    Wybierz dni tygodnia, w które chcesz otrzymywać przypomnienia.
                                  </FormDescription>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {DAYS_OF_WEEK.map((day) => (
                                  <FormField
                                    key={day.id}
                                    control={form.control}
                                    name="reminderDays"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={day.id}
                                          className="flex flex-row items-center space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(day.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...(field.value || []), day.id])
                                                  : field.onChange(
                                                      (field.value || []).filter(
                                                        (value) => value !== day.id
                                                      )
                                                    );
                                              }}
                                              disabled={isLoading || !watchEnableReminders}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            {day.label}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="reminderHour"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Godzina przypomnienia</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || !watchEnableReminders}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Wybierz godzinę" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(hour => (
                                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="reminderMinute"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minuta przypomnienia</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || !watchEnableReminders}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Wybierz minutę" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {['00', '15', '30', '45'].map(minute => (
                                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}

                      {watchReminderType === "plan_based" && (
                        <>
                           <FormField
                                control={form.control}
                                name="activePlanId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Wybierz aktywny plan treningowy</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || !watchEnableReminders}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Wybierz plan..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {MOCK_PLANS_FOR_REMINDERS.map(plan => (
                                                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Przypomnienie zostanie wysłane o podanej godzinie w dni treningowe z tego planu (symulacja).</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField control={form.control} name="reminderHour" render={({ field }) => ( <FormItem><FormLabel>Godzina przypomnienia</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || !watchEnableReminders}><FormControl><SelectTrigger><SelectValue placeholder="Godzina" /></SelectTrigger></FormControl><SelectContent>{Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(hour => (<SelectItem key={hour} value={hour}>{hour}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="reminderMinute" render={({ field }) => ( <FormItem><FormLabel>Minuta przypomnienia</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || !watchEnableReminders}><FormControl><SelectTrigger><SelectValue placeholder="Minuta" /></SelectTrigger></FormControl><SelectContent>{['00', '15', '30', '45'].map(minute => (<SelectItem key={minute} value={minute}>{minute}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                        </>
                      )}
                      {watchReminderType === "inactivity" && (
                         <FormField
                            control={form.control}
                            name="daysForInactivityReminder"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Przypomnij po X dniach bez treningu</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                                        value={field.value?.toString()}
                                        disabled={isLoading || !watchEnableReminders}
                                    >
                                        <FormControl><SelectTrigger><SelectValue placeholder="Wybierz liczbę dni" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {[2, 3, 4, 5, 7, 10, 14].map(day => (
                                                <SelectItem key={day} value={day.toString()}>{day} dni</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {lastWorkoutDateString ? (
                                        <FormDescription className="text-xs mt-1">
                                            Data ostatniego zapisanego treningu: {format(parseISO(lastWorkoutDateString), "PPP", { locale: pl })}.
                                        </FormDescription>
                                    ) : (
                                        <FormDescription className="text-xs mt-1 text-amber-600">
                                            Brak informacji o dacie ostatniego treningu. Zapisz trening, aby ta funkcja działała poprawnie.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="playSound"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Odtwarzaj dźwięk powiadomienia (Symulacja)</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading || !watchEnableReminders}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                      />
                       <Select disabled={isLoading || !watchEnableReminders || !form.watch("playSound")}>
                            <SelectTrigger><SelectValue placeholder="Wybierz dźwięk powiadomienia (Wkrótce)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default_sound">Domyślny Dźwięk</SelectItem>
                                {/* More sounds later */}
                            </SelectContent>
                        </Select>
                    </>
                  )}
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Zapisz Ustawienia
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
