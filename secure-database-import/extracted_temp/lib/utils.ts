import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Color palette for database theming
export const databaseColors = [
  {
    name: "blue",
    background: "bg-blue-100 dark:bg-blue-900",
    border: "border-blue-500 dark:border-blue-600",
    text: "text-blue-900 dark:text-blue-100",
    accent: "bg-blue-600 text-white dark:bg-blue-500",
    hover: "hover:bg-blue-200 dark:hover:bg-blue-800",
    selected: "bg-blue-200 dark:bg-blue-800",
  },
  {
    name: "purple",
    background: "bg-purple-100 dark:bg-purple-900",
    border: "border-purple-500 dark:border-purple-600",
    text: "text-purple-900 dark:text-purple-100",
    accent: "bg-purple-600 text-white dark:bg-purple-500",
    hover: "hover:bg-purple-200 dark:hover:bg-purple-800",
    selected: "bg-purple-200 dark:bg-purple-800",
  },
  {
    name: "green",
    background: "bg-green-100 dark:bg-green-900",
    border: "border-green-500 dark:border-green-600",
    text: "text-green-900 dark:text-green-100",
    accent: "bg-green-600 text-white dark:bg-green-500",
    hover: "hover:bg-green-200 dark:hover:bg-green-800",
    selected: "bg-green-200 dark:bg-green-800",
  },
  {
    name: "red",
    background: "bg-red-100 dark:bg-red-900",
    border: "border-red-500 dark:border-red-600",
    text: "text-red-900 dark:text-red-100",
    accent: "bg-red-600 text-white dark:bg-red-500",
    hover: "hover:bg-red-200 dark:hover:bg-red-800",
    selected: "bg-red-200 dark:bg-red-800",
  },
  {
    name: "cyan",
    background: "bg-cyan-100 dark:bg-cyan-900",
    border: "border-cyan-500 dark:border-cyan-600",
    text: "text-cyan-900 dark:text-cyan-100",
    accent: "bg-cyan-600 text-white dark:bg-cyan-500",
    hover: "hover:bg-cyan-200 dark:hover:bg-cyan-800",
    selected: "bg-cyan-200 dark:bg-cyan-800",
  },
  {
    name: "amber",
    background: "bg-amber-100 dark:bg-amber-900",
    border: "border-amber-500 dark:border-amber-600",
    text: "text-amber-900 dark:text-amber-100",
    accent: "bg-amber-600 text-white dark:bg-amber-500",
    hover: "hover:bg-amber-200 dark:hover:bg-amber-800",
    selected: "bg-amber-200 dark:bg-amber-800",
  },
  {
    name: "pink",
    background: "bg-pink-100 dark:bg-pink-900",
    border: "border-pink-500 dark:border-pink-600",
    text: "text-pink-900 dark:text-pink-100",
    accent: "bg-pink-600 text-white dark:bg-pink-500",
    hover: "hover:bg-pink-200 dark:hover:bg-pink-800",
    selected: "bg-pink-200 dark:bg-pink-800",
  },
  {
    name: "orange",
    background: "bg-orange-100 dark:bg-orange-900",
    border: "border-orange-500 dark:border-orange-600",
    text: "text-orange-900 dark:text-orange-100",
    accent: "bg-orange-600 text-white dark:bg-orange-500",
    hover: "hover:bg-orange-200 dark:hover:bg-orange-800",
    selected: "bg-orange-200 dark:bg-orange-800",
  },
  {
    name: "indigo",
    background: "bg-indigo-100 dark:bg-indigo-900",
    border: "border-indigo-500 dark:border-indigo-600",
    text: "text-indigo-900 dark:text-indigo-100",
    accent: "bg-indigo-600 text-white dark:bg-indigo-500",
    hover: "hover:bg-indigo-200 dark:hover:bg-indigo-800",
    selected: "bg-indigo-200 dark:bg-indigo-800",
  },
  {
    name: "teal",
    background: "bg-teal-100 dark:bg-teal-900",
    border: "border-teal-500 dark:border-teal-600",
    text: "text-teal-900 dark:text-teal-100",
    accent: "bg-teal-600 text-white dark:bg-teal-500",
    hover: "hover:bg-teal-200 dark:hover:bg-teal-800",
    selected: "bg-teal-200 dark:bg-teal-800",
  },
]

// Function to get a color for a database based on its title
export function getDatabaseColor(title: string) {
  // Use a hash function to consistently map database titles to colors
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Get a positive index within the range of our colors array
  const index = Math.abs(hash) % databaseColors.length
  return databaseColors[index]
}

// Function to get a color for a record based on its ID
export function getRecordColor(id: string) {
  // If id is empty or undefined, return the first color as default
  if (!id) {
    return databaseColors[0]
  }

  // Use a hash function to consistently map record IDs to colors
  // We'll use a different algorithm than getDatabaseColor to ensure more variety
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    // Use a different hashing algorithm to ensure more variety
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }

  // Add timestamp to the hash to ensure different colors for copied records
  if (id.includes("-")) {
    // This is likely a duplicated record with our timestamp-based ID
    // Use the timestamp part to influence the color
    const timestamp = id.split("-")[0]
    const timestampNum = Number.parseInt(timestamp, 10)
    if (!isNaN(timestampNum)) {
      hash = hash + timestampNum
    }
  }

  // Get a positive index within the range of our colors array
  const index = Math.abs(hash) % databaseColors.length
  return databaseColors[index]
}

export const getSpeechRecognition = (): any => {
  if (typeof window === "undefined") return null
  return window.SpeechRecognition || window.webkitSpeechRecognition
}

export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition !== undefined)
}

