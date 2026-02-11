"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner" // Assuming sonner is installed as per package.json

export interface VaultItem {
    id: string
    user_id: string
    type: "password" | "contact" | "card" | "note"
    title: string
    username?: string
    password?: string
    website?: string
    category?: string
    notes?: string
    folder_id?: string
    is_favorite: boolean
    is_archived: boolean
    created_at: string
    updated_at: string
    // Legacy fields for compatibility during migration
    path?: string
    folder?: string
    name?: string
    strength?: string
    item_metadata?: any
}

export interface Folder {
    id: string
    user_id: string
    name: string
    parent_id?: string
    created_at: string
    updated_at: string
    type: "folder" // For compatibility
    path: string // For compatibility
}

export function useVault() {
    const { user } = useAuth()
    const [items, setItems] = useState<VaultItem[]>([])
    const [folders, setFolders] = useState<Folder[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        if (!user) return

        setLoading(true)
        try {
            // Fetch Folders
            const { data: folderData, error: folderError } = await supabase
                .from("folders")
                .select("*")
                .order("name")

            if (folderError) throw folderError

            // Fetch Items
            const { data: itemData, error: itemError } = await supabase
                .from("vault_items")
                .select("*")
                .order("created_at", { ascending: false })

            if (itemError) throw itemError

            // Map to ensure compatibility with existing components if needed
            const mappedFolders = (folderData || []).map(f => ({
                ...f,
                type: "folder" as const,
                path: f.name // Simplification for now
            }))

            // Map items
            const mappedItems = (itemData || []).map(i => ({
                ...i,
                // Map DB fields to UI fields if different
                updatedAt: i.updated_at,
                createdAt: i.created_at,
            }))

            setFolders(mappedFolders)
            setItems(mappedItems as any) // Type assertion for transition
        } catch (error: any) {
            console.error("Error fetching vault:", error)
            // Log more details if it's a supabase error
            if (error?.message) console.error("Error Message:", error.message)
            if (error?.details) console.error("Error Details:", error.details)
            toast.error("Failed to load vault items")
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // CRUD Operations
    const addFolder = async (name: string, category?: string, parentId?: string) => {
        if (!user) return
        const cleanParentId = parentId && parentId !== "" ? parentId : null
        console.log(`📂 Adding folder: "${name}" (Category: ${category || "None"}, Parent: ${cleanParentId || "Root"})`)

        try {
            const { data, error } = await supabase
                .from("folders")
                .insert({
                    user_id: user.id,
                    name,
                    category, // Attempt to insert category
                    parent_id: cleanParentId
                })
                .select()
                .single()

            if (error) {
                console.error("Supabase Folder Error:", error)
                throw error
            }

            const newFolder = { ...data, type: "folder", category: data.category, path: data.name }
            setFolders(prev => [...prev, newFolder as any])
            toast.success("Folder created")
            await fetchData() // Refresh to get correct paths/order
            return newFolder
        } catch (error: any) {
            console.error("Error adding folder:", error)
            // If category column doesn't exist, retry without it
            if (error.code === '42703') { 
                console.warn("Category column missing in folders table. Retrying without it.")
                return addFolderSimple(name, parentId)
            }
            toast.error(error.message || "Failed to create folder")
            return null
        }
    }

    const addFolderSimple = async (name: string, parentId?: string) => {
        if (!user) return
        const cleanParentId = parentId && parentId !== "" ? parentId : null
        const { data, error } = await supabase
            .from("folders")
            .insert({ user_id: user.id, name, parent_id: cleanParentId })
            .select().single()
        if (error) throw error
        const newFolder = { ...data, type: "folder", path: data.name }
        setFolders(prev => [...prev, newFolder as any])
        await fetchData()
        return newFolder
    }

    const addItem = async (item: Partial<VaultItem> & { item_metadata?: any }, options?: { skipRefresh?: boolean }) => {
        if (!user) return
        try {
            // Prepare payload (remove UI specific fields if any)
            const payload = {
                user_id: user.id,
                type: item.type || 'password',
                title: item.title || item.website || 'Untitled',
                username: item.username || null,
                password: item.password || null,
                website: item.website || null,
                category: item.category || null,
                folder_id: item.folder_id || null, // Explicitly null if not provided
                is_favorite: item.is_favorite || false,
                is_archived: item.is_archived || false,
                notes: item.notes || null,
                item_metadata: item.item_metadata || {} // Add metadata support
            }

            console.log("=== VAULT ADD PAYLOAD ===")
            console.log(JSON.stringify(payload, null, 2))
            console.log("=== END PAYLOAD ===")

            const { data, error } = await supabase
                .from("vault_items")
                .insert(payload)
                .select()
                .single()

            if (error) {
                console.error("=== SUPABASE INSERT ERROR ===")
                console.error("Error object:", error)
                console.error("Error message:", error.message)
                console.error("Error code:", error.code)
                console.error("Error details:", error.details)
                console.error("Error hint:", error.hint)
                console.error("=== END SUPABASE ERROR ===")
                throw error
            }

            console.log("=== SUPABASE INSERT SUCCESS ===")
            console.log("Inserted data:", data)
            console.log("=== END SUCCESS ===")

            const newItem = { ...data, updatedAt: data.updated_at }
            setItems(prev => {
                const updated = [newItem as any, ...prev]
                console.log("🔄 Items state updated, new count:", updated.length)
                console.log("🔍 Sample item:", updated[0])
                return updated
            })

            toast.success("Item added")
            if (!options?.skipRefresh) await fetchData() // Force sync
            return newItem
        } catch (error: any) {
            console.error("=== CAUGHT ERROR IN addItem ===")
            console.error("Raw error:", error)
            console.error("Error type:", typeof error)
            console.error("Error constructor:", error?.constructor?.name)
            console.error("Error keys:", error ? Object.keys(error) : "null")
            if (error?.message) console.error("Message:", error.message)
            if (error?.code) console.error("Code:", error.code)
            if (error?.details) console.error("Details:", error.details)
            if (error?.hint) console.error("Hint:", error.hint)
            console.error("=== END CAUGHT ERROR ===")

            toast.error(error?.message || error?.hint || "Failed to add item")
        }
    }

    const bulkAddItems = async (newItems: (Partial<VaultItem> & { item_metadata?: any })[]) => {
        if (!user || newItems.length === 0) return
        try {
            const payload = newItems.map(item => ({
                user_id: user.id,
                type: item.type || 'password',
                title: item.title || item.website || 'Untitled',
                username: item.username,
                password: item.password,
                website: item.website,
                category: item.category,
                folder_id: item.folder_id,
                is_favorite: item.is_favorite || false,
                is_archived: item.is_archived || false,
                notes: item.notes,
                item_metadata: item.item_metadata || {}
            }))

            const { data, error } = await supabase
                .from("vault_items")
                .insert(payload)
                .select()

            if (error) throw error

            const mappedItems = data.map(i => ({ ...i, updatedAt: i.updated_at }))
            setItems(prev => [...mappedItems as any, ...prev])
            toast.success(`${mappedItems.length} items imported`)
            await fetchData() // Force sync
            return mappedItems
        } catch (error: any) {
            console.error("Error batch importing:", error)
            toast.error(error.message)
        }
    }

    const updateItem = async (id: string, updates: Partial<VaultItem>) => {
        try {
            // Define known schema columns to prevent errors
            const schemaFields = [
                'type', 'title', 'username', 'password', 'website',
                'category', 'notes', 'folder_id', 'is_favorite', 'is_archived',
                'item_metadata' // Added to prevent nesting
            ];

            // Separate schema fields from metadata
            const dbPayload: any = { updated_at: new Date().toISOString() };
            const metadataUpdates: any = {};

            // Get current item to merge metadata
            const currentItem = items.find(i => i.id === id);
            const currentMetadata = currentItem?.item_metadata || {};

            Object.entries(updates).forEach(([key, value]) => {
                // Skip path/folder legacy fields
                if (key === 'path' || key === 'folder') return;

                if (schemaFields.includes(key)) {
                    dbPayload[key] = value;
                } else {
                    // Assume anything else is metadata (e.g. picture)
                    metadataUpdates[key] = value;
                }
            });

            // If we have metadata updates, merge them with the base (either new metadata from payload or existing)
            if (Object.keys(metadataUpdates).length > 0) {
                const baseMetadata = dbPayload.item_metadata || currentMetadata;
                dbPayload.item_metadata = { ...baseMetadata, ...metadataUpdates };
            }

            const { error } = await supabase
                .from("vault_items")
                .update(dbPayload)
                .eq('id', id)

            if (error) throw error

            // Update local state
            setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates, item_metadata: dbPayload.item_metadata || item.item_metadata } : item))
            toast.success("Item updated")
            await fetchData() // Force sync
        } catch (error: any) {
            console.error("Update error:", error)
            toast.error("Failed to update item")
        }
    }

    const updateFolder = async (id: string, updates: Partial<Folder>) => {
        try {
            const { error } = await supabase
                .from("folders")
                .update({
                    name: updates.name,
                    parent_id: updates.parent_id
                })
                .eq('id', id)

            if (error) throw error

            setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
            toast.success("Folder updated")
        } catch (error: any) {
            console.error("Folder update error:", error)
            toast.error("Failed to update folder")
        }
    }

    const deleteItem = async (id: string, type: string = "item", options?: { skipRefresh?: boolean }) => {
        try {
            const table = type === "folder" ? "folders" : "vault_items"
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id)

            if (error) throw error

            if (type === "folder") {
                setFolders(prev => prev.filter(f => f.id !== id))
            } else {
                setItems(prev => prev.filter(i => i.id !== id))
            }
            toast.success(`${type === 'folder' ? 'Folder' : 'Item'} deleted`)
            if (!options?.skipRefresh) await fetchData() // Force sync
        } catch (error: any) {
            console.error("Delete operation failed:", JSON.stringify(error, null, 2))
            toast.error(`Failed to delete ${type}: ${error.message || "Unknown error"}`)
        }
    }

    // Combine for legacy 'records' prop
    const records = [...items, ...folders]

    console.log("🎯 useVault returning:", {
        itemsCount: items.length,
        foldersCount: folders.length,
        recordsCount: records.length,
        sampleRecord: records[0] ? { title: (records[0] as any).title, type: (records[0] as any).type, category: (records[0] as any).category } : null
    })

    return {
        items,
        folders,
        records,
        loading,
        addFolder,
        addItem,
        bulkAddItems,
        updateItem,
        updateFolder,
        deleteItem,
        refresh: fetchData
    }
}
