
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row text-foreground">
      {/* Image Panel Skeleton - Hidden on mobile, visible on md and larger */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 items-center justify-center bg-muted/30">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Login Form Panel Skeleton */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 bg-background/80 md:bg-background">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <Skeleton className="h-8 w-3/4 mx-auto" /> {/* Title Placeholder */}
            <Skeleton className="h-4 w-full mx-auto" /> {/* Description Placeholder */}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" /> {/* Label Placeholder */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/30" />
                  <Skeleton className="h-10 w-full pl-10" /> {/* Input Placeholder */}
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" /> {/* Label Placeholder */}
                 <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/30" />
                  <Skeleton className="h-10 w-full pl-10" /> {/* Input Placeholder */}
                </div>
              </div>
              <Skeleton className="h-10 w-full" /> {/* Button Placeholder */}
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Skeleton className="h-px w-full" /> {/* Separator Placeholder */}
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <Skeleton className="h-4 w-28 bg-card px-2" /> {/* Text over Separator Placeholder */}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" /> {/* Social Button Placeholder */}
              <Skeleton className="h-10 w-full" /> {/* Social Button Placeholder */}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2 text-sm">
            <Skeleton className="h-5 w-36" /> {/* Link Placeholder */}
            <Skeleton className="h-4 w-48" /> {/* Link Placeholder */}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
