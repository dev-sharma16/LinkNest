"use client";

import { useEffect } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_COLORS: Record<string, string> = {
  light: "#ffffff",
  dark: "#0a0a0a",
};

/**
 * Light / Dark / System theme switcher. Also keeps the mobile browser
 * `theme-color` meta tag in sync with the active theme.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const color = THEME_COLORS[resolvedTheme ?? "light"] ?? "#ffffff";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", color);
  }, [resolvedTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label="Change theme" />}
      >
        <span className="relative inline-flex">
          <Sun className="size-4 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute inset-0 size-4 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup
          value={theme ?? "system"}
          onValueChange={(value) => setTheme(value)}
        >
          <DropdownMenuRadioItem value="light">
            <Sun />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
