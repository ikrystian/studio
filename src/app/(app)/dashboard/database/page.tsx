"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Scale,
  Trophy,
  Dumbbell,
  Users,
  MessageSquare,
  RefreshCw,
  BarChart3,
} from "lucide-react";

import { MeasurementsList } from "@/components/database/MeasurementsList";
import { PersonalBestsList } from "@/components/database/PersonalBestsList";
import { WorkoutSessionsList } from "@/components/database/WorkoutSessionsList";
import { CommunityPostsList } from "@/components/database/CommunityPostsList";

export default function DatabasePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Baza Danych - Podgląd
          </h1>
          <p className="text-muted-foreground mt-2">
            Przeglądaj dane przechowywane w bazie SQLite aplikacji Jest
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Odśwież dane
        </Button>
      </div>

      {/* Database Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pomiary</p>
                <p className="text-2xl font-bold">-</p>
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
                <p className="text-2xl font-bold">-</p>
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
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Użytkownicy</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="measurements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="measurements" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Pomiary
          </TabsTrigger>
          <TabsTrigger
            value="personal-bests"
            className="flex items-center gap-2"
          >
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
            <Badge variant="outline">SQLite</Badge>
          </div>
          <MeasurementsList key={`measurements-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="personal-bests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Rekordy osobiste z bazy danych
            </h2>
            <Badge variant="outline">SQLite</Badge>
          </div>
          <PersonalBestsList key={`personal-bests-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Historia treningów z bazy danych
            </h2>
            <Badge variant="outline">SQLite</Badge>
          </div>
          <WorkoutSessionsList key={`workouts-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Posty społeczności z bazy danych
            </h2>
            <Badge variant="outline">SQLite</Badge>
          </div>
          <CommunityPostsList key={`community-${refreshKey}`} />
        </TabsContent>
      </Tabs>

      {/* Database Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Informacje o bazie danych
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Typ bazy danych</h4>
              <p className="text-sm text-muted-foreground">
                SQLite (better-sqlite3)
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Lokalizacja</h4>
              <p className="text-sm text-muted-foreground">
                workoutwise.db (katalog główny projektu)
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Status seedowania</h4>
              <Badge variant="outline" className="text-green-600">
                Zaseedowana (v2)
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Dostępne API endpoints</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• /api/measurements</p>
                <p>• /api/personal-bests</p>
                <p>• /api/workout-sessions</p>
                <p>• /api/community/posts</p>
                <p>• /api/exercises</p>
                <p>• /api/history/last-workout</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
