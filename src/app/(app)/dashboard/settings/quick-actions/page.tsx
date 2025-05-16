
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ListChecks, Loader2 } from "lucide-react"; // Added Loader2
import { useToast } from "@/hooks/use-toast";
import { SettingsQuickActionsPageSkeleton } from "@/components/settings/SettingsQuickActionsPageSkeleton"; // Import skeleton

// This should ideally be imported from a shared constants file
// For now, duplicate its structure if not ALL_NAV_ITEMS itself
interface NavItem {
  id: string; // Unique ID for localStorage key
  href: string;
  label: string;
  icon: React.ElementType; // For display consistency
  description: string;
}

const ALL_QUICK_ACTION_DEFINITIONS: NavItem[] = [
  { id: 'workout-start', href: '/dashboard/workout/start', label: 'Rozpocznij trening', icon: PlayCircle, description: 'Rozpocznij nową sesję lub kontynuuj.' },
  { id: 'plans', href: '/dashboard/plans', label: 'Plany treningowe', icon: BookOpen, description: 'Przeglądaj i zarządzaj planami.' },
  { id: 'history', href: '/dashboard/history', label: 'Historia', icon: HistoryIcon, description: 'Śledź ukończone treningi.' },
  { id: 'personal-bests', href: '/dashboard/personal-bests', label: 'Rekordy Życiowe', icon: Award, description: 'Zobacz swoje najlepsze wyniki.' },
  { id: 'community', href: '/dashboard/community', label: 'Społeczność', icon: Users, description: 'Połącz się z innymi.' },
  { id: 'measurements', href: '/dashboard/measurements', label: 'Pomiary Ciała', icon: Scale, description: 'Rejestruj wagę i obwody.' },
  { id: 'progress-photos', href: '/dashboard/progress-photos', label: 'Zdjęcia Postępu', icon: Camera, description: 'Dokumentuj zmiany wizualne.' },
  { id: 'wellness-journal', href: '/dashboard/wellness-journal', label: 'Dziennik Samopoczucia', icon: HeartPulse, description: 'Monitoruj swoje samopoczucie.' },
  { id: 'hydration', href: '/dashboard/hydration', label: 'Śledzenie Nawodnienia', icon: GlassWater, description: 'Monitoruj spożycie wody.' },
  { id: 'statistics', href: '/dashboard/statistics', label: 'Statystyki', icon: BarChart3, description: 'Analizuj swoje postępy.'},
  { id: 'my-account', href: '/dashboard/account', label: 'Moje Konto', icon: Settings2, description: 'Zarządzaj ustawieniami konta.' },
  { id: 'app-settings', href: '/dashboard/settings', label: 'Ustawienia Aplikacji', icon: SettingsIcon, description: 'Dostosuj preferencje aplikacji.' },
  { id: 'rest-timer', href: '/dashboard/tools/rest-timer', label: 'Timer Odpoczynku', icon: TimerIcon, description: 'Niezależny stoper odpoczynku.' },
];
// Re-import icons if they are not globally available or directly use lucide-react here
import {
  PlayCircle, BookOpen, History as HistoryIcon, Award, Users, Scale, Camera, HeartPulse, GlassWater, BarChart3, Settings2, Settings as SettingsIcon, Timer as TimerIcon
} from 'lucide-react';

const QUICK_ACTIONS_VISIBILITY_KEY = "dashboardQuickActionItemVisibility";

export default function QuickActionsSettingsPage() {
  const { toast } = useToast();
  const [visibilityPreferences, setVisibilityPreferences] = React.useState<Record<string, boolean>>({});
  const [pageIsLoading, setPageIsLoading] = React.useState(true); // Renamed isLoading to pageIsLoading

  React.useEffect(() => {
    setPageIsLoading(true);
    const timer = setTimeout(() => { // Simulate loading delay
      const storedPrefs = localStorage.getItem(QUICK_ACTIONS_VISIBILITY_KEY);
      const initialPrefs: Record<string, boolean> = {};
      ALL_QUICK_ACTION_DEFINITIONS.forEach(item => {
        initialPrefs[item.id] = true; 
      });

      if (storedPrefs) {
        try {
          const parsedPrefs = JSON.parse(storedPrefs);
          for (const key in initialPrefs) {
              if (parsedPrefs.hasOwnProperty(key)) {
                  initialPrefs[key] = parsedPrefs[key];
              }
          }
        } catch (e) {
          console.error("Error parsing quick actions visibility from localStorage", e);
        }
      }
      setVisibilityPreferences(initialPrefs);
      setPageIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleVisibilityChange = (itemId: string, isVisible: boolean) => {
    const newPrefs = { ...visibilityPreferences, [itemId]: isVisible };
    setVisibilityPreferences(newPrefs);
    try {
      localStorage.setItem(QUICK_ACTIONS_VISIBILITY_KEY, JSON.stringify(newPrefs));
      toast({
        title: "Ustawienie zapisane",
        description: `Widoczność dla "${ALL_QUICK_ACTION_DEFINITIONS.find(item => item.id === itemId)?.label}" została zaktualizowana.`,
      });
    } catch (error) {
      console.error("Error saving quick actions visibility to localStorage", error);
      toast({
        title: "Błąd zapisu",
        description: "Nie udało się zapisać ustawień.",
        variant: "destructive",
      });
    }
  };
  
  const iconMap: Record<string, React.ElementType> = {
    'workout-start': PlayCircle,
    'plans': BookOpen,
    'history': HistoryIcon,
    'personal-bests': Award,
    'community': Users,
    'measurements': Scale,
    'progress-photos': Camera,
    'wellness-journal': HeartPulse,
    'hydration': GlassWater,
    'statistics': BarChart3,
    'my-account': Settings2,
    'app-settings': SettingsIcon,
    'rest-timer': TimerIcon
  };


  if (pageIsLoading) {
    return <SettingsQuickActionsPageSkeleton />;
  }

  return (
    <>
      {/* <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/settings">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Ustawień</span>
              </Link>
            </Button>
            <ListChecks className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Dostosuj Szybkie Akcje</h1>
          </div>
        </div>
      </header> */}

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Wybierz widoczne Szybkie Akcje</CardTitle>
              <CardDescription>
                Zaznacz elementy, które chcesz widzieć w sekcji "Szybkie Akcje" na Twoim Pulpicie. Zmiany są zapisywane automatycznie.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ALL_QUICK_ACTION_DEFINITIONS.map((item) => {
                const IconComponent = iconMap[item.id] || ListChecks; 
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3 shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                       <IconComponent className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor={`switch-${item.id}`} className="text-sm font-medium cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                    <Switch
                      id={`switch-${item.id}`}
                      checked={visibilityPreferences[item.id] !== undefined ? visibilityPreferences[item.id] : true} 
                      onCheckedChange={(checked) => handleVisibilityChange(item.id, checked)}
                    />
                  </div>
                );
              })}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Zmiany są widoczne na Pulpicie po odświeżeniu strony lub przy następnej wizycie.</p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
