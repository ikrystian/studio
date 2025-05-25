import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB, getCurrentUserId } from '@/lib/sqlite';

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

type ApiResponse = {
  success: boolean;
  data?: PersonalBestData[];
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    const db = getDB();
    const userId = getCurrentUserId();

    try {
      const query = `
        SELECT id, exercise_id, exercise_name, recordType, 
               value_weight, value_reps, value_time_seconds, value_distance_km,
               date, notes, createdAt
        FROM personal_bests
        WHERE user_id = ?
        ORDER BY date DESC
      `;
      
      const personalBests = db.prepare(query).all(userId) as Array<{
        id: string;
        exercise_id: string;
        exercise_name: string;
        recordType: string;
        value_weight: string | null;
        value_reps: number | null;
        value_time_seconds: number | null;
        value_distance_km: number | null;
        date: string;
        notes: string | null;
        createdAt: string;
      }>;

      const formattedPersonalBests: PersonalBestData[] = personalBests.map(pb => ({
        id: pb.id,
        exerciseId: pb.exercise_id,
        exerciseName: pb.exercise_name,
        recordType: pb.recordType,
        value: {
          weight: pb.value_weight || undefined,
          reps: pb.value_reps || undefined,
          timeSeconds: pb.value_time_seconds || undefined,
          distanceKm: pb.value_distance_km || undefined,
        },
        date: pb.date,
        notes: pb.notes || undefined,
        createdAt: pb.createdAt
      }));

      return res.status(200).json({ success: true, data: formattedPersonalBests });
    } catch (error) {
      console.error('Error fetching personal bests:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas pobierania rekordów osobistych.' 
      });
    }
  } else if (req.method === 'POST') {
    const db = getDB();
    const userId = getCurrentUserId();
    const { exerciseId, exerciseName, recordType, value, date, notes } = req.body;

    try {
      const insertQuery = `
        INSERT OR REPLACE INTO personal_bests 
        (id, user_id, exercise_id, exercise_name, recordType, value_weight, value_reps, value_time_seconds, value_distance_km, date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const id = `pb_${exerciseId}_${recordType}_${Date.now()}`;
      
      db.prepare(insertQuery).run(
        id,
        userId,
        exerciseId,
        exerciseName,
        recordType,
        value.weight || null,
        value.reps || null,
        value.timeSeconds || null,
        value.distanceKm || null,
        date || new Date().toISOString(),
        notes || null
      );

      return res.status(201).json({ success: true, message: 'Rekord osobisty został dodany.' });
    } catch (error) {
      console.error('Error creating personal best:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas dodawania rekordu osobistego.' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
