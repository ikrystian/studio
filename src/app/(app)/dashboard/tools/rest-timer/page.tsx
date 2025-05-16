
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
  Loader2, 
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
import { RestTimerPageSkeleton } from "@/components/tools/RestTimerPageSkeleton";

const MIN_DURATION_SECONDS = 1;
const MAX_DURATION_SECONDS = 3600; // 1 hour
const DEFAULT_TIME_SECONDS = 60;

export default function StandaloneRestTimerPage() {
  const { toast } = useToast();
  const [pageIsLoading, setPageIsLoading] = React.useState(true);
  const [inputMinutes, setInputMinutes] = React.useState(Math.floor(DEFAULT_TIME_SECONDS / 60).toString());
  const [inputSeconds, setInputSeconds] = React.useState((DEFAULT_TIME_SECONDS % 60).toString());
  
  const [totalSetDuration, setTotalSetDuration] = React.useState(DEFAULT_TIME_SECONDS);
  const [currentTimeInSeconds, setCurrentTimeInSeconds] = React.useState(DEFAULT_TIME_SECONDS);
  const [isRunning, setIsRunning] = React.useState(false);
  
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const prevTotalSetDurationRef = React.useRef<number>(totalSetDuration);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPageIsLoading(false);
    }, 750); 
    return () => clearTimeout(timer);
  }, []);

  // Update ref whenever totalSetDuration changes
  React.useEffect(() => {
    prevTotalSetDurationRef.current = totalSetDuration;
  });

  // Effect to handle input changes from minute/second fields
  React.useEffect(() => {
    const newTotalSeconds = (parseInt(inputMinutes, 10) || 0) * 60 + (parseInt(inputSeconds, 10) || 0);

    if (newTotalSeconds >= MIN_DURATION_SECONDS && newTotalSeconds <= MAX_DURATION_SECONDS) {
        setTotalSetDuration(newTotalSeconds); // Always update the target duration

        if (!isRunning) {
            // Only update currentTimeInSeconds if the timer is NOT running AND
            // it was at a "reset" state (i.e., equal to the PREVIOUS total, or 0)
            if (currentTimeInSeconds === 0 || currentTimeInSeconds === prevTotalSetDurationRef.current) {
                setCurrentTimeInSeconds(newTotalSeconds);
            }
            // If paused mid-way, currentTimeInSeconds remains, and totalSetDuration is updated.
            // Example: Paused at 30s of 60s. Inputs change to 90s.
            // totalSetDuration becomes 90. currentTimeInSeconds STAYS 30.
        }
        // If isRunning is true, changing inputs only changes totalSetDuration.
        // currentTimeInSeconds continues its countdown unaffected by these input changes.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [inputMinutes, inputSeconds, isRunning, currentTimeInSeconds]); // prevTotalSetDurationRef is managed by its own effect

  // Timer countdown effect
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
    // setTotalSetDuration and setCurrentTimeInSeconds will be handled by the useEffect for inputs
  };

  const handlePresetTime = (seconds: number) => {
    setInputMinutes(Math.floor(seconds / 60).toString());
    setInputSeconds((seconds % 60).toString());
    // setTotalSetDuration and setCurrentTimeInSeconds will be handled by the useEffect for inputs
    setIsRunning(false); 
    if (intervalRef.current) clearInterval(intervalRef.current); // Ensure any running interval is stopped
  };

  const handleStartPause = () => {
    if (currentTimeInSeconds === 0 && totalSetDuration > 0 && !isRunning) {
      // This condition is for "Starting" a timer that has reached 0 or is newly set.
      // It ensures currentTimeInSeconds is set to the full duration before starting.
      setCurrentTimeInSeconds(totalSetDuration); 
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentTimeInSeconds(totalSetDuration);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleAdjustTime = (amount: number) => {
    setCurrentTimeInSeconds((prevTime) => {
      let newTime = prevTime + amount;
      if (newTime < 0) newTime = 0;
      if (newTime > MAX_DURATION_SECONDS) newTime = MAX_DURATION_SECONDS; 
      
      // If not running and adjusting time makes it exceed current total, update total
      // This makes "+10s" buttons extend the current timer if it's not running
      if (!isRunning && newTime > totalSetDuration) {
        setTotalSetDuration(newTime);
      } else if (!isRunning && newTime < totalSetDuration && newTime === 0 && amount <0) {
        // If adjusting down to 0, and not running, ensure total is also 0 or matches current time.
        // This case might need refinement if we want totalSetDuration to be sticky.
        // For now, if we are just adjusting current time, totalSetDuration is mainly a reference.
      }
      return newTime;
    });
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
