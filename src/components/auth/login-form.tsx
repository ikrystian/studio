
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { Facebook, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"; // Added CheckCircle2

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
  const searchParams = useSearchParams(); // Get search params
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);


  React.useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setSuccessMessage("Registration successful! Please log in to continue.");
      // Optionally, clear the query param from URL if desired, though not strictly necessary
      // router.replace('/login', { scroll: false }); // This would remove the query param

      // Or use a toast for a less permanent message
      toast({
        title: "Registration Successful!",
        description: "You can now log in with your new account.",
        variant: "default", // Using default as a positive feedback, Shadcn doesn't have explicit 'success'
        duration: 5000,
      });
    }
     if (searchParams?.get("verified") === "true") {
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified. Please log in.",
        variant: "default",
        duration: 5000,
      });
    }
  }, [searchParams, router, toast]);


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null); // Clear success message on new attempt

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate authentication logic
    if (values.email === "test@example.com" && values.password === "password") {
      // On successful login:
      router.push("/dashboard");
    } else {
      setErrorMessage("Invalid email or password. Please try again.");
    }

    setIsLoading(false);
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
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {successMessage && !errorMessage && ( // Only show if no error
          <Alert variant="default" className="border-green-500 dark:border-green-400">
            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
            <AlertTitle className="text-green-700 dark:text-green-300">Success</AlertTitle>
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
                      placeholder="yourname@example.com" 
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
                  <FormLabel>Password</FormLabel>
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
                "Login"
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
              Or continue with
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
          Forgot your password?
        </Link>
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

    