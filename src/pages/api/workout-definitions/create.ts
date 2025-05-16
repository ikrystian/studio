
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB } from '@/lib/sqlite';
import { v4 as uuidv4 } from 'uuid';
import { MOCK_CURRENT_USER_PROFILE } from '@/lib/mockData'; // For placeholder user ID
import type { ExerciseInWorkoutFormValues } from '@/app/(app)/dashboard/workout/create/page'; // Reuse type

type CreateWorkoutApiPayload = {
  workoutName: string;
  workoutType?: string;
  exercises: ExerciseInWorkoutFormValues[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  workoutDefinitionId?: string;
  errors?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'POST') {
    const { workoutName, workoutType, exercises } = req.body as CreateWorkoutApiPayload;
    const userId = MOCK_CURRENT_USER_PROFILE.id; // Placeholder for actual authenticated user ID

    if (!workoutName || !exercises || exercises.length === 0) {
      return res.status(400).json({ success: false, message: 'Nazwa treningu i przynajmniej jedno ćwiczenie są wymagane.' });
    }

    const db = getDB();

    try {
      const newWorkoutDefinitionId = uuidv4();
      const insertWorkoutDefStmt = db.prepare(`
        INSERT INTO workout_definitions (id, user_id, name, type, description, isPublic)
        VALUES (@id, @user_id, @name, @type, @description, @isPublic)
      `);

      const insertWorkoutDefExStmt = db.prepare(`
        INSERT INTO workout_definition_exercises 
          (id, workout_definition_id, exercise_id, order_index, defaultSets, defaultReps, defaultRestSeconds, targetRpe, notes)
        VALUES 
          (@id, @workout_definition_id, @exercise_id, @order_index, @defaultSets, @defaultReps, @defaultRestSeconds, @targetRpe, @notes)
      `);

      db.transaction(() => {
        insertWorkoutDefStmt.run({
          id: newWorkoutDefinitionId,
          user_id: userId,
          name: workoutName,
          type: workoutType || 'Mieszany',
          description: `Utworzony trening: ${workoutName}`, // Basic description
          isPublic: 0, // Default to private
        });

        exercises.forEach((exercise, index) => {
          // Ensure exercise.id exists in the exercises table before trying to link it.
          // For this prototype, we assume the IDs passed from the frontend are valid exercise IDs.
          // In a real app, you might want to validate exercise.id here.
          
          // Convert empty strings from form to null for numeric DB fields if appropriate
          const sets = exercise.sets === "" || exercise.sets === undefined || exercise.sets === null ? null : Number(exercise.sets);
          const restTimeSeconds = exercise.restTimeSeconds === "" || exercise.restTimeSeconds === undefined || exercise.restTimeSeconds === null ? null : Number(exercise.restTimeSeconds);


          insertWorkoutDefExStmt.run({
            id: uuidv4(), // Unique ID for the workout_definition_exercise entry
            workout_definition_id: newWorkoutDefinitionId,
            exercise_id: exercise.id, // This is the ID from the master 'exercises' table
            order_index: index,
            defaultSets: sets,
            defaultReps: exercise.reps === null ? null : String(exercise.reps),
            defaultRestSeconds: restTimeSeconds,
            targetRpe: exercise.targetRpe === null ? null : String(exercise.targetRpe),
            notes: exercise.exerciseNotes === null ? null : String(exercise.exerciseNotes),
          });
        });
      })();

      return res.status(201).json({ 
        success: true, 
        message: 'Trening został pomyślnie zapisany w bazie danych.',
        workoutDefinitionId: newWorkoutDefinitionId 
      });

    } catch (error: any) {
      console.error('API Error creating workout definition in SQLite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
      return res.status(500).json({ success: false, message: `Wystąpił błąd serwera: ${errorMessage}`, errors: error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
