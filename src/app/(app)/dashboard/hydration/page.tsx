
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, GlassWater, PlusCircle, Edit3, Settings, Trash2, History, Info, Loader2, BotIcon, Droplet, CupSoda, PartyPopper } from "lucide-react"; // Added PartyPopper
import { v4 as uuidv4 } from "uuid";
import { format, isToday, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDescriptionComponent, // Renamed to avoid conflict if DialogDescription is also used from alert
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as AlertDialogDescriptionComponent, // Renamed
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, 
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddEditPortionDialog, type Portion } from "@/components/hydration/add-edit-portion-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Added AlertDescription
import { HydrationTrackingPageSkeleton } from "@/components/hydration/HydrationTrackingPageSkeleton"; // Import skeleton


const LOCAL_STORAGE_KEY = "workoutWiseHydrationData";
const DEFAULT_DAILY_GOAL_ML = 2500;
const DEFAULT_PORTIONS: Portion[] = [
    { id: "default-glass", name: "Szklanka", amount: 250 },
    { id: "default-bottle-small", name: "Mała Butelka", amount: 500 },
    { id: "default-bottle-large", name: "Duża Butelka", amount: 1000 },
];

interface WaterLogEntry {
  id: string;
  amount: number; // in milliliters
  timestamp: string; // ISO string
}

interface ReminderSettings {
    enabled: boolean;
    intervalMinutes: number; // e.g., 30, 60, 90, 120
    startTime: string; // HH:mm e.g., "08:00"
    endTime: string; // HH:mm e.g., "22:00"
    playSound: boolean;
}

interface HydrationData {
  dailyGoal: number;
  log: WaterLogEntry[];
  customPortions: Portion[];
  reminderSettings: ReminderSettings;
}

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
    enabled: false,
    intervalMinutes: 60,
    startTime: "08:00",
    endTime: "22:00",
    playSound: false,
};

