
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function RegisterLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <Skeleton className="h-8 w-3/4 mx-auto mb-2" /> {/* Title Placeholder */}
          <Skeleton className="h-4 w-full mx-auto" /> {/* Description Placeholder */}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-2 mb-6">
            <Skeleton className="h-24 w-24 rounded-full" /> {/* Avatar Placeholder */}
            <Skeleton className="h-8 w-32" /> {/* Button Placeholder */}
            <Skeleton className="h-3 w-48" /> {/* Description Placeholder */}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Label Placeholder */}
              <Skeleton className="h-10 w-full" /> {/* Input Placeholder */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Label Placeholder */}
              <Skeleton className="h-10 w-full" /> {/* Input Placeholder */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Label Placeholder */}
              <Skeleton className="h-10 w-full" /> {/* Input Placeholder */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Label Placeholder */}
              <Skeleton className="h-10 w-full" /> {/* Input Placeholder */}
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" /> {/* Label Placeholder */}
            <Skeleton className="h-10 w-full" /> {/* Input Placeholder */}
          </div>
          <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
            <Skeleton className="h-4 w-4 rounded-sm" /> {/* Checkbox Placeholder */}
            <div className="space-y-1 leading-none">
              <Skeleton className="h-4 w-full" /> {/* Label Placeholder */}
            </div>
          </div>
          <Skeleton className="h-10 w-full" /> {/* Button Placeholder */}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <Skeleton className="h-4 w-48" /> {/* Link Placeholder */}
        </CardFooter>
      </Card>
    </main>
  );
}
