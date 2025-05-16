
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trophy, Filter, Search as SearchIcon, PlusCircle, LineChart as LineChartIcon, Edit, Trash2 } from "lucide-react";

export function PersonalBestsPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout - This is the page-specific header */}
      {/* <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> 
            <Skeleton className="h-7 w-7 rounded-full" /> 
            <Skeleton className="h-6 w-40" /> 
          </div>
          <Skeleton className="h-9 w-32 rounded-md" /> 
        </div>
      </header> */}

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto space-y-8">
          <div className="flex justify-end">
            <Skeleton className="h-10 w-36 rounded-md" /> {/* Add Record Button */}
          </div>

          {/* Filter Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" /> {/* Filter Icon */}
                <Skeleton className="h-6 w-1/3" /> {/* Filter Title */}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/30" />
                <Skeleton className="h-10 w-full rounded-md pl-10" /> {/* Search Input */}
              </div>
              <Skeleton className="h-10 w-full sm:w-[280px] rounded-md" /> {/* Exercise Select */}
            </CardContent>
          </Card>

          {/* Personal Bests Table Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" /> {/* Award Icon */}
                <Skeleton className="h-7 w-1/2" /> {/* PB Title */}
              </div>
              <Skeleton className="h-4 w-3/4" /> {/* PB Description */}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
                    <TableHead className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
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
            <CardFooter>
              <Skeleton className="h-4 w-1/3" /> {/* Displaying X records */}
            </CardFooter>
          </Card>

          {/* Badges Card Skeleton */}
          <Card>
             <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-1/3" /> {/* Badges Title */}
              </div>
              <Skeleton className="h-4 w-2/3" /> {/* Badges Description */}
            </CardHeader>
            <CardContent>
                <Skeleton className="h-12 w-full mb-4" /> {/* Alert placeholder */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-3 border rounded-lg bg-muted/50">
                            <Skeleton className="h-10 w-10 rounded-full mb-2" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
