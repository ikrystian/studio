
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Filter, CalendarDays, TrendingUp, WeightIcon, DumbbellIcon, PieChartIcon, ArrowRightLeft, Target } from "lucide-react"; // Corrected WeightIcon import

export function StatisticsPageSkeleton() {
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
        <div className="container mx-auto space-y-6">
          {/* Global Filter Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" /> {/* Filter Icon */}
                <Skeleton className="h-6 w-1/2" /> {/* Title */}
              </div>
              <Skeleton className="h-4 w-3/4 mt-1" /> {/* Description */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-md" /> {/* DatePicker From */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* DatePicker To */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-md" /> {/* Exercise Select Popover */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Muscle Group Select Popover */}
              </div>
              <Skeleton className="h-10 w-36 rounded-md" /> {/* Apply Filters Button */}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workout Frequency Card Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" /> {/* CalendarDays Icon */}
                  <Skeleton className="h-7 w-1/2" /> {/* Title */}
                </div>
                <Skeleton className="h-4 w-3/4 mt-1" /> {/* Description */}
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-md" /> {/* Chart Area */}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Skeleton className="h-8 w-8 rounded-md mr-1" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardFooter>
            </Card>

            {/* Weight Trend Card Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" /> {/* WeightIcon */}
                  <Skeleton className="h-7 w-1/2" /> {/* Title */}
                </div>
                <Skeleton className="h-4 w-3/4 mt-1" /> {/* Description */}
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-md" /> {/* Chart Area */}
              </CardContent>
              <CardFooter className="justify-between">
                <Skeleton className="h-3 w-1/3" />
                <div className="flex">
                    <Skeleton className="h-8 w-8 rounded-md mr-1" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Exercise Volume Card Skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" /> {/* DumbbellIcon */}
                <Skeleton className="h-7 w-3/4" /> {/* Title */}
              </div>
              <Skeleton className="h-4 w-full mt-1" /> {/* Description */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full sm:w-[300px] rounded-md mb-4" /> {/* Select Exercise */}
              <Skeleton className="h-12 w-full rounded-md mb-4" /> {/* Wellness Checkbox Area */}
              <Skeleton className="h-[350px] w-full rounded-md mt-4" /> {/* Chart Area */}
            </CardContent>
            <CardFooter className="justify-between">
              <Skeleton className="h-3 w-2/3" />
               <div className="flex">
                    <Skeleton className="h-8 w-8 rounded-md mr-1" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </CardFooter>
          </Card>

          {/* Muscle Group Proportion Card Skeleton */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" /> {/* PieChartIcon */}
                <Skeleton className="h-7 w-3/4" /> {/* Title */}
              </div>
              <Skeleton className="h-4 w-full mt-1" /> {/* Description */}
            </CardHeader>
            <CardContent className="flex justify-center">
              <Skeleton className="h-[350px] w-full max-w-lg rounded-md" /> {/* Chart Area */}
            </CardContent>
             <CardFooter className="justify-between">
              <Skeleton className="h-3 w-1/2" />
               <div className="flex">
                    <Skeleton className="h-8 w-8 rounded-md mr-1" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </CardFooter>
          </Card>
          
          {/* Compare Periods Card Skeleton */}
          <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" /> {/* ArrowRightLeft Icon */}
                    <Skeleton className="h-7 w-1/2" /> {/* Title */}
                </div>
                <Skeleton className="h-4 w-3/4 mt-1" /> {/* Description */}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 mt-4">
                    <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                        <Skeleton className="h-5 w-1/3 mx-auto" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                        <Skeleton className="h-5 w-1/3 mx-auto" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </div>
                <Skeleton className="h-10 w-full sm:w-48 rounded-md" /> {/* Compare Button */}
            </CardContent>
          </Card>

          {/* Goals Card Skeleton */}
          <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" /> {/* Target Icon */}
                    <Skeleton className="h-7 w-1/3" /> {/* Title */}
                </div>
                <Skeleton className="h-4 w-2/3 mt-1" /> {/* Description */}
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-1/4" /> {/* List Title */}
                    <Skeleton className="h-9 w-36 rounded-md" /> {/* Add Goal Button */}
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-24 w-full rounded-md" /> {/* Goal Item */}
                    <Skeleton className="h-24 w-full rounded-md" /> {/* Goal Item */}
                </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
