import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB } from '@/lib/sqlite';
import type { SelectableExerciseType } from '@/lib/mockData';

type ExercisesResponseData = {
  success: boolean;
  message?: string;
  exercises?: SelectableExerciseType[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExercisesResponseData>
) {
  if (req.method === 'GET') {
    const db = getDB();

    try {
      const stmt = db.prepare(`
        SELECT id, name, category, instructions, videoUrl
        FROM exercises
        ORDER BY name ASC
      `);
      const exercises = stmt.all() as SelectableExerciseType[];

      return res.status(200).json({ success: true, exercises });
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return res.status(500).json({ success: false, message: 'Wystąpił wewnętrzny błąd serwera podczas pobierania ćwiczeń.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
