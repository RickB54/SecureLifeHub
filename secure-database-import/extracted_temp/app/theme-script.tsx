"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export function ThemeScript() {
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    // Remove no-transitions class after a short delay to allow theme to apply
    setTimeout(() => {
      document.documentElement.classList.remove("no-transitions")
    }, 100)
  }, [])

  return null
}

