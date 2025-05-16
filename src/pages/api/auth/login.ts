
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { getDB } from '@/lib/sqlite'; // Ensure this path is correct

type Data = {
  success: boolean;
  message?: string;
  // In a real app, you might return a JWT token or user data
  // token?: string; 
  // user?: { id: number; email: string; fullName: string /* other non-sensitive fields */ }; 
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email i hasło są wymagane.' });
    }

    // --- TEMPORARY TEST BACKDOOR ---
    // This allows easy testing with test@example.com / password
    // REMOVE OR SECURE THIS IN A PRODUCTION ENVIRONMENT
    if (email === "test@example.com" && password === "password") {
      console.log("Logowanie udane przez tylne drzwi dla: test@example.com");
      // For the test user, we don't need to return detailed user data here,
      // the client-side will handle creating mock profile data if needed.
      return res.status(200).json({ 
        success: true, 
        message: 'Logowanie udane (tylne drzwi testowe)!' 
      });
    }
    // --- END TEMPORARY TEST BACKDOOR ---

    const db = getDB();

    try {
      const stmtGetUser = db.prepare('SELECT id, email, password, fullName, fitnessLevel, dateOfBirth, gender, weight, height, createdAt AS joinDate FROM users WHERE email = ?');
      const userFromDb = stmtGetUser.get(email) as { 
        id: number; email: string; password: string; fullName: string; fitnessLevel: string; 
        dateOfBirth?: string; gender?: string; weight?: number; height?: number; joinDate?: string;
      } | undefined;

      if (!userFromDb) {
        console.log(`Próba logowania nieudana: Użytkownik ${email} nie znaleziony w DB.`);
        return res.status(401).json({ success: false, message: 'Nieprawidłowe dane logowania.' });
      }

      const passwordMatch = await bcrypt.compare(password, userFromDb.password);

      if (passwordMatch) {
        console.log(`Użytkownik ${userFromDb.email} zalogowany pomyślnie przez DB.`);
        // Prepare user data to send back to client, omitting sensitive info like password hash
        const userDataForClient = {
          id: `db_user_${userFromDb.id}`, // Create a unique ID combining source and DB ID
          fullName: userFromDb.fullName,
          email: userFromDb.email,
          fitnessLevel: userFromDb.fitnessLevel,
          dateOfBirth: userFromDb.dateOfBirth,
          gender: userFromDb.gender,
          weight: userFromDb.weight,
          height: userFromDb.height,
          joinDate: userFromDb.joinDate || new Date().toISOString(), // Fallback for joinDate
          username: userFromDb.email.split('@')[0], // Simple username
           avatarUrl: `https://placehold.co/100x100.png?text=${userFromDb.fullName.substring(0,1).toUpperCase()}${(userFromDb.fullName.includes(' ') ? userFromDb.fullName.split(' ')[1]?.substring(0,1).toUpperCase() : '') || userFromDb.fullName.substring(1,2) || 'U'}`, // Simple avatar
           role: userFromDb.email === "krystian@bpcoders.pl" ? 'admin' : 'client', // Example role assignment
        };

        return res.status(200).json({ 
          success: true, 
          message: 'Logowanie udane!',
          // @ts-ignore - In a real app, ensure this structure matches what client expects for userData.
          userData: userDataForClient 
        });
      } else {
        console.log(`Próba logowania nieudana: Błędne hasło dla użytkownika ${email}.`);
        return res.status(401).json({ success: false, message: 'Nieprawidłowe dane logowania.' });
      }
    } catch (error) {
      console.error('Błąd logowania:', error);
      return res.status(500).json({ success: false, message: 'Wystąpił wewnętrzny błąd serwera.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
