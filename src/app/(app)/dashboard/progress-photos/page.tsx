
"use client";

import * as React from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AddPhotoDialog } from "@/components/progress-photos/add-photo-dialog";
import {
  ArrowLeft,
  Camera,
  PlusCircle,
  Trash2,
  ZoomIn,
  CheckCircle,
  XCircle,
  ImageOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Metadata } from 'next';

// Metadata should be handled by parent server component or layout if dynamic title needed
// export const metadata: Metadata = {
//   title: 'Zdjęcia Postępu | WorkoutWise',
//   description: 'Dokumentuj swoje postępy wizualne.',
// };

export interface ProgressPhoto {
  id: string;
  imageUrl: string;
  date: string; // ISO string
  description?: string;
}

const INITIAL_MOCK_PHOTOS: ProgressPhoto[] = [
  {
    id: uuidv4(),
    imageUrl: `https://placehold.co/400x600.png?text=Poczatek&random=${Math.random()}`,
    date: new Date(2024, 5, 1).toISOString(),
    description: "Początek redukcji.",
  },
  {
    id: uuidv4(),
    imageUrl: `https://placehold.co/400x600.png?text=Miesiac+1&random=${Math.random()}`,
    date: new Date(2024, 6, 1).toISOString(),
    description: "Po miesiącu treningów.",
  },
  {
    id: uuidv4(),
    imageUrl: `https://placehold.co/400x600.png?text=Miesiac+2&random=${Math.random()}`,
    date: new Date(2024, 7, 1).toISOString(),
    description: "Widoczne zmiany!",
  },
];


