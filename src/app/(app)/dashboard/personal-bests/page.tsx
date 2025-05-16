
"use client";

import * as React from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Edit,
  Award,
  Trophy,
  CalendarDays,
  Loader2,
  Filter,
  Search as SearchIcon,
  LineChart as LineChartIcon,
  Star,
  Medal,
  Dumbbell,
  AlertTriangle, // Added for error alert
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { PersonalBestFormData } from "@/components/personal-bests/manage-pb-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Added AlertTitle, AlertDescription
import { INITIAL_MOCK_PBS, RECORD_TYPE_LABELS_PBS } from "@/lib/mockData";
import type { Exercise as SelectableExerciseType } from "@/components/workout/exercise-selection-dialog";


const ManagePbDialog = dynamic(() =>
  import("@/components/personal-bests/manage-pb-dialog").then((mod) => mod.ManagePbDialog), {
  loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});

const PbProgressionChartDialog = dynamic(() =>
  import("@/components/personal-bests/pb-progression-chart-dialog").then((mod) => mod.PbProgressionChartDialog), {
  loading: () => <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});


export interface PersonalBest {
  id: string;
  exerciseId: string;
  exerciseName: string;
  recordType: "weight_reps" | "max_reps" | "time_seconds" | "distance_km";
  value: {
    weight?: number | string;
    reps?: number;
    timeSeconds?: number;
    distanceKm?: number;
  };
  date: string; // ISO string
  notes?: string;
}

