
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Users, Search, ListFilter, BookOpen, UserPlus, Eye, Sparkles, ThumbsUp, X } from "lucide-react"; // Added Sparkles, ThumbsUp, X

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Mock Data Structures
interface DiscoverableUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  fitnessLevel: "Początkujący" | "Średniozaawansowany" | "Zaawansowany";
  bio?: string;
  isFollowed?: boolean; // For simulation
}

interface DiscoverableContent {
  id: string;
  title: string;
  type: "Trening" | "Plan Treningowy";
  category: string; // e.g., "Siłowy", "Cardio", "Budowa masy"
  description: string;
  author?: string; // Optional author name
  imageUrl?: string; // Optional image for the content card
}

// Mock Users
const MOCK_DISCOVERABLE_USERS: DiscoverableUser[] = [
  { id: "user1", name: "Aleksandra Fit", username: "alafit", avatarUrl: "https://placehold.co/100x100.png?text=AF", fitnessLevel: "Zaawansowany", bio: "Entuzjastka crossfitu i zdrowego odżywiania." },
  { id: "user2", name: "Krzysztof Trener", username: "ktrener", avatarUrl: "https://placehold.co/100x100.png?text=KT", fitnessLevel: "Średniozaawansowany", bio: "Certyfikowany trener personalny, specjalista od treningu siłowego." },
  { id: "user3", name: "Fitness Explorer", username: "fitexplorer", avatarUrl: "https://placehold.co/100x100.png?text=FE", fitnessLevel: "Początkujący", bio: "Dopiero zaczynam swoją przygodę z fitnessem!" },
  { id: "user4", name: "Maria Joginka", username: "mariajoga", avatarUrl: "https://placehold.co/100x100.png?text=MJ", fitnessLevel: "Średniozaawansowany", bio: "Miłośniczka jogi i medytacji, szukająca wewnętrznej harmonii." },
  { id: "user5", name: "Piotr Biegacz", username: "piotrekrun", avatarUrl: "https://placehold.co/100x100.png?text=PB", fitnessLevel: "Zaawansowany", bio: "Maratończyk, który nie wyobraża sobie dnia bez biegania." },
  { id: "user6", name: "Anna Kolarz", username: "annabike", avatarUrl: "https://placehold.co/100x100.png?text=AK", fitnessLevel: "Średniozaawansowany", bio: "Weekendowe wyprawy rowerowe to moja pasja." },
  { id: "user7", name: "Tomasz Strongman", username: "tomstrong", avatarUrl: "https://placehold.co/100x100.png?text=TS", fitnessLevel: "Zaawansowany", bio: "Podnoszenie ciężarów to styl życia." },
];

// Mock Workouts & Plans
const MOCK_DISCOVERABLE_CONTENT: DiscoverableContent[] = [
  { id: "wk1", title: "Siła Początkującego Herkulesa", type: "Trening", category: "Siłowy", description: "Podstawowy trening siłowy dla osób zaczynających.", author: "Krzysztof Trener", imageUrl: "https://placehold.co/600x400.png?text=Siła+Początkującego" },
  { id: "plan1", title: "Spalacz Kalorii - Plan HIIT", type: "Plan Treningowy", category: "Redukcja", description: "6-tygodniowy plan interwałowy dla maksymalnego spalania.", author: "Aleksandra Fit", imageUrl: "https://placehold.co/600x400.png?text=Plan+HIIT" },
  { id: "wk2", title: "Domowy Trening Full Body", type: "Trening", category: "Ogólnorozwojowy", description: "Efektywny trening całego ciała bez specjalistycznego sprzętu.", author: "Fitness Explorer", imageUrl: "https://placehold.co/600x400.png?text=Full+Body+Dom" },
  { id: "plan2", title: "Joga dla Spokoju Ducha - Plan 4 Tygodnie", type: "Plan Treningowy", category: "Rozciąganie", description: "Codzienne sesje jogi dla poprawy elastyczności i relaksu.", author: "Maria Joginka", imageUrl: "https://placehold.co/600x400.png?text=Joga+Plan" },
  { id: "wk3", title: "Przygotowanie do Maratonu - Bieg Średniodystansowy", type: "Trening", category: "Cardio", description: "Trening biegowy 10-15km w ramach przygotowań do maratonu.", author: "Piotr Biegacz", imageUrl: "https://placehold.co/600x400.png?text=Bieg+Maraton"},
  { id: "plan3", title: "Budowa Masy Mięśniowej - Split 4-dniowy", type: "Plan Treningowy", category: "Budowa masy", description: "Intensywny plan splitowy dla zaawansowanych, ukierunkowany na hipertrofię.", author: "Tomasz Strongman", imageUrl: "https://placehold.co/600x400.png?text=Budowa+Masy" },
  { id: "wk4", title: "Rowerowa Trasa Widokowa (30km)", type: "Trening", category: "Cardio", description: "Relaksująca, ale wymagająca trasa rowerowa po okolicy.", author: "Anna Kolarz" },
];

