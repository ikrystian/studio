
"use client";

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// Ensure globals.css is imported if it's not already in a higher-level layout
// For this specific layout, it's likely src/app/layout.tsx handles global CSS
// import './globals.css'; // If you had specific CSS for (app) routes
import { Toaster } from "@/components/ui/toaster";
import { AppHeader } from '@/components/layout/AppHeader'; // Assuming AppHeader is here

// The (app) directory is a Route Group.
// Files and folders within a route group, when enclosed in parentheses like (app),
// organize your routes without affecting the URL path.
// For example, a page at src/app/(app)/dashboard/page.tsx will be accessible at /dashboard, not /(app)/dashboard.
// This layout will apply to all routes defined within the (app) group.

// Note: The global metadata (title, description) is usually best defined in the root layout (src/app/layout.tsx).
// This layout can define metadata specific to the (app) group if needed, or override parts of it.

export default function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppHeader />
      <main>{children}</main>
      {/* Toaster can be here or in the root layout, ensure it's only once for the whole app ideally */}
      {/* If already in root layout, it might not be needed here unless for specific scoping not typical with Toaster */}
    </>
  );
}
