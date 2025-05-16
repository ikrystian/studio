
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function TrainingPlanDetailPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout - assume this is handled globally */}
      {/* This skeleton is for the content of the detail page itself */}
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button */}
            <Skeleton className="h-7 w-7 rounded-full" /> {/* Icon */}
            <Skeleton className="h-6 w-48" /> {/* Page Title */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-md" /> {/* Edit Button */}
            {/* <Skeleton className="h-9 w-32 rounded-md" /> Start Plan Button */}
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-8">
          {/* Plan Overview Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-10 w-3/4 mb-2" /> {/* Plan Name */}
              <Skeleton className="h-4 w-full mb-1" /> {/* Description line 1 */}
              <Skeleton className="h-4 w-5/6 mb-3" /> {/* Description line 2 */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded-full" /> <Skeleton className="h-4 w-16" /> <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded-full" /> <Skeleton className="h-4 w-20" /> <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded-full" /> <Skeleton className="h-4 w-12" /> <Skeleton className="h-4 w-28" />
                </div>
              </div>
               <Skeleton className="h-5 w-24 mt-2" /> {/* Public Badge */}
            </CardHeader>
          </Card>

          {/* Weekly Schedule Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2 mb-1" /> {/* "Harmonogram Tygodniowy" */}
              <Skeleton className="h-4 w-3/4" />    {/* Description */}
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, index) => ( // Simulate a few days
                <Card key={index} className="bg-muted/20 p-4 shadow-sm">
                  <Skeleton className="h-6 w-1/3 mb-3" /> {/* Day Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-5 w-3/5" /> {/* Workout Name or Rest */}
                    </div>
                    <Skeleton className="h-9 w-full sm:w-40 rounded-md" /> {/* Start Day Button */}
                  </div>
                  <Skeleton className="h-3 w-2/3 mt-2" /> {/* Notes */}
                </Card>
              ))}
            </CardContent>
          </Card>
           <div className="flex justify-end items-center gap-3 mt-6">
                <Skeleton className="h-9 w-36 rounded-md" /> {/* Duplicate Plan Button */}
                <Skeleton className="h-9 w-28 rounded-md" /> {/* Delete Plan Button */}
            </div>
        </div>
      </main>
    </div>
  );
}
