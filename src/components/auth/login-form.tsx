
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Facebook, AlertCircle, Loader2, CheckCircle2, Mail, Lock } from "lucide-react";

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
import { cn } from "@/lib/utils";


const loginSchema = z.object({
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  password: z.string().min(6, "Password must be at least 6 characters.").min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "test@example.com",
      password: "password",
    },
  });


  const handleLoginSubmit = React.useCallback(async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    let navigated = false;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('isUserLoggedIn', 'true');
          localStorage.setItem('loggedInUserEmail', values.email); // Store email for potential display/use
        }
        await router.push("/dashboard");
        navigated = true;
      } else {
        setErrorMessage(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login API call failed:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }

    if (!navigated) {
      setIsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    if (pathname !== "/login" || !searchParams || typeof window === 'undefined') return;

    const currentSearchParams = new URLSearchParams(searchParams.toString());
    let paramsModified = false;
    let shouldShowToast = false;
    let toastTitle = "";
    let toastDescription = "";
    let toastVariant: "default" | "destructive" = "default";


    if (currentSearchParams.get("registered") === "true") {
      shouldShowToast = true;
      toastTitle = "Rejestracja Zakończona Sukcesem!";
      toastDescription = "Możesz teraz zalogować się na swoje nowe konto.";
      currentSearchParams.delete("registered");
      paramsModified = true;
    }
    if (currentSearchParams.get("verified") === "true") {
      if (!shouldShowToast) {
        shouldShowToast = true;
        toastTitle = "Email Zweryfikowany!";
        toastDescription = "Twój email został pomyślnie zweryfikowany. Proszę się zalogować.";
      }
      currentSearchParams.delete("verified");
      paramsModified = true;
    }
    if (currentSearchParams.get("status") === "logged_out") {
      if (!shouldShowToast) {
        shouldShowToast = true;
        toastTitle = "Wylogowano";
        toastDescription = "Zostałeś pomyślnie wylogowany.";
      }
      currentSearchParams.delete("status");
      paramsModified = true;
    }
    if (currentSearchParams.get("session_expired") === "true") {
      if (!shouldShowToast) {
        shouldShowToast = true;
        toastTitle = "Sesja wygasła";
        toastDescription = "Zaloguj się ponownie.";
        toastVariant = "destructive";
      }
      currentSearchParams.delete("session_expired");
      paramsModified = true;
    }


    if (shouldShowToast) {
      toast({
        title: toastTitle,
        description: toastDescription,
        variant: toastVariant,
        duration: 6000,
      });
    }

    if (paramsModified) {
      const newQueryString = currentSearchParams.toString();
      const newPath = newQueryString ? `/login?${newQueryString}` : "/login";
      router.replace(newPath, { scroll: false });
    }
  }, [searchParams, router, toast, pathname]);


  React.useEffect(() => {
    const statusParam = searchParams?.get("status");
    const registeredParam = searchParams?.get("registered");
    const verifiedParam = searchParams?.get("verified");
    const sessionExpiredParam = searchParams?.get("session_expired");

    if (!autoLoginAttempted &&
        !statusParam && !registeredParam && !verifiedParam && !sessionExpiredParam &&
        form.getValues("email") === "test@example.com" &&
        form.getValues("password") === "password"
    ) {
      setAutoLoginAttempted(true);
      const timer = setTimeout(() => {
        handleLoginSubmit(form.getValues());
      }, 100); // Short delay to allow component to fully mount
      return () => clearTimeout(timer);
    }
  }, [autoLoginAttempted, form, handleLoginSubmit, searchParams]);


  const handleSocialLogin = (provider: "google" | "facebook") => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    console.log(`Attempting ${provider} login...`);
    // Simulate API call
    setTimeout(() => {
      setErrorMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not implemented yet.`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className={cn("w-full max-w-md shadow-2xl", "login-form-card")}>
      <CardHeader className={cn("space-y-1 text-center", "login-form-header")}>
        <CardTitle className={cn("text-3xl font-bold", "login-form-title")}>WorkoutWise Login</CardTitle>
        <CardDescription className="login-form-description">Wprowadź swoje dane, aby uzyskać dostęp do konta</CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-6", "login-form-content")}>
        {errorMessage && (
          <Alert variant="destructive" className="login-form-error-alert">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Logowanie Nieudane</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {successMessage && !errorMessage && (
          <Alert variant="default" className={cn("border-green-500 dark:border-green-400", "login-form-success-alert")}>
            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
            <AlertTitle className="text-green-700 dark:text-green-300">Sukces</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLoginSubmit)} className={cn("space-y-4", "login-form-main")}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="login-form-email-item">
                  <FormLabel className="login-form-email-label">Email</FormLabel>
                  <FormControl>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                        type="email"
                        placeholder="twojemail@example.com"
                        {...field}
                        disabled={isLoading}
                        aria-describedby="email-error"
                        className="pl-10 login-form-email-input"
                        />
                    </div>
                  </FormControl>
                  <FormMessage id="email-error" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="login-form-password-item">
                  <FormLabel className="login-form-password-label">Hasło</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                        aria-describedby="password-error"
                        className="pl-10 login-form-password-input"
                        />
                    </div>
                  </FormControl>
                  <FormMessage id="password-error" />
                </FormItem>
              )}
            />
            <Button type="submit" className={cn("w-full", "login-form-submit-button")} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Zaloguj się"
              )}
            </Button>
          </form>
        </Form>

        <div className={cn("relative my-6", "login-form-social-separator")}>
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Lub kontynuuj przez
            </span>
          </div>
        </div>

        <div className={cn("grid grid-cols-2 gap-4", "login-form-social-buttons")}>
          <Button variant="outline" onClick={() => handleSocialLogin("google")} disabled={isLoading} className="login-form-google-button">
            <GoogleIcon className="mr-2 h-5 w-5" />
            Google
          </Button>
          <Button variant="outline" onClick={() => handleSocialLogin("facebook")} disabled={isLoading} className="login-form-facebook-button">
            <Facebook className="mr-2 h-5 w-5" />
            Facebook
          </Button>
        </div>
      </CardContent>
      <CardFooter className={cn("flex flex-col items-center space-y-2 text-sm", "login-form-footer")}>
        <Link href="/forgot-password" className={cn("font-medium text-primary hover:underline", "login-form-forgot-password-link")}>
          Zapomniałeś hasła?
        </Link>
        <p className={cn("text-muted-foreground", "login-form-register-prompt")}>
          Nie masz konta?{" "}
          <Link href="/register" className={cn("font-medium text-primary hover:underline", "login-form-register-link")}>
            Zarejestruj się
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