export default function ProgressPhotosPage() {
  const { toast } = useToast();
  const [photos, setPhotos] = React.useState<ProgressPhoto[]>(INITIAL_MOCK_PHOTOS);
  const [isAddPhotoDialogOpen, setIsAddPhotoDialogOpen] = React.useState(false);
  const [selectedForComparison, setSelectedForComparison] = React.useState<ProgressPhoto[]>([]);
  const [photoToView, setPhotoToView] = React.useState<ProgressPhoto | null>(null);
  const [photoToDelete, setPhotoToDelete] = React.useState<ProgressPhoto | null>(null);

  const handleAddPhoto = (newPhotoData: Omit<ProgressPhoto, "id" | "imageUrl">) => {
    const newPhoto: ProgressPhoto = {
      id: uuidv4(),
      // Generate a random placeholder to simulate different images
      imageUrl: `https://placehold.co/400x600.png?text=${encodeURIComponent(format(parseISO(newPhotoData.date), 'dd-MM-yyyy'))}&random=${Math.random()}`,
      ...newPhotoData,
    };
    setPhotos((prevPhotos) => [newPhoto, ...prevPhotos].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
    toast({ title: "Zdjęcie dodane", description: "Nowe zdjęcie postępu zostało zapisane." });
  };

  const handleDeletePhoto = () => {
    if (!photoToDelete) return;
    setPhotos((prevPhotos) => prevPhotos.filter((p) => p.id !== photoToDelete.id));
    setSelectedForComparison(prev => prev.filter(p => p.id !== photoToDelete.id)); // Remove from comparison if selected
    toast({ title: "Zdjęcie usunięte", description: "Zdjęcie zostało usunięte." });
    setPhotoToDelete(null);
  };

  const toggleSelectForComparison = (photo: ProgressPhoto) => {
    setSelectedForComparison((prevSelected) => {
      const isAlreadySelected = prevSelected.find(p => p.id === photo.id);
      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== photo.id);
      }
      if (prevSelected.length < 2) {
        return [...prevSelected, photo];
      }
      // If 2 are already selected, replace the first one
      // Or, provide a message like "Deselect one photo first" - current implementation replaces first
      toast({ title: "Osiągnięto limit", description: "Możesz porównać maksymalnie dwa zdjęcia. Pierwsze wybrane zdjęcie zostało zastąpione.", variant: "default" });
      return [prevSelected[1], photo];
    });
  };
  
  const sortedPhotos = React.useMemo(() => {
    return [...photos].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [photos]);


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout */}
      {/* <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Panelu</span>
              </Link>
            </Button>
            <Camera className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Zdjęcia Postępu</h1>
          </div>
          <Button onClick={() => setIsAddPhotoDialogOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Dodaj Zdjęcie
          </Button>
        </div>
      </header> */}

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto space-y-8">
          <div className="flex justify-end">
             <Button onClick={() => setIsAddPhotoDialogOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Dodaj Zdjęcie
            </Button>
          </div>
          <AddPhotoDialog
            isOpen={isAddPhotoDialogOpen}
            onOpenChange={setIsAddPhotoDialogOpen}
            onSave={handleAddPhoto}
          />

          {photoToView && (
            <Dialog open={!!photoToView} onOpenChange={() => setPhotoToView(null)}>
              <DialogContent className="sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw] p-0">
                <Image
                  src={photoToView.imageUrl}
                  alt={photoToView.description || `Zdjęcie z dnia ${format(parseISO(photoToView.date), "PPP", { locale: pl })}`}
                  width={800}
                  height={1200}
                  className="rounded-t-lg object-contain max-h-[80vh]"
                  data-ai-hint="progress body"
                />
                <div className="p-4 bg-card rounded-b-lg">
                    <DialogTitle className="text-lg">{photoToView.description || "Zdjęcie postępu"}</DialogTitle>
                    <DialogDescription>Data: {format(parseISO(photoToView.date), "PPP", { locale: pl })}</DialogDescription>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {photoToDelete && (
            <AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usunąć zdjęcie?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz usunąć to zdjęcie postępu z dnia {format(parseISO(photoToDelete.date), "PPP", { locale: pl })}? Tej akcji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePhoto} className="bg-destructive hover:bg-destructive/90">
                    Potwierdź i usuń
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}


          {/* Comparison Section */}
          {selectedForComparison.length === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Porównanie Zdjęć</CardTitle>
                <CardDescription>Wybrane zdjęcia do porównania. Kliknij "Wyczyść wybór", aby wybrać inne.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {selectedForComparison.sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()).map((photo) => (
                  <div key={photo.id} className="border rounded-lg overflow-hidden">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.description || `Zdjęcie ${photo.id}`}
                      width={400}
                      height={600}
                      className="w-full h-auto object-cover aspect-[2/3]"
                      data-ai-hint="progress body"
                    />
                    <div className="p-3 bg-muted/30">
                      <p className="font-semibold">{format(parseISO(photo.date), "PPP", { locale: pl })}</p>
                      <p className="text-sm text-muted-foreground truncate">{photo.description || "Brak opisu"}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setSelectedForComparison([])}>Wyczyść wybór</Button>
              </CardFooter>
            </Card>
          )}

          {/* Photo Gallery Section */}
          <Card>
            <CardHeader>
              <CardTitle>Galeria Zdjęć</CardTitle>
              <CardDescription>Przeglądaj swoje zdjęcia postępu. Wybierz maksymalnie dwa do porównania.</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ImageOff className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Brak zapisanych zdjęć postępu.</p>
                  <p className="text-sm text-muted-foreground">Kliknij "Dodaj Zdjęcie", aby rozpocząć dokumentowanie.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {sortedPhotos.map((photo) => {
                    const isSelected = selectedForComparison.some(p => p.id === photo.id);
                    return (
                      <Card key={photo.id} className={`overflow-hidden transition-all hover:shadow-xl ${isSelected ? 'ring-2 ring-primary' : 'ring-0'}`}>
                        <div className="relative aspect-[3/4]">
                          <Image
                            src={photo.imageUrl}
                            alt={photo.description || `Zdjęcie ${photo.id}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-cover cursor-pointer"
                            onClick={() => setPhotoToView(photo)}
                            data-ai-hint="progress body"
                          />
                           {isSelected && <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full"><CheckCircle size={16}/></div>}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium">{format(parseISO(photo.date), "dd MMM yyyy", { locale: pl })}</p>
                          {photo.description && <p className="text-xs text-muted-foreground truncate" title={photo.description}>{photo.description}</p>}
                          <div className="mt-2 flex gap-2">
                            <Button
                              variant={isSelected ? "secondary" : "outline"}
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => toggleSelectForComparison(photo)}
                              disabled={!isSelected && selectedForComparison.length >=2}
                            >
                              {isSelected ? <XCircle className="mr-1 h-3 w-3" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                              {isSelected ? "Odznacz" : "Porównaj"}
                            </Button>
                             <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive h-8 w-8"
                                onClick={() => setPhotoToDelete(photo)}
                              >
                                <Trash2 size={16} />
                                <span className="sr-only">Usuń</span>
                              </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
