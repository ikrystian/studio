
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PlusCircle, Save, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Re-using categories from exercise selection could be an option
// For now, let's define workout types, as they are more general for a workout itself.
const WORKOUT_TYPES = [
  "Siłowy",
  "Cardio",
  "Rozciąganie",
  "Mieszany",
  "Inny",
];

const quickCreateWorkoutSchema = z.object({
  name: z.string().min(1, "Nazwa treningu jest wymagana."),
  workoutType: z.string().optional(),
});

export type QuickCreateWorkoutFormData = z.infer<typeof quickCreateWorkoutSchema>;

interface QuickCreateWorkoutDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // Callback passes name and type, parent will generate ID and add to list
  onWorkoutCreated: (data: QuickCreateWorkoutFormData) => void;
}

export function QuickCreateWorkoutDialog({
  isOpen,
  onOpenChange,
  onWorkoutCreated,
}: QuickCreateWorkoutDialogProps) {
  const { toast } = useToast();
  const form = useForm<QuickCreateWorkoutFormData>({
    resolver: zodResolver(quickCreateWorkoutSchema),
    defaultValues: {
      name: "",
      workoutType: "Mieszany",
    },
  });

  React.useEffect(() => {
    if (!isOpen) {
      form.reset({ name: "", workoutType: "Mieszany" });
    }
  }, [isOpen, form]);

  function onSubmit(values: QuickCreateWorkoutFormData) {
    onWorkoutCreated(values); 
    // Parent component (CreateTrainingPlanPage) will handle closing the dialog
    // and showing a toast, after it has processed the new workout.
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            Szybkie Tworzenie Nowego Treningu
          </DialogTitle>
          <DialogDescription>
            Wprowadź nazwę nowego treningu i opcjonalnie wybierz jego typ.
            Zostanie on dodany do globalnej listy dostępnych treningów i przypisany do wybranego dnia w planie.
            Szczegółowe ćwiczenia dodasz później, edytując ten trening.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa nowego treningu</FormLabel>
                  <FormControl>
                    <Input placeholder="Np. Dzień A - Siła Górna" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workoutType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ Treningu (opcjonalnie)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ treningu..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WORKOUT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  <XCircle className="mr-2 h-4 w-4" /> Anuluj
                </Button>
              </DialogClose>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Stwórz i Dodaj do Planu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
