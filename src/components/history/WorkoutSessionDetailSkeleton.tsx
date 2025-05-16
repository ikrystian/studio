
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, History as HistoryIcon, Dumbbell, Clock, TrendingUp, ListOrdered, Target, Edit3 } from "lucide-react";

export function WorkoutSessionDetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="sticky top-16 z-30 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50 mb-8">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button */}
            <Skeleton className="h-7 w-7 rounded-full" /> {/* HistoryIcon */}
            <Skeleton className="h-6 w-40" /> {/* Page Title */}
          </div>
          <Skeleton className="h-9 w-32 rounded-md" /> {/* Repeat Workout Button */}
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-6">
          {/* Session Overview Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" /> {/* Workout Name */}
              <Skeleton className="h-4 w-1/2" /> {/* Date */}
              <Skeleton className="h-4 w-1/3" /> {/* Type */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[...Array(2)].map((_, i) => (
                  <div key={`overview-stat-${i}`} className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md sm:col-span-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-32 mb-1 mt-3" /> {/* General Notes Title */}
                <div className="space-y-1 bg-muted/20 p-3 rounded-md">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercises Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" /> {/* ListOrdered Icon */}
                <Skeleton className="h-7 w-48" /> {/* CardTitle "Wykonane Ćwiczenia" */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[...Array(2)].map((_, exerciseIndex) => ( // Simulate 2 exercises
                  <div key={`exercise-skeleton-${exerciseIndex}`} className="pb-4 border-b last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                       <Skeleton className="h-5 w-5 rounded-full" /> {/* Dumbbell Icon */}
                       <Skeleton className="h-6 w-1/2" /> {/* Exercise Name */}
                    </div>
                    <Skeleton className="h-3 w-1/3 mb-2" /> {/* Exercise volume */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead><Skeleton className="h-4 w-10" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                          <TableHead className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableHead>
                          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(3)].map((_, setIndex) => ( // Simulate 3 sets
                          <TableRow key={`set-skeleton-${setIndex}`}>
                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell className="text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
