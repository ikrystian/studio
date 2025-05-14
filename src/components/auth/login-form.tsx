
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Facebook, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";


const loginSchema = z.object({
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  password: z.string().min(6, "Password must be at least 6 characters.").min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); // Get current pathname
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);


  React.useEffect(() => {
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    let paramsModified = false;

    if (currentSearchParams.get("registered") === "true") {
      setSuccessMessage("Rejestracja zakończona sukcesem! Możesz się teraz zalogować.");
      toast({
        title: "Rejestracja Zakończona Sukcesem!",
        description: "Możesz teraz zalogować się na swoje nowe konto.",
        variant: "default",
        duration: 6000,
      });
      currentSearchParams.delete("registered");
      paramsModified = true;
    }
    if (currentSearchParams.get("verified") === "true") {
      // Ensure successMessage for registration isn't overwritten if both params were present
      if (!successMessage) {
         toast({
            title: "Email Zweryfikowany!",
            description: "Twój email został pomyślnie zweryfikowany. Proszę się zalogować.",
            variant: "default",
            duration: 6000,
        });
      }
      currentSearchParams.delete("verified");
      paramsModified = true;
    }

    if (paramsModified && pathname === "/login") {
      // Only replace history if we are indeed on the login page and params were changed
      const newQuery = currentSearchParams.toString();
      router.replace(`/login${newQuery ? `?${newQuery}` : ''}`, { scroll: false });
    }
  }, [searchParams, router, toast, pathname, successMessage]); // Added pathname and successMessage to dependencies


  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Shortened for quicker testing

    let navigated = false;
    if (values.email === "test@example.com" && values.password === "password") {
      try {
        await router.push("/dashboard");
        navigated = true;
        // If router.push is successful, this component should unmount.
        // No need to setIsLoading(false) here if navigation succeeds.
      } catch (e) {
        console.error("Navigation to dashboard failed:", e);
        setErrorMessage("Błąd nawigacji do panelu głównego. Spróbuj ponownie.");
      }
    } else {
      setErrorMessage("Nieprawidłowy email lub hasło. Spróbuj ponownie.");
    }

    if (!navigated) {
      setIsLoading(false); // If navigation didn't occur or failed, reset loading state
    }
  }

  const handleSocialLogin = (provider: "google" | "facebook") => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    // Simulate social login initiation
    console.log(`Attempting ${provider} login...`);
    // In a real app, this would redirect to an OAuth provider
    setTimeout(() => {
      setErrorMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not implemented yet.`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold">WorkoutWise Login</CardTitle>
        <CardDescription>Wprowadź swoje dane, aby uzyskać dostęp do konta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Logowanie Nieudane</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {successMessage && !errorMessage && (
          <Alert variant="default" className="border-green-500 dark:border-green-400">
            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
            <AlertTitle className="text-green-700 dark:text-green-300">Sukces</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="twojemail@example.com" 
                      {...field} 
                      disabled={isLoading}
                      aria-describedby="email-error"
                    />
                  </FormControl>
                  <FormMessage id="email-error" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hasło</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isLoading}
                      aria-describedby="password-error"
                    />
                  </FormControl>
                  <FormMessage id="password-error" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Zaloguj się"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Lub kontynuuj przez
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => handleSocialLogin("google")} disabled={isLoading}>
            <GoogleIcon className="mr-2 h-5 w-5" />
            Google
          </Button>
          <Button variant="outline" onClick={() => handleSocialLogin("facebook")} disabled={isLoading}>
            <Facebook className="mr-2 h-5 w-5" />
            Facebook
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2 text-sm">
        <Link href="#" className="font-medium text-primary hover:underline">
          Zapomniałeś hasła?
        </Link>
        <p className="text-muted-foreground">
          Nie masz konta?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

    