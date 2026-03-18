"use client"

import { useState, useEffect, useCallback } from "react"
import type { Database, DbRecord as Record } from "@/types/secure-database"
import { defaultTemplates } from "@/components/secure-database/templates"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

export function useSecureDatabase() {
  const { user } = useAuth()
  const [databases, setDatabases] = useState<Database[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savedReports, setSavedReports] = useState<{ [dbTitle: string]: any[] }>({})

  const fetchData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      // 1. Try to fetch from Supabase
      const { data: dbData, error: dbError } = await supabase
        .from("secure_databases")
        .select("*")
        .order("order_index", { ascending: true })

      if (dbError) {
        if (dbError.code === "42P01") { 
             console.warn("secure_databases table not found in Supabase. Falling back to migration/defaults.")
             // Proceed to migration check below
        } else {
            throw dbError
        }
      }

      // 2. Migration or Initialization if Supabase is empty
      if (!dbData || dbData.length === 0) {
          const stored = typeof window !== 'undefined' ? localStorage.getItem("slh_custom_databases") : null
          let localDbs: Database[] = []
          if (stored) {
              try { localDbs = JSON.parse(stored) } catch(e) { console.error("Parse error:", e)}
          }

          if (localDbs.length > 0) {
              console.log(`Migrating ${localDbs.length} architectures from legacy storage to Cloud...`)
              toast.info(`Architecting Cloud Migration for ${localDbs.length} collections...`)
              
              const migratedDatabases: Database[] = []
              
              for (const [idx, db] of localDbs.entries()) {
                  // Ensure App Dev Journal is top-indexed
                  let orderIndex = idx + 1
                  if (db.title?.toLowerCase().includes("journal")) orderIndex = 0

                  const { data: newDb, error: dbErr } = await supabase
                      .from("secure_databases")
                      .insert({
                          user_id: user.id,
                          title: db.title,
                          fields: db.fields,
                          color: db.color,
                          display_settings: db.displaySettings,
                          todo_settings: db.todoSettings,
                          order_index: orderIndex
                      })
                      .select().single()

                  if (!dbErr && newDb) {
                      // Migrate records for this db
                      if (db.records && db.records.length > 0) {
                          const recordPayloads = db.records.map(r => ({
                              user_id: user.id,
                              database_id: newDb.id,
                              values: r.values,
                              images: r.images || [],
                              is_favorite: r.isFavorite || false,
                              is_archived: r.isArchived || false,
                              created_at: r.created || new Date().toISOString()
                          }))
                          
                          await supabase.from("database_records").insert(recordPayloads)
                      }
                      migratedDatabases.push({ ...newDb, records: db.records || [] })
                  }
              }
              
              setDatabases(migratedDatabases.sort((a,b) => (a.orderIndex || 0) - (b.orderIndex || 0)))
              toast.success("Professional Cloud Migration Complete")
              // Clear localStorage to prevent duplicate migrations
              localStorage.removeItem("slh_custom_databases")
          } else {
              // Initialize with defaults if absolutely nothing exists
              const initialDbs = defaultTemplates.map((db, idx) => ({
                  ...db,
                  user_id: user.id,
                  order_index: idx
              }))
              const { data: insertedData, error: insertError } = await supabase.from("secure_databases").insert(initialDbs).select()
              if (!insertError && insertedData) {
                  setDatabases(insertedData as Database[])
              } else {
                  setDatabases(defaultTemplates)
              }
          }
      } else {
          // 3. Load from Supabase (standard path)
          const { data: recordData, error: recordError } = await supabase
              .from("database_records")
              .select("*")

          if (recordError && recordError.code !== "42P01") throw recordError

          const fullDatabases = dbData.map(db => ({
              ...db,
              records: (recordData || []).filter(r => r.database_id === db.id)
          }))
          
          setDatabases(fullDatabases as Database[])
      }

      // Fetch Reports
      const { data: reportData, error: reportError } = await supabase.from("database_reports").select("*")
      if (!reportError && reportData) {
          const groupedReports: { [key: string]: any[] } = {}
          reportData.forEach(r => {
              if (!groupedReports[r.database_title]) groupedReports[r.database_title] = []
              groupedReports[r.database_title].push(r)
          })
          setSavedReports(groupedReports)
      }

    } catch (error: any) {
      console.error("Critical Secure Engine Fault:", error)
      const errorMsg = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error))
      toast.error(`Engine Synchronization Fault: ${errorMsg}`)
      
      // Safety: Load local as last resort if Supabase fails entirely (missing tables/keys)
      const stored = typeof window !== 'undefined' ? localStorage.getItem("slh_custom_databases") : null
      if (stored) {
          try { setDatabases(JSON.parse(stored)) } catch(e) {}
      } else {
          setDatabases(defaultTemplates)
      }
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateDatabase = async (updatedDb: Database) => {
    if (!user || !updatedDb.id) return
    
    try {
        const { error } = await supabase
            .from("secure_databases")
            .update({
                title: updatedDb.title,
                fields: updatedDb.fields,
                color: updatedDb.color,
                display_settings: updatedDb.displaySettings,
                todo_settings: updatedDb.todoSettings,
                order_index: updatedDb.orderIndex
            })
            .eq("id", updatedDb.id)

        if (error) throw error
        
        setDatabases(current => 
            current.map(db => db.id === updatedDb.id ? updatedDb : db)
        )
        toast.success("Synchronized: " + updatedDb.title)
    } catch (error: any) {
        toast.error("Update failed: " + error.message)
    }
  }

  const handleReorder = async (reorderedDbs: Database[]) => {
      setDatabases(reorderedDbs)
      if (!user) return

      try {
          const updates = reorderedDbs.map((db, idx) => ({
              id: db.id,
              order_index: idx
          }))

          // Supabase upsert/update for order indices
          for (const update of updates) {
              if (update.id) {
                  await supabase
                    .from("secure_databases")
                    .update({ order_index: update.order_index })
                    .eq("id", update.id)
              }
          }
      } catch (error) {
          console.error("Reorder sync failed:", error)
      }
  }

  const addDatabase = async (newDb: Database) => {
    if (!user) return
    
    try {
        const { data, error } = await supabase
            .from("secure_databases")
            .insert({
                user_id: user.id,
                title: newDb.title,
                fields: newDb.fields,
                color: newDb.color,
                order_index: databases.length
            })
            .select()
            .single()

        if (error) throw error
        
        const dbWithId = { ...data, records: [] } as Database
        setDatabases(current => [...current, dbWithId])
        toast.success("Blueprint Initialized in Cloud")
        return dbWithId
    } catch (error: any) {
        toast.error("Initialization failed: " + error.message)
    }
  }

  const addRecord = async (dbId: string, record: Partial<Record>) => {
      if (!user) return
      try {
          const { data, error } = await supabase
            .from("database_records")
            .insert({
                user_id: user.id,
                database_id: dbId,
                values: record.values,
                images: record.images || [],
                is_favorite: record.isFavorite || false,
                is_archived: record.isArchived || false,
            })
            .select()
            .single()

          if (error) throw error
          
          setDatabases(current => current.map(db => {
              if (db.id === dbId) {
                  return { ...db, records: [...db.records, data as Record] }
              }
              return db
          }))
          return data
      } catch (error: any) {
          toast.error("Record injection failed: " + error.message)
      }
  }

  const updateRecord = async (dbId: string, recordId: string, updates: Partial<Record>) => {
      if (!user) return
      try {
          const { error } = await supabase
            .from("database_records")
            .update({
                values: updates.values,
                images: updates.images,
                is_favorite: updates.isFavorite,
                is_archived: updates.isArchived,
                updated_at: new Date().toISOString()
            })
            .eq("id", recordId)

          if (error) throw error
          
          setDatabases(current => current.map(db => {
              if (db.id === dbId) {
                  return {
                      ...db,
                      records: db.records.map(r => r.id === recordId ? { ...r, ...updates } as Record : r)
                  }
              }
              return db
          }))
      } catch (error: any) {
          toast.error("Update failed: " + error.message)
      }
  }

  const duplicateRecord = async (record: Record, dbTitle?: string) => {
    // Logic to insert into Supabase
    const db = databases.find(d => dbTitle ? d.title === dbTitle : d.records.some(r => r.id === record.id))
    if (!db || !db.id) return

    const newRecord: Partial<Record> = {
        values: { ...record.values },
        images: [...(record.images || [])],
        isFavorite: false
    }

    return await addRecord(db.id, newRecord)
  }

  const deleteDatabases = async (databaseIds: string[]) => {
    if (!user) return
    try {
        const { error } = await supabase
            .from("secure_databases")
            .delete()
            .in("id", databaseIds)

        if (error) throw error
        
        setDatabases(current => current.filter(db => !databaseIds.includes(db.id!)))
        toast.success("Architectures Purged from Cloud")
        return true
    } catch (error: any) {
        toast.error("Purge failed: " + error.message)
        return false
    }
  }

  const saveReport = async (dbTitle: string, report: any) => {
    if (!user) return
    try {
        const { error } = await supabase
            .from("database_reports")
            .upsert({
                user_id: user.id,
                database_title: dbTitle,
                ...report
            })

        if (error) throw error
        fetchData() // Refresh
    } catch (error) {
        console.error("Report save failed:", error)
    }
  }

  const getReportsForDatabase = (dbTitle: string) => {
    return savedReports[dbTitle] || []
  }

  const deleteReport = async (dbTitle: string, reportId: string) => {
    try {
        await supabase.from("database_reports").delete().eq("id", reportId)
        fetchData()
    } catch (error) {
        console.error("Report delete failed:", error)
    }
  }

  const synchronizeBlueprints = async () => {
    // Logic to add missing templates to Supabase
    const missingTemplates = defaultTemplates.filter(
        (template) => !databases.some((db) => db.title === template.title)
    )
    
    if (missingTemplates.length === 0) {
        toast.info("All modular blueprints are already synchronized")
        return
    }

    const payload = missingTemplates.map((db, idx) => ({
        ...db,
        user_id: user?.id,
        order_index: databases.length + idx
    }))

    const { data, error } = await supabase.from("secure_databases").insert(payload).select()
    if (!error && data) {
        setDatabases(current => [...current, ...(data as Database[])])
        toast.success(`Synchronized ${data.length} professional blueprints to Cloud`)
    }
  }

  const recoverDatabases = async (databasesToRecover: Database[]) => {
    // Sync logic for recovery
    return true
  }

  const resetToFactory = async () => {
    // Logic to clear and reset to defaults
    const { error } = await supabase.from("secure_databases").delete().eq("user_id", user?.id)
    if (!error) fetchData()
  }

  return {
    databases,
    updateDatabase,
    addDatabase,
    addRecord,
    updateRecord,
    duplicateRecord,
    deleteDatabases,
    recoverDatabases,
    resetToFactory,
    synchronizeBlueprints,
    initialized,
    loading,
    handleReorder,
    saveReport,
    getReportsForDatabase,
    deleteReport,
  }
}
