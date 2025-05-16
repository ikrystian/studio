
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Define the path to the database file
// Adjust this path if you want to store your database file elsewhere
const dbPath = path.join(process.cwd(), 'workoutwise.db');

let dbInstance: Database.Database;

function initializeDB() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new Database(dbPath, { verbose: console.log });

  // Create users table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      dateOfBirth TEXT,
      gender TEXT,
      weight REAL,
      height REAL,
      fitnessLevel TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Users table initialized.");
  return db;
}

export function getDB() {
  if (!dbInstance) {
    dbInstance = initializeDB();
  }
  return dbInstance;
}
