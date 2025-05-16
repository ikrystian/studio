
"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Edit3,
  Save,
  XCircle,
  Loader2,
  CalendarIcon,
  Weight,
  Ruler,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/mockData"; // Assuming UserProfile is similar to account data structure

const personalDataSchema = z.object({
  fullName: z.string().min(1, "Imię i nazwisko jest wymagane."),
  dateOfBirth: z.date({
    required_error: "Data urodzenia jest wymagana.",
    invalid_type_error: "Nieprawidłowy format daty.",
  }),
  gender: z.enum(["male", "female"], {
    required_error: "Płeć jest wymagana.",
  }),
  weight: z.coerce
    .number({ invalid_type_error: "Waga musi być liczbą."})
    .positive("Waga musi być dodatnia.")
    .min(1, "Waga musi wynosić co najmniej 1 kg.")
    .max(500, "Waga nie może przekraczać 500 kg.")
    .optional()
    .or(z.literal("")),
  height: z.coerce
    .number({ invalid_type_error: "Wzrost musi być liczbą."})
    .positive("Wzrost musi być dodatni.")
    .min(50, "Wzrost musi wynosić co najmniej 50 cm.")
    .max(300, "Wzrost nie może przekraczać 300 cm.")
    .optional()
    .or(z.literal("")),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Poziom zaawansowania jest wymagany.",
  }),
});
type PersonalDataFormValues = z.infer<typeof personalDataSchema>;

interface PersonalDataSectionProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isSubmitting: boolean;
  currentUserAccountData: UserProfile; // Adjust this type as needed
  personalDataForm: UseFormReturn<PersonalDataFormValues>;
  onSubmitPersonalData: (values: PersonalDataFormValues) => Promise<void>;
  renderDisplayValue: (value: string | number | undefined | null, unit?: string, defaultValue?: string) => string;
}

export function PersonalDataSection({
  isEditing,
  setIsEditing,
  isSubmitting,
  currentUserAccountData,
  personalDataForm,
  onSubmitPersonalData,
  renderDisplayValue,
}: PersonalDataSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Dane Osobowe</CardTitle>
            <CardDescription>Przeglądaj i zarządzaj swoimi danymi osobowymi.</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => {
              personalDataForm.reset({
                fullName: currentUserAccountData.fullName,
                dateOfBirth: currentUserAccountData.dateOfBirth ? parseISO(currentUserAccountData.dateOfBirth) : new Date(),
                gender: currentUserAccountData.gender as "male" | "female",
                weight: currentUserAccountData.weight ?? "",
                height: currentUserAccountData.height ?? "",
                fitnessLevel: currentUserAccountData.fitnessLevel as "beginner" | "intermediate" | "advanced",
              });
              setIsEditing(true);
            }} disabled={isSubmitting}>
              <Edit3 className="mr-2 h-4 w-4" /> Edytuj
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...personalDataForm}>
            <form onSubmit={personalDataForm.handleSubmit(onSubmitPersonalData)} className="space-y-6">
              <FormField
                control={personalDataForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem><FormLabel>Imię i nazwisko</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField
                control={personalDataForm.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Data urodzenia</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl>
                      <Button variant={"outline"} className={cn("w-full sm:w-[280px] justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                      </Button></FormControl></PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} locale={pl} />
                      </PopoverContent></Popover><FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalDataForm.control} name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel>Płeć</FormLabel><FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4">
                      <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Mężczyzna</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Kobieta</FormLabel></FormItem>
                    </RadioGroup></FormControl><FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={personalDataForm.control} name="weight" render={({ field }) => (<FormItem><FormLabel><Weight className="inline mr-1 h-4 w-4" />Waga (kg)</FormLabel><FormControl><Input type="number" placeholder="np. 70" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={personalDataForm.control} name="height" render={({ field }) => (<FormItem><FormLabel><Ruler className="inline mr-1 h-4 w-4" />Wzrost (cm)</FormLabel><FormControl><Input type="number" placeholder="np. 175" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={personalDataForm.control} name="fitnessLevel" render={({ field }) => (<FormItem><FormLabel><TrendingUp className="inline mr-1 h-4 w-4" />Poziom zaawansowania</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz poziom" /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="beginner">Początkujący</SelectItem><SelectItem value="intermediate">Średniozaawansowany</SelectItem><SelectItem value="advanced">Zaawansowany</SelectItem></SelectContent>
                </Select><FormMessage /></FormItem>
              )}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}><XCircle className="mr-2 h-4 w-4" /> Anuluj</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} Zapisz zmiany</Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b"><span>Imię i nazwisko:</span> <span className="font-medium">{currentUserAccountData.fullName}</span></div>
            <div className="flex justify-between py-2 border-b"><span>Email:</span> <span className="font-medium text-muted-foreground">{currentUserAccountData.email}</span></div>
            <div className="flex justify-between py-2 border-b"><span>Data urodzenia:</span> <span className="font-medium">{currentUserAccountData.dateOfBirth ? format(parseISO(currentUserAccountData.dateOfBirth), "PPP", { locale: pl }) : "N/A"}</span></div>
            <div className="flex justify-between py-2 border-b"><span>Płeć:</span> <span className="font-medium capitalize">{currentUserAccountData.gender === 'male' ? 'Mężczyzna' : currentUserAccountData.gender === 'female' ? 'Kobieta' : currentUserAccountData.gender?.replace("_", " ")}</span></div>
            <div className="flex justify-between py-2 border-b"><span>Waga:</span> <span className="font-medium">{renderDisplayValue(currentUserAccountData.weight, " kg")}</span></div>
            <div className="flex justify-between py-2 border-b"><span>Wzrost:</span> <span className="font-medium">{renderDisplayValue(currentUserAccountData.height, " cm")}</span></div>
            <div className="flex justify-between py-2 border-b"><span>Poziom zaawansowania:</span> <span className="font-medium capitalize">{currentUserAccountData.fitnessLevel}</span></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
