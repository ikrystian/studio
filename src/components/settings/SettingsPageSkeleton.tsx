
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function SettingsPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout - page specific */}
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button placeholder */}
            <Skeleton className="h-7 w-7 rounded-full" /> {/* Settings icon placeholder */}
            <Skeleton className="h-6 w-48" /> {/* Page Title placeholder */}
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl space-y-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center">
                  <Skeleton className="h-6 w-6 mr-3 rounded-full" /> {/* Icon placeholder */}
                  <Skeleton className="h-6 w-1/2" /> {/* Setting Title placeholder */}
                </div>
                <Skeleton className="h-5 w-5 rounded-sm" /> {/* Chevron placeholder */}
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4" /> {/* Setting Description placeholder */}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
