import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a common, readable sans-serif font
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans', // Define a CSS variable for the font
});

export const metadata: Metadata = {
  title: {
    default: 'WorkoutWise',
    template: '%s | WorkoutWise',
  },
  description: 'Manage your workouts efficiently with WorkoutWise.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
