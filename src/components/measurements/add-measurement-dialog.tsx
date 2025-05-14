
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, Ruler, Save, StickyNote, Weight, XCircle } from "lucide-react";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Measurement, BodyPartData } from "@/app/measurements/page";

export const PREDEFINED_BODY_PARTS = [
  { key: "chest", name: "Klatka piersiowa (cm)", label: "Klatka" },
  { key: "waist", name: "Talia (cm)", label: "Talia" },
  { key: "hips", name: "Biodra (cm)", label: "Biodra" },
  { key: "bicepsL", name: "Biceps lewy (cm)", label: "Biceps L." },
  { key: "bicepsR", name: "Biceps prawy (cm)", label: "Biceps P." },
  { key: "thighL", name: "Udo lewe (cm)", label: "Udo L." },
  { key: "thighR", name: "Udo prawe (cm)", label: "Udo P." },
];

// Schema for validating individual body part measurements
const bodyPartMeasurementSchema = z.object({
  name: z.string(),
  value: z.coerce.number().positive("Wartość musi być dodatnia.").nullable().optional().or(z.literal("")),
});


const measurementFormSchema = z.object({
  date: z.date({ required_error: "Data pomiaru jest wymagana." }),
  weight: z.coerce
    .number({ invalid_type_error: "Waga musi być liczbą." })
    .positive("Waga musi być dodatnia.")
    .min(1, "Waga musi wynosić co najmniej 1 kg.")
    .max(500, "Waga nie może przekraczać 500 kg."),
  bodyParts: z.array(bodyPartMeasurementSchema),
  notes: z.string().optional(),
});

export type MeasurementFormDataInternal = z.infer<typeof measurementFormSchema>;

// This is the type that will be passed to onSave, matching the main Measurement interface
export type MeasurementFormData = Omit<Measurement, "id"> & { date: string };


interface AddMeasurementDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: MeasurementFormData) => void;
  initialData?: Measurement | null; // For editing
}

export function AddMeasurementDialog({
  isOpen,
  onOpenChange,
  onSave,
  initialData,
}: AddMeasurementDialogProps) {
  const form = useForm<MeasurementFormDataInternal>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues: {
      date: initialData ? parseISO(initialData.date) : new Date(),
      weight: initialData?.weight ?? undefined,
      bodyParts: PREDEFINED_BODY_PARTS.map(part => ({
        name: part.name,
        value: initialData?.bodyParts.find(bp => bp.name === part.name)?.value ?? null,
      })),
      notes: initialData?.notes ?? "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        date: parseISO(initialData.date),
        weight: initialData.weight,
        bodyParts: PREDEFINED_BODY_PARTS.map(part => ({
          name: part.name,
          value: initialData.bodyParts.find(bp => bp.name === part.name)?.value ?? null,
        })),
        notes: initialData.notes ?? "",
      });
    } else {
      form.reset({
        date: new Date(),
        weight: undefined,
        bodyParts: PREDEFINED_BODY_PARTS.map(part => ({ name: part.name, value: null })),
        notes: "",
      });
    }
  }, [initialData, form, isOpen]); // Re-run effect when isOpen changes to reset form on dialog open

  function onSubmit(values: MeasurementFormDataInternal) {
    const transformedData: MeasurementFormData = {
      ...values,
      date: values.date.toISOString(), // Convert date to ISO string
      bodyParts: values.bodyParts.map(bp => ({
        name: bp.name,
        value: bp.value === "" ? null : Number(bp.value) // Ensure "" becomes null
      })).filter(bp => bp.value !== null), // Filter out parts that were left empty
    };
    onSave(transformedData);
    form.reset(); // Reset form after successful save
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(); // Reset form when dialog is closed
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edytuj Pomiar" : "Dodaj Nowy Pomiar"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Zaktualizuj swoje dane pomiarowe." : "Zapisz swoje aktualne pomiary wagi i ciała."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Pomiaru</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        locale={pl}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Weight className="mr-2 h-4 w-4"/>Waga (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="Np. 70.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
                <FormLabel className="flex items-center"><Ruler className="mr-2 h-4 w-4"/>Pomiary Obwodów Ciała (opcjonalne)</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PREDEFINED_BODY_PARTS.map((part, index) => (
                    <FormField
                    key={part.key}
                    control={form.control}
                    name={`bodyParts.${index}.value`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-sm font-normal">{part.name}</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" placeholder="Wartość (cm)" {...field} onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                ))}
                </div>
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><StickyNote className="mr-2 h-4 w-4"/>Notatki (opcjonalne)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dodatkowe informacje, np. samopoczucie, okoliczności pomiaru." {...field} />
                  </FormControl>
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
                <Save className="mr-2 h-4 w-4" /> Zapisz Pomiar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    