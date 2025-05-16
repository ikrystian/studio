
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Dumbbell, Search, ListFilter, PlusCircle } from "lucide-react";

export function TrainingPlansPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout - This is the page-specific header, not AppHeader */}
      {/* <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> 
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-6 w-40" /> 
          </div>
          <Skeleton className="h-9 w-32 rounded-md" /> 
        </div>
      </header> */}

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Page Header Section Skeleton */}
          <section className="mb-6 flex justify-between items-center">
            <div>
                <Skeleton className="h-8 w-3/5 mb-2" /> {/* Title: Odkryj Plany Treningowe */}
                <Skeleton className="h-4 w-4/5" />      {/* Description */}
            </div>
            <Skeleton className="h-10 w-32 rounded-md" /> {/* New Plan Button */}
          </section>

          {/* Filter/Search Controls Skeleton */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/30" />
              <Skeleton className="h-10 w-full rounded-lg pl-10" /> {/* Search Input Placeholder */}
            </div>
            <Skeleton className="h-10 w-full sm:w-[220px] rounded-md" /> {/* Select Filter Placeholder */}
          </div>

          <Skeleton className="h-px w-full my-6" /> {/* Separator Placeholder */}

          {/* Plan Cards Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center">
                    <Skeleton className="h-6 w-6 mr-3 rounded-full" />
                    <Skeleton className="h-6 w-3/4" /> {/* Plan Name */}
                  </div>
                  <Skeleton className="h-3 w-1/2 mt-1" /> {/* Goal */}
                  <Skeleton className="h-3 w-1/3 mt-1" /> {/* Duration */}
                </CardHeader>
                <CardContent className="flex-grow space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full rounded-md" /> {/* View Details Button */}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

