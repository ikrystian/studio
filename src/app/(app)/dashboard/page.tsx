
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";

const MOCK_USER_DATA = {
  name: 'Alex',
  avatarUrl: 'https://placehold.co/100x100.png?text=AV',
  id: 'current_user_id' 
};

const MOCK_LAST_WORKOUT = {
  name: 'Full Body Strength',
  date: '2024-07-28',
  duration: '45 min',
  calories: '350 kcal',
  exercises: 5,
  link: '/dashboard/history/hist1', 
};

const MOCK_PROGRESS_STATS = {
  weightTrend: 'stable',
  currentWeight: '70kg',
  workoutsThisWeek: 3,
  weeklyGoal: 5,
};

const MOCK_UPCOMING_REMINDERS = [
  { id: 1, title: 'Leg Day', time: 'Tomorrow, 10:00 AM', link: '/dashboard/plans/plan1' },
  { id: 2, title: 'Cardio Session', time: 'Wednesday, 6:00 PM', link: '/dashboard/plans/plan2' },
];

interface NavItem {
  id: string; // Unique ID for localStorage key
  href: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

// Make sure ALL_NAV_ITEMS are defined at the top level or imported
const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'workout-start', href: '/dashboard/workout/start', label: 'Rozpocznij trening', icon: PlayCircle, description: 'Rozpocznij nową sesję lub kontynuuj.' },
  { id: 'plans', href: '/dashboard/plans', label: 'Plany treningowe', icon: BookOpen, description: 'Przeglądaj i zarządzaj planami.' },
  { id: 'history', href: '/dashboard/history', label: 'Historia', icon: History, description: 'Śledź ukończone treningi.' },
  { id: 'personal-bests', href: '/dashboard/personal-bests', label: 'Rekordy Życiowe', icon: Award, description: 'Zobacz swoje najlepsze wyniki.' },
  { id: 'community', href: '/dashboard/community', label: 'Społeczność', icon: Users, description: 'Połącz się z innymi.' },
  { id: 'measurements', href: '/dashboard/measurements', label: 'Pomiary Ciała', icon: Scale, description: 'Rejestruj wagę i obwody.' },
  { id: 'progress-photos', href: '/dashboard/progress-photos', label: 'Zdjęcia Postępu', icon: Camera, description: 'Dokumentuj zmiany wizualne.' },
  { id: 'wellness-journal', href: '/dashboard/wellness-journal', label: 'Dziennik Samopoczucia', icon: HeartPulse, description: 'Monitoruj swoje samopoczucie.' },
  { id: 'hydration', href: '/dashboard/hydration', label: 'Śledzenie Nawodnienia', icon: GlassWater, description: 'Monitoruj spożycie wody.' },
  { id: 'statistics', href: '/dashboard/statistics', label: 'Statystyki', icon: BarChart3, description: 'Analizuj swoje postępy.'},
  { id: 'my-account', href: '/dashboard/account', label: 'Moje Konto', icon: Settings2, description: 'Zarządzaj ustawieniami konta.' },
  { id: 'app-settings', href: '/dashboard/settings', label: 'Ustawienia Aplikacji', icon: Settings, description: 'Dostosuj preferencje aplikacji.' },
  { id: 'rest-timer', href: '/dashboard/tools/rest-timer', label: 'Timer Odpoczynku', icon: Timer, description: 'Niezależny stoper odpoczynku.' },
];
const QUICK_ACTIONS_VISIBILITY_KEY = "dashboardQuickActionItemVisibility";


const QuickActionsWidget: React.FC = () => {
  const [visibleItems, setVisibleItems] = React.useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const storedVisibility = localStorage.getItem(QUICK_ACTIONS_VISIBILITY_KEY);
    let visibilityMap: Record<string, boolean> = {};
    if (storedVisibility) {
      try {
        visibilityMap = JSON.parse(storedVisibility);
      } catch (e) {
        console.error("Error parsing quick actions visibility from localStorage", e);
      }
    }

    const itemsToDisplay = ALL_NAV_ITEMS.filter(item => {
      // Default to visible if not explicitly set
      return visibilityMap[item.id] === undefined ? true : visibilityMap[item.id];
    });
    setVisibleItems(itemsToDisplay);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <QuickActionsWidgetSkeleton />;
  }

  if (visibleItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            Szybkie Akcje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Brak wybranych szybkich akcji. Możesz je skonfigurować w Ustawieniach Aplikacji &gt; Dostosuj Szybkie Akcje.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {visibleItems.map((item) => (
        <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <item.icon className="mr-2 h-5 w-5 text-primary" />
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full justify-start">
              <Link href={item.href}>
                Przejdź <ChevronRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};


const QuickActionsWidgetSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <Card key={i}>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="pb-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-1/3" />
        </CardFooter>
      </Card>
    ))}
  </div>
);


