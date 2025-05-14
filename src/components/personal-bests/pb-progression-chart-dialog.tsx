
"use client";

import * as React from "react";
import { format, parseISO, subMonths } from "date-fns";
import { pl } from "date-fns/locale";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { PersonalBest } from "@/app/personal-bests/page";
import { AlertTriangle } from "lucide-react";

interface PbProgressionChartDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pbData: PersonalBest | null;
}

interface ChartDataPoint {
  date: string; // Formatted date for X-axis
  value: number;
  fullDate: Date; // Original date for sorting
}

// Helper to get the numeric value from PB
const getNumericValue = (pb: PersonalBest): number | null => {
  switch (pb.recordType) {
    case "weight_reps":
      return typeof pb.value.weight === 'number' ? pb.value.weight : null;
    case "max_reps":
      // For max_reps, if weight is BW or not a number, we might just chart reps.
      // Or, if we decide only numeric weights are chartable for progression this way:
      return typeof pb.value.weight === 'number' ? pb.value.weight : (pb.value.reps || null); // Fallback to reps if weight is not number
    case "time_seconds":
      return pb.value.timeSeconds || null;
    case "distance_km":
      return pb.value.distanceKm || null;
    default:
      return null;
  }
};

const getRecordTypeUnit = (recordType: PersonalBest['recordType']): string => {
    switch (recordType) {
        case "weight_reps": return "kg";
        case "max_reps": return "kg/powt."; // Could be reps if BW
        case "time_seconds": return "s";
        case "distance_km": return "km";
        default: return "";
    }
}


export function PbProgressionChartDialog({
  isOpen,
  onOpenChange,
  pbData,
}: PbProgressionChartDialogProps) {
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);

  React.useEffect(() => {
    if (pbData && isOpen) {
      const currentValue = getNumericValue(pbData);
      if (currentValue === null) {
        setChartData([]);
        return;
      }
      const currentDate = parseISO(pbData.date);
      
      // Generate 3-5 mock historical data points
      const mockHistory: ChartDataPoint[] = [];
      const pointsToGenerate = Math.floor(Math.random() * 3) + 3; // 3 to 5 points

      for (let i = pointsToGenerate -1; i >= 1; i--) {
        const pastDate = subMonths(currentDate, i * (Math.floor(Math.random()*2)+1) ); // 1-2 months apart
        // Simulate gradual increase, ensure it's less than current value
        let pastValue = currentValue - (currentValue * (i * (0.05 + Math.random() * 0.10) )); // 5-15% less per step back
        
        if (pbData.recordType === 'time_seconds') {
            pastValue = currentValue + (currentValue * (i * (0.05 + Math.random() * 0.05))); // For time, higher is worse
        } else {
            pastValue = Math.max(1, parseFloat(pastValue.toFixed(1))); // Ensure positive and to 1 decimal place
        }


        mockHistory.push({
          date: format(pastDate, "dd MMM yy", { locale: pl }),
          value: parseFloat(pastValue.toFixed(1)),
          fullDate: pastDate,
        });
      }

      mockHistory.push({
        date: format(currentDate, "dd MMM yy", { locale: pl }),
        value: currentValue,
        fullDate: currentDate,
      });
      
      // Sort by date just in case
      mockHistory.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
      setChartData(mockHistory);

    } else {
      setChartData([]);
    }
  }, [pbData, isOpen]);

  const chartConfig = {
    value: { label: `Wartość (${pbData ? getRecordTypeUnit(pbData.recordType) : ''})`, color: "hsl(var(--chart-1))" },
  } as const;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Progresja Rekordu: {pbData?.exerciseName || "Brak danych"}
          </DialogTitle>
          {pbData && <DialogDescription>Typ Rekordu: {pbData.recordType} - Aktualny: {pbData.value.weight}{pbData.value.reps ? `x${pbData.value.reps}`:''} {getRecordTypeUnit(pbData.recordType)} ({format(parseISO(pbData.date), "PPP", {locale: pl})})</DialogDescription>}
        </DialogHeader>
        <div className="py-4 min-h-[350px]">
          {chartData.length > 1 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-value)" }}
                  activeDot={{ r: 6 }}
                />
              </RechartsLineChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <AlertTriangle className="h-10 w-10 mb-2" />
              <p>Brak wystarczających danych historycznych do wyświetlenia wykresu progresji dla tego rekordu.</p>
              <p className="text-xs">(Dane na wykresie są obecnie symulowane dla celów demonstracyjnych)</p>
            </div>
          )}
        </div>
        <DialogFooter className="pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Zamknij
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
