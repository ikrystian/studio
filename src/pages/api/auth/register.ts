
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { getDB } from '@/lib/sqlite'; // Corrected import path

type Data = {
  success: boolean;
  message?: string;
  errors?: { [key: string]: string };
};

const SALT_ROUNDS = 10;

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
    if (!fullName || !email || !password || !fitnessLevel || !gender || !dateOfBirth) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    if (password.length < 8) {
      // This basic check should ideally match the frontend Zod schema more closely
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const db = getDB();

    try {
      // Check if email already exists
      const stmtCheckEmail = db.prepare('SELECT id FROM users WHERE email = ?');
      const existingUser = stmtCheckEmail.get(email);

      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already registered.', errors: { email: 'This email address is already in use.' } });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const dataToInsert = {
        fullName,
        email,
        hashedPassword,
        dateOfBirth,
        gender,
        weight: weight === undefined ? null : weight, // Ensure null if undefined
        height: height === undefined ? null : height, // Ensure null if undefined
        fitnessLevel
      };
      
      console.log('Attempting to insert user data into SQLite:', dataToInsert);


      // Insert new user
      const stmtInsertUser = db.prepare(
        'INSERT INTO users (fullName, email, password, dateOfBirth, gender, weight, height, fitnessLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      const info = stmtInsertUser.run(
        dataToInsert.fullName,
        dataToInsert.email,
        dataToInsert.hashedPassword,
        dataToInsert.dateOfBirth,
        dataToInsert.gender,
        dataToInsert.weight,
        dataToInsert.height,
        dataToInsert.fitnessLevel
      );

      console.log(`User registered with ID: ${info.lastInsertRowid} into SQLite.`);
      // Simulate sending a verification email (in a real app, you'd integrate an email service)
      console.log(`Simulating: Verification email sent to ${email}`);

      return res.status(201).json({ success: true, message: 'Registration successful! Please check your email for verification (simulated).' });

    } catch (error: any) {
      console.error('Registration error:', error);
      // Check for SQLite specific unique constraint error for email
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
