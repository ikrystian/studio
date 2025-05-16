
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, Save, StickyNote, Weight, Repeat, Clock, Route, XCircle, Dumbbell, HelpCircle, Loader2 } from "lucide-react"; // Added Loader2

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PersonalBest } from "@/app/(app)/dashboard/personal-bests/page"; // Ensure correct import path
import type { Exercise as SelectableExercise } from "@/components/workout/exercise-selection-dialog"; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const RECORD_TYPES = [
  { value: "weight_reps", label: "Ciężar x Powtórzenia (np. 100kg x 5)" },
  { value: "max_reps", label: "Maksymalna liczba powtórzeń (np. 20 pompek z wagą ciała)" },
  { value: "time_seconds", label: "Czas (np. najszybszy bieg na 5km)" },
  { value: "distance_km", label: "Dystans (np. najdłuższy bieg)" },
] as const;

type RecordTypeValue = typeof RECORD_TYPES[number]['value'];

const baseSchema = z.object({
  exerciseId: z.string().min(1, "Wybór ćwiczenia jest wymagany."),
  date: z.date({ required_error: "Data rekordu jest wymagana." }),
  recordType: z.enum(RECORD_TYPES.map(rt => rt.value) as [RecordTypeValue, ...RecordTypeValue[]], {
    required_error: "Typ rekordu jest wymagany.",
  }),
  notes: z.string().optional(),
  valueWeight: z.union([z.coerce.number().positive("Ciężar musi być dodatni.").optional(), z.literal("BW"), z.literal("")]),
  valueReps: z.coerce.number().int().positive("Powtórzenia muszą być dodatnią liczbą całkowitą.").optional().or(z.literal("")),
  valueTimeSeconds: z.coerce.number().int().positive("Czas musi być dodatnią liczbą całkowitą sekund.").optional().or(z.literal("")),
  valueDistanceKm: z.coerce.number().positive("Dystans musi być dodatni.").optional().or(z.literal("")),
});

const refinedSchema = baseSchema.superRefine((data, ctx) => {
  switch (data.recordType) {
    case "weight_reps":
      if (data.valueWeight === "" || data.valueWeight === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ciężar jest wymagany.", path: ["valueWeight"] });
      }
      if (data.valueReps === "" || data.valueReps === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Liczba powtórzeń jest wymagana.", path: ["valueReps"] });
      }
      break;
    case "max_reps":
      if (data.valueReps === "" || data.valueReps === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Liczba powtórzeń jest wymagana.", path: ["valueReps"] });
      }
      break;
    case "time_seconds":
      if (data.valueTimeSeconds === "" || data.valueTimeSeconds === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Czas (w sekundach) jest wymagany.", path: ["valueTimeSeconds"] });
      }
      break;
    case "distance_km":
      if (data.valueDistanceKm === "" || data.valueDistanceKm === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Dystans (w km) jest wymagany.", path: ["valueDistanceKm"] });
      }
      break;
  }
});


export type PersonalBestFormData = z.infer<typeof refinedSchema>;

interface ManagePbDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: PersonalBestFormData) => void;
  initialData?: PersonalBest | null;
  availableExercises: SelectableExercise[];
}

