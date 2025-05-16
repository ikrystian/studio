
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { getDB } from '@/lib/sqlite';

type Data = {
  success: boolean;
  message?: string;
  errors?: { [key: string]: string };
  userData?: any; // Optionally return user data
};

const SALT_ROUNDS = 10;

// Simple in-memory store for registered emails for this mock server instance
// In a real app, this would be solely handled by the database unique constraint.
const registeredEmails = new Set<string>(["existinguser@example.com"]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const {
      fullName,
      email,
      password,
      dateOfBirth, // Expected as ISO string or undefined
      gender,
      weight, // Expected as number or undefined
      height, // Expected as number or undefined
      fitnessLevel,
    } = req.body;

    // Basic validation
    const requiredFields = { fullName, email, password, dateOfBirth, gender, fitnessLevel };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ success: false, message: `Missing required field: ${key}.` });
      }
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.', errors: { password: 'Password must be at least 8 characters.' } });
    }

    const db = getDB();

    try {
      // Check if email already exists in SQLite
      const stmtCheckEmail = db.prepare('SELECT id FROM users WHERE email = ?');
      const existingUserInDb = stmtCheckEmail.get(email);

      if (existingUserInDb || registeredEmails.has(email) || email === "test@example.com") {
        // Add test@example.com to prevent re-registration of the test backdoor user
        if (email === "test@example.com") {
            console.log("Attempt to re-register test@example.com blocked by mock API.");
        }
        return res.status(409).json({ success: false, message: 'Email already registered.', errors: { email: 'This email address is already in use.' } });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const userDataToInsert = {
        fullName,
        email,
        password: hashedPassword, // Store the hashed password
        dateOfBirth, // Store as ISO string
        gender,
        weight: weight === "" || weight === undefined ? null : Number(weight),
        height: height === "" || height === undefined ? null : Number(height),
        fitnessLevel,
        createdAt: new Date().toISOString() // Add createdAt for consistency
      };
      
      console.log('Attempting to insert user data into SQLite:', userDataToInsert);

      const stmtInsertUser = db.prepare(
        'INSERT INTO users (fullName, email, password, dateOfBirth, gender, weight, height, fitnessLevel, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      const info = stmtInsertUser.run(
        userDataToInsert.fullName,
        userDataToInsert.email,
        userDataToInsert.password,
        userDataToInsert.dateOfBirth,
        userDataToInsert.gender,
        userDataToInsert.weight,
        userDataToInsert.height,
        userDataToInsert.fitnessLevel,
        userDataToInsert.createdAt
      );

      console.log(`User ${email} registered with ID: ${info.lastInsertRowid} into SQLite.`);
      registeredEmails.add(email); // Add to in-memory set for this server instance
      console.log(`Simulating: Verification email sent to ${email}`);

      // Return some user data so client can store it
      const registeredUserData = {
        fullName: userDataToInsert.fullName,
        email: userDataToInsert.email,
        fitnessLevel: userDataToInsert.fitnessLevel,
        dateOfBirth: userDataToInsert.dateOfBirth,
        gender: userDataToInsert.gender,
        weight: userDataToInsert.weight,
        height: userDataToInsert.height,
        joinDate: userDataToInsert.createdAt, // Use createdAt as joinDate
        username: userDataToInsert.email.split('@')[0], // Simple username generation
        avatarUrl: `https://placehold.co/100x100.png?text=${userDataToInsert.fullName.substring(0,1).toUpperCase()}${userDataToInsert.fullName.includes(' ') ? userDataToInsert.fullName.split(' ')[1].substring(0,1).toUpperCase() : ''}` // Simple avatar
      };

      return res.status(201).json({ 
        success: true, 
        message: 'Registration successful! Please check your email for verification (simulated).',
        userData: registeredUserData
      });

    } catch (error: any) {
      console.error('Registration API error:', error);
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
         return res.status(409).json({ success: false, message: 'Email already registered.', errors: { email: 'This email address is already in use.' } });
      }
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
