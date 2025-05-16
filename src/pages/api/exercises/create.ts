
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB } from '@/lib/sqlite';
import { v4 as uuidv4 } from 'uuid';
import type { SelectableExerciseType } from '@/components/workout/exercise-selection-dialog'; // Re-use type for response

type CreateExerciseApiPayload = {
  name: string;
  category?: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  exercise?: SelectableExerciseType; // Return the created exercise
  errors?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'POST') {
    const { name, category } = req.body as CreateExerciseApiPayload;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: 'Nazwa ćwiczenia jest wymagana.' });
    }

    const db = getDB();
    const newExerciseId = `custom-${uuidv4().substring(0, 8)}`; // Generate a unique ID

    try {
      const stmt = db.prepare(`
        INSERT INTO exercises (id, name, category, createdBy_user_id)
        VALUES (@id, @name, @category, @createdBy_user_id)
      `);
      
      // In a real app, createdBy_user_id would come from the authenticated user's session
      const mockUserId = 'current_user_id'; // Placeholder

      stmt.run({
        id: newExerciseId,
        name: name.trim(),
        category: category || 'Inne', // Default category if not provided
        createdBy_user_id: mockUserId, 
      });

      const newExercise: SelectableExerciseType = {
        id: newExerciseId,
        name: name.trim(),
        category: category || 'Inne',
      };

      return res.status(201).json({ 
        success: true, 
        message: 'Ćwiczenie zostało pomyślnie dodane do bazy danych.',
        exercise: newExercise
      });

    } catch (error: any) {
      console.error('API Error creating exercise in SQLite:', error);
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' && error.message?.includes('exercises.name')) {
        return res.status(409).json({ success: false, message: `Ćwiczenie o nazwie "${name.trim()}" już istnieje.`, errors: { name: 'Nazwa ćwiczenia musi być unikalna.'} });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
      return res.status(500).json({ success: false, message: `Wystąpił błąd serwera: ${errorMessage}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
