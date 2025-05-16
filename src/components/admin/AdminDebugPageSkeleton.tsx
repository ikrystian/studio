
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert"; // Keep Alert for consistency if used in main page

export function AdminDebugPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" /> {/* Bug icon */}
                <Skeleton className="h-7 w-3/4" /> {/* Title */}
              </div>
              <Skeleton className="h-4 w-1/2 mt-1" /> {/* Description */}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-destructive/10"> {/* Alert Skeleton */}
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-5/6" />
              </div>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" /> {/* Section Title */}
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" /> {/* Section Title */}
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-3 w-full" />
                </CardFooter>
              </Card>

              {/* Users Section Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" /> {/* Section Title: Users */}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 h-[300px] w-full rounded-md border p-2 overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-md">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-3 w-2/3" />
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" /> {/* Section Title: Navigation */}
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-36 rounded-md" />
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-5 w-44 rounded-md" />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
