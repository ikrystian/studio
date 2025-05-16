
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Scale, CalendarDays, LineChart, Download, PlusCircle } from "lucide-react";

export function MeasurementsPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header elements are part of AppHeader, this skeleton focuses on page content */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto space-y-8">
          <div className="flex justify-end">
            <Skeleton className="h-10 w-40 rounded-md" /> {/* Add Measurement Button */}
          </div>

          {/* Measurements Table Card Skeleton */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" /> {/* CalendarDays Icon */}
                  <Skeleton className="h-7 w-48" /> {/* Title */}
                </div>
                <Skeleton className="h-4 w-72 mt-1" /> {/* Description */}
              </div>
              <Skeleton className="h-9 w-44 rounded-md" /> {/* Export Button */}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead> {/* Date */}
                    <TableHead className="text-right"><Skeleton className="h-4 w-16" /></TableHead> {/* Weight */}
                    <TableHead className="text-right"><Skeleton className="h-4 w-16" /></TableHead> {/* BMI */}
                    {[...Array(3)].map((_, i) => ( // Simulate a few body part columns
                       <TableHead key={`bp-head-skel-${i}`} className="text-right hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableHead>
                    ))}
                    <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableHead> {/* Notes */}
                    <TableHead className="text-right"><Skeleton className="h-4 w-16" /></TableHead> {/* Actions */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, rowIndex) => (
                    <TableRow key={`row-skel-${rowIndex}`}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
                       {[...Array(3)].map((_, i) => (
                        <TableCell key={`bp-cell-skel-${rowIndex}-${i}`} className="text-right hidden sm:table-cell"><Skeleton className="h-5 w-10" /></TableCell>
                      ))}
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Progress Chart Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" /> {/* LineChart Icon */}
                <Skeleton className="h-7 w-40" /> {/* Title */}
              </div>
              <Skeleton className="h-4 w-64 mt-1" /> {/* Description */}
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Skeleton className="h-10 w-full sm:w-[280px] rounded-md" /> {/* Select Metric Dropdown */}
              </div>
              <Skeleton className="h-[300px] w-full rounded-md" /> {/* Chart Area */}
            </CardContent>
            <CardFooter>
              <Skeleton className="h-3 w-full" /> {/* Chart Footer Description */}
            </CardFooter>
          </Card>

          {/* Reminder Settings Card Skeleton */}
          <Card>
            <CardHeader>
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" /> {/* Activity Icon */}
                    <Skeleton className="h-7 w-56" /> {/* Title */}
                </div>
              <Skeleton className="h-4 w-72 mt-1" /> {/* Description */}
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-12 w-full rounded-md" /> {/* Alert Placeholder */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-10 rounded-full" /> {/* Switch */}
                <Skeleton className="h-5 w-48" /> {/* Label */}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
