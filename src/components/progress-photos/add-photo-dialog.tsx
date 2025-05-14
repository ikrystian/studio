
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, Save, StickyNote, UploadCloud, XCircle } from "lucide-react";

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
import { Input } from "@/components/ui/input"; // For file input styling
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { ProgressPhoto } from "@/app/progress-photos/page"; // Assuming ProgressPhoto is exported

const photoFormSchema = z.object({
  date: z.date({ required_error: "Data zdjęcia jest wymagana." }),
  description: z.string().optional(),
  // Actual file handling is complex and backend-dependent, so we'll omit direct file validation here.
  // We'll simulate this part.
});

type PhotoFormValues = z.infer<typeof photoFormSchema>;

interface AddPhotoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<ProgressPhoto, "id" | "imageUrl">) => void;
}

export function AddPhotoDialog({
  isOpen,
  onOpenChange,
  onSave,
}: AddPhotoDialogProps) {
  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: {
      date: new Date(),
      description: "",
    },
  });

  // To reset form when dialog opens or initialData changes (if we add editing later)
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        date: new Date(),
        description: "",
      });
    }
  }, [isOpen, form]);

  function onSubmit(values: PhotoFormValues) {
    const photoDataToSave = {
      date: values.date.toISOString(),
      description: values.description,
    };
    onSave(photoDataToSave);
    form.reset(); // Reset form after successful save
    onOpenChange(false); // Close dialog
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(); // Reset form when dialog is closed via X or overlay click
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dodaj Nowe Zdjęcie Postępu</DialogTitle>
          <DialogDescription>
            Wybierz datę i dodaj opcjonalny opis do swojego zdjęcia. Zdjęcie zostanie wygenerowane jako placeholder.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Zdjęcia</FormLabel>
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

            {/* Simulated File Input - In a real app, this would be <Input type="file" /> */}
            <FormItem>
                <FormLabel className="flex items-center"><UploadCloud className="mr-2 h-4 w-4"/>Wybierz zdjęcie (symulacja)</FormLabel>
                <FormControl>
                    <Input type="text" placeholder="Symulacja wyboru pliku..." disabled readOnly className="cursor-not-allowed italic" />
                </FormControl>
                <FormDescription className="text-xs">
                    W tej wersji prototypowej nie ma możliwości przesyłania plików. Zdjęcie zostanie wygenerowane automatycznie.
                </FormDescription>
            </FormItem>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><StickyNote className="mr-2 h-4 w-4"/>Opis (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Np. Po 4 tygodniach diety, forma z rana." {...field} />
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
                <Save className="mr-2 h-4 w-4" /> Zapisz Zdjęcie
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
