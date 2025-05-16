
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import {
  MOCK_USER_PROFILES_DB,
  MOCK_CURRENT_USER_PROFILE,
  MOCK_EXERCISES_DATABASE,
  MOCK_HISTORY_SESSIONS,
  MOCK_TRAINING_PLANS_LIST,
  MOCK_DETAILED_TRAINING_PLANS,
  INITIAL_MOCK_MEASUREMENTS,
  INITIAL_MOCK_PHOTOS,
  INITIAL_MOCK_WELLNESS_ENTRIES,
  DEFAULT_HYDRATION_PORTIONS,
  INITIAL_USER_GOALS_STATS,
  INITIAL_MOCK_PBS,
  ALL_MOCK_POSTS_FEED,
  INITIAL_MOCK_NOTIFICATIONS_FEED,
  MOCK_USER_DATA_EDIT_PROFILE // Used for default app settings example
} from '@/lib/mockData';
import type { UserProfile, HistoricalWorkoutSession, TrainingPlanListItem, DetailedTrainingPlan, Measurement, ProgressPhoto, WellnessEntry, Portion, UserGoal, PersonalBest, FeedMockPost, FeedMockNotification } from '@/lib/mockData';

const SALT_ROUNDS = 10;
const dbPath = path.join(process.cwd(), 'workoutwise.db');
let dbInstance: Database.Database;

function initializeDB() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new Database(dbPath, { /* verbose: console.log */ }); // Verbose logging can be noisy

  // Enable Foreign Key support
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
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) -- Allow exercise to be deleted but keep set history referencing its ID
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

  // Table to track if seeding has been done
  db.exec(`CREATE TABLE IF NOT EXISTS db_meta (key TEXT PRIMARY KEY, value TEXT);`);
  
  console.log("Database schema initialized.");
  
  seedDatabase(db);

  return db;
}

