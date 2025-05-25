import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB, getCurrentUserId } from '@/lib/sqlite';
import type { Workout, ExerciseInWorkout } from '@/app/(app)/dashboard/workout/active/[workoutId]/page';

type ApiResponse = {
  success: boolean;
  data?: Workout;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { workoutId } = req.query;

  if (typeof workoutId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Nieprawidłowe ID treningu'
    });
  }

  if (req.method === 'GET') {
    const db = getDB();
    const currentUserId = getCurrentUserId();

    try {
      // Get the workout definition
      const workoutQuery = `
        SELECT 
          wd.id, wd.name, wd.type, wd.description, wd.isPublic, wd.user_id
        FROM workout_definitions wd
        WHERE wd.id = ? AND (wd.user_id = ? OR wd.isPublic = 1)
      `;
      
      const workout = db.prepare(workoutQuery).get(workoutId, currentUserId) as {
        id: string;
        name: string;
        type: string | null;
        description: string | null;
        isPublic: number;
        user_id: string | null;
      } | undefined;

      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Trening nie został znaleziony lub nie masz do niego dostępu'
        });
      }

      // Get the exercises for this workout
      const exercisesQuery = `
        SELECT 
          wde.order_index,
          wde.defaultSets,
          wde.defaultReps,
          wde.defaultRestSeconds,
          wde.targetRpe,
          wde.notes,
          e.id as exercise_id,
          e.name as exercise_name
        FROM workout_definition_exercises wde
        JOIN exercises e ON wde.exercise_id = e.id
        WHERE wde.workout_definition_id = ?
        ORDER BY wde.order_index ASC
      `;
      
      const exercises = db.prepare(exercisesQuery).all(workoutId) as Array<{
        order_index: number;
        defaultSets: number | null;
        defaultReps: string | null;
        defaultRestSeconds: number | null;
        targetRpe: string | null;
        notes: string | null;
        exercise_id: string;
        exercise_name: string;
      }>;

      const workoutExercises: ExerciseInWorkout[] = exercises.map(ex => ({
        id: ex.exercise_id,
        name: ex.exercise_name,
        defaultSets: ex.defaultSets || 3,
        defaultReps: ex.defaultReps || "10",
        defaultRest: ex.defaultRestSeconds || 60,
        targetRpe: ex.targetRpe ? parseFloat(ex.targetRpe) : undefined,
        notes: ex.notes || undefined,
      }));

      const workoutDefinition: Workout = {
        id: workout.id,
        name: workout.name,
        type: workout.type || "Mieszany",
        description: workout.description || undefined,
        exercises: workoutExercises,
      };

      return res.status(200).json({ success: true, data: workoutDefinition });
    } catch (error) {
      console.error('Error fetching workout definition:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas pobierania definicji treningu.' 
      });
    }
  } else if (req.method === 'PUT') {
    const db = getDB();
    const currentUserId = getCurrentUserId();
    const { name, type, description, exercises } = req.body;

    try {
      // Check if user owns this workout
      const workoutOwnerQuery = `SELECT user_id FROM workout_definitions WHERE id = ?`;
      const workoutOwner = db.prepare(workoutOwnerQuery).get(workoutId) as { user_id: string } | undefined;

      if (!workoutOwner || workoutOwner.user_id !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Nie masz uprawnień do edycji tego treningu'
        });
      }

      const transaction = db.transaction(() => {
        // Update the workout definition
        const updateWorkoutQuery = `
          UPDATE workout_definitions 
          SET name = ?, type = ?, description = ?, updatedAt = datetime('now')
          WHERE id = ?
        `;
        
        db.prepare(updateWorkoutQuery).run(
          name,
          type || null,
          description || null,
          workoutId
        );

        // Delete existing exercises
        db.prepare(`DELETE FROM workout_definition_exercises WHERE workout_definition_id = ?`).run(workoutId);

        // Insert new exercises
        if (exercises && Array.isArray(exercises)) {
          const insertExerciseQuery = `
            INSERT INTO workout_definition_exercises 
            (id, workout_definition_id, exercise_id, order_index, defaultSets, defaultReps, defaultRestSeconds, targetRpe, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          exercises.forEach((exercise: ExerciseInWorkout, index: number) => {
            db.prepare(insertExerciseQuery).run(
              `${workoutId}-ex-${index}`,
              workoutId,
              exercise.id,
              index,
              exercise.defaultSets || 3,
              exercise.defaultReps || "10",
              exercise.defaultRest || 60,
              exercise.targetRpe ? exercise.targetRpe.toString() : null,
              exercise.notes || null
            );
          });
        }
      });

      transaction();

      return res.status(200).json({ success: true, message: 'Trening został zaktualizowany.' });
    } catch (error) {
      console.error('Error updating workout definition:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas aktualizacji treningu.' 
      });
    }
  } else if (req.method === 'DELETE') {
    const db = getDB();
    const currentUserId = getCurrentUserId();

    try {
      // Check if user owns this workout
      const workoutOwnerQuery = `SELECT user_id FROM workout_definitions WHERE id = ?`;
      const workoutOwner = db.prepare(workoutOwnerQuery).get(workoutId) as { user_id: string } | undefined;

      if (!workoutOwner || workoutOwner.user_id !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Nie masz uprawnień do usunięcia tego treningu'
        });
      }

      // Delete the workout definition (cascade will handle exercises)
      db.prepare(`DELETE FROM workout_definitions WHERE id = ?`).run(workoutId);

      return res.status(200).json({ success: true, message: 'Trening został usunięty.' });
    } catch (error) {
      console.error('Error deleting workout definition:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas usuwania treningu.' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
