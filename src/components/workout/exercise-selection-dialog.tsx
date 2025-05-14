
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Search, ListFilter, Dumbbell } from "lucide-react";

export interface Exercise {
  id: string;
  name: string;
  category: string;
}

interface ExerciseSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  availableExercises: Exercise[];
  onExercisesSelected: (selectedExercises: { id: string; name: string }[]) => void;
}

export const EXERCISE_CATEGORIES = [
  "Wszystkie",
  "Klatka",
  "Plecy",
  "Nogi",
  "Barki",
  "Ramiona",
  "Brzuch",
  "Cardio",
  "Całe ciało",
];

export function ExerciseSelectionDialog({
  isOpen,
  onOpenChange,
  availableExercises,
  onExercisesSelected,
}: ExerciseSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Wszystkie");
  const [checkedExerciseIds, setCheckedExerciseIds] = React.useState<Set<string>>(new Set());

  const filteredExercises = React.useMemo(() => {
    return availableExercises.filter((exercise) => {
      const matchesCategory =
        selectedCategory === "Wszystkie" || exercise.category === selectedCategory;
      const matchesSearchTerm = exercise.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearchTerm;
    });
  }, [availableExercises, searchTerm, selectedCategory]);

  const handleExerciseCheckChange = (exerciseId: string, checked: boolean) => {
    setCheckedExerciseIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(exerciseId);
      } else {
        newSet.delete(exerciseId);
      }
      return newSet;
    });
  };

  const handleAddSelected = () => {
    const selected = availableExercises.filter((ex) => checkedExerciseIds.has(ex.id))
      .map(ex => ({ id: ex.id, name: ex.name })); // Pass only id and name as per schema
    onExercisesSelected(selected);
    onOpenChange(false); // Close dialog
    setCheckedExerciseIds(new Set()); // Reset checks
    setSearchTerm("");
    setSelectedCategory("Wszystkie");
  };

  const handleClose = () => {
    onOpenChange(false);
    // Optionally reset internal state if dialog is cancelled
    // setCheckedExerciseIds(new Set());
    // setSearchTerm("");
    // setSelectedCategory("Wszystkie");
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Wybierz Ćwiczenia</DialogTitle>
          <DialogDescription>
            Przeglądaj, wyszukuj i wybierz ćwiczenia do swojego planu treningowego.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-4 my-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Szukaj ćwiczeń po nazwie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <ListFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtruj kategorię" />
            </SelectTrigger>
            <SelectContent>
              {EXERCISE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-grow border rounded-md p-1 mb-2">
          <div className="p-3">
            {filteredExercises.length > 0 ? (
              <ul className="space-y-3">
                {filteredExercises.map((exercise) => (
                  <li key={exercise.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={`ex-${exercise.id}`}
                      checked={checkedExerciseIds.has(exercise.id)}
                      onCheckedChange={(checked) =>
                        handleExerciseCheckChange(exercise.id, !!checked)
                      }
                    />
                    <Label htmlFor={`ex-${exercise.id}`} className="flex-grow cursor-pointer">
                      <span className="font-medium">{exercise.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        Kategoria: {exercise.category}
                      </span>
                    </Label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Dumbbell className="h-10 w-10 mb-2" />
                <p className="text-sm">
                  {searchTerm || selectedCategory !== "Wszystkie"
                    ? "Brak ćwiczeń pasujących do kryteriów."
                    : "Brak dostępnych ćwiczeń."}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Anuluj
          </Button>
          <Button onClick={handleAddSelected} disabled={checkedExerciseIds.size === 0}>
            Dodaj wybrane ({checkedExerciseIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