const LastWorkoutWidget: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center text-lg">
        <Activity className="mr-2 h-5 w-5 text-primary" /> Ostatni trening
      </CardTitle>
      <CardDescription>{new Date(MOCK_LAST_WORKOUT.date).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <h4 className="font-semibold">{MOCK_LAST_WORKOUT.name}</h4>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span><CalendarDays className="mr-1 inline-block h-4 w-4" />{MOCK_LAST_WORKOUT.duration}</span>
        <span><Flame className="mr-1 inline-block h-4 w-4" />{MOCK_LAST_WORKOUT.calories}</span>
        <span><Dumbbell className="mr-1 inline-block h-4 w-4" />{MOCK_LAST_WORKOUT.exercises} ćwiczeń</span>
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" asChild className="w-full">
        <Link href={MOCK_LAST_WORKOUT.link}>Zobacz szczegóły</Link>
      </Button>
    </CardFooter>
  </Card>
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
      <Skeleton className="h-9 w-full" />
    </CardFooter>
  </Card>
);


const ProgressStatsWidget: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center text-lg">
        <BarChart3 className="mr-2 h-5 w-5 text-primary" /> Statystyki postępu
      </CardTitle>
      <CardDescription>Twój postęp w tym tygodniu.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
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
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" asChild className="w-full">
        <Link href="/dashboard/statistics">Pełne statystyki</Link>
      </Button>
    </CardFooter>
  </Card>
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
      <Skeleton className="h-9 w-full" />
    </CardFooter>
  </Card>
);


