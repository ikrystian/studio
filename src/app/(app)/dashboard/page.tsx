
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Camera,
  ChevronRight,
  Dumbbell,
  Edit,
  Eye,
  EyeOff,
  Flame,
  GlassWater,
  HeartPulse,
  History,
  ListChecks,
  Maximize2,
  MoveDown,
  MoveUp,
  PlayCircle,
  RotateCcw,
  Save,
  Scale,
  Settings,
  Settings2,
  Timer,
  User as UserIcon,
  Users,
  XCircle,
  MessageSquare,
  Lightbulb, 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";

// MOCK DATA for widgets - In a real app, this would come from a backend API or context.
const MOCK_LAST_WORKOUT = {
  name: 'Full Body Strength - Wtorek',
  date: '2024-07-30',
  duration: '55 min',
  calories: '410 kcal',
  exercises: 6,
  link: '/dashboard/history/hist1', 
};

const MOCK_PROGRESS_STATS = {
  weightTrend: 'stable', // 'up', 'down', 'stable'
  currentWeight: '70kg',
  workoutsThisWeek: 3,
  weeklyGoal: 4, 
};

const MOCK_UPCOMING_REMINDERS = [
  { id: 1, title: 'Zaplanowany Trening: Nogi', time: 'Jutro, 18:00', link: '/dashboard/plans/plan1' },
  { id: 2, title: 'Sprawdź Tygodniowe Postępy', time: 'Niedziela, 20:00', link: '/dashboard/statistics' },
  { id: 3, title: 'Uzupełnij Dziennik Samopoczucia', time: 'Codziennie, 21:00', link: '/dashboard/wellness-journal'},
  { id: 4, title: 'Zaplanowany trening: Cardio Boost', time: 'Za 2 dni, 08:00', link: '/dashboard/plans/plan2'},
  { id: 5, title: 'Pamiętaj o pomiarach!', time: 'Piątek, 09:00', link: '/dashboard/measurements'},
];

const MOCK_FITNESS_TIPS = [
  "Pamiętaj o prawidłowej technice – to klucz do unikania kontuzji i maksymalizacji efektów!",
  "Nawodnienie jest kluczowe! Pij wodę regularnie przez cały dzień, nie tylko podczas treningu.",
  "Nie zapominaj o rozgrzewce przed każdym treningiem i rozciąganiu po nim.",
  "Progresywne przeciążenie to podstawa budowania siły i masy mięśniowej.",
  "Odpoczynek i regeneracja są równie ważne jak sam trening. Daj swojemu ciału czas na odbudowę.",
  "Słuchaj swojego ciała. Jeśli czujesz ból (inny niż typowe zmęczenie mięśni), daj sobie odpocząć.",
  "Zbilansowana dieta to 70% sukcesu. Dbaj o to, co jesz!",
  "Małe kroki prowadzą do wielkich zmian. Bądź konsekwentny!",
  "Każdy trening się liczy, nawet ten krótki. Ważne, że działasz!",
  "Nie porównuj swojego rozdziału 1 do czyjegoś rozdziału 20. Skup się na własnej drodze."
];

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

