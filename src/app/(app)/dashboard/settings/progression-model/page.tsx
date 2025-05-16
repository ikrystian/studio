
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Settings as SettingsIcon, Save, Loader2, Info, BarChart3, HelpCircle, TrendingUp, Repeat } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ProgressionSettings } from "@/context/ProgressionSettingsContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { SettingsProgressionModelPageSkeleton } from "@/components/settings/SettingsProgressionModelPageSkeleton"; // Removed for no-skeleton approach

// MOCK BACKEND LOGIC:
// - Settings Persistence: Progression model settings are loaded from and saved to localStorage.
// - Actual Progression Logic: This page only handles the settings. The actual application of these
//   progression rules (e.g., suggesting next weights/reps) would happen in the "Active Workout" page,
//   using these settings and the user's workout history (which is also mock data).

const PROGRESSION_SETTINGS_LOCAL_STORAGE_KEY = "workoutWiseProgressionSettings";

const progressionSettingsSchema = z.object({
  enableProgression: z.boolean().default(true),
  selectedModel: z.enum(["linear_weight", "linear_reps", "double_progression", "none"]).default("linear_weight"),
  linearWeightIncrement: z.coerce.number().positive("Przyrost musi być dodatni").optional().or(z.literal("")),
  linearWeightCondition: z.string().optional(),
  linearRepsIncrement: z.coerce.number().positive("Przyrost musi być dodatni").int("Przyrost musi być liczbą całkowitą").optional().or(z.literal("")),
  linearRepsCondition: z.string().optional(),
  doubleProgressionRepRange: z.string().regex(/^\d+-\d+$/, "Zakres powtórzeń musi być w formacie X-Y, np. 8-12").optional(),
  doubleProgressionWeightIncrement: z.coerce.number().positive("Przyrost musi być dodatni").optional().or(z.literal("")),
  doubleProgressionCondition: z.string().optional(),
});

type ProgressionSettingsFormValues = z.infer<typeof progressionSettingsSchema>;

const defaultProgressionSettings: ProgressionSettingsFormValues = {
  enableProgression: true,
  selectedModel: "linear_weight",
  linearWeightIncrement: 2.5,
  linearWeightCondition: "Osiągnięto górny zakres powtórzeń w każdej serii",
  linearRepsIncrement: 1,
  linearRepsCondition: "Osiągnięto cel ciężaru dla danego zakresu powtórzeń",
  doubleProgressionRepRange: "8-12",
  doubleProgressionWeightIncrement: 2.5,
  doubleProgressionCondition: "Osiągnięto górny zakres powtórzeń we wszystkich seriach z danym ciężarem",
};

