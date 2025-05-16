
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB } from '@/lib/sqlite';
import { MOCK_CURRENT_USER_PROFILE } from '@/lib/mockData'; // For placeholder user ID

// Define the expected structure of the API response data
interface LastWorkoutApiData {
  id: string;
  name: string;
  date: string; // ISO string for startTime
  durationSeconds: number;
  exerciseCount: number;
}

type ApiResponse = {
  success: boolean;
  data?: LastWorkoutApiData | null;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    const db = getDB();
    // MOCK BACKEND LOGIC: In a real application with authentication,
    // the userId would be obtained from the authenticated session (e.g., a JWT token or server session).
    // For this prototype, we are using the ID of the MOCK_CURRENT_USER_PROFILE.
    // This means the API will fetch the last workout for *this specific mock user* from the SQLite database.
    const userId = MOCK_CURRENT_USER_PROFILE.id;

    try {
      // Get the most recent workout session for the user
      const sessionQuery = `
        SELECT id, workout_name, startTime, totalTimeSeconds
        FROM workout_sessions
        WHERE user_id = ?
        ORDER BY startTime DESC
        LIMIT 1
      `;
      const session = db.prepare(sessionQuery).get(userId) as {
        id: string;
        workout_name: string;
        startTime: string;
        totalTimeSeconds: number;
      } | undefined;

      if (session) {
        // Count distinct exercises for that session
        const exerciseCountQuery = `
          SELECT COUNT(DISTINCT exercise_id) as count
          FROM recorded_sets
          WHERE workout_session_id = ?
        `;
        const exerciseResult = db.prepare(exerciseCountQuery).get(session.id) as { count: number } | undefined;
        const exerciseCount = exerciseResult ? exerciseResult.count : 0;

        const lastWorkout: LastWorkoutApiData = {
          id: session.id,
          name: session.workout_name,
          date: session.startTime,
          durationSeconds: session.totalTimeSeconds,
          exerciseCount: exerciseCount,
        };
        return res.status(200).json({ success: true, data: lastWorkout });
      } else {
        // No workout found for this user in the database
        return res.status(200).json({ success: true, data: null });
      }
    } catch (error) {
      console.error('API Error fetching last workout from SQLite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
      return res.status(500).json({ success: false, message: `Wystąpił błąd serwera: ${errorMessage}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
