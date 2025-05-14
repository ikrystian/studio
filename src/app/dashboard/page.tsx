
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
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Edit,
  Eye,
  EyeOff,
  Flame,
  GlassWater,
  HeartPulse, 
  History,
  Maximize2,
  MessageSquare,
  MoveDown,
  MoveUp,
  PlayCircle,
  Repeat,
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
import type { Metadata } from 'next';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// export const metadata: Metadata = { // Cannot be used in client component
//   title: 'Dashboard | WorkoutWise',
//   description: 'Your personalized WorkoutWise dashboard.',
// };

// Simulated user data
const MOCK_USER_DATA = {
  name: 'Alex',
  avatarUrl: 'https://placehold.co/100x100.png',
  id: 'current_user_id' 
};

// Simulated last workout data
const MOCK_LAST_WORKOUT = {
  name: 'Full Body Strength',
  date: '2024-07-28',
  duration: '45 min',
  calories: '350 kcal',
  exercises: 5,
  link: '/history/hist1', 
};

// Simulated progress stats
const MOCK_PROGRESS_STATS = {
  weightTrend: 'stable',
  currentWeight: '70kg',
  workoutsThisWeek: 3,
  weeklyGoal: 5,
};

// Simulated upcoming reminders
const MOCK_UPCOMING_REMINDERS = [
  { id: 1, title: 'Leg Day', time: 'Tomorrow, 10:00 AM', link: '/plans/plan1' },
  { id: 2, title: 'Cardio Session', time: 'Wednesday, 6:00 PM', link: '/plans/plan2' },
  { id: 3, title: 'Rest & Recovery', time: 'Thursday', link: '#' },
];

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { href: '/workout/start', label: 'Rozpocznij trening', icon: PlayCircle, description: 'Start a new session' },
  { href: '/plans', label: 'Plany treningowe', icon: BookOpen, description: 'View your plans' },
  { href: '/history', label: 'Historia', icon: History, description: 'Track your progress' },
  { href: '/personal-bests', label: 'Rekordy Życiowe', icon: Award, description: 'View your PBs' },
  { href: '/community', label: 'Społeczność', icon: Users, description: 'Connect with others' },
  { href: '/measurements', label: 'Pomiary', icon: Scale, description: 'Log your metrics' },
  { href: '/progress-photos', label: 'Zdjęcia Postępu', icon: Camera, description: 'Track visual changes' },
  { href: '/wellness-journal', label: 'Dziennik Samopoczucia', icon: HeartPulse, description: 'Log your well-being' },
  { href: '/hydration', label: 'Śledzenie Nawodnienia', icon: GlassWater, description: 'Monitor your water intake' },
  { href: `/profile/${MOCK_USER_DATA.id}`, label: 'Mój Profil Publiczny', icon: UserIcon, description: 'View your public profile' },
  { href: '/account', label: 'Moje Konto', icon: Settings2, description: 'Manage your account settings' },
  { href: '/settings', label: 'Ustawienia Aplikacji', icon: Settings, description: 'Manage app settings' },
  { href: '/tools/rest-timer', label: 'Timer Odpoczynku', icon: Timer, description: 'Standalone rest timer' },
];

