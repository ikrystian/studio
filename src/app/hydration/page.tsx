
"use client";

import { redirect } from 'next/navigation';
import React from 'react'; // Ensure React is imported for useEffect

export default function OldHydrationPage() {
  React.useEffect(() => {
    redirect('/dashboard/hydration');
  }, []);
  return null; 
}

    