
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { BellRing } from "lucide-react";

export function SettingsRemindersPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-6 w-56" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-2xl">
          <form className="space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full rounded-md" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>

                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />

                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
                
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}
