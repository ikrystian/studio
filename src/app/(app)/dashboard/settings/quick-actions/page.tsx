
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, ListChecks, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SettingsQuickActionsPageSkeleton } from "@/components/settings/SettingsQuickActionsPageSkeleton";

// This interface defines the structure for each quick action item.
// It should ideally match the structure used on the dashboard page (ALL_NAV_ITEMS).
interface NavItem {
  id: string; // Unique ID for identification and localStorage key
  href: string; // Navigation path
  label: string; // Display label for the action
  icon: React.ElementType; // Icon component
  description: string; // Brief description of the action
}

// ALL_QUICK_ACTION_DEFINITIONS: Defines all possible quick actions available for customization.
// This list should be consistent with what's used on the dashboard.
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
// Re-import icons for use in this component
import {
  PlayCircle, BookOpen, History as HistoryIcon, Award, Users, Scale, Camera, HeartPulse, GlassWater, BarChart3, Settings2, Settings as SettingsIcon, Timer as TimerIcon
} from 'lucide-react';

// Key for storing quick action visibility preferences in localStorage.
const QUICK_ACTIONS_VISIBILITY_KEY = "dashboardQuickActionItemVisibility";

export default function QuickActionsSettingsPage() {
  const { toast } = useToast();
  // State to hold the visibility preferences for each quick action item (itemId -> boolean).
  const [visibilityPreferences, setVisibilityPreferences] = React.useState<Record<string, boolean>>({});
  const [pageIsLoading, setPageIsLoading] = React.useState(true);

  // Effect to load visibility preferences from localStorage on component mount.
  React.useEffect(() => {
    setPageIsLoading(true);
    const timer = setTimeout(() => { // Simulate loading delay
      // Initialize preferences: by default, all actions are visible.
      const initialPrefs: Record<string, boolean> = {};
      ALL_QUICK_ACTION_DEFINITIONS.forEach(item => {
        initialPrefs[item.id] = true; // Default to visible
      });

      // Load saved preferences from localStorage, if any.
      const storedPrefs = localStorage.getItem(QUICK_ACTIONS_VISIBILITY_KEY);
      if (storedPrefs) {
        try {
          const parsedPrefs = JSON.parse(storedPrefs);
          // Merge stored preferences with defaults, ensuring all items have a value.
          for (const key in initialPrefs) {
              if (parsedPrefs.hasOwnProperty(key)) {
                  initialPrefs[key] = parsedPrefs[key];
              }
          }
        } catch (e) {
          console.error("Error parsing quick actions visibility from localStorage", e);
          // If parsing fails, stick with defaults.
        }
      }
      setVisibilityPreferences(initialPrefs);
      setPageIsLoading(false);
    }, 500); // Simulate 500ms loading delay
    return () => clearTimeout(timer);
  }, []);

  // Handles changing the visibility of a quick action item and saves to localStorage.
  const handleVisibilityChange = (itemId: string, isVisible: boolean) => {
    const newPrefs = { ...visibilityPreferences, [itemId]: isVisible };
    setVisibilityPreferences(newPrefs);
    // Simulate saving preferences to a backend or localStorage.
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
  
  // Map item IDs to their corresponding icon components for easy rendering.
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
                const IconComponent = iconMap[item.id] || ListChecks; // Fallback icon
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
                      checked={visibilityPreferences[item.id] !== undefined ? visibilityPreferences[item.id] : true} // Default to true if not set
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
