
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
  Info, 
  Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
// MOCK BACKEND LOGIC (Dashboard Widgets):
// - LastWorkoutWidget: Fetches data from '/api/history/last-workout', which queries SQLite.
// - ProgressStatsWidget: Uses MOCK_PROGRESS_STATS_DASHBOARD from mockData.ts.
// - UpcomingRemindersWidget: Uses MOCK_UPCOMING_REMINDERS_DASHBOARD from mockData.ts.
// - FitnessTipWidget: Uses MOCK_FITNESS_TIPS_DASHBOARD from mockData.ts.
// - QuickActionCards: Data (labels, links) is defined locally in ALL_NAV_ITEMS.
// MOCK BACKEND LOGIC (User Name):
// - User name is fetched from localStorage ('currentUserProfileData').
// MOCK BACKEND LOGIC (Dashboard Layout):
// - Widget visibility and order are loaded from and saved to localStorage (DASHBOARD_LAYOUT_STORAGE_KEY).
//   This simulates user-specific dashboard customization typically stored on a backend.
import {
  MOCK_PROGRESS_STATS_DASHBOARD,
  MOCK_UPCOMING_REMINDERS_DASHBOARD,
  MOCK_FITNESS_TIPS_DASHBOARD,
  type DashboardLastWorkout, // Updated to use new structure for API response
  type DashboardProgressStats,
  type DashboardUpcomingReminder
} from '@/lib/mockData';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

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
        <div className="pb-4 flex-grow min-h-[40px]">
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
    <div className="pb-4 flex-grow min-h-[40px]">
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

interface LastWorkoutApiData {
  id: string;
  name: string;
  date: string; // ISO string
  durationSeconds: number;
  exerciseCount: number;
}

