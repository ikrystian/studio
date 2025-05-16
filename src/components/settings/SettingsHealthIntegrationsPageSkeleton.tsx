
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Activity, Info } from "lucide-react"; // Added Info

export function SettingsHealthIntegrationsPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-6 w-64" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-2xl space-y-8">
          <div className="p-4 border rounded-lg bg-muted/30"> {/* Alert Skeleton */}
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-5/6" />
          </div>

          {[...Array(2)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full sm:w-56 rounded-md" />
                <Skeleton className="h-4 w-3/4 mt-3" />
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Skeleton className="h-3 w-full" />
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
