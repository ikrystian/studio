
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // For generating IDs where needed
import {
  MOCK_USER_PROFILES_DB,
  MOCK_CURRENT_USER_PROFILE,
  MOCK_EXERCISES_DATABASE,
  MOCK_HISTORY_SESSIONS,
  MOCK_DETAILED_TRAINING_PLANS,
  INITIAL_MOCK_MEASUREMENTS,
  INITIAL_MOCK_PHOTOS,
  INITIAL_MOCK_WELLNESS_ENTRIES,
  DEFAULT_HYDRATION_PORTIONS,
  INITIAL_USER_GOALS_STATS,
  INITIAL_MOCK_PBS,
  ALL_MOCK_POSTS_FEED,
  MOCK_USERS_FEED, // Make sure this is imported for community features
  INITIAL_MOCK_NOTIFICATIONS_FEED,
  MOCK_USER_DATA_EDIT_PROFILE, // Used for default app settings example
  MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR, // For day_templates table
  MOCK_WORKOUTS_ACTIVE, // For workout_definitions potentially
} from '@/lib/mockData';
import type { UserProfile, HistoricalWorkoutSession, DetailedTrainingPlan, Measurement, ProgressPhoto, WellnessEntry, Portion, UserGoal, PersonalBest, FeedMockPost, FeedMockNotification, RichDayTemplate, Workout as ActiveWorkoutType } from '@/lib/mockData';

const SALT_ROUNDS = 10;
const dbPath = path.join(process.cwd(), 'workoutwise.db');
let dbInstance: Database.Database;