function seedDatabase(db: Database.Database) {
  const stmtCheckSeed = db.prepare(`SELECT value FROM db_meta WHERE key = ?`);
  const seedStatus = stmtCheckSeed.get('seeds_applied');

  if (seedStatus === 'true') {
    // console.log("Database already seeded. Skipping.");
    return;
  }

  console.log("Seeding database with mock data...");

  const transaction = db.transaction(() => {
    // Seed Users
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, email, fullName, username, hashedPassword, avatarUrl, bio, fitnessLevel, joinDate, dateOfBirth, gender, weight, height, role)
      VALUES (@id, @email, @fullName, @username, @hashedPassword, @avatarUrl, @bio, @fitnessLevel, @joinDate, @dateOfBirth, @gender, @weight, @height, @role)
    `);
    const mockPassword = "password"; // Plain text for hashing
    const hashedMockPassword = bcrypt.hashSync(mockPassword, SALT_ROUNDS);

    const allMockUsers = [...MOCK_USER_PROFILES_DB];
    if (!allMockUsers.find(u => u.id === MOCK_CURRENT_USER_PROFILE.id)) {
        allMockUsers.push(MOCK_CURRENT_USER_PROFILE);
    }
     if (!allMockUsers.find(u => u.id === MOCK_USER_DATA_EDIT_PROFILE.id)) { // For default app settings
        const editProfileUser = MOCK_USER_PROFILES_DB.find(p => p.email === MOCK_USER_DATA_EDIT_PROFILE.email);
        if (!editProfileUser) { // Only add if no user with this email exists
            allMockUsers.push({
                ...MOCK_USER_DATA_EDIT_PROFILE,
                // Fill in missing UserProfile fields with defaults
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


    for (const user of allMockUsers) {
      if (!user.id || !user.email || !user.fullName || !user.username) continue; // Skip if essential fields are missing
      insertUser.run({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        hashedPassword: user.email === "test@example.com" ? bcrypt.hashSync("password", SALT_ROUNDS) : hashedMockPassword,
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

      // Seed User Privacy Settings
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
        instructions: ex.instructions || null, // From mockData update
        videoUrl: ex.videoUrl || null,       // From mockData update
        createdBy_user_id: null // Assuming system exercises for now
      });
    }
    
    // Seed Workout Definitions (from MOCK_WORKOUTS_ACTIVE as examples)
    const insertWorkoutDef = db.prepare(`
        INSERT OR IGNORE INTO workout_definitions (id, user_id, name, type, description, isPublic)
        VALUES (@id, @user_id, @name, @type, @description, @isPublic)
    `);
    const insertWorkoutDefEx = db.prepare(`
        INSERT OR IGNORE INTO workout_definition_exercises (id, workout_definition_id, exercise_id, order_index, defaultSets, defaultReps, defaultRestSeconds)
        VALUES (@id, @workout_definition_id, @exercise_id, @order_index, @defaultSets, @defaultReps, @defaultRestSeconds)
    `);

    MOCK_DETAILED_TRAINING_PLANS.forEach(plan => {
        plan.schedule.forEach(day => {
            if (day.assignedWorkoutId && day.assignedWorkoutName && !day.isRestDay) {
                const workoutDefId = day.assignedWorkoutId;
                // Check if this workout definition already exists based on MOCK_WORKOUTS_ACTIVE
                const existingActiveWorkout = MOCK_HISTORY_SESSIONS.find(s => s.workoutId === workoutDefId) || MOCK_WORKOUTS_ACTIVE.find(w => w.id === workoutDefId);
                
                insertWorkoutDef.run({
                    id: workoutDefId,
                    user_id: plan.author === 'Krzysztof Trener' ? 'user2' : (plan.author === 'Aleksandra Fit' ? 'user1' : (allMockUsers[0]?.id || null)),
                    name: day.assignedWorkoutName,
                    type: existingActiveWorkout?.workoutType || "Mieszany",
                    description: `Trening dla dnia ${day.dayName} z planu ${plan.name}`,
                    isPublic: plan.isPublic ? 1: 0,
                });

                // Add exercises to this definition if we have details
                const exercisesForDef = existingActiveWorkout?.exercises || [];
                exercisesForDef.forEach((ex, index) => {
                     const exerciseExists = db.prepare('SELECT id FROM exercises WHERE id = ?').get(ex.id);
                     if (exerciseExists) {
                        insertWorkoutDefEx.run({
                            id: `wdex-${workoutDefId}-${ex.id}-${index}`,
                            workout_definition_id: workoutDefId,
                            exercise_id: ex.id,
                            order_index: index,
                            defaultSets: ex.defaultSets || 3,
                            defaultReps: ex.defaultReps || '10',
                            defaultRestSeconds: ex.defaultRest || 60,
                        });
                     } else {
                        // console.warn(`Skipping exercise ${ex.id} for workout_definition ${workoutDefId} as it does not exist in exercises table.`);
                     }
                });
            }
        });
    });


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
        user_id: planAuthor ? planAuthor.id : null,
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
        workout_definition_id: session.workoutId, // Assuming workoutId can map to a definition
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
              id: `set-${session.id}-${exercise.id}-${set.setNumber}`,
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
    
    // Seed Measurements
    const insertMeasurement = db.prepare(`
      INSERT OR IGNORE INTO measurements (id, user_id, date, weight, bodyPartsJson, notes)
      VALUES (@id, @user_id, @date, @weight, @bodyPartsJson, @notes)
    `);
    for (const m of INITIAL_MOCK_MEASUREMENTS) {
      insertMeasurement.run({
        id: m.id,
        user_id: MOCK_CURRENT_USER_PROFILE.id,
        date: m.date,
        weight: m.weight,
        bodyPartsJson: JSON.stringify(m.bodyParts),
        notes: m.notes
      });
    }

    // Seed Progress Photos
    const insertPhoto = db.prepare(`
      INSERT OR IGNORE INTO progress_photos (id, user_id, imageUrl, date, description, privacy)
      VALUES (@id, @user_id, @imageUrl, @date, @description, @privacy)
    `);
    for (const p of INITIAL_MOCK_PHOTOS) {
      insertPhoto.run({
        id: p.id,
        user_id: MOCK_CURRENT_USER_PROFILE.id,
        imageUrl: p.imageUrl,
        date: p.date,
        description: p.description,
        privacy: 'private' // Default from schema
      });
    }

    // Seed Wellness Entries
    const insertWellness = db.prepare(`
      INSERT OR IGNORE INTO wellness_entries (id, user_id, date, wellBeing, energyLevel, sleepQuality, stressLevel, muscleSoreness, context, notes)
      VALUES (@id, @user_id, @date, @wellBeing, @energyLevel, @sleepQuality, @stressLevel, @muscleSoreness, @context, @notes)
    `);
    for (const w of INITIAL_MOCK_WELLNESS_ENTRIES) {
      insertWellness.run({
        id: w.id,
        user_id: MOCK_CURRENT_USER_PROFILE.id,
        date: w.date,
        wellBeing: w.wellBeing,
        energyLevel: w.energyLevel,
        sleepQuality: w.sleepQuality,
        stressLevel: w.stressLevel,
        muscleSoreness: w.muscleSoreness,
        context: w.context,
        notes: w.notes
      });
    }

    // Seed User Hydration Settings & Logs
    const insertHydrationSettings = db.prepare(`
        INSERT OR IGNORE INTO user_hydration_settings (user_id, dailyGoalMl, customPortionsJson, reminderSettingsJson)
        VALUES (@user_id, @dailyGoalMl, @customPortionsJson, @reminderSettingsJson)
    `);
    insertHydrationSettings.run({
        user_id: MOCK_CURRENT_USER_PROFILE.id,
        dailyGoalMl: 2500, // Default
        customPortionsJson: JSON.stringify(DEFAULT_HYDRATION_PORTIONS),
        reminderSettingsJson: JSON.stringify({ enabled: false, intervalMinutes: 60, startTime: "08:00", endTime: "22:00", playSound: false })
    });
    // Example Hydration Log Entry
    db.prepare(`INSERT OR IGNORE INTO hydration_log_entries (id, user_id, amount, timestamp) VALUES (?, ?, ?, ?)`).run(
        `hlog-${MOCK_CURRENT_USER_PROFILE.id}-1`, MOCK_CURRENT_USER_PROFILE.id, 500, new Date(Date.now() - 1000 * 60 * 60).toISOString()
    );


    // Seed User Goals
    const insertGoal = db.prepare(`
      INSERT OR IGNORE INTO user_goals (id, user_id, goalName, metric, currentValue, targetValue, deadline, notes, status)
      VALUES (@id, @user_id, @goalName, @metric, @currentValue, @targetValue, @deadline, @notes, @status)
    `);
    for (const goal of INITIAL_USER_GOALS_STATS) {
      insertGoal.run({
        id: goal.id,
        user_id: MOCK_CURRENT_USER_PROFILE.id,
        goalName: goal.goalName,
        metric: goal.metric,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        deadline: goal.deadline?.toISOString(),
        notes: goal.notes,
        status: 'active'
      });
    }

    // Seed Personal Bests
    const insertPb = db.prepare(`
      INSERT OR IGNORE INTO personal_bests (id, user_id, exercise_id, exercise_name, recordType, value_weight, value_reps, value_time_seconds, value_distance_km, date, notes)
      VALUES (@id, @user_id, @exercise_id, @exercise_name, @recordType, @value_weight, @value_reps, @value_time_seconds, @value_distance_km, @date, @notes)
    `);
    for (const pb of INITIAL_MOCK_PBS) {
      insertPb.run({
        id: pb.id,
        user_id: MOCK_CURRENT_USER_PROFILE.id,
        exercise_id: pb.exerciseId,
        exercise_name: pb.exerciseName,
        recordType: pb.recordType,
        value_weight: pb.value.weight,
        value_reps: pb.value.reps,
        value_time_seconds: pb.value.timeSeconds,
        value_distance_km: pb.value.distanceKm,
        date: pb.date,
        notes: pb.notes
      });
    }

    // Seed Community Posts
    const insertCommPost = db.prepare(`
      INSERT OR IGNORE INTO community_posts (id, user_id, content, imageUrl, postType, workoutSummaryDetailsJson, timestamp)
      VALUES (@id, @user_id, @content, @imageUrl, @postType, @workoutSummaryDetailsJson, @timestamp)
    `);
    for (const post of ALL_MOCK_POSTS_FEED) {
      insertCommPost.run({
        id: post.id,
        user_id: post.userId,
        content: post.content,
        imageUrl: post.imageUrl,
        postType: post.postType,
        workoutSummaryDetailsJson: post.workoutSummaryDetails ? JSON.stringify(post.workoutSummaryDetails) : null,
        timestamp: post.timestamp
      });
       // Seed Comments for this post
       const insertComment = db.prepare(`INSERT OR IGNORE INTO post_comments (id, post_id, user_id, text, timestamp) VALUES (?, ?, ?, ?, ?)`);
       post.comments.forEach(comment => {
            insertComment.run(comment.id, post.id, comment.userId, comment.text, comment.timestamp);
       });
       // Seed Likes for this post
       if (post.likedByCurrentUser) {
           db.prepare(`INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)`).run(post.id, MOCK_CURRENT_USER_PROFILE.id);
       }
    }

    // Seed Notifications
    const insertNotification = db.prepare(`
      INSERT OR IGNORE INTO notifications (id, recipient_user_id, actor_user_id, type, contentPreview, timestamp, isRead)
      VALUES (@id, @recipient_user_id, @actor_user_id, @type, @contentPreview, @timestamp, @isRead)
    `);
    for (const notif of INITIAL_MOCK_NOTIFICATIONS_FEED) {
      insertNotification.run({
        id: notif.id,
        recipient_user_id: MOCK_CURRENT_USER_PROFILE.id, // Assuming current user receives these
        actor_user_id: notif.user.id,
        type: notif.type,
        contentPreview: notif.postContentPreview,
        timestamp: notif.timestamp,
        isRead: notif.read ? 1 : 0
      });
    }

    // Seed User App Settings
    const insertAppSettings = db.prepare(`
        INSERT OR IGNORE INTO user_app_settings (user_id, theme, language, reminderSettingsJson, progressionModelSettingsJson, quickActionsVisibilityJson)
        VALUES (@user_id, @theme, @language, @reminderSettingsJson, @progressionModelSettingsJson, @quickActionsVisibilityJson)
    `);
     // Ensure MOCK_USER_DATA_EDIT_PROFILE.id exists in users table or use a fallback
    const appSettingsUserId = allMockUsers.find(u => u.id === MOCK_USER_DATA_EDIT_PROFILE.id) ? MOCK_USER_DATA_EDIT_PROFILE.id : MOCK_CURRENT_USER_PROFILE.id;
    insertAppSettings.run({
        user_id: appSettingsUserId,
        theme: 'dark',
        language: 'pl',
        reminderSettingsJson: JSON.stringify({ enableReminders: false }), // Minimal example
        progressionModelSettingsJson: JSON.stringify({ enableProgression: true, selectedModel: 'linear_weight' }), // Minimal example
        quickActionsVisibilityJson: JSON.stringify({ 'workout-start': true, 'plans': true }) // Minimal example
    });


    // Mark seeding as done
    db.prepare(`INSERT OR REPLACE INTO db_meta (key, value) VALUES (?, ?)`).run('seeds_applied', 'true');
    console.log("Database seeded successfully.");
  });

  try {
    transaction();
  } catch (err) {
    console.error("Error during database seeding transaction:", err);
  }
}


export function getDB() {
  if (!dbInstance) {
    dbInstance = initializeDB();
  }
  return dbInstance;
}
