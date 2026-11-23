"use client"

import { supabase } from "@/lib/supabase"
import type { DoctorOption, FacilityOption } from "@/components/health-ui/health-field-helpers"

const HEALTH_VAULT_COLUMNS =
  "id, user_id, type, title, category, notes, website, item_metadata, created_at, updated_at"

const HEALTH_VAULT_FILTER =
  'category.in.("Health Records","Medications","Vitals","Health Insurance","Doctors","My Doctors","Medical Facilities","Medical","Health Diary","Health Portals","Appointments"),type.in.(health-record,medication,vital,doctor,doctor-record,facility-record,health-insurance,health-checkin,health-portal,appointment)'

type Listener = (records: any[]) => void

let cachedHealthRecords: any[] | null = null
let cachedUserId: string | null = null
let inFlightFetch: Promise<any[]> | null = null
const listeners = new Set<Listener>()

function notifyListeners() {
  if (!cachedHealthRecords) return
  const snapshot = cachedHealthRecords
  listeners.forEach((fn) => {
    try {
      fn(snapshot)
    } catch {
      // ignore subscriber errors
    }
  })
}

export function subscribeHealthStore(listener: Listener): () => void {
  listeners.add(listener)
  if (cachedHealthRecords) {
    listener(cachedHealthRecords)
  }
  return () => {
    listeners.delete(listener)
  }
}

export function getCachedHealthRecords(): any[] | null {
  return cachedHealthRecords
}

/**
 * Single shared, deduplicated fetch for all Health Hub tabs.
 * Never refetches on tab switch; returns cached array immediately once loaded.
 */
export async function loadSharedHealthRecords(userId?: string | null, force = false): Promise<any[]> {
  if (!force && cachedHealthRecords && (!userId || cachedUserId === userId)) {
    return cachedHealthRecords
  }

  if (inFlightFetch && !force) {
    return inFlightFetch
  }

  inFlightFetch = (async () => {
    try {
      let query = supabase
        .from("vault_items")
        .select(HEALTH_VAULT_COLUMNS)
        .or(HEALTH_VAULT_FILTER)
        .order("created_at", { ascending: false })

      if (userId) {
        query = query.eq("user_id", userId)
      }

      const { data, error } = await query
      if (error) {
        console.warn("[health-store] fetch error:", error.message)
        return cachedHealthRecords || []
      }

      cachedHealthRecords = data || []
      cachedUserId = userId || null
      notifyListeners()
      return cachedHealthRecords
    } catch (err) {
      console.warn("[health-store] unexpected fetch error:", err)
      return cachedHealthRecords || []
    } finally {
      inFlightFetch = null
    }
  })()

  return inFlightFetch
}

/**
 * Optimistically upsert a record in the shared in-memory store (zero refetch egress).
 */
export function upsertSharedHealthRecord(record: any) {
  if (!record?.id) return
  const current = cachedHealthRecords || []
  const exists = current.some((r) => r.id === record.id)
  cachedHealthRecords = exists
    ? current.map((r) =>
        r.id === record.id
          ? {
              ...r,
              ...record,
              item_metadata: record.item_metadata
                ? { ...(r.item_metadata || {}), ...record.item_metadata }
                : r.item_metadata,
            }
          : r
      )
    : [record, ...current]
  notifyListeners()
}

/**
 * Remove a record from the shared in-memory store (zero refetch egress).
 */
export function removeSharedHealthRecord(id: string) {
  if (!id || !cachedHealthRecords) return
  cachedHealthRecords = cachedHealthRecords.filter((r) => r.id !== id)
  notifyListeners()
}

/**
 * Resolve live doctor info from My Doctors by doctor_id, falling back to saved text.
 */
export function resolveDoctorInfo(
  doctorId?: string | null,
  fallback?: { name?: string; specialty?: string; phone?: string; location?: string },
  doctors: DoctorOption[] = []
) {
  const linked = doctorId ? doctors.find((d) => d.id === doctorId) : undefined
  return {
    id: linked?.id || doctorId || null,
    name: linked?.name || fallback?.name || "",
    specialty: linked?.specialty || fallback?.specialty || "",
    phone: linked?.phone || fallback?.phone || "",
    location: linked?.facility || linked?.address || fallback?.location || "",
    facility_ids: linked?.facility_ids || [],
    isLinked: Boolean(linked),
  }
}

/**
 * Resolve live facility info from Medical Facilities by facility_id, falling back to saved text.
 */
export function resolveFacilityInfo(
  facilityId?: string | null,
  fallback?: { name?: string; address?: string; phone?: string; type?: string },
  facilities: FacilityOption[] = []
) {
  const linked = facilityId ? facilities.find((f) => f.id === facilityId) : undefined
  return {
    id: linked?.id || facilityId || null,
    name: linked?.name || fallback?.name || "",
    type: linked?.type || fallback?.type || "",
    address: linked?.address || fallback?.address || "",
    phone: linked?.phone || fallback?.phone || "",
    fax: linked?.fax || "",
    website: linked?.website || "",
    hours: linked?.hours || "",
    isLinked: Boolean(linked),
  }
}
