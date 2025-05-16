
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Facebook, AlertCircle, Loader2, CheckCircle2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Keep these

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
import { auth } from "@/lib/firebase"; // Directly import the initialized auth instance

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email.").min(1, "Email jest wymagany."),
  password: z.string().min(1, "Hasło jest wymagane."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = React.useState(false);


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const tempEmail = localStorage.getItem('tempRegisteredUserEmail');
      if (tempEmail) {
        form.setValue('email', tempEmail);
      }
    }
  }, [form]);

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

      if (response.ok && data.success && data.userData) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('isUserLoggedIn', 'true');
          localStorage.setItem('loggedInUserEmail', data.userData.email); 
          localStorage.setItem('currentUserProfileData', JSON.stringify(data.userData));
          localStorage.removeItem('tempRegisteredUserEmail');
        }
        toast({
          title: "Logowanie Pomyślne!",
          description: "Witaj z powrotem!",
          variant: "default",
        });
        await router.push("/dashboard");
        navigated = true;
      } else {
        let errorMsg = data.message || "Logowanie nieudane. Sprawdź email i hasło.";
         if (typeof window !== 'undefined' && localStorage.getItem('WORKOUTWISE_REGISTRATION_DEBUG') === 'true') {
           let debugInfo = `Debug (API Login Response): Status ${response.status} - ${response.statusText}.`;
           try {
            debugInfo += `\nResponse Body: ${JSON.stringify(data, null, 2)}`;
           } catch (e) {
            debugInfo += `\nResponse Body (not JSON): ${await response.text()}`;
           }
           errorMsg += `\n${debugInfo}`;
        }
        setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      console.error("Login API call failed:", error);
      let errorMsg = "Wystąpił nieoczekiwany błąd podczas logowania. Spróbuj ponownie.";
      if (typeof window !== 'undefined' && localStorage.getItem('WORKOUTWISE_REGISTRATION_DEBUG') === 'true') {
          errorMsg += `\nDebug (Klient): ${error.message ? error.message : JSON.stringify(error, null, 2)}`;
      }
      setErrorMessage(errorMsg);
    }

    if (!navigated) {
      setIsLoading(false);
    }
  }, [router, toast]);

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
    if (currentSearchParams.get("status") === "account_deleted") {
      if(!shouldShowToast) {
        shouldShowToast = true;
        toastTitle = "Konto Usunięte";
        toastDescription = "Twoje konto zostało pomyślnie usunięte.";
        toastVariant = "destructive";
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
    
    if (
      !autoLoginAttempted &&
      !statusParam &&
      !registeredParam &&
      !verifiedParam &&
      !sessionExpiredParam &&
      form.getValues("email") === "test@example.com" &&
      form.getValues("password") === "password"
    ) {
      setAutoLoginAttempted(true);
      const timer = setTimeout(() => {
        handleLoginSubmit(form.getValues());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoLoginAttempted, form, handleLoginSubmit, searchParams]);


  const handleSocialLogin = async (providerName: "google" | "facebook") => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    let navigated = false;

    if (providerName === "google") {
      const provider = new GoogleAuthProvider();
      try {
        // Use the imported 'auth' instance directly from '@/lib/firebase'
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const profileResponse = await fetch('/api/auth/ensure-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }),
        });

        const profileData = await profileResponse.json();

        if (profileResponse.ok && profileData.success && profileData.userData) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('isUserLoggedIn', 'true');
            localStorage.setItem('loggedInUserEmail', profileData.userData.email);
            localStorage.setItem('currentUserProfileData', JSON.stringify(profileData.userData));
          }
          toast({ title: "Logowanie Google Pomyślne!", description: `Witaj, ${user.displayName || 'Użytkowniku'}!`, variant: "default" });
          await router.push("/dashboard");
          navigated = true;
        } else {
          let errorMsg = profileData.message || "Nie udało się przetworzyć logowania przez Google.";
          if (typeof window !== 'undefined' && localStorage.getItem('WORKOUTWISE_REGISTRATION_DEBUG') === 'true') {
              errorMsg += `\nDebug (API Profile): Status ${profileResponse.status} - ${profileResponse.statusText}. Response: ${JSON.stringify(profileData, null, 2)}`;
          }
          setErrorMessage(errorMsg);
        }
      } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        let errorMsg = "Wystąpił błąd podczas logowania przez Google.";
        if (error.code === 'auth/popup-closed-by-user') {
            errorMsg = "Okno logowania Google zostało zamknięte przed zakończeniem.";
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMsg = "Konto z tym adresem email już istnieje, ale zostało utworzone inną metodą logowania.";
        }
        if (typeof window !== 'undefined' && localStorage.getItem('WORKOUTWISE_REGISTRATION_DEBUG') === 'true') {
            errorMsg += `\nDebug (Klient Google Sign-In): ${error.message ? error.message : JSON.stringify(error, null, 2)}. Szczegóły: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`;
        }
        setErrorMessage(errorMsg);
      }
    } else if (providerName === "facebook") {
        toast({
            title: `Logowanie przez Facebook`,
            description: "Ta funkcja jest w trakcie implementacji.",
            variant: "default",
        });
    }

    if (!navigated) {
      setIsLoading(false);
    }
  };


  return (
    <Card className={cn("w-full max-w-md shadow-2xl", "login-form-card")}>
      <CardHeader className={cn("space-y-1 text-center", "login-form-header")}>
        <CardTitle className={cn("text-3xl font-bold", "login-form-title")}>Zaloguj się</CardTitle>
        <CardDescription className="login-form-description">Wprowadź swój email i hasło, aby uzyskać dostęp do LeniwaKluska.</CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-6", "login-form-content")}>
        {errorMessage && (
          <Alert variant="destructive" className="login-form-error-alert whitespace-pre-wrap">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Błąd Logowania</AlertTitle>
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
                  <FormLabel className="login-form-email-label">Adres Email</FormLabel>
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
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                        aria-describedby="password-error"
                        className="pl-10 pr-10 login-form-password-input"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 px-2 login-form-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                  </FormControl>
                  <FormMessage id="password-error" />
                </FormItem>
              )}
            />
            <Button type="submit" className={cn("w-full text-base py-3", "login-form-submit-button")} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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

        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", "login-form-social-buttons")}>
          <Button variant="outline" onClick={() => handleSocialLogin("google")} disabled={isLoading} className="login-form-google-button w-full">
            <GoogleIcon className="mr-2 h-5 w-5" />
            Google
          </Button>
          <Button variant="outline" onClick={() => handleSocialLogin("facebook")} disabled={isLoading} className="login-form-facebook-button w-full">
            <Facebook className="mr-2 h-5 w-5 text-[#1877F2]" />
            Facebook
          </Button>
        </div>
      </CardContent>
      <CardFooter className={cn("flex flex-col items-center space-y-2 text-sm pt-6", "login-form-footer")}>
        <Link href="/forgot-password" className={cn("font-medium text-primary hover:underline", "login-form-forgot-password-link")}>
          Zapomniałeś hasła?
        </Link>
        <p className={cn("text-muted-foreground", "login-form-register-prompt")}>
          Nie masz jeszcze konta?{" "}
          <Link href="/register" className={cn("font-medium text-primary hover:underline", "login-form-register-link")}>
            Zarejestruj się
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