const CONTENT_CATEGORIES = ["Wszystkie", "Siłowy", "Cardio", "Redukcja", "Ogólnorozwojowy", "Rozciąganie", "Budowa masy"];
const CONTENT_TYPES = ["Wszystkie", "Trening", "Plan Treningowy"];

// Function to get a few random items from an array
const getRandomItems = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function CommunityDiscoverPage() {
  const { toast } = useToast();
  const [userSearchTerm, setUserSearchTerm] = React.useState("");
  const [contentSearchTerm, setContentSearchTerm] = React.useState("");
  const [selectedContentCategory, setSelectedContentCategory] = React.useState("Wszystkie");
  const [selectedContentType, setSelectedContentType] = React.useState("Wszystkie");
  
  const [followedUsers, setFollowedUsers] = React.useState<Set<string>>(new Set());

  // For "Polecane dla Ciebie" tab
  const [recommendedUsers, setRecommendedUsers] = React.useState<DiscoverableUser[]>([]);
  const [recommendedContent, setRecommendedContent] = React.useState<DiscoverableContent[]>([]);

  React.useEffect(() => {
    // Simulate fetching recommendations on mount
    setRecommendedUsers(getRandomItems(MOCK_DISCOVERABLE_USERS, 3));
    setRecommendedContent(getRandomItems(MOCK_DISCOVERABLE_CONTENT, 3));
  }, []);

  const filteredUsers = React.useMemo(() => {
    return MOCK_DISCOVERABLE_USERS.filter(user =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [userSearchTerm]);

  const filteredContent = React.useMemo(() => {
    return MOCK_DISCOVERABLE_CONTENT.filter(content => {
      const matchesSearch = content.title.toLowerCase().includes(contentSearchTerm.toLowerCase()) ||
                            content.description.toLowerCase().includes(contentSearchTerm.toLowerCase());
      const matchesCategory = selectedContentCategory === "Wszystkie" || content.category === selectedContentCategory;
      const matchesType = selectedContentType === "Wszystkie" || content.type === selectedContentType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [contentSearchTerm, selectedContentCategory, selectedContentType]);

  const handleFollowUser = (userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
        toast({ title: "Przestałeś obserwować użytkownika", variant: "default" });
      } else {
        newSet.add(userId);
        toast({ title: "Zacząłeś obserwować użytkownika", variant: "default" });
      }
      return newSet;
    });
    console.log(`Simulated (un)follow action for user ID: ${userId}`);
  };

  const handleHideRecommendation = (id: string, type: 'user' | 'content') => {
    toast({
      title: "Rekomendacja ukryta (Symulacja)",
      description: `Element ${id} (${type}) został oznaczony jako nieinteresujący.`,
    });
    // In a real app, this would send feedback to the backend
    // For simulation, we can remove it from the current view
    if (type === 'user') {
      setRecommendedUsers(prev => prev.filter(u => u.id !== id));
    } else {
      setRecommendedContent(prev => prev.filter(c => c.id !== id));
    }
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
            <Search className="h-8 w-8 text-primary" /> {/* Changed icon to Search for general Discover */}
            <h1 className="text-2xl font-bold">Odkrywaj</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          <Tabs defaultValue="recommended" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="recommended">
                <Sparkles className="mr-2 h-4 w-4" /> Polecane dla Ciebie
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" /> Użytkownicy
              </TabsTrigger>
              <TabsTrigger value="content">
                <BookOpen className="mr-2 h-4 w-4" /> Treningi i Plany
              </TabsTrigger>
            </TabsList>

            {/* Recommended for You Tab */}
            <TabsContent value="recommended" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Polecane dla Ciebie</CardTitle>
                  <CardDescription>Odkryj użytkowników i treści, które mogą Cię zainteresować.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Recommended Users */}
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Polecani Użytkownicy</h3>
                    {recommendedUsers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendedUsers.map(user => (
                          <Card key={user.id} className="relative group">
                            <CardHeader className="flex flex-row items-center gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile avatar" />
                                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg">{user.name}</CardTitle>
                                <CardDescription>@{user.username} - {user.fitnessLevel}</CardDescription>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground line-clamp-2">{user.bio || "Brak opisu."}</p>
                            </CardContent>
                            <CardFooter className="gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/profile/${user.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> Zobacz Profil
                                </Link>
                              </Button>
                              <Button size="sm" onClick={() => handleFollowUser(user.id)} variant={followedUsers.has(user.id) ? "secondary" : "default"}>
                                <UserPlus className="mr-2 h-4 w-4" /> {followedUsers.has(user.id) ? "Obserwujesz" : "Obserwuj"}
                              </Button>
                            </CardFooter>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleHideRecommendation(user.id, 'user')}
                                title="Ukryj rekomendację"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-6">Brak polecanych użytkowników w tej chwili.</p>
                    )}
                  </div>

                  <Separator />

                  {/* Recommended Content */}
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary"/>Polecane Treningi i Plany</h3>
                    {recommendedContent.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendedContent.map(content => (
                          <Card key={content.id} className="relative group">
                            {content.imageUrl && (
                                <div className="relative h-40 w-full rounded-t-lg overflow-hidden">
                                    <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" data-ai-hint="fitness workout plan" />
                                </div>
                            )}
                            <CardHeader>
                              <CardTitle className="text-lg">{content.title}</CardTitle>
                              <CardDescription>{content.type} - {content.category}</CardDescription>
                              {content.author && <CardDescription className="text-xs">Autor: {content.author}</CardDescription>}
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground line-clamp-3">{content.description}</p>
                            </CardContent>
                            <CardFooter>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={content.type === "Trening" ? `/workout/active/${content.id}` : `/plans/${content.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> Zobacz Szczegóły
                                </Link>
                              </Button>
                            </CardFooter>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleHideRecommendation(content.id, 'content')}
                              title="Ukryj rekomendację"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-6">Brak polecanych treningów lub planów w tej chwili.</p>
                    )}
                  </div>
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" onClick={() => {
                         setRecommendedUsers(getRandomItems(MOCK_DISCOVERABLE_USERS, 3));
                         setRecommendedContent(getRandomItems(MOCK_DISCOVERABLE_CONTENT, 3));
                         toast({title: "Rekomendacje odświeżone!"});
                    }}>Odśwież Rekomendacje (Symulacja)</Button>
                 </CardFooter>
              </Card>
            </TabsContent>


            {/* Discover Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wyszukaj Użytkowników</CardTitle>
                  <CardDescription>Znajdź innych entuzjastów fitnessu.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Szukaj po nazwie lub nazwie użytkownika..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              <ScrollArea className="h-[calc(100vh-25rem)]"> {/* Adjust height as needed */}
                {filteredUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {filteredUsers.map(user => (
                      <Card key={user.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile avatar" />
                            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{user.name}</CardTitle>
                            <CardDescription>@{user.username} - {user.fitnessLevel}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{user.bio || "Brak opisu."}</p>
                        </CardContent>
                        <CardFooter className="gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/profile/${user.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> Zobacz Profil
                            </Link>
                          </Button>
                          <Button size="sm" onClick={() => handleFollowUser(user.id)} variant={followedUsers.has(user.id) ? "secondary" : "default"}>
                            <UserPlus className="mr-2 h-4 w-4" /> {followedUsers.has(user.id) ? "Obserwujesz" : "Obserwuj"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-10">
                    {userSearchTerm ? "Nie znaleziono użytkowników pasujących do kryteriów." : "Brak użytkowników do wyświetlenia. Zacznij wyszukiwać!"}
                  </p>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Discover Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wyszukaj Treningi i Plany</CardTitle>
                  <CardDescription>Znajdź inspiracje dla swoich kolejnych aktywności.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Szukaj po tytule lub opisie..."
                      value={contentSearchTerm}
                      onChange={(e) => setContentSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                      <SelectTrigger className="w-full sm:flex-1">
                        <ListFilter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Typ treści" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedContentCategory} onValueChange={setSelectedContentCategory}>
                      <SelectTrigger className="w-full sm:flex-1">
                        <ListFilter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Kategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <ScrollArea className="h-[calc(100vh-30rem)]"> {/* Adjust height as needed */}
                {filteredContent.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {filteredContent.map(content => (
                      <Card key={content.id}>
                        {content.imageUrl && (
                            <div className="relative h-40 w-full rounded-t-lg overflow-hidden">
                                <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" data-ai-hint="fitness workout plan" />
                            </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-lg">{content.title}</CardTitle>
                          <CardDescription>{content.type} - {content.category}</CardDescription>
                          {content.author && <CardDescription className="text-xs">Autor: {content.author}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{content.description}</p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={content.type === "Trening" ? `/workout/active/${content.id}` : `/plans/${content.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> Zobacz Szczegóły
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-10">
                    {contentSearchTerm || selectedContentCategory !== "Wszystkie" || selectedContentType !== "Wszystkie" 
                      ? "Nie znaleziono treści pasujących do kryteriów." 
                      : "Brak treści do wyświetlenia. Zacznij wyszukiwać lub zmień filtry!"}
                  </p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

    