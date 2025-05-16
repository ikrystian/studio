
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Ensure font swapping behavior
  variable: '--font-sans', // Define a CSS variable for the font
});

export const metadata: Metadata = {
  title: {
    default: 'LeniwaKluska',
    template: '%s | LeniwaKluska',
  },
  description: 'Manage your workouts efficiently with LeniwaKluska.',
  icons: {
    // While favicons are out of scope for generation, this is where they would be defined.
    // icon: '/favicon.ico', 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning className={inter.variable}>
      <body className={`font-sans antialiased bg-background text-foreground`} suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