export default function PersonalBestsPage() {
  const { toast } = useToast();
  const [pageIsLoading, setPageIsLoading] = React.useState(true); 
  const [personalBests, setPersonalBests] = React.useState<PersonalBest[]>(INITIAL_MOCK_PBS);
  const [isManageDialogOpen, setIsManageDialogOpen] = React.useState(false);
  const [editingPb, setEditingPb] = React.useState<PersonalBest | null>(null);
  const [pbToDelete, setPbToDelete] = React.useState<PersonalBest | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedExerciseFilter, setSelectedExerciseFilter] = React.useState<string>("all");

  const [isPbChartDialogOpen, setIsPbChartDialogOpen] = React.useState(false);
  const [pbForChart, setPbForChart] = React.useState<PersonalBest | null>(null);

  const [availableExercises, setAvailableExercises] = React.useState<SelectableExerciseType[]>([]);
  const [exerciseFetchError, setExerciseFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadInitialData() {
      setPageIsLoading(true);
      setExerciseFetchError(null);
      try {
        // Fetch exercises
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Nie udało się załadować listy ćwiczeń. Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setAvailableExercises(data.data);
        } else {
          throw new Error(data.message || "Nie udało się załadować ćwiczeń (odpowiedź API bez sukcesu).");
        }
        // Set PBs (still from mock for now, but exercises are fetched)
        setPersonalBests(INITIAL_MOCK_PBS);

      } catch (error: any) {
        console.error("Error fetching exercises for PB page:", error);
        setExerciseFetchError(error.message || "Wystąpił nieznany błąd podczas ładowania ćwiczeń.");
        setAvailableExercises([]); // Ensure list is empty on error
        toast({ title: "Błąd Ładowania Danych", description: error.message || "Spróbuj odświeżyć stronę.", variant: "destructive" });
      } finally {
        setPageIsLoading(false);
      }
    }
    loadInitialData();
  }, [toast]);


  const filteredPbs = React.useMemo(() => {
    return personalBests
      .filter((pb) => {
        const matchesSearch = pb.exerciseName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesExercise =
          selectedExerciseFilter === "all" ||
          pb.exerciseId === selectedExerciseFilter;
        return matchesSearch && matchesExercise;
      })
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [personalBests, searchTerm, selectedExerciseFilter]);

  const handleSavePb = (data: PersonalBestFormData) => {
    const exercise = availableExercises.find( // Use fetched list
      (ex) => ex.id === data.exerciseId
    );
    if (!exercise) {
      toast({
        title: "Błąd",
        description: "Wybrane ćwiczenie nie istnieje.",
        variant: "destructive",
      });
      return;
    }

    const pbEntry: PersonalBest = {
      id: editingPb ? editingPb.id : uuidv4(),
      exerciseId: data.exerciseId,
      exerciseName: exercise.name,
      recordType: data.recordType,
      value: {
        weight: data.valueWeight === "" || data.valueWeight === undefined ? undefined : data.valueWeight,
        reps: data.valueReps === "" || data.valueReps === undefined ? undefined : Number(data.valueReps),
        timeSeconds:
          data.valueTimeSeconds === "" || data.valueTimeSeconds === undefined
            ? undefined
            : Number(data.valueTimeSeconds),
        distanceKm:
          data.valueDistanceKm === "" || data.valueDistanceKm === undefined
            ? undefined
            : Number(data.valueDistanceKm),
      },
      date: typeof data.date === "string" ? data.date : data.date.toISOString(),
      notes: data.notes,
    };

    if (editingPb) {
      setPersonalBests((prev) =>
        prev.map((p) => (p.id === editingPb.id ? pbEntry : p))
      );
      toast({
        title: "Rekord Zaktualizowany!",
        description: "Twój rekord został pomyślnie zaktualizowany.",
      });
    } else {
      setPersonalBests((prev) => [...prev, pbEntry]);
      toast({
        title: "Nowy Rekord Zapisany! Gratulacje!",
        description: `Ustanowiłeś nowy rekord w ${pbEntry.exerciseName}.`,
      });
    }
    setIsManageDialogOpen(false);
    setEditingPb(null);
  };

  const handleEditPb = (pb: PersonalBest) => {
    if (exerciseFetchError) {
        toast({ title: "Błąd Ładowania Ćwiczeń", description: "Nie można edytować rekordu, ponieważ lista ćwiczeń nie została załadowana.", variant: "destructive"});
        return;
    }
    setEditingPb(pb);
    setIsManageDialogOpen(true);
  };

  const openDeleteConfirmation = (pb: PersonalBest) => {
    setPbToDelete(pb);
  };

  const handleDeletePb = async () => {
    if (!pbToDelete) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); 
    setPersonalBests((prev) => prev.filter((p) => p.id !== pbToDelete.id));
    toast({
      title: "Rekord usunięty",
      description: "Rekord został pomyślnie usunięty.",
    });
    setPbToDelete(null);
    setIsDeleting(false);
  };

  const handleOpenPbChart = (pb: PersonalBest) => {
    setPbForChart(pb);
    setIsPbChartDialogOpen(true);
  };

  const formatPbValue = (pb: PersonalBest): string => {
    switch (pb.recordType) {
      case "weight_reps":
        return `${pb.value.weight || "-"} kg x ${pb.value.reps || "-"} powt.`;
      case "max_reps":
        return `${pb.value.reps || "-"} powt. ${
          pb.value.weight
            ? `(${pb.value.weight === "BW" ? "BW" : pb.value.weight + "kg"})`
            : "(BW)"
        }`;
      case "time_seconds":
        const totalSeconds = pb.value.timeSeconds || 0;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes > 0 ? `${minutes}m ` : ""}${seconds}s`;
      case "distance_km":
        return `${pb.value.distanceKm || "-"} km`;
      default:
        return "N/A";
    }
  };

  const uniqueExercisesInPbs = React.useMemo(() => {
    const exerciseSet = new Map<string, string>();
    personalBests.forEach((pb) => {
      if (!exerciseSet.has(pb.exerciseId)) {
        exerciseSet.set(pb.exerciseId, pb.exerciseName);
      }
    });
    return Array.from(exerciseSet.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [personalBests]);

  if (pageIsLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            <p className="mt-4 text-muted-foreground">Ładowanie rekordów życiowych...</p>
        </div>
      );
  }

  return (
    <>
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto space-y-8">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (exerciseFetchError) {
                    toast({ title: "Błąd Ładowania Ćwiczeń", description: "Nie można dodać rekordu, ponieważ lista ćwiczeń nie została załadowana.", variant: "destructive"});
                    return;
                }
                setEditingPb(null);
                setIsManageDialogOpen(true);
              }}
              disabled={pageIsLoading || !!exerciseFetchError}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Dodaj Rekord
            </Button>
          </div>
          <ManagePbDialog
            isOpen={isManageDialogOpen}
            onOpenChange={setIsManageDialogOpen}
            onSave={handleSavePb}
            initialData={editingPb}
            availableExercises={availableExercises} // Pass fetched exercises
          />

          <PbProgressionChartDialog
            isOpen={isPbChartDialogOpen}
            onOpenChange={setIsPbChartDialogOpen}
            pbData={pbForChart}
          />

          {pbToDelete && (
            <AlertDialog
              open={!!pbToDelete}
              onOpenChange={() => setPbToDelete(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usunąć rekord?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz usunąć ten rekord (
                    {pbToDelete.exerciseName})? Tej akcji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Anuluj
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeletePb}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : null}
                    Potwierdź i usuń
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          {exerciseFetchError && (
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Błąd Ładowania Listy Ćwiczeń</AlertTitle>
                <AlertDescription>
                    {exerciseFetchError} Niektóre funkcje mogą być ograniczone. Spróbuj odświeżyć stronę.
                </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" /> Filtruj Rekordy
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Szukaj po nazwie ćwiczenia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedExerciseFilter}
                onValueChange={setSelectedExerciseFilter}
              >
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Filtruj ćwiczenie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie ćwiczenia</SelectItem>
                  {uniqueExercisesInPbs.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" /> Twoje Osobiste
                Rekordy
              </CardTitle>
              <CardDescription>
                Przeglądaj i zarządzaj swoimi najlepszymi osiągnięciami.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPbs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Brak zapisanych rekordów.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || selectedExerciseFilter !== "all"
                      ? "Nie znaleziono rekordów pasujących do kryteriów."
                      : "Kliknij 'Dodaj Rekord', aby rozpocząć śledzenie swoich PB!"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[25%]">Ćwiczenie</TableHead>
                        <TableHead className="w-[20%]">Rekord</TableHead>
                        <TableHead className="w-[15%]">Typ Rekordu</TableHead>
                        <TableHead className="w-[15%] text-center">
                          Data
                        </TableHead>
                        <TableHead className="w-[10%] text-center">
                          Progresja
                        </TableHead>
                        <TableHead className="text-right w-[15%]">
                          Akcje
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPbs.map((pb) => (
                        <TableRow key={pb.id}>
                          <TableCell className="font-medium">
                            {pb.exerciseName}
                          </TableCell>
                          <TableCell>{formatPbValue(pb)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {RECORD_TYPE_LABELS_PBS[pb.recordType]}
                          </TableCell>
                          <TableCell className="text-center">
                            {format(parseISO(pb.date), "dd MMM yyyy", {
                              locale: pl,
                            })}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenPbChart(pb)}
                              title="Zobacz progresję (symulacja)"
                            >
                              <LineChartIcon className="h-4 w-4" />
                              <span className="sr-only">Zobacz progresję</span>
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPb(pb)}
                              className="mr-1"
                              title="Edytuj rekord"
                              disabled={!!exerciseFetchError}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edytuj</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteConfirmation(pb)}
                              className="text-destructive hover:text-destructive"
                              title="Usuń rekord"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Usuń</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
            {filteredPbs.length > 0 && (
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Wyświetlanie {filteredPbs.length} rekordów.
                </p>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Moje Odznaki (Symulacja)
              </CardTitle>
              <CardDescription>
                Przeglądaj zdobyte odznaki za osiągnięcia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Trophy className="h-4 w-4" />
                <AlertTitle>Funkcja w budowie</AlertTitle>
                <AlertDescription>
                  System odznak i nagród za osiągnięcia (w tym za rekordy
                  życiowe) zostanie dodany w przyszłości.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {[
                  { name: "Mistrz Przysiadu: 140kg", icon: Dumbbell },
                  { name: "Klub 100kg: Wyciskanie", icon: Award },
                  { name: "Wytrwały Biegacz: 30 min", icon: Medal },
                  { name: "Siłacz Podciągania: 15xBW", icon: Star },
                ].map((badge, idx) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center text-center p-3 border rounded-lg bg-muted/50"
                    >
                      <Icon className="h-10 w-10 text-amber-500 mb-2" />
                      <p className="text-xs font-medium">{badge.name}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

