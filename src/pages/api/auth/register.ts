
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '@/lib/sqlite';
import type { UserProfile } from '@/lib/mockData';

type Data = {
  success: boolean;
  message?: string;
  errors?: { [key: string]: string };
  userData?: UserProfile; // Ensure this matches client expectations
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
    const requiredFields: Record<string, any> = { fullName, email, password, dateOfBirth, gender, fitnessLevel };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ success: false, message: `Pole ${key} jest wymagane.` });
      }
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Hasło musi mieć co najmniej 8 znaków.', errors: { password: 'Hasło musi mieć co najmniej 8 znaków.' } });
    }

    const db = getDB();

    try {
      // Check if email already exists in SQLite
      const stmtCheckEmail = db.prepare('SELECT id FROM users WHERE email = ?');
      const existingUserByEmail = stmtCheckEmail.get(email);

      if (existingUserByEmail) {
        return res.status(409).json({ success: false, message: 'Ten adres email jest już zarejestrowany.', errors: { email: 'Ten adres email jest już zarejestrowany.' } });
      }
      
      // Generate a simple username from email prefix
      let username = email.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '');
      const stmtCheckUsername = db.prepare('SELECT id FROM users WHERE username = ?');
      let existingUserByUsername = stmtCheckUsername.get(username);
      let attempts = 0;
      while(existingUserByUsername && attempts < 5) {
        username = `${email.split('@')[0]}${Math.floor(Math.random() * 1000)}`;
        existingUserByUsername = stmtCheckUsername.get(username);
        attempts++;
      }
      if (existingUserByUsername) {
         return res.status(409).json({ success: false, message: 'Nie udało się wygenerować unikalnej nazwy użytkownika. Spróbuj z innym adresem email.', errors: { email: 'Nie udało się wygenerować unikalnej nazwy użytkownika.' } });
      }


      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUserId = uuidv4(); // Generate a unique ID for the new user
      const joinDate = new Date().toISOString();

      const stmtInsertUser = db.prepare(`
        INSERT INTO users (id, email, fullName, username, hashedPassword, dateOfBirth, gender, weight, height, fitnessLevel, joinDate, role, avatarUrl, bio)
        VALUES (@id, @email, @fullName, @username, @hashedPassword, @dateOfBirth, @gender, @weight, @height, @fitnessLevel, @joinDate, @role, @avatarUrl, @bio)
      `);
      
      const avatarUrl = `https://placehold.co/100x100.png?text=${fullName.substring(0,1).toUpperCase()}${fullName.includes(' ') ? fullName.split(' ')[1].substring(0,1).toUpperCase() : ''}`;

      stmtInsertUser.run({
        id: newUserId,
        email,
        fullName,
        username,
        hashedPassword,
        dateOfBirth, // Should be ISO string from client
        gender,
        weight: weight === "" || weight === undefined ? null : Number(weight),
        height: height === "" || height === undefined ? null : Number(height),
        fitnessLevel,
        joinDate,
        role: 'client', // Default role
        avatarUrl: avatarUrl,
        bio: "" // Default empty bio
      });
      
      // Seed privacy settings for the new user
      const stmtInsertPrivacy = db.prepare('INSERT INTO user_privacy_settings (user_id) VALUES (?)');
      stmtInsertPrivacy.run(newUserId);

      // Seed app settings for the new user
      const stmtInsertAppSettings = db.prepare('INSERT INTO user_app_settings (user_id) VALUES (?)');
      stmtInsertAppSettings.run(newUserId);

      // Seed hydration settings for the new user
      const stmtInsertHydrationSettings = db.prepare('INSERT INTO user_hydration_settings (user_id, customPortionsJson, reminderSettingsJson) VALUES (?, ?, ?)');
      stmtInsertHydrationSettings.run(
        newUserId, 
        JSON.stringify([ { id: "default-glass", name: "Szklanka", amount: 250 }, { id: "default-bottle-small", name: "Mała Butelka", amount: 500 } ]), 
        JSON.stringify({ enabled: false, intervalMinutes: 60, startTime: "08:00", endTime: "22:00", playSound: false })
      );


      console.log(`Użytkownik ${email} zarejestrowany z ID: ${newUserId} w lokalnej bazie SQLite.`);

      const registeredUserData: UserProfile = {
        id: newUserId,
        fullName,
        username,
        email,
        avatarUrl,
        bio: "",
        fitnessLevel,
        joinDate,
        followers: 0,
        following: 0,
        recentActivity: [],
        dateOfBirth,
        gender,
        weight: weight === "" || weight === undefined ? undefined : Number(weight),
        height: height === "" || height === undefined ? undefined : Number(height),
        role: 'client',
        privacySettings: {
          isActivityPublic: true,
          isFriendsListPublic: true,
          isSharedPlansPublic: true,
        },
        linkedSocialAccounts: {},
      };

      return res.status(201).json({ 
        success: true, 
        message: 'Rejestracja pomyślna! Możesz się teraz zalogować.',
        userData: registeredUserData
      });

    } catch (error: any) {
      console.error('Błąd rejestracji (SQLite API):', error);
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message?.includes('UNIQUE constraint failed: users.email') || error.message?.includes('UNIQUE constraint failed: users.username')) {
         const field = error.message.includes('users.email') ? 'email' : 'username';
         const message = field === 'email' ? 'Ten adres email jest już zarejestrowany.' : 'Ta nazwa użytkownika jest już zajęta.';
         return res.status(409).json({ success: false, message: message, errors: { [field]: message } });
      }
      return res.status(500).json({ success: false, message: 'Wystąpił wewnętrzny błąd serwera.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
