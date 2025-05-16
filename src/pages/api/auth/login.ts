
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { getDB } from '@/lib/sqlite';

type Data = {
  success: boolean;
  message?: string;
  // token?: string; 
  // user?: { id: number; email: string; fullName: string }; 
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // --- TEMPORARY TEST BACKDOOR ---
    // For easy testing, allow login with test@example.com and password "password"
    // without checking the database.
    // REMOVE THIS IN PRODUCTION or for more thorough database testing.
    if (email === "test@example.com" && password === "password") {
      console.log("Login successful via test backdoor for: test@example.com");
      return res.status(200).json({ 
        success: true, 
        message: 'Login successful (test backdoor)!' 
      });
    }
    // --- END TEMPORARY TEST BACKDOOR ---

    const db = getDB();

    try {
      const stmtGetUser = db.prepare('SELECT id, email, password, fullName FROM users WHERE email = ?');
      const user = stmtGetUser.get(email) as { id: number; email: string; password: string; fullName: string } | undefined;

      if (!user) {
        console.log(`Login attempt failed: User ${email} not found in DB.`);
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        console.log(`User ${user.email} logged in successfully via DB check.`);
        return res.status(200).json({ 
          success: true, 
          message: 'Login successful!' 
        });
      } else {
        console.log(`Login attempt failed: Password mismatch for user ${email}.`);
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
