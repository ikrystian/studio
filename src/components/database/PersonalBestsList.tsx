'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Dumbbell, Timer, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

interface PersonalBestData {
  id: string;
  exerciseId: string;
  exerciseName: string;
  recordType: string;
  value: {
    weight?: string;
    reps?: number;
    timeSeconds?: number;
    distanceKm?: number;
  };
  date: string;
  notes?: string;
  createdAt: string;
}

interface PersonalBestsListProps {
  limit?: number;
  showAddButton?: boolean;
}

export function PersonalBestsList({ limit, showAddButton = true }: PersonalBestsListProps) {
  const [personalBests, setPersonalBests] = useState<PersonalBestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalBests();
  }, []);

  const fetchPersonalBests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/personal-bests');
      const data = await response.json();
      
      if (data.success) {
        const limitedData = limit ? data.data.slice(0, limit) : data.data;
        setPersonalBests(limitedData);
      } else {
        setError(data.message || 'Błąd podczas pobierania rekordów osobistych');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
      console.error('Error fetching personal bests:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (pb: PersonalBestData) => {
    const { value, recordType } = pb;
    
    if (value.weight && value.reps) {
      return `${value.weight} kg × ${value.reps} powtórzeń`;
    }
    if (value.weight) {
      return `${value.weight} kg`;
    }
    if (value.reps) {
      return `${value.reps} powtórzeń`;
    }
    if (value.timeSeconds) {
      const minutes = Math.floor(value.timeSeconds / 60);
      const seconds = value.timeSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    if (value.distanceKm) {
      return `${value.distanceKm} km`;
    }
    return 'Brak danych';
  };

  const getRecordIcon = (recordType: string) => {
    switch (recordType.toLowerCase()) {
      case 'weight':
      case 'max_weight':
        return Dumbbell;
      case 'time':
      case 'best_time':
        return Timer;
      case 'distance':
        return MapPin;
      default:
        return Trophy;
    }
  };

  const getRecordTypeLabel = (recordType: string) => {
    switch (recordType.toLowerCase()) {
      case 'weight':
      case 'max_weight':
        return 'Maksymalny ciężar';
      case 'time':
      case 'best_time':
        return 'Najlepszy czas';
      case 'distance':
        return 'Najdłuższy dystans';
      case 'reps':
      case 'max_reps':
        return 'Najwięcej powtórzeń';
      default:
        return recordType;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Ładowanie rekordów osobistych...</span>
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
            <Button onClick={fetchPersonalBests} className="mt-4">
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
          <Trophy className="mr-2 h-5 w-5" />
          Rekordy Osobiste ({personalBests.length})
        </CardTitle>
        {showAddButton && (
          <Button size="sm">
            Dodaj rekord
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {personalBests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Brak rekordów osobistych w bazie danych</p>
            {showAddButton && (
              <Button className="mt-4">
                Dodaj pierwszy rekord
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {personalBests.map((pb) => {
              const RecordIcon = getRecordIcon(pb.recordType);

              return (
                <div key={pb.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <RecordIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{pb.exerciseName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {getRecordTypeLabel(pb.recordType)}
                        </Badge>
                        <span className="font-bold text-lg">{formatValue(pb)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(parseISO(pb.date), 'dd MMMM yyyy', { locale: pl })}
                      </p>
                      {pb.notes && (
                        <p className="text-sm mt-1">{pb.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    Dodano: {format(parseISO(pb.createdAt), 'dd.MM.yyyy', { locale: pl })}
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
