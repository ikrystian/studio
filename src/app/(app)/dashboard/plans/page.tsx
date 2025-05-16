
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Search, ListFilter, ArrowLeft, PlusCircle, Target, CalendarClock, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  goal: string; 
  duration: string; 
  icon?: React.ElementType;
}

// Placeholder for StretchHorizontal if not in lucide-react or if custom SVG is preferred
function StretchHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12h16"/><path d="M4 12l4-4m-4 4l4 4m12-4l-4-4m4 4l-4 4"/>
    </svg>
  );
}

const MOCK_TRAINING_PLANS: TrainingPlan[] = [
  {
    id: 'plan1',
    name: 'Siła Początkującego Herkulesa',
    description: 'Kompleksowy plan dla osób rozpoczynających przygodę z treningiem siłowym, skupiony na podstawowych ćwiczeniach wielostawowych.',
    goal: 'Budowa podstawowej siły i masy mięśniowej',
    duration: '8 tygodni',
    icon: Dumbbell,
  },
  {
    id: 'plan2',
    name: 'Kardio Spalacz Kalorii',
    description: 'Intensywny plan kardio interwałowego i aerobowego, mający na celu maksymalizację spalania kalorii i poprawę wydolności.',
    goal: 'Redukcja tkanki tłuszczowej i poprawa kondycji',
    duration: '6 tygodni',
    icon: Target,
  },
  {
    id: 'plan3',
    name: 'Elastyczność i Mobilność Zen',
    description: 'Plan skupiony na ćwiczeniach rozciągających, jodze i mobilizacji stawów, idealny dla poprawy zakresu ruchu i relaksu.',
    goal: 'Poprawa elastyczności i mobilności',
    duration: '4 tygodnie',
    icon: StretchHorizontalIcon,
  },
  {
    id: 'plan4',
    name: 'Domowy Trening Full Body',
    description: 'Efektywny plan treningowy całego ciała możliwy do wykonania w domu przy minimalnym sprzęcie lub bez niego.',
    goal: 'Utrzymanie formy i wszechstronny rozwój',
    duration: 'Ciągły',
    icon: Dumbbell,
  },
];

const PLAN_GOALS_FILTER_OPTIONS = [
    "Wszystkie", 
    "Budowa podstawowej siły i masy mięśniowej", 
    "Redukcja tkanki tłuszczowej i poprawa kondycji", 
    "Poprawa elastyczności i mobilności", 
    "Utrzymanie formy i wszechstronny rozwój"
];

export default function TrainingPlansPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedGoal, setSelectedGoal] = React.useState(PLAN_GOALS_FILTER_OPTIONS[0]);

  const filteredPlans = React.useMemo(() => {
    return MOCK_TRAINING_PLANS.filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            plan.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGoal = selectedGoal === PLAN_GOALS_FILTER_OPTIONS[0] || plan.goal === selectedGoal;
      return matchesSearch && matchesGoal;
    });
  }, [searchTerm, selectedGoal]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout */}
      {/* <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Panelu</span>
              </Link>
            </Button>
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Plany Treningowe</h1>
          </div>
          <Button asChild>
            <Link href="/dashboard/plans/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Nowy Plan
            </Link>
          </Button>
        </div>
      </header> */}

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
