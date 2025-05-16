
"use client";

import { redirect } from 'next/navigation';
import React from 'react'; // Ensure React is imported for useEffect

// This page is a redirector to the new community page under /dashboard
export default function OldCommunityRootPage() {
  React.useEffect(() => {
    redirect('/dashboard/community');
  }, []);

  return null; // Or a loading spinner, but redirect is usually fast
}
