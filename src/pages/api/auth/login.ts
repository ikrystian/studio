
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { getDB } from '@/lib/sqlite';
import type { UserProfile } from '@/lib/mockData'; // Assuming this type aligns with what client expects

type LoginResponseData = {
  success: boolean;
  message?: string;
  userData?: UserProfile;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponseData>
) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email i hasło są wymagane.' });
    }

    const db = getDB();

    try {
      const stmtGetUser = db.prepare(`
        SELECT id, email, hashedPassword, fullName, username, avatarUrl, bio, fitnessLevel, joinDate, dateOfBirth, gender, weight, height, role 
        FROM users 
        WHERE email = ?
      `);
      const userFromDb = stmtGetUser.get(email) as {
        id: string; // Should be Firebase UID from registration
        email: string;
        hashedPassword?: string; // Make optional as it might not exist for social-only users if schema changes
        fullName: string;
        username: string;
        avatarUrl?: string;
        bio?: string;
        fitnessLevel: UserProfile['fitnessLevel'];
        joinDate: string;
        dateOfBirth?: string;
        gender?: UserProfile['gender'];
        weight?: number;
        height?: number;
        role?: UserProfile['role'];
      } | undefined;

      if (!userFromDb) {
        console.log(`Próba logowania nieudana: Użytkownik ${email} nie znaleziony w lokalnej DB SQLite.`);
        return res.status(401).json({ success: false, message: 'Nieprawidłowe dane logowania.' });
      }

      // If user has no hashed password, they might have registered via social media.
      // For email/password login, a hashed password is required.
      if (!userFromDb.hashedPassword) {
        console.log(`Próba logowania email/hasło dla ${email}, ale użytkownik nie ma zapisanego hasła (prawdopodobnie konto social).`);
        return res.status(401).json({ success: false, message: 'To konto mogło zostać utworzone za pomocą logowania społecznościowego. Spróbuj zalogować się w ten sposób lub zresetuj hasło, jeśli ta opcja jest dostępna.' });
      }
      
      const passwordMatch = await bcrypt.compare(password, userFromDb.hashedPassword);

      if (passwordMatch) {
        console.log(`Użytkownik ${userFromDb.email} zalogowany pomyślnie przez lokalną DB SQLite.`);
        
        // Construct userData to match client-side expectations (UserProfile type)
        const userData: UserProfile = {
          id: userFromDb.id, // This is the Firebase UID stored during registration
          email: userFromDb.email,
          fullName: userFromDb.fullName,
          username: userFromDb.username,
          avatarUrl: userFromDb.avatarUrl || `https://placehold.co/100x100.png?text=${userFromDb.fullName?.substring(0,1)}${userFromDb.fullName?.split(' ')[1]?.substring(0,1) || ''}`.toUpperCase(),
          bio: userFromDb.bio,
          fitnessLevel: userFromDb.fitnessLevel,
          joinDate: userFromDb.joinDate, // This should be an ISO string
          followers: 0, // Default values, could be fetched from another table if implemented
          following: 0, // Default values
          recentActivity: [], // Default values
          // Optional fields from DB
          dateOfBirth: userFromDb.dateOfBirth,
          gender: userFromDb.gender,
          weight: userFromDb.weight,
          height: userFromDb.height,
          role: userFromDb.role || 'client',
          privacySettings: { // Default privacy settings, could be fetched from user_privacy_settings table
            isActivityPublic: true,
            isFriendsListPublic: true,
            isSharedPlansPublic: true,
          },
          // linkedSocialAccounts will not be populated by this email/password flow
        };

        return res.status(200).json({ 
          success: true, 
          message: 'Logowanie udane!',
          userData: userData
        });
      } else {
        console.log(`Próba logowania nieudana: Błędne hasło dla użytkownika ${email} w lokalnej DB SQLite.`);
        return res.status(401).json({ success: false, message: 'Nieprawidłowe dane logowania.' });
      }
    } catch (error) {
      console.error('Błąd logowania (SQLite):', error);
      return res.status(500).json({ success: false, message: 'Wystąpił wewnętrzny błąd serwera.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
