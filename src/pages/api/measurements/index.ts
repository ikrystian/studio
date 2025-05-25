import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB, getCurrentUserId } from '@/lib/sqlite';

interface MeasurementData {
  id: string;
  date: string;
  weight: number;
  bodyParts?: any;
  notes?: string;
  createdAt: string;
}

type ApiResponse = {
  success: boolean;
  data?: MeasurementData[];
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
        SELECT id, date, weight, bodyPartsJson, notes, createdAt
        FROM measurements
        WHERE user_id = ?
        ORDER BY date DESC
      `;
      
      const measurements = db.prepare(query).all(userId) as Array<{
        id: string;
        date: string;
        weight: number;
        bodyPartsJson: string | null;
        notes: string | null;
        createdAt: string;
      }>;

      const formattedMeasurements: MeasurementData[] = measurements.map(m => ({
        id: m.id,
        date: m.date,
        weight: m.weight,
        bodyParts: m.bodyPartsJson ? JSON.parse(m.bodyPartsJson) : undefined,
        notes: m.notes || undefined,
        createdAt: m.createdAt
      }));

      return res.status(200).json({ success: true, data: formattedMeasurements });
    } catch (error) {
      console.error('Error fetching measurements:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas pobierania pomiarów.' 
      });
    }
  } else if (req.method === 'POST') {
    const db = getDB();
    const userId = getCurrentUserId();
    const { weight, bodyParts, notes, date } = req.body;

    try {
      const insertQuery = `
        INSERT INTO measurements (id, user_id, date, weight, bodyPartsJson, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const id = `measurement_${Date.now()}`;
      const bodyPartsJson = bodyParts ? JSON.stringify(bodyParts) : null;
      
      db.prepare(insertQuery).run(
        id,
        userId,
        date || new Date().toISOString(),
        weight,
        bodyPartsJson,
        notes || null
      );

      return res.status(201).json({ success: true, message: 'Pomiar został dodany.' });
    } catch (error) {
      console.error('Error creating measurement:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas dodawania pomiaru.' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
