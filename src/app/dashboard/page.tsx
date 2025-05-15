
import { redirect } from 'next/navigation';

// This page now acts as a redirector to the canonical dashboard page
// located at /src/app/(app)/dashboard/page.tsx if this file is still
// being picked up by the router due to project structure.
// Ideally, if src/app/(app)/dashboard/page.tsx is the main dashboard,
// this src/app/dashboard/page.tsx file might not be needed or should be deleted.
export default function ObsoleteDashboardPage() {
  redirect('/dashboard'); // Redirect to the path served by src/app/(app)/dashboard/page.tsx
  return null; 
}
