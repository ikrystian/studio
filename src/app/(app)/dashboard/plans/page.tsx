
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Search, ListFilter, ArrowLeft, PlusCircle, Target, CalendarClock, BookOpen, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
// import { TrainingPlansPageSkeleton } from '@/components/plans/TrainingPlansPageSkeleton'; // Removed for no-skeleton approach
import { MOCK_TRAINING_PLANS_LIST } from '@/lib/mockData';

// MOCK BACKEND LOGIC: Training plans (MOCK_TRAINING_PLANS_LIST) are imported from `src/lib/mockData.ts`.
// Filtering by search term and goal is performed client-side on this array.
// There are no actual backend calls for fetching or manipulating plan data on this list page.

interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  goal: string;
  duration: string;
  icon?: React.ElementType;
}

function StretchHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12h16"/><path d="M4 12l4-4m-4 4l4 4m12-4l-4-4m4 4l-4 4"/>
    </svg>
  );
}

const PLAN_GOALS_FILTER_OPTIONS = [
    "Wszystkie",
    "Budowa podstawowej siły i masy mięśniowej",
    "Redukcja tkanki tłuszczowej i poprawa kondycji",
    "Poprawa elastyczności i mobilności",
    "Utrzymanie formy i wszechstronny rozwój"
];

export default function TrainingPlansPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedGoal, setSelectedGoal] = React.useState(PLAN_GOALS_FILTER_OPTIONS[0]);

  React.useEffect(() => {
    // MOCK BACKEND LOGIC: Simulates fetching data. In a real app, this would be an API call.
    // For this prototype, data is already available via import.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0); // Set to 0 for faster actual load
    return () => clearTimeout(timer);
  }, []);

  const filteredPlans = React.useMemo(() => {
    // MOCK BACKEND LOGIC: Client-side filtering of `MOCK_TRAINING_PLANS_LIST`.
    return MOCK_TRAINING_PLANS_LIST.filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            plan.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGoal = selectedGoal === PLAN_GOALS_FILTER_OPTIONS[0] || plan.goal === selectedGoal;
      return matchesSearch && matchesGoal;
    });
  }, [searchTerm, selectedGoal]);

  if (isLoading) {
    // return <TrainingPlansPageSkeleton />; // Removed for no-skeleton approach
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Wczytywanie...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <section className="mb-6 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-1">Odkryj Plany Treningowe</h2>
                <p className="text-sm text-muted-foreground">
                Znajdź idealny plan dla siebie lub stwórz własny, dopasowany do Twoich celów.
                </p>
            </div>
            <Button asChild>
                <Link href="/dashboard/plans/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Nowy Plan
                </Link>
            </Button>
          </section>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Szukaj planów (np. nazwa, opis)..."
                className="w-full rounded-md bg-card pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger className="w-full sm:w-auto min-w-[220px]">
                <ListFilter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtruj po celu" />
              </SelectTrigger>
              <SelectContent>
                {PLAN_GOALS_FILTER_OPTIONS.map(goal => (
                  <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-6" />

          {filteredPlans.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-25rem)] pr-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlans.map((plan) => {
                  const IconComponent = plan.icon || Dumbbell;
                  return (
                    <Card key={plan.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <IconComponent className="mr-3 h-6 w-6 text-primary" />
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <Target className="h-3 w-3" /> Cel: {plan.goal}
                        </CardDescription>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <CalendarClock className="h-3 w-3" /> Czas trwania: {plan.duration}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-4">{plan.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full">
                          {/* MOCK BACKEND LOGIC: Clicking navigates to a detail page. The detail page
                              will then "fetch" details for this planId from MOCK_DETAILED_TRAINING_PLANS. */}
                          <Link href={`/dashboard/plans/${plan.id}`}>
                            Zobacz szczegóły
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="mt-10 flex flex-col items-center justify-center text-center">
              <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Brak Dostępnych Planów</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedGoal !== PLAN_GOALS_FILTER_OPTIONS[0] ? `Nie znaleziono planów pasujących do Twoich kryteriów.` : "Nie utworzono jeszcze żadnych planów treningowych."}
              </p>
              <Button asChild size="lg">
                <Link href="/dashboard/plans/create">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Utwórz Nowy Plan
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
