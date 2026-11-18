/**
 * journalSync.ts
 *
 * Slender, low-egress Supabase synchronization layer for App Dev Journal.
 * Mirrors journal localStorage keys with gzip compression, metadata-first pulling,
 * content-hashed incremental upserts, offline queueing, and conflict reconciliation.
 */

import { supabase } from "@/lib/supabase"
import { gzipCompress, gzipDecompress, getContentHash, getByteLength } from "./compression"

export const SYNCED_KEYS = [
  "projects",
  "ideas",
  "todos",
  "customFields",
  "journal-shared-options",
  "journal-settings",
  "journal-last-record",
  "journal-screenshot-nov-2026-imported",
  "journal-cover-corrections-v1",
  "journal-backup-2026-11-16",
] as const

export const EXCLUDED_PREFIXES = [
  "slh-ag-account-tracker",
  "slh-ag-tracker",
  "slh-journal-sync",
  "slh-journal-backup",
  "google_",
  "oauth_",
  "drive_",
  "sb-",
  "supabase.",
  "vault_",
]

export const MAX_COMPRESSED_BYTES = 4 * 1024 * 1024 // 4 MB limit

export type SyncState = "synced" | "syncing" | "offline" | "error"

export interface KeySyncMeta {
  hash: string
  updatedAt: string
  compressedSize: number
  isTooLarge?: boolean
}

export interface JournalSyncMeta {
  lastSyncAt: string
  keys: Record<string, KeySyncMeta>
}

const META_STORAGE_KEY = "slh-journal-sync-meta"

function loadSyncMeta(): JournalSyncMeta {
  try {
    const raw = localStorage.getItem(META_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { lastSyncAt: "", keys: {} }
}

function saveSyncMeta(meta: JournalSyncMeta) {
  try {
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta))
  } catch {}
}