export default function ProgressionModelSettingsPage() {
  const { toast } = useToast();
  const [pageIsLoading, setPageIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<ProgressionSettingsFormValues>({
    resolver: zodResolver(progressionSettingsSchema),
    defaultValues: defaultProgressionSettings,
  });

  React.useEffect(() => {
    setPageIsLoading(true);
    const timer = setTimeout(() => {
      // MOCK BACKEND LOGIC: Simulate loading settings from localStorage.
      try {
        const storedSettings = localStorage.getItem(PROGRESSION_SETTINGS_LOCAL_STORAGE_KEY);
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          const valuesToReset: ProgressionSettingsFormValues = {
            enableProgression: parsedSettings.enableProgression ?? defaultProgressionSettings.enableProgression,
            selectedModel: parsedSettings.selectedModel ?? defaultProgressionSettings.selectedModel,
            linearWeightIncrement: parsedSettings.linearWeightIncrement === undefined || parsedSettings.linearWeightIncrement === null ? "" : parsedSettings.linearWeightIncrement,
            linearWeightCondition: parsedSettings.linearWeightCondition ?? defaultProgressionSettings.linearWeightCondition,
            linearRepsIncrement: parsedSettings.linearRepsIncrement === undefined || parsedSettings.linearRepsIncrement === null ? "" : parsedSettings.linearRepsIncrement,
            linearRepsCondition: parsedSettings.linearRepsCondition ?? defaultProgressionSettings.linearRepsCondition,
            doubleProgressionRepRange: parsedSettings.doubleProgressionRepRange ?? defaultProgressionSettings.doubleProgressionRepRange,
            doubleProgressionWeightIncrement: parsedSettings.doubleProgressionWeightIncrement === undefined || parsedSettings.doubleProgressionWeightIncrement === null ? "" : parsedSettings.doubleProgressionWeightIncrement,
            doubleProgressionCondition: parsedSettings.doubleProgressionCondition ?? defaultProgressionSettings.doubleProgressionCondition,
          };
          form.reset(valuesToReset);
        } else {
           form.reset(defaultProgressionSettings);
        }
      } catch (error) {
        console.error("Error loading progression settings:", error);
        form.reset(defaultProgressionSettings);
        toast({
          title: "Błąd ładowania",
          description: "Nie udało się załadować zapisanych ustawień progresji.",
          variant: "destructive",
        });
      }
      setPageIsLoading(false);
    }, 0); // Set to 0 for faster actual load
    return () => clearTimeout(timer);
  }, [form, toast]);

  // MOCK BACKEND LOGIC: Saves settings to localStorage, simulating a backend save.
  async function onSubmit(values: ProgressionSettingsFormValues) {
    setIsSaving(true);
    console.log("Progression settings submitted (simulated save):", values);

    const settingsToSave = {
        ...values,
        linearWeightIncrement: values.linearWeightIncrement === "" ? undefined : Number(values.linearWeightIncrement),
        linearRepsIncrement: values.linearRepsIncrement === "" ? undefined : Number(values.linearRepsIncrement),
        doubleProgressionWeightIncrement: values.doubleProgressionWeightIncrement === "" ? undefined : Number(values.doubleProgressionWeightIncrement),
    };

    try {
        localStorage.setItem(PROGRESSION_SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(settingsToSave));
        toast({
            title: "Ustawienia Zapisane!",
            description: "Twoje preferencje dotyczące progresji zostały zaktualizowane.",
        });
    } catch (error) {
        console.error("Error saving progression settings:", error);
        toast({
            title: "Błąd Zapisu",
            description: "Nie udało się zapisać ustawień progresji.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  }

  const watchEnableProgression = form.watch("enableProgression");
  const watchSelectedModel = form.watch("selectedModel");

  if (pageIsLoading) {
    // return <SettingsProgressionModelPageSkeleton />; // Removed for no-skeleton approach
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            <p className="mt-4 text-muted-foreground">Wczytywanie...</p>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-2xl">
         <div className="flex justify-end mb-4">
             <Button form="progression-settings-form" type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Zapisz Ustawienia
            </Button>
          </div>

          <Form {...form}>
            <form id="progression-settings-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary"/>Modelowanie Progresji Obciążenia</CardTitle>
                  <CardDescription>
                    Skonfiguruj, jak aplikacja ma sugerować zwiększanie obciążeń lub powtórzeń w Twoich treningach, aby zapewnić ciągły postęp.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="enableProgression"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Włącz automatyczne sugestie progresji</FormLabel>
                          <FormDescription>
                            Pozwól aplikacji podpowiadać, jak modyfikować treningi.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSaving}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {watchEnableProgression && (
                    <>
                      <FormField
                        control={form.control}
                        name="selectedModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                                Wybierz Model Progresji
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-5 w-5 p-0"><HelpCircle className="h-4 w-4 text-muted-foreground"/></Button></TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p className="font-semibold">Liniowa (Ciężar):</p><p className="text-xs">Zwiększaj ciężar, utrzymując liczbę powtórzeń.</p>
                                        <p className="font-semibold mt-1">Liniowa (Powtórzenia):</p><p className="text-xs">Zwiększaj liczbę powtórzeń z tym samym ciężarem.</p>
                                        <p className="font-semibold mt-1">Podwójna Progresja:</p><p className="text-xs">Najpierw zwiększaj powtórzenia w danym zakresie, a po osiągnięciu górnej granicy, zwiększ ciężar i wróć do dolnej granicy powtórzeń.</p>
                                        <p className="font-semibold mt-1">Brak (Manualna):</p><p className="text-xs">Samodzielnie decyduj o progresji.</p>
                                    </TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Wybierz model..." /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="linear_weight">Liniowa (Ciężar)</SelectItem>
                                <SelectItem value="linear_reps">Liniowa (Powtórzenia)</SelectItem>
                                <SelectItem value="double_progression">Podwójna Progresja</SelectItem>
                                <SelectItem value="none">Brak (Manualna)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchSelectedModel === "linear_weight" && (
                        <Card className="p-4 bg-muted/30">
                          <CardTitle className="text-md mb-2 flex items-center gap-1"><TrendingUp className="h-4 w-4"/>Progresja Liniowa (Ciężar)</CardTitle>
                          <FormField control={form.control} name="linearWeightIncrement" render={({ field }) => (<FormItem><FormLabel>Przyrost ciężaru (kg)</FormLabel><FormControl><Input type="number" step="0.25" placeholder="Np. 2.5" {...field} disabled={isSaving}/></FormControl><FormMessage /></FormItem>)}/>
                          <FormField control={form.control} name="linearWeightCondition" render={({ field }) => (<FormItem className="mt-2"><FormLabel>Warunek zwiększenia ciężaru (opis)</FormLabel><FormControl><Textarea placeholder="Np. Jeśli wykonano wszystkie serie i powtórzenia z zapasem" {...field} disabled={isSaving} rows={2}/></FormControl><FormMessage /></FormItem>)}/>
                        </Card>
                      )}
                      {watchSelectedModel === "linear_reps" && (
                        <Card className="p-4 bg-muted/30">
                          <CardTitle className="text-md mb-2 flex items-center gap-1"><Repeat className="h-4 w-4"/>Progresja Liniowa (Powtórzenia)</CardTitle>
                          <FormField control={form.control} name="linearRepsIncrement" render={({ field }) => (<FormItem><FormLabel>Przyrost liczby powtórzeń</FormLabel><FormControl><Input type="number" step="1" placeholder="Np. 1" {...field} disabled={isSaving}/></FormControl><FormMessage /></FormItem>)}/>
                          <FormField control={form.control} name="linearRepsCondition" render={({ field }) => (<FormItem className="mt-2"><FormLabel>Warunek zwiększenia powtórzeń (opis)</FormLabel><FormControl><Textarea placeholder="Np. Jeśli wykonano założony ciężar z łatwością" {...field} disabled={isSaving} rows={2}/></FormControl><FormMessage /></FormItem>)}/>
                        </Card>
                      )}
                      {watchSelectedModel === "double_progression" && (
                        <Card className="p-4 bg-muted/30">
                          <CardTitle className="text-md mb-2 flex items-center gap-1"><TrendingUp className="h-4 w-4"/><Repeat className="h-4 w-4 ml-[-0.5rem]"/>Podwójna Progresja</CardTitle>
                          <FormField control={form.control} name="doubleProgressionRepRange" render={({ field }) => (<FormItem><FormLabel>Docelowy zakres powtórzeń</FormLabel><FormControl><Input placeholder="Np. 8-12" {...field} disabled={isSaving}/></FormControl><FormMessage /></FormItem>)}/>
                          <FormField control={form.control} name="doubleProgressionWeightIncrement" render={({ field }) => (<FormItem className="mt-2"><FormLabel>Przyrost ciężaru po osiągnięciu zakresu (kg)</FormLabel><FormControl><Input type="number" step="0.25" placeholder="Np. 2.5" {...field} disabled={isSaving}/></FormControl><FormMessage /></FormItem>)}/>
                          <FormField control={form.control} name="doubleProgressionCondition" render={({ field }) => (<FormItem className="mt-2"><FormLabel>Warunek zwiększenia ciężaru (opis)</FormLabel><FormControl><Textarea placeholder="Np. Po osiągnięciu górnej granicy powtórzeń we wszystkich seriach" {...field} disabled={isSaving} rows={2}/></FormControl><FormMessage /></FormItem>)}/>
                        </Card>
                      )}
                      {watchSelectedModel === "none" && (
                        <Alert variant="default">
                            <Info className="h-4 w-4"/>
                            <AlertTitle>Progresja Manualna</AlertTitle>
                            <AlertDescription>
                                Wybrano brak automatycznych sugestii. Samodzielnie będziesz decydować o progresji obciążenia i powtórzeń podczas każdego treningu. Aplikacja nadal będzie śledzić Twoje wyniki.
                            </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
