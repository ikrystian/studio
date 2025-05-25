import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB, getCurrentUserId } from '@/lib/sqlite';

interface SessionDetailData {
  id: string;
  workoutId?: string;
  workoutName: string;
  workoutType?: string;
  startTime: string;
  endTime: string;
  totalTimeSeconds: number;
  difficulty?: string;
  generalNotes?: string;
  calculatedTotalVolume?: number;
  exercises: Array<{
    id: string;
    name: string;
    defaultSets?: number;
    defaultReps?: string;
    defaultRest?: number;
  }>;
  recordedSets: Record<string, Array<{
    setNumber: number;
    weight?: string;
    reps?: string;
    rpe?: number;
    notes?: string;
  }>>;
}

type ApiResponse = {
  success: boolean;
  data?: SessionDetailData;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { sessionId } = req.query;

  if (req.method === 'GET') {
    const db = getDB();
    const userId = getCurrentUserId();

    try {
      // Get the workout session
      const sessionQuery = `
        SELECT id, workout_definition_id, workout_name, workout_type, 
               startTime, endTime, totalTimeSeconds, difficulty, 
               generalNotes, calculatedTotalVolume
        FROM workout_sessions
        WHERE id = ? AND user_id = ?
      `;
      
      const session = db.prepare(sessionQuery).get(sessionId, userId) as {
        id: string;
        workout_definition_id: string | null;
        workout_name: string;
        workout_type: string | null;
        startTime: string;
        endTime: string;
        totalTimeSeconds: number;
        difficulty: string | null;
        generalNotes: string | null;
        calculatedTotalVolume: number | null;
      } | undefined;

      if (!session) {
        return res.status(404).json({ 
          success: false, 
          message: 'Sesja treningowa nie została znaleziona.' 
        });
      }

      // Get recorded sets for this session
      const setsQuery = `
        SELECT exercise_id, exercise_name_in_session, setNumber, weight, reps, rpe, notes
        FROM recorded_sets
        WHERE workout_session_id = ?
        ORDER BY exercise_id, setNumber
      `;
      
      const sets = db.prepare(setsQuery).all(sessionId) as Array<{
        exercise_id: string;
        exercise_name_in_session: string;
        setNumber: number;
        weight: string | null;
        reps: string | null;
        rpe: number | null;
        notes: string | null;
      }>;

      // Group sets by exercise
      const recordedSets: Record<string, Array<{
        setNumber: number;
        weight?: string;
        reps?: string;
        rpe?: number;
        notes?: string;
      }>> = {};

      const exercisesMap = new Map<string, {
        id: string;
        name: string;
        defaultSets?: number;
        defaultReps?: string;
        defaultRest?: number;
      }>();

      sets.forEach(set => {
        if (!recordedSets[set.exercise_id]) {
          recordedSets[set.exercise_id] = [];
        }
        
        recordedSets[set.exercise_id].push({
          setNumber: set.setNumber,
          weight: set.weight || undefined,
          reps: set.reps || undefined,
          rpe: set.rpe || undefined,
          notes: set.notes || undefined,
        });

        // Add exercise to map if not already present
        if (!exercisesMap.has(set.exercise_id)) {
          exercisesMap.set(set.exercise_id, {
            id: set.exercise_id,
            name: set.exercise_name_in_session,
            // Default values - could be enhanced by joining with workout_definition_exercises
            defaultSets: 3,
            defaultReps: "10",
            defaultRest: 60,
          });
        }
      });

      const sessionDetail: SessionDetailData = {
        id: session.id,
        workoutId: session.workout_definition_id || undefined,
        workoutName: session.workout_name,
        workoutType: session.workout_type || undefined,
        startTime: session.startTime,
        endTime: session.endTime,
        totalTimeSeconds: session.totalTimeSeconds,
        difficulty: session.difficulty || undefined,
        generalNotes: session.generalNotes || undefined,
        calculatedTotalVolume: session.calculatedTotalVolume || undefined,
        exercises: Array.from(exercisesMap.values()),
        recordedSets,
      };

      return res.status(200).json({ success: true, data: sessionDetail });
    } catch (error) {
      console.error('Error fetching workout session details:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas pobierania szczegółów sesji treningowej.' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