class JournalSyncService {
  private state: SyncState = "synced"
  private statusMessage: string = "Synced"
  private listeners: Set<(state: SyncState, message: string) => void> = new Set()
  private pushTimeout: NodeJS.Timeout | null = null
  private pendingPushKeys: Set<string> = new Set()
  private offlineQueue: Set<string> = new Set()
  private lastActiveTimestamp: number = Date.now()
  private isMounted: boolean = false
  private originalSetItem: typeof localStorage.setItem | null = null
  private originalRemoveItem: typeof localStorage.removeItem | null = null

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline)
      window.addEventListener("offline", this.handleOffline)
      document.addEventListener("visibilitychange", this.handleVisibilityChange)
    }
  }

  public subscribe(listener: (state: SyncState, message: string) => void) {
    this.listeners.add(listener)
    listener(this.state, this.statusMessage)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private setState(state: SyncState, message: string) {
    this.state = state
    this.statusMessage = message
    for (const listener of this.listeners) {
      listener(state, message)
    }
  }

  public getState() {
    return { state: this.state, message: this.statusMessage }
  }

  // Intercept localStorage setItem and removeItem while Journal is mounted
  public mount() {
    if (this.isMounted || typeof window === "undefined") return
    this.isMounted = true
    this.lastActiveTimestamp = Date.now()

    this.originalSetItem = localStorage.setItem.bind(localStorage)
    this.originalRemoveItem = localStorage.removeItem.bind(localStorage)

    localStorage.setItem = (key: string, value: string) => {
      this.originalSetItem!(key, value)
      if (this.isSyncedKey(key)) {
        this.schedulePush(key)
      }
    }

    localStorage.removeItem = (key: string) => {
      this.originalRemoveItem!(key)
      if (this.isSyncedKey(key)) {
        this.schedulePush(key)
      }
    }
  }

  public unmount() {
    if (!this.isMounted || typeof window === "undefined") return
    this.isMounted = false

    if (this.originalSetItem) localStorage.setItem = this.originalSetItem
    if (this.originalRemoveItem) localStorage.removeItem = this.originalRemoveItem

    if (this.pushTimeout) {
      clearTimeout(this.pushTimeout)
      this.pushTimeout = null
    }

    // Flush any pending updates
    if (this.pendingPushKeys.size > 0) {
      void this.flushPendingPushes()
    }
  }

  private isSyncedKey(key: string): boolean {
    const lower = key.toLowerCase()
    // Security check: never sync any key whose name contains pin, password, token, or secret
    if (
      lower.includes("pin") ||
      lower.includes("password") ||
      lower.includes("token") ||
      lower.includes("secret")
    ) {
      return false
    }
    if (EXCLUDED_PREFIXES.some((prefix) => key.startsWith(prefix))) return false
    return (SYNCED_KEYS as readonly string[]).includes(key)
  }

  private handleOnline = () => {
    if (this.offlineQueue.size > 0) {
      for (const key of this.offlineQueue) {
        this.pendingPushKeys.add(key)
      }
      this.offlineQueue.clear()
      void this.flushPendingPushes()
    } else {
      this.setState("synced", "Online – synced")
    }
  }

  private handleOffline = () => {
    this.setState("offline", "Offline")
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      // Flush any debounced pushes immediately when tab is hidden
      if (this.pendingPushKeys.size > 0) {
        void this.flushPendingPushes()
      }
    } else if (document.visibilityState === "visible") {
      // If tab was away for more than 15 minutes, pull metadata
      const now = Date.now()
      if (now - this.lastActiveTimestamp > 15 * 60 * 1000) {
        void this.pullMetadataOnly()
      }
      this.lastActiveTimestamp = now
    }
  }

  private schedulePush(key: string) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.offlineQueue.add(key)
      this.setState("offline", "Offline (changes queued)")
      return
    }

    this.pendingPushKeys.add(key)
    this.setState("syncing", "Syncing…")

    if (this.pushTimeout) {
      clearTimeout(this.pushTimeout)
    }

    this.pushTimeout = setTimeout(() => {
      void this.flushPendingPushes()
    }, 3000)
  }

  public async flushPendingPushes() {
    if (this.pendingPushKeys.size === 0) return
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      for (const k of this.pendingPushKeys) this.offlineQueue.add(k)
      this.pendingPushKeys.clear()
      this.setState("offline", "Offline (changes queued)")
      return
    }

    const keysToPush = Array.from(this.pendingPushKeys)
    this.pendingPushKeys.clear()

    try {
      this.setState("syncing", "Syncing…")
      await this.pushKeys(keysToPush)
      this.setState("synced", "Synced")
    } catch (err: any) {
      console.warn("Journal sync push skipped (local storage mode active):", err?.message || err)
      this.setState("offline", "Local storage mode")
    }
  }

  // Batch upload changed keys
  private async pushKeys(keys: string[]) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Not authenticated with Supabase
      return
    }

    const meta = loadSyncMeta()
    const recordsToUpsert: { user_id: string; key: string; value: string; updated_at: string }[] = []
    const nowIso = new Date().toISOString()

    for (const key of keys) {
      const localVal = localStorage.getItem(key)
      if (localVal === null) continue

      const hash = await getContentHash(localVal)
      // Check if hash changed from last uploaded meta
      if (meta.keys[key]?.hash === hash) {
        continue // Skip un-changed key
      }

      // Compress
      const compressedVal = await gzipCompress(localVal)
      const compressedSize = getByteLength(compressedVal)

      if (compressedSize > MAX_COMPRESSED_BYTES) {
        meta.keys[key] = {
          hash,
          updatedAt: nowIso,
          compressedSize,
          isTooLarge: true,
        }
        console.warn(`Key ${key} is ${compressedSize} bytes (exceeds 4MB) - kept local only.`)
        continue
      }

      recordsToUpsert.push({
        user_id: user.id,
        key,
        value: compressedVal,
        updated_at: nowIso,
      })

      meta.keys[key] = {
        hash,
        updatedAt: nowIso,
        compressedSize,
        isTooLarge: false,
      }
    }

    if (recordsToUpsert.length > 0) {
      try {
        const { error } = await supabase
          .from("app_dev_journal_data")
          .upsert(recordsToUpsert, { onConflict: "user_id,key" })

        if (error) {
          this.setState("offline", "Local storage mode")
          return
        }
      } catch (upsertErr) {
        this.setState("offline", "Local storage mode")
        return
      }
    }

    meta.lastSyncAt = nowIso
    saveSyncMeta(meta)
  }

  // Metadata-first pull: select key, updated_at only
  private async pullMetadataOnly(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    try {
      const meta = loadSyncMeta()
      const { data: remoteMeta, error } = await supabase
        .from("app_dev_journal_data")
        .select("key, updated_at")
        .eq("user_id", user.id)

      if (error || !remoteMeta) return false

      const keysToDownload: string[] = []
      for (const row of remoteMeta) {
        const localMeta = meta.keys[row.key]
        if (!localMeta || new Date(row.updated_at) > new Date(localMeta.updatedAt || 0)) {
          keysToDownload.push(row.key)
        }
      }

      if (keysToDownload.length > 0) {
        return await this.downloadAndApplyKeys(keysToDownload, user.id)
      }
      return false
    } catch (err) {
      console.warn("Pull metadata check failed:", err)
      return false
    }
  }

  // Download and apply specific keys
  private async downloadAndApplyKeys(keys: string[], userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("app_dev_journal_data")
      .select("key, value, updated_at")
      .eq("user_id", userId)
      .in("key", keys)

    if (error || !data) return false

    const meta = loadSyncMeta()
    let hasAppliedChange = false

    for (const row of data) {
      if (!row.value) continue
      const decompressedVal = await gzipDecompress(row.value)
      const localVal = localStorage.getItem(row.key)

      if (localVal !== decompressedVal) {
        // Save rolling backup before overwriting non-empty local value
        if (localVal && localVal.trim() !== "" && localVal !== "[]") {
          localStorage.setItem(`slh-journal-backup-${row.key}`, localVal)
        }

        localStorage.setItem(row.key, decompressedVal)
        hasAppliedChange = true
      }

      const hash = await getContentHash(decompressedVal)
      meta.keys[row.key] = {
        hash,
        updatedAt: row.updated_at,
        compressedSize: getByteLength(row.value),
      }
    }

    meta.lastSyncAt = new Date().toISOString()
    saveSyncMeta(meta)

    return hasAppliedChange
  }

  // Initial reconcile on journal open with 8s timeout
  public async reconcileOnOpen(): Promise<void> {
    this.setState("syncing", "Syncing…")

    const reconcilePromise = this.performReconcile()
    const timeoutPromise = new Promise<{ timedOut: boolean }>((resolve) =>
      setTimeout(() => resolve({ timedOut: true }), 8000)
    )

    try {
      const res = await Promise.race([reconcilePromise, timeoutPromise])
      if ("timedOut" in res && res.timedOut) {
        console.warn("Journal sync reconcile timed out (8s) - proceeding with local data.")
        this.setState("offline", "Local storage mode")
        return
      }
      this.setState("synced", "Synced")
    } catch (err: any) {
      console.warn("Reconcile on open skipped (local storage mode active):", err?.message || err)
      this.setState("offline", "Local storage mode")
    }
  }

  private async performReconcile(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      this.setState("synced", "Local only (guest)")
      return
    }

    // 1. Pull remote metadata (key, updated_at)
    const { data: remoteMetaRows, error: metaError } = await supabase
      .from("app_dev_journal_data")
      .select("key, updated_at")
      .eq("user_id", user.id)

    if (metaError) {
      this.setState("offline", "Local storage mode")
      return
    }

    const remoteMap = new Map<string, string>()
    if (remoteMetaRows) {
      for (const r of remoteMetaRows) {
        remoteMap.set(r.key, r.updated_at)
      }
    }

    const meta = loadSyncMeta()
    const keysToDownload: string[] = []
    const keysToPush: string[] = []
    let needsRemount = false

    for (const key of SYNCED_KEYS) {
      const localVal = localStorage.getItem(key)
      const hasLocal = localVal !== null && localVal.trim() !== "" && localVal !== "[]"
      const remoteUpdatedAt = remoteMap.get(key)
      const hasRemote = Boolean(remoteUpdatedAt)
      const localMeta = meta.keys[key]

      if (!hasRemote && hasLocal) {
        // remote missing → push local
        keysToPush.push(key)
      } else if (hasRemote && !hasLocal) {
        // local empty → apply remote
        keysToDownload.push(key)
      } else if (hasRemote && hasLocal) {
        const localHash = await getContentHash(localVal!)
        const localChanged = !localMeta || localMeta.hash !== localHash
        const remoteChanged = !localMeta || new Date(remoteUpdatedAt!) > new Date(localMeta.updatedAt || 0)

        if (remoteChanged && !localChanged) {
          // only remote changed → apply remote
          keysToDownload.push(key)
        } else if (localChanged && !remoteChanged) {
          // only local changed → push local
          keysToPush.push(key)
        } else if (remoteChanged && localChanged) {
          // both changed → download remote to merge
          keysToDownload.push(key)
        }
      }
    }

    // Download needed keys
    if (keysToDownload.length > 0) {
      const { data: remoteValues, error: downloadErr } = await supabase
        .from("app_dev_journal_data")
        .select("key, value, updated_at")
        .eq("user_id", user.id)
        .in("key", keysToDownload)

      if (!downloadErr && remoteValues) {
        for (const row of remoteValues) {
          if (!row.value) continue
          const decompressedRemote = await gzipDecompress(row.value)
          const localVal = localStorage.getItem(row.key)

          if (localVal === null || localVal.trim() === "" || localVal === "[]") {
            // Local empty -> apply remote
            localStorage.setItem(row.key, decompressedRemote)
            needsRemount = true
          } else if (localVal !== decompressedRemote) {
            // Both changed -> merge
            const merged = this.mergeValues(row.key, localVal, decompressedRemote)
            // Backup before overwriting
            localStorage.setItem(`slh-journal-backup-${row.key}`, localVal)
            localStorage.setItem(row.key, merged)
            needsRemount = true
            // Push merged result back
            keysToPush.push(row.key)
          }

          const finalVal = localStorage.getItem(row.key) || ""
          meta.keys[row.key] = {
            hash: await getContentHash(finalVal),
            updatedAt: row.updated_at,
            compressedSize: getByteLength(row.value),
          }
        }
      }
    }

    // Push local/merged keys
    if (keysToPush.length > 0) {
      await this.pushKeys(keysToPush)
    }

    meta.lastSyncAt = new Date().toISOString()
    saveSyncMeta(meta)

    // Notify to remount Journal if remote changes applied
    if (needsRemount && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("slh_remount_journal"))
    }
  }

  // Merge values for array and non-array keys
  private mergeValues(key: string, localStr: string, remoteStr: string): string {
    try {
      const localParsed = JSON.parse(localStr)
      const remoteParsed = JSON.parse(remoteStr)

      // If array: merge items by id
      if (Array.isArray(localParsed) && Array.isArray(remoteParsed)) {
        const itemMap = new Map<string, any>()
        for (const item of remoteParsed) {
          if (item && item.id) itemMap.set(String(item.id), item)
        }
        for (const item of localParsed) {
          if (!item || !item.id) continue
          const id = String(item.id)
          const remoteItem = itemMap.get(id)
          if (!remoteItem) {
            itemMap.set(id, item)
          } else {
            // Newer updatedAt / modifiedAt wins, otherwise local
            const localTime = new Date(item.modifiedAt || item.updatedAt || item.lastUpdated || 0).getTime()
            const remoteTime = new Date(remoteItem.modifiedAt || remoteItem.updatedAt || remoteItem.lastUpdated || 0).getTime()
            if (remoteTime > localTime) {
              itemMap.set(id, remoteItem)
            } else {
              itemMap.set(id, item)
            }
          }
        }
        return JSON.stringify(Array.from(itemMap.values()))
      }
    } catch {
      // JSON parse failed, non-array fallback
    }

    // Non-arrays prefer local
    return localStr
  }

  // Manual trigger
  public async syncNow(): Promise<void> {
    this.setState("syncing", "Syncing…")
    try {
      await this.flushPendingPushes()
      await this.performReconcile()
      this.setState("synced", "Synced")
    } catch (err) {
      console.error("Manual sync failed:", err)
      this.setState("error", "Sync error")
    }
  }

  // Get report data for summary
  public async getSyncReport(): Promise<{
    syncedKeys: string[]
    excludedKeys: string[]
    keySizes: Record<string, { uncompressed: number; compressed: number; isTooLarge: boolean }>
  }> {
    const meta = loadSyncMeta()
    const keySizes: Record<string, { uncompressed: number; compressed: number; isTooLarge: boolean }> = {}

    for (const key of SYNCED_KEYS) {
      const val = typeof window !== "undefined" ? localStorage.getItem(key) || "" : ""
      const uncompressed = getByteLength(val)
      const compressedVal = await gzipCompress(val)
      const compressed = getByteLength(compressedVal)
      keySizes[key] = {
        uncompressed,
        compressed,
        isTooLarge: compressed > MAX_COMPRESSED_BYTES,
      }
    }

    return {
      syncedKeys: [...SYNCED_KEYS],
      excludedKeys: [
        "slh-ag-account-tracker-v1",
        "slh-journal-sync-meta",
        "slh-journal-backup-*",
        "Google OAuth / tokens / credentials",
        "SLH Vault items & Supabase auth storage",
      ],
      keySizes,
    }
  }
}

export const journalSync = new JournalSyncService()
