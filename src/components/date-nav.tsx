"use client";

import { useState } from "react";
import { addDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dayKey, dayLabel, fullDayLabel } from "@/lib/meals";

export function DateNav({
  day,
  onChange,
}: {
  day: string;
  onChange: (day: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isToday = day === dayKey();
  const shift = (n: number) => onChange(dayKey(addDays(parseISO(day), n)));

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => shift(-1)}
        aria-label="Previous day"
        className="size-10 rounded-full"
      >
        <ChevronLeft className="size-5" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex flex-col items-center rounded-lg px-3 py-1 transition-colors active:bg-white/5">
          <span className="text-lg font-semibold leading-tight">
            {dayLabel(day)}
          </span>
          <span className="text-xs text-muted-foreground">
            {fullDayLabel(day)}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={parseISO(day)}
            captionLayout="dropdown"
            onSelect={(d) => {
              if (d) {
                onChange(dayKey(d));
                setOpen(false);
              }
            }}
            disabled={(d) => d > new Date()}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => shift(1)}
        disabled={isToday}
        aria-label="Next day"
        className="size-10 rounded-full disabled:opacity-30"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
