"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full text-muted-foreground"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {/* Both rendered; CSS picks one by theme to avoid hydration mismatch. */}
      <Sun className="hidden size-5 dark:block" />
      <Moon className="size-5 dark:hidden" />
    </Button>
  );
}