// All available navigation items for the dashboard quick actions.
// In a real app, these might be filtered based on user role or preferences.
const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'workout-start', href: '/dashboard/workout/start', label: 'Rozpocznij trening', icon: PlayCircle, description: 'Rozpocznij nową sesję lub kontynuuj istniejącą.' },
  { id: 'plans', href: '/dashboard/plans', label: 'Plany treningowe', icon: BookOpen, description: 'Przeglądaj, twórz i zarządzaj swoimi planami treningowymi.' },
  { id: 'history', href: '/dashboard/history', label: 'Historia treningów', icon: History, description: 'Śledź i analizuj swoje ukończone treningi.' },
  { id: 'personal-bests', href: '/dashboard/personal-bests', label: 'Rekordy Życiowe', icon: Award, description: 'Zobacz i zarządzaj swoimi najlepszymi wynikami w ćwiczeniach.' },
  { id: 'community', href: '/dashboard/community', label: 'Społeczność', icon: Users, description: 'Połącz się z innymi, dziel się postępami i motywujcie się nawzajem.' },
  { id: 'measurements', href: '/dashboard/measurements', label: 'Pomiary Ciała', icon: Scale, description: 'Rejestruj wagę, obwody i śledź zmiany w czasie.' },
  { id: 'progress-photos', href: '/dashboard/progress-photos', label: 'Zdjęcia Postępu', icon: Camera, description: 'Dokumentuj wizualne zmiany swojej sylwetki.' },
  { id: 'wellness-journal', href: '/dashboard/wellness-journal', label: 'Dziennik Samopoczucia', icon: MessageSquare, description: 'Monitoruj swoje samopoczucie, energię i jakość snu.' },
  { id: 'hydration', href: '/dashboard/hydration', label: 'Śledzenie Nawodnienia', icon: GlassWater, description: 'Monitoruj swoje dzienne spożycie wody i dąż do celu.' },
  { id: 'statistics', href: '/dashboard/statistics', label: 'Statystyki i Analiza', icon: BarChart3, description: 'Analizuj swoje postępy za pomocą szczegółowych wykresów.'},
  { id: 'tools-rest-timer', href: '/dashboard/tools/rest-timer', label: 'Timer Odpoczynku', icon: Timer, description: 'Niezależny stoper do mierzenia czasu odpoczynku.' },
  { id: 'my-account', href: '/dashboard/account', label: 'Moje Konto', icon: Settings2, description: 'Zarządzaj ustawieniami swojego konta i danymi osobowymi.' },
  { id: 'app-settings', href: '/dashboard/settings', label: 'Ustawienia Aplikacji', icon: Settings, description: 'Dostosuj preferencje aplikacji i powiadomienia.' },
];


const SingleQuickActionCard: React.FC<{ item: NavItem }> = ({ item }) => {
  const IconComponent = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "block rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dashboard-quick-action-card",
        `dashboard-quick-action-${item.id}`
      )}
    >
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center text-lg font-semibold pb-2">
          <IconComponent className="mr-2 h-5 w-5 text-primary" />
          {item.label}
        </div>
        <div className="pb-4 flex-grow min-h-[60px]">
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
      </div>
    </Link>
  );
};

const SingleQuickActionCardSkeleton: React.FC = () => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col h-full">
    <div className="flex items-center text-lg font-semibold pb-2">
      <Skeleton className="mr-2 h-5 w-5 rounded-full" />
      <Skeleton className="h-6 w-3/4" />
    </div>
    <div className="pb-4 flex-grow min-h-[60px]">
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);


const LastWorkoutWidget: React.FC = () => (
  <Link
    href={MOCK_LAST_WORKOUT.link}
    className={cn(
      "block rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dashboard-widget-last-workout"
    )}
  >
    <div className="p-6 flex flex-col h-full">
      <div className="pb-2"> 
        <h3 className="flex items-center text-lg font-semibold">
          <Activity className="mr-2 h-5 w-5 text-primary" /> Ostatni trening
        </h3>
        <p className="text-sm text-muted-foreground">{new Date(MOCK_LAST_WORKOUT.date).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="space-y-3 flex-grow"> 
        <h4 className="font-semibold">{MOCK_LAST_WORKOUT.name}</h4>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span><CalendarDays className="mr-1 inline-block h-4 w-4" />{MOCK_LAST_WORKOUT.duration}</span>
          <span><Flame className="mr-1 inline-block h-4 w-4" />{MOCK_LAST_WORKOUT.calories}</span>
          <span><Dumbbell className="mr-1 inline-block h-4 w-4" />{MOCK_LAST_WORKOUT.exercises} ćwiczeń</span>
        </div>
      </div>
      <div className="pt-4 flex items-center text-sm text-primary">
        Zobacz szczegóły
        <ChevronRight className="ml-auto h-4 w-4" />
      </div>
    </div>
  </Link>
);

const LastWorkoutWidgetSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/2 mb-1" />
      <Skeleton className="h-4 w-1/3" />
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-5 w-1/3 ml-auto" />
    </CardFooter>
  </Card>
);

