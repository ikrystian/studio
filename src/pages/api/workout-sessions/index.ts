import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB, getCurrentUserId } from '@/lib/sqlite';

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

type ApiResponse = {
  success: boolean;
  data?: WorkoutSessionData[];
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    const db = getDB();
    const userId = getCurrentUserId();
    const { limit = '10', offset = '0' } = req.query;

    try {
      // Get workout sessions
      const sessionsQuery = `
        SELECT id, workout_name, workout_type, startTime, endTime, 
               totalTimeSeconds, difficulty, generalNotes, calculatedTotalVolume
        FROM workout_sessions
        WHERE user_id = ?
        ORDER BY startTime DESC
        LIMIT ? OFFSET ?
      `;
      
      const sessions = db.prepare(sessionsQuery).all(userId, parseInt(limit as string), parseInt(offset as string)) as Array<{
        id: string;
        workout_name: string;
        workout_type: string | null;
        startTime: string;
        endTime: string;
        totalTimeSeconds: number;
        difficulty: string | null;
        generalNotes: string | null;
        calculatedTotalVolume: number | null;
      }>;

      // Get sets for each session
      const formattedSessions: WorkoutSessionData[] = [];
      
      for (const session of sessions) {
        const setsQuery = `
          SELECT exercise_id, exercise_name_in_session, setNumber, weight, reps, rpe, notes
          FROM recorded_sets
          WHERE workout_session_id = ?
          ORDER BY exercise_id, setNumber
        `;
        
        const sets = db.prepare(setsQuery).all(session.id) as Array<{
          exercise_id: string;
          exercise_name_in_session: string;
          setNumber: number;
          weight: string | null;
          reps: string | null;
          rpe: number | null;
          notes: string | null;
        }>;

        // Group sets by exercise
        const exercisesMap = new Map<string, {
          exerciseId: string;
          exerciseName: string;
          sets: Array<{
            setNumber: number;
            weight?: string;
            reps?: string;
            rpe?: number;
            notes?: string;
          }>;
        }>();

        sets.forEach(set => {
          if (!exercisesMap.has(set.exercise_id)) {
            exercisesMap.set(set.exercise_id, {
              exerciseId: set.exercise_id,
              exerciseName: set.exercise_name_in_session,
              sets: []
            });
          }
          
          exercisesMap.get(set.exercise_id)!.sets.push({
            setNumber: set.setNumber,
            weight: set.weight || undefined,
            reps: set.reps || undefined,
            rpe: set.rpe || undefined,
            notes: set.notes || undefined,
          });
        });

        formattedSessions.push({
          id: session.id,
          workoutName: session.workout_name,
          workoutType: session.workout_type || undefined,
          startTime: session.startTime,
          endTime: session.endTime,
          totalTimeSeconds: session.totalTimeSeconds,
          difficulty: session.difficulty || undefined,
          generalNotes: session.generalNotes || undefined,
          calculatedTotalVolume: session.calculatedTotalVolume || undefined,
          exercises: Array.from(exercisesMap.values())
        });
      }

      return res.status(200).json({ success: true, data: formattedSessions });
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas pobierania sesji treningowych.' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
