
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/login');
  // This return is technically unreachable due to redirect,
  // but good practice for components to return JSX or null.
  return null; 
}
