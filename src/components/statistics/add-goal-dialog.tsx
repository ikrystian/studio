"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, Save, XCircle, Target, TrendingUp, AlertTriangle } from "lucide-react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


// Mock metrics for goal setting
const MOCK_GOAL_METRICS = [
  "Waga (kg)",
  "Obwód talii (cm)",
  "Przysiad - Objętość (kg*powt)",
  "Przysiad - Max Ciężar (kg)",
  "Wyciskanie sztangi - Max Ciężar (kg)",
  "Częstotliwość treningów (treningi/tydz.)",
  "Czas biegu na 5km (minuty)",
];


const addGoalFormSchema = z.object({
  goalName: z.string().min(1, "Nazwa celu jest wymagana."),
  metric: z.string().min(1, "Metryka śledzenia jest wymagana."),
  targetValue: z.coerce.number({invalid_type_error: "Wartość docelowa musi być liczbą."}).positive("Wartość docelowa musi być dodatnia."),
  currentValue: z.coerce.number({invalid_type_error: "Wartość aktualna musi być liczbą."}).optional().or(z.literal("")),
  deadline: z.date().optional(),
  notes: z.string().optional(),
});

export type AddGoalFormData = z.infer<typeof addGoalFormSchema>;

interface AddGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // onSave: (data: AddGoalFormData) => void; // Placeholder for save logic
}

export function AddGoalDialog({
  isOpen,
  onOpenChange,
  // onSave, // Placeholder
}: AddGoalDialogProps) {
  const { toast } = useToast();
  const form = useForm<AddGoalFormData>({
    resolver: zodResolver(addGoalFormSchema),
    defaultValues: {
      goalName: "",
      metric: undefined,
      targetValue: undefined,
      currentValue: "",
      deadline: undefined,
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  function onSubmit(values: AddGoalFormData) {
    console.log("Goal data to save (simulation):", values);
    toast({
      title: "Cel Zapisany (Symulacja)",
      description: `Cel "${values.goalName}" został pomyślnie zapisany.`,
    });
    onOpenChange(false); 
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary"/>Dodaj Nowy Cel</DialogTitle>
          <DialogDescription>
            Zdefiniuj swój cel treningowy lub pomiarowy, aby śledzić postępy.
          </DialogDescription>
        </DialogHeader>
        <Alert variant="default" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Funkcja w Budowie</AlertTitle>
            <AlertDescription>
                Pełne zarządzanie celami, ich śledzenie i wizualizacja postępów są w trakcie rozwoju. Obecnie można jedynie zdefiniować cel (symulacja zapisu).
            </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="goalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa Celu</FormLabel>
                  <FormControl>
                    <Input placeholder="Np. Przysiad 100kg x5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metric"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><TrendingUp className="mr-2 h-4 w-4"/>Metryka Śledzenia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz metrykę..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_GOAL_METRICS.map(metric => (
                        <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Wartość Aktualna (opcjonalnie)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Np. 80" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="targetValue"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Wartość Docelowa</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Np. 100" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Docelowa (opcjonalnie)</FormLabel>
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
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Cannot select past dates
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notatki do Celu (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dodatkowe informacje o celu..." {...field} rows={3} />
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
              <Button type="submit" disabled={true}> {/* Disabled as it's a placeholder */}
                <Save className="mr-2 h-4 w-4" /> Zapisz Cel (Wkrótce)
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}