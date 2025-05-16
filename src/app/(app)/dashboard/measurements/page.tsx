
"use client";

import * as React from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Scale,
  LineChart,
  Edit,
  Loader2,
  CalendarDays,
  StickyNote,
  Ruler,
  Activity, // For BMI icon placeholder
  Download, // For CSV export icon
} from "lucide-react";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AddMeasurementDialog,
  type MeasurementFormData,
  PREDEFINED_BODY_PARTS,
} from "@/components/measurements/add-measurement-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"; // Dodano import Input
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MeasurementsPageSkeleton } from "@/components/measurements/MeasurementsPageSkeleton";

export interface BodyPartData {
  name: string;
  value: number | null;
}
export interface Measurement {
  id: string;
  date: string; // Store as ISO string
  weight: number;
  bodyParts: BodyPartData[];
  notes?: string;
}

const INITIAL_MOCK_MEASUREMENTS: Measurement[] = [
  {
    id: uuidv4(),
    date: new Date(2024, 6, 1).toISOString(),
    weight: 75.5,
    bodyParts: [
      { name: "Klatka piersiowa (cm)", value: 100 },
      { name: "Talia (cm)", value: 80 },
      { name: "Biodra (cm)", value: 95 },
    ],
    notes: "Pierwszy pomiar po rozpoczęciu diety.",
  },
  {
    id: uuidv4(),
    date: new Date(2024, 6, 15).toISOString(),
    weight: 74.8,
    bodyParts: [
      { name: "Klatka piersiowa (cm)", value: 99.5 },
      { name: "Talia (cm)", value: 79 },
      { name: "Biodra (cm)", value: 94.5 },
    ],
  },
  {
    id: uuidv4(),
    date: new Date(2024, 7, 1).toISOString(),
    weight: 74.0,
    bodyParts: [
      { name: "Klatka piersiowa (cm)", value: 99 },
      { name: "Talia (cm)", value: 78 },
      { name: "Biodra (cm)", value: 94 },
      { name: "Biceps lewy (cm)", value: 35 },
    ],
    notes: "Czuję się lżej.",
  },
];

// Mock user height in CM. In a real app, this would come from user profile.
const USER_HEIGHT_CM: number | null = 175; // Example height: 175cm. Set to null to test missing height.

const calculateBMI = (
  weightKg: number,
  heightCm: number | null
): number | null => {
  if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0) {
    return null;
  }
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

const interpretBMI = (bmi: number | null): string => {
  if (bmi === null) return "-";
  if (bmi < 18.5) return "Niedowaga";
  if (bmi < 25) return "Waga prawidłowa";
  if (bmi < 30) return "Nadwaga";
  return "Otyłość";
};

