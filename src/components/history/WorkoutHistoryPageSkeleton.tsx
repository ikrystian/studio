
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { History as HistoryIcon, ArrowLeft, FileDown, Search, ListFilter, CalendarDays, RotateCcw, Clock, Dumbbell } from "lucide-react";

export function WorkoutHistoryPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout - This is the page-specific header, not AppHeader */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button */}
            <Skeleton className="h-8 w-8 rounded-full" /> {/* History Icon */}
            <Skeleton className="h-7 w-48" /> {/* Title */}
          </div>
          <Skeleton className="h-9 w-36 rounded-md" /> {/* Export Button */}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          {/* Calendar Activity Card Skeleton */}
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-7 w-1/2" /> {/* Calendar Title */}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-9 w-9 rounded-md" /> {/* Prev Month Button */}
                <Skeleton className="h-6 w-32" /> {/* Month Name */}
                <Skeleton className="h-9 w-9 rounded-md" /> {/* Next Month Button */}
              </div>
              <div className="grid grid-cols-7 gap-px border-l border-t bg-border">
                {[...Array(7)].map((_, dayLabelIndex) => (
                  <Skeleton key={`daylabel-${dayLabelIndex}`} className="h-8 bg-card border-b border-r" />
                ))}
                {[...Array(35)].map((_, dayIndex) => ( // Simulate 5 weeks of days
                  <Skeleton key={`daycell-${dayIndex}`} className="h-16 sm:h-20 bg-card border-b border-r" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filter Card Skeleton */}
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-7 w-1/3 mb-1" /> {/* Filter Title */}
              <Skeleton className="h-4 w-2/3" />    {/* Filter Description */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/30" />
                  <Skeleton className="h-10 w-full rounded-md pl-10" /> {/* Search Input */}
                </div>
                <Skeleton className="h-10 w-full rounded-md" /> {/* Type Select */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Clear Filters Button */}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Skeleton className="h-10 w-full rounded-md" /> {/* Date From */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Date To */}
              </div>
            </CardContent>
          </Card>

          <Skeleton className="h-px w-full my-6" /> {/* Separator */}

          {/* History List Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-1" /> {/* Workout Name */}
                  <Skeleton className="h-4 w-1/2" /> {/* Date */}
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 rounded-full mr-2" /> {/* Icon */}
                    <Skeleton className="h-4 w-1/3" /> {/* Type */}
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 rounded-full mr-2" /> {/* Icon */}
                    <Skeleton className="h-4 w-1/3" /> {/* Duration */}
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 rounded-full mr-2" /> {/* Icon */}
                    <Skeleton className="h-4 w-1/3" /> {/* Difficulty */}
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" /> {/* Repeat Button */}
                  <Skeleton className="h-9 flex-1 rounded-md" /> {/* View Details Button */}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </main>
    </div>
  );
}
