
"use client";

import * as React from "react";
import Link from "next/link";
import { format, parseISO, isValid, startOfDay, endOfDay } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ArrowLeft,
  History as HistoryIcon,
  Search,
  ListFilter,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  Dumbbell,
  Activity,
  BarChart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { RecordedSet, ExerciseInWorkout } from "../workout/active/[workoutId]/page"; // Assuming these types are exported

// Assuming DifficultyRating enum is exported from summary page or defined globally
enum DifficultyRating {
  BardzoLatwy = "Bardzo Łatwy",
  Latwy = "Łatwy",
  Sredni = "Średni",
  Trudny = "Trudny",
  BardzoTrudny = "Bardzo Trudny",
  Ekstremalny = "Ekstremalny",
}

export interface HistoricalWorkoutSession {
  id: string; // Unique session ID
  workoutId: string;
  workoutName: string;
  workoutType: string; // e.g., Siłowy, Cardio, Mieszany
  startTime: string; // ISO
  endTime: string; // ISO
  totalTimeSeconds: number;
  recordedSets: Record<string, RecordedSet[]>; // exerciseId -> sets
  exercises: ExerciseInWorkout[];
  difficulty?: DifficultyRating;
  generalNotes?: string;
  calculatedTotalVolume: number;
}

const MOCK_HISTORY_SESSIONS: HistoricalWorkoutSession[] = [
  {
    id: "hist1",
    workoutId: "wk1",
    workoutName: "Poranny Trening Siłowy",
    workoutType: "Siłowy",
    startTime: "2024-07-25T08:00:00.000Z",
    endTime: "2024-07-25T09:00:00.000Z",
    totalTimeSeconds: 3600,
    recordedSets: {
      ex1: [{ setNumber: 1, weight: "60", reps: "10", notes: "Good form" }, { setNumber: 2, weight: "65", reps: "8" }],
      ex2: [{ setNumber: 1, weight: "100", reps: "5" }],
    },
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej", defaultSets: 3, defaultReps: "8-10", defaultRest: 90 },
      { id: "ex2", name: "Przysiady ze sztangą", defaultSets: 4, defaultReps: "10-12", defaultRest: 120 },
    ],
    difficulty: DifficultyRating.Sredni,
    generalNotes: "Feeling strong today!",
    calculatedTotalVolume: (60*10) + (65*8) + (100*5),
  },
  {
    id: "hist2",
    workoutId: "wk2",
    workoutName: "Szybkie Cardio HIIT",
    workoutType: "Cardio",
    startTime: "2024-07-27T17:30:00.000Z",
    endTime: "2024-07-27T18:00:00.000Z",
    totalTimeSeconds: 1800,
    recordedSets: {
      ex6: [{ setNumber: 1, weight: "N/A", reps: "30 min" }],
    },
    exercises: [{ id: "ex6", name: "Bieg na bieżni (30 min)", defaultSets: 1, defaultReps: "30 min", defaultRest: 0 }],
    difficulty: DifficultyRating.Trudny,
    generalNotes: "Tough session, pushed hard.",
    calculatedTotalVolume: 0,
  },
   {
    id: "hist3",
    workoutId: "wk1",
    workoutName: "Poranny Trening Siłowy", // Same name, different date
    startTime: "2024-07-29T08:15:00.000Z", // Problematic date from error log
    endTime: "2024-07-29T09:20:00.000Z",
    totalTimeSeconds: 3900,
    recordedSets: {
      ex1: [{ setNumber: 1, weight: "65", reps: "10" }, { setNumber: 2, weight: "70", reps: "8"}, { setNumber: 3, weight: "70", reps: "7"}],
      ex2: [{ setNumber: 1, weight: "100", reps: "6" }, { setNumber: 2, weight: "105", reps: "5"}],
      ex4: [{ setNumber: 1, weight: "BW", reps: "8" }, { setNumber: 2, weight: "BW", reps: "7"}],
    },
    exercises: [
      { id: "ex1", name: "Wyciskanie sztangi na ławce płaskiej" },
      { id: "ex2", name: "Przysiady ze sztangą" },
      { id: "ex4", name: "Podciąganie na drążku" },
    ],
    difficulty: DifficultyRating.Sredni,
    workoutType: "Siłowy",
    calculatedTotalVolume: (65*10) + (70*8) + (70*7) + (100*6) + (105*5), // Assuming BW is not numeric volume
  },
];

