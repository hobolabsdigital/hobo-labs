"use client"

import { useTheme as useThemeBase } from "@wrksz/themes/client"

export type AppTheme = "light" | "dark" | "blueprint" | "cyberpunk" | "brutalist" | "retro" | "system"

export function useTheme() {
  return useThemeBase<AppTheme>()
}