const ProgressStatsWidget: React.FC = () => (
  <Link
    href="/dashboard/statistics"
    className={cn(
      "block rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dashboard-widget-progress-stats"
    )}
  >
    <div className="p-6 flex flex-col h-full">
      <div className="pb-2">
        <h3 className="flex items-center text-lg font-semibold">
          <BarChart3 className="mr-2 h-5 w-5 text-primary" /> Statystyki postępu
        </h3>
        <p className="text-sm text-muted-foreground">Twój postęp w tym tygodniu.</p>
      </div>
      <div className="space-y-4 flex-grow">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Waga</span>
            <span className="font-medium">{MOCK_PROGRESS_STATS.currentWeight} ({MOCK_PROGRESS_STATS.weightTrend})</span>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Treningi w tym tygodniu</span>
            <span className="font-medium">{MOCK_PROGRESS_STATS.workoutsThisWeek} / {MOCK_PROGRESS_STATS.weeklyGoal}</span>
          </div>
          <Progress value={(MOCK_PROGRESS_STATS.workoutsThisWeek / MOCK_PROGRESS_STATS.weeklyGoal) * 100} className="h-2" />
        </div>
      </div>
      <div className="pt-4 flex items-center text-sm text-primary">
        Pełne statystyki
        <ChevronRight className="ml-auto h-4 w-4" />
      </div>
    </div>
  </Link>
);

const ProgressStatsWidgetSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
       <Skeleton className="h-6 w-3/4 mb-1" />
       <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <div className="mb-1 flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div>
        <div className="mb-1 flex justify-between">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-5 w-1/3 ml-auto" />
    </CardFooter>
  </Card>
);

