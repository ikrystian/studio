
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Search, ListFilter, Dumbbell, CheckCircle } from "lucide-react";

export interface SelectableWorkout {
  id: string;
  name: string;
  type: string; // e.g., "Siłowy", "Cardio"
}

interface SelectWorkoutDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  availableWorkouts: SelectableWorkout[];
  onWorkoutSelected: (selectedWorkout: SelectableWorkout) => void;
}

const WORKOUT_TYPES = [
  "Wszystkie",
  "Siłowy",
  "Cardio",
  "Rozciąganie",
  "Mieszany",
  "Inny",
];

export function SelectWorkoutDialog({
  isOpen,
  onOpenChange,
  availableWorkouts,
  onWorkoutSelected,
}: SelectWorkoutDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("Wszystkie");
  const [currentlySelectedWorkout, setCurrentlySelectedWorkout] = React.useState<SelectableWorkout | null>(null);

  const filteredWorkouts = React.useMemo(() => {
    return availableWorkouts.filter((workout) => {
      const matchesType =
        selectedType === "Wszystkie" || workout.type === selectedType;
      const matchesSearchTerm = workout.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesType && matchesSearchTerm;
    });
  }, [availableWorkouts, searchTerm, selectedType]);

  const handleSelectAndClose = () => {
    if (currentlySelectedWorkout) {
      onWorkoutSelected(currentlySelectedWorkout);
    }
    onOpenChange(false);
    setCurrentlySelectedWorkout(null); // Reset selection
    setSearchTerm("");
    setSelectedType("Wszystkie");
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentlySelectedWorkout(null); // Reset selection on cancel
    setSearchTerm("");
    setSelectedType("Wszystkie");
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Wybierz Trening</DialogTitle>
          <DialogDescription>
            Przeglądaj, wyszukuj i wybierz istniejący trening do przypisania.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-4 my-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Szukaj treningów po nazwie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
        </div>

        <ScrollArea className="flex-grow border rounded-md p-1 mb-2 min-h-[200px]">
          <div className="p-3">
            {filteredWorkouts.length > 0 ? (
              <ul className="space-y-1">
                {filteredWorkouts.map((workout) => (
                  <li key={workout.id}>
                    <Button
                      variant={currentlySelectedWorkout?.id === workout.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto py-2 px-3"
                      onClick={() => setCurrentlySelectedWorkout(workout)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{workout.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Typ: {workout.type}
                        </span>
                      </div>
                      {currentlySelectedWorkout?.id === workout.id && (
                        <CheckCircle className="ml-auto h-5 w-5 text-primary-foreground" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                <Dumbbell className="h-10 w-10 mb-2" />
                <p className="text-sm text-center">
                  {searchTerm || selectedType !== "Wszystkie"
                    ? "Brak treningów pasujących do kryteriów."
                    : "Brak dostępnych treningów. Możesz je utworzyć w sekcji 'Rozpocznij Trening' -> '+ Nowy Trening'."}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Anuluj
          </Button>
          <Button onClick={handleSelectAndClose} disabled={!currentlySelectedWorkout}>
            Wybierz Trening
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    