const QuickActionsWidget: React.FC = () => (
  <section>
    <h3 className="mb-4 text-xl font-semibold">Szybkie Akcje</h3>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {ALL_NAV_ITEMS.map((item) => (
        <Card key={item.href} className="hover:shadow-lg transition-shadow duration-200">
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
  </section>
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
        <span><Repeat className="mr-1 inline-block h-4 w-4" />{MOCK_LAST_WORKOUT.exercises} ćwiczeń</span>
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" asChild className="w-full">
        <Link href={MOCK_LAST_WORKOUT.link}>Zobacz szczegóły</Link>
      </Button>
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
        <Link href="/statistics">Pełne statystyki</Link>
      </Button>
    </CardFooter>
  </Card>
);

const UpcomingRemindersWidget: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center text-lg">
        <Bell className="mr-2 h-5 w-5 text-primary" /> Nadchodzące przypomnienia
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
        <Link href="/calendar">Zobacz kalendarz</Link>
      </Button>
    </CardFooter>
  </Card>
);


export interface DashboardWidgetConfig {
  id: string;
  title: string;
  component: React.ReactNode;
  area: 'main' | 'sidebar';
  defaultOrder: number;
  defaultVisible: boolean;
  currentOrder?: number; // Will be managed in state
  isVisible?: boolean;   // Will be managed in state
}

const INITIAL_DASHBOARD_LAYOUT: Omit<DashboardWidgetConfig, 'currentOrder' | 'isVisible'>[] = [
  { id: 'quick-actions', title: 'Szybkie Akcje', component: <QuickActionsWidget />, area: 'main', defaultOrder: 1, defaultVisible: true },
  { id: 'last-workout', title: 'Ostatni Trening', component: <LastWorkoutWidget />, area: 'sidebar', defaultOrder: 1, defaultVisible: true },
  { id: 'progress-stats', title: 'Statystyki Postępu', component: <ProgressStatsWidget />, area: 'sidebar', defaultOrder: 2, defaultVisible: true },
  { id: 'upcoming-reminders', title: 'Nadchodzące Przypomnienia', component: <UpcomingRemindersWidget />, area: 'sidebar', defaultOrder: 3, defaultVisible: true },
  // Add more potential widgets here later with defaultVisible: false if needed
];

const DASHBOARD_LAYOUT_STORAGE_KEY = "dashboardLayoutConfig";

export default function DashboardPage() {
  const { toast } = useToast();
  const userName = MOCK_USER_DATA.name || 'Użytkowniku';
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // For initial load
  
  const [dashboardWidgets, setDashboardWidgets] = React.useState<DashboardWidgetConfig[]>([]);
  const [previousLayoutOnError, setPreviousLayoutOnError] = React.useState<DashboardWidgetConfig[] | null>(null);


  React.useEffect(() => {
    // Load layout from localStorage or use defaults
    let loadedLayout: DashboardWidgetConfig[] = [];
    try {
      const savedLayoutJson = localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY);
      if (savedLayoutJson) {
        const parsedLayout = JSON.parse(savedLayoutJson) as DashboardWidgetConfig[];
        // Ensure all default widgets are present, add if missing, respect saved settings for existing ones
        loadedLayout = INITIAL_DASHBOARD_LAYOUT.map(defaultWidget => {
          const savedWidget = parsedLayout.find(w => w.id === defaultWidget.id);
          return {
            ...defaultWidget,
            isVisible: savedWidget?.isVisible ?? defaultWidget.defaultVisible,
            currentOrder: savedWidget?.currentOrder ?? defaultWidget.defaultOrder,
          };
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
    setIsLoading(false);
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
      const widget = newWidgets.find(w => w.id === widgetId);
      if (!widget) return prevWidgets;

      const areaWidgets = newWidgets.filter(w => w.area === widget.area).sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));
      const widgetIndexInArea = areaWidgets.findIndex(w => w.id === widgetId);

      if (direction === 'up' && widgetIndexInArea > 0) {
        // Swap with previous
        const prevWidget = areaWidgets[widgetIndexInArea - 1];
        [prevWidget.currentOrder, widget.currentOrder] = [widget.currentOrder, prevWidget.currentOrder];
      } else if (direction === 'down' && widgetIndexInArea < areaWidgets.length - 1) {
        // Swap with next
        const nextWidget = areaWidgets[widgetIndexInArea + 1];
        [nextWidget.currentOrder, widget.currentOrder] = [widget.currentOrder, nextWidget.currentOrder];
      }
      return newWidgets.sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));
    });
  };
  
  const handleSaveLayout = () => {
    try {
      localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(dashboardWidgets));
      toast({ title: "Układ dashboardu zapisany!", description: "Twoje zmiany zostały zapisane w pamięci przeglądarki." });
    } catch (error) {
      console.error("Error saving layout to localStorage:", error);
      toast({ title: "Błąd zapisu", description: "Nie udało się zapisać układu.", variant: "destructive" });
    }
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    // Re-load from localStorage or defaults
    const savedLayoutJson = localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY);
    let layoutToRestore: DashboardWidgetConfig[];
    if (savedLayoutJson) {
        const parsedLayout = JSON.parse(savedLayoutJson) as DashboardWidgetConfig[];
         layoutToRestore = INITIAL_DASHBOARD_LAYOUT.map(defaultWidget => {
          const savedWidget = parsedLayout.find(w => w.id === defaultWidget.id);
          return {
            ...defaultWidget,
            isVisible: savedWidget?.isVisible ?? defaultWidget.defaultVisible,
            currentOrder: savedWidget?.currentOrder ?? defaultWidget.defaultOrder,
          };
        });
    } else {
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

  const renderWidget = (widget: DashboardWidgetConfig) => (
    <div key={widget.id} className={cn(isEditMode && "border-2 border-dashed border-primary/50 p-2 rounded-lg bg-primary/5 mb-4 relative")}>
      {isEditMode && (
        <div className="absolute top-0 right-0 bg-card border-l border-b border-primary/50 rounded-bl-md p-1 z-10 flex gap-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidgetVisibility(widget.id)} title={widget.isVisible ? "Ukryj widget" : "Pokaż widget"}>
            {widget.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveWidget(widget.id, 'up')} title="Przesuń w górę">
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveWidget(widget.id, 'down')} title="Przesuń w dół">
            <MoveDown className="h-4 w-4" />
          </Button>
           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toast({description: "Zmiana rozmiaru - Wkrótce!"})} title="Zmień rozmiar (Wkrótce)">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className={cn(isEditMode && "pt-8")}>
        {widget.component}
      </div>
    </div>
  );

  const mainWidgets = dashboardWidgets
    .filter(w => w.area === 'main' && w.isVisible)
    .sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));

  const sidebarWidgets = dashboardWidgets
    .filter(w => w.area === 'sidebar' && w.isVisible)
    .sort((a, b) => (a.currentOrder ?? 0) - (b.currentOrder ?? 0));

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Ładowanie dashboardu...</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Dumbbell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">WorkoutWise</h1>
          </div>
          <div className="flex items-center gap-3">
             {isEditMode ? (
              <>
                <Button variant="outline" size="sm" onClick={handleRestoreDefaults}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Przywróć Domyślne
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <XCircle className="h-4 w-4 mr-2" /> Anuluj
                </Button>
                <Button size="sm" onClick={handleSaveLayout}>
                  <Save className="h-4 w-4 mr-2" /> Zapisz Układ
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" /> Dostosuj Dashboard
              </Button>
            )}
            <Link href={`/profile/${MOCK_USER_DATA.id}`} passHref>
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarImage src={MOCK_USER_DATA.avatarUrl} alt={userName} data-ai-hint="profile avatar" />
                <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Wyloguj</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <section className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">
              Witaj, <span className="text-primary">{userName}</span>!
            </h2>
            <p className="text-muted-foreground">Gotowy na dzisiejszy trening?</p>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              {mainWidgets.map(renderWidget)}
            </div>
            <aside className="space-y-6 lg:col-span-1">
              {sidebarWidgets.map(renderWidget)}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
