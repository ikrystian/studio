
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Image as ImageIcon, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorAuthDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onActivateSuccess: () => void; // Called when 2FA is successfully "activated"
}

const MOCK_SECRET_KEY = "JBSWY3DPEHPK3PXP"; // Example secret key
const MOCK_QR_CODE_URL = `https://placehold.co/200x200.png?text=QR+Code+Placeholder`; // Placeholder QR

export function TwoFactorAuthDialog({
  isOpen,
  onOpenChange,
  onActivateSuccess,
}: TwoFactorAuthDialogProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(1); // 1: Scan QR, 2: Verify Code
  const [verificationCode, setVerificationCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const MOCK_EXPECTED_OTP = "123456"; // Simulate expected OTP

  React.useEffect(() => {
    // Reset state when dialog is closed or opened
    if (isOpen) {
      setCurrentStep(1);
      setVerificationCode("");
      setError(null);
      setIsVerifying(false);
    }
  }, [isOpen]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleVerifyAndActivate = async () => {
    setError(null);
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    if (verificationCode === MOCK_EXPECTED_OTP) {
      toast({
        title: "Weryfikacja Pomyślna!",
        description: "2FA zostanie aktywowane.",
      });
      onActivateSuccess(); // This will trigger showing backup codes in parent
      onOpenChange(false); // Close this dialog
    } else {
      setError("Nieprawidłowy kod weryfikacyjny. Spróbuj ponownie.");
    }
    setIsVerifying(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Aktywuj Weryfikację Dwuetapową (2FA)
          </DialogTitle>
          <DialogDescription>
            Zwiększ bezpieczeństwo swojego konta dodając drugi etap weryfikacji.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-4">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Błąd Aktywacji</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === 1 && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Krok 1: Zeskanuj ten kod QR swoją aplikacją authenticator (np. Google Authenticator, Authy).
            </p>
            <div className="flex justify-center">
              <img src={MOCK_QR_CODE_URL} alt="Kod QR do 2FA" data-ai-hint="qr code" className="rounded-lg border" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="secretKey">Lub wprowadź klucz ręcznie:</Label>
              <Input id="secretKey" value={MOCK_SECRET_KEY} readOnly disabled />
              <Button variant="outline" size="sm" className="mt-1" onClick={() => {
                navigator.clipboard.writeText(MOCK_SECRET_KEY);
                toast({ title: "Skopiowano klucz!"});
              }}>
                Kopiuj klucz
              </Button>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" onClick={handleNextStep} className="w-full">
                Przejdź do Weryfikacji
              </Button>
            </DialogFooter>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Krok 2: Wprowadź 6-cyfrowy kod wygenerowany przez Twoją aplikację authenticator.
            </p>
            <div className="space-y-1">
              <Label htmlFor="verificationCode">Kod Weryfikacyjny</Label>
              <Input
                id="verificationCode"
                type="text"
                maxLength={6}
                placeholder="_ _ _ _ _ _"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-[0.3em]"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} disabled={isVerifying}>
                Wróć
              </Button>
              <Button type="button" onClick={handleVerifyAndActivate} disabled={isVerifying || verificationCode.length !== 6}>
                {isVerifying ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Weryfikuj i Aktywuj 2FA
              </Button>
            </DialogFooter>
          </div>
        )}
         <DialogFooter className="border-t pt-4 mt-2">
             <DialogClose asChild>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Zamknij</Button>
            </DialogClose>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
