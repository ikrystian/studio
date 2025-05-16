
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Users, MessageSquare, Search, Trophy } from "lucide-react";

const communityFeatures = [
  {
    title: "Aktualności (Feed)",
    description: "Zobacz najnowsze posty i aktywności od osób, które obserwujesz.",
    href: "/dashboard/community/feed",
    icon: MessageSquare,
  },
  {
    title: "Odkrywaj",
    description: "Znajdź nowych użytkowników, treningi i plany udostępnione przez społeczność.",
    href: "/dashboard/community/discover",
    icon: Search,
  },
  {
    title: "Rankingi",
    description: "Sprawdź, jak wypadasz na tle innych użytkowników w różnych kategoriach.",
    href: "/dashboard/community/rankings",
    icon: Trophy,
  },
];

export default function CommunityHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
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

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Witaj w Społeczności!</CardTitle>
              <CardDescription>
                Łącz się z innymi, dziel się postępami, odkrywaj nowe treningi i motywujcie się nawzajem.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Link href={feature.href} key={feature.href} passHref>
                  <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-lg text-center">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground text-center">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
