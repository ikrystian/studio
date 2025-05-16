
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

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
              <Alert variant="destructive" className="p-4">
                <Skeleton className="h-4 w-4 inline-block mr-2" /> {/* Info icon */}
                <Skeleton className="h-5 w-24 inline-block mb-1" /> {/* AlertTitle */}
                <Skeleton className="h-4 w-full" /> {/* AlertDescription line 1 */}
                <Skeleton className="h-4 w-5/6" /> {/* AlertDescription line 2 */}
              </Alert>

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

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" /> {/* Section Title */}
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
