
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { Save, XCircle, PlusCircle } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";

export interface Portion {
  id: string;
  name: string;
  amount: number; // in milliliters
}

const portionFormSchema = z.object({
  name: z.string().min(1, "Nazwa porcji jest wymagana.").max(50, "Nazwa porcji zbyt długa."),
  amount: z.coerce
    .number({
      required_error: "Objętość jest wymagana.",
      invalid_type_error: "Objętość musi być liczbą.",
    })
    .positive("Objętość musi być dodatnia.")
    .int("Objętość musi być liczbą całkowitą.")
    .min(1, "Objętość musi wynosić co najmniej 1 ml.")
    .max(5000, "Objętość nie może przekraczać 5000 ml."), // Max 5 liters
});

type PortionFormValues = z.infer<typeof portionFormSchema>;

interface AddEditPortionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (portion: Portion) => void;
  initialData?: Portion | null;
}

export function AddEditPortionDialog({
  isOpen,
  onOpenChange,
  onSave,
  initialData,
}: AddEditPortionDialogProps) {
  const { toast } = useToast();
  const form = useForm<PortionFormValues>({
    resolver: zodResolver(portionFormSchema),
    defaultValues: initialData || {
      name: "",
      amount: undefined, // Use undefined for number inputs to allow placeholder
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({ name: "", amount: undefined });
      }
    }
  }, [isOpen, initialData, form]);

  function onSubmit(values: PortionFormValues) {
    const portionToSave: Portion = {
      id: initialData?.id || uuidv4(),
      name: values.name,
      amount: values.amount, // Zod already coerced to number
    };
    onSave(portionToSave);
    toast({
      title: initialData ? "Porcja zaktualizowana" : "Porcja dodana",
      description: `Porcja "${portionToSave.name}" (${portionToSave.amount}ml) została zapisana.`,
    });
    onOpenChange(false); // Close dialog after save
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary"/>
            {initialData ? "Edytuj Własną Porcję Wody" : "Dodaj Nową Własną Porcję Wody"}
          </DialogTitle>
          <DialogDescription>
            {initialData ? "Zmień nazwę lub objętość porcji." : "Zdefiniuj własną porcję, aby szybko dodawać spożytą wodę."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa porcji</FormLabel>
                  <FormControl>
                    <Input placeholder="Np. Mój ulubiony kubek" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objętość (ml)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Np. 350"
                      {...field}
                      value={field.value === undefined ? "" : field.value} // Handle undefined for controlled number input
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                 <XCircle className="mr-2 h-4 w-4"/> Anuluj
                </Button>
              </DialogClose>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4"/> {initialData ? "Zapisz zmiany" : "Dodaj porcję"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
