
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft, BellRing, Save, Loader2, AlertCircle } from "lucide-react";

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

const DAYS_OF_WEEK = [
  { id: "monday", label: "Poniedziałek" },
  { id: "tuesday", label: "Wtorek" },
  { id: "wednesday", label: "Środa" },
  { id: "thursday", label: "Czwartek" },
  { id: "friday", label: "Piątek" },
  { id: "saturday", label: "Sobota" },
  { id: "sunday", label: "Niedziela" },
] as const;

const reminderSettingsSchema = z.object({
  enableReminders: z.boolean().default(false),
  reminderDays: z.array(z.string()).refine((value) => value.some(day => day), {
    message: "Musisz wybrać co najmniej jeden dzień, jeśli przypomnienia są włączone.",
  }).optional(), // Optional if enableReminders is false
  reminderHour: z.string().optional(),
  reminderMinute: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.enableReminders) {
    if (!data.reminderDays || data.reminderDays.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wybierz co najmniej jeden dzień dla przypomnień.",
        path: ["reminderDays"],
      });
    }
    if (!data.reminderHour) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Godzina przypomnienia jest wymagana.",
        path: ["reminderHour"],
      });
    }
    if (!data.reminderMinute) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minuta przypomnienia jest wymagana.",
        path: ["reminderMinute"],
      });
    }
  }
});


type ReminderSettingsFormValues = z.infer<typeof reminderSettingsSchema>;

// Mock function to simulate loading settings
const loadReminderSettings = async (): Promise<Partial<ReminderSettingsFormValues>> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  // In a real app, fetch this from backend or localStorage
  return {
    enableReminders: false,
    reminderDays: [],
    reminderHour: "17", // Default to 5 PM
    reminderMinute: "00",
  };
};

export default function ReminderSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = React.useState(true);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<ReminderSettingsFormValues>({
    resolver: zodResolver(reminderSettingsSchema),
    defaultValues: {
      enableReminders: false,
      reminderDays: [],
      reminderHour: "17",
      reminderMinute: "00",
    },
  });

  React.useEffect(() => {
    async function fetchSettings() {
      setIsFetchingSettings(true);
      try {
        const settings = await loadReminderSettings();
        form.reset(settings);
      } catch (error) {
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
  }, [form, toast]);

  async function onSubmit(values: ReminderSettingsFormValues) {
    setIsLoading(true);
    setServerError(null);
    console.log("Reminder settings submitted:", values);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Example error simulation
    // if (values.reminderHour === "13") {
    //   setServerError("Zapisanie ustawień dla godziny 13:00 nie powiodło się. Spróbuj innej godziny.");
    //   setIsLoading(false);
    //   return;
    // }

    toast({
      title: "Ustawienia Zapisane!",
      description: "Twoje preferencje dotyczące przypomnień zostały zaktualizowane.",
      variant: "default",
    });
    setIsLoading(false);
  }

  const watchEnableReminders = form.watch("enableReminders");

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
                                          disabled={isLoading}
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
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
                </CardContent>
              </Card>
               {/* Placeholder for advanced reminder options */}
              {/* 
              <Card>
                <CardHeader>
                  <CardTitle>Zaawansowane Opcje</CardTitle>
                  <CardDescription>Dostosuj przypomnienia do swoich planów lub braku aktywności.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    (W przyszłości: przypomnienia powiązane z konkretnymi planami treningowymi, 
                    przypomnienia o braku aktywności przez X dni, itp.)
                  </p>
                </CardContent>
              </Card>
              */}

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
