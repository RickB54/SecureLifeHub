"use client"

import { useState, useEffect } from "react"
import type { Database, Record } from "./types"
import { defaultTemplates } from "./templates"

export function useDatabase() {
  const [databases, setDatabases] = useState<Database[]>([])
  const [initialized, setInitialized] = useState(false)
  // Add a new state for saved reports
  const [savedReports, setSavedReports] = useState<{ [dbTitle: string]: any[] }>({})

  // Load databases from localStorage on mount
  useEffect(() => {
    const loadDatabases = () => {
      try {
        // Force fresh load from localStorage
        const stored = localStorage.getItem("customDatabases")
        console.log("Loading databases from storage:", stored)

        // Also load saved reports
        const storedReports = localStorage.getItem("customDatabaseReports")
        console.log("Loading saved reports from storage:", storedReports)

        if (storedReports) {
          try {
            setSavedReports(JSON.parse(storedReports))
          } catch (e) {
            console.error("Error parsing saved reports:", e)
            setSavedReports({})
          }
        }

        if (!stored) {
          console.log("No stored databases found, setting defaults")
          setDatabases(defaultTemplates)
          localStorage.setItem("customDatabases", JSON.stringify(defaultTemplates))
        } else {
          const parsed = JSON.parse(stored)
          console.log("Parsed databases:", parsed)

          // Validate the parsed data
          if (!Array.isArray(parsed)) {
            console.error("Invalid database format - not an array")
            setDatabases(defaultTemplates)
            localStorage.setItem("customDatabases", JSON.stringify(defaultTemplates))
            return
          }

          // Validate each database object and its records
          const validDatabases = parsed
            .map((db: any) => {
              // Ensure records is an array
              if (!Array.isArray(db.records)) {
                db.records = []
              }
              return {
                ...db,
                records: db.records.filter((record: any) => record && record.id && record.values),
              }
            })
            .filter(
              (db: any) => db && typeof db === "object" && typeof db.title === "string" && Array.isArray(db.fields),
            )

          if (validDatabases.length === 0) {
            console.log("No valid databases found, setting defaults")
            setDatabases(defaultTemplates)
            localStorage.setItem("customDatabases", JSON.stringify(defaultTemplates))
          } else {
            console.log("Setting valid databases:", validDatabases)
            setDatabases(validDatabases)
            // Ensure localStorage is in sync
            localStorage.setItem("customDatabases", JSON.stringify(validDatabases))
          }
        }
      } catch (error) {
        console.error("Error loading databases:", error)
        setDatabases(defaultTemplates)
        localStorage.setItem("customDatabases", JSON.stringify(defaultTemplates))
      }
      setInitialized(true)
    }

    loadDatabases()

    // Add storage event listener to handle changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "customDatabases" || e.key === "customDatabaseReports") {
        loadDatabases()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Debug log whenever databases change
  useEffect(() => {
    if (initialized) {
      console.log("Databases updated:", databases)
      databases.forEach((db) => {
        console.log(`Database ${db.title} has ${db.records.length} records`)
      })
    }
  }, [databases, initialized])

  const updateDatabase = (updatedDb: Database) => {
    console.log("Updating database:", updatedDb)
    setDatabases((current) => {
      const newDatabases = current.map((db) => (db.title === updatedDb.title ? updatedDb : db))
      // Ensure localStorage is immediately updated
      localStorage.setItem("customDatabases", JSON.stringify(newDatabases))
      return newDatabases
    })
  }

  const addDatabase = (newDb: Database) => {
    console.log("Adding new database:", newDb)
    setDatabases((current) => {
      const newDatabases = [...current, newDb]
      // Ensure localStorage is immediately updated
      localStorage.setItem("customDatabases", JSON.stringify(newDatabases))
      return newDatabases
    })
  }

  const duplicateRecord = (dbTitle: string, record: Record) => {
    const db = databases.find((d) => d.title === dbTitle)
    if (!db) {
      console.error("Database not found:", dbTitle)
      return
    }

    // Generate a truly unique ID for the new record to ensure different color
    const timestamp = new Date().getTime()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const uniqueId = `${timestamp}-${randomStr}`

    const newRecord: Record = {
      ...record,
      id: uniqueId, // Use our custom unique ID instead of uuidv4()
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      values: { ...record.values },
    }

    const updatedDb = {
      ...db,
      records: [...db.records, newRecord],
    }

    updateDatabase(updatedDb)
    return newRecord
  }

  // Add a new function to delete databases
  const deleteDatabases = (databaseTitles: string[]) => {
    console.log("Deleting databases:", databaseTitles)

    setDatabases((current) => {
      const filteredDatabases = current.filter((db) => !databaseTitles.includes(db.title))

      // Update localStorage immediately
      localStorage.setItem("customDatabases", JSON.stringify(filteredDatabases))

      return filteredDatabases
    })

    return true
  }

  // Add a new function to recover original databases
  const recoverDatabases = (databasesToRecover: Database[]) => {
    console.log(
      "Recovering databases:",
      databasesToRecover.map((db) => db.title),
    )

    setDatabases((current) => {
      // Combine current databases with the ones to recover
      const newDatabases = [...current, ...databasesToRecover]

      // Update localStorage immediately
      localStorage.setItem("customDatabases", JSON.stringify(newDatabases))

      return newDatabases
    })

    return true
  }

  // Add functions to save and load reports
  const saveReport = (dbTitle: string, report: any) => {
    setSavedReports((current) => {
      const newReports = { ...current }
      if (!newReports[dbTitle]) {
        newReports[dbTitle] = []
      }
      // Check if report with same ID exists
      const existingIndex = newReports[dbTitle].findIndex((r) => r.id === report.id)
      if (existingIndex >= 0) {
        newReports[dbTitle][existingIndex] = report
      } else {
        newReports[dbTitle].push(report)
      }

      // Save to localStorage
      localStorage.setItem("customDatabaseReports", JSON.stringify(newReports))
      return newReports
    })
  }

  const getReportsForDatabase = (dbTitle: string) => {
    return savedReports[dbTitle] || []
  }

  const deleteReport = (dbTitle: string, reportId: string) => {
    setSavedReports((current) => {
      const newReports = { ...current }
      if (newReports[dbTitle]) {
        newReports[dbTitle] = newReports[dbTitle].filter((r) => r.id !== reportId)
        // Save to localStorage
        localStorage.setItem("customDatabaseReports", JSON.stringify(newReports))
      }
      return newReports
    })
  }

  return {
    databases,
    updateDatabase,
    addDatabase,
    duplicateRecord,
    deleteDatabases,
    recoverDatabases,
    initialized,
    saveReport,
    getReportsForDatabase,
    deleteReport,
  }
}

