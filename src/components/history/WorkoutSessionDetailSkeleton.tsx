
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Info, History as HistoryIcon } from "lucide-react";

export function WorkoutSessionDetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 md:p-8 text-foreground">
      {/* Header Skeleton */}
      <header className="sticky top-16 z-30 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50 mb-8">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button placeholder */}
            <Skeleton className="h-7 w-7 rounded-full" /> {/* HistoryIcon placeholder */}
            <Skeleton className="h-6 w-48" /> {/* Page Title placeholder */}
          </div>
        </div>
      </header>

      {/* Card Skeleton */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-2xl">
            <Skeleton className="h-7 w-7 rounded-full" /> {/* Info icon placeholder */}
            <Skeleton className="h-7 w-40" /> {/* CardTitle placeholder */}
          </div>
          <Skeleton className="h-4 w-60 mt-1" /> {/* CardDescription placeholder */}
        </CardHeader>
        <CardContent className="text-center">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-6 mx-auto" />
          
          <Skeleton className="h-4 w-1/3 mb-2 mx-auto" />
          <div className="space-y-2 my-4 mx-auto w-3/4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Skeleton className="h-10 w-56 rounded-md" /> {/* Back to History Button placeholder */}
        </CardFooter>
      </Card>
    </div>
  );
}
