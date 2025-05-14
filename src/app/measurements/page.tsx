
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
  Ruler, // Using Ruler for generic body part icon
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip, // Renamed to avoid conflict
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
import { AddMeasurementDialog, type MeasurementFormData, PREDEFINED_BODY_PARTS } from "@/components/measurements/add-measurement-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    ],
    notes: "Czuję się lżej.",
  },
];


export default function MeasurementsPage() {
  const { toast } = useToast();
  const [measurements, setMeasurements] = React.useState<Measurement[]>(INITIAL_MOCK_MEASUREMENTS);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingMeasurement, setEditingMeasurement] = React.useState<Measurement | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [measurementToDelete, setMeasurementToDelete] = React.useState<Measurement | null>(null);

  const [selectedChartMetric, setSelectedChartMetric] = React.useState<string>("Waga (kg)");

  const availableMetricsForChart = React.useMemo(() => {
    const metrics = ["Waga (kg)"];
    if (measurements.length > 0) {
      measurements[0].bodyParts.forEach(bp => {
        if (!metrics.includes(bp.name)) {
          metrics.push(bp.name);
        }
      });
    }
    return metrics;
  }, [measurements]);

  const chartData = React.useMemo(() => {
    return measurements
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()) // Sort by date
      .map(m => {
        const dataPoint: { date: string; [key: string]: any } = {
          date: format(parseISO(m.date), "dd MMM yy", { locale: pl }),
          "Waga (kg)": m.weight,
        };
        m.bodyParts.forEach(bp => {
          if (bp.value !== null) {
            dataPoint[bp.name] = bp.value;
          }
        });
        return dataPoint;
      })
      .filter(dp => dp[selectedChartMetric] !== undefined && dp[selectedChartMetric] !== null);
  }, [measurements, selectedChartMetric]);

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
      // Update existing measurement
      setMeasurements(prev => prev.map(m => m.id === editingMeasurement.id ? { ...data, id: editingMeasurement.id } : m));
      toast({ title: "Pomiar zaktualizowany", description: "Dane pomiaru zostały pomyślnie zaktualizowane." });
    } else {
      // Add new measurement
      const newMeasurement: Measurement = { ...data, id: uuidv4() };
      setMeasurements(prev => [...prev, newMeasurement].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
      toast({ title: "Pomiar dodany", description: "Nowy pomiar został pomyślnie zapisany." });
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setMeasurements(prev => prev.filter(m => m.id !== measurementToDelete.id));
    toast({ title: "Pomiar usunięty", description: "Pomiar został pomyślnie usunięty." });
    setMeasurementToDelete(null);
    setIsDeleting(false);
  };

  const getBodyPartValue = (measurement: Measurement, partName: string): string => {
    const part = measurement.bodyParts.find(p => p.name === partName);
    return part && part.value !== null ? part.value.toString() : "-";
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Panelu</span>
              </Link>
            </Button>
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Pomiary Ciała</h1>
          </div>
          <Button onClick={() => { setEditingMeasurement(null); setIsAddDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Dodaj Pomiar
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto space-y-8">
          {/* Add/Edit Measurement Dialog */}
          <AddMeasurementDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSave={handleSaveMeasurement}
            initialData={editingMeasurement}
          />
          
          {/* Delete Confirmation Dialog */}
           {measurementToDelete && (
            <AlertDialog open={!!measurementToDelete} onOpenChange={() => setMeasurementToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usunąć pomiar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Czy na pewno chcesz usunąć ten pomiar z dnia {format(parseISO(measurementToDelete.date), "PPP", { locale: pl })}? Tej akcji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteMeasurement} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? <Loader2 className="animate-spin mr-2"/> : null}
                    Potwierdź i usuń
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}


          {/* Measurement History Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-primary" /> Historia Pomiarów
              </CardTitle>
              <CardDescription>Przeglądaj i zarządzaj swoimi zapisanymi pomiarami.</CardDescription>
            </CardHeader>
            <CardContent>
              {measurements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Ruler className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Brak zapisanych pomiarów.</p>
                  <p className="text-sm text-muted-foreground">Kliknij "Dodaj Pomiar", aby rozpocząć śledzenie.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Waga (kg)</TableHead>
                        {PREDEFINED_BODY_PARTS.map(part => (
                          <TableHead key={part.key} className="text-right hidden sm:table-cell">{part.label}</TableHead>
                        ))}
                        <TableHead className="hidden md:table-cell">Notatki</TableHead>
                        <TableHead className="text-right">Akcje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {measurements.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{format(parseISO(m.date), "PPP", { locale: pl })}</TableCell>
                          <TableCell className="text-right font-medium">{m.weight.toFixed(1)}</TableCell>
                          {PREDEFINED_BODY_PARTS.map(part => (
                            <TableCell key={part.key} className="text-right hidden sm:table-cell">{getBodyPartValue(m, part.name)}</TableCell>
                          ))}
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                            {m.notes || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditMeasurement(m)} className="mr-1">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edytuj</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmation(m)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                               <span className="sr-only">Usuń</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Charts Section */}
          {measurements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-6 w-6 text-primary" /> Wykresy Postępu
                </CardTitle>
                <CardDescription>Wizualizuj zmiany swoich pomiarów w czasie.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={selectedChartMetric} onValueChange={setSelectedChartMetric}>
                    <SelectTrigger className="w-full sm:w-[280px]">
                      <SelectValue placeholder="Wybierz metrykę do wyświetlenia" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMetricsForChart.map(metric => (
                        <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {chartData.length >= 1 ? ( // Need at least 1 point to draw something, ideally 2 for a line
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        tickFormatter={(value) => format(parseISO(value), "dd MMM", { locale: pl })}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        domain={['auto', 'auto']}
                        allowDecimals={true}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Line
                        dataKey={selectedChartMetric}
                        type="monotone"
                        stroke={`var(--color-${selectedChartMetric.replace(/[()]/g, '').replace(/\s/g, '_')})`}
                        strokeWidth={2}
                        dot={{
                          fill: `var(--color-${selectedChartMetric.replace(/[()]/g, '').replace(/\s/g, '_')})`,
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      />
                    </RechartsLineChart>
                  </ChartContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Za mało danych dla wybranej metryki, aby wygenerować wykres. Zarejestruj więcej pomiarów.
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
        </div>
      </main>
    </div>
  );
}

    