export default function HydrationTrackingPage() {
  const { toast } = useToast();
  const [pageIsLoading, setPageIsLoading] = React.useState(true); // For skeleton
  const [hydrationData, setHydrationData] = React.useState<HydrationData>({
    dailyGoal: DEFAULT_DAILY_GOAL_ML,
    log: [],
    customPortions: [],
    reminderSettings: DEFAULT_REMINDER_SETTINGS,
  });
  const [customAmount, setCustomAmount] = React.useState("");
  const [isGoalDialogOpen, setIsGoalDialogOpen] = React.useState(false);
  const [newGoalInput, setNewGoalInput] = React.useState("");

  const [isPortionDialogOpen, setIsPortionDialogOpen] = React.useState(false);
  const [editingPortion, setEditingPortion] = React.useState<Portion | null>(null);
  const [portionToDelete, setPortionToDelete] = React.useState<Portion | null>(null);

  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission | "loading">("loading");

  React.useEffect(() => {
    setPageIsLoading(true);
    const timer = setTimeout(() => { // Simulate loading delay
      let loadedData: HydrationData = {
          dailyGoal: DEFAULT_DAILY_GOAL_ML,
          log: [],
          customPortions: [],
          reminderSettings: DEFAULT_REMINDER_SETTINGS,
      };
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          loadedData = {
              dailyGoal: parsed.dailyGoal || DEFAULT_DAILY_GOAL_ML,
              log: parsed.log || [],
              customPortions: parsed.customPortions || [],
              reminderSettings: { ...DEFAULT_REMINDER_SETTINGS, ...(parsed.reminderSettings || {}) },
          };
        }
      } catch (error) {
        console.error("Error loading hydration data from localStorage:", error);
        toast({
          title: "Błąd ładowania danych",
          description: "Nie udało się wczytać zapisanych danych nawodnienia.",
          variant: "destructive",
        });
      }
      setHydrationData(loadedData);
      setNewGoalInput(loadedData.dailyGoal.toString());
      setPageIsLoading(false);

      if (typeof window !== "undefined" && "Notification" in window) {
          setNotificationPermission(Notification.permission);
      } else {
          setNotificationPermission("denied");
      }
    }, 750); 
     return () => clearTimeout(timer);
  }, [toast]);

  React.useEffect(() => {
    if (!pageIsLoading) { 
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(hydrationData));
      } catch (error) {
        console.error("Error saving hydration data to localStorage:", error);
        toast({
          title: "Błąd zapisu danych",
          description: "Nie udało się zapisać danych nawodnienia.",
          variant: "destructive",
        });
      }
    }
  }, [hydrationData, pageIsLoading, toast]);

  const todaysIntake = React.useMemo(() => {
    return hydrationData.log
      .filter(entry => isToday(parseISO(entry.timestamp)))
      .reduce((sum, entry) => sum + entry.amount, 0);
  }, [hydrationData.log]);

  const progressPercent = hydrationData.dailyGoal > 0 ? (todaysIntake / hydrationData.dailyGoal) * 100 : 0;

  const handleAddWater = (amount: number) => {
    if (amount <= 0) {
      toast({ title: "Nieprawidłowa ilość", description: "Ilość wody musi być dodatnia.", variant: "destructive" });
      return;
    }
    const newEntry: WaterLogEntry = {
      id: uuidv4(),
      amount,
      timestamp: new Date().toISOString(),
    };
    setHydrationData(prev => ({
      ...prev,
      log: [...prev.log, newEntry],
    }));
    toast({ title: "Woda dodana!", description: `Dodano ${amount}ml wody.` });
    setCustomAmount(""); 
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const handleAddCustomWater = () => {
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      handleAddWater(amount);
    } else {
      toast({ title: "Nieprawidłowa ilość", description: "Wprowadź poprawną liczbę.", variant: "destructive" });
    }
  };
  
  const handleSetNewGoal = () => {
    const goal = parseInt(newGoalInput, 10);
    if (!isNaN(goal) && goal > 0 && goal <= 20000) { 
      setHydrationData(prev => ({ ...prev, dailyGoal: goal }));
      toast({ title: "Cel zaktualizowany", description: `Nowy dzienny cel to ${goal}ml.` });
      setIsGoalDialogOpen(false);
    } else {
      toast({ title: "Nieprawidłowy cel", description: "Wprowadź poprawną liczbę (1-20000).", variant: "destructive" });
    }
  };

  const handleResetTodaysIntake = () => {
     setHydrationData(prev => ({
      ...prev,
      log: prev.log.filter(entry => !isToday(parseISO(entry.timestamp))),
    }));
    toast({ title: "Dzisiejsze spożycie zresetowane", description: "Usunięto wszystkie dzisiejsze wpisy." });
  };
  
  const todaysLogEntries = React.useMemo(() => {
    return hydrationData.log
      .filter(entry => isToday(parseISO(entry.timestamp)))
      .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
  }, [hydrationData.log]);

  const handleSavePortion = (portion: Portion) => {
    setHydrationData(prev => {
        const existing = prev.customPortions.find(p => p.id === portion.id);
        if (existing) {
            return { ...prev, customPortions: prev.customPortions.map(p => p.id === portion.id ? portion : p) };
        }
        return { ...prev, customPortions: [...prev.customPortions, portion] };
    });
    setIsPortionDialogOpen(false);
    setEditingPortion(null);
  };

  const handleEditPortion = (portion: Portion) => {
    setEditingPortion(portion);
    setIsPortionDialogOpen(true);
  };

  const handleDeletePortion = () => {
    if (!portionToDelete) return;
    setHydrationData(prev => ({
        ...prev,
        customPortions: prev.customPortions.filter(p => p.id !== portionToDelete.id)
    }));
    setPortionToDelete(null);
    toast({ title: "Porcja usunięta" });
  };

  const handleReminderSettingChange = (key: keyof ReminderSettings, value: any) => {
    setHydrationData(prev => ({
        ...prev,
        reminderSettings: { ...prev.reminderSettings, [key]: value }
    }));
  };
  
  const handleSaveReminderSettings = () => {
    toast({ title: "Ustawienia przypomnień zapisane (symulacja)" });
    if (hydrationData.reminderSettings.enabled && notificationPermission !== 'granted') {
        handleRequestNotificationPermission();
    }
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === 'granted') {
        toast({ title: "Pozwolenie już udzielone", description: "Masz już włączone powiadomienia dla tej strony." });
        setNotificationPermission('granted');
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          toast({ title: "Pozwolenie udzielone!", description: "Powiadomienia systemowe zostały włączone." });
        } else {
          toast({ title: "Pozwolenie odrzucone", description: "Nie będziesz otrzymywać powiadomień. Możesz to zmienić w ustawieniach przeglądarki.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        toast({ title: "Błąd", description: "Nie udało się poprosić o pozwolenie na powiadomienia.", variant: "destructive" });
      }
    } else {
        toast({ title: "Powiadomienia nieobsługiwane", description: "Twoja przeglądarka nie wspiera powiadomień systemowych.", variant: "destructive" });
    }
  };

  const reminderIntervalOptions = [
    { label: "Co 30 minut", value: 30 },
    { label: "Co godzinę", value: 60 },
    { label: "Co 1.5 godziny", value: 90 },
    { label: "Co 2 godziny", value: 120 },
  ];

  const reminderTimeOptions = Array.from({length: 24}, (_, i) => {
    const hour = String(i).padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
  }).flat();


  if (pageIsLoading) {
    return <HydrationTrackingPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Dzisiejszy Postęp ({format(new Date(), "PPP", { locale: pl })})</span>
                <Button variant="ghost" size="icon" onClick={() => setIsGoalDialogOpen(true)}>
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Ustaw dzienny cel</span>
                </Button>
              </CardTitle>
              <CardDescription>Monitoruj swoje dzienne spożycie wody.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {todaysIntake.toLocaleString('pl-PL')}ml / {hydrationData.dailyGoal.toLocaleString('pl-PL')}ml
              </div>
              <Progress value={progressPercent} className="h-4 mb-4" />
              {todaysIntake >= hydrationData.dailyGoal && (
                <p className="text-green-600 font-semibold flex items-center justify-center gap-2">
                  <PartyPopper className="h-5 w-5 text-green-600" />
                  Gratulacje! Osiągnąłeś/aś dzienny cel!
                </p>
              )}
            </CardContent>
            <CardFooter>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full" disabled={todaysIntake === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> Resetuj dzisiejsze spożycie
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Zresetować dzisiejsze spożycie?</AlertDialogTitle>
                    <AlertDialogDescriptionComponent>
                      Czy na pewno chcesz usunąć wszystkie dzisiejsze wpisy dotyczące spożycia wody? Tej akcji nie można cofnąć.
                    </AlertDialogDescriptionComponent>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetTodaysIntake} className="bg-destructive hover:bg-destructive/90">
                      Potwierdź i zresetuj
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GlassWater className="h-6 w-6 text-primary"/>Szybkie Dodawanie</CardTitle>
              <CardDescription>Szybko dodaj predefiniowane lub własne ilości wody.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DEFAULT_PORTIONS.map(portion => {
                let IconComponent = CupSoda; 
                const lowerPortionName = portion.name.toLowerCase();
                if (lowerPortionName.includes("szklanka")) {
                  IconComponent = GlassWater;
                }
                return (
                    <Button key={portion.id} variant="outline" onClick={() => handleAddWater(portion.amount)} className="py-6 text-base flex flex-col h-auto items-center justify-center">
                    <IconComponent className="mb-1.5 h-5 w-5"/>
                    <span>{portion.name}</span>
                    <span className="text-xs text-muted-foreground">({portion.amount}ml)</span>
                    </Button>
                );
                })}
              {hydrationData.customPortions.map(portion => (
                <Button key={portion.id} variant="outline" onClick={() => handleAddWater(portion.amount)} className="py-6 text-base flex flex-col h-auto items-center justify-center">
                  <Droplet className="mb-1.5 h-5 w-5"/>
                  <span>{portion.name}</span>
                  <span className="text-xs text-muted-foreground">({portion.amount}ml)</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Edit3 className="h-6 w-6 text-primary"/>Dodaj Własną Ilość</CardTitle>
              <CardDescription>Wpisz dokładną ilość wypitej wody.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Input
                type="text" 
                placeholder="Ilość w ml"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="text-lg"
              />
              <Button onClick={handleAddCustomWater} className="py-3 px-6 text-lg">Dodaj</Button>
            </CardContent>
          </Card>
          
          {todaysLogEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="h-6 w-6 text-primary"/>Dzisiejsze Wpisy</CardTitle>
                <CardDescription>Lista dzisiejszych zarejestrowanych spożyć wody.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[200px] w-full">
                  <ul className="space-y-2">
                    {todaysLogEntries.map(entry => (
                      <li key={entry.id} className="text-sm flex justify-between items-center p-2 bg-muted/30 rounded-md">
                        <span>{format(parseISO(entry.timestamp), "HH:mm:ss", { locale: pl })}</span>
                        <span className="font-medium">{entry.amount}ml</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ustaw Dzienny Cel Nawodnienia</DialogTitle>
                <DialogDescriptionComponent>
                  Podaj swój docelowy dzienny limit spożycia wody w mililitrach.
                </DialogDescriptionComponent>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="daily-goal" className="text-right col-span-1">
                    Cel (ml)
                  </Label>
                  <Input
                    id="daily-goal"
                    type="number"
                    value={newGoalInput}
                    onChange={(e) => setNewGoalInput(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Anuluj</Button>
                </DialogClose>
                <Button type="button" onClick={handleSetNewGoal}>Zapisz Cel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AddEditPortionDialog
            isOpen={isPortionDialogOpen}
            onOpenChange={setIsPortionDialogOpen}
            onSave={handleSavePortion}
            initialData={editingPortion}
          />
          
          <AlertDialog open={!!portionToDelete} onOpenChange={(open) => !open && setPortionToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Usunąć własną porcję?</AlertDialogTitle>
                <AlertDialogDescriptionComponent>
                  Czy na pewno chcesz usunąć porcję "{portionToDelete?.name} ({portionToDelete?.amount}ml)"?
                </AlertDialogDescriptionComponent>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPortionToDelete(null)}>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePortion} className="bg-destructive hover:bg-destructive/90">
                  Potwierdź i usuń
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-6 w-6 text-primary"/>Moje Porcje Wody</CardTitle>
                <CardDescription>Zarządzaj swoimi predefiniowanymi porcjami wody do szybkiego dodawania.</CardDescription>
            </CardHeader>
            <CardContent>
                {hydrationData.customPortions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nie zdefiniowałeś jeszcze żadnych własnych porcji.</p>
                ) : (
                    <ul className="space-y-2">
                        {hydrationData.customPortions.map(portion => (
                            <li key={portion.id} className="flex justify-between items-center p-3 border rounded-md">
                                <div>
                                    <span className="font-medium">{portion.name}</span>
                                    <span className="text-sm text-muted-foreground"> - {portion.amount}ml</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditPortion(portion)} className="h-8 w-8">
                                        <Edit3 className="h-4 w-4"/>
                                    </Button>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => setPortionToDelete(portion)} className="h-8 w-8 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </AlertDialogTrigger>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={() => { setEditingPortion(null); setIsPortionDialogOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Dodaj Nową Porcję
                </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info className="h-6 w-6 text-primary"/>Przypomnienia o Piciu Wody</CardTitle>
                <CardDescription>Skonfiguruj przypomnienia, aby regularnie się nawadniać.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {notificationPermission === "loading" ? (
                    <p className="text-sm text-muted-foreground">Sprawdzanie uprawnień do powiadomień...</p>
                 ) : notificationPermission !== "granted" && (
                    <div className="space-y-2">
                        <Alert variant={notificationPermission === "denied" ? "destructive" : "default"}>
                            <Info className="h-4 w-4" />
                            <AlertTitle>
                                {notificationPermission === "denied" 
                                    ? "Pozwolenie na powiadomienia: Zablokowane"
                                    : "Pozwolenie na powiadomienia: Wymagane"
                                }
                            </AlertTitle>
                            <AlertDescription>
                                {notificationPermission === "denied"
                                    ? "Aby otrzymywać przypomnienia, musisz zezwolić na nie w ustawieniach swojej przeglądarki dla tej strony."
                                    : "Aby otrzymywać przypomnienia systemowe, musisz udzielić pozwolenia."
                                }
                            </AlertDescription>
                        </Alert>
                        <Button variant="outline" size="sm" onClick={handleRequestNotificationPermission} className="text-sm">
                            Poproś o pozwolenie (Symulacja)
                        </Button>
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    <Switch
                        id="enable-reminders"
                        checked={hydrationData.reminderSettings.enabled}
                        onCheckedChange={(checked) => handleReminderSettingChange("enabled", checked)}
                    />
                    <Label htmlFor="enable-reminders">Włącz przypomnienia o piciu wody</Label>
                </div>
                {hydrationData.reminderSettings.enabled && (
                    <div className="space-y-4 pl-6 border-l-2 border-primary/30 ml-2 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="reminder-interval">Przypominaj co</Label>
                                <Select
                                    value={String(hydrationData.reminderSettings.intervalMinutes)}
                                    onValueChange={(value) => handleReminderSettingChange("intervalMinutes", Number(value))}
                                >
                                    <SelectTrigger id="reminder-interval"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {reminderIntervalOptions.map(opt => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <Label htmlFor="reminder-start-time">Aktywne od</Label>
                                <Select
                                    value={hydrationData.reminderSettings.startTime}
                                    onValueChange={(value) => handleReminderSettingChange("startTime", value)}
                                >
                                    <SelectTrigger id="reminder-start-time"><SelectValue /></SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {reminderTimeOptions.map(time => (
                                            <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="reminder-end-time">Aktywne do</Label>
                                <Select
                                    value={hydrationData.reminderSettings.endTime}
                                    onValueChange={(value) => handleReminderSettingChange("endTime", value)}
                                >
                                    <SelectTrigger id="reminder-end-time"><SelectValue /></SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {reminderTimeOptions.map(time => (
                                            <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="reminder-sound"
                                checked={hydrationData.reminderSettings.playSound}
                                onCheckedChange={(checked) => handleReminderSettingChange("playSound", checked)}
                            />
                            <Label htmlFor="reminder-sound">Włącz dźwięk powiadomienia (Symulacja)</Label>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveReminderSettings}>Zapisz Ustawienia Przypomnień</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
