
"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Mail,
  Lock,
  ShieldCheck,
  Save,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription as AlertDialogDescriptionComponent,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { UserProfile } from "@/lib/mockData";

const changeEmailSchema = z.object({
  newEmail: z.string().email("Nieprawidłowy format email.").min(1, "Nowy email jest wymagany."),
  currentPasswordForEmail: z.string().min(1, "Hasło jest wymagane do zmiany emaila."),
});
type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Obecne hasło jest wymagane."),
  newPassword: z.string().min(8, "Nowe hasło musi mieć co najmniej 8 znaków."),
  confirmNewPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane."),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Nowe hasła nie pasują do siebie.",
  path: ["confirmNewPassword"],
});
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const deactivate2FASchema = z.object({
    password: z.string().min(1, "Hasło jest wymagane do deaktywacji 2FA."),
});
type Deactivate2FAFormValues = z.infer<typeof deactivate2FASchema>;

interface LoginHistoryItem {
  id: string;
  date: string;
  type: string;
  ip: string;
  device: string;
}

interface SecurityManagementSectionProps {
  isSubmitting: boolean;
  currentUserAccountData: UserProfile; // Adjust as needed
  emailForm: UseFormReturn<ChangeEmailFormValues>;
  onSubmitChangeEmail: (values: ChangeEmailFormValues) => Promise<void>;
  passwordForm: UseFormReturn<ChangePasswordFormValues>;
  onSubmitChangePassword: (values: ChangePasswordFormValues) => Promise<void>;
  isTwoFactorEnabled: boolean;
  setShowTwoFactorDialog: (show: boolean) => void;
  setShowBackupCodesDialog: (show: boolean) => void;
  deactivate2faForm: UseFormReturn<Deactivate2FAFormValues>;
  onDeactivate2FASubmit: (data: Deactivate2FAFormValues) => Promise<void>;
  loginHistory: LoginHistoryItem[];
}

export function SecurityManagementSection({
  isSubmitting,
  currentUserAccountData,
  emailForm,
  onSubmitChangeEmail,
  passwordForm,
  onSubmitChangePassword,
  isTwoFactorEnabled,
  setShowTwoFactorDialog,
  setShowBackupCodesDialog,
  deactivate2faForm,
  onDeactivate2FASubmit,
  loginHistory,
}: SecurityManagementSectionProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Bezpieczeństwo</CardTitle><CardDescription>Zarządzaj swoim adresem email, hasłem i innymi opcjami bezpieczeństwa.</CardDescription></CardHeader>
      <CardContent className="space-y-8">
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onSubmitChangeEmail)} className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Zmień Adres Email</h3>
            <Alert variant="default" className="mb-4"><Mail className="h-4 w-4" /> <AlertTitle>Informacja</AlertTitle><AlertDescription>Po zmianie adresu email, wyślemy link weryfikacyjny na nowy adres. Zmiana zostanie zastosowana po potwierdzeniu.</AlertDescription></Alert>
            <p className="text-sm text-muted-foreground">Obecny email: <span className="font-medium">{currentUserAccountData.email}</span></p>
            <FormField control={emailForm.control} name="newEmail" render={({ field }) => (
              <FormItem><FormLabel>Nowy adres email</FormLabel><FormControl><Input type="email" placeholder="nowy@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={emailForm.control} name="currentPasswordForEmail" render={({ field }) => (
              <FormItem><FormLabel>Obecne hasło</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} Zmień Email (Symulacja)</Button>
          </form>
        </Form>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onSubmitChangePassword)} className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Zmień Hasło</h3>
            <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
              <FormItem><FormLabel>Obecne hasło</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
              <FormItem><FormLabel>Nowe hasło</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={passwordForm.control} name="confirmNewPassword" render={({ field }) => (
              <FormItem><FormLabel>Potwierdź nowe hasło</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Lock className="mr-2 h-4 w-4" />} Zmień Hasło (Symulacja)</Button>
          </form>
        </Form>
        <Card className="p-4 border rounded-lg">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg font-semibold">Weryfikacja Dwuetapowa (2FA)</CardTitle>
            <CardDescription>Zwiększ bezpieczeństwo swojego konta.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            {isTwoFactorEnabled ? (
              <>
                <Alert variant="default" className="border-green-500 dark:border-green-400">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700 dark:text-green-300">2FA jest Aktywne</AlertTitle>
                  <AlertDescription>Twoje konto jest dodatkowo chronione.</AlertDescription>
                </Alert>
                <Button variant="outline" onClick={() => setShowBackupCodesDialog(true)} disabled={isSubmitting} className="w-full sm:w-auto mr-2">Pokaż Kody Zapasowe</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" disabled={isSubmitting} className="w-full sm:w-auto">Dezaktywuj 2FA</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Dezaktywować 2FA?</AlertDialogTitle><AlertDialogDescriptionComponent>Aby potwierdzić, wprowadź swoje obecne hasło.</AlertDialogDescriptionComponent></AlertDialogHeader>
                    <Form {...deactivate2faForm}>
                      <form onSubmit={deactivate2faForm.handleSubmit(onDeactivate2FASubmit)} className="space-y-4">
                        <FormField control={deactivate2faForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Obecne hasło</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <AlertDialogFooter><AlertDialogCancel disabled={isSubmitting}>Anuluj</AlertDialogCancel><AlertDialogAction type="submit" disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null} Potwierdź i dezaktywuj</AlertDialogAction></AlertDialogFooter>
                      </form>
                    </Form>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (<Button onClick={() => setShowTwoFactorDialog(true)} variant="outline" disabled={isSubmitting}><ShieldCheck className="mr-2 h-4 w-4" /> Aktywuj Weryfikację Dwuetapową</Button>)}
          </CardContent>
        </Card>
        <Card className="p-4 border rounded-lg">
          <CardHeader className="p-0 pb-3"><CardTitle className="text-lg font-semibold">Historia Logowań i Aktywności</CardTitle><CardDescription>Przeglądaj ostatnie aktywności na Twoim koncie.</CardDescription></CardHeader>
          <CardContent className="p-0">
            {loginHistory.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {loginHistory.slice(0, 3).map(item => (
                  <li key={item.id} className="p-2 border-b last:border-b-0">
                    <div className="flex justify-between items-center"><span className="font-medium">{item.type}</span><span className="text-xs text-muted-foreground">{format(parseISO(item.date), "PPPp", { locale: pl })}</span></div>
                    <p className="text-xs text-muted-foreground">IP: {item.ip}, Urządzenie: {item.device}</p>
                  </li>
                ))}
              </ul>
            ) : (<p className="text-sm text-muted-foreground">Brak historii logowań do wyświetlenia.</p>)}
            <Button variant="link" size="sm" className="mt-2 p-0 h-auto" disabled>Zobacz pełną historię (Wkrótce)</Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
