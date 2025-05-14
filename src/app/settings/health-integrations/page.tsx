
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Info, CheckCircle, XCircle, Link2, Unlink2 } from "lucide-react"; // Added Link2, Unlink2

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface IntegrationStatus {
  connected: boolean;
  lastSync?: Date | null;
}

interface HealthIntegrationSettings {
  appleHealth: IntegrationStatus;
  googleFit: IntegrationStatus;
  syncWorkouts: boolean;
  syncWeight: boolean;
  syncSleep: boolean; // Example additional data type
}

const LOCAL_STORAGE_KEY = "workoutWiseHealthIntegrationSettings";

export default function HealthIntegrationsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<HealthIntegrationSettings>({
    appleHealth: { connected: false, lastSync: null },
    googleFit: { connected: false, lastSync: null },
    syncWorkouts: true,
    syncWeight: true,
    syncSleep: false,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading health integration settings:", error);
      toast({
        title: "Błąd ładowania ustawień",
        description: "Nie udało się wczytać zapisanych ustawień integracji.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  const saveSettings = (newSettings: HealthIntegrationSettings) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings); // Update state after successful save
      toast({
        title: "Ustawienia Zapisane",
        description: "Twoje preferencje integracji zostały zaktualizowane.",
      });
    } catch (error) {
      console.error("Error saving health integration settings:", error);
      toast({
        title: "Błąd zapisu",
        description: "Nie udało się zapisać ustawień integracji.",
        variant: "destructive",
      });
    }
  };

  const handleToggleConnection = (service: "appleHealth" | "googleFit") => {
    const currentStatus = settings[service].connected;
    const newSettings = {
      ...settings,
      [service]: {
        connected: !currentStatus,
        lastSync: !currentStatus ? new Date() : null, // Simulate sync on connect
      },
    };
    saveSettings(newSettings);

    toast({
      title: `${service === "appleHealth" ? "Apple Health" : "Google Fit"}`,
      description: `Symulacja ${!currentStatus ? "połączenia" : "rozłączenia"}. W prawdziwej aplikacji tutaj nastąpiłby proces autoryzacji.`,
      duration: 5000,
    });
  };

  const handleToggleSyncOption = (option: keyof Pick<HealthIntegrationSettings, "syncWorkouts" | "syncWeight" | "syncSleep">) => {
    const newSettings = {
      ...settings,
      [option]: !settings[option],
    };
    saveSettings(newSettings);
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Activity className="h-12 w-12 animate-ping text-primary mb-4" />
        <p className="text-muted-foreground">Ładowanie ustawień integracji...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/settings">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Ustawień</span>
              </Link>
            </Button>
            <Activity className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Integracje z Aplikacjami Zdrowotnymi</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-2xl space-y-8">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Informacja</AlertTitle>
            <AlertDescription>
              Ta sekcja symuluje możliwość integracji z Apple Health i Google Fit. Rzeczywista synchronizacja danych wymagałaby natywnych możliwości aplikacji lub specjalnych API.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Apple Health</CardTitle>
              <CardDescription>Synchronizuj dane z aplikacją Zdrowie na iOS.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleToggleConnection("appleHealth")}
                variant={settings.appleHealth.connected ? "destructive" : "default"}
                className="w-full sm:w-auto"
              >
                {settings.appleHealth.connected ? <Unlink2 className="mr-2" /> : <Link2 className="mr-2" />}
                {settings.appleHealth.connected ? "Rozłącz" : "Połącz z Apple Health"}
              </Button>
              {settings.appleHealth.connected && (
                <p className="mt-3 text-sm text-green-600 flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" /> Połączono. Ostatnia synchronizacja: {settings.appleHealth.lastSync ? settings.appleHealth.lastSync.toLocaleString('pl-PL') : 'Nigdy'}
                </p>
              )}
              {!settings.appleHealth.connected && (
                 <p className="mt-3 text-sm text-destructive flex items-center">
                  <XCircle className="mr-2 h-4 w-4" /> Niepołączono.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google Fit</CardTitle>
              <CardDescription>Synchronizuj dane z platformą Google Fit.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleToggleConnection("googleFit")}
                variant={settings.googleFit.connected ? "destructive" : "default"}
                className="w-full sm:w-auto"
              >
                {settings.googleFit.connected ? <Unlink2 className="mr-2" /> : <Link2 className="mr-2" />}
                {settings.googleFit.connected ? "Rozłącz" : "Połącz z Google Fit"}
              </Button>
               {settings.googleFit.connected && (
                <p className="mt-3 text-sm text-green-600 flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" /> Połączono. Ostatnia synchronizacja: {settings.googleFit.lastSync ? settings.googleFit.lastSync.toLocaleString('pl-PL') : 'Nigdy'}
                </p>
              )}
              {!settings.googleFit.connected && (
                 <p className="mt-3 text-sm text-destructive flex items-center">
                  <XCircle className="mr-2 h-4 w-4" /> Niepołączono.
                </p>
              )}
            </CardContent>
          </Card>

          {(settings.appleHealth.connected || settings.googleFit.connected) && (
            <Card>
              <CardHeader>
                <CardTitle>Opcje Synchronizacji</CardTitle>
                <CardDescription>Wybierz, które dane chcesz synchronizować.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label htmlFor="sync-workouts" className="flex flex-col space-y-1">
                    <span>Synchronizuj Treningi</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Wysyłaj ukończone treningi do połączonych aplikacji.
                    </span>
                  </Label>
                  <Switch
                    id="sync-workouts"
                    checked={settings.syncWorkouts}
                    onCheckedChange={() => handleToggleSyncOption("syncWorkouts")}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label htmlFor="sync-weight" className="flex flex-col space-y-1">
                    <span>Synchronizuj Wagę</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                       Automatycznie odczytuj i zapisuj pomiary wagi.
                    </span>
                  </Label>
                  <Switch
                    id="sync-weight"
                    checked={settings.syncWeight}
                    onCheckedChange={() => handleToggleSyncOption("syncWeight")}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label htmlFor="sync-sleep" className="flex flex-col space-y-1">
                    <span>Synchronizuj Sen</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                       Odczytuj dane o śnie z połączonych aplikacji (jeśli dostępne).
                    </span>
                  </Label>
                  <Switch
                    id="sync-sleep"
                    checked={settings.syncSleep}
                    onCheckedChange={() => handleToggleSyncOption("syncSleep")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Zmiany są zapisywane automatycznie. Rzeczywista synchronizacja będzie zależeć od udzielonych uprawnień w systemowych oknach dialogowych (nie są one tutaj symulowane).
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

