
"use client";

import * as React from "react";
import Link from "next/link";
import { format, parseISO, isValid, startOfDay, endOfDay, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, getDay, isSameDay, isSameMonth } from "date-fns";
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
  RotateCcw, 
  FileDown, 
  Loader2,
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
import { useToast } from "@/hooks/use-toast";
// MOCK BACKEND LOGIC: All historical workout sessions (MOCK_HISTORY_SESSIONS) are sourced from an in-memory array
// in `src/lib/mockData.ts`. Filtering and pagination are performed client-side on this array.
// Exporting to CSV is also a client-side operation based on the currently filtered data.
// There are no actual backend calls for fetching or manipulating history data on this page.
import { MOCK_HISTORY_SESSIONS, type HistoricalWorkoutSession, type RecordedSet, type ExerciseInWorkout } from "@/lib/mockData";
import { WorkoutHistoryPageSkeleton } from "@/components/history/WorkoutHistoryPageSkeleton";


const WORKOUT_TYPES = ["Wszystkie", "Siłowy", "Cardio", "Mieszany", "Rozciąganie", "Inny"];
const ITEMS_PER_PAGE = 5; 

const WORKOUT_TYPE_COLORS: Record<string, string> = {
  "Siłowy": "bg-blue-500",
  "Cardio": "bg-green-500",
  "Rozciąganie": "bg-yellow-500",
  "Mieszany": "bg-purple-500",
  "Inny": "bg-gray-500",
  "default": "bg-slate-400", 
};

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  return `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
};

export default function WorkoutHistoryPage() {
  const { toast } = useToast();
  const [allSessions, setAllSessions] = React.useState<HistoricalWorkoutSession[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("Wszystkie");
  const [filterStartDate, setFilterStartDate] = React.useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = React.useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState(1);

  const [calendarViewMonth, setCalendarViewMonth] = React.useState(new Date());

  React.useEffect(() => {
    setIsLoading(true);
    // MOCK BACKEND LOGIC: Simulates fetching data from MOCK_HISTORY_SESSIONS.
    setTimeout(() => {
      setAllSessions(MOCK_HISTORY_SESSIONS);
      setIsLoading(false);
    }, 750); 
  }, []);


  const filteredSessions = React.useMemo(() => {
    // MOCK BACKEND LOGIC: Client-side filtering of the `allSessions` array.
    return allSessions.filter((session) => {
      const sessionDate = parseISO(session.startTime);
      if (!isValid(sessionDate)) return false; 

      const matchesSearch = session.workoutName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "Wszystkie" || session.workoutType === selectedType;
      
      let matchesDate = true;
      if (filterStartDate && sessionDate < startOfDay(filterStartDate)) {
        matchesDate = false;
      }
      if (filterEndDate && sessionDate > endOfDay(filterEndDate)) {
        matchesDate = false;
      }
      return matchesSearch && matchesType && matchesDate;
    }).sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()); 
  }, [allSessions, searchTerm, selectedType, filterStartDate, filterEndDate]);

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
    setFilterStartDate(date);
    setCurrentPage(1);
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    setFilterEndDate(date);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("Wszystkie");
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
    setCurrentPage(1);
    toast({ title: "Filtry wyczyszczone", description: "Wyświetlono wszystkie historyczne sesje." });
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case "Siłowy": return <Dumbbell className="h-4 w-4 text-muted-foreground" />;
      case "Cardio": return <Activity className="h-4 w-4 text-muted-foreground" />;
      case "Rozciąganie": return <BarChart className="h-4 w-4 text-muted-foreground transform rotate-90" />; 
      default: return <FileText className="h-4 w-4 text-muted-foreground" />; 
    }
  };
  
  // MOCK BACKEND LOGIC: CSV export is entirely client-side based on currently filtered sessions.
  const handleExportToCSV = () => {
    if (filteredSessions.length === 0) {
        toast({ title: "Brak danych do eksportu", variant: "destructive" });
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = [
        "ID Sesji", "Nazwa Treningu", "Typ Treningu", "Data Rozpoczęcia", "Data Zakończenia", 
        "Całkowity Czas (s)", "Całkowita Objętość (kg)", "Trudność", "Notatki Ogólne",
        "Nazwa Ćwiczenia", "Numer Serii", "Ciężar", "Powtórzenia/Czas", "RPE", "Notatki do Serii"
    ];
    csvContent += headers.join(";") + "\r\n";

    filteredSessions.forEach(session => {
        session.exercises.forEach(exercise => {
            const sets = session.recordedSets[exercise.id] || [];
            if (sets.length === 0) { 
                 const row = [
                    session.id, session.workoutName, session.workoutType, 
                    format(parseISO(session.startTime), "yyyy-MM-dd HH:mm:ss"), 
                    format(parseISO(session.endTime), "yyyy-MM-dd HH:mm:ss"),
                    session.totalTimeSeconds.toString(), session.calculatedTotalVolume.toString(),
                    session.difficulty || "", session.generalNotes || "",
                    exercise.name, "", "", "", "", "" 
                ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(";");
                csvContent += row + "\r\n";
            } else {
                sets.forEach(set => {
                    const row = [
                        session.id, session.workoutName, session.workoutType, 
                        format(parseISO(session.startTime), "yyyy-MM-dd HH:mm:ss"), 
                        format(parseISO(session.endTime), "yyyy-MM-dd HH:mm:ss"),
                        session.totalTimeSeconds.toString(), session.calculatedTotalVolume.toString(),
                        session.difficulty || "", session.generalNotes || "",
                        exercise.name, set.setNumber.toString(), String(set.weight), String(set.reps), 
                        set.rpe?.toString() || "", set.notes || ""
                    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(";"); 
                    csvContent += row + "\r\n";
                });
            }
        });
         if (session.exercises.length === 0) { 
             const row = [
                session.id, session.workoutName, session.workoutType, 
                format(parseISO(session.startTime), "yyyy-MM-dd HH:mm:ss"), 
                format(parseISO(session.endTime), "yyyy-MM-dd HH:mm:ss"),
                session.totalTimeSeconds.toString(), session.calculatedTotalVolume.toString(),
                session.difficulty || "", session.generalNotes || "",
                "", "", "", "", "", "" 
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(";");
            csvContent += row + "\r\n";
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historia_treningow.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Eksport zakończony", description: "Dane historii zostały pobrane jako CSV." });
  };

  const firstDayCurrentMonth = startOfMonth(calendarViewMonth);
  const lastDayCurrentMonth = endOfMonth(calendarViewMonth);
  const daysInMonth = React.useMemo(() => eachDayOfInterval({ start: firstDayCurrentMonth, end: lastDayCurrentMonth }), [firstDayCurrentMonth, lastDayCurrentMonth]);
  
  let startingDayOfWeek = getDay(firstDayCurrentMonth); 
  if (startingDayOfWeek === 0) startingDayOfWeek = 7; 
  const daysBeforeMonth = Array.from({ length: startingDayOfWeek - 1 });

  const workoutsByDate = React.useMemo(() => {
    // MOCK BACKEND LOGIC: Groups workout types by date for calendar display, using client-side `allSessions` data.
    const map = new Map<string, string[]>(); 
    allSessions.forEach(session => {
      try {
        if (!session.startTime || !isValid(parseISO(session.startTime))) {
            console.warn("Invalid startTime for session for calendar:", session.id, session.startTime);
            return; 
        }
        const dateStr = format(parseISO(session.startTime), "yyyy-MM-dd");
        const types = map.get(dateStr) || [];
        if (!types.includes(session.workoutType)) {
          types.push(session.workoutType);
        }
        map.set(dateStr, types);
      } catch (e) {
        console.error("Error processing session for calendar:", session.id, session.startTime, e);
      }
    });
    return map;
  }, [allSessions]);


  if (isLoading) {
    return <WorkoutHistoryPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Panelu</span>
              </Link>
            </Button>
            <HistoryIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Historia Treningów</h1>
          </div>
           <Button onClick={handleExportToCSV} variant="outline" size="sm" disabled={filteredSessions.length === 0}>
            <FileDown className="mr-2 h-4 w-4" /> Eksportuj do CSV
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Kalendarz Aktywności</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <Button variant="outline" size="icon" onClick={() => setCalendarViewMonth(subMonths(calendarViewMonth, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">
                        {format(calendarViewMonth, "LLLL yyyy", { locale: pl })}
                    </h3>
                    <Button variant="outline" size="icon" onClick={() => setCalendarViewMonth(addMonths(calendarViewMonth, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-7 gap-px border-l border-t bg-border">
                    {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map(dayLabel => (
                        <div key={dayLabel} className="py-2 text-center text-xs font-medium text-muted-foreground bg-card border-b border-r">{dayLabel}</div>
                    ))}
                    {daysBeforeMonth.map((_, i) => (
                         <div key={`empty-start-${i}`} className="bg-muted/30 border-b border-r min-h-[60px] sm:min-h-[80px]"></div>
                    ))}
                    {daysInMonth.map(day => {
                        const dayStr = format(day, "yyyy-MM-dd");
                        const workoutTypesOnDay = workoutsByDate.get(dayStr) || [];
                        return (
                            <div 
                                key={day.toString()} 
                                className={cn(
                                    "p-1.5 sm:p-2 border-b border-r min-h-[60px] sm:min-h-[80px] text-xs relative transition-colors",
                                    isSameMonth(day, calendarViewMonth) ? "bg-card hover:bg-muted/50" : "bg-muted/30", 
                                    !isSameMonth(day, calendarViewMonth) && "text-muted-foreground/50"
                                )}
                            >
                                <span className={cn("font-medium", isSameDay(day, new Date()) && "text-primary font-bold underline")}>
                                    {format(day, "d")}
                                </span>
                                <div className="absolute bottom-1 left-1 right-1 flex justify-center space-x-1">
                                    {workoutTypesOnDay.slice(0,3).map((type, index) => ( 
                                        <div key={index} title={type} className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${WORKOUT_TYPE_COLORS[type] || WORKOUT_TYPE_COLORS.default}`}></div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {Array.from({ length: (7 - (daysBeforeMonth.length + daysInMonth.length) % 7) % 7 }).map((_, i) => (
                       <div key={`empty-end-${i}`} className="bg-muted/30 border-b border-r min-h-[60px] sm:min-h-[80px]"></div>
                    ))}
                </div>
            </CardContent>
          </Card>

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
                 <Button onClick={clearFilters} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" /> Wyczyść filtry
                 </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {filterStartDate ? format(filterStartDate, "PPP", { locale: pl }) : <span>Data od</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filterStartDate}
                      onSelect={handleStartDateChange}
                      disabled={(date) => (filterEndDate ? date > filterEndDate : false) || date > new Date()}
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
                        !filterEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {filterEndDate ? format(filterEndDate, "PPP", { locale: pl }) : <span>Data do</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filterEndDate}
                      onSelect={handleEndDateChange}
                      disabled={(date) => (filterStartDate ? date < filterStartDate : false) || date > new Date()}
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
              <ScrollArea className="h-[calc(100vh-40rem)] "> 
                <div className="space-y-4 pr-4">
                {paginatedSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{session.workoutName}</CardTitle>
                      <CardDescription>
                         Data: {isValid(parseISO(session.startTime)) ? format(parseISO(session.startTime), "PPPp", { locale: pl }) : "Nieprawidłowa data"}
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
                            <BarChart className="h-4 w-4" /> 
                            <span className="ml-2">Trudność: {session.difficulty}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="gap-2">
                       <Button asChild variant="ghost" size="sm" className="flex-1 justify-start text-primary hover:text-primary/90 disabled:text-muted-foreground">
                        {/* MOCK BACKEND LOGIC: "Powtórz" functionality passes the workout ID and session ID
                            to the active workout page, which then simulates loading this past session. */}
                        <Link href={`/dashboard/workout/active/${session.workoutId}?repeatSessionId=${session.id}`}>
                            <RotateCcw className="mr-2 h-4 w-4"/> Powtórz
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/dashboard/history/${session.id}`}>Zobacz szczegóły</Link>
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
                {searchTerm || selectedType !== "Wszystkie" || filterStartDate || filterEndDate
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
