
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

export function CommunityDiscoverPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout - page specific */}
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button placeholder */}
            <Skeleton className="h-7 w-7 rounded-full" /> {/* Search icon placeholder */}
            <Skeleton className="h-6 w-32" /> {/* Page Title placeholder */}
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Tabs defaultValue="recommended" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 mb-6"> {/* Adjusted for potential 5th tab */}
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" /> {/* Trainers Tab */}
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md hidden md:block" /> {/* Map tab */}
            </TabsList>

            {/* Recommended Tab Skeleton */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-1/2 mb-1" /> {/* CardTitle */}
                  <Skeleton className="h-4 w-3/4" />    {/* CardDescription */}
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Recommended Users Skeleton */}
                  <div>
                    <Skeleton className="h-6 w-1/3 mb-3" /> {/* Section Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(2)].map((_, i) => (
                        <Card key={`user-rec-skel-${i}`}>
                          <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-16 mt-1" /> {/* Badge Placeholder */}
                            </div>
                          </CardHeader>
                          <CardContent><Skeleton className="h-4 w-full" /></CardContent>
                          <CardFooter className="gap-2">
                            <Skeleton className="h-9 w-24 rounded-md" />
                            <Skeleton className="h-9 w-24 rounded-md" />
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <Skeleton className="h-px w-full" /> {/* Separator */}
                  {/* Recommended Content Skeleton */}
                  <div>
                    <Skeleton className="h-6 w-1/3 mb-3" /> {/* Section Title */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(2)].map((_, i) => (
                        <Card key={`content-rec-skel-${i}`}>
                            <Skeleton className="h-40 w-full rounded-t-lg" />
                            <CardHeader>
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                            <CardFooter><Skeleton className="h-9 w-28 rounded-md" /></CardFooter>
                        </Card>
                        ))}
                    </div>
                  </div>
                </CardContent>
                 <CardFooter>
                    <Skeleton className="h-9 w-44 rounded-md" />
                 </CardFooter>
              </Card>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
