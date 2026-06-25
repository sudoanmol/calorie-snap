"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string; hint?: string };

/** Single-select segmented control built on shadcn ToggleGroup. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  columns?: 1 | 2;
}) {
  return (
    <ToggleGroup
      variant="outline"
      value={[value]}
      onValueChange={(vals: string[]) => {
        const next = vals[0];
        if (next) onChange(next as T);
      }}
      className={cn(
        "grid w-full gap-2",
        columns === 2 ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          className={cn(
            "h-auto w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left",
            o.hint ? "" : "items-center text-center",
          )}
        >
          <span className="text-sm">{o.label}</span>
          {o.hint && (
            <span className="text-xs text-muted-foreground">{o.hint}</span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
