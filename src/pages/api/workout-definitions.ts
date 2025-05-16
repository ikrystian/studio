
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB } from '@/lib/sqlite';
import type { Workout, ExerciseInWorkout } from '@/app/(app)/dashboard/workout/active/[workoutId]/page'; // Re-use types
import { MOCK_CURRENT_USER_PROFILE } from '@/lib/mockData'; // For user-specific fetching

type ApiResponse = {
  success: boolean;
  data?: Workout[];
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    const db = getDB();
    // In a real app, userId would come from an authenticated session.
    // For now, using the mock current user's ID.
    const userId = MOCK_CURRENT_USER_PROFILE.id;

    try {
      const workoutDefinitionsQuery = `
        SELECT 
          wd.id, 
          wd.name, 
          wd.type,
          wd.user_id,
          wd.isPublic
        FROM workout_definitions wd
        WHERE wd.user_id = ? OR wd.isPublic = 1
        ORDER BY wd.createdAt DESC
      `;
      const definitionsFromDb = db.prepare(workoutDefinitionsQuery).all(userId) as {
        id: string;
        name: string;
        type: string | null;
        user_id: string | null;
        isPublic: number;
      }[];

      const workouts: Workout[] = [];

      for (const def of definitionsFromDb) {
        const exercisesQuery = `
          SELECT 
            wde.exercise_id as id, 
            e.name, 
            wde.defaultSets, 
            wde.defaultReps, 
            wde.defaultRestSeconds as defaultRest
          FROM workout_definition_exercises wde
          JOIN exercises e ON e.id = wde.exercise_id
          WHERE wde.workout_definition_id = ?
          ORDER BY wde.order_index ASC
        `;
        const exercisesForDef = db.prepare(exercisesQuery).all(def.id) as ExerciseInWorkout[];
        
        workouts.push({
          id: def.id,
          name: def.name,
          type: def.type || undefined, // Add type if available
          exercises: exercisesForDef,
        });
      }

      return res.status(200).json({ success: true, data: workouts });
    } catch (error) {
      console.error('API Error fetching workout definitions from SQLite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
      return res.status(500).json({ success: false, message: `Wystąpił błąd serwera: ${errorMessage}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