function initializeDB() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new Database(dbPath, { /* verbose: console.log */ });

  db.pragma('foreign_keys = ON');

  // --- Schema Definition based on database.txt ---

  // Users & Authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      fullName TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      hashedPassword TEXT,
      avatarUrl TEXT,
      bio TEXT,
      fitnessLevel TEXT,
      joinDate TEXT,
      dateOfBirth TEXT,
      gender TEXT,
      weight REAL,
      height REAL,
      role TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_privacy_settings (
      user_id TEXT PRIMARY KEY,
      isActivityPublic INTEGER DEFAULT 1,
      isFriendsListPublic INTEGER DEFAULT 1,
      isSharedPlansPublic INTEGER DEFAULT 1,
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_social_accounts (
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_uid TEXT NOT NULL,
      PRIMARY KEY (user_id, provider),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Workout Creation & Definitions
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category TEXT,
      instructions TEXT,
      videoUrl TEXT,
      createdBy_user_id TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (createdBy_user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_definitions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      type TEXT,
      description TEXT,
      isPublic INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_definition_exercises (
      id TEXT PRIMARY KEY,
      workout_definition_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      defaultSets INTEGER,
      defaultReps TEXT,
      defaultRestSeconds INTEGER,
      targetRpe TEXT,
      notes TEXT,
      UNIQUE (workout_definition_id, order_index),
      FOREIGN KEY (workout_definition_id) REFERENCES workout_definitions(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );
  `);

  // Workout Tracking & History
  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      workout_definition_id TEXT,
      workout_name TEXT NOT NULL,
      workout_type TEXT,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      totalTimeSeconds INTEGER NOT NULL,
      difficulty TEXT,
      generalNotes TEXT,
      calculatedTotalVolume REAL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (workout_definition_id) REFERENCES workout_definitions(id) ON DELETE SET NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS recorded_sets (
      id TEXT PRIMARY KEY,
      workout_session_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name_in_session TEXT NOT NULL,
      setNumber INTEGER NOT NULL,
      weight TEXT,
      reps TEXT,
      rpe INTEGER,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) 
    );
  `);

  // Training Plans
  db.exec(`
    CREATE TABLE IF NOT EXISTS training_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      goal TEXT,
      duration TEXT,
      isPublic INTEGER DEFAULT 0,
      startDate TEXT,
      endDate TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS training_plan_days (
      id TEXT PRIMARY KEY,
      training_plan_id TEXT NOT NULL,
      dayName TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      assigned_workout_definition_id TEXT,
      assigned_workout_name TEXT,
      isRestDay INTEGER DEFAULT 0 NOT NULL,
      notes TEXT,
      templateId TEXT,
      templateName TEXT,
      UNIQUE (training_plan_id, dayName),
      UNIQUE (training_plan_id, order_index),
      FOREIGN KEY (training_plan_id) REFERENCES training_plans(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_workout_definition_id) REFERENCES workout_definitions(id) ON DELETE SET NULL
    );
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS day_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      assigned_workout_definition_id TEXT,
      assigned_workout_name TEXT,
      isRestDay INTEGER DEFAULT 0,
      description TEXT,
      FOREIGN KEY (assigned_workout_definition_id) REFERENCES workout_definitions(id) ON DELETE SET NULL
    );
  `);

  // Measurements & Progress Photos
  db.exec(`
    CREATE TABLE IF NOT EXISTS measurements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      weight REAL NOT NULL,
      bodyPartsJson TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS progress_photos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      privacy TEXT DEFAULT 'private',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Wellness & Hydration
  db.exec(`
    CREATE TABLE IF NOT EXISTS wellness_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      wellBeing INTEGER NOT NULL,
      energyLevel INTEGER NOT NULL,
      sleepQuality INTEGER NOT NULL,
      stressLevel INTEGER,
      muscleSoreness INTEGER,
      context TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      UNIQUE (user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS hydration_log_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_hydration_settings (
      user_id TEXT PRIMARY KEY,
      dailyGoalMl INTEGER DEFAULT 2500,
      customPortionsJson TEXT,
      reminderSettingsJson TEXT,
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Goals & Personal Bests
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      goalName TEXT NOT NULL,
      metric TEXT NOT NULL,
      currentValue REAL,
      targetValue REAL NOT NULL,
      deadline TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS personal_bests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      recordType TEXT NOT NULL,
      value_weight TEXT,
      value_reps INTEGER,
      value_time_seconds INTEGER,
      value_distance_km REAL,
      date TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE (user_id, exercise_id, recordType),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );
  `);

  // Community Features
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      imageUrl TEXT,
      postType TEXT,
      workoutSummaryDetailsJson TEXT,
      timestamp TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS post_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS post_likes (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_follows (
      follower_user_id TEXT NOT NULL,
      following_user_id TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (follower_user_id, following_user_id),
      FOREIGN KEY (follower_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_user_id TEXT NOT NULL,
      actor_user_id TEXT,
      type TEXT NOT NULL,
      related_post_id TEXT,
      related_comment_id TEXT,
      contentPreview TEXT,
      link TEXT,
      isRead INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (related_post_id) REFERENCES community_posts(id) ON DELETE SET NULL,
      FOREIGN KEY (related_comment_id) REFERENCES post_comments(id) ON DELETE SET NULL
    );
  `);
  
  // Application Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_app_settings (
      user_id TEXT PRIMARY KEY,
      reminderSettingsJson TEXT,
      progressionModelSettingsJson TEXT,
      quickActionsVisibilityJson TEXT,
      theme TEXT DEFAULT 'dark',
      language TEXT DEFAULT 'pl',
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`CREATE TABLE IF NOT EXISTS db_meta (key TEXT PRIMARY KEY, value TEXT);`);
  
  console.log("Database schema initialized.");
  
  seedDatabase(db);

  return db;
}

function seedDatabase(db: Database.Database) {
  const stmtCheckSeed = db.prepare(`SELECT value FROM db_meta WHERE key = ?`);
  const seedStatus = stmtCheckSeed.get('seeds_applied_v2'); // Increment version if schema changes significantly

  if (seedStatus === 'true') {
    return;
  }

  console.log("Seeding database with mock data (v2)...");

  const transaction = db.transaction(() => {
    // Seed Users
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, email, fullName, username, hashedPassword, avatarUrl, bio, fitnessLevel, joinDate, dateOfBirth, gender, weight, height, role)
      VALUES (@id, @email, @fullName, @username, @hashedPassword, @avatarUrl, @bio, @fitnessLevel, @joinDate, @dateOfBirth, @gender, @weight, @height, @role)
    `);
    const mockPassword = "password"; 
    const hashedMockPassword = bcrypt.hashSync(mockPassword, SALT_ROUNDS);

    let allMockUsers = [...MOCK_USER_PROFILES_DB];
    if (!allMockUsers.find(u => u.id === MOCK_CURRENT_USER_PROFILE.id)) {
        allMockUsers.push(MOCK_CURRENT_USER_PROFILE);
    }
     if (!allMockUsers.find(u => u.id === MOCK_USER_DATA_EDIT_PROFILE.id)) {
        const editProfileUser = allMockUsers.find(p => p.email === MOCK_USER_DATA_EDIT_PROFILE.email);
        if (!editProfileUser) { 
            allMockUsers.push({
                ...MOCK_USER_DATA_EDIT_PROFILE,
                email: MOCK_USER_DATA_EDIT_PROFILE.email || 'edit.profile@example.com',
                joinDate: MOCK_USER_DATA_EDIT_PROFILE.joinDate || new Date().toISOString(),
                followers: 0,
                following: 0,
                recentActivity: [],
                role: 'client',
                privacySettings: { isActivityPublic: true, isFriendsListPublic: true, isSharedPlansPublic: true },
            } as UserProfile);
        }
    }

    // Add test@example.com if not present in mocks
    const testUserEmail = "test@example.com";
    if (!allMockUsers.some(u => u.email === testUserEmail)) {
        allMockUsers.push({
            id: 'test-user-id-sqlite', // Or generate UUID
            email: testUserEmail,
            fullName: "Test User SQLite",
            username: "testsqlite",
            avatarUrl: "https://placehold.co/100x100.png?text=TS",
            bio: "SQLite Test User",
            fitnessLevel: "Średniozaawansowany",
            joinDate: new Date().toISOString(),
            followers: 0,
            following: 0,
            recentActivity: [],
            role: 'admin',
        } as UserProfile);
    }


    for (const user of allMockUsers) {
      if (!user.id || !user.email || !user.fullName || !user.username) continue;
      insertUser.run({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        hashedPassword: user.email === testUserEmail && user.id === 'test-user-id-sqlite' ? bcrypt.hashSync("password", SALT_ROUNDS) : hashedMockPassword,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        fitnessLevel: user.fitnessLevel,
        joinDate: user.joinDate,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        role: user.role || 'client'
      });

      if (user.privacySettings) {
        db.prepare(`INSERT OR IGNORE INTO user_privacy_settings (user_id, isActivityPublic, isFriendsListPublic, isSharedPlansPublic) VALUES (?, ?, ?, ?)`).run(
          user.id,
          user.privacySettings.isActivityPublic ? 1 : 0,
          user.privacySettings.isFriendsListPublic ? 1 : 0,
          user.privacySettings.isSharedPlansPublic ? 1 : 0
        );
      }
    }

    // Seed Exercises
    const insertExercise = db.prepare(`
      INSERT OR IGNORE INTO exercises (id, name, category, instructions, videoUrl, createdBy_user_id)
      VALUES (@id, @name, @category, @instructions, @videoUrl, @createdBy_user_id)
    `);
    for (const ex of MOCK_EXERCISES_DATABASE) {
      insertExercise.run({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        instructions: ex.instructions || null,
        videoUrl: ex.videoUrl || null,
        createdBy_user_id: null
      });
    }
    
    // Seed Workout Definitions
    const insertWorkoutDef = db.prepare(`
        INSERT OR IGNORE INTO workout_definitions (id, user_id, name, type, description, isPublic)
        VALUES (@id, @user_id, @name, @type, @description, @isPublic)
    `);
    const insertWorkoutDefEx = db.prepare(`
        INSERT OR IGNORE INTO workout_definition_exercises (id, workout_definition_id, exercise_id, order_index, defaultSets, defaultReps, defaultRestSeconds)
        VALUES (@id, @workout_definition_id, @exercise_id, @order_index, @defaultSets, @defaultReps, @defaultRestSeconds)
    `);

    // Combine MOCK_WORKOUTS_ACTIVE with workouts derived from MOCK_DETAILED_TRAINING_PLANS' schedules
    const allWorkoutDefinitions: ActiveWorkoutType[] = [...MOCK_WORKOUTS_ACTIVE];
    MOCK_DETAILED_TRAINING_PLANS.forEach(plan => {
      plan.schedule.forEach(day => {
        if (day.assignedWorkoutId && day.assignedWorkoutName && !day.isRestDay) {
          if (!allWorkoutDefinitions.find(wd => wd.id === day.assignedWorkoutId)) {
            // Find corresponding exercises from MOCK_HISTORY_SESSIONS or MOCK_EXERCISES_DATABASE if needed
            const exercisesForDef = MOCK_HISTORY_SESSIONS.find(s => s.workoutId === day.assignedWorkoutId)?.exercises ||
                                    MOCK_EXERCISES_DATABASE.filter(ex => day.assignedWorkoutName?.toLowerCase().includes(ex.name.toLowerCase().substring(0,5)))
                                    .map(e => ({ id: e.id, name: e.name, defaultSets: 3, defaultReps: '10', defaultRest: 60 }));
            allWorkoutDefinitions.push({
              id: day.assignedWorkoutId,
              name: day.assignedWorkoutName,
              exercises: exercisesForDef.slice(0,5), // Limit to 5 exercises for mock def
              // Infer type if possible, otherwise default
              type: MOCK_EXERCISES_DATABASE.find(ex => ex.id === exercisesForDef[0]?.id)?.category === 'Cardio' ? 'Cardio' : 'Siłowy',
            });
          }
        }
      });
    });


    for (const wd of allWorkoutDefinitions) {
        insertWorkoutDef.run({
            id: wd.id,
            user_id: MOCK_CURRENT_USER_PROFILE.id, // Or assign to specific mock users
            name: wd.name,
            type: wd.type || "Mieszany",
            description: `Mock definition for ${wd.name}`,
            isPublic: 0,
        });
        wd.exercises.forEach((ex, index) => {
            const exerciseExists = db.prepare('SELECT id FROM exercises WHERE id = ?').get(ex.id);
            if (exerciseExists) {
                insertWorkoutDefEx.run({
                    id: `wdex-${wd.id}-${ex.id}-${index}`,
                    workout_definition_id: wd.id,
                    exercise_id: ex.id,
                    order_index: index,
                    defaultSets: ex.defaultSets || 3,
                    defaultReps: ex.defaultReps || '10',
                    defaultRestSeconds: ex.defaultRest || 60,
                });
            }
        });
    }

    // Seed Day Templates
    const insertDayTemplate = db.prepare(`
      INSERT OR IGNORE INTO day_templates (id, name, assigned_workout_definition_id, assigned_workout_name, isRestDay, description)
      VALUES (@id, @name, @assigned_workout_definition_id, @assigned_workout_name, @isRestDay, @description)
    `);
    for (const dt of MOCK_DAY_TEMPLATES_FOR_PLAN_EDITOR) {
      insertDayTemplate.run({
        id: dt.id,
        name: dt.name,
        assigned_workout_definition_id: dt.assignedWorkoutId || null,
        assigned_workout_name: dt.assignedWorkoutName || null,
        isRestDay: dt.isRestDay ? 1 : 0,
        description: dt.name // Simple description
      });
    }

    // Seed Training Plans
    const insertPlan = db.prepare(`
      INSERT OR IGNORE INTO training_plans (id, user_id, name, description, goal, duration, isPublic, startDate, endDate)
      VALUES (@id, @user_id, @name, @description, @goal, @duration, @isPublic, @startDate, @endDate)
    `);
    const insertPlanDay = db.prepare(`
      INSERT OR IGNORE INTO training_plan_days (id, training_plan_id, dayName, order_index, assigned_workout_definition_id, assigned_workout_name, isRestDay, notes, templateId, templateName)
      VALUES (@id, @training_plan_id, @dayName, @order_index, @assigned_workout_definition_id, @assigned_workout_name, @isRestDay, @notes, @templateId, @templateName)
    `);
    for (const plan of MOCK_DETAILED_TRAINING_PLANS) {
      const planAuthor = allMockUsers.find(u => u.fullName === plan.author);
      insertPlan.run({
        id: plan.id,
        user_id: planAuthor ? planAuthor.id : MOCK_CURRENT_USER_PROFILE.id,
        name: plan.name,
        description: plan.description,
        goal: plan.goal,
        duration: plan.duration,
        isPublic: plan.isPublic ? 1 : 0,
        startDate: plan.startDate,
        endDate: plan.endDate
      });
      plan.schedule.forEach((day, index) => {
        insertPlanDay.run({
          id: `${plan.id}-day-${index}`,
          training_plan_id: plan.id,
          dayName: day.dayName,
          order_index: index,
          assigned_workout_definition_id: day.assignedWorkoutId || null,
          assigned_workout_name: day.assignedWorkoutName || null,
          isRestDay: day.isRestDay ? 1 : 0,
          notes: day.notes || null,
          templateId: day.templateId || null,
          templateName: day.templateName || null,
        });
      });
    }
    
    // Seed Workout Sessions and Recorded Sets
    const insertSession = db.prepare(`
      INSERT OR IGNORE INTO workout_sessions (id, user_id, workout_definition_id, workout_name, workout_type, startTime, endTime, totalTimeSeconds, difficulty, generalNotes, calculatedTotalVolume)
      VALUES (@id, @user_id, @workout_definition_id, @workout_name, @workout_type, @startTime, @endTime, @totalTimeSeconds, @difficulty, @generalNotes, @calculatedTotalVolume)
    `);
    const insertSet = db.prepare(`
      INSERT OR IGNORE INTO recorded_sets (id, workout_session_id, exercise_id, exercise_name_in_session, setNumber, weight, reps, rpe, notes)
      VALUES (@id, @workout_session_id, @exercise_id, @exercise_name_in_session, @setNumber, @weight, @reps, @rpe, @notes)
    `);
    for (const session of MOCK_HISTORY_SESSIONS) {
      insertSession.run({
        id: session.id,
        user_id: session.userId || MOCK_CURRENT_USER_PROFILE.id,
        workout_definition_id: session.workoutId,
        workout_name: session.workoutName,
        workout_type: session.workoutType,
        startTime: session.startTime,
        endTime: session.endTime,
        totalTimeSeconds: session.totalTimeSeconds,
        difficulty: session.difficulty,
        generalNotes: session.generalNotes,
        calculatedTotalVolume: session.calculatedTotalVolume
      });
      for (const exercise of session.exercises) {
        const setsForExercise = session.recordedSets[exercise.id];
        if (setsForExercise) {
          for (const set of setsForExercise) {
            insertSet.run({
              id: `set-${session.id}-${exercise.id}-${set.setNumber}-${uuidv4().substring(0,8)}`, // Ensure unique ID for sets
              workout_session_id: session.id,
              exercise_id: exercise.id,
              exercise_name_in_session: exercise.name,
              setNumber: set.setNumber,
              weight: String(set.weight),
              reps: String(set.reps),
              rpe: set.rpe,
              notes: set.notes
            });
          }
        }
      }
    }
    
    const insertMeasurement = db.prepare(`
      INSERT OR IGNORE INTO measurements (id, user_id, date, weight, bodyPartsJson, notes)
      VALUES (@id, @user_id, @date, @weight, @bodyPartsJson, @notes)
    `);
    for (const m of INITIAL_MOCK_MEASUREMENTS) {
      insertMeasurement.run({
        id: m.id, user_id: MOCK_CURRENT_USER_PROFILE.id, date: m.date, weight: m.weight,
        bodyPartsJson: JSON.stringify(m.bodyParts), notes: m.notes
      });
    }

    const insertPhoto = db.prepare(`
      INSERT OR IGNORE INTO progress_photos (id, user_id, imageUrl, date, description, privacy)
      VALUES (@id, @user_id, @imageUrl, @date, @description, @privacy)
    `);
    for (const p of INITIAL_MOCK_PHOTOS) {
      insertPhoto.run({
        id: p.id, user_id: MOCK_CURRENT_USER_PROFILE.id, imageUrl: p.imageUrl, date: p.date,
        description: p.description, privacy: 'private'
      });
    }

    const insertWellness = db.prepare(`
      INSERT OR IGNORE INTO wellness_entries (id, user_id, date, wellBeing, energyLevel, sleepQuality, stressLevel, muscleSoreness, context, notes)
      VALUES (@id, @user_id, @date, @wellBeing, @energyLevel, @sleepQuality, @stressLevel, @muscleSoreness, @context, @notes)
    `);
    for (const w of INITIAL_MOCK_WELLNESS_ENTRIES) {
      insertWellness.run({
        id: w.id, user_id: MOCK_CURRENT_USER_PROFILE.id, date: w.date, wellBeing: w.wellBeing, energyLevel: w.energyLevel,
        sleepQuality: w.sleepQuality, stressLevel: w.stressLevel, muscleSoreness: w.muscleSoreness, context: w.context, notes: w.notes
      });
    }

    const insertHydrationSettings = db.prepare(`
        INSERT OR IGNORE INTO user_hydration_settings (user_id, dailyGoalMl, customPortionsJson, reminderSettingsJson)
        VALUES (@user_id, @dailyGoalMl, @customPortionsJson, @reminderSettingsJson)
    `);
    insertHydrationSettings.run({
        user_id: MOCK_CURRENT_USER_PROFILE.id, dailyGoalMl: 2500,
        customPortionsJson: JSON.stringify(DEFAULT_HYDRATION_PORTIONS),
        reminderSettingsJson: JSON.stringify({ enabled: false, intervalMinutes: 60, startTime: "08:00", endTime: "22:00", playSound: false })
    });
    db.prepare(`INSERT OR IGNORE INTO hydration_log_entries (id, user_id, amount, timestamp) VALUES (?, ?, ?, ?)`).run(
        `hlog-${MOCK_CURRENT_USER_PROFILE.id}-seed-1`, MOCK_CURRENT_USER_PROFILE.id, 500, new Date(Date.now() - 1000 * 60 * 60).toISOString()
    );

    const insertGoal = db.prepare(`
      INSERT OR IGNORE INTO user_goals (id, user_id, goalName, metric, currentValue, targetValue, deadline, notes, status)
      VALUES (@id, @user_id, @goalName, @metric, @currentValue, @targetValue, @deadline, @notes, @status)
    `);
    for (const goal of INITIAL_USER_GOALS_STATS) {
      insertGoal.run({
        id: goal.id, user_id: MOCK_CURRENT_USER_PROFILE.id, goalName: goal.goalName, metric: goal.metric,
        currentValue: goal.currentValue, targetValue: goal.targetValue, deadline: goal.deadline?.toISOString(),
        notes: goal.notes, status: 'active'
      });
    }

    const insertPb = db.prepare(`
      INSERT OR IGNORE INTO personal_bests (id, user_id, exercise_id, exercise_name, recordType, value_weight, value_reps, value_time_seconds, value_distance_km, date, notes)
      VALUES (@id, @user_id, @exercise_id, @exercise_name, @recordType, @value_weight, @value_reps, @value_time_seconds, @value_distance_km, @date, @notes)
    `);
    for (const pb of INITIAL_MOCK_PBS) {
      insertPb.run({
        id: pb.id, user_id: MOCK_CURRENT_USER_PROFILE.id, exercise_id: pb.exerciseId, exercise_name: pb.exerciseName,
        recordType: pb.recordType, value_weight: pb.value.weight, value_reps: pb.value.reps,
        value_time_seconds: pb.value.timeSeconds, value_distance_km: pb.value.distanceKm, date: pb.date, notes: pb.notes
      });
    }

    const insertCommPost = db.prepare(`
      INSERT OR IGNORE INTO community_posts (id, user_id, content, imageUrl, postType, workoutSummaryDetailsJson, timestamp)
      VALUES (@id, @user_id, @content, @imageUrl, @postType, @workoutSummaryDetailsJson, @timestamp)
    `);
    const insertComment = db.prepare(`INSERT OR IGNORE INTO post_comments (id, post_id, user_id, text, timestamp) VALUES (?, ?, ?, ?, ?)`);
    const insertLike = db.prepare(`INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)`);
    for (const post of ALL_MOCK_POSTS_FEED) {
      const postUserId = MOCK_USERS_FEED.find(u => u.id === post.userId)?.id || MOCK_CURRENT_USER_PROFILE.id;
      insertCommPost.run({
        id: post.id, user_id: postUserId, content: post.content, imageUrl: post.imageUrl, postType: post.postType,
        workoutSummaryDetailsJson: post.workoutSummaryDetails ? JSON.stringify(post.workoutSummaryDetails) : null,
        timestamp: post.timestamp
      });
       post.comments.forEach(comment => {
            const commentUserId = MOCK_USERS_FEED.find(u => u.id === comment.userId)?.id || MOCK_CURRENT_USER_PROFILE.id;
            insertComment.run(comment.id, post.id, commentUserId, comment.text, comment.timestamp);
       });
       if (post.likedByCurrentUser) {
           insertLike.run(post.id, MOCK_CURRENT_USER_PROFILE.id);
       }
    }
    
    // Add some user follows for testing
    const user1 = allMockUsers.find(u => u.username === "alex_fit_girl");
    const user2 = allMockUsers.find(u => u.username === "kris_trener");
    const currentUser = MOCK_CURRENT_USER_PROFILE;
    if (user1 && currentUser.id !== user1.id) {
        db.prepare(`INSERT OR IGNORE INTO user_follows (follower_user_id, following_user_id) VALUES (?,?)`).run(currentUser.id, user1.id);
    }
    if (user2 && currentUser.id !== user2.id) {
         db.prepare(`INSERT OR IGNORE INTO user_follows (follower_user_id, following_user_id) VALUES (?,?)`).run(user2.id, currentUser.id);
    }


    const insertNotification = db.prepare(`
      INSERT OR IGNORE INTO notifications (id, recipient_user_id, actor_user_id, type, contentPreview, timestamp, isRead)
      VALUES (@id, @recipient_user_id, @actor_user_id, @type, @contentPreview, @timestamp, @isRead)
    `);
    for (const notif of INITIAL_MOCK_NOTIFICATIONS_FEED) {
      insertNotification.run({
        id: notif.id, recipient_user_id: MOCK_CURRENT_USER_PROFILE.id, actor_user_id: notif.user.id,
        type: notif.type, contentPreview: notif.postContentPreview, timestamp: notif.timestamp, isRead: notif.read ? 1 : 0
      });
    }

    const insertAppSettings = db.prepare(`
        INSERT OR IGNORE INTO user_app_settings (user_id, theme, language, reminderSettingsJson, progressionModelSettingsJson, quickActionsVisibilityJson)
        VALUES (@user_id, @theme, @language, @reminderSettingsJson, @progressionModelSettingsJson, @quickActionsVisibilityJson)
    `);
    const appSettingsUserId = allMockUsers.find(u => u.id === MOCK_USER_DATA_EDIT_PROFILE.id) ? MOCK_USER_DATA_EDIT_PROFILE.id : MOCK_CURRENT_USER_PROFILE.id;
    insertAppSettings.run({
        user_id: appSettingsUserId, theme: 'dark', language: 'pl',
        reminderSettingsJson: JSON.stringify({ enableReminders: false }),
        progressionModelSettingsJson: JSON.stringify({ enableProgression: true, selectedModel: 'linear_weight' }),
        quickActionsVisibilityJson: JSON.stringify({ 'workout-start': true, 'plans': true })
    });

    db.prepare(`INSERT OR REPLACE INTO db_meta (key, value) VALUES (?, ?)`).run('seeds_applied_v2', 'true');
    console.log("Database seeded successfully (v2).");
  });

  try {
    transaction();
  } catch (err: any) {
    console.error("Error during database seeding transaction (v2):", err.message);
  }
}

export function getDB() {
  if (!dbInstance) {
    dbInstance = initializeDB();
  }
  return dbInstance;
}
