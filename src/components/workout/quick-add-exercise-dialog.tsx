
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PlusCircle, Save, XCircle, Loader2 } from "lucide-react"; // Added Loader2

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
import { EXERCISE_CATEGORIES } from "./exercise-selection-dialog"; 
import { useToast } from "@/hooks/use-toast";
import type { SelectableExerciseType } from "./exercise-selection-dialog";

const quickAddExerciseSchema = z.object({
  name: z.string().min(1, "Nazwa ćwiczenia jest wymagana.").max(100, "Nazwa ćwiczenia zbyt długa."),
  category: z.string().optional(),
});

export type QuickAddExerciseFormData = z.infer<typeof quickAddExerciseSchema>;

interface QuickAddExerciseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onExerciseCreated: (newExercise: SelectableExerciseType) => void;
}

export function QuickAddExerciseDialog({
  isOpen,
  onOpenChange,
  onExerciseCreated,
}: QuickAddExerciseDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<QuickAddExerciseFormData>({
    resolver: zodResolver(quickAddExerciseSchema),
    defaultValues: {
      name: "",
      category: "Inne", 
    },
  });

  React.useEffect(() => {
    if (!isOpen) {
      form.reset({ name: "", category: "Inne" });
      setIsSaving(false);
    }
  }, [isOpen, form]);

  async function onSubmit(values: QuickAddExerciseFormData) {
    setIsSaving(true);
    try {
      const response = await fetch('/api/exercises/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          category: values.category || 'Inne',
        }),
      });
      const result = await response.json();

      if (response.ok && result.success && result.exercise) {
        onExerciseCreated(result.exercise);
        // Toast will be shown by the parent component (CreateWorkoutPage)
        // to confirm it's added to the current workout and master list.
        onOpenChange(false);
      } else {
        toast({
          title: "Błąd zapisu ćwiczenia",
          description: result.message || "Nie udało się zapisać nowego ćwiczenia w bazie danych.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error calling /api/exercises/create:", error);
      toast({
        title: "Błąd sieci",
        description: "Nie udało się połączyć z serwerem, aby zapisać ćwiczenie.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            Szybkie Dodawanie Nowego Ćwiczenia
          </DialogTitle>
          <DialogDescription>
            Wprowadź nazwę nowego ćwiczenia i opcjonalnie wybierz kategorię.
            Zostanie ono zapisane w głównej bazie ćwiczeń i dodane do obecnego treningu.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa nowego ćwiczenia</FormLabel>
                  <FormControl>
                    <Input placeholder="Np. Pompki diamentowe" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoria (opcjonalnie)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz kategorię..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXERCISE_CATEGORIES.filter(cat => cat !== "Wszystkie").map((cat) => ( // Filter out "Wszystkie" as it's a filter option, not a real category
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
                <Button type="button" variant="outline" disabled={isSaving}>
                  <XCircle className="mr-2 h-4 w-4" /> Anuluj
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Zapisz i Dodaj do Treningu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
