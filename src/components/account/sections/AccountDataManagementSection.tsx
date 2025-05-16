
"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { FileText, AlertTriangle, Trash2, Loader2 } from "lucide-react";

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
  FormDescription,
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

const deleteAccountSchema = z.object({
  passwordConfirmation: z.string().min(1, "Hasło jest wymagane do usunięcia konta."),
});
type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

interface AccountDataManagementSectionProps {
  isSubmitting: boolean;
  deleteAccountForm: UseFormReturn<DeleteAccountFormValues>;
  onSubmitDeleteAccount: (values: DeleteAccountFormValues) => Promise<void>;
}

export function AccountDataManagementSection({
  isSubmitting,
  deleteAccountForm,
  onSubmitDeleteAccount,
}: AccountDataManagementSectionProps) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Zarządzanie Danymi</CardTitle><CardDescription>Eksportuj swoje dane lub trwale usuń konto.</CardDescription></CardHeader>
      <CardContent className="space-y-8">
        <Card className="p-4">
          <CardHeader className="p-0 pb-3"><CardTitle className="text-lg font-semibold flex items-center gap-1"><FileText className="h-4 w-4" />Eksport Danych</CardTitle></CardHeader>
          <CardContent className="p-0 space-y-2"><p className="text-sm text-muted-foreground">Możesz zażądać eksportu swoich danych osobowych i treningowych w ustrukturyzowanym formacie.</p><Button variant="outline" disabled><FileText className="mr-2 h-4 w-4" /> Rozpocznij eksport (Wkrótce)</Button><p className="text-xs text-muted-foreground pt-1">Proces przygotowania danych może zająć trochę czasu. Otrzymasz powiadomienie, gdy plik będzie gotowy do pobrania lub zostanie wysłany na Twój email.</p></CardContent>
        </Card>
        <Card className="border-destructive p-4">
          <CardHeader className="p-0 pb-3"><CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Usuń Konto</CardTitle></CardHeader>
          <CardContent className="p-0 space-y-4">
            <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Ostrzeżenie!</AlertTitle><AlertDescription>Usunięcie konta jest operacją nieodwracalną. Wszystkie Twoje dane, w tym historia treningów, plany, postępy i ustawienia zostaną trwale usunięte.</AlertDescription></Alert>
            <Form {...deleteAccountForm}>
              <form onSubmit={deleteAccountForm.handleSubmit(onSubmitDeleteAccount)} className="space-y-4">
                <FormField control={deleteAccountForm.control} name="passwordConfirmation" render={({ field }) => (
                  <FormItem><FormLabel>Potwierdź hasłem</FormLabel><FormControl><Input type="password" placeholder="Wpisz swoje hasło" {...field} /></FormControl><FormDescription>Aby potwierdzić chęć usunięcia konta, wpisz swoje obecne hasło.</FormDescription><FormMessage /></FormItem>
                )} />
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" className="w-full" type="button" disabled={!deleteAccountForm.formState.isValid || isSubmitting}><Trash2 className="mr-2 h-4 w-4" /> Usuń Moje Konto Na Stałe</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Czy na pewno chcesz usunąć konto?</AlertDialogTitle><AlertDialogDescriptionComponent>To jest Twoja ostatnia szansa na przerwanie tej operacji. Po potwierdzeniu, wszystkie Twoje dane zostaną usunięte i nie będzie można ich odzyskać.</AlertDialogDescriptionComponent></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel disabled={isSubmitting}>Anuluj</AlertDialogCancel><AlertDialogAction onClick={deleteAccountForm.handleSubmit(onSubmitDeleteAccount)} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />} Tak, usuń konto</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </form>
            </Form>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