const WORKOUT_TYPES = ["Wszystkie", "Siłowy", "Cardio", "Mieszany", "Rozciąganie", "Inny"];
const ITEMS_PER_PAGE = 5;

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  return `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
};

// Small component to handle client-side date formatting
const ClientFormattedDate = ({ isoDateString, formatString }: { isoDateString: string, formatString: string }) => {
  const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setFormattedDate(format(parseISO(isoDateString), formatString, { locale: pl }));
    } catch (error) {
      console.error("Error formatting date:", error);
      setFormattedDate("Nieprawidłowa data");
    }
  }, [isoDateString, formatString]);

  return <>{formattedDate || "Ładowanie daty..."}</>; // Show loading or placeholder
};


export default function WorkoutHistoryPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("Wszystkie");
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState(1);

  const filteredSessions = React.useMemo(() => {
    return MOCK_HISTORY_SESSIONS.filter((session) => {
      const sessionDate = parseISO(session.startTime);
      if (!isValid(sessionDate)) return false;

      const matchesSearch = session.workoutName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "Wszystkie" || session.workoutType === selectedType;
      
      let matchesDate = true;
      if (startDate && sessionDate < startOfDay(startDate)) {
        matchesDate = false;
      }
      if (endDate && sessionDate > endOfDay(endDate)) {
        matchesDate = false;
      }
      return matchesSearch && matchesType && matchesDate;
    }).sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()); // Sort by newest first
  }, [searchTerm, selectedType, startDate, endDate]);

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    setCurrentPage(1);
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    setCurrentPage(1);
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case "Siłowy": return <Dumbbell className="h-4 w-4 text-muted-foreground" />;
      case "Cardio": return <Activity className="h-4 w-4 text-muted-foreground" />;
      case "Rozciąganie": return <BarChart className="h-4 w-4 text-muted-foreground transform rotate-90" />; // Placeholder
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Dashboardu</span>
              </Link>
            </Button>
            <HistoryIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Historia Treningów</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtruj Historię</CardTitle>
              <CardDescription>Zawęź listę wyświetlanych treningów.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Szukaj po nazwie..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <ListFilter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtruj typ" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <div> {/* Placeholder for specific type filter if needed */} </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: pl }) : <span>Data od</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      disabled={(date) => (endDate ? date > endDate : false) || date > new Date()}
                      initialFocus
                      locale={pl}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: pl }) : <span>Data do</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      disabled={(date) => (startDate ? date < startDate : false) || date > new Date()}
                      initialFocus
                      locale={pl}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />
          
          {paginatedSessions.length > 0 ? (
            <>
              <ScrollArea className="h-[calc(100vh-28rem)] "> {/* Adjust height as needed */}
                <div className="space-y-4 pr-4">
                {paginatedSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{session.workoutName}</CardTitle>
                      <CardDescription>
                        Data: <ClientFormattedDate isoDateString={session.startTime} formatString="PPPp" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        {getWorkoutTypeIcon(session.workoutType)}
                        <span className="ml-2">Typ: {session.workoutType}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="ml-2">Czas trwania: {formatTime(session.totalTimeSeconds)}</span>
                      </div>
                      {session.difficulty && (
                        <div className="flex items-center text-muted-foreground">
                            <BarChart className="h-4 w-4" /> {/* Placeholder for difficulty icon */}
                            <span className="ml-2">Trudność: {session.difficulty}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/history/${session.id}`}>Zobacz szczegóły</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                </div>
              </ScrollArea>
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Poprzednia
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Strona {currentPage} z {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Następna <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-10 flex flex-col items-center justify-center text-center">
              <HistoryIcon className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Brak Zapisanych Treningów</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedType !== "Wszystkie" || startDate || endDate
                  ? "Nie znaleziono treningów pasujących do Twoich kryteriów."
                  : "Nie masz jeszcze żadnych zapisanych sesji treningowych. Zacznij trenować, aby zobaczyć je tutaj!"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
