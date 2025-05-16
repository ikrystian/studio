
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function ForgotPasswordLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-2xl"> {/* Match max-width of actual page */}
        <CardHeader className="space-y-2 text-center"> {/* Added space-y-2 for better spacing */}
          <Skeleton className="h-8 w-3/4 mx-auto" /> {/* Title Placeholder */}
          <Skeleton className="h-4 w-full mx-auto" /> {/* Description Placeholder */}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Label Placeholder */}
              <Skeleton className="h-10 w-full" /> {/* Input Placeholder */}
            </div>
            <Skeleton className="h-10 w-full" /> {/* Button Placeholder */}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <Skeleton className="h-5 w-36" /> {/* Link Placeholder */}
        </CardFooter>
      </Card>
    </main>
  );
}
