
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, GlassWater, PlusCircle, Edit3, Settings, Trash2, History, Info, Loader2 } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const LOCAL_STORAGE_KEY = "workoutWiseHydrationData";
const DEFAULT_DAILY_GOAL_ML = 2500;

interface WaterLogEntry {
  id: string;
  amount: number; // in milliliters
  timestamp: string; // ISO string
}

interface HydrationData {
  dailyGoal: number;
  log: WaterLogEntry[];
}

export default function HydrationPage() {
  const { toast } = useToast();
  const [hydrationData, setHydrationData] = React.useState<HydrationData>({
    dailyGoal: DEFAULT_DAILY_GOAL_ML,
    log: [],
  });
  const [customAmount, setCustomAmount] = React.useState("");
  const [isGoalDialogOpen, setIsGoalDialogOpen] = React.useState(false);
  const [newGoalInput, setNewGoalInput] = React.useState(hydrationData.dailyGoal.toString());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData: HydrationData = JSON.parse(storedData);
        setHydrationData(parsedData);
        setNewGoalInput(parsedData.dailyGoal.toString());
      } else {
        // Initialize with default if no data found
        setHydrationData({ dailyGoal: DEFAULT_DAILY_GOAL_ML, log: [] });
        setNewGoalInput(DEFAULT_DAILY_GOAL_ML.toString());
      }
    } catch (error) {
      console.error("Error loading hydration data from localStorage:", error);
      toast({
        title: "Błąd ładowania danych",
        description: "Nie udało się wczytać zapisanych danych nawodnienia.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (!isLoading) { // Only save if not in initial loading phase
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
  }, [hydrationData, isLoading, toast]);

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
    setCustomAmount(""); // Clear custom input after adding
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
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
    if (!isNaN(goal) && goal > 0 && goal <= 20000) { // Max 20L as a sanity check
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
      .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()); // Newest first
  }, [hydrationData.log]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Ładowanie danych nawodnienia...</p>
      </div>
    );
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
            <GlassWater className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Śledzenie Nawodnienia</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-2xl space-y-8">
          {/* Daily Progress Card */}
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
                <p className="text-green-600 font-semibold">Gratulacje! Osiągnąłeś/aś dzienny cel!</p>
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
                    <AlertDialogDescription>
                      Czy na pewno chcesz usunąć wszystkie dzisiejsze wpisy dotyczące spożycia wody? Tej akcji nie można cofnąć.
                    </AlertDialogDescription>
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

          {/* Quick Add Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PlusCircle className="h-6 w-6 text-primary"/>Szybkie Dodawanie</CardTitle>
              <CardDescription>Szybko dodaj predefiniowane ilości wody.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[100, 250, 330, 500, 750, 1000].map(amount => (
                <Button key={amount} variant="outline" onClick={() => handleAddWater(amount)} className="py-6 text-lg">
                  + {amount}ml
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Custom Add Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Edit3 className="h-6 w-6 text-primary"/>Dodaj Własną Ilość</CardTitle>
              <CardDescription>Wpisz dokładną ilość wypitej wody.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Input
                type="text" // Use text to allow custom validation for numbers only
                placeholder="Ilość w ml"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="text-lg"
              />
              <Button onClick={handleAddCustomWater} className="py-3 px-6 text-lg">Dodaj</Button>
            </CardContent>
          </Card>
          
          {/* Today's Log Card */}
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

          {/* Set Daily Goal Dialog */}
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ustaw Dzienny Cel Nawodnienia</DialogTitle>
                <DialogDescription>
                  Podaj swój docelowy dzienny limit spożycia wody w mililitrach.
                </DialogDescription>
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

        </div>
      </main>
    </div>
  );
}
