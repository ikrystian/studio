
"use client"

import * as React from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale" // Polish locale
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, type CalendarProps } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover" // Corrected path
import { Label } from "@/components/ui/label"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date?: Date) => void
  label?: string
  disabled?: CalendarProps["disabled"] // Pass through disabled prop for Calendar
  className?: string
}

export function DatePicker({
  date,
  onDateChange,
  label,
  disabled,
  className,
}: DatePickerProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            // Ensure the button itself is not disabled by the Calendar's disabled prop
            // unless explicitly intended. For now, let Calendar handle date disabling.
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={disabled}
            initialFocus
            locale={pl}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
