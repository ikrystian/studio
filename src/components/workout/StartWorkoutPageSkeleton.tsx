
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Dumbbell, Search, ListFilter, PlusCircle, PlayCircle } from "lucide-react";

export function StartWorkoutPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" /> {/* Icon placeholder */}
            <Skeleton className="h-7 w-40" /> {/* Title placeholder */}
          </div>
          <Skeleton className="h-9 w-32 rounded-md" /> {/* New Workout Button Placeholder */}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          {/* Unfinished Workout Card Skeleton (if applicable) */}
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-4 w-3/4 mt-1" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-5 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/3" />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-10 w-full sm:flex-1 rounded-md" />
                <Skeleton className="h-10 w-full sm:flex-1 rounded-md" />
            </CardFooter>
          </Card>
          
          {/* Page Header Section Skeleton */}
          <section className="mb-8">
            <Skeleton className="h-8 w-3/5 mb-2" /> {/* Title: Wybierz Trening z Listy */}
            <Skeleton className="h-4 w-4/5" />      {/* Description */}
          </section>

          {/* Filter/Search Controls Skeleton */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/30" />
              <Skeleton className="h-10 w-full rounded-lg pl-10" /> {/* Search Input Placeholder */}
            </div>
            <Skeleton className="h-10 w-full sm:w-[200px] rounded-md" /> {/* Select Filter Placeholder */}
          </div>

          <Skeleton className="h-px w-full my-6" /> {/* Separator Placeholder */}

          {/* Workout Cards Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center">
                    <Skeleton className="h-6 w-6 mr-2 rounded-full" />
                    <Skeleton className="h-6 w-3/4" /> {/* Workout Name */}
                  </div>
                  <Skeleton className="h-4 w-1/2 mt-1" /> {/* Type & Duration */}
                </CardHeader>
                <CardContent className="flex-grow">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full rounded-md" /> {/* Start Button */}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
