"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

const ThemeContext = createContext({ isDarkMode: true })

export function useThemeContext() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Listen for theme changes and update our context
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark")
          setIsDarkMode(isDark)
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    // Initial check
    setIsDarkMode(document.documentElement.classList.contains("dark"))

    return () => observer.disconnect()
  }, [])

  return (
    <ThemeContext.Provider value={{ isDarkMode }}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ThemeContext.Provider>
  )
}

