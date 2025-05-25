'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

interface MeasurementData {
  id: string;
  date: string;
  weight: number;
  bodyParts?: any;
  notes?: string;
  createdAt: string;
}

interface MeasurementsListProps {
  limit?: number;
  showAddButton?: boolean;
}

export function MeasurementsList({ limit, showAddButton = true }: MeasurementsListProps) {
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/measurements');
      const data = await response.json();
      
      if (data.success) {
        const limitedData = limit ? data.data.slice(0, limit) : data.data;
        setMeasurements(limitedData);
      } else {
        setError(data.message || 'Błąd podczas pobierania pomiarów');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
      console.error('Error fetching measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeightTrend = (currentWeight: number, previousWeight?: number) => {
    if (!previousWeight) return null;
    
    const diff = currentWeight - previousWeight;
    if (Math.abs(diff) < 0.1) return { icon: Minus, color: 'text-gray-500', text: 'bez zmian' };
    if (diff > 0) return { icon: TrendingUp, color: 'text-red-500', text: `+${diff.toFixed(1)} kg` };
    return { icon: TrendingDown, color: 'text-green-500', text: `${diff.toFixed(1)} kg` };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Ładowanie pomiarów...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={fetchMeasurements} className="mt-4">
              Spróbuj ponownie
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Scale className="mr-2 h-5 w-5" />
          Pomiary ({measurements.length})
        </CardTitle>
        {showAddButton && (
          <Button size="sm">
            Dodaj pomiar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {measurements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Scale className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Brak pomiarów w bazie danych</p>
            {showAddButton && (
              <Button className="mt-4">
                Dodaj pierwszy pomiar
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {measurements.map((measurement, index) => {
              const previousMeasurement = measurements[index + 1];
              const trend = getWeightTrend(measurement.weight, previousMeasurement?.weight);
              const TrendIcon = trend?.icon;

              return (
                <div key={measurement.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">{measurement.weight} kg</span>
                      {TrendIcon && (
                        <Badge variant="outline" className={trend.color}>
                          <TrendIcon className="h-3 w-3 mr-1" />
                          {trend.text}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(measurement.date), 'dd MMMM yyyy', { locale: pl })}
                    </p>
                    {measurement.notes && (
                      <p className="text-sm mt-1">{measurement.notes}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    Dodano: {format(parseISO(measurement.createdAt), 'dd.MM.yyyy HH:mm', { locale: pl })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
