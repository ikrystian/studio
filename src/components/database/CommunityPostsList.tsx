'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare, Heart, MessageCircle, Share } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

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

interface CommunityPostsListProps {
  limit?: number;
  showAddButton?: boolean;
}

export function CommunityPostsList({ limit = 20, showAddButton = true }: CommunityPostsListProps) {
  const [posts, setPosts] = useState<CommunityPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/posts?limit=${limit}&offset=0`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
      } else {
        setError(data.message || 'Błąd podczas pobierania postów');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
      console.error('Error fetching community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPostTypeLabel = (postType: string) => {
    switch (postType.toLowerCase()) {
      case 'workout_summary':
        return 'Podsumowanie treningu';
      case 'personal_best':
        return 'Rekord osobisty';
      case 'progress_photo':
        return 'Zdjęcie postępów';
      case 'general':
        return 'Ogólne';
      default:
        return postType;
    }
  };

  const getPostTypeColor = (postType: string) => {
    switch (postType.toLowerCase()) {
      case 'workout_summary':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'personal_best':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'progress_photo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getUserInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Ładowanie postów społeczności...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={fetchPosts} className="mt-4">
              Spróbuj ponownie
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Posty Społeczności ({posts.length})
        </CardTitle>
        {showAddButton && (
          <Button size="sm">
            Dodaj post
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Brak postów w bazie danych</p>
            {showAddButton && (
              <Button className="mt-4">
                Dodaj pierwszy post
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.user.avatarUrl} alt={post.user.fullName} />
                    <AvatarFallback>{getUserInitials(post.user.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{post.user.fullName}</h4>
                      <span className="text-sm text-muted-foreground">@{post.user.username}</span>
                      <Badge className={getPostTypeColor(post.postType)}>
                        {getPostTypeLabel(post.postType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(post.timestamp), 'dd MMMM yyyy, HH:mm', { locale: pl })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-sm leading-relaxed">{post.content}</p>
                  {post.imageUrl && (
                    <div className="mt-3">
                      <img 
                        src={post.imageUrl} 
                        alt="Post image" 
                        className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                  )}
                  {post.workoutSummaryDetails && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Szczegóły treningu:</p>
                      <pre className="text-xs mt-1 text-muted-foreground">
                        {JSON.stringify(post.workoutSummaryDetails, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
                  <button className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                    post.likedByCurrentUser ? 'text-red-500' : ''
                  }`}>
                    <Heart className={`h-4 w-4 ${post.likedByCurrentUser ? 'fill-current' : ''}`} />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments.length}
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                    <Share className="h-4 w-4" />
                    Udostępnij
                  </button>
                </div>

                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <h5 className="text-sm font-medium">Komentarze ({post.comments.length})</h5>
                    {post.comments.slice(0, 3).map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={comment.user.avatarUrl} alt={comment.user.fullName} />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(comment.user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.user.fullName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(comment.timestamp), 'dd.MM HH:mm', { locale: pl })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    {post.comments.length > 3 && (
                      <button className="text-sm text-blue-500 hover:underline">
                        Zobacz wszystkie komentarze ({post.comments.length})
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
