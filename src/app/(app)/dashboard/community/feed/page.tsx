
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Send, ThumbsUp, UserCircle, Edit3, Image as ImageIcon, MoreHorizontal, Bell, Share, Copy, Loader2 } from "lucide-react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// MOCK BACKEND LOGIC: The entire feed, including users, posts, comments, and notifications,
// is managed using in-memory arrays (MOCK_USERS, ALL_MOCK_POSTS, INITIAL_MOCK_NOTIFICATIONS).
// All operations like creating posts, liking, commenting, and fetching "notifications"
// manipulate these in-memory arrays. Data is not persisted beyond the session.

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
  postType?: 'text_only' | 'image_post' | 'workout_summary'; // For filtering
  workoutSummaryDetails?: { name: string; duration: string; volume: string; }; // For workout_summary type
  likes: number;
  likedByCurrentUser: boolean;
  comments: MockComment[];
  timestamp: string; // ISO string
}

interface MockNotification {
  id: string;
  type: 'like' | 'comment' | 'new_post' | 'follow';
  user: MockUser; // User who initiated the action
  postContentPreview?: string; // For like/comment on a post
  timestamp: string;
  read: boolean; // Added read status
}

// Mock Users
const MOCK_USERS: MockUser[] = [
  { id: "user1", name: "Aleksandra Fit", avatarUrl: "https://placehold.co/100x100.png?text=AF" },
  { id: "user2", name: "Krzysztof Trener", avatarUrl: "https://placehold.co/100x100.png?text=KT" },
  { id: "user3", name: "Fitness Explorer", avatarUrl: "https://placehold.co/100x100.png?text=FE" },
  { id: "currentUser", name: "Jan Kowalski (Ty)", avatarUrl: "https://placehold.co/100x100.png?text=JK" }, // Current user
];

// Mock Posts
const ALL_MOCK_POSTS: MockPost[] = [
  {
    id: uuidv4(),
    userId: "user1",
    content: "Dzisiejszy poranny bieg był niesamowity! Piękne widoki i nowa życiówka na 5km! 🏃‍♀️💨 #bieganie #motywacja",
    imageUrl: "https://placehold.co/600x400.png?text=Morning+Run",
    postType: 'image_post',
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
    content: "Ukończyłem właśnie 'Morderczy Trening Nóg'! Czuję, że żyję! 🔥",
    postType: 'workout_summary',
    workoutSummaryDetails: { name: 'Morderczy Trening Nóg', duration: '1h 15min', volume: '12,500 kg' },
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
    postType: 'text_only',
    likes: 15,
    likedByCurrentUser: false,
    comments: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  // Add more posts for pagination/infinite scroll testing
  {
    id: uuidv4(),
    userId: "user1",
    content: "Dziś rest day, ale jutro wracam do gry! Plan na jutro: trening PUSH.",
    postType: 'text_only',
    likes: 18,
    likedByCurrentUser: false,
    comments: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: uuidv4(),
    userId: "user2",
    content: "Check out this new healthy recipe I tried! So delicious and easy to make. #healthyfood #recipe",
    imageUrl: "https://placehold.co/600x400.png?text=Healthy+Recipe",
    postType: 'image_post',
    likes: 33,
    likedByCurrentUser: true,
    comments: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
   {
    id: uuidv4(),
    userId: "currentUser",
    content: "Właśnie ukończyłem trening 'Siła Całego Ciała'. Jest moc!",
    postType: 'workout_summary',
    workoutSummaryDetails: { name: 'Siła Całego Ciała', duration: '0h 55min', volume: '8,200 kg' },
    likes: 10,
    likedByCurrentUser: false,
    comments: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
];

const POSTS_PER_PAGE = 3;

const INITIAL_MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: uuidv4(), type: 'like', user: MOCK_USERS[0], postContentPreview: "Ukończyłem właśnie 'Morderczy Trening Nóg'...", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), read: false },
  { id: uuidv4(), type: 'comment', user: MOCK_USERS[1], postContentPreview: "Jakie są Wasze ulubione zdrowe przekąski...", timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), read: false },
  { id: uuidv4(), type: 'new_post', user: MOCK_USERS[0], postContentPreview: "Dziś rest day, ale jutro wracam...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true },
  { id: uuidv4(), type: 'follow', user: MOCK_USERS[2], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: false },
];


const CURRENT_USER_ID = "currentUser"; // Simulate logged-in user

