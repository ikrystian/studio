
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export function CommunityHomePageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout - This is the page-specific header */}
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button placeholder */}
            <Skeleton className="h-7 w-7 rounded-full" /> {/* Users icon placeholder */}
            <Skeleton className="h-6 w-48" /> {/* Page Title placeholder */}
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          {/* Welcome Card Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-8 w-3/5 mb-2" /> {/* CardTitle */}
              <Skeleton className="h-4 w-full" />    {/* CardDescription line 1 */}
              <Skeleton className="h-4 w-5/6" />    {/* CardDescription line 2 */}
            </CardHeader>
          </Card>

          {/* Feature Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-center mb-3">
                    <Skeleton className="h-14 w-14 rounded-full" /> {/* Icon component placeholder */}
                  </div>
                  <Skeleton className="h-6 w-3/4 mx-auto" /> {/* CardTitle */}
                </CardHeader>
                <CardContent className="flex-grow space-y-1">
                  <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
                  <Skeleton className="h-4 w-5/6" /> {/* Description line 2 */}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
