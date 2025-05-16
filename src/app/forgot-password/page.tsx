
"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Zod schema for validating the forgot password form.
const forgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email.").min(1, "Email jest wymagany."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false); // To show success message

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handles form submission.
  // Simulates an API call to request a password reset link.
  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    console.log("Password reset requested for (simulated):", values.email);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you'd call your backend here to handle password reset logic
    // (e.g., generate a token, send an email with a reset link).
    // For this mock, we'll just assume it's successful if the email is "valid" (placeholder logic).
    setIsSubmitted(true);
    toast({
      title: "Instrukcje Wysłane (Symulacja)",
      description: "Jeśli ten adres email jest zarejestrowany, wysłaliśmy na niego instrukcje resetowania hasła.",
      variant: "default",
      duration: 7000, // Show toast for longer
    });
    setIsLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Zapomniałeś Hasła?</CardTitle>
          <CardDescription>
            Wprowadź swój adres email, a wyślemy Ci link do zresetowania hasła.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isSubmitted ? (
            // Show success message after "submission"
            <Alert variant="default" className="border-green-500 dark:border-green-400">
              <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
              <AlertTitle className="text-green-700 dark:text-green-300">Sprawdź Email</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Jeśli adres {form.getValues("email")} jest zarejestrowany w naszym systemie, wysłaliśmy na niego instrukcje dotyczące resetowania hasła. Może to potrwać kilka minut. Sprawdź również folder spam.
              </AlertDescription>
            </Alert>
          ) : (
            // Show the form if not yet submitted
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="twojemail@example.com"
                            {...field}
                            className="pl-10"
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Wyślij Link Resetujący"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <Button variant="link" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-1 h-4 w-4" /> Wróć do Logowania
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
