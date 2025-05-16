
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, ListFilter, Users, TrendingUp, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// MOCK BACKEND LOGIC: User data for rankings (MOCK_RANKING_USERS) is an in-memory array.
// All sorting and filtering for rankings happen client-side based on this array.
// Data is not persisted.

interface RankingUser {
  id: string;
  name: string;
  avatarUrl: string;
  score: number; // Generic score, will be interpreted based on category
  // Specific scores for different categories
  completedWorkouts: number;
  totalVolumeLifted: number; // in kg
  weeklyActivityScore: number; // arbitrary score
}

const MOCK_RANKING_USERS: RankingUser[] = [
  { id: "user1", name: "Aleksandra Mistrzyni", avatarUrl: "https://placehold.co/100x100.png?text=AM", score: 0, completedWorkouts: 150, totalVolumeLifted: 250000, weeklyActivityScore: 950 },
  { id: "user2", name: "Krzysztof Siłacz", avatarUrl: "https://placehold.co/100x100.png?text=KS", score: 0, completedWorkouts: 120, totalVolumeLifted: 300000, weeklyActivityScore: 800 },
  { id: "user3", name: "Fitness Maniak", avatarUrl: "https://placehold.co/100x100.png?text=FM", score: 0, completedWorkouts: 200, totalVolumeLifted: 180000, weeklyActivityScore: 920 },
  { id: "user4", name: "Maria Biegaczka", avatarUrl: "https://placehold.co/100x100.png?text=MB", score: 0, completedWorkouts: 90, totalVolumeLifted: 50000, weeklyActivityScore: 700 },
  { id: "user5", name: "Piotr Wytrwały", avatarUrl: "https://placehold.co/100x100.png?text=PW", score: 0, completedWorkouts: 180, totalVolumeLifted: 220000, weeklyActivityScore: 880 },
  { id: "user6", name: "Jan Niezłomny", avatarUrl: "https://placehold.co/100x100.png?text=JN", score: 0, completedWorkouts: 50, totalVolumeLifted: 100000, weeklyActivityScore: 500 },
  { id: "user7", name: "Ewa Aktywna", avatarUrl: "https://placehold.co/100x100.png?text=EA", score: 0, completedWorkouts: 110, totalVolumeLifted: 150000, weeklyActivityScore: 750 },
  { id: "user8", name: "Tomasz Cel", avatarUrl: "https://placehold.co/100x100.png?text=TC", score: 0, completedWorkouts: 130, totalVolumeLifted: 190000, weeklyActivityScore: 820 },
  { id: "user9", name: "Zofia Zdrowa", avatarUrl: "https://placehold.co/100x100.png?text=ZZ", score: 0, completedWorkouts: 70, totalVolumeLifted: 80000, weeklyActivityScore: 600 },
  { id: "user10", name: "Adam Workout", avatarUrl: "https://placehold.co/100x100.png?text=AW", score: 0, completedWorkouts: 160, totalVolumeLifted: 270000, weeklyActivityScore: 900 },
];

type RankingCategoryKey = "completedWorkouts" | "totalVolumeLifted" | "weeklyActivityScore";

interface RankingCategory {
  value: RankingCategoryKey;
  label: string;
  unit?: string; // e.g., "kg", "pkt"
  icon: React.ElementType;
}

const RANKING_CATEGORIES: RankingCategory[] = [
  { value: "completedWorkouts", label: "Najwięcej Ukończonych Treningów", unit: "treningów", icon: Users },
  { value: "totalVolumeLifted", label: "Największy Podniesiony Ciężar (łącznie)", unit: "kg", icon: TrendingUp },
  { value: "weeklyActivityScore", label: "Najaktywniejsi w Tym Tygodniu", unit: "pkt", icon: Flame },
];

const ITEMS_PER_PAGE = 10; // For future pagination, not fully implemented here

export default function CommunityRankingsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<RankingCategoryKey>(RANKING_CATEGORIES[0].value);

  const rankedUsers = React.useMemo(() => {
    // MOCK BACKEND LOGIC: Sorts users from MOCK_RANKING_USERS based on the selected category.
    return [...MOCK_RANKING_USERS]
      .map(user => ({
        ...user,
        score: user[selectedCategory] || 0, // Assign score based on category
      }))
      .sort((a, b) => b.score - a.score) // Sort descending by score
      .slice(0, ITEMS_PER_PAGE); // Take top N users
  }, [selectedCategory]);

  const currentCategoryDetails = RANKING_CATEGORIES.find(cat => cat.value === selectedCategory);

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
            <Trophy className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold">Rankingi</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListFilter className="h-6 w-6 text-primary" />
                Wybierz Kategorię Rankingu
              </CardTitle>
              <CardDescription>Zobacz, kto prowadzi w różnych dziedzinach.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as RankingCategoryKey)}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  {currentCategoryDetails && <currentCategoryDetails.icon className="mr-2 h-4 w-4" />}
                  <SelectValue placeholder="Wybierz kategorię..." />
                </SelectTrigger>
                <SelectContent>
                  {RANKING_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center">
                        <category.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Ranking: {currentCategoryDetails?.label || "Wybierz kategorię"}
              </CardTitle>
              <CardDescription>
                Top {rankedUsers.length} użytkowników w wybranej kategorii.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rankedUsers.length > 0 ? (
                <ScrollArea className="max-h-[60vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Użytkownik</TableHead>
                        <TableHead className="text-right">Wynik ({currentCategoryDetails?.unit || ''})</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankedUsers.map((user, index) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Badge variant={index < 3 ? "default" : "secondary"} className="text-sm">
                              {index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile avatar" />
                                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <Link href={`/dashboard/profile/${user.id}`} className="font-medium hover:underline">
                                {user.name}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-lg">
                            {user.score.toLocaleString('pl-PL')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Brak danych do wyświetlenia rankingu dla tej kategorii.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

