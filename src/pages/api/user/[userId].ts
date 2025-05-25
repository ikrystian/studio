import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB } from '@/lib/sqlite';
import type { UserProfile } from '@/lib/mockData'; // Re-use the type definition

type UserProfileResponseData = {
  success: boolean;
  message?: string;
  user?: UserProfile;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserProfileResponseData>
) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ success: false, message: 'Brak identyfikatora użytkownika.' });
    }

    const db = getDB();

    try {
      const stmt = db.prepare(`
        SELECT 
          u.id, u.email, u.fullName, u.username, u.avatarUrl, u.bio, u.fitnessLevel, 
          u.joinDate, u.dateOfBirth, u.gender, u.weight, u.height, u.role,
          (SELECT COUNT(*) FROM user_follows WHERE following_user_id = u.id) AS followers,
          (SELECT COUNT(*) FROM user_follows WHERE follower_user_id = u.id) AS following,
          ps.isActivityPublic, ps.isFriendsListPublic, ps.isSharedPlansPublic
        FROM users u
        LEFT JOIN user_privacy_settings ps ON u.id = ps.user_id
        WHERE u.id = ?
      `);
      const userRow: any = stmt.get(userId);

      if (!userRow) {
        return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony.' });
      }

      const userProfile: UserProfile = {
        id: userRow.id,
        fullName: userRow.fullName,
        username: userRow.username,
        email: userRow.email,
        avatarUrl: userRow.avatarUrl,
        bio: userRow.bio,
        fitnessLevel: userRow.fitnessLevel,
        joinDate: userRow.joinDate,
        dateOfBirth: userRow.dateOfBirth,
        gender: userRow.gender,
        weight: userRow.weight,
        height: userRow.height,
        role: userRow.role,
        followers: userRow.followers || 0,
        following: userRow.following || 0,
        recentActivity: [], 
        linkedSocialAccounts: {},
        privacySettings: {
          isActivityPublic: Boolean(userRow.isActivityPublic),
          isFriendsListPublic: Boolean(userRow.isFriendsListPublic),
          isSharedPlansPublic: Boolean(userRow.isSharedPlansPublic),
        }
      };

      return res.status(200).json({ success: true, user: userProfile });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ success: false, message: 'Wystąpił wewnętrzny błąd serwera podczas pobierania profilu użytkownika.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
