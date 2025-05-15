
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Users, LayoutList, Search, Award, UserCircle, ChevronRight } from 'lucide-react';
// import type { Metadata } from 'next'; // Metadata for client components is handled differently

// export const metadata: Metadata = {
//   title: 'Społeczność | WorkoutWise',
//   description: 'Odkrywaj, łącz się i rywalizuj w społeczności WorkoutWise.',
// };

interface CommunityFeature {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

const communityFeatures: CommunityFeature[] = [
  {
    title: 'Aktualności (Feed)',
    description: 'Zobacz najnowsze posty i aktywności od osób, które obserwujesz.',
    href: '/dashboard/community/feed',
    icon: LayoutList,
  },
  {
    title: 'Odkrywaj',
    description: 'Znajdź nowych użytkowników, ciekawe treningi i inspirujące plany.',
    href: '/dashboard/community/discover',
    icon: Search,
  },
  {
    title: 'Rankingi',
    description: 'Sprawdź, jak wypadasz na tle innych w różnych kategoriach.',
    href: '/dashboard/community/rankings',
    icon: Award,
  },
  {
    title: 'Mój Profil',
    description: 'Zobacz i edytuj swój publiczny profil społecznościowy.',
    href: '/dashboard/profile/current_user_id', // Using mock current_user_id
    icon: UserCircle,
  },
];

export default function CommunityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        {/* Adjust top based on AppHeader height */}
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Panelu</span>
              </Link>
            </Button>
            <Users className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Społeczność WorkoutWise</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:py-6">
        <div className="container mx-auto max-w-4xl space-y-8">
          <section className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Witaj w Społeczności!</h2>
            <p className="text-muted-foreground">
              Tutaj możesz łączyć się z innymi, dzielić swoimi postępami, odkrywać nowe treningi i motywować się nawzajem.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {communityFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.href} className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <IconComponent className="mr-3 h-6 w-6 text-primary" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={feature.href}>
                        Przejdź <ChevronRight className="ml-auto h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
           <Card className="mt-8">
            <CardHeader>
                <CardTitle>Co Dalej?</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Uzupełnij swój profil, aby inni mogli Cię lepiej poznać.</li>
                    <li>Sprawdź sekcję "Odkrywaj", aby znaleźć interesujących użytkowników lub plany treningowe.</li>
                    <li>Podziel się swoim ostatnim treningiem w "Aktualnościach"!</li>
                </ul>
            </CardContent>
           </Card>

        </div>
      </main>
    </div>
  );
}
