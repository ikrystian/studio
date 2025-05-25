import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB, getCurrentUserId } from '@/lib/sqlite';

interface TrainingPlanData {
  id: string;
  name: string;
  description: string;
  goal: string;
  duration: string;
  isPublic: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    fullName: string;
    username: string;
  };
  daysCount?: number;
}

type ApiResponse = {
  success: boolean;
  data?: TrainingPlanData[];
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    const db = getDB();
    const currentUserId = getCurrentUserId();
    const { includePublic = 'true', search, goal } = req.query;

    try {
      let query = `
        SELECT 
          tp.id, tp.name, tp.description, tp.goal, tp.duration, tp.isPublic,
          tp.startDate, tp.endDate, tp.createdAt, tp.updatedAt,
          u.id as author_id, u.fullName as author_name, u.username as author_username,
          COUNT(tpd.id) as days_count
        FROM training_plans tp
        LEFT JOIN users u ON tp.user_id = u.id
        LEFT JOIN training_plan_days tpd ON tp.id = tpd.training_plan_id
        WHERE (tp.user_id = ? OR (tp.isPublic = 1 AND ? = 'true'))
      `;
      
      const params: any[] = [currentUserId, includePublic];

      // Add search filter
      if (search && typeof search === 'string') {
        query += ` AND (tp.name LIKE ? OR tp.description LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
      }

      // Add goal filter
      if (goal && typeof goal === 'string' && goal !== 'Wszystkie') {
        query += ` AND tp.goal = ?`;
        params.push(goal);
      }

      query += ` GROUP BY tp.id ORDER BY tp.createdAt DESC`;
      
      const plans = db.prepare(query).all(...params) as Array<{
        id: string;
        name: string;
        description: string;
        goal: string;
        duration: string;
        isPublic: number;
        startDate: string | null;
        endDate: string | null;
        createdAt: string;
        updatedAt: string;
        author_id: string | null;
        author_name: string | null;
        author_username: string | null;
        days_count: number;
      }>;

      const formattedPlans: TrainingPlanData[] = plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        goal: plan.goal || '',
        duration: plan.duration || '',
        isPublic: plan.isPublic === 1,
        startDate: plan.startDate || undefined,
        endDate: plan.endDate || undefined,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        author: plan.author_id ? {
          id: plan.author_id,
          fullName: plan.author_name || '',
          username: plan.author_username || '',
        } : undefined,
        daysCount: plan.days_count || 0,
      }));

      return res.status(200).json({ success: true, data: formattedPlans });
    } catch (error) {
      console.error('Error fetching training plans:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas pobierania planów treningowych.' 
      });
    }
  } else if (req.method === 'POST') {
    const db = getDB();
    const userId = getCurrentUserId();
    const { name, description, goal, duration, isPublic, startDate, endDate } = req.body;

    try {
      const insertQuery = `
        INSERT INTO training_plans (id, user_id, name, description, goal, duration, isPublic, startDate, endDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const id = `plan_${Date.now()}`;
      
      db.prepare(insertQuery).run(
        id,
        userId,
        name,
        description || null,
        goal || null,
        duration || null,
        isPublic ? 1 : 0,
        startDate || null,
        endDate || null
      );

      return res.status(201).json({ success: true, message: 'Plan treningowy został utworzony.' });
    } catch (error) {
      console.error('Error creating training plan:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas tworzenia planu treningowego.' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
