
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Send, ThumbsUp, UserCircle, Edit3, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data Structures
interface MockUser {
  id: string;
  name: string;
  avatarUrl: string;
}

interface MockComment {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  text: string;
  timestamp: string; // ISO string
}

interface MockPost {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likes: number;
  likedByCurrentUser: boolean;
  comments: MockComment[];
  timestamp: string; // ISO string
}

// Mock Users
const MOCK_USERS: MockUser[] = [
  { id: "user1", name: "Aleksandra Fit", avatarUrl: "https://placehold.co/100x100.png?text=AF" },
  { id: "user2", name: "Krzysztof Trener", avatarUrl: "https://placehold.co/100x100.png?text=KT" },
  { id: "user3", name: "Fitness Explorer", avatarUrl: "https://placehold.co/100x100.png?text=FE" },
  { id: "currentUser", name: "Jan Kowalski (Ty)", avatarUrl: "https://placehold.co/100x100.png?text=JK" }, // Current user
];

// Mock Posts
const INITIAL_MOCK_POSTS: MockPost[] = [
  {
    id: uuidv4(),
    userId: "user1",
    content: "Dzisiejszy poranny bieg był niesamowity! Piękne widoki i nowa życiówka na 5km! 🏃‍♀️💨 #bieganie #motywacja",
    imageUrl: "https://placehold.co/600x400.png?text=Morning+Run",
    likes: 25,
    likedByCurrentUser: false,
    comments: [
      { id: uuidv4(), userId: "user2", userName: MOCK_USERS.find(u=>u.id==="user2")!.name, avatarUrl: MOCK_USERS.find(u=>u.id==="user2")!.avatarUrl, text: "Gratulacje! Świetna forma!", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: uuidv4(),
    userId: "user2",
    content: "Nowy plan treningowy na siłowni właśnie wjechał! Kto jest gotowy na wyzwanie? 💪 #trening #siłownia #nowyplan",
    likes: 42,
    likedByCurrentUser: true,
    comments: [
      { id: uuidv4(), userId: "user1", userName: MOCK_USERS.find(u=>u.id==="user1")!.name, avatarUrl: MOCK_USERS.find(u=>u.id==="user1")!.avatarUrl, text: "Już nie mogę się doczekać!", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
      { id: uuidv4(), userId: "user3", userName: MOCK_USERS.find(u=>u.id==="user3")!.name, avatarUrl: MOCK_USERS.find(u=>u.id==="user3")!.avatarUrl, text: "Wygląda ciekawie!", timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: uuidv4(),
    userId: "user3",
    content: "Jakie są Wasze ulubione zdrowe przekąski po treningu? Szukam inspiracji! 🍎🍌🥜",
    likes: 15,
    likedByCurrentUser: false,
    comments: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

const CURRENT_USER_ID = "currentUser"; // Simulate logged-in user

export default function CommunityFeedPage() {
  const { toast } = useToast();
  const [posts, setPosts] = React.useState<MockPost[]>(INITIAL_MOCK_POSTS);
  const [newPostContent, setNewPostContent] = React.useState("");
  const [commentInputs, setCommentInputs] = React.useState<Record<string, string>>({});

  const getUserById = (userId: string): MockUser | undefined => MOCK_USERS.find(u => u.id === userId);

  const handleLikePost = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: post.likedByCurrentUser ? post.likes - 1 : post.likes + 1,
              likedByCurrentUser: !post.likedByCurrentUser,
            }
          : post
      )
    );
  };

  const handleCommentChange = (postId: string, text: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: text }));
  };

  const handleAddComment = (postId: string) => {
    const commentText = commentInputs[postId];
    if (!commentText || commentText.trim() === "") {
      toast({ title: "Komentarz nie może być pusty", variant: "destructive" });
      return;
    }
    const currentUser = getUserById(CURRENT_USER_ID);
    if (!currentUser) return;

    const newComment: MockComment = {
      id: uuidv4(),
      userId: CURRENT_USER_ID,
      userName: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
    setCommentInputs(prev => ({ ...prev, [postId]: "" })); // Clear input
    toast({ title: "Komentarz dodany!", variant: "default" });
  };

  const handleCreatePost = () => {
    if (newPostContent.trim() === "") {
      toast({ title: "Treść posta nie może być pusta", variant: "destructive" });
      return;
    }
    const currentUser = getUserById(CURRENT_USER_ID);
    if (!currentUser) return;

    const newPost: MockPost = {
      id: uuidv4(),
      userId: CURRENT_USER_ID,
      content: newPostContent,
      likes: 0,
      likedByCurrentUser: false,
      comments: [],
      timestamp: new Date().toISOString(),
    };
    setPosts(prevPosts => [newPost, ...prevPosts]); // Add to the top of the feed
    setNewPostContent("");
    toast({ title: "Post opublikowany!", variant: "default" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/community">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Społeczności</span>
              </Link>
            </Button>
            <UserCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Aktualności</h1>
          </div>
          {/* Można dodać przycisk +Nowy Post tutaj */}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-2xl space-y-6">
          {/* Create Post Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Edit3 className="h-5 w-5 text-primary" />
                Co słychać? Utwórz nowy post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Podziel się swoimi postępami, przemyśleniami lub zadaj pytanie..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
                className="mb-2"
              />
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={() => toast({title: "Funkcja w budowie", description: "Dodawanie zdjęć do postów będzie dostępne wkrótce."})}>
                  <ImageIcon className="mr-2 h-4 w-4" /> Dodaj zdjęcie (placeholder)
                </Button>
                <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>Opublikuj</Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground">Brak postów do wyświetlenia. Bądź pierwszy!</p>
          ) : (
            posts.map(post => {
              const author = getUserById(post.userId);
              return (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={author?.avatarUrl} alt={author?.name} data-ai-hint="profile avatar" />
                            <AvatarFallback>{author?.name.substring(0, 2).toUpperCase() || "UŻ"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base">{author?.name || "Nieznany Użytkownik"}</CardTitle>
                            <CardDescription className="text-xs">
                            {formatDistanceToNow(parseISO(post.timestamp), { addSuffix: true, locale: pl })}
                            </CardDescription>
                        </div>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Więcej opcji</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast({title: "Funkcja w budowie"})}>Zgłoś post</DropdownMenuItem>
                                {post.userId === CURRENT_USER_ID && <DropdownMenuItem onClick={() => toast({title: "Funkcja w budowie"})}>Edytuj post</DropdownMenuItem>}
                                {post.userId === CURRENT_USER_ID && <DropdownMenuItem onClick={() => toast({title: "Funkcja w budowie"})} className="text-destructive focus:text-destructive">Usuń post</DropdownMenuItem>}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap mb-3">{post.content}</p>
                    {post.imageUrl && (
                      <div className="rounded-lg overflow-hidden border max-h-96">
                        <img src={post.imageUrl} alt="Post image" className="w-full h-auto object-cover" data-ai-hint="social media" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-3">
                    <div className="flex items-center gap-4 w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1 ${post.likedByCurrentUser ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <ThumbsUp className="h-4 w-4" /> {post.likes} Polubień
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" /> {post.comments.length} Komentarzy
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground ml-auto" onClick={() => toast({title: "Funkcja w budowie"})}>
                        Udostępnij (placeholder)
                      </Button>
                    </div>
                    <Separator className="my-1" />
                    {/* Comments Section */}
                    {post.comments.length > 0 && (
                      <div className="w-full space-y-2 max-h-48 overflow-y-auto pr-2">
                        {post.comments.slice().sort((a,b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime()).map(comment => (
                          <div key={comment.id} className="flex items-start gap-2 text-sm">
                            <Avatar className="h-6 w-6 mt-1">
                              <AvatarImage src={comment.avatarUrl} alt={comment.userName} data-ai-hint="profile avatar small" />
                              <AvatarFallback>{comment.userName.substring(0,1).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted/50 p-2 rounded-md">
                              <div className="flex items-baseline justify-between">
                                <span className="font-semibold text-xs">{comment.userName}</span>
                                <span className="text-xs text-muted-foreground/70">{formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true, locale: pl })}</span>
                              </div>
                              <p className="text-xs">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 w-full pt-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getUserById(CURRENT_USER_ID)?.avatarUrl} alt={getUserById(CURRENT_USER_ID)?.name} data-ai-hint="profile avatar" />
                        <AvatarFallback>{getUserById(CURRENT_USER_ID)?.name.substring(0,1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <Input
                        placeholder="Napisz komentarz..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => handleCommentChange(post.id, e.target.value)}
                        className="flex-1 h-9 text-sm"
                      />
                      <Button size="sm" onClick={() => handleAddComment(post.id)} disabled={!commentInputs[post.id]?.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
