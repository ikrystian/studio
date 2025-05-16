
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Users, Search, ListFilter, BookOpen, UserPlus, Eye, Sparkles, ThumbsUp, X, MapPin, Info, Loader2, Users2 } from "lucide-react";

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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// MOCK BACKEND LOGIC: User profiles (MOCK_USER_PROFILES_DB) and discoverable content (MOCK_DISCOVERABLE_CONTENT)
// are in-memory arrays. Filtering and recommendations are simulated client-side.
// Following a user updates a local state, not a backend.
import { UserProfile, MOCK_USER_PROFILES_DB } from "@/lib/mockData"; // Import centralized data
import { Badge } from "@/components/ui/badge";


const MOCK_REGIONS = ["Wszystkie", "Mazowieckie", "Małopolskie", "Śląskie", "Dolnośląskie", "Wielkopolskie", "Pomorskie", "Łódzkie", "Kujawsko-Pomorskie"];

// Mock Workouts & Plans (kept local as they are specific to discover content)
interface DiscoverableContent {
  id: string;
  title: string;
  type: "Trening" | "Plan Treningowy";
  category: string; // e.g., "Siłowy", "Cardio", "Budowa masy"
  description: string;
  author?: string; // Optional author name
  imageUrl?: string; // Optional image for the content card
}

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
  const [isLoading, setIsLoading] = React.useState(true);
  const [userSearchTerm, setUserSearchTerm] = React.useState("");
  const [contentSearchTerm, setContentSearchTerm] = React.useState("");
  const [selectedContentCategory, setSelectedContentCategory] = React.useState("Wszystkie");
  const [selectedContentType, setSelectedContentType] = React.useState("Wszystkie");
  const [selectedRegion, setSelectedRegion] = React.useState(MOCK_REGIONS[0]);
  const [selectedRegionForTrainers, setSelectedRegionForTrainers] = React.useState(MOCK_REGIONS[0]);
  
  const [followedUsers, setFollowedUsers] = React.useState<Set<string>>(new Set());

  // For "Polecane dla Ciebie" tab
  const [recommendedUsers, setRecommendedUsers] = React.useState<UserProfile[]>([]);
  const [recommendedContent, setRecommendedContent] = React.useState<DiscoverableContent[]>([]);

  React.useEffect(() => {
    setIsLoading(true);
    // MOCK BACKEND LOGIC: Simulate fetching initial recommended users and content.
    const timer = setTimeout(() => {
      setRecommendedUsers(getRandomItems(MOCK_USER_PROFILES_DB, 3));
      setRecommendedContent(getRandomItems(MOCK_DISCOVERABLE_CONTENT, 3));
      setIsLoading(false);
    }, 750); 
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = React.useMemo(() => {
    // MOCK BACKEND LOGIC: Filters users from the in-memory MOCK_USER_PROFILES_DB.
    return MOCK_USER_PROFILES_DB.filter(user =>
      user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [userSearchTerm]);

  const filteredContent = React.useMemo(() => {
    // MOCK BACKEND LOGIC: Filters content from the in-memory MOCK_DISCOVERABLE_CONTENT.
    return MOCK_DISCOVERABLE_CONTENT.filter(content => {
      const matchesSearch = content.title.toLowerCase().includes(contentSearchTerm.toLowerCase()) ||
                            content.description.toLowerCase().includes(contentSearchTerm.toLowerCase());
      const matchesCategory = selectedContentCategory === "Wszystkie" || content.category === selectedContentCategory;
      const matchesType = selectedContentType === "Wszystkie" || content.type === selectedContentType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [contentSearchTerm, selectedContentCategory, selectedContentType]);

  const usersByRegion = React.useMemo(() => {
    // MOCK BACKEND LOGIC: Filters users by region from in-memory MOCK_USER_PROFILES_DB.
    if (selectedRegion === "Wszystkie") {
      return MOCK_USER_PROFILES_DB;
    }
    return MOCK_USER_PROFILES_DB.filter(user => user.region === selectedRegion);
  }, [selectedRegion]);

  const trainersByRegion = React.useMemo(() => {
    // MOCK BACKEND LOGIC: Filters trainers by region from in-memory MOCK_USER_PROFILES_DB.
    return MOCK_USER_PROFILES_DB.filter(user => {
      const isTrainer = user.role === 'trener';
      const matchesRegion = selectedRegionForTrainers === "Wszystkie" || user.region === selectedRegionForTrainers;
      return isTrainer && matchesRegion;
    });
  }, [selectedRegionForTrainers]);

  // MOCK BACKEND LOGIC: Simulates following/unfollowing a user. Updates local state only.
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
  };

  // MOCK BACKEND LOGIC: Simulates hiding a recommendation. Updates local state only.
  const handleHideRecommendation = (id: string, type: 'user' | 'content') => {
    toast({
      title: "Rekomendacja ukryta (Symulacja)",
      description: `Element ${id} (${type}) został oznaczony jako nieinteresujący.`,
    });
    if (type === 'user') {
      setRecommendedUsers(prev => prev.filter(u => u.id !== id));
    } else {
      setRecommendedContent(prev => prev.filter(c => c.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary"/>
          <p className="mt-4 text-muted-foreground">Ładowanie strony odkrywania...</p>
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
            <Search className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Odkrywaj</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Tabs defaultValue="recommended" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 mb-6">
              <TabsTrigger value="recommended">
                <Sparkles className="mr-2 h-4 w-4" /> Polecane
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" /> Użytkownicy
              </TabsTrigger>
              <TabsTrigger value="trainers">
                <Users2 className="mr-2 h-4 w-4" /> Trenerzy
              </TabsTrigger>
              <TabsTrigger value="content">
                <BookOpen className="mr-2 h-4 w-4" /> Treści
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapPin className="mr-2 h-4 w-4" /> Mapa (Sym.)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommended" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Polecane dla Ciebie</CardTitle>
                  <CardDescription>Odkryj użytkowników i treści, które mogą Cię zainteresować.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Polecani Użytkownicy</h3>
                    {recommendedUsers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendedUsers.map(user => (
                          <Card key={user.id} className="relative group">
                            <CardHeader className="flex flex-row items-center gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={user.avatarUrl} alt={user.fullName} data-ai-hint="profile avatar" />
                                <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg">{user.fullName}</CardTitle>
                                <CardDescription>@{user.username} - {user.fitnessLevel}</CardDescription>
                                 {user.role === 'trener' && <Badge variant="default" className="mt-1">Trener</Badge>}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground line-clamp-2">{user.bio || "Brak opisu."}</p>
                            </CardContent>
                            <CardFooter className="gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/profile/${user.id}`}>
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
                                <Link href={content.type === "Trening" ? `/dashboard/workout/active/${content.id}` : `/dashboard/plans/${content.id}`}>
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
                         setRecommendedUsers(getRandomItems(MOCK_USER_PROFILES_DB, 3));
                         setRecommendedContent(getRandomItems(MOCK_DISCOVERABLE_CONTENT, 3));
                         toast({title: "Rekomendacje odświeżone!"});
                    }}>Odśwież Rekomendacje (Symulacja)</Button>
                 </CardFooter>
              </Card>
            </TabsContent>

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
              <ScrollArea className="h-[calc(100vh-30rem)]">
                {filteredUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {filteredUsers.map(user => (
                      <Card key={user.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatarUrl} alt={user.fullName} data-ai-hint="profile avatar" />
                            <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{user.fullName}</CardTitle>
                            <CardDescription>@{user.username} - {user.fitnessLevel}</CardDescription>
                            {user.role === 'trener' && <Badge variant="default" className="mt-1">Trener</Badge>}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{user.bio || "Brak opisu."}</p>
                        </CardContent>
                        <CardFooter className="gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/profile/${user.id}`}>
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

            <TabsContent value="trainers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trenerzy w Twojej Okolicy (Symulacja)</CardTitle>
                  <CardDescription>Znajdź certyfikowanych trenerów i specjalistów fitness.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedRegionForTrainers} onValueChange={setSelectedRegionForTrainers}>
                      <SelectTrigger className="w-full sm:w-[280px]">
                          <MapPin className="mr-2 h-4 w-4"/>
                          <SelectValue placeholder="Wybierz region"/>
                      </SelectTrigger>
                      <SelectContent>
                          {MOCK_REGIONS.map(region => (
                              <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              <ScrollArea className="h-[calc(100vh-30rem)]">
                {trainersByRegion.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {trainersByRegion.map(user => (
                      <Card key={user.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatarUrl} alt={user.fullName} data-ai-hint="profile avatar professional" />
                            <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{user.fullName}</CardTitle>
                            <CardDescription>@{user.username} - {user.fitnessLevel}</CardDescription>
                            <Badge variant="default" className="mt-1">Trener</Badge>
                            {user.region && user.region !== "Wszystkie" && <CardDescription className="text-xs mt-1"><MapPin className="inline h-3 w-3 mr-1"/>{user.region}</CardDescription>}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{user.bio || "Brak opisu."}</p>
                        </CardContent>
                        <CardFooter className="gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/profile/${user.id}`}>
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
                    {selectedRegionForTrainers !== "Wszystkie" ? "Brak trenerów w wybranym regionie." : "Brak trenerów do wyświetlenia."}
                  </p>
                )}
              </ScrollArea>
            </TabsContent>

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
              <ScrollArea>
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
                            <Link href={content.type === "Trening" ? `/dashboard/workout/active/${content.id}` : `/dashboard/plans/${content.id}`}>
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

            <TabsContent value="map" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wyszukaj Użytkowników wg Regionu (Symulacja)</CardTitle>
                  <CardDescription>Znajdź użytkowników w wybranym regionie. To jest symulacja funkcji mapy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <Alert variant="default">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Funkcja Mapy (Symulacja)</AlertTitle>
                        <AlertDescription>
                        Ta sekcja jest symulacją funkcji wyszukiwania użytkowników na mapie. W pełnej wersji aplikacji znajdowałaby się tutaj interaktywna mapa.
                        </AlertDescription>
                    </Alert>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="w-full sm:w-[280px]">
                          <MapPin className="mr-2 h-4 w-4"/>
                          <SelectValue placeholder="Wybierz region"/>
                      </SelectTrigger>
                      <SelectContent>
                          {MOCK_REGIONS.map(region => (
                              <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              <ScrollArea>
                {usersByRegion.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {usersByRegion.map(user => (
                      <Card key={user.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatarUrl} alt={user.fullName} data-ai-hint="profile avatar" />
                            <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{user.fullName}</CardTitle>
                            <CardDescription>@{user.username} - {user.fitnessLevel}</CardDescription>
                            {user.role === 'trener' && <Badge variant="default" className="mt-1">Trener</Badge>}
                            {user.region && <CardDescription className="text-xs"><MapPin className="inline h-3 w-3 mr-1"/>{user.region}</CardDescription>}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{user.bio || "Brak opisu."}</p>
                        </CardContent>
                        <CardFooter className="gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/profile/${user.id}`}>
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
                    {selectedRegion !== "Wszystkie" ? "Brak użytkowników w wybranym regionie." : "Brak użytkowników do wyświetlenia."}
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
