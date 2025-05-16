
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, Bug, ArrowLeft, Trash2, RefreshCcw, Database, Users, Info, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { useToast } from "@/hooks/use-toast";

export default function AdminDebugPage() {
    const { toast } = useToast();
    const [localStorageSize, setLocalStorageSize] = React.useState<string>("0 KB");
    const [userCount, setUserCount] = React.useState<number>(0);


    React.useEffect(() => {
        if (typeof window !== 'undefined') {
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
        setUserCount(MOCK_USER_PROFILES_DB.length);
    }, []);


    const handleClearLocalStorage = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            toast({ title: "LocalStorage Wyczyczone!", description: "Wszystkie dane lokalne zostały usunięte. Odśwież stronę.", variant: "default" });
            setLocalStorageSize("0 KB"); 
            // Note: This might log the user out if auth state depends on localStorage
        }
    };

    const handleResetMockUsers = () => {
        // This is a bit tricky as MOCK_USER_PROFILES_DB is imported and not easily mutable globally
        // For a real app, this would be an API call to reset database state.
        // For this simulation, we can only clear what's in localStorage perhaps.
        if (typeof window !== 'undefined') {
            localStorage.removeItem('currentUserProfileData');
             // Remove specific test user data if that's what reset means
             // or reload MOCK_USER_PROFILES_DB (if it were stateful)
             // MOCK_USER_PROFILES_DB remains constant in this example
        }
        toast({ title: "Symulacja Resetu Użytkowników", description: "W prawdziwej aplikacji to zresetowałoby bazę użytkowników. Obecnie tylko czyści 'currentUserProfileData'.", variant: "default" });
        setUserCount(MOCK_USER_PROFILES_DB.length); // It won't change as MOCK_USER_PROFILES_DB is const
    };
    

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
             {/* Header part of AppLayout */}
            <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-3xl space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bug className="h-6 w-6 text-destructive"/>Panel Debugowania Administratora</CardTitle>
                            <CardDescription>Narzędzia i informacje do debugowania aplikacji.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert variant="destructive">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Uwaga!</AlertTitle>
                                <AlertDescription>
                                    Ten panel zawiera narzędzia, które mogą wpłynąć na działanie aplikacji. Używaj ostrożnie.
                                </AlertDescription>
                            </Alert>

                            <Card>
                                <CardHeader><CardTitle className="text-lg">Informacje Systemowe (Mock)</CardTitle></CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p><strong>Środowisko:</strong> Rozwojowe (Symulacja)</p>
                                    <p><strong>Wersja Aplikacji:</strong> 1.0.0-beta (Symulacja)</p>
                                    <p><strong>Rozmiar LocalStorage:</strong> {localStorageSize}</p>
                                    <p><strong>Liczba Użytkowników (Mock DB):</strong> {userCount}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="text-lg">Akcje Debugowania</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button variant="destructive" onClick={handleClearLocalStorage}>
                                        <Trash2 className="mr-2"/> Wyczyść LocalStorage
                                    </Button>
                                    <Button variant="outline" onClick={handleResetMockUsers}>
                                        <RefreshCcw className="mr-2"/> Resetuj Mock Użytkowników (Symulacja)
                                    </Button>
                                     <Button variant="outline" onClick={() => toast({title: "Test Toast", description: "To jest testowe powiadomienie."})}>
                                        <Info className="mr-2"/> Pokaż Testowy Toast
                                    </Button>
                                    <Button variant="outline" onClick={() => {throw new Error("Testowy błąd Sentry/Monitorowania (Symulacja)")}}>
                                        <AlertTriangle className="mr-2"/> Wygeneruj Błąd Testowy
                                    </Button>
                                </CardContent>
                                <CardFooter>
                                    <p className="text-xs text-muted-foreground">
                                        Niektóre akcje mogą wymagać odświeżenia strony, aby zobaczyć pełny efekt.
                                    </p>
                                </CardFooter>
                            </Card>
                            
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Nawigacja</CardTitle></CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                     <Button variant="link" asChild><Link href="/dashboard/account">Przejdź do Ustawień Konta</Link></Button>
                                     <Button variant="link" asChild><Link href="/dashboard/settings">Przejdź do Ustawień Aplikacji</Link></Button>
                                     <Button variant="link" asChild><Link href="/dashboard/profile/current_user_id">Przejdź do Mojego Profilu</Link></Button>
                                     <Button variant="link" asChild><Link href="/login">Przejdź do Logowania (Wyloguje)</Link></Button>
                                </CardContent>
                            </Card>

                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
