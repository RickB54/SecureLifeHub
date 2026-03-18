"use client"

import { useState, useEffect } from "react"
import type { Database, DbRecord as Record } from "@/types/secure-database"
import { defaultTemplates } from "@/components/secure-database/templates"
import { toast } from "sonner"

export function useSecureDatabase() {
  const [databases, setDatabases] = useState<Database[]>([])
  const [initialized, setInitialized] = useState(false)
  const [savedReports, setSavedReports] = useState<{ [dbTitle: string]: any[] }>({})

  // Load databases from localStorage on mount
  useEffect(() => {
    const loadDatabases = () => {
      try {
        const stored = localStorage.getItem("slh_custom_databases")
        const storedReports = localStorage.getItem("slh_custom_database_reports")

        if (storedReports) {
          try {
            setSavedReports(JSON.parse(storedReports))
          } catch (e) {
            console.error("Error parsing saved reports:", e)
            setSavedReports({})
          }
        }

        if (!stored) {
          setDatabases(defaultTemplates)
          localStorage.setItem("slh_custom_databases", JSON.stringify(defaultTemplates))
        } else {
          const parsed = JSON.parse(stored)
          if (!Array.isArray(parsed)) {
            setDatabases(defaultTemplates)
            localStorage.setItem("slh_custom_databases", JSON.stringify(defaultTemplates))
            return
          }

          const validDatabases = parsed
            .map((db: any) => {
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
            setDatabases(defaultTemplates)
            localStorage.setItem("slh_custom_databases", JSON.stringify(defaultTemplates))
          } else {
            setDatabases(validDatabases)
            localStorage.setItem("slh_custom_databases", JSON.stringify(validDatabases))
          }
        }
      } catch (error) {
        console.error("Error loading databases:", error)
        setDatabases(defaultTemplates)
        localStorage.setItem("slh_custom_databases", JSON.stringify(defaultTemplates))
      }
      setInitialized(true)
    }

    loadDatabases()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "slh_custom_databases" || e.key === "slh_custom_database_reports") {
        loadDatabases()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const updateDatabase = (updatedDb: Database) => {
    setDatabases((current) => {
      const newDatabases = current.map((db) => (db.title === updatedDb.title ? updatedDb : db))
      localStorage.setItem("slh_custom_databases", JSON.stringify(newDatabases))
      return newDatabases
    })
  }

  const addDatabase = (newDb: Database) => {
    setDatabases((current) => {
      const newDatabases = [...current, newDb]
      localStorage.setItem("slh_custom_databases", JSON.stringify(newDatabases))
      return newDatabases
    })
  }

  const duplicateRecord = (record: Record, dbTitle?: string) => {
    const title = dbTitle || databases.find(d => d.records.some(r => r.id === record.id))?.title
    if (!title) return

    const db = databases.find((d) => d.title === title)
    if (!db) return

    const timestamp = new Date().getTime()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const uniqueId = `${timestamp}-${randomStr}`

    const newRecord: Record = {
      ...record,
      id: uniqueId,
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

  const deleteDatabases = (databaseTitles: string[]) => {
    setDatabases((current) => {
      const filteredDatabases = current.filter((db) => !databaseTitles.includes(db.title))
      localStorage.setItem("slh_custom_databases", JSON.stringify(filteredDatabases))
      return filteredDatabases
    })
    return true
  }

  const recoverDatabases = (databasesToRecover: Database[]) => {
    setDatabases((current) => {
      const newDatabases = [...current, ...databasesToRecover]
      localStorage.setItem("slh_custom_databases", JSON.stringify(newDatabases))
      return newDatabases
    })
    return true
  }

  const saveReport = (dbTitle: string, report: any) => {
    setSavedReports((current) => {
      const newReports = { ...current }
      if (!newReports[dbTitle]) {
        newReports[dbTitle] = []
      }
      const existingIndex = newReports[dbTitle].findIndex((r) => r.id === report.id)
      if (existingIndex >= 0) {
        newReports[dbTitle][existingIndex] = report
      } else {
        newReports[dbTitle].push(report)
      }
      localStorage.setItem("slh_custom_database_reports", JSON.stringify(newReports))
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
        localStorage.setItem("slh_custom_database_reports", JSON.stringify(newReports))
      }
      return newReports
    })
  }

  const resetToFactory = () => {
    setDatabases(defaultTemplates)
    localStorage.setItem("slh_custom_databases", JSON.stringify(defaultTemplates))
    toast.success("Engine blueprints synchronized to factory defaults")
  }

  return {
    databases,
    updateDatabase,
    addDatabase,
    duplicateRecord,
    deleteDatabases,
    recoverDatabases,
    resetToFactory,
    initialized,
    saveReport,
    getReportsForDatabase,
    deleteReport,
  }
}