export default function MeasurementsPage() {
  const { toast } = useToast();
  const [pageIsLoading, setPageIsLoading] = React.useState(true);
  const [measurements, setMeasurements] = React.useState<Measurement[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingMeasurement, setEditingMeasurement] =
    React.useState<Measurement | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [measurementToDelete, setMeasurementToDelete] =
    React.useState<Measurement | null>(null);

  const [selectedChartMetric, setSelectedChartMetric] =
    React.useState<string>("Waga (kg)");

  // Reminder settings state (placeholders)
  const [enableReminders, setEnableReminders] = React.useState(false);
  const [reminderFrequency, setReminderFrequency] = React.useState("weekly");
  const [reminderTime, setReminderTime] = React.useState("09:00");

  React.useEffect(() => {
    setPageIsLoading(true);
    // Simulate data fetching
    const timer = setTimeout(() => {
      setMeasurements(INITIAL_MOCK_MEASUREMENTS);
      setPageIsLoading(false);
    }, 750); // Adjust delay as needed
    return () => clearTimeout(timer);
  }, []);

  const availableMetricsForChart = React.useMemo(() => {
    const metrics = ["Waga (kg)", "BMI"]; // Add BMI to chartable metrics
    const bodyPartNames = new Set<string>();
    measurements.forEach((m) => {
      m.bodyParts.forEach((bp) => {
        if (bp.value !== null) {
          bodyPartNames.add(bp.name);
        }
      });
    });
    return [...metrics, ...Array.from(bodyPartNames)];
  }, [measurements]);

  const chartData = React.useMemo(() => {
    return (
      measurements
        .filter((m) => {
          // Dodatkowe filtrowanie na początku w celu usunięcia nieprawidłowych dat
          if (!m.date) return false;
          try {
            const parsedDate = parseISO(m.date);
            return !isNaN(parsedDate.getTime());
          } catch (e) {
            return false;
          }
        })
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
        .map((m) => {
          // Pewność, że m.date jest prawidłowe po filtrowaniu powyżej
          const dateStr = format(parseISO(m.date), "dd MMM yy", { locale: pl });
          const dataPoint: { date: string; [key: string]: any } = {
            date: dateStr,
            "Waga (kg)": m.weight,
          };
          const bmi = calculateBMI(m.weight, USER_HEIGHT_CM);
          if (bmi !== null) {
            dataPoint["BMI"] = bmi;
          }
          m.bodyParts.forEach((bp) => {
            if (bp.value !== null) {
              dataPoint[bp.name] = bp.value;
            }
          });
          return dataPoint;
        })
        // Filtracja po wartościach metryk - upewniamy się, że data jest nadal prawidłowa (choć powinna być po pierwszym filtrze)
        .filter(
          (dp) =>
            dp[selectedChartMetric] !== undefined &&
            dp[selectedChartMetric] !== null &&
            dp.date !== "Invalid Date"
        )
    );
  }, [measurements, selectedChartMetric]); // Removed USER_HEIGHT_CM from deps here as it's constant

  const chartConfig = React.useMemo(() => {
    const config: any = {};
    availableMetricsForChart.forEach((metric, index) => {
      config[metric] = {
        label: metric,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
    return config;
  }, [availableMetricsForChart]);

  const handleSaveMeasurement = (data: MeasurementFormData) => {
    if (editingMeasurement) {
      setMeasurements((prev) =>
        prev.map((m) =>
          m.id === editingMeasurement.id
            ? { ...data, id: editingMeasurement.id }
            : m
        )
      );
      toast({
        title: "Pomiar zaktualizowany",
        description: "Dane pomiaru zostały pomyślnie zaktualizowane.",
      });
    } else {
      const newMeasurement: Measurement = { ...data, id: uuidv4() };
      setMeasurements((prev) =>
        [...prev, newMeasurement].sort(
          (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
        )
      );
      toast({
        title: "Pomiar dodany",
        description: "Nowy pomiar został pomyślnie zapisany.",
      });
    }
    setIsAddDialogOpen(false);
    setEditingMeasurement(null);
  };

  const handleEditMeasurement = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
    setIsAddDialogOpen(true);
  };

  const openDeleteConfirmation = (measurement: Measurement) => {
    setMeasurementToDelete(measurement);
  };

  const handleDeleteMeasurement = async () => {
    if (!measurementToDelete) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMeasurements((prev) =>
      prev.filter((m) => m.id !== measurementToDelete.id)
    );
    toast({
      title: "Pomiar usunięty",
      description: "Pomiar został pomyślnie usunięty.",
    });
    setMeasurementToDelete(null);
    setIsDeleting(false);
  };

  const getBodyPartValue = (
    measurement: Measurement,
    partName: string
  ): string => {
    const part = measurement.bodyParts.find((p) => p.name === partName);
    return part && part.value !== null ? part.value.toString() : "-";
  };

  const handleExportToCSV = () => {
    if (measurements.length === 0) {
      toast({
        title: "Brak danych",
        description: "Nie ma żadnych pomiarów do wyeksportowania.",
        variant: "destructive",
      });
      return;
    }

    // Dynamically determine all unique body part names for headers
    const allBodyPartNames = Array.from(
      new Set(measurements.flatMap((m) => m.bodyParts.map((bp) => bp.name)))
    ).sort();

    let csvContent = "data:text/csv;charset=utf-8,";
    // Headers
    const headers = [
      "Data",
      "Waga (kg)",
      "BMI",
      "Interpretacja BMI",
      ...allBodyPartNames,
      "Notatki",
    ];
    csvContent += headers.join(";") + "\r\n";

    // Rows
    measurements.forEach((m) => {
      const date = format(parseISO(m.date), "yyyy-MM-dd", { locale: pl });
      const bmi = calculateBMI(m.weight, USER_HEIGHT_CM);
      const bmiInterpretation = interpretBMI(bmi);

      const bodyPartValues = allBodyPartNames.map((bpName) => {
        const part = m.bodyParts.find((p) => p.name === bpName);
        return part && part.value !== null ? part.value.toString() : "";
      });

      const row = [
        date,
        m.weight.toString(),
        bmi !== null ? bmi.toString() : "",
        bmiInterpretation !== "-" ? bmiInterpretation : "",
        ...bodyPartValues,
        m.notes || "",
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(";"); // Escape quotes and ensure string
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pomiary_ciala.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Eksport zakończony",
      description: "Dane pomiarów zostały wyeksportowane do CSV.",
    });
  };

  if (pageIsLoading) {
    return <MeasurementsPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header part of AppLayout */}
      {/* <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Panelu</span>
              </Link>
            </Button>
            <Scale className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Pomiary Ciała</h1>
          </div>
          <Button
            onClick={() => {
              setEditingMeasurement(null);
              setIsAddDialogOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Dodaj Pomiar
          </Button>
        </div>
      </header> */}

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto space-y-8">
          <div className="flex justify-end">
            <Button
                onClick={() => {
                setEditingMeasurement(null);
                setIsAddDialogOpen(true);
                }}
            >
                <PlusCircle className="mr-2 h-5 w-5" />
                Dodaj Pomiar
            </Button>
          </div>
          <AddMeasurementDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSave={handleSaveMeasurement}
            initialData={editingMeasurement}
          />

          {measurementToDelete && (
            <AlertDialog
              open={!!measurementToDelete}
              onOpenChange={() => setMeasurementToDelete(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usunąć pomiar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz usunąć ten pomiar z dnia{" "}
                    {format(parseISO(measurementToDelete.date), "PPP", {
                      locale: pl,
                    })}
                    ? Tej akcji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Anuluj
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteMeasurement}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : null}
                    Potwierdź i usuń
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-6 w-6 text-primary" /> Historia
                  Pomiarów
                </CardTitle>
                <CardDescription>
                  Przeglądaj i zarządzaj swoimi zapisanymi pomiarami.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleExportToCSV}
                disabled={measurements.length === 0}
              >
                <Download className="mr-2 h-4 w-4" /> Eksportuj dane do CSV
              </Button>
            </CardHeader>
            <CardContent>
              {measurements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Ruler className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Brak zapisanych pomiarów.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Kliknij "Dodaj Pomiar", aby rozpocząć śledzenie.
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Waga (kg)</TableHead>
                        <TableHead className="text-right">BMI</TableHead>
                        {PREDEFINED_BODY_PARTS.map((part) => (
                          <TableHead
                            key={part.key}
                            className="text-right hidden sm:table-cell"
                          >
                            {part.label}
                          </TableHead>
                        ))}
                        <TableHead className="hidden md:table-cell">
                          Notatki
                        </TableHead>
                        <TableHead className="text-right">Akcje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {measurements.map((m) => {
                        const bmi = calculateBMI(m.weight, USER_HEIGHT_CM);
                        const bmiInterpretation = interpretBMI(bmi);
                        return (
                          <TableRow key={m.id}>
                            <TableCell>
                              {format(parseISO(m.date), "PPP", { locale: pl })}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {m.weight.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-right">
                              {bmi !== null ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help underline decoration-dashed decoration-muted-foreground/50">
                                        {bmi} ({bmiInterpretation})
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>BMI: {bmi}</p>
                                      <p>Interpretacja: {bmiInterpretation}</p>
                                      <p className="text-xs text-muted-foreground">
                                        (Wzrost: {USER_HEIGHT_CM || "N/A"} cm)
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : USER_HEIGHT_CM ? (
                                "-"
                              ) : (
                                <span className="text-xs text-destructive">
                                  Podaj wzrost w profilu
                                </span>
                              )}
                            </TableCell>
                            {PREDEFINED_BODY_PARTS.map((part) => (
                              <TableCell
                                key={part.key}
                                className="text-right hidden sm:table-cell"
                              >
                                {getBodyPartValue(m, part.name)}
                              </TableCell>
                            ))}
                            <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                              {m.notes || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditMeasurement(m)}
                                className="mr-1"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edytuj</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteConfirmation(m)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Usuń</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {measurements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-6 w-6 text-primary" /> Wykresy Postępu
                </CardTitle>
                <CardDescription>
                  Wizualizuj zmiany swoich pomiarów w czasie.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select
                    value={selectedChartMetric}
                    onValueChange={setSelectedChartMetric}
                  >
                    <SelectTrigger className="w-full sm:w-[280px]">
                      <SelectValue placeholder="Wybierz metrykę do wyświetlenia" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMetricsForChart.map((metric) => (
                        <SelectItem key={metric} value={metric}>
                          {metric}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {chartData.length >= 1 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <RechartsLineChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        domain={["auto", "auto"]}
                        allowDecimals={true}
                        width={selectedChartMetric === "BMI" ? 30 : undefined} // Adjust YAxis width for BMI
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Line
                        dataKey={selectedChartMetric}
                        type="monotone"
                        stroke={`var(--color-${selectedChartMetric.replace(
                          /[()\s./]/g,
                          "_"
                        )})`} // Sanitize name for CSS variable
                        strokeWidth={2}
                        dot={{
                          fill: `var(--color-${selectedChartMetric.replace(
                            /[()\s./]/g,
                            "_"
                          )})`,
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      />
                    </RechartsLineChart>
                  </ChartContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Za mało danych dla wybranej metryki, aby wygenerować wykres.
                    Zarejestruj więcej pomiarów.
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Wykres przedstawia dostępne dane dla wybranej metryki.
                </p>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" /> Ustawienia
                Przypomnień o Pomiarach
              </CardTitle>
              <CardDescription>
                Skonfiguruj przypomnienia, aby regularnie aktualizować swoje
                pomiary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertTitle>Funkcja w budowie</AlertTitle>
                <AlertDescription>
                  Możliwość konfigurowania przypomnień o pomiarach (np.
                  codziennie, co tydzień) zostanie dodana w przyszłości.
                </AlertDescription>
              </Alert>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-measurement-reminders"
                  checked={enableReminders}
                  onCheckedChange={setEnableReminders}
                  disabled
                />
                <Label htmlFor="enable-measurement-reminders">
                  Włącz przypomnienia o pomiarach (Wkrótce)
                </Label>
              </div>
              {enableReminders && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reminder-frequency">Częstotliwość</Label>
                      <Select
                        value={reminderFrequency}
                        onValueChange={setReminderFrequency}
                        disabled
                      >
                        <SelectTrigger id="reminder-frequency">
                          <SelectValue placeholder="Wybierz częstotliwość" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Codziennie</SelectItem>
                          <SelectItem value="weekly">Co tydzień</SelectItem>
                          <SelectItem value="monthly">Co miesiąc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reminder-time">Godzina</Label>
                      <Input
                        id="reminder-time"
                        type="time"
                        value={reminderTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setReminderTime(e.target.value)
                        }
                        disabled
                      />
                    </div>
                  </div>
                  <Button disabled>
                    Zapisz ustawienia przypomnień (Wkrótce)
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
