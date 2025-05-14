
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dumbbell, Zap, StretchHorizontal, PlusCircle, Search, ListFilter, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
  title: 'Rozpocznij Trening | WorkoutWise',
  description: 'Wybierz istniejący trening lub utwórz nowy.',
};

// Simulated workout data - replace with actual data fetching
const availableWorkouts = [
  { id: 'wk1', name: 'Poranny Trening Siłowy', type: 'Siłowy', estimatedDuration: '60 min', icon: Dumbbell, description: 'Kompleksowy trening siłowy całego ciała.' },
  { id: 'wk2', name: 'Szybkie Cardio HIIT', type: 'Cardio', estimatedDuration: '30 min', icon: Zap, description: 'Intensywny trening interwałowy dla poprawy kondycji.' },
  { id: 'wk3', name: 'Wieczorne Rozciąganie', type: 'Rozciąganie', estimatedDuration: '20 min', icon: StretchHorizontal, description: 'Relaksacyjne ćwiczenia rozciągające na koniec dnia.' },
  { id: 'wk4', name: 'Trening Brzucha Express', type: 'Siłowy', estimatedDuration: '15 min', icon: Dumbbell, description: 'Skupiony na mięśniach brzucha, krótki i efektywny.' },
  { id: 'wk5', name: 'Długie Wybieganie', type: 'Cardio', estimatedDuration: '90 min', icon: Zap, description: 'Trening wytrzymałościowy na świeżym powietrzu.' },
];

// Helper to get the appropriate icon
const getWorkoutIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'siłowy':
      return <Dumbbell className="mr-2 h-5 w-5 text-primary" />;
    case 'cardio':
      return <Zap className="mr-2 h-5 w-5 text-primary" />;
    case 'rozciąganie':
      return <StretchHorizontal className="mr-2 h-5 w-5 text-primary" />;
    default:
      return <Dumbbell className="mr-2 h-5 w-5 text-primary" />;
  }
};

export default function StartWorkoutPage() {
  // TODO: Implement search and filter logic
  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredWorkouts = availableWorkouts.filter(workout =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Powrót do Dashboardu</span>
                </Link>
              </Button>
            <Dumbbell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">WorkoutWise</h1>
          </div>
          <Button asChild>
            <Link href="/workout/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Nowy Trening
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <section className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight mb-2">Wybierz Trening</h2>
            <p className="text-muted-foreground">
              Wybierz jeden z dostępnych treningów lub stwórz własny plan.
            </p>
          </section>

          {/* Search and Filter (Optional UI Placeholder) */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Szukaj treningów (np. Nazwa, Typ)..."
                className="w-full rounded-lg bg-card pl-10 pr-4 py-2 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <ListFilter className="mr-2 h-5 w-5" />
              Filtruj
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Workout List */}
          {filteredWorkouts.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-20rem)] pr-4"> {/* Adjust height as needed */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredWorkouts.map((workout) => (
                  <Card key={workout.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        {getWorkoutIcon(workout.type)}
                        {workout.name}
                      </CardTitle>
                      <CardDescription>{workout.type} - {workout.estimatedDuration}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">{workout.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        {/* This link will eventually lead to /workout/active/[workout.id] or similar */}
                        <Link href={`/workout/active/${workout.id}`}>
                          Rozpocznij
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="mt-10 flex flex-col items-center justify-center text-center">
              <Dumbbell className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Brak dostępnych treningów</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? `Nie znaleziono treningów pasujących do "${searchTerm}".` : "Nie masz jeszcze żadnych zapisanych treningów."}
              </p>
              <Button asChild size="lg">
                <Link href="/workout/create">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Utwórz Nowy Trening
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
