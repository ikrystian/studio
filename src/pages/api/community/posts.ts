import type { NextApiRequest, NextApiResponse } from 'next';
import { getDB, getCurrentUserId } from '@/lib/sqlite';

interface CommunityPostData {
  id: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  content: string;
  imageUrl?: string;
  postType: string;
  workoutSummaryDetails?: any;
  timestamp: string;
  likes: number;
  comments: Array<{
    id: string;
    user: {
      id: string;
      fullName: string;
      username: string;
      avatarUrl?: string;
    };
    text: string;
    timestamp: string;
  }>;
  likedByCurrentUser: boolean;
}

type ApiResponse = {
  success: boolean;
  data?: CommunityPostData[];
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    const db = getDB();
    const currentUserId = getCurrentUserId();
    const { limit = '20', offset = '0' } = req.query;

    try {
      // Get posts with user information
      const postsQuery = `
        SELECT 
          p.id, p.content, p.imageUrl, p.postType, p.workoutSummaryDetailsJson, p.timestamp,
          u.id as user_id, u.fullName, u.username, u.avatarUrl,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as liked_by_current_user
        FROM community_posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.timestamp DESC
        LIMIT ? OFFSET ?
      `;
      
      const posts = db.prepare(postsQuery).all(currentUserId, parseInt(limit as string), parseInt(offset as string)) as Array<{
        id: string;
        content: string;
        imageUrl: string | null;
        postType: string;
        workoutSummaryDetailsJson: string | null;
        timestamp: string;
        user_id: string;
        fullName: string;
        username: string;
        avatarUrl: string | null;
        likes_count: number;
        liked_by_current_user: number;
      }>;

      // Get comments for each post
      const formattedPosts: CommunityPostData[] = [];
      
      for (const post of posts) {
        const commentsQuery = `
          SELECT 
            c.id, c.text, c.timestamp,
            u.id as user_id, u.fullName, u.username, u.avatarUrl
          FROM post_comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.post_id = ?
          ORDER BY c.timestamp ASC
        `;
        
        const comments = db.prepare(commentsQuery).all(post.id) as Array<{
          id: string;
          text: string;
          timestamp: string;
          user_id: string;
          fullName: string;
          username: string;
          avatarUrl: string | null;
        }>;

        formattedPosts.push({
          id: post.id,
          user: {
            id: post.user_id,
            fullName: post.fullName,
            username: post.username,
            avatarUrl: post.avatarUrl || undefined,
          },
          content: post.content,
          imageUrl: post.imageUrl || undefined,
          postType: post.postType,
          workoutSummaryDetails: post.workoutSummaryDetailsJson ? JSON.parse(post.workoutSummaryDetailsJson) : undefined,
          timestamp: post.timestamp,
          likes: post.likes_count,
          comments: comments.map(comment => ({
            id: comment.id,
            user: {
              id: comment.user_id,
              fullName: comment.fullName,
              username: comment.username,
              avatarUrl: comment.avatarUrl || undefined,
            },
            text: comment.text,
            timestamp: comment.timestamp,
          })),
          likedByCurrentUser: post.liked_by_current_user > 0,
        });
      }

      return res.status(200).json({ success: true, data: formattedPosts });
    } catch (error) {
      console.error('Error fetching community posts:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas pobierania postów społeczności.' 
      });
    }
  } else if (req.method === 'POST') {
    const db = getDB();
    const userId = getCurrentUserId();
    const { content, imageUrl, postType, workoutSummaryDetails } = req.body;

    try {
      const insertQuery = `
        INSERT INTO community_posts (id, user_id, content, imageUrl, postType, workoutSummaryDetailsJson, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const id = `post_${Date.now()}`;
      const workoutSummaryJson = workoutSummaryDetails ? JSON.stringify(workoutSummaryDetails) : null;
      
      db.prepare(insertQuery).run(
        id,
        userId,
        content,
        imageUrl || null,
        postType || 'general',
        workoutSummaryJson,
        new Date().toISOString()
      );

      return res.status(201).json({ success: true, message: 'Post został utworzony.' });
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas tworzenia posta.' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Metoda ${req.method} niedozwolona`);
  }
}