export default function CommunityFeedPage() {
  const { toast } = useToast();
  const [pageIsLoading, setPageIsLoading] = React.useState(true);
  const [posts, setPosts] = React.useState<MockPost[]>([]);
  const [newPostContent, setNewPostContent] = React.useState("");
  const [commentInputs, setCommentInputs] = React.useState<Record<string, string>>({});

  const [activeFilter, setActiveFilter] = React.useState<'all' | 'workouts' | 'text_only'>('all');
  const [notifications, setNotifications] = React.useState<MockNotification[]>(INITIAL_MOCK_NOTIFICATIONS);
  
  const unreadNotificationCount = React.useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMorePosts, setHasMorePosts] = React.useState(true);
  
  const observer = React.useRef<IntersectionObserver | null>(null);

  const getFilteredMockPosts = React.useCallback(() => {
    // MOCK BACKEND LOGIC: Filters the global ALL_MOCK_POSTS array based on the active filter.
    return ALL_MOCK_POSTS.filter(post => {
      if (activeFilter === 'workouts') return post.postType === 'workout_summary';
      if (activeFilter === 'text_only') return !post.imageUrl && post.postType !== 'workout_summary';
      return true;
    }).sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
  }, [activeFilter]);

  // MOCK BACKEND LOGIC: Simulates fetching more posts for infinite scroll.
  // Slices the getFilteredMockPosts array based on pagination.
  const loadMorePosts = React.useCallback(async () => {
    if (isLoadingMore || !hasMorePosts) return;

    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 750)); // Simulate network delay

    const filteredAllPosts = getFilteredMockPosts();
    const nextPage = currentPage + 1;
    const offset = (nextPage - 1) * POSTS_PER_PAGE;
    const newPosts = filteredAllPosts.slice(offset, offset + POSTS_PER_PAGE);

    if (newPosts.length > 0) {
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setCurrentPage(nextPage);
    }
    
    if (posts.length + newPosts.length >= filteredAllPosts.length) {
      setHasMorePosts(false);
    }
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMorePosts, currentPage, getFilteredMockPosts, posts]); 

  React.useEffect(() => {
    setPageIsLoading(true);
    const filteredAll = getFilteredMockPosts();
    
    // MOCK BACKEND LOGIC: Simulates initial posts load.
    const timer = setTimeout(() => {
      setPosts(filteredAll.slice(0, POSTS_PER_PAGE));
      setCurrentPage(1); 
      setHasMorePosts(filteredAll.length > POSTS_PER_PAGE);
      setPageIsLoading(false);
    }, 750); 
    return () => clearTimeout(timer);
  }, [getFilteredMockPosts]); 


  const sentinelRef = React.useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMorePosts) {
        loadMorePosts();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMorePosts, loadMorePosts]);


  const getUserById = (userId: string): MockUser | undefined => MOCK_USERS.find(u => u.id === userId);

  // MOCK BACKEND LOGIC: Simulates liking/unliking a post. Updates the in-memory 'posts' state.
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

  // MOCK BACKEND LOGIC: Simulates adding a comment. Updates the in-memory 'posts' state.
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
          ? { ...post, comments: [newComment, ...post.comments] } 
          : post
      )
    );
    setCommentInputs(prev => ({ ...prev, [postId]: "" })); 
    toast({ title: "Komentarz dodany!", variant: "default" });
  };

  // MOCK BACKEND LOGIC: Simulates creating a new post.
  // Adds the new post to the global ALL_MOCK_POSTS array and updates the local 'posts' state.
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
      postType: 'text_only', 
      likes: 0,
      likedByCurrentUser: false,
      comments: [],
      timestamp: new Date().toISOString(),
    };
    
    ALL_MOCK_POSTS.unshift(newPost); // Add to the "master" list

    // Refresh the displayed posts based on the current filter and pagination
    const filteredAll = getFilteredMockPosts();
    setPosts(filteredAll.slice(0, (currentPage * POSTS_PER_PAGE))); 
    setHasMorePosts(filteredAll.length > (currentPage * POSTS_PER_PAGE));

    setNewPostContent("");
    toast({ title: "Post opublikowany!", variant: "default" });
  };

  // MOCK BACKEND LOGIC: Simulates sharing a post.
  const handleShare = (postId: string, option: 'now' | 'comment' | 'copy') => {
    const postToShare = ALL_MOCK_POSTS.find(p => p.id === postId); 
    if (!postToShare) return;

    switch (option) {
      case 'now':
        toast({ title: "Post udostępniony (Symulacja)", description: `Post "${postToShare.content.substring(0, 30)}..." został udostępniony na Twoim profilu.` });
        break;
      case 'comment':
        toast({ title: "Udostępnij z komentarzem (Symulacja)", description: `Przygotowywanie do udostępnienia posta "${postToShare.content.substring(0, 30)}..." z Twoim komentarzem.` });
        break;
      case 'copy':
        navigator.clipboard.writeText(`${window.location.origin}/dashboard/community/feed#post-${postId}`) 
          .then(() => toast({ title: "Link skopiowany!", description: "Link do posta został skopiowany do schowka." }))
          .catch(err => toast({ title: "Błąd kopiowania", description: "Nie udało się skopiować linku.", variant: "destructive" }));
        break;
    }
  };

  // MOCK BACKEND LOGIC: Simulates marking a notification as read and navigating to its source.
  const handleNotificationClick = (notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    toast({ title: "Powiadomienie otwarte (Symulacja)", description: `Przejście do szczegółów powiadomienia ID: ${notificationId.substring(0,8)}...` });
  };


  if (pageIsLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            <p className="mt-4 text-muted-foreground">Ładowanie aktualności...</p>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/community">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Powrót do Społeczności</span>
              </Link>
            </Button>
            <UserCircle className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Aktualności</h1>
          </div>
          <div className="flex items-center gap-3">
            <Select value={activeFilter} onValueChange={(value) => {
              setActiveFilter(value as any);
              // MOCK BACKEND LOGIC: Reset pagination and posts when filter changes
              setCurrentPage(1); // Reset to first page
              setPosts([]); // Clear current posts, useEffect will reload them
              setIsLoadingMore(false); // Stop any ongoing loading
              setHasMorePosts(true); // Assume there are posts for the new filter
            }}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Filtruj feed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie posty</SelectItem>
                <SelectItem value="workouts">Tylko podsumowania treningów</SelectItem>
                <SelectItem value="text_only">Tylko posty tekstowe</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                      {unreadNotificationCount}
                    </span>
                  )}
                  <span className="sr-only">Powiadomienia</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuItem disabled className="font-semibold text-base">Powiadomienia</DropdownMenuItem>
                <DropdownMenuSeparator />
                {notifications.length === 0 && <DropdownMenuItem disabled>Brak nowych powiadomień.</DropdownMenuItem>}
                {notifications.sort((a,b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()).map(n => ( 
                  <DropdownMenuItem 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n.id)} 
                    className={`flex flex-col items-start p-2.5 cursor-pointer ${!n.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}
                    style={!n.read ? { fontWeight: '500' } : {}}
                  >
                    <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={n.user.avatarUrl} alt={n.user.name} data-ai-hint="profile avatar small" />
                            <AvatarFallback>{n.user.name.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-sm">
                            <span className="font-medium">{n.user.name}</span>{' '}
                            {n.type === 'like' ? 'polubił(a) Twój post:' : 
                             n.type === 'comment' ? 'skomentował(a) Twój post:' : 
                             n.type === 'new_post' ? 'dodał(a) nowy post:' :
                             n.type === 'follow' ? 'zaczął/ęła Cię obserwować.' : ''}
                             {n.postContentPreview && <span className="block text-xs text-muted-foreground truncate mt-0.5">{n.postContentPreview}</span>}
                        </div>
                         {!n.read && <span className="h-2 w-2 rounded-full bg-primary ml-auto flex-shrink-0"></span>}
                    </div>
                    <span className="text-xs text-muted-foreground/80 mt-1 self-end">{formatDistanceToNow(parseISO(n.timestamp), { addSuffix: true, locale: pl })}</span>
                  </DropdownMenuItem>
                ))}
                 {notifications.length > 5 && (
                    <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="text-center text-xs">Wyświetlono 5 najnowszych...</DropdownMenuItem>
                    </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
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
          {posts.length === 0 && !isLoadingMore && !pageIsLoading ? ( 
             <p className="text-center text-muted-foreground py-10">
                {activeFilter !== 'all' ? "Brak postów pasujących do filtra." : "Brak postów do wyświetlenia. Bądź pierwszy!"}
             </p>
          ) : (
            posts.map(post => {
              const author = getUserById(post.userId);
              return (
                <Card key={post.id} id={`post-${post.id}`}>
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
                    {post.postType === 'workout_summary' && post.workoutSummaryDetails && (
                      <Card className="mt-3 bg-muted/50">
                        <CardHeader className="pb-2 pt-3">
                          <CardTitle className="text-sm font-semibold">Podsumowanie Treningu</CardTitle>
                          <CardDescription className="text-xs">{post.workoutSummaryDetails.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs space-y-0.5 pb-3">
                          <p>Czas: {post.workoutSummaryDetails.duration}</p>
                          <p>Objętość: {post.workoutSummaryDetails.volume}</p>
                        </CardContent>
                      </Card>
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
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground ml-auto">
                            <Share className="h-4 w-4" /> Udostępnij
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleShare(post.id, 'now')}>Udostępnij teraz (Symulacja)</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(post.id, 'comment')}>Cytuj post (Symulacja)</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(post.id, 'copy')}>Kopiuj link</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                            <div className="flex-1 bg-muted/30 p-2 rounded-md">
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
                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(post.id);}}}
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
          <div ref={sentinelRef} className="h-10" /> {/* Sentinel for IntersectionObserver */}
          {isLoadingMore && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Ładowanie kolejnych postów...</span>
            </div>
          )}
          {!isLoadingMore && !hasMorePosts && posts.length > 0 && (
            <p className="text-center text-muted-foreground py-4">To już wszystkie posty. Nic więcej do pokazania.</p>
          )}
        </div>
      </main>
    </div>
  );
}
