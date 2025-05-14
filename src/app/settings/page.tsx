
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ChevronRight, Bell, Activity } from 'lucide-react'; // Added Activity for Health Integrations

export const metadata: Metadata = {
  title: 'Ustawienia | WorkoutWise',
  description: 'Zarządzaj ustawieniami aplikacji WorkoutWise.',
};

const settingsOptions = [
  {
    title: 'Przypomnienia o treningu',
    description: 'Skonfiguruj powiadomienia przypominające o zaplanowanych treningach.',
    href: '/settings/reminders',
    icon: Bell,
  },
  {
    title: 'Integracje z Aplikacjami Zdrowotnymi',
    description: 'Połącz z Apple Health lub Google Fit, aby synchronizować dane.',
    href: '/settings/health-integrations',
    icon: Activity, // Using Activity as a placeholder icon
  },
  // Future settings can be added here
  // {
  //   title: 'Profil',
  //   description: 'Zarządzaj danymi swojego profilu.',
  //   href: '/profile/edit', // Or a dedicated profile settings page
  //   icon: User,
  // },
  // {
  //   title: 'Prywatność',
  //   description: 'Ustawienia prywatności konta i danych.',
  //   href: '/settings/privacy',
  //   icon: ShieldCheck,
  // },
];

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Panelu</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Ustawienia</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
    </div>
  );
}
