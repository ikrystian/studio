
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, Save, XCircle, Target, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";

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
  "Całkowita objętość tygodniowa (kg)",
  "Liczba kroków dziennie",
];


const addGoalFormSchema = z.object({
  goalName: z.string().min(3, "Nazwa celu musi mieć co najmniej 3 znaki.").max(100, "Nazwa celu zbyt długa."),
  metric: z.string().min(1, "Metryka śledzenia jest wymagana."),
  targetValue: z.coerce.number({required_error: "Wartość docelowa jest wymagana.", invalid_type_error: "Wartość docelowa musi być liczbą."}).positive("Wartość docelowa musi być dodatnia."),
  currentValue: z.union([
    z.coerce.number({invalid_type_error: "Wartość aktualna musi być liczbą."}), 
    z.literal("")
  ]).optional(),
  deadline: z.date().optional(),
  notes: z.string().max(500, "Notatka zbyt długa.").optional(),
});

export type AddGoalFormData = z.infer<typeof addGoalFormSchema>;

interface AddGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: AddGoalFormData) => void; 
  // initialData?: AddGoalFormData; // For editing later
}

export function AddGoalDialog({
  isOpen,
  onOpenChange,
  onSave,
  // initialData, // Placeholder for editing
}: AddGoalDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<AddGoalFormData>({
    resolver: zodResolver(addGoalFormSchema),
    defaultValues: { // initialData ||
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
      form.reset({
        goalName: "",
        metric: undefined,
        targetValue: undefined,
        currentValue: "",
        deadline: undefined,
        notes: "",
      }); // Reset form when dialog closes
      setIsSaving(false);
    } 
    // else if (initialData && isOpen) {
    //   form.reset(initialData);
    // }
  }, [isOpen, form]); // Removed initialData from deps for now

  async function onSubmit(values: AddGoalFormData) {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const dataToSave: AddGoalFormData = {
        ...values,
        currentValue: values.currentValue === "" || values.currentValue === undefined ? 0 : Number(values.currentValue),
    };

    onSave(dataToSave); 
    // onOpenChange(false); // Parent will close it
    setIsSaving(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary"/>
            {/* {initialData ? "Edytuj Cel" : "Dodaj Nowy Cel"} */}
            Dodaj Nowy Cel
            </DialogTitle>
          <DialogDescription>
            {/* {initialData ? "Zaktualizuj szczegóły swojego celu." : "Zdefiniuj swój cel treningowy lub pomiarowy, aby śledzić postępy."} */}
            Zdefiniuj swój cel treningowy lub pomiarowy, aby śledzić postępy.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="goalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa Celu</FormLabel>
                  <FormControl>
                    <Input placeholder="Np. Przysiad 100kg x5" {...field} disabled={isSaving} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
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
                        <Input type="number" placeholder="Np. 80" {...field} disabled={isSaving} />
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
                        <Input type="number" placeholder="Np. 100" {...field} disabled={isSaving} />
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
                          disabled={isSaving}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP", { locale: pl }) : 
                           field.value === undefined ? <span>Wybierz datę</span> : <span>Nie ustawiono</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || isSaving } 
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
                    <Textarea placeholder="Dodatkowe informacje o celu..." {...field} rows={3} disabled={isSaving} />
                  </FormControl>
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
                {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4" />}
                 {/* {initialData ? "Zapisz Zmiany" : "Zapisz Cel"} */}
                 Zapisz Cel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
