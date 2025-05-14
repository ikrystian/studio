
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
import { EXERCISE_CATEGORIES } from "./exercise-selection-dialog"; // Reuse categories

const quickAddExerciseSchema = z.object({
  name: z.string().min(1, "Nazwa ćwiczenia jest wymagana."),
  category: z.string().optional(), // Optional category
});

export type QuickAddExerciseFormData = z.infer<typeof quickAddExerciseSchema>;

interface QuickAddExerciseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onExerciseCreated: (data: { name: string; category: string }) => void;
}

export function QuickAddExerciseDialog({
  isOpen,
  onOpenChange,
  onExerciseCreated,
}: QuickAddExerciseDialogProps) {
  const form = useForm<QuickAddExerciseFormData>({
    resolver: zodResolver(quickAddExerciseSchema),
    defaultValues: {
      name: "",
      category: "Wszystkie", // Default to "Wszystkie" or make it truly optional
    },
  });

  React.useEffect(() => {
    if (!isOpen) {
      form.reset(); // Reset form when dialog is closed
    }
  }, [isOpen, form]);

  function onSubmit(values: QuickAddExerciseFormData) {
    onExerciseCreated({
        name: values.name,
        category: values.category || "Inne", // Default to "Inne" if not selected
    });
    // onOpenChange(false); // Parent will close it after processing
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
            Zostanie ono dodane do globalnej bazy i obecnego treningu.
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
                    <Input placeholder="Np. Pompki diamentowe" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz kategorię..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXERCISE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="Inne">Inne (Nieskategoryzowane)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  <XCircle className="mr-2 h-4 w-4" /> Anuluj
                </Button>
              </DialogClose>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Zapisz i Dodaj do Treningu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    