
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit3, Image as ImageIcon, UserCircle, Bell, ListFilter } from "lucide-react";

export function CommunityFeedPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Page Sub-Header Skeleton - This mimics the header part of the feed page itself */}
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button placeholder */}
            <Skeleton className="h-7 w-7 rounded-full" /> {/* UserCircle icon placeholder */}
            <Skeleton className="h-6 w-32" /> {/* Page Title placeholder */}
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-44 rounded-md" /> {/* Filter Select */}
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Bell Icon */}
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl space-y-6">
          {/* Create Post Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-xl">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-48" /> {/* Title "Co słychać?" */}
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full rounded-md mb-2" /> {/* Textarea */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-36 rounded-md" /> {/* Add Photo Button */}
                <Skeleton className="h-9 w-24 rounded-md" /> {/* Publish Button */}
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed Skeletons */}
          {[...Array(2)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" /> {/* User Name */}
                      <Skeleton className="h-3 w-20" />    {/* Timestamp */}
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" /> {/* More Options */}
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-3" />
                <Skeleton className="h-48 w-full rounded-lg" /> {/* Image Placeholder */}
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-4 w-full">
                  <Skeleton className="h-8 w-24 rounded-md" /> {/* Likes */}
                  <Skeleton className="h-8 w-28 rounded-md" /> {/* Comments */}
                  <Skeleton className="h-8 w-24 rounded-md ml-auto" /> {/* Share */}
                </div>
                <Skeleton className="h-px w-full my-1" /> {/* Separator */}
                {/* Comment Input Skeleton */}
                <div className="flex items-center gap-2 w-full pt-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 w-10 rounded-md" />
                </div>
              </CardFooter>
            </Card>
          ))}
          <Skeleton className="h-10 w-full rounded-md" /> {/* Load More Sentinel or Message */}
        </div>
      </main>
    </div>
  );
}

    