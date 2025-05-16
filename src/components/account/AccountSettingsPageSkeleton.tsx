
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList } from "@/components/ui/tabs";

export function AccountSettingsPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Page Sub-Header Skeleton - This mimics the header part of the account page itself */}
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button placeholder */}
            <Skeleton className="h-7 w-7 rounded-full" /> {/* Settings icon placeholder */}
            <Skeleton className="h-6 w-32" /> {/* Page Title placeholder */}
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          {/* Tabs Skeleton */}
          <Tabs defaultValue="personal-data" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </TabsList>

            {/* Tab Content Skeleton (showing one tab's content for simplicity) */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-7 w-48 mb-2" /> {/* CardTitle */}
                    <Skeleton className="h-4 w-72" />    {/* CardDescription */}
                  </div>
                  <Skeleton className="h-9 w-24 rounded-md" /> {/* Edit Button */}
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6"> {/* Added pt-6 to match CardContent's default padding */}
                {/* Simulate data lines */}
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex justify-between py-2 border-b last:border-b-0">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
                {/* Simulate form fields for edit mode (optional, can be simpler) */}
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
                    <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
                    <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
                    <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-28 rounded-md" />
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