const UpcomingRemindersWidget: React.FC = () => (
  <Card className="dashboard-widget-upcoming-reminders">
    <CardHeader>
      <CardTitle className="flex items-center text-lg">
        <CalendarDays className="mr-2 h-5 w-5 text-primary" /> Nadchodzące przypomnienia
      </CardTitle>
    </CardHeader>
    <CardContent>
      {MOCK_UPCOMING_REMINDERS.length > 0 ? (
        <ul className="space-y-3">
          {MOCK_UPCOMING_REMINDERS.map((reminder, index) => (
            <li key={reminder.id} className="text-sm">
              <Link href={reminder.link} className="hover:text-primary transition-colors">
                <p className="font-medium">{reminder.title}</p>
                <p className="text-xs text-muted-foreground">{reminder.time}</p>
              </Link>
              {index < MOCK_UPCOMING_REMINDERS.length - 1 && <Separator className="mt-3" />}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Brak nadchodzących przypomnień.</p>
      )}
    </CardContent>
    <CardFooter>
        <Button variant="outline" size="sm" asChild className="w-full">
        <Link href="/dashboard/settings/reminders">Zarządzaj Przypomnieniami</Link>
      </Button>
    </CardFooter>
  </Card>
);
const UpcomingRemindersWidgetSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/5" />
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <li key={i} className="space-y-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            {i < 1 && <Skeleton className="h-px w-full mt-3" />}
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-9 w-full" />
    </CardFooter>
  </Card>
);

const FitnessTipWidget: React.FC = () => {
  const [tip, setTip] = React.useState("");

  React.useEffect(() => {
    // Simulates fetching a random tip, in a real app this might be from an API or a larger local list.
    setTip(MOCK_FITNESS_TIPS[Math.floor(Math.random() * MOCK_FITNESS_TIPS.length)]);
  }, []);

  return (
    <Card className="dashboard-widget-fitness-tip">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" /> Porada Dnia
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tip ? (
          <p className="text-sm text-muted-foreground italic">"{tip}"</p>
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardContent>
    </Card>
  );
};

const FitnessTipWidgetSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
  </Card>
);

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  component: React.ReactNode;
  skeletonComponent: React.ReactNode;
  area: 'main' | 'sidebar';
  defaultOrder: number;
  defaultVisible: boolean;
  currentOrder?: number; // Current order for user customization
  isVisible?: boolean;   // Current visibility for user customization
}

// Generates widget configurations for each quick action item.
const generateQuickActionWidgets = (): DashboardWidgetConfig[] => {
  return ALL_NAV_ITEMS.map((item, index) => ({
    id: item.id,
    title: item.label,
    component: <SingleQuickActionCard item={item} />,
    skeletonComponent: <SingleQuickActionCardSkeleton />,
    area: 'main', 
    defaultOrder: index + 1, // Base order
    defaultVisible: true,
  }));
};

// Initial layout definition. This defines the default state of the dashboard.
const INITIAL_DASHBOARD_LAYOUT: DashboardWidgetConfig[] = [
  ...generateQuickActionWidgets(),
  // Sidebar widgets, their order and visibility can also be customized.
  { id: 'last-workout', title: 'Ostatni Trening', component: <LastWorkoutWidget />, skeletonComponent: <LastWorkoutWidgetSkeleton />, area: 'sidebar', defaultOrder: 1, defaultVisible: true },
  { id: 'progress-stats', title: 'Statystyki Postępu', component: <ProgressStatsWidget />, skeletonComponent: <ProgressStatsWidgetSkeleton />, area: 'sidebar', defaultOrder: 2, defaultVisible: true },
  { id: 'upcoming-reminders', title: 'Nadchodzące Przypomnienia', component: <UpcomingRemindersWidget />, skeletonComponent: <UpcomingRemindersWidgetSkeleton />, area: 'sidebar', defaultOrder: 3, defaultVisible: true },
  { id: 'fitness-tip', title: 'Porada Dnia', component: <FitnessTipWidget />, skeletonComponent: <FitnessTipWidgetSkeleton />, area: 'sidebar', defaultOrder: 4, defaultVisible: true },
];

// Key for storing user's customized dashboard layout in localStorage.
const DASHBOARD_LAYOUT_STORAGE_KEY = "dashboardLayoutConfigV3"; // Versioning helps manage layout changes.

export default function DashboardPage() {
  const { toast } = useToast();
  const [userName, setUserName] = React.useState('Użytkowniku');
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [pageIsLoading, setPageIsLoading] = React.useState(true);

  const [dashboardWidgets, setDashboardWidgets] = React.useState<DashboardWidgetConfig[]>([]);
  // Store a copy of the layout before entering edit mode to allow cancellation.
  const [widgetsBeforeEdit, setWidgetsBeforeEdit] = React.useState<DashboardWidgetConfig[]>([]);

  React.useEffect(() => {
    // Load user's name from localStorage to personalize the welcome message.
    // This simulates fetching user data that might be stored after login.
    if (typeof window !== 'undefined') {
        const storedProfileData = localStorage.getItem('currentUserProfileData');
        if (storedProfileData) {
            try {
                const profile = JSON.parse(storedProfileData);
                setUserName(profile.fullName || 'Użytkowniku');
            } catch (e) {
                console.error("Error parsing profile data from localStorage for dashboard:", e);
            }
        }
    }

    // Load dashboard layout:
    // 1. Start with the INITIAL_DASHBOARD_LAYOUT as a base.
    // 2. If a saved layout exists in localStorage, merge it with the base.
    //    This ensures new widgets are added and old settings are respected.
    let loadedLayout: DashboardWidgetConfig[] = [];
    try {
      const savedLayoutJson = typeof window !== 'undefined' ? localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY) : null;
      // Ensure every widget from INITIAL_DASHBOARD_LAYOUT has isVisible and currentOrder set from defaults.
      const baseLayout = INITIAL_DASHBOARD_LAYOUT.map(w => ({
        ...w,
        isVisible: w.defaultVisible,
        currentOrder: w.defaultOrder,
      }));

      if (savedLayoutJson) {
        // Parse saved settings (only id, isVisible, currentOrder, area are saved).
        const parsedSavedWidgets = JSON.parse(savedLayoutJson) as Pick<DashboardWidgetConfig, 'id' | 'isVisible' | 'currentOrder' | 'area'>[];
        
        // Map over the base layout, applying saved settings if found.
        loadedLayout = baseLayout.map(defaultWidget => {
          const savedWidgetSettings = parsedSavedWidgets.find(w => w.id === defaultWidget.id);
          return {
            ...defaultWidget,
            // Use saved visibility if present, otherwise default.
            isVisible: savedWidgetSettings?.isVisible !== undefined ? savedWidgetSettings.isVisible : defaultWidget.defaultVisible,
            // Use saved order if present, otherwise default.
            currentOrder: savedWidgetSettings?.currentOrder !== undefined ? savedWidgetSettings.currentOrder : defaultWidget.defaultOrder,
            // Use saved area if present, otherwise default.
            area: savedWidgetSettings?.area !== undefined ? savedWidgetSettings.area : defaultWidget.area,
          };
        });
        
        // Add any new widgets from INITIAL_DASHBOARD_LAYOUT that weren't in the saved layout.
        const loadedIds = new Set(loadedLayout.map(w => w.id));
        baseLayout.forEach(initialWidget => {
          if (!loadedIds.has(initialWidget.id)) {
            loadedLayout.push({ ...initialWidget, isVisible: initialWidget.defaultVisible, currentOrder: initialWidget.defaultOrder });
          }
        });

      } else {
        // No saved layout, use the base layout with default visibility and order.
        loadedLayout = baseLayout;
      }
    } catch (error) {
      console.error("Error loading dashboard layout from localStorage:", error);
      // Fallback to initial layout if parsing fails.
      loadedLayout = INITIAL_DASHBOARD_LAYOUT.map(w => ({
        ...w,
        isVisible: w.defaultVisible,
        currentOrder: w.defaultOrder,
      }));
    }
    setDashboardWidgets(loadedLayout.sort((a,b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0)));
    setTimeout(() => setPageIsLoading(false), 750); // Simulate loading time
  }, []);

  const handleEnterEditMode = () => {
    // Save the current state of widgets before entering edit mode.
    setWidgetsBeforeEdit(JSON.parse(JSON.stringify(dashboardWidgets))); 
    setIsEditMode(true);
  };
  
  // Toggles the visibility of a specific widget.
  const handleToggleWidgetVisibility = (widgetId: string) => {
    setDashboardWidgets(prevWidgets =>
      prevWidgets.map(widget =>
        widget.id === widgetId ? { ...widget, isVisible: !widget.isVisible } : widget
      )
    );
  };

  // Moves a widget up or down within its area ('main' or 'sidebar').
  const handleMoveWidget = (widgetId: string, direction: 'up' | 'down') => {
    setDashboardWidgets(prevWidgets => {
      const newWidgets = prevWidgets.map(w => ({...w})); // Create a new array of new objects for immutability
      const widgetIndex = newWidgets.findIndex(w => w.id === widgetId);
      if (widgetIndex === -1) return prevWidgets; // Widget not found

      const widget = newWidgets[widgetIndex];
      // Filter and sort widgets within the same area to determine valid moves.
      const areaWidgets = newWidgets
        .filter(w => w.area === widget.area)
        .sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));

      const widgetIndexInArea = areaWidgets.findIndex(w => w.id === widgetId);

      if (direction === 'up' && widgetIndexInArea > 0) {
        // Swap 'currentOrder' with the previous widget in the same area.
        const prevWidgetInArea = areaWidgets[widgetIndexInArea - 1];
        const originalPrevWidgetIndex = newWidgets.findIndex(w => w.id === prevWidgetInArea.id);

        // Swap orders
        const tempOrder = newWidgets[originalPrevWidgetIndex].currentOrder;
        newWidgets[originalPrevWidgetIndex].currentOrder = newWidgets[widgetIndex].currentOrder;
        newWidgets[widgetIndex].currentOrder = tempOrder;

      } else if (direction === 'down' && widgetIndexInArea < areaWidgets.length - 1) {
        // Swap 'currentOrder' with the next widget in the same area.
        const nextWidgetInArea = areaWidgets[widgetIndexInArea + 1];
        const originalNextWidgetIndex = newWidgets.findIndex(w => w.id === nextWidgetInArea.id);
        
        // Swap orders
        const tempOrder = newWidgets[originalNextWidgetIndex].currentOrder;
        newWidgets[originalNextWidgetIndex].currentOrder = newWidgets[widgetIndex].currentOrder;
        newWidgets[widgetIndex].currentOrder = tempOrder;
      }
      // Re-sort the main list based on the new orders.
      return newWidgets.sort((a,b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));
    });
  };

  // Saves the current layout (visibility and order of widgets) to localStorage.
  const handleSaveLayout = () => {
    try {
      // Save only the necessary properties to localStorage.
      const layoutToSave = dashboardWidgets.map(({ id, isVisible, currentOrder, area }) => ({ id, isVisible, currentOrder, area }));
      if (typeof window !== 'undefined') {
        localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(layoutToSave));
      }
      toast({ title: "Układ dashboardu zapisany!", description: "Twoje zmiany zostały zapisane w pamięci przeglądarki." });
    } catch (error) {
      console.error("Error saving layout to localStorage:", error);
      toast({ title: "Błąd zapisu", description: "Nie udało się zapisać układu.", variant: "destructive" });
    }
    setIsEditMode(false);
  };

  // Cancels edit mode and reverts widget layout to the state before editing.
  const handleCancelEdit = () => {
    setDashboardWidgets(JSON.parse(JSON.stringify(widgetsBeforeEdit)));
    setIsEditMode(false);
    toast({ title: "Zmiany w układzie anulowane." });
  };

  // Restores the dashboard layout to its initial default configuration.
  const handleRestoreDefaults = () => {
    const defaultLayout = INITIAL_DASHBOARD_LAYOUT.map(w => ({
      ...w,
      isVisible: w.defaultVisible,
      currentOrder: w.defaultOrder,
    }));
    setDashboardWidgets(defaultLayout.sort((a,b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0)));
    try {
      // Save the default layout to localStorage immediately after restoring.
      const layoutToSave = defaultLayout.map(({ id, isVisible, currentOrder, area }) => ({ id, isVisible, currentOrder, area }));
      if (typeof window !== 'undefined') {
        localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(layoutToSave));
      }
      toast({ title: "Przywrócono i zapisano domyślny układ!", description: "Dashboard został zresetowany do ustawień fabrycznych." });
    } catch (error) {
      console.error("Error saving default layout to localStorage:", error);
      toast({ title: "Błąd zapisu domyślnego układu", description: "Nie udało się zapisać domyślnego układu.", variant: "destructive" });
    }
    setIsEditMode(false);
  };

  // Helper to render widget content or its skeleton based on page loading state.
  const renderWidgetContent = (widget: DashboardWidgetConfig) => {
    if (pageIsLoading) return widget.skeletonComponent;
    return widget.component;
  }

  // Filter and sort widgets for the main content area.
  const mainAreaWidgets = dashboardWidgets
    .filter(w => w.area === 'main' && w.isVisible)
    .sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));

  // Filter and sort widgets for the sidebar area.
  const sidebarAreaWidgets = dashboardWidgets
    .filter(w => w.area === 'sidebar' && w.isVisible)
    .sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));

  return (
    <>
      <div className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50 dashboard-page-header">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold tracking-tight dashboard-welcome-message">
              Witaj, <span className="text-primary">{userName}</span>!
            </h2>
          </div>
          <div className="flex items-center gap-2 dashboard-controls-container">
            {isEditMode ? (
              <>
                <Button variant="outline" size="sm" onClick={handleRestoreDefaults} className="dashboard-restore-defaults-button">
                  <RotateCcw className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Domyślne</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelEdit} className="dashboard-cancel-edit-button">
                  <XCircle className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Anuluj</span>
                </Button>
                <Button size="sm" onClick={handleSaveLayout} className="dashboard-save-layout-button">
                  <Save className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Zapisz Układ</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleEnterEditMode} className="dashboard-customize-button">
                <Edit className="h-4 w-4 mr-1 sm:mr-2" /> Dostosuj Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 dashboard-content-area">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Main Content Area - typically for quick actions */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 dashboard-main-content">
              {mainAreaWidgets.map(widget => (
                 <div key={widget.id} className={cn("dashboard-widget-wrapper", isEditMode && "border-2 border-dashed border-primary/50 p-2 rounded-lg bg-primary/5 mb-4 relative")}>
                  {isEditMode && (
                    <div className="absolute top-1 right-1 bg-card border-l border-b border-primary/50 rounded-bl-md p-0.5 z-10 flex gap-0 items-center widget-edit-controls">
                      <Button variant="ghost" size="icon" className="h-6 w-6 widget-toggle-visibility-button" onClick={() => handleToggleWidgetVisibility(widget.id)} title={widget.isVisible ? "Ukryj widget" : "Pokaż widget"}>
                        {widget.isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 widget-move-up-button" onClick={() => handleMoveWidget(widget.id, 'up')} title="Przesuń w górę">
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 widget-move-down-button" onClick={() => handleMoveWidget(widget.id, 'down')} title="Przesuń w dół">
                        <MoveDown className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 widget-resize-button" onClick={() => toast({description: "Zmiana rozmiaru - Wkrótce!"})} title="Zmień rozmiar (Wkrótce)">
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className={cn(isEditMode && "pt-6")}>
                    {isEditMode && (
                        <p className="text-xs font-semibold text-primary/70 mb-1 ml-1 widget-edit-title">{widget.title}</p>
                    )}
                    {renderWidgetContent(widget)}
                  </div>
                </div>
              ))}
              {mainAreaWidgets.length === 0 && !pageIsLoading && (
                <Card className="dashboard-empty-main-area md:col-span-2">
                    <CardHeader><CardTitle>Brak widgetów</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Wszystkie widgety w tej sekcji są ukryte. Włącz tryb edycji, aby je pokazać.</p></CardContent>
                </Card>
              )}
            </div>
            {/* Sidebar Area - for summary widgets */}
            <aside className="space-y-6 lg:col-span-1 dashboard-sidebar-content">
              {sidebarAreaWidgets.map(widget => (
                <div key={widget.id} className={cn("dashboard-widget-wrapper", isEditMode && "border-2 border-dashed border-primary/50 p-2 rounded-lg bg-primary/5 mb-4 relative")}>
                  {isEditMode && (
                     <div className="absolute top-1 right-1 bg-card border-l border-b border-primary/50 rounded-bl-md p-0.5 z-10 flex gap-0 items-center widget-edit-controls">
                      <Button variant="ghost" size="icon" className="h-6 w-6 widget-toggle-visibility-button" onClick={() => handleToggleWidgetVisibility(widget.id)} title={widget.isVisible ? "Ukryj widget" : "Pokaż widget"}>
                        {widget.isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 widget-move-up-button" onClick={() => handleMoveWidget(widget.id, 'up')} title="Przesuń w górę">
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 widget-move-down-button" onClick={() => handleMoveWidget(widget.id, 'down')} title="Przesuń w dół">
                        <MoveDown className="h-3 w-3" />
                      </Button>
                      {/* Resize and move to main area might be more complex and are omitted for now */}
                    </div>
                  )}
                  <div className={cn(isEditMode && "pt-6")}>
                     {isEditMode && (
                        <p className="text-xs font-semibold text-primary/70 mb-1 ml-1 widget-edit-title">{widget.title}</p>
                    )}
                    {renderWidgetContent(widget)}
                  </div>
                </div>
              ))}
              {sidebarAreaWidgets.length === 0 && !pageIsLoading && (
                <Card className="dashboard-empty-sidebar-area">
                    <CardHeader><CardTitle>Brak widgetów</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Wszystkie widgety w tej sekcji są ukryte. Włącz tryb edycji, aby je pokazać.</p></CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>
    </>
  );
}
