
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function EditTrainingPlanPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
         <div className="flex justify-end mb-4">
            <Skeleton className="h-10 w-36 rounded-md" /> {/* Save Changes button */}
         </div>
          <form className="space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-1/2 mb-1" /> {/* CardTitle */}
                <Skeleton className="h-4 w-3/4" />    {/* CardDescription */}
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-4 w-1/4" /> {/* FormLabel */}
                <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
                
                <Skeleton className="h-4 w-1/4" /> {/* FormLabel */}
                <Skeleton className="h-20 w-full rounded-md" /> {/* Textarea */}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <Skeleton className="h-4 w-1/3 mb-1" /> {/* FormLabel */}
                        <Skeleton className="h-10 w-full rounded-md" /> {/* DatePicker */}
                    </div>
                    <div>
                        <Skeleton className="h-4 w-1/3 mb-1" /> {/* FormLabel */}
                        <Skeleton className="h-10 w-full rounded-md" /> {/* DatePicker */}
                    </div>
                </div>
                <div>
                    <Skeleton className="h-4 w-1/4 mb-1" /> {/* FormLabel */}
                    <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-3/5 mb-1" /> {/* CardTitle */}
                <Skeleton className="h-4 w-full" />   {/* CardDescription */}
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(2)].map((_, index) => ( 
                  <Card key={index} className="p-4 bg-muted/20">
                    <div className="flex justify-between items-start mb-2">
                        <Skeleton className="h-6 w-1/4" /> {/* Day Name */}
                        <Skeleton className="h-7 w-28 rounded-md" /> {/* Copy button */}
                    </div>
                    <Skeleton className="h-10 w-full rounded-md mb-3" /> {/* Assignment display */}
                    <Skeleton className="h-9 w-40 rounded-md" /> {/* Action button */}
                  </Card>
                ))}
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-2/5 mb-1" /> {/* Calendar Title */}
                    <Skeleton className="h-4 w-4/5" />      {/* Calendar Description */}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-9 w-9 rounded-md" /> 
                        <Skeleton className="h-6 w-32" /> 
                        <Skeleton className="h-9 w-9 rounded-md" /> 
                    </div>
                    <div className="grid grid-cols-7 gap-px border-l border-t bg-border">
                        {[...Array(7)].map((_, dayLabelIndex) => (
                            <Skeleton key={`daylabel-${dayLabelIndex}`} className="h-8 bg-card border-b border-r" />
                        ))}
                        {[...Array(35)].map((_, dayIndex) => ( 
                            <Skeleton key={`daycell-${dayIndex}`} className="h-20 bg-card border-b border-r" />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Skeleton className="h-10 w-24 rounded-md" /> 
              <Skeleton className="h-10 w-36 rounded-md" /> 
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
