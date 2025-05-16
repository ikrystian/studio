
"use client";

import * as React from "react";
import { ShieldCheck, Save, Loader2, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { UserPrivacySettings } from "@/components/profile/profile-privacy-settings-dialog";

interface ProfilePrivacyManagementSectionProps {
  privacySettings: UserPrivacySettings;
  handlePrivacySettingChange: (key: keyof UserPrivacySettings, value: boolean) => void;
  isSavingPrivacy: boolean;
  handleSavePrivacySettings: () => Promise<void>;
}

export function ProfilePrivacyManagementSection({
  privacySettings,
  handlePrivacySettingChange,
  isSavingPrivacy,
  handleSavePrivacySettings,
}: ProfilePrivacyManagementSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Ustawienia Prywatności Profilu</CardTitle>
        <CardDescription>Zarządzaj tym, co inni użytkownicy mogą widzieć na Twoim profilu publicznym.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="privacy-activity" className="text-base">Moja Aktywność Publiczna</Label>
              <p className="text-xs text-muted-foreground">Czy inni mogą widzieć Twoje udostępnione treningi, posty, nowe rekordy itp.?</p>
            </div>
            <Switch id="privacy-activity" checked={privacySettings.isActivityPublic} onCheckedChange={(checked) => handlePrivacySettingChange("isActivityPublic", checked)} disabled={isSavingPrivacy} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="privacy-friends" className="text-base">Lista Znajomych Publiczna</Label>
              <p className="text-xs text-muted-foreground">Czy inni mogą widzieć listę Twoich znajomych/obserwowanych?</p>
            </div>
            <Switch id="privacy-friends" checked={privacySettings.isFriendsListPublic} onCheckedChange={(checked) => handlePrivacySettingChange("isFriendsListPublic", checked)} disabled={isSavingPrivacy} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="privacy-plans" className="text-base">Udostępnione Plany Publiczne</Label>
              <p className="text-xs text-muted-foreground">Czy inni mogą widzieć Twoje udostępnione plany treningowe?</p>
            </div>
            <Switch id="privacy-plans" checked={privacySettings.isSharedPlansPublic} onCheckedChange={(checked) => handlePrivacySettingChange("isSharedPlansPublic", checked)} disabled={isSavingPrivacy} />
          </div>
        </div>
        <Button onClick={handleSavePrivacySettings} disabled={isSavingPrivacy}>{isSavingPrivacy ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Zapisz Ustawienia Prywatności</Button>
        <Alert><Info className="h-4 w-4" /><AlertTitle>Informacja</AlertTitle><AlertDescription>Pamiętaj, że niektóre podstawowe informacje (jak nazwa użytkownika) mogą być zawsze publiczne.</AlertDescription></Alert>
      </CardContent>
    </Card>
  );
}