const UpcomingRemindersWidget: React.FC = () => (
  <Card>
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

const INITIAL_DASHBOARD_LAYOUT: DashboardWidgetConfig[] = [
  { id: 'quick-actions', title: 'Szybkie Akcje', component: <QuickActionsWidget />, skeletonComponent: <QuickActionsWidgetSkeleton />, area: 'main', defaultOrder: 1, defaultVisible: true },
  { id: 'last-workout', title: 'Ostatni Trening', component: <LastWorkoutWidget />, skeletonComponent: <LastWorkoutWidgetSkeleton />, area: 'sidebar', defaultOrder: 1, defaultVisible: true },
  { id: 'progress-stats', title: 'Statystyki Postępu', component: <ProgressStatsWidget />, skeletonComponent: <ProgressStatsWidgetSkeleton />, area: 'sidebar', defaultOrder: 2, defaultVisible: true },
  { id: 'upcoming-reminders', title: 'Nadchodzące Przypomnienia', component: <UpcomingRemindersWidget />, skeletonComponent: <UpcomingRemindersWidgetSkeleton />, area: 'sidebar', defaultOrder: 3, defaultVisible: true },
];

const DASHBOARD_LAYOUT_STORAGE_KEY = "dashboardLayoutConfigV2"; // Changed key for safety if old structure exists

export default function DashboardPage() {
  const { toast } = useToast();
  const userName = MOCK_USER_DATA.name || 'Użytkowniku';
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [pageIsLoading, setPageIsLoading] = React.useState(true); 
  
  const [dashboardWidgets, setDashboardWidgets] = React.useState<DashboardWidgetConfig[]>([]);


  React.useEffect(() => {
    let loadedLayout: DashboardWidgetConfig[] = [];
    try {
      const savedLayoutJson = localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY);
      if (savedLayoutJson) {
        const parsedLayout = JSON.parse(savedLayoutJson) as Pick<DashboardWidgetConfig, 'id' | 'isVisible' | 'currentOrder' | 'area'>[];
        
        loadedLayout = INITIAL_DASHBOARD_LAYOUT.map(defaultWidget => {
          const savedWidgetSettings = parsedLayout.find(w => w.id === defaultWidget.id);
          return {
            ...defaultWidget,
            isVisible: savedWidgetSettings?.isVisible !== undefined ? savedWidgetSettings.isVisible : defaultWidget.defaultVisible,
            currentOrder: savedWidgetSettings?.currentOrder !== undefined ? savedWidgetSettings.currentOrder : defaultWidget.defaultOrder,
            area: savedWidgetSettings?.area !== undefined ? savedWidgetSettings.area : defaultWidget.area, // Keep saved area
          };
        });

        // Ensure all INITIAL_DASHBOARD_LAYOUT widgets are present, add if missing
        INITIAL_DASHBOARD_LAYOUT.forEach(initialWidget => {
          if (!loadedLayout.find(w => w.id === initialWidget.id)) {
            loadedLayout.push({
              ...initialWidget,
              isVisible: initialWidget.defaultVisible,
              currentOrder: initialWidget.defaultOrder,
            });
          }
        });

      } else {
        loadedLayout = INITIAL_DASHBOARD_LAYOUT.map(w => ({
          ...w,
          isVisible: w.defaultVisible,
          currentOrder: w.defaultOrder,
        }));
      }
    } catch (error) {
      console.error("Error loading dashboard layout from localStorage:", error);
      loadedLayout = INITIAL_DASHBOARD_LAYOUT.map(w => ({
        ...w,
        isVisible: w.defaultVisible,
        currentOrder: w.defaultOrder,
      }));
    }
    setDashboardWidgets(loadedLayout);
    // Simulate loading time
    setTimeout(() => setPageIsLoading(false), 750); 
  }, []);

  const handleToggleWidgetVisibility = (widgetId: string) => {
    setDashboardWidgets(prevWidgets =>
      prevWidgets.map(widget =>
        widget.id === widgetId ? { ...widget, isVisible: !widget.isVisible } : widget
      )
    );
  };

  const handleMoveWidget = (widgetId: string, direction: 'up' | 'down') => {
    setDashboardWidgets(prevWidgets => {
      const newWidgets = [...prevWidgets];
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
  
  const handleSaveLayout = () => {
    try {
      const layoutToSave = dashboardWidgets.map(({ id, isVisible, currentOrder, area }) => ({ id, isVisible, currentOrder, area }));
      localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(layoutToSave));
      toast({ title: "Układ dashboardu zapisany!", description: "Twoje zmiany zostały zapisane w pamięci przeglądarki." });
    } catch (error) {
      console.error("Error saving layout to localStorage:", error);
      toast({ title: "Błąd zapisu", description: "Nie udało się zapisać układu.", variant: "destructive" });
    }
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    // Re-load from localStorage or defaults
     let layoutToRestore: DashboardWidgetConfig[] = [];
    try {
        const savedLayoutJson = localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY);
        if (savedLayoutJson) {
             const parsedLayout = JSON.parse(savedLayoutJson) as Pick<DashboardWidgetConfig, 'id' | 'isVisible' | 'currentOrder' | 'area'>[];
             layoutToRestore = INITIAL_DASHBOARD_LAYOUT.map(defaultWidget => {
                const savedWidgetSettings = parsedLayout.find(w => w.id === defaultWidget.id);
                return {
                    ...defaultWidget,
                    isVisible: savedWidgetSettings?.isVisible !== undefined ? savedWidgetSettings.isVisible : defaultWidget.defaultVisible,
                    currentOrder: savedWidgetSettings?.currentOrder !== undefined ? savedWidgetSettings.currentOrder : defaultWidget.defaultOrder,
                    area: savedWidgetSettings?.area !== undefined ? savedWidgetSettings.area : defaultWidget.area,
                };
            });
            INITIAL_DASHBOARD_LAYOUT.forEach(initialWidget => {
              if (!layoutToRestore.find(w => w.id === initialWidget.id)) {
                layoutToRestore.push({
                  ...initialWidget,
                  isVisible: initialWidget.defaultVisible,
                  currentOrder: initialWidget.defaultOrder,
                });
              }
            });
        } else {
            layoutToRestore = INITIAL_DASHBOARD_LAYOUT.map(w => ({ ...w, isVisible: w.defaultVisible, currentOrder: w.defaultOrder }));
        }
    } catch (error) {
        console.error("Error restoring layout:", error);
        layoutToRestore = INITIAL_DASHBOARD_LAYOUT.map(w => ({ ...w, isVisible: w.defaultVisible, currentOrder: w.defaultOrder }));
    }
    setDashboardWidgets(layoutToRestore);
    setIsEditMode(false);
    toast({ title: "Zmiany w układzie anulowane." });
  };

  const handleRestoreDefaults = () => {
    const defaultLayout = INITIAL_DASHBOARD_LAYOUT.map(w => ({
      ...w,
      isVisible: w.defaultVisible,
      currentOrder: w.defaultOrder,
    }));
    setDashboardWidgets(defaultLayout);
    toast({ title: "Przywrócono domyślny układ.", description: "Kliknij 'Zapisz Układ', aby go utrwalić." });
  };

  const renderWidgetContent = (widget: DashboardWidgetConfig) => {
    if (pageIsLoading) return widget.skeletonComponent;
    return widget.component;
  }

  const mainAreaWidgets = dashboardWidgets
    .filter(w => w.area === 'main' && w.isVisible)
    .sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));

  const sidebarAreaWidgets = dashboardWidgets
    .filter(w => w.area === 'sidebar' && w.isVisible)
    .sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));

  
  return (
    <>
      {/* Page-specific sub-header for Dashboard */}
      <div className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50"> 
          {/* Adjust top based on AppHeader height */}
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Witaj, <span className="text-primary">{userName}</span>!
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button variant="outline" size="sm" onClick={handleRestoreDefaults}>
                  <RotateCcw className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Domyślne</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <XCircle className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Anuluj</span>
                </Button>
                <Button size="sm" onClick={handleSaveLayout}>
                  <Save className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Zapisz Układ</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                <Edit className="h-4 w-4 mr-1 sm:mr-2" /> Dostosuj Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              {mainAreaWidgets.map(widget => (
                 <div key={widget.id} className={cn(isEditMode && "border-2 border-dashed border-primary/50 p-2 rounded-lg bg-primary/5 mb-4 relative")}>
                  {isEditMode && (
                    <div className="absolute top-1 right-1 bg-card border-l border-b border-primary/50 rounded-bl-md p-0.5 z-10 flex gap-0 items-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidgetVisibility(widget.id)} title={widget.isVisible ? "Ukryj widget" : "Pokaż widget"}>
                        {widget.isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveWidget(widget.id, 'up')} title="Przesuń w górę">
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveWidget(widget.id, 'down')} title="Przesuń w dół">
                        <MoveDown className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toast({description: "Zmiana rozmiaru - Wkrótce!"})} title="Zmień rozmiar (Wkrótce)">
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className={cn(isEditMode && "pt-6")}> 
                    {/* Conditionally add padding if in edit mode and controls are shown, or adjust controls position*/}
                     {/* For main widgets, if they are a title + content structure, we can inject title here */}
                    {isEditMode && (
                        <p className="text-xs font-semibold text-primary/70 mb-1 ml-1">{widget.title}</p>
                    )}
                    {renderWidgetContent(widget)}
                  </div>
                </div>
              ))}
            </div>
            <aside className="space-y-6 lg:col-span-1">
              {sidebarAreaWidgets.map(widget => (
                <div key={widget.id} className={cn(isEditMode && "border-2 border-dashed border-primary/50 p-2 rounded-lg bg-primary/5 mb-4 relative")}>
                  {isEditMode && (
                     <div className="absolute top-1 right-1 bg-card border-l border-b border-primary/50 rounded-bl-md p-0.5 z-10 flex gap-0 items-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidgetVisibility(widget.id)} title={widget.isVisible ? "Ukryj widget" : "Pokaż widget"}>
                        {widget.isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveWidget(widget.id, 'up')} title="Przesuń w górę">
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveWidget(widget.id, 'down')} title="Przesuń w dół">
                        <MoveDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className={cn(isEditMode && "pt-6")}>
                     {isEditMode && (
                        <p className="text-xs font-semibold text-primary/70 mb-1 ml-1">{widget.title}</p>
                    )}
                    {renderWidgetContent(widget)}
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </div>
    </>
  );
}

    