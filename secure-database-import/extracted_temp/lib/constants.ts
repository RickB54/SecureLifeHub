"use client"

export const getCurrentPin = (): string => {
  if (typeof window === "undefined") return "1234"
  return localStorage.getItem("databasePin") || "1234"
}

export const updatePin = (newPin: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("databasePin", newPin)
  }
}

