
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList } from "@/components/ui/tabs"; // Simplified Tabs for skeleton

export function ProfilePageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header for profile page actions (like Edit button) */}
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button placeholder */}
            <Skeleton className="h-7 w-7 rounded-full" /> {/* UserIcon placeholder */}
            <Skeleton className="h-6 w-40" /> {/* Page Title placeholder */}
          </div>
          <Skeleton className="h-9 w-28 rounded-md" /> {/* Edit Profile Button placeholder */}
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Profile Header Card Skeleton */}
          <Card className="mb-8">
            <CardHeader className="flex flex-col items-center space-y-4 p-6 sm:flex-row sm:space-y-0 sm:space-x-6">
              <Skeleton className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-2 border-primary/30" /> {/* Avatar */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <Skeleton className="h-8 w-3/4 sm:w-1/2" /> {/* Full Name */}
                <Skeleton className="h-6 w-1/2 sm:w-1/3" /> {/* Username */}
                <Skeleton className="h-5 w-20 mt-1" /> {/* Role Badge */}
                <Skeleton className="h-4 w-1/3 mt-1" /> {/* Fitness Level */}
                <Skeleton className="h-3 w-2/5 mt-1" /> {/* Join Date */}
              </div>
              <Skeleton className="h-10 w-32 rounded-md mt-4 sm:mt-0" /> {/* Follow/Edit Button */}
            </CardHeader>
            <CardContent className="border-t pt-4">
              <Skeleton className="h-4 w-full mb-1" /> {/* Bio line 1 */}
              <Skeleton className="h-4 w-3/4" /> {/* Bio line 2 */}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-around gap-4 border-t pt-4 text-center">
              <div className="flex flex-col items-center space-y-1">
                <Skeleton className="h-7 w-10" /> {/* Stat count */}
                <Skeleton className="h-3 w-20" /> {/* Stat label */}
              </div>
              <Skeleton className="h-10 w-px bg-border hidden sm:block" />
              <div className="flex flex-col items-center space-y-1">
                <Skeleton className="h-7 w-10" /> {/* Stat count */}
                <Skeleton className="h-3 w-20" /> {/* Stat label */}
              </div>
              <Skeleton className="h-9 w-40 rounded-md sm:ml-auto mt-2 sm:mt-0" /> {/* Privacy Settings Button */}
            </CardFooter>
          </Card>

          {/* Tabs Skeleton */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </TabsList>

            {/* Activity Tab Skeleton Content */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" /> {/* Tab Title: "Ostatnia Aktywność" */}
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                      <Skeleton className="h-5 w-5 rounded-full mt-1" /> {/* Icon */}
                      <div className="flex-grow space-y-1.5">
                        <Skeleton className="h-5 w-3/4" /> {/* Activity Title */}
                        <Skeleton className="h-3 w-1/2" /> {/* Timestamp */}
                        <Skeleton className="h-4 w-full" /> {/* Details (optional) */}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
