
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CalendarIcon,
  Weight,
  Ruler,
  TrendingUp,
  Loader2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const registrationSchema = z
  .object({
    fullName: z.string().min(1, "Imię i nazwisko jest wymagane."),
    email: z.string().email("Nieprawidłowy adres email.").min(1, "Email jest wymagany."),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków.")
      .regex(/^(?=.*[a-z])/, "Hasło musi zawierać co najmniej jedną małą literę.")
      .regex(/^(?=.*[A-Z])/, "Hasło musi zawierać co najmniej jedną wielką literę.")
      .regex(/^(?=.*\d)/, "Hasło musi zawierać co najmniej jedną cyfrę.")
      .regex(
        /^(?=.*[@$!%*?&])/,
        "Hasło musi zawierać co najmniej jeden znak specjalny (@$!%*?&)."
      ),
    confirmPassword: z.string().min(1, "Proszę potwierdzić hasło."),
    dateOfBirth: z.date({
      required_error: "Data urodzenia jest wymagana.",
      invalid_type_error: "Nieprawidłowy format daty.",
    }),
    gender: z.enum(["male", "female"], {
      required_error: "Płeć jest wymagana.",
    }),
    weight: z.coerce
      .number({ invalid_type_error: "Waga musi być liczbą."})
      .positive("Waga musi być dodatnia.")
      .min(1, "Waga musi wynosić co najmniej 1 kg.")
      .max(500, "Waga nie może przekraczać 500 kg.")
      .optional()
      .or(z.literal("")),
    height: z.coerce
      .number({ invalid_type_error: "Wzrost musi być liczbą."})
      .positive("Wzrost musi być dodatni.")
      .min(50, "Wzrost musi wynosić co najmniej 50 cm.")
      .max(300, "Wzrost nie może przekraczać 300 cm.")
      .optional()
      .or(z.literal("")),
    fitnessLevel: z.enum(["beginner", "intermediate", "advanced"], {
      required_error: "Poziom zaawansowania jest wymagany.",
    }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "Musisz zaakceptować regulamin i politykę prywatności.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie pasują do siebie.",
    path: ["confirmPassword"],
  });

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: undefined,
      gender: undefined,
      weight: "",
      height: "",
      fitnessLevel: undefined,
      termsAccepted: false,
    },
  });

  async function onSubmit(values: RegistrationFormValues) {
    setIsLoading(true);
    setServerError(null);
    
    const userDataForApi = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
      gender: values.gender,
      weight: values.weight === "" || values.weight === undefined ? undefined : Number(values.weight),
      height: values.height === "" || values.height === undefined ? undefined : Number(values.height),
      fitnessLevel: values.fitnessLevel,
    };
    
    console.log("Submitting registration data to API:", userDataForApi);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDataForApi),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.userData && typeof window !== 'undefined') {
          const profileDataToStore = {
            ...data.userData,
            bio: "", 
          };
          localStorage.setItem('currentUserProfileData', JSON.stringify(profileDataToStore));
          localStorage.setItem('tempRegisteredUserEmail', values.email); 
        }

        toast({
          title: "Rejestracja Zakończona Sukcesem!",
          description: data.message || "Twoje konto zostało utworzone. Sprawdź email w celu weryfikacji (symulowane).",
          variant: "default",
          duration: 7000,
        });
        router.push("/login?registered=true");
      } else {
        let errorMsg = data.message || "Wystąpił błąd podczas rejestracji.";
        if (localStorage.getItem('WORKOUTWISE_REGISTRATION_DEBUG') === 'true') {
          let debugDetails = `\nDebug Info: Status ${response.status} - ${response.statusText}.`;
          if (data.errors) {
            debugDetails += `\nAPI Errors: ${JSON.stringify(data.errors, null, 2)}`;
          }
          debugDetails += `\nRaw Response: ${JSON.stringify(data, null, 2)}`;
          errorMsg += debugDetails;
        }
        setServerError(errorMsg);

        if (data.errors) {
          for (const [field, message] of Object.entries(data.errors)) {
            form.setError(field as keyof RegistrationFormValues, { type: 'manual', message: message as string });
          }
        }
      }
    } catch (error: any) {
      console.error("Registration API call error:", error);
      let errorMsg = "Nie udało się połączyć z serwerem. Spróbuj ponownie później.";
       if (localStorage.getItem('WORKOUTWISE_REGISTRATION_DEBUG') === 'true') {
         errorMsg += `\nDebug (Client-side error): ${error.message ? error.message : JSON.stringify(error, null, 2)}`;
       }
      setServerError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className={cn("w-full max-w-2xl shadow-2xl", "registration-form-card")}>
      <CardHeader className={cn("text-center", "registration-form-header")}>
        <CardTitle className={cn("text-3xl font-bold", "registration-form-title")}>Stwórz Konto LeniwaKluska</CardTitle>
        <CardDescription className="registration-form-description">
          Wypełnij poniższe pola, aby rozpocząć.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-6", "registration-form-content")}>
        {serverError && (
          <Alert variant="destructive" className="registration-form-server-error-alert whitespace-pre-wrap">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Rejestracja Nieudana</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 registration-main-form">
            
            <div className="flex flex-col items-center space-y-2 mb-6 registration-avatar-section">
              <FormLabel>Zdjęcie Profilowe (opcjonalnie)</FormLabel>
              <Avatar className="h-24 w-24 registration-avatar-preview">
                <AvatarImage src="" alt="Profile picture placeholder" data-ai-hint="profile avatar placeholder" />
                <AvatarFallback>
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" size="sm" disabled className="registration-avatar-button">
                <ImageIcon className="mr-2 h-4 w-4" />
                Dodaj zdjęcie (wkrótce)
              </Button>
              <FormDescription className="text-xs text-center registration-avatar-description">Możliwość dodania zdjęcia będzie dostępna wkrótce.</FormDescription>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 registration-fields-grid">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="registration-fullname-item">
                    <FormLabel>Imię i Nazwisko</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Jan Kowalski" {...field} className="pl-10 registration-fullname-input" disabled={isLoading} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="registration-email-item">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="twoj@email.com" {...field} className="pl-10 registration-email-input" disabled={isLoading} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="registration-password-item">
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pl-10 pr-10 registration-password-input"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 px-2 registration-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs registration-password-description">
                      Min 8 znaków, 1 wielka i 1 mała litera, 1 cyfra, 1 znak specjalny.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="registration-confirm-password-item">
                    <FormLabel>Potwierdź Hasło</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pl-10 pr-10 registration-confirm-password-input"
                          disabled={isLoading}
                        />
                         <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 px-2 registration-confirm-password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                          aria-label={showConfirmPassword ? "Ukryj potwierdzenie hasła" : "Pokaż potwierdzenie hasła"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col registration-dob-item">
                    <FormLabel>Data Urodzenia</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal registration-dob-button",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: pl })
                            ) : (
                              <span>Wybierz datę</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 registration-dob-popover" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01") || isLoading
                          }
                          initialFocus
                          locale={pl}
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3 registration-gender-item">
                    <FormLabel>Płeć</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                        disabled={isLoading}
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0 registration-gender-male">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal">Mężczyzna</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 registration-gender-female">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal">Kobieta</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem className="registration-weight-item">
                    <FormLabel>Waga (opcjonalnie)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Weight className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="number" placeholder="np. 70 (w kg)" {...field} className="pl-10 registration-weight-input" disabled={isLoading}/>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem className="registration-height-item">
                    <FormLabel>Wzrost (opcjonalnie)</FormLabel>
                    <FormControl>
                       <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="number" placeholder="np. 175 (w cm)" {...field} className="pl-10 registration-height-input" disabled={isLoading} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem className="registration-fitnesslevel-item">
                  <FormLabel>Poziom Zaawansowania</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger className="registration-fitnesslevel-trigger">
                        <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Wybierz swój poziom zaawansowania" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Początkujący</SelectItem>
                      <SelectItem value="intermediate">Średniozaawansowany</SelectItem>
                      <SelectItem value="advanced">Zaawansowany</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm registration-terms-item">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      aria-labelledby="terms-label"
                      className="registration-terms-checkbox"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel id="terms-label" className="cursor-pointer registration-terms-label">
                      Akceptuję{" "}
                      <Link href="/terms" className="font-medium text-primary hover:underline registration-terms-link" target="_blank">
                        regulamin serwisu
                      </Link>{" "}
                      oraz{" "}
                      <Link href="/privacy" className="font-medium text-primary hover:underline registration-privacy-link" target="_blank">
                        politykę prywatności
                      </Link>
                      .
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className={cn("w-full", "registration-submit-button")} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Stwórz Konto"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className={cn("flex flex-col items-center space-y-2 text-sm", "registration-form-footer")}>
        <p className="text-muted-foreground registration-login-prompt">
          Masz już konto?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline registration-login-link">
            Zaloguj się
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
