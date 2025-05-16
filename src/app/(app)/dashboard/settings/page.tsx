
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ChevronRight, Bell, Activity, Settings as SettingsIcon, ListChecks, Loader2 } from 'lucide-react';

const settingsOptions = [
  {
    title: 'Przypomnienia o treningu',
    description: 'Skonfiguruj powiadomienia przypominające o zaplanowanych treningach.',
    href: '/dashboard/settings/reminders',
    icon: Bell,
  },
  {
    title: 'Integracje z Aplikacjami Zdrowotnymi',
    description: 'Połącz z Apple Health lub Google Fit, aby synchronizować dane.',
    href: '/dashboard/settings/health-integrations',
    icon: Activity, 
  },
  {
    title: 'Modelowanie Progresji Obciążenia',
    description: 'Dostosuj, jak aplikacja sugeruje progresję w Twoich treningach.',
    href: '/dashboard/settings/progression-model',
    icon: SettingsIcon, 
  },
  {
    title: 'Dostosuj Szybkie Akcje Dashboardu',
    description: 'Wybierz, które skróty mają być widoczne na Twoim pulpicie.',
    href: '/dashboard/settings/quick-actions',
    icon: ListChecks, 
  },
];

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Simulate loading delay
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            <p className="mt-4 text-muted-foreground">Ładowanie ustawień...</p>
        </div>
      );
  }

  return (
    <>
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl space-y-6">
          {settingsOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Link href={option.href} key={option.href} passHref>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center">
                      <IconComponent className="h-6 w-6 text-primary mr-3" />
                      <CardTitle className="text-lg font-medium">{option.title}</CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{option.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
           {settingsOptions.length === 0 && (
            <p className="text-muted-foreground text-center">Brak dostępnych opcji ustawień.</p>
          )}
        </div>
      </main>
    </>
  );
}
