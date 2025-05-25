import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB, getCurrentUserId } from '@/lib/sqlite';

interface PlanDayDetail {
  dayName: string;
  assignedWorkoutId?: string;
  assignedWorkoutName?: string;
  isRestDay: boolean;
  notes?: string;
  templateId?: string | null;
  templateName?: string | null;
}

interface DetailedTrainingPlan {
  id: string;
  name: string;
  description: string;
  goal: string;
  duration: string;
  schedule: PlanDayDetail[];
  author?: {
    id: string;
    fullName: string;
    username: string;
  };
  isPublic: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

type ApiResponse = {
  success: boolean;
  data?: DetailedTrainingPlan;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { planId } = req.query;

  if (typeof planId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Nieprawidłowe ID planu treningowego'
    });
  }

  if (req.method === 'GET') {
    const db = getDB();
    const currentUserId = getCurrentUserId();

    try {
      // Get the training plan with author information
      const planQuery = `
        SELECT 
          tp.id, tp.name, tp.description, tp.goal, tp.duration, tp.isPublic,
          tp.startDate, tp.endDate, tp.createdAt, tp.updatedAt,
          u.id as author_id, u.fullName as author_name, u.username as author_username
        FROM training_plans tp
        LEFT JOIN users u ON tp.user_id = u.id
        WHERE tp.id = ? AND (tp.user_id = ? OR tp.isPublic = 1)
      `;
      
      const plan = db.prepare(planQuery).get(planId, currentUserId) as {
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
      } | undefined;

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan treningowy nie został znaleziony lub nie masz do niego dostępu'
        });
      }

      // Get the plan days/schedule
      const daysQuery = `
        SELECT 
          dayName, order_index, assigned_workout_definition_id, assigned_workout_name,
          isRestDay, notes, templateId, templateName
        FROM training_plan_days
        WHERE training_plan_id = ?
        ORDER BY order_index ASC
      `;
      
      const days = db.prepare(daysQuery).all(planId) as Array<{
        dayName: string;
        order_index: number;
        assigned_workout_definition_id: string | null;
        assigned_workout_name: string | null;
        isRestDay: number;
        notes: string | null;
        templateId: string | null;
        templateName: string | null;
      }>;

      const schedule: PlanDayDetail[] = days.map(day => ({
        dayName: day.dayName,
        assignedWorkoutId: day.assigned_workout_definition_id || undefined,
        assignedWorkoutName: day.assigned_workout_name || undefined,
        isRestDay: day.isRestDay === 1,
        notes: day.notes || undefined,
        templateId: day.templateId,
        templateName: day.templateName,
      }));

      const detailedPlan: DetailedTrainingPlan = {
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        goal: plan.goal || '',
        duration: plan.duration || '',
        schedule,
        author: plan.author_id ? {
          id: plan.author_id,
          fullName: plan.author_name || '',
          username: plan.author_username || '',
        } : undefined,
        isPublic: plan.isPublic === 1,
        startDate: plan.startDate || undefined,
        endDate: plan.endDate || undefined,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };

      return res.status(200).json({ success: true, data: detailedPlan });
    } catch (error) {
      console.error('Error fetching detailed training plan:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas pobierania szczegółów planu treningowego.' 
      });
    }
  } else if (req.method === 'PUT') {
    const db = getDB();
    const currentUserId = getCurrentUserId();
    const { name, description, goal, duration, startDate, endDate, schedule } = req.body;

    try {
      // Check if user owns this plan
      const planOwnerQuery = `SELECT user_id FROM training_plans WHERE id = ?`;
      const planOwner = db.prepare(planOwnerQuery).get(planId) as { user_id: string } | undefined;

      if (!planOwner || planOwner.user_id !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Nie masz uprawnień do edycji tego planu'
        });
      }

      const transaction = db.transaction(() => {
        // Update the training plan
        const updatePlanQuery = `
          UPDATE training_plans 
          SET name = ?, description = ?, goal = ?, duration = ?, startDate = ?, endDate = ?, updatedAt = datetime('now')
          WHERE id = ?
        `;
        
        db.prepare(updatePlanQuery).run(
          name,
          description || null,
          goal || null,
          duration || null,
          startDate || null,
          endDate || null,
          planId
        );

        // Delete existing plan days
        db.prepare(`DELETE FROM training_plan_days WHERE training_plan_id = ?`).run(planId);

        // Insert new plan days
        if (schedule && Array.isArray(schedule)) {
          const insertDayQuery = `
            INSERT INTO training_plan_days 
            (id, training_plan_id, dayName, order_index, assigned_workout_definition_id, assigned_workout_name, isRestDay, notes, templateId, templateName)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          schedule.forEach((day: PlanDayDetail, index: number) => {
            db.prepare(insertDayQuery).run(
              `${planId}-day-${index}`,
              planId,
              day.dayName,
              index,
              day.assignedWorkoutId || null,
              day.assignedWorkoutName || null,
              day.isRestDay ? 1 : 0,
              day.notes || null,
              day.templateId || null,
              day.templateName || null
            );
          });
        }
      });

      transaction();

      return res.status(200).json({ success: true, message: 'Plan treningowy został zaktualizowany.' });
    } catch (error) {
      console.error('Error updating training plan:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas aktualizacji planu treningowego.' 
      });
    }
  } else if (req.method === 'DELETE') {
    const db = getDB();
    const currentUserId = getCurrentUserId();

    try {
      // Check if user owns this plan
      const planOwnerQuery = `SELECT user_id FROM training_plans WHERE id = ?`;
      const planOwner = db.prepare(planOwnerQuery).get(planId) as { user_id: string } | undefined;

      if (!planOwner || planOwner.user_id !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Nie masz uprawnień do usunięcia tego planu'
        });
      }

      // Delete the training plan (cascade will handle plan days)
      db.prepare(`DELETE FROM training_plans WHERE id = ?`).run(planId);

      return res.status(200).json({ success: true, message: 'Plan treningowy został usunięty.' });
    } catch (error) {
      console.error('Error deleting training plan:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas usuwania planu treningowego.' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
