
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ListChecks, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { SettingsQuickActionsPageSkeleton } from "@/components/settings/SettingsQuickActionsPageSkeleton"; // Removed for no-skeleton approach
import {
  PlayCircle, BookOpen, History as HistoryIcon, Award, Users, Scale, Camera, HeartPulse, GlassWater, BarChart3, Settings2, Settings as SettingsIcon, Timer as TimerIcon
} from 'lucide-react'; // Import used icons

// MOCK BACKEND LOGIC:
// - Visibility Preferences: Loaded from and saved to localStorage.
// - The actual effect of these settings (hiding/showing quick actions on the dashboard)
//   is handled by the dashboard page (`src/app/(app)/dashboard/page.tsx`) which reads these
//   preferences from localStorage.

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ElementType;
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


const QUICK_ACTIONS_VISIBILITY_KEY = "dashboardQuickActionItemVisibility"; // Same as in dashboard page

export default function QuickActionsSettingsPage() {
  const { toast } = useToast();
  const [visibilityPreferences, setVisibilityPreferences] = React.useState<Record<string, boolean>>({});
  const [pageIsLoading, setPageIsLoading] = React.useState(true);

  React.useEffect(() => {
    setPageIsLoading(true);
    const timer = setTimeout(() => {
      // MOCK BACKEND LOGIC: Load visibility preferences from localStorage.
      const initialPrefs: Record<string, boolean> = {};
      ALL_QUICK_ACTION_DEFINITIONS.forEach(item => {
        initialPrefs[item.id] = true; // Default to visible
      });

      const storedPrefs = localStorage.getItem(QUICK_ACTIONS_VISIBILITY_KEY);
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
    }, 0); // Set to 0 for faster actual load
    return () => clearTimeout(timer);
  }, []);

  // MOCK BACKEND LOGIC: Saves visibility preferences to localStorage.
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
    // return <SettingsQuickActionsPageSkeleton />; // Removed for no-skeleton approach
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            <p className="mt-4 text-muted-foreground">Wczytywanie...</p>
        </div>
      );
  }

  return (
    <>
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
