
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // We might not use it for placeholder
import { Label } from "@/components/ui/label";
import { ImageIcon, Save, XCircle, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

interface EditProfilePictureDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentAvatarUrl: string;
  onSave: (newAvatarUrl: string) => void;
}

export function EditProfilePictureDialog({
  isOpen,
  onOpenChange,
  currentAvatarUrl,
  onSave,
}: EditProfilePictureDialogProps) {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentAvatarUrl); // Set initial preview to current avatar
      setFileName(null); // Reset file name
    }
  }, [isOpen, currentAvatarUrl]);

  const handleSimulatedFileSelect = () => {
    // Simulate selecting a file by generating a new placeholder URL
    const newPlaceholderUrl = `https://placehold.co/200x200.png?text=New&random=${Math.random()}`;
    setPreviewUrl(newPlaceholderUrl);
    setFileName("new_avatar.png");
    toast({ description: "Symulacja wyboru nowego zdjęcia." });
  };

  const handleSaveChanges = () => {
    if (previewUrl && previewUrl !== currentAvatarUrl) {
      onSave(previewUrl);
      toast({ title: "Zdjęcie profilowe zaktualizowane!" });
    } else if (previewUrl === currentAvatarUrl) {
        toast({ title: "Brak zmian", description: "Nie wybrano nowego zdjęcia." });
    } else {
        toast({ title: "Brak zdjęcia", description: "Wybierz zdjęcie, aby je zapisać.", variant: "destructive"});
        return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Edytuj Zdjęcie Profilowe
          </DialogTitle>
          <DialogDescription>
            Wybierz nowe zdjęcie profilowe. W tej wersji demonstracyjnej używane są placeholdery.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex flex-col items-center space-y-2">
            {previewUrl && (
              <Image
                src={previewUrl}
                alt="Podgląd zdjęcia profilowego"
                width={128}
                height={128}
                className="rounded-full h-32 w-32 object-cover border"
                data-ai-hint="profile avatar preview"
              />
            )}
            <Button type="button" variant="outline" onClick={handleSimulatedFileSelect} className="w-full">
              <UploadCloud className="mr-2 h-4 w-4" />
              {previewUrl && previewUrl !== currentAvatarUrl ? "Zmień zdjęcie (Symulacja)" : "Wybierz zdjęcie (Symulacja)"}
            </Button>
            {fileName && <p className="text-xs text-muted-foreground">Wybrano: {fileName}</p>}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            W pełnej wersji aplikacji tutaj znajdowałby się formularz do przesyłania plików.
          </p>
        </div>
        <DialogFooter className="border-t pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              <XCircle className="mr-2 h-4 w-4" /> Anuluj
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges} disabled={!previewUrl || previewUrl === currentAvatarUrl}>
            <Save className="mr-2 h-4 w-4" /> Zapisz Zdjęcie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
