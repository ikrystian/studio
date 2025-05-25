import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB } from '@/lib/sqlite';
import type { UserProfile } from '@/lib/mockData'; // Re-use the type definition
import { MOCK_CURRENT_USER_PROFILE } from '@/lib/mockData'; // Temporary: for getting current user ID

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
    const db = getDB();
    // In a real application, the user ID would come from an authenticated session.
    // For now, we'll use the mock current user's ID.
    const userId = MOCK_CURRENT_USER_PROFILE.id; 

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
        followers: userRow.followers || 0, // Default to 0 if null
        following: userRow.following || 0, // Default to 0 if null
        // Mock recent activity and linked social accounts for now, as they are complex nested structures
        // and not directly stored in the main users table in this simplified schema.
        // These would typically be fetched from separate tables or services.
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