const LastWorkoutWidget: React.FC = () => {
  const [lastWorkout, setLastWorkout] = React.useState<DashboardLastWorkout | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // MOCK BACKEND LOGIC (LastWorkoutWidget):
    // This widget fetches data from the '/api/history/last-workout' endpoint.
    // That API endpoint, in turn, queries the SQLite database for the last workout
    // of the MOCK_CURRENT_USER_PROFILE.id. So, the data displayed here originates from the database.
    const fetchLastWorkout = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/history/last-workout');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Błąd serwera: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          const apiData = result.data as LastWorkoutApiData; // Type from API definition
          
          setLastWorkout({
            id: apiData.id,
            name: apiData.name,
            date: apiData.date, // Keep as ISO string for potential further processing or display
            durationSeconds: apiData.durationSeconds, // Store raw seconds
            exerciseCount: apiData.exerciseCount,
            calories: 'N/A', // Calories are not in DB schema for workout_sessions
            link: `/dashboard/history/${apiData.id}`,
          });
        } else if (result.success && result.data === null) {
          setLastWorkout(null); // No workout found in DB for the user
        } else {
           throw new Error(result.message || "Nie udało się załadować danych ostatniego treningu z API.");
        }
      } catch (err) {
        console.error("Failed to fetch last workout:", err);
        setError(err instanceof Error ? err.message : "Nieznany błąd podczas ładowania ostatniego treningu.");
        setLastWorkout(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastWorkout();
  }, []);

  if (isLoading) {
    return (
      <Card className="dashboard-widget-last-workout">
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
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dashboard-widget-last-workout">
        <CardHeader>
          <h3 className="flex items-center text-lg font-semibold">
            <Activity className="mr-2 h-5 w-5 text-primary" /> Ostatni trening
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!lastWorkout) {
    return (
      <Card className="dashboard-widget-last-workout">
        <CardHeader>
          <h3 className="flex items-center text-lg font-semibold">
            <Activity className="mr-2 h-5 w-5 text-primary" /> Ostatni trening
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center h-full py-4">
            <Dumbbell className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Brak zarejestrowanych treningów w bazie danych.</p>
            <p className="text-xs text-muted-foreground">Tutaj pojawi się Twój ostatni trening, gdy tylko ukończysz pierwszą sesję!</p>
            <Button variant="link" size="sm" asChild className="mt-2">
              <Link href="/dashboard/workout/start">Rozpocznij pierwszy trening</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const durationMinutes = Math.floor(lastWorkout.durationSeconds / 60);
  const durationFormatted = `${durationMinutes} min`;

  return (
    <Link
      href={lastWorkout.link}
      className={cn(
        "block rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dashboard-widget-last-workout"
      )}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="pb-2">
          <h3 className="flex items-center text-lg font-semibold">
            <Activity className="mr-2 h-5 w-5 text-primary" /> Ostatni trening
          </h3>
          <p className="text-sm text-muted-foreground">{format(parseISO(lastWorkout.date), 'PPP', { locale: pl })}</p>
        </div>
        <div className="space-y-3 flex-grow">
          <h4 className="font-semibold">{lastWorkout.name}</h4>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span><CalendarDays className="mr-1 inline-block h-4 w-4" />{durationFormatted}</span>
            <span><Flame className="mr-1 inline-block h-4 w-4" />{lastWorkout.calories || 'N/A'}</span>
            <span><Dumbbell className="mr-1 inline-block h-4 w-4" />{lastWorkout.exerciseCount} ćwiczeń</span>
          </div>
        </div>
      </div>
    </Link>
  );
};


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
            <span className="font-medium">{MOCK_PROGRESS_STATS_DASHBOARD.currentWeight} ({MOCK_PROGRESS_STATS_DASHBOARD.weightTrend})</span>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Treningi w tym tygodniu</span>
            <span className="font-medium">{MOCK_PROGRESS_STATS_DASHBOARD.workoutsThisWeek} / {MOCK_PROGRESS_STATS_DASHBOARD.weeklyGoal}</span>
          </div>
          <Progress value={(MOCK_PROGRESS_STATS_DASHBOARD.workoutsThisWeek / MOCK_PROGRESS_STATS_DASHBOARD.weeklyGoal) * 100} className="h-2" />
        </div>
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
      {MOCK_UPCOMING_REMINDERS_DASHBOARD.length > 0 ? (
        <ul className="space-y-3">
          {MOCK_UPCOMING_REMINDERS_DASHBOARD.map((reminder, index) => (
            <li key={reminder.id} className="text-sm">
              <Link href={reminder.link} className="hover:text-primary transition-colors">
                <p className="font-medium">{reminder.title}</p>
                <p className="text-xs text-muted-foreground">{reminder.time}</p>
              </Link>
              {index < MOCK_UPCOMING_REMINDERS_DASHBOARD.length - 1 && <Separator className="mt-3" />}
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
    // MOCK BACKEND LOGIC: Tip is randomly selected from a hardcoded list.
    setTip(MOCK_FITNESS_TIPS_DASHBOARD[Math.floor(Math.random() * MOCK_FITNESS_TIPS_DASHBOARD.length)]);
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
  currentOrder?: number;
  isVisible?: boolean;
}

const generateQuickActionWidgets = (): DashboardWidgetConfig[] => {
  return ALL_NAV_ITEMS.map((item, index) => ({
    id: item.id,
    title: item.label,
    component: <SingleQuickActionCard item={item} />,
    skeletonComponent: <SingleQuickActionCardSkeleton />,
    area: 'main',
    defaultOrder: index + 1,
    defaultVisible: true,
  }));
};

const INITIAL_DASHBOARD_LAYOUT: DashboardWidgetConfig[] = [
  ...generateQuickActionWidgets(),
  { id: 'last-workout', title: 'Ostatni Trening', component: <LastWorkoutWidget />, skeletonComponent: <LastWorkoutWidgetSkeleton />, area: 'sidebar', defaultOrder: 1, defaultVisible: true },
  { id: 'progress-stats', title: 'Statystyki Postępu', component: <ProgressStatsWidget />, skeletonComponent: <ProgressStatsWidgetSkeleton />, area: 'sidebar', defaultOrder: 2, defaultVisible: true },
  { id: 'upcoming-reminders', title: 'Nadchodzące Przypomnienia', component: <UpcomingRemindersWidget />, skeletonComponent: <UpcomingRemindersWidgetSkeleton />, area: 'sidebar', defaultOrder: 3, defaultVisible: true },
  { id: 'fitness-tip', title: 'Porada Dnia', component: <FitnessTipWidget />, skeletonComponent: <FitnessTipWidgetSkeleton />, area: 'sidebar', defaultOrder: 4, defaultVisible: true },
];

const DASHBOARD_LAYOUT_STORAGE_KEY = "dashboardLayoutConfigV3";

export default function DashboardPage() {
  const { toast } = useToast();
  const [userName, setUserName] = React.useState('Użytkowniku');
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [pageIsLoading, setPageIsLoading] = React.useState(true);

  const [dashboardWidgets, setDashboardWidgets] = React.useState<DashboardWidgetConfig[]>([]);
  const [widgetsBeforeEdit, setWidgetsBeforeEdit] = React.useState<DashboardWidgetConfig[]>([]);

  React.useEffect(() => {
    // MOCK BACKEND LOGIC: User name is fetched from localStorage.
    // In a real app, this would come from a user context or API call after login.
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

    // MOCK BACKEND LOGIC: Dashboard layout (widget visibility and order) is loaded from localStorage.
    // If no saved layout, defaults are used. This simulates user-specific dashboard customization.
    let loadedLayout: DashboardWidgetConfig[] = [];
    try {
      const savedLayoutJson = typeof window !== 'undefined' ? localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY) : null;
      const baseLayout = INITIAL_DASHBOARD_LAYOUT.map(w => ({
        ...w,
        isVisible: w.defaultVisible,
        currentOrder: w.defaultOrder,
      }));

      if (savedLayoutJson) {
        const parsedSavedWidgets = JSON.parse(savedLayoutJson) as Pick<DashboardWidgetConfig, 'id' | 'isVisible' | 'currentOrder' | 'area'>[];

        loadedLayout = baseLayout.map(defaultWidget => {
          const savedWidgetSettings = parsedSavedWidgets.find(w => w.id === defaultWidget.id);
          return {
            ...defaultWidget,
            isVisible: savedWidgetSettings?.isVisible !== undefined ? savedWidgetSettings.isVisible : defaultWidget.defaultVisible,
            currentOrder: savedWidgetSettings?.currentOrder !== undefined ? savedWidgetSettings.currentOrder : defaultWidget.defaultOrder,
            area: savedWidgetSettings?.area !== undefined ? savedWidgetSettings.area : defaultWidget.area,
          };
        });

        const loadedIds = new Set(loadedLayout.map(w => w.id));
        baseLayout.forEach(initialWidget => {
          if (!loadedIds.has(initialWidget.id)) {
            loadedLayout.push({ ...initialWidget, isVisible: initialWidget.defaultVisible, currentOrder: initialWidget.defaultOrder });
          }
        });

      } else {
        loadedLayout = baseLayout;
      }
    } catch (error) {
      console.error("Error loading dashboard layout from localStorage:", error);
      loadedLayout = INITIAL_DASHBOARD_LAYOUT.map(w => ({
        ...w,
        isVisible: w.defaultVisible,
        currentOrder: w.defaultOrder,
      }));
    }
    setDashboardWidgets(loadedLayout.sort((a,b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0)));
    setTimeout(() => setPageIsLoading(false), 0); 
  }, []);

  const handleEnterEditMode = () => {
    setWidgetsBeforeEdit(JSON.parse(JSON.stringify(dashboardWidgets)));
    setIsEditMode(true);
  };

  const handleToggleWidgetVisibility = (widgetId: string) => {
    setDashboardWidgets(prevWidgets =>
      prevWidgets.map(widget =>
        widget.id === widgetId ? { ...widget, isVisible: !widget.isVisible } : widget
      )
    );
  };

  const handleMoveWidget = (widgetId: string, direction: 'up' | 'down') => {
    setDashboardWidgets(prevWidgets => {
      const newWidgets = prevWidgets.map(w => ({...w}));
      const widgetIndex = newWidgets.findIndex(w => w.id === widgetId);
      if (widgetIndex === -1) return prevWidgets;

      const widget = newWidgets[widgetIndex];
      const areaWidgets = newWidgets
        .filter(w => w.area === widget.area)
        .sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));

      const widgetIndexInArea = areaWidgets.findIndex(w => w.id === widgetId);

      if (direction === 'up' && widgetIndexInArea > 0) {
        const prevWidgetInArea = areaWidgets[widgetIndexInArea - 1];
        const originalPrevWidgetIndex = newWidgets.findIndex(w => w.id === prevWidgetInArea.id);

        const tempOrder = newWidgets[originalPrevWidgetIndex].currentOrder;
        newWidgets[originalPrevWidgetIndex].currentOrder = newWidgets[widgetIndex].currentOrder;
        newWidgets[widgetIndex].currentOrder = tempOrder;

      } else if (direction === 'down' && widgetIndexInArea < areaWidgets.length - 1) {
        const nextWidgetInArea = areaWidgets[widgetIndexInArea + 1];
        const originalNextWidgetIndex = newWidgets.findIndex(w => w.id === nextWidgetInArea.id);

        const tempOrder = newWidgets[originalNextWidgetIndex].currentOrder;
        newWidgets[originalNextWidgetIndex].currentOrder = newWidgets[widgetIndex].currentOrder;
        newWidgets[widgetIndex].currentOrder = tempOrder;
      }
      return newWidgets.sort((a,b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));
    });
  };

  // MOCK BACKEND LOGIC: Saves the dashboard layout (widget visibility and order) to localStorage.
  // In a real app, this would be an API call to persist user preferences.
  const handleSaveLayout = () => {
    try {
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

  const handleCancelEdit = () => {
    setDashboardWidgets(JSON.parse(JSON.stringify(widgetsBeforeEdit)));
    setIsEditMode(false);
    toast({ title: "Zmiany w układzie anulowane." });
  };

  // MOCK BACKEND LOGIC: Restores layout to defaults and saves this default to localStorage.
  const handleRestoreDefaults = () => {
    const defaultLayout = INITIAL_DASHBOARD_LAYOUT.map(w => ({
      ...w,
      isVisible: w.defaultVisible,
      currentOrder: w.defaultOrder,
    }));
    setDashboardWidgets(defaultLayout.sort((a,b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0)));
    try {
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

  const renderWidgetContent = (widget: DashboardWidgetConfig) => {
    if (pageIsLoading) return widget.skeletonComponent;
    return widget.component;
  }

  const mainAreaWidgets = dashboardWidgets
    .filter(w => w.area === 'main' && (isEditMode || w.isVisible)) 
    .sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));

  const sidebarAreaWidgets = dashboardWidgets
    .filter(w => w.area === 'sidebar' && (isEditMode || w.isVisible)) 
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
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 dashboard-main-content">
              {mainAreaWidgets.map(widget => (
                 <div key={widget.id} className={cn("dashboard-widget-wrapper", isEditMode && "border-2 border-dashed border-primary/50 p-2 rounded-lg bg-primary/5 mb-4 relative", !widget.isVisible && isEditMode && "opacity-50")}>
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
              {mainAreaWidgets.filter(w => w.isVisible).length === 0 && !isEditMode && !pageIsLoading && (
                <Card className="dashboard-empty-main-area md:col-span-2">
                    <CardHeader><CardTitle>Brak aktywnych widgetów</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Wszystkie widgety w tej sekcji są ukryte. Włącz tryb edycji, aby je pokazać.</p></CardContent>
                </Card>
              )}
            </div>
            <aside className="space-y-6 lg:col-span-1 dashboard-sidebar-content">
              {sidebarAreaWidgets.map(widget => (
                <div key={widget.id} className={cn("dashboard-widget-wrapper", isEditMode && "border-2 border-dashed border-primary/50 p-2 rounded-lg bg-primary/5 mb-4 relative", !widget.isVisible && isEditMode && "opacity-50")}>
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
              {sidebarAreaWidgets.filter(w => w.isVisible).length === 0 && !isEditMode && !pageIsLoading && (
                <Card className="dashboard-empty-sidebar-area">
                    <CardHeader><CardTitle>Brak aktywnych widgetów</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Wszystkie widgety w tej sekcji są ukryte. Włącz tryb edycji, aby je pokazać.</p></CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>
    </>
  );
}
