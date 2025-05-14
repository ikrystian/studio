
"use client";

import * as React from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Download, ShieldCheck, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ViewBackupCodesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  backupCodes: string[];
}

export function ViewBackupCodesDialog({
  isOpen,
  onOpenChange,
  backupCodes,
}: ViewBackupCodesDialogProps) {
  const { toast } = useToast();

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
      .then(() => {
        toast({ title: "Kody skopiowane!", description: "Kody zapasowe zostały skopiowane do schowka." });
      })
      .catch(err => {
        console.error("Failed to copy codes: ", err);
        toast({ title: "Błąd kopiowania", description: "Nie udało się skopiować kodów.", variant: "destructive" });
      });
  };

  const handleDownloadCodes = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "workoutwise-backup-codes.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Pobieranie rozpoczęte", description: "Plik z kodami zapasowymi powinien zostać pobrany." });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Twoje Kody Zapasowe 2FA
          </DialogTitle>
          <DialogDescription>
            Zapisz te kody w bezpiecznym miejscu. Użyjesz ich, jeśli stracisz dostęp do swojej aplikacji authenticator. Każdy kod może być użyty tylko raz.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="my-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Ważne!</AlertTitle>
          <AlertDescription>
            Traktuj te kody jak hasło! Nie udostępniaj ich nikomu. Jeśli je stracisz i nie będziesz mieć dostępu do aplikacji authenticator, możesz utracić dostęp do konta.
          </AlertDescription>
        </Alert>

        {backupCodes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 py-4 max-h-60 overflow-y-auto rounded-md border p-3 bg-muted/50">
            {backupCodes.map((code, index) => (
              <div key={index} className="p-2 bg-background rounded text-center font-mono text-sm tracking-wider">
                {code}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">Brak kodów zapasowych do wyświetlenia.</p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={handleCopyCodes} variant="outline" className="w-full sm:w-auto flex-1">
                <Copy className="mr-2 h-4 w-4"/> Kopiuj Kody
            </Button>
            <Button onClick={handleDownloadCodes} variant="outline" className="w-full sm:w-auto flex-1">
                <Download className="mr-2 h-4 w-4"/> Pobierz Kody (.txt)
            </Button>
        </div>

        <DialogFooter className="pt-4 mt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="default" className="w-full" onClick={() => onOpenChange(false)}>
              Pobrałem i zapisałem kody. Zamknij.
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
