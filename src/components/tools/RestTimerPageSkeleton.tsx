
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { TimerIcon, Play, RotateCcw } from "lucide-react";

export function RestTimerPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout - assumed handled globally or by page itself */}
      {/* This skeleton focuses on the content of the rest timer page */}
      {/* <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> 
            <Skeleton className="h-7 w-7 rounded-full" /> 
            <Skeleton className="h-6 w-48" /> 
          </div>
        </div>
      </header> */}

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-md space-y-8">
          {/* Set Time Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-3/4" /> {/* CardTitle */}
              <Skeleton className="h-4 w-full" /> {/* CardDescription */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-16" /> {/* Label */}
                  <Skeleton className="h-12 w-full rounded-md" /> {/* Input */}
                </div>
                <Skeleton className="h-8 w-4 pb-2" /> {/* Colon */}
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-16" /> {/* Label */}
                  <Skeleton className="h-12 w-full rounded-md" /> {/* Input */}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timer Display Card Skeleton */}
          <Card>
            <CardHeader className="items-center text-center">
              <Skeleton className="h-16 w-48 mx-auto" /> {/* Timer Display */}
              <Skeleton className="h-4 w-32 mx-auto mt-1" /> {/* Description */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full rounded-full mb-6" /> {/* Progress Bar */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Skeleton className="h-9 w-full rounded-md" /> {/* Adjust Time Button */}
                <Skeleton className="h-9 w-full rounded-md" /> {/* Adjust Time Button */}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-14 flex-1 rounded-md" /> {/* Start/Pause Button */}
                <Skeleton className="h-14 flex-1 rounded-md" /> {/* Reset Button */}
              </div>
            </CardContent>
            <CardFooter className="justify-center">
                <Skeleton className="h-5 w-36" /> {/* Status message placeholder */}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
