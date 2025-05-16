
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { getDB } from '@/lib/sqlite'; // Corrected import path

type Data = {
  success: boolean;
  message?: string;
  // You might want to return a token or user info here in a real app
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

    const db = getDB();

    try {
      const stmtGetUser = db.prepare('SELECT id, email, password, fullName FROM users WHERE email = ?');
      const user = stmtGetUser.get(email) as { id: number; email: string; password: string; fullName: string } | undefined;

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Passwords match - login successful
        // In a real app, you'd generate a session token (e.g., JWT) here
        // and send it back to the client.
        console.log(`User ${user.email} logged in successfully.`);
        return res.status(200).json({ 
          success: true, 
          message: 'Login successful!' 
          // token: "your_generated_session_token", // Example
          // user: { id: user.id, email: user.email, fullName: user.fullName } // Example
        });
      } else {
        // Passwords don't match
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