export function ManagePbDialog({
  isOpen,
  onOpenChange,
  onSave,
  initialData,
  availableExercises,
}: ManagePbDialogProps) {

  const getInitialFormValues = React.useCallback(() => {
    if (initialData) {
      return {
        exerciseId: initialData.exerciseId,
        date: parseISO(initialData.date),
        recordType: initialData.recordType,
        notes: initialData.notes ?? "",
        valueWeight: initialData.value.weight ?? "",
        valueReps: initialData.value.reps ?? "",
        valueTimeSeconds: initialData.value.timeSeconds ?? "",
        valueDistanceKm: initialData.value.distanceKm ?? "",
      };
    }
    return {
      exerciseId: undefined,
      date: new Date(),
      recordType: undefined,
      notes: "",
      valueWeight: "",
      valueReps: "",
      valueTimeSeconds: "",
      valueDistanceKm: "",
    };
  }, [initialData]);

  const form = useForm<PersonalBestFormData>({
    resolver: zodResolver(refinedSchema),
    defaultValues: getInitialFormValues(),
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(getInitialFormValues());
    }
  }, [isOpen, initialData, form, getInitialFormValues]);

  function onSubmit(values: PersonalBestFormData) {
    const finalValues: PersonalBestFormData = {
        ...values,
        date: values.date, 
        valueWeight: values.valueWeight === "" ? undefined : values.valueWeight,
        valueReps: values.valueReps === "" ? undefined : Number(values.valueReps),
        valueTimeSeconds: values.valueTimeSeconds === "" ? undefined : Number(values.valueTimeSeconds),
        valueDistanceKm: values.valueDistanceKm === "" ? undefined : Number(values.valueDistanceKm),
    };
    onSave(finalValues);
  }
  
  const selectedRecordType = form.watch("recordType");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(getInitialFormValues());
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edytuj Rekord" : "Dodaj Nowy Rekord"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Zaktualizuj swój rekord." : "Zapisz swoje nowe osobiste osiągnięcie."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="exerciseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Dumbbell className="mr-2 h-4 w-4"/>Ćwiczenie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={availableExercises.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={availableExercises.length === 0 ? "Ładowanie/Brak ćwiczeń..." : "Wybierz ćwiczenie..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableExercises.length > 0 ? (
                        availableExercises.map(ex => (
                          <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>Ładowanie listy ćwiczeń...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4"/>Data Osiągnięcia Rekordu</FormLabel>
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
                          {field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
              name="recordType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><HelpCircle className="mr-2 h-4 w-4"/>Typ Rekordu</FormLabel>
                  <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("valueWeight", "");
                      form.setValue("valueReps", "");
                      form.setValue("valueTimeSeconds", "");
                      form.setValue("valueDistanceKm", "");
                    }} 
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ rekordu..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RECORD_TYPES.map(rt => (
                        <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRecordType === "weight_reps" && (
              <>
                <FormField
                  control={form.control}
                  name="valueWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Weight className="mr-2 h-4 w-4"/>Ciężar</FormLabel>
                      <FormControl>
                        <Input placeholder="Np. 100 (kg) lub BW (dla wagi ciała)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valueReps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Repeat className="mr-2 h-4 w-4"/>Liczba Powtórzeń</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Np. 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {selectedRecordType === "max_reps" && (
              <>
                <FormField
                  control={form.control}
                  name="valueWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Weight className="mr-2 h-4 w-4"/>Ciężar (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="Np. BW lub 20 (kg)" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">Jeśli z wagą ciała, wpisz "BW" lub zostaw puste (jeśli logika na to pozwala).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valueReps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Repeat className="mr-2 h-4 w-4"/>Maksymalna Liczba Powtórzeń</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Np. 20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {selectedRecordType === "time_seconds" && (
                 <FormField
                    control={form.control}
                    name="valueTimeSeconds"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center"><Clock className="mr-2 h-4 w-4"/>Czas (w sekundach)</FormLabel>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-5 w-5 p-0 ml-1"><HelpCircle className="h-4 w-4 text-muted-foreground"/></Button></TooltipTrigger>
                                <TooltipContent><p>Np. dla 5 minut wpisz 300. Dla 1 min 30 sek wpisz 90.</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <FormControl>
                            <Input type="number" placeholder="Np. 1800 (dla 30 minut)" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {selectedRecordType === "distance_km" && (
                 <FormField
                    control={form.control}
                    name="valueDistanceKm"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center"><Route className="mr-2 h-4 w-4"/>Dystans (km)</FormLabel>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-5 w-5 p-0 ml-1"><HelpCircle className="h-4 w-4 text-muted-foreground"/></Button></TooltipTrigger>
                                <TooltipContent><p>Np. dla 5.5 km wpisz 5.5</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <FormControl>
                            <Input type="number" step="0.1" placeholder="Np. 10.5" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}


            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><StickyNote className="mr-2 h-4 w-4"/>Notatki (opcjonalne)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dodatkowe informacje, np. warunki, samopoczucie." {...field} />
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4" />}
                 {initialData ? "Zapisz Zmiany" : "Dodaj Rekord"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

