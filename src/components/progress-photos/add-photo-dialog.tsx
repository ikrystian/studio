
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, Save, StickyNote, UploadCloud, XCircle, Lock, Users, Image as ImageIcon } from "lucide-react"; // Added ImageIcon

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
  FormDescription, // Added FormDescription
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
import type { ProgressPhoto } from "@/app/progress-photos/page";
import NextImage from "next/image"; // Use NextImage for the preview


const photoFormSchema = z.object({
  date: z.date({ required_error: "Data zdjęcia jest wymagana." }),
  description: z.string().optional(),
  privacy: z.enum(["private", "friends_only"]).default("private"),
  // file: typeof window === 'undefined' ? z.any() : z.instanceof(FileList).optional().nullable(), // Optional for now
});

type PhotoFormValues = z.infer<typeof photoFormSchema>;

interface AddPhotoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<ProgressPhoto, "id" | "imageUrl"> & { imageUrl?: string }) => void;
}

export function AddPhotoDialog({
  isOpen,
  onOpenChange,
  onSave,
}: AddPhotoDialogProps) {
  const [selectedFilePreview, setSelectedFilePreview] = React.useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);


  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      privacy: "private",
      // file: null,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        date: new Date(),
        description: "",
        privacy: "private",
        // file: null,
      });
      setSelectedFilePreview(null);
      setSelectedFileName(null);
    }
  }, [isOpen, form]);

  // Simulate file selection
  const handleSimulatedFileSelect = () => {
    const randomImageUrl = `https://placehold.co/400x600.png?text=Preview&random=${Math.random()}`;
    setSelectedFilePreview(randomImageUrl);
    setSelectedFileName("mock_image.jpg");
  };

  const handleRemovePreview = () => {
    setSelectedFilePreview(null);
    setSelectedFileName(null);
    // form.setValue("file", null); // If using react-hook-form for file
  };

  function onSubmit(values: PhotoFormValues) {
    const photoDataToSave = {
      date: values.date.toISOString(),
      description: values.description,
      privacy: values.privacy,
      imageUrl: selectedFilePreview || `https://placehold.co/400x600.png?text=${encodeURIComponent(format(values.date, 'dd-MM-yyyy'))}&random=${Math.random()}`, // Use preview or generate new
    };
    onSave(photoDataToSave);
    // form.reset(); // Reset is handled by useEffect or onOpenChange
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          form.reset();
          setSelectedFilePreview(null);
          setSelectedFileName(null);
        }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dodaj Nowe Zdjęcie Postępu</DialogTitle>
          <DialogDescription>
            Wybierz zdjęcie, datę, opcjonalny opis i ustawienia prywatności.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            
            <FormItem>
              <FormLabel className="flex items-center"><UploadCloud className="mr-2 h-4 w-4"/>Wybierz zdjęcie (symulacja)</FormLabel>
              {!selectedFilePreview && (
                <Button type="button" variant="outline" onClick={handleSimulatedFileSelect} className="w-full">
                  <ImageIcon className="mr-2 h-4 w-4" /> Wybierz Plik (Symulacja)
                </Button>
              )}
              {selectedFileName && <p className="text-sm text-muted-foreground mt-1">Wybrano: {selectedFileName}</p>}
              
              {selectedFilePreview && (
                <div className="mt-2 border rounded-md p-2 space-y-2">
                  <p className="text-sm font-medium">Podgląd:</p>
                  <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto">
                    <NextImage src={selectedFilePreview} alt="Podgląd zdjęcia" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="preview progress body" />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemovePreview} className="text-destructive w-full">
                    <XCircle className="mr-2 h-4 w-4" /> Usuń podgląd
                  </Button>
                </div>
              )}
               <FormControl>
                 {/* This input is hidden, actual file handling is complex and backend-dependent */}
                 {/* <Input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" 
                       onChange={(e) => {
                         if (e.target.files && e.target.files.length > 0) {
                           form.setValue("file", e.target.files);
                           setSelectedFilePreview(URL.createObjectURL(e.target.files[0]));
                           setSelectedFileName(e.target.files[0].name);
                         } else {
                           setSelectedFilePreview(null);
                           setSelectedFileName(null);
                         }
                       }}
                     /> */}
                 <Input type="text" value={selectedFileName || "Brak pliku"} readOnly disabled className="hidden" />
               </FormControl>
              <FormDescription className="text-xs">
                  W tej wersji prototypowej nie ma możliwości przesyłania rzeczywistych plików. Zdjęcie zostanie wygenerowane automatycznie lub użyty zostanie podgląd.
              </FormDescription>
            </FormItem>


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

            <FormField
              control={form.control}
              name="privacy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    {field.value === "private" ? <Lock className="mr-2 h-4 w-4"/> : <Users className="mr-2 h-4 w-4"/>}
                    Ustawienia prywatności
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz poziom prywatności" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center"><Lock className="mr-2 h-3 w-3"/>Tylko ja</div>
                      </SelectItem>
                      <SelectItem value="friends_only">
                         <div className="flex items-center"><Users className="mr-2 h-3 w-3"/>Znajomi (Symulacja)</div>
                      </SelectItem>
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
              <Button type="submit" disabled={!selectedFilePreview && !form.formState.isDirty}>
                <Save className="mr-2 h-4 w-4" /> Zapisz Zdjęcie
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
