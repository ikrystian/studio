'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Scale, 
  Trophy, 
  Dumbbell, 
  MessageSquare,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';

// Import our database components
import { MeasurementsList } from '@/components/database/MeasurementsList';
import { PersonalBestsList } from '@/components/database/PersonalBestsList';
import { WorkoutSessionsList } from '@/components/database/WorkoutSessionsList';
import { CommunityPostsList } from '@/components/database/CommunityPostsList';

// Example of fetching data directly in a component
interface DatabaseStats {
  measurementsCount: number;
  personalBestsCount: number;
  workoutSessionsCount: number;
  communityPostsCount: number;
}

export default function DataExamplePage() {
  const [stats, setStats] = useState<DatabaseStats>({
    measurementsCount: 0,
    personalBestsCount: 0,
    workoutSessionsCount: 0,
    communityPostsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Example of fetching multiple API endpoints to get stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch data from multiple endpoints
        const [measurementsRes, personalBestsRes, workoutSessionsRes, communityPostsRes] = await Promise.all([
          fetch('/api/measurements'),
          fetch('/api/personal-bests'),
          fetch('/api/workout-sessions?limit=100'),
          fetch('/api/community/posts?limit=100')
        ]);

        const [measurements, personalBests, workoutSessions, communityPosts] = await Promise.all([
          measurementsRes.json(),
          personalBestsRes.json(),
          workoutSessionsRes.json(),
          communityPostsRes.json()
        ]);

        setStats({
          measurementsCount: measurements.success ? measurements.data.length : 0,
          personalBestsCount: personalBests.success ? personalBests.data.length : 0,
          workoutSessionsCount: workoutSessions.success ? workoutSessions.data.length : 0,
          communityPostsCount: communityPosts.success ? communityPosts.data.length : 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Przykład Integracji z Bazą Danych
          </h1>
          <p className="text-muted-foreground mt-2">
            Demonstracja jak wyświetlać dane z bazy SQLite w aplikacji Jest
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Odśwież dane
        </Button>
      </div>

      {/* Real-time Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pomiary</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.measurementsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rekordy</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.personalBestsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Treningi</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.workoutSessionsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Posty</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.communityPostsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Components in Tabs */}
      <Tabs defaultValue="measurements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="measurements" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Pomiary
          </TabsTrigger>
          <TabsTrigger value="personal-bests" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Rekordy
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Treningi
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Społeczność
          </TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pomiary z bazy danych</h2>
            <Badge variant="outline" className="text-blue-600">
              <Activity className="h-3 w-3 mr-1" />
              Na żywo z SQLite
            </Badge>
          </div>
          <MeasurementsList key={`measurements-${refreshKey}`} limit={5} />
        </TabsContent>

        <TabsContent value="personal-bests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Rekordy osobiste z bazy danych</h2>
            <Badge variant="outline" className="text-yellow-600">
              <Activity className="h-3 w-3 mr-1" />
              Na żywo z SQLite
            </Badge>
          </div>
          <PersonalBestsList key={`personal-bests-${refreshKey}`} limit={5} />
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Historia treningów z bazy danych</h2>
            <Badge variant="outline" className="text-green-600">
              <Activity className="h-3 w-3 mr-1" />
              Na żywo z SQLite
            </Badge>
          </div>
          <WorkoutSessionsList key={`workouts-${refreshKey}`} limit={3} />
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Posty społeczności z bazy danych</h2>
            <Badge variant="outline" className="text-purple-600">
              <Activity className="h-3 w-3 mr-1" />
              Na żywo z SQLite
            </Badge>
          </div>
          <CommunityPostsList key={`community-${refreshKey}`} limit={3} />
        </TabsContent>
      </Tabs>

      {/* Integration Examples */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Przykłady integracji z bazą danych
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">API Endpoints</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">/api/measurements</code>
                  <Badge variant="outline">GET, POST</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">/api/personal-bests</code>
                  <Badge variant="outline">GET, POST</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">/api/workout-sessions</code>
                  <Badge variant="outline">GET</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">/api/community/posts</code>
                  <Badge variant="outline">GET, POST</Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Komponenty React</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">MeasurementsList</code>
                  <Badge variant="outline">Pomiary</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">PersonalBestsList</code>
                  <Badge variant="outline">Rekordy</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">WorkoutSessionsList</code>
                  <Badge variant="outline">Treningi</Badge>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">CommunityPostsList</code>
                  <Badge variant="outline">Społeczność</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
