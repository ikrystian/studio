
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ListChecks, CalendarDays, HeartPulse } from "lucide-react";

export function WellnessJournalPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout - page specific */}
      {/* <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> 
            <Skeleton className="h-7 w-7 rounded-full" /> 
            <Skeleton className="h-6 w-48" /> 
          </div>
        </div>
      </header> */}

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto space-y-8">
          {/* Add New Entry Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" /> {/* ListChecks Icon */}
                <Skeleton className="h-7 w-1/2" /> {/* CardTitle */}
              </div>
              <Skeleton className="h-4 w-3/4" /> {/* CardDescription */}
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full sm:w-[280px] rounded-md" /> {/* Date Picker */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => ( // 6 select fields
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-1/3" /> {/* Label */}
                    <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-1/4" /> {/* Label */}
                <Skeleton className="h-20 w-full rounded-md" /> {/* Textarea */}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-32 rounded-md" /> {/* Save Button */}
            </CardFooter>
          </Card>

          {/* Entry History Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" /> {/* CalendarDays Icon */}
                <Skeleton className="h-7 w-1/3" /> {/* CardTitle */}
              </div>
              <Skeleton className="h-4 w-2/3" /> {/* CardDescription */}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(5)].map((_, i) => ( // 5 Table Heads
                      <TableHead key={i} className={i > 3 ? "hidden sm:table-cell" : ""}>
                        <Skeleton className="h-4 w-full" />
                      </TableHead>
                    ))}
                    <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, rowIndex) => ( // 3 Rows
                    <TableRow key={rowIndex}>
                      {[...Array(5)].map((_, cellIndex) => (
                        <TableCell key={cellIndex} className={cellIndex > 3 ? "hidden sm:table-cell" : ""}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
