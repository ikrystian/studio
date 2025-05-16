
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Timer as TimerIcon,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  BellRing,
  Loader2, // Added Loader2
} from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RestTimerPageSkeleton } from "@/components/tools/RestTimerPageSkeleton"; // Import skeleton

const MIN_DURATION_SECONDS = 1;
const MAX_DURATION_SECONDS = 3600; // 1 hour
const DEFAULT_TIME_SECONDS = 60;

export default function StandaloneRestTimerPage() {
  const { toast } = useToast();
  const [pageIsLoading, setPageIsLoading] = React.useState(true); // For skeleton
  const [inputMinutes, setInputMinutes] = React.useState(Math.floor(DEFAULT_TIME_SECONDS / 60).toString());
  const [inputSeconds, setInputSeconds] = React.useState((DEFAULT_TIME_SECONDS % 60).toString());
  
  const [totalSetDuration, setTotalSetDuration] = React.useState(DEFAULT_TIME_SECONDS);
  const [currentTimeInSeconds, setCurrentTimeInSeconds] = React.useState(DEFAULT_TIME_SECONDS);
  const [isRunning, setIsRunning] = React.useState(false);
  
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setPageIsLoading(false);
    }, 750); // Adjust delay as needed
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const newTotalSeconds = (parseInt(inputMinutes, 10) || 0) * 60 + (parseInt(inputSeconds, 10) || 0);
    if (newTotalSeconds >= MIN_DURATION_SECONDS && newTotalSeconds <= MAX_DURATION_SECONDS) {
        setTotalSetDuration(newTotalSeconds);
        if (!isRunning) {
            setCurrentTimeInSeconds(newTotalSeconds);
        }
    }
  }, [inputMinutes, inputSeconds, isRunning]);


  React.useEffect(() => {
    if (isRunning && currentTimeInSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTimeInSeconds((prevTime) => prevTime - 1);
      }, 1000);
    } else if (currentTimeInSeconds === 0 && isRunning) {
      setIsRunning(false);
      toast({
        title: "Czas minął!",
        description: "Odpoczynek zakończony.",
        variant: "default",
        duration: 5000,
      });
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentTimeInSeconds, toast]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleSetTime = (minutesStr: string, secondsStr: string) => {
    const minutes = parseInt(minutesStr, 10) || 0;
    const seconds = parseInt(secondsStr, 10) || 0;
    let newTotal = minutes * 60 + seconds;

    if (newTotal < MIN_DURATION_SECONDS) newTotal = MIN_DURATION_SECONDS;
    if (newTotal > MAX_DURATION_SECONDS) newTotal = MAX_DURATION_SECONDS;
    
    setInputMinutes(Math.floor(newTotal / 60).toString());
    setInputSeconds((newTotal % 60).toString());
    setTotalSetDuration(newTotal);
    if (!isRunning) {
      setCurrentTimeInSeconds(newTotal);
    }
  };

  const handlePresetTime = (seconds: number) => {
    setInputMinutes(Math.floor(seconds / 60).toString());
    setInputSeconds((seconds % 60).toString());
    setTotalSetDuration(seconds);
    if (!isRunning) {
      setCurrentTimeInSeconds(seconds);
    }
     setIsRunning(false); 
  };

  const handleStartPause = () => {
    if (currentTimeInSeconds === 0 && totalSetDuration > 0 && !isRunning) {
      setCurrentTimeInSeconds(totalSetDuration); 
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentTimeInSeconds(totalSetDuration);
  };

  const handleAdjustTime = (amount: number) => {
    setCurrentTimeInSeconds((prevTime) => {
      const newTime = prevTime + amount;
      if (newTime < 0) return 0;
      if (newTime > MAX_DURATION_SECONDS) return MAX_DURATION_SECONDS; 
      return newTime;
    });
     if (!isRunning && currentTimeInSeconds + amount > totalSetDuration) {
        setTotalSetDuration(currentTimeInSeconds + amount > MAX_DURATION_SECONDS ? MAX_DURATION_SECONDS : currentTimeInSeconds + amount);
    }
  };
  
  const progressValue = totalSetDuration > 0 ? (currentTimeInSeconds / totalSetDuration) * 100 : 0;

  if (pageIsLoading) {
    return <RestTimerPageSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-md space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Ustaw Czas Odpoczynku</CardTitle>
              <CardDescription>Wybierz predefiniowany czas lub ustaw własny.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor="minutes">Minuty</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min="0"
                    max="60"
                    value={inputMinutes}
                    onChange={(e) => handleSetTime(e.target.value, inputSeconds)}
                    disabled={isRunning}
                    className="text-center text-lg"
                  />
                </div>
                <span className="pb-2 text-2xl font-semibold">:</span>
                <div className="flex-1">
                  <Label htmlFor="seconds">Sekundy</Label>
                  <Input
                    id="seconds"
                    type="number"
                    min="0"
                    max="59"
                    value={inputSeconds}
                    onChange={(e) => handleSetTime(inputMinutes, e.target.value)}
                    disabled={isRunning}
                    className="text-center text-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[30, 60, 90, 120].map((sec) => (
                  <Button
                    key={sec}
                    variant="outline"
                    onClick={() => handlePresetTime(sec)}
                    disabled={isRunning}
                  >
                    {sec}s
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="items-center text-center">
              <CardTitle className="text-6xl font-bold tracking-tighter">
                {formatTime(currentTimeInSeconds)}
              </CardTitle>
              <CardDescription>Pozostały czas odpoczynku</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progressValue} className="h-3 w-full mb-6" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button 
                  onClick={() => handleAdjustTime(-10)} 
                  variant="outline"
                  disabled={currentTimeInSeconds <= 0 && !isRunning}
                >
                  <Minus className="mr-1 h-4 w-4" /> 10s
                </Button>
                <Button 
                  onClick={() => handleAdjustTime(10)} 
                  variant="outline"
                  disabled={currentTimeInSeconds >= MAX_DURATION_SECONDS && !isRunning}
                >
                  <Plus className="mr-1 h-4 w-4" /> 10s
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleStartPause}
                  className="flex-1 text-lg py-6"
                  variant={isRunning ? "secondary" : "default"}
                  disabled={totalSetDuration < MIN_DURATION_SECONDS}
                >
                  {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isRunning ? "Pauza" : (currentTimeInSeconds === 0 || currentTimeInSeconds === totalSetDuration ? "Start" : "Wznów")}
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1 text-lg py-6" disabled={currentTimeInSeconds === totalSetDuration && !isRunning}>
                  <RotateCcw className="mr-2" /> Reset
                </Button>
              </div>
            </CardContent>
             <CardFooter className="justify-center">
                {currentTimeInSeconds === 0 && !isRunning && totalSetDuration > 0 && (
                    <p className="text-green-600 flex items-center gap-1 font-semibold"><BellRing className="h-4 w-4"/>Odpoczynek zakończony!</p>
                )}
             </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
