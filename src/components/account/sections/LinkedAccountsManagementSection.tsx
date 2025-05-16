
"use client";

import * as React from "react";
import { Link2 as LinkIcon, Info } from "lucide-react"; // Renamed Link2 to LinkIcon

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function LinkedAccountsManagementSection() {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><LinkIcon className="mr-0 h-5 w-5 text-primary" />Połączone Konta</CardTitle><CardDescription>Zarządzaj kontami Google, Facebook itp. połączonymi z Twoim profilem.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <Alert><Info className="h-4 w-4" /><AlertTitle>Funkcja w Budowie</AlertTitle><AlertDescription>Możliwość łączenia kont z serwisami takimi jak Google czy Facebook zostanie dodana w przyszłości.</AlertDescription></Alert>
        <div className="p-4 border rounded-lg"><h4 className="font-semibold">Google</h4><p className="text-sm text-muted-foreground mb-2">Status: Niepołączono</p><Button variant="outline" disabled>Połącz z Google (Wkrótce)</Button></div>
        <div className="p-4 border rounded-lg"><h4 className="font-semibold">Facebook</h4><p className="text-sm text-muted-foreground mb-2">Status: Niepołączono</p><Button variant="outline" disabled>Połącz z Facebook (Wkrótce)</Button></div>
      </CardContent>
    </Card>
  );
}
