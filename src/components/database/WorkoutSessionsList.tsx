'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Dumbbell, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

interface WorkoutSessionData {
  id: string;
  workoutName: string;
  workoutType?: string;
  startTime: string;
  endTime: string;
  totalTimeSeconds: number;
  difficulty?: string;
  generalNotes?: string;
  calculatedTotalVolume?: number;
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    sets: Array<{
      setNumber: number;
      weight?: string;
      reps?: string;
      rpe?: number;
      notes?: string;
    }>;
  }>;
}

interface WorkoutSessionsListProps {
  limit?: number;
  showAddButton?: boolean;
}

export function WorkoutSessionsList({ limit = 10, showAddButton = true }: WorkoutSessionsListProps) {
  const [sessions, setSessions] = useState<WorkoutSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workout-sessions?limit=${limit}&offset=0`);
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.data);
      } else {
        setError(data.message || 'Błąd podczas pobierania sesji treningowych');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
      console.error('Error fetching workout sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const toggleSessionExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'łatwy':
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'średni':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'trudny':
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Ładowanie sesji treningowych...</span>
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
            <Button onClick={fetchSessions} className="mt-4">
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
          <Dumbbell className="mr-2 h-5 w-5" />
          Historia Treningów ({sessions.length})
        </CardTitle>
        {showAddButton && (
          <Button size="sm">
            Nowy trening
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Brak sesji treningowych w bazie danych</p>
            {showAddButton && (
              <Button className="mt-4">
                Rozpocznij pierwszy trening
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isExpanded = expandedSessions.has(session.id);

              return (
                <Collapsible key={session.id} open={isExpanded} onOpenChange={() => toggleSessionExpansion(session.id)}>
                  <div className="border rounded-lg">
                    <CollapsibleTrigger className="w-full p-4 text-left hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{session.workoutName}</h4>
                            {session.workoutType && (
                              <Badge variant="outline">{session.workoutType}</Badge>
                            )}
                            {session.difficulty && (
                              <Badge className={getDifficultyColor(session.difficulty)}>
                                {session.difficulty}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDuration(session.totalTimeSeconds)}
                            </span>
                            <span>{session.exercises.length} ćwiczeń</span>
                            <span>{format(parseISO(session.startTime), 'dd MMM yyyy', { locale: pl })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.calculatedTotalVolume && (
                            <span className="text-sm font-medium">
                              {session.calculatedTotalVolume.toFixed(0)} kg
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t bg-muted/20">
                        {session.generalNotes && (
                          <div className="mb-4 pt-4">
                            <p className="text-sm"><strong>Notatki:</strong> {session.generalNotes}</p>
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          {session.exercises.map((exercise) => (
                            <div key={exercise.exerciseId} className="bg-background rounded-lg p-3">
                              <h5 className="font-medium mb-2">{exercise.exerciseName}</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {exercise.sets.map((set) => (
                                  <div key={set.setNumber} className="text-sm p-2 bg-muted rounded">
                                    <span className="font-medium">Seria {set.setNumber}:</span>
                                    <div className="flex gap-2 mt-1">
                                      {set.weight && <span>{set.weight} kg</span>}
                                      {set.reps && <span>× {set.reps}</span>}
                                      {set.rpe && <span>RPE {set.rpe}</span>}
                                    </div>
                                    {set.notes && (
                                      <p className="text-xs text-muted-foreground mt-1">{set.notes}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
