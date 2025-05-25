"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Settings,
  Bug,
  ArrowLeft,
  Trash2,
  RefreshCcw,
  Database,
  Users as UsersIcon,
  Info,
  AlertTriangle,
  UserCircle,
} from "lucide-react"; // Added UsersIcon and UserCircle
import { useToast } from "@/hooks/use-toast";
// MOCK BACKEND LOGIC:
// - Data Source: `MOCK_USER_PROFILES_DB` is imported from `src/lib/mockData.ts`.
// - Actions:
//   - Clear LocalStorage: Directly manipulates browser's localStorage.
//   - Reset Mock Users: Simulates a backend reset by clearing `currentUserProfileData` from localStorage
//     and re-setting the displayed `userProfiles` from the original `MOCK_USER_PROFILES_DB`.
//     In a real app, this would trigger an API call to reset a backend database.
//   - Test Toast/Error: Client-side actions for UI testing.
import type { UserProfile } from "@/lib/mockData"; // Import UserProfile type
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { AddExerciseForm } from "@/components/admin/AddExerciseForm";

export default function AdminDebugPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [localStorageSize, setLocalStorageSize] =
    React.useState<string>("0 KB");
  const [userProfiles, setUserProfiles] = React.useState<UserProfile[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      if (typeof window !== "undefined") {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            if (value) {
              total += (key.length + value.length) * 2; // Estimate bytes (UTF-16)
            }
          }
        }
        setLocalStorageSize(`${(total / 1024).toFixed(2)} KB`);
      }

      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        if (data.success && data.users) {
          setUserProfiles(data.users);
        } else {
          toast({
            title: "Błąd",
            description:
              data.message || "Nie udało się załadować użytkowników.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Błąd sieci",
          description:
            "Nie można połączyć się z serwerem w celu pobrania użytkowników.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const handleClearLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      toast({
        title: "LocalStorage Wyczyczone!",
        description: "Wszystkie dane lokalne zostały usunięte. Odśwież stronę.",
        variant: "default",
      });
      setLocalStorageSize("0 KB");
    }
  };

  const handleResetMockUsers = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUserProfileData");
      // In a real application, this would trigger an API call to reset a backend database.
      // For now, we'll re-fetch users from the database after clearing local storage.
      // This simulates a "reset" by ensuring the UI reflects the database state.
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        if (data.success && data.users) {
          setUserProfiles(data.users);
          toast({
            title: "Symulacja Resetu Użytkowników",
            description:
              "W prawdziwej aplikacji to zresetowałoby bazę użytkowników. Obecnie tylko czyści 'currentUserProfileData' i odświeża listę z bazy danych.",
            variant: "default",
          });
        } else {
          toast({
            title: "Błąd Resetu",
            description:
              data.message || "Nie udało się zresetować użytkowników.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error resetting users:", error);
        toast({
          title: "Błąd sieci",
          description:
            "Nie można połączyć się z serwerem w celu zresetowania użytkowników.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Ładowanie panelu debugowania...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-6 w-6 text-destructive" />
                Panel Debugowania Administratora
              </CardTitle>
              <CardDescription>
                Narzędzia i informacje do debugowania aplikacji.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Uwaga!</AlertTitle>
                <AlertDescription>
                  Ten panel zawiera narzędzia, które mogą wpłynąć na działanie
                  aplikacji. Używaj ostrożnie.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Informacje Systemowe (Mock)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Środowisko:</strong> Rozwojowe (Symulacja)
                  </p>
                  <p>
                    <strong>Wersja Aplikacji:</strong> 1.0.0-beta (Symulacja)
                  </p>
                  <p>
                    <strong>Rozmiar LocalStorage:</strong> {localStorageSize}
                  </p>
                  <p>
                    <strong>Liczba Użytkowników (Mock DB):</strong>{" "}
                    {userProfiles.length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Akcje Debugowania</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="destructive"
                    onClick={handleClearLocalStorage}
                  >
                    <Trash2 className="mr-2" /> Wyczyść LocalStorage
                  </Button>
                  <Button variant="outline" onClick={handleResetMockUsers}>
                    <RefreshCcw className="mr-2" /> Resetuj Mock Użytkowników
                    (Symulacja)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast({
                        title: "Test Toast",
                        description: "To jest testowe powiadomienie.",
                      })
                    }
                  >
                    <Info className="mr-2" /> Pokaż Testowy Toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      throw new Error(
                        "Testowy błąd Sentry/Monitorowania (Symulacja)"
                      );
                    }}
                  >
                    <AlertTriangle className="mr-2" /> Wygeneruj Błąd Testowy
                  </Button>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Niektóre akcje mogą wymagać odświeżenia strony, aby zobaczyć
                    pełny efekt.
                  </p>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-primary" />
                    Użytkownicy (Mock DB)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userProfiles.length > 0 ? (
                    <ScrollArea className="h-[300px] w-full rounded-md border p-2">
                      <div className="space-y-3">
                        {userProfiles.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={user.avatarUrl}
                                alt={user.fullName}
                                data-ai-hint="profile avatar"
                              />
                              <AvatarFallback>
                                {user.fullName?.substring(0, 1).toUpperCase()}
                                {user.fullName
                                  ?.split(" ")[1]
                                  ?.substring(0, 1)
                                  .toUpperCase() ||
                                  user.username
                                    ?.substring(0, 1)
                                    .toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-sm">
                              <p className="font-semibold">
                                {user.fullName}{" "}
                                <span className="text-xs text-muted-foreground">
                                  (@{user.username})
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                            <Badge
                              variant={
                                user.role === "admin"
                                  ? "destructive"
                                  : user.role === "trener"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {user.role || "client"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Brak użytkowników w mockowej bazie danych.
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Lista użytkowników pobierana z MOCK_USER_PROFILES_DB.
                  </p>
                </CardFooter>
              </Card>

              <AddExerciseForm />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nawigacja</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button variant="link" asChild>
                    <Link href="/dashboard/account">
                      Przejdź do Ustawień Konta
                    </Link>
                  </Button>
                  <Button variant="link" asChild>
                    <Link href="/dashboard/settings">
                      Przejdź do Ustawień Aplikacji
                    </Link>
                  </Button>
                  <Button variant="link" asChild>
                    <Link href="/dashboard/profile/current_user_id">
                      Przejdź do Mojego Profilu
                    </Link>
                  </Button>
                  <Button variant="link" asChild>
                    <Link href="/login">Przejdź do Logowania (Wyloguje)</Link>
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
