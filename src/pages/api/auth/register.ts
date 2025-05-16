
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
      dateOfBirth,
      gender,
      weight,
      height,
      fitnessLevel,
    } = req.body;

    // Basic validation
    if (!fullName || !email || !password || !fitnessLevel || !gender || !dateOfBirth) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    if (password.length < 8) {
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

      // Insert new user
      const stmtInsertUser = db.prepare(
        'INSERT INTO users (fullName, email, password, dateOfBirth, gender, weight, height, fitnessLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      const info = stmtInsertUser.run(
        fullName,
        email,
        hashedPassword,
        dateOfBirth, // Assuming this is already an ISO string from client
        gender,
        weight || null, // Store as null if not provided
        height || null, // Store as null if not provided
        fitnessLevel
      );

      console.log(`User registered with ID: ${info.lastInsertRowid}`);
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
