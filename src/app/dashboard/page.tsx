
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  BarChart3,
  Bell,
  ClipboardList,
  Dumbbell,
  History,
  MessageSquare,
  PlayCircle,
  Scale,
  Settings,
  Users,
  ChevronRight,
  CalendarDays,
  Flame,
  Repeat,
  BookOpen, // Added for Plany Treningowe consistency
  User as UserIcon, // For Profile
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | WorkoutWise',
  description: 'Your personalized WorkoutWise dashboard.',
};

// Simulated user data - replace with actual data fetching
const userData = {
  name: 'Alex', // Replace with actual user name
  avatarUrl: 'https://placehold.co/100x100.png', // Replace with actual avatar or remove
  id: 'current_user_id' // Placeholder for current user ID
};

// Simulated last workout data
const lastWorkout = {
  name: 'Full Body Strength',
  date: '2024-07-28',
  duration: '45 min',
  calories: '350 kcal',
  exercises: 5,
  link: '/history/workout/123', // Placeholder link
};

// Simulated progress stats
const progressStats = {
  weightTrend: 'stable', // 'up', 'down', 'stable'
  currentWeight: '70kg',
  workoutsThisWeek: 3,
  weeklyGoal: 5,
};

// Simulated upcoming reminders
const upcomingReminders = [
  { id: 1, title: 'Leg Day', time: 'Tomorrow, 10:00 AM', link: '/plans/workout/456' },
  { id: 2, title: 'Cardio Session', time: 'Wednesday, 6:00 PM', link: '/plans/workout/789' },
  { id: 3, title: 'Rest & Recovery', time: 'Thursday', link: '#' },
];

// Navigation items
const navItems = [
  { href: '/workout/start', label: 'Rozpocznij trening', icon: PlayCircle, description: 'Start a new session' },
  { href: '/plans', label: 'Plany treningowe', icon: BookOpen, description: 'View your plans' },
  { href: '/history', label: 'Historia', icon: History, description: 'Track your progress' },
  { href: '/community', label: 'Społeczność', icon: Users, description: 'Connect with others' },
  { href: '/measurements', label: 'Pomiary', icon: Scale, description: 'Log your metrics' },
  { href: `/profile/${userData.id}`, label: 'Mój Profil', icon: UserIcon, description: 'View & edit your profile' },
  // { href: '/settings', label: 'Ustawienia', icon: Settings, description: 'Manage your account' }, // Settings can be part of profile or separate
];

export default function DashboardPage() {
  const userName = userData.name || 'Użytkowniku';

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Dumbbell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">WorkoutWise</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/profile/${userData.id}`} passHref>
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarImage src={userData.avatarUrl} alt={userName} data-ai-hint="profile avatar" />
                <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Wyloguj</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          {/* Welcome Section */}
          <section className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">
              Witaj, <span className="text-primary">{userName}</span>!
            </h2>
            <p className="text-muted-foreground">Gotowy na dzisiejszy trening?</p>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Left Column / Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions / Navigation Shortcuts */}
              <section>
                <h3 className="mb-4 text-xl font-semibold">Szybkie Akcje</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {navItems.map((item) => (
                    <Card key={item.href} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                          <item.icon className="mr-2 h-5 w-5 text-primary" />
                          {item.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-sm text-muted-foreground">{item.description}</p>
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
            </div>

            {/* Right Column / Sidebar Content */}
            <aside className="space-y-6 lg:col-span-1">
              {/* Last Workout Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Activity className="mr-2 h-5 w-5 text-primary" /> Ostatni trening
                  </CardTitle>
                  <CardDescription>{new Date(lastWorkout.date).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h4 className="font-semibold">{lastWorkout.name}</h4>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span><CalendarDays className="mr-1 inline-block h-4 w-4" />{lastWorkout.duration}</span>
                    <span><Flame className="mr-1 inline-block h-4 w-4" />{lastWorkout.calories}</span>
                    <span><Repeat className="mr-1 inline-block h-4 w-4" />{lastWorkout.exercises} ćwiczeń</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={lastWorkout.link}>Zobacz szczegóły</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Progress Stats Section */}
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
                      <span className="font-medium">{progressStats.currentWeight} ({progressStats.weightTrend})</span>
                    </div>
                    {/* Placeholder for weight chart or more detailed stats */}
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Treningi w tym tygodniu</span>
                      <span className="font-medium">{progressStats.workoutsThisWeek} / {progressStats.weeklyGoal}</span>
                    </div>
                    <Progress value={(progressStats.workoutsThisWeek / progressStats.weeklyGoal) * 100} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/statistics">Pełne statystyki</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Upcoming Reminders Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Bell className="mr-2 h-5 w-5 text-primary" /> Nadchodzące przypomnienia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingReminders.length > 0 ? (
                    <ul className="space-y-3">
                      {upcomingReminders.map((reminder, index) => (
                        <li key={reminder.id} className="text-sm">
                          <Link href={reminder.link} className="hover:text-primary transition-colors">
                            <p className="font-medium">{reminder.title}</p>
                            <p className="text-xs text-muted-foreground">{reminder.time}</p>
                          </Link>
                          {index < upcomingReminders.length - 1 && <Separator className="mt-3" />}
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
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

    