
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, XCircle, ShieldQuestion, Users, ListChecks, BookOpen } from "lucide-react";

// Define the structure for privacy settings
export interface UserPrivacySettings {
  isActivityPublic: boolean;
  isFriendsListPublic: boolean;
  isSharedPlansPublic: boolean;
  // Add more granular settings as needed, e.g.:
  // profileVisibility: 'public' | 'friends_only' | 'private';
}

interface ProfilePrivacySettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialSettings: UserPrivacySettings;
  onSave: (newSettings: UserPrivacySettings) => void;
}

export function ProfilePrivacySettingsDialog({
  isOpen,
  onOpenChange,
  initialSettings,
  onSave,
}: ProfilePrivacySettingsDialogProps) {
  const { toast } = useToast();
  const [currentSettings, setCurrentSettings] = React.useState<UserPrivacySettings>(initialSettings);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentSettings(initialSettings); // Reset to initial settings when dialog opens
    }
  }, [isOpen, initialSettings]);

  const handleSettingChange = (key: keyof UserPrivacySettings, value: boolean) => {
    setCurrentSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    onSave(currentSettings);
    // onOpenChange(false); // Parent will close it after onSave completes
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldQuestion className="h-6 w-6 text-primary" />
            Ustawienia Prywatności Profilu
          </DialogTitle>
          <DialogDescription>
            Zdecyduj, które informacje z Twojego profilu będą widoczne dla innych użytkowników.
            Pamiętaj, że niektóre podstawowe informacje profilowe (jak nazwa użytkownika i zdjęcie) mogą być zawsze publiczne.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActivityPublic" className="text-base flex items-center gap-2">
                <ListChecks className="h-4 w-4" /> Moja Aktywność Publiczna
              </Label>
              <p className="text-xs text-muted-foreground">
                Czy inni mogą widzieć Twoje udostępnione treningi, posty, nowe rekordy itp.?
              </p>
            </div>
            <Switch
              id="isActivityPublic"
              checked={currentSettings.isActivityPublic}
              onCheckedChange={(checked) => handleSettingChange("isActivityPublic", checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isFriendsListPublic" className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" /> Lista Znajomych Publiczna
              </Label>
              <p className="text-xs text-muted-foreground">
                Czy inni mogą widzieć listę Twoich znajomych/obserwowanych?
              </p>
            </div>
            <Switch
              id="isFriendsListPublic"
              checked={currentSettings.isFriendsListPublic}
              onCheckedChange={(checked) => handleSettingChange("isFriendsListPublic", checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isSharedPlansPublic" className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Udostępnione Plany Publiczne
              </Label>
              <p className="text-xs text-muted-foreground">
                Czy inni mogą widzieć Twoje udostępnione plany treningowe?
              </p>
            </div>
            <Switch
              id="isSharedPlansPublic"
              checked={currentSettings.isSharedPlansPublic}
              onCheckedChange={(checked) => handleSettingChange("isSharedPlansPublic", checked)}
            />
          </div>
          
          {/* Add more privacy options here as needed */}
           <p className="text-xs text-muted-foreground pt-2">
            Uwaga: Bardziej granularne ustawienia prywatności (np. dla poszczególnych postów) mogą być dostępne w odpowiednich sekcjach. Te ustawienia dotyczą ogólnej widoczności na Twoim profilu.
          </p>
        </div>

        <DialogFooter className="pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              <XCircle className="mr-2 h-4 w-4" /> Anuluj
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" /> Zapisz Ustawienia Prywatności
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
