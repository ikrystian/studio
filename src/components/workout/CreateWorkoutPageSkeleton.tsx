
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowLeft, PlusCircle, Save, PlusSquare, ChevronUp, ChevronDown, Trash2 } from "lucide-react";

export function CreateWorkoutPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button */}
            <Skeleton className="h-7 w-48" /> {/* Title */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-40 rounded-md" /> {/* Quick Add Exercise Button */}
            <Skeleton className="h-9 w-32 rounded-md" /> {/* Save Workout Button */}
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-8">
          {/* Workout Details Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2 mb-1" /> {/* CardTitle */}
              <Skeleton className="h-4 w-3/4" />    {/* CardDescription */}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" /> {/* FormLabel */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
                <Skeleton className="h-3 w-1/2" /> {/* FormDescription */}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" /> {/* FormLabel */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
                <Skeleton className="h-3 w-1/2" /> {/* FormDescription */}
              </div>
            </CardContent>
          </Card>

          {/* Exercises Card Skeleton */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <Skeleton className="h-7 w-1/3 mb-1" /> {/* CardTitle */}
                <Skeleton className="h-4 w-2/3" />    {/* CardDescription */}
              </div>
              <Skeleton className="h-9 w-36 rounded-md" /> {/* Add from Database Button */}
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center text-muted-foreground">
                <Dumbbell className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                <Skeleton className="h-5 w-1/2 mx-auto mb-1" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
              {/* Or simulate a few exercise item skeletons */}
              <div className="space-y-6 mt-4">
                {[...Array(1)].map((_, index) => (
                  <Card key={index} className="bg-card p-4 shadow-md">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2 flex-grow min-w-0">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-3/4" />
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Skeleton className="h-4 w-1/3 mb-1" />
                          <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-1/3 mb-1" />
                          <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4 mt-8">
            <Skeleton className="h-10 w-24 rounded-md" /> {/* Cancel Button */}
            <Skeleton className="h-10 w-32 rounded-md" /> {/* Save Button */}
          </div>
        </div>
      </main>
    </div>
  );
}
