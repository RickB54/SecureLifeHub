import { supabase } from "@/lib/supabase"
import { prepareHealthAttachment } from "@/lib/image-downsize"
import {
  HealthProfile,
  HealthPrepItem,
  HealthQuestion,
  HealthNote,
  HealthLetter,
  HealthReferral,
  HealthVisitSummary,
  DoctorOption,
  VisitOption,
  MedicationSummary,
} from "./doctor-visit-types"

const CACHE_KEY_PREFIX = "slh-visit-hub-"
const PIN_HASH_KEY = "slh-visit-hub-pin-hash"
const SELECTED_SECTIONS_KEY = "slh-visit-hub-selected-sections"

// ==============================================================================
// LOCAL STORAGE CACHE HELPERS
// ==============================================================================

export function getCachedItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.warn(`Error reading cache for ${key}:`, err)
  }
  return defaultValue
}

export function setCachedItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(value))
    localStorage.setItem(CACHE_KEY_PREFIX + "last-updated", new Date().toISOString())
  } catch (err) {
    console.warn(`Error saving cache for ${key}:`, err)
  }
}

export function getLastCacheUpdated(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CACHE_KEY_PREFIX + "last-updated")
}

export function getSelectedSectionsFromStorage(): string[] {
  if (typeof window === "undefined") return ["nextAppt"]
  try {
    const raw = localStorage.getItem(SELECTED_SECTIONS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return ["nextAppt"]
}

export function saveSelectedSectionsToStorage(sections: string[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SELECTED_SECTIONS_KEY, JSON.stringify(sections))
  } catch {}
}

// ==============================================================================
// PIN LOCK HELPERS
// ==============================================================================

export async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder().encode(pin.trim())
  const hashBuf = await crypto.subtle.digest("SHA-256", enc)
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function getSavedPinHash(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(PIN_HASH_KEY)
}

export function savePinHash(hash: string | null): void {
  if (typeof window === "undefined") return
  if (!hash) {
    localStorage.removeItem(PIN_HASH_KEY)
  } else {
    localStorage.setItem(PIN_HASH_KEY, hash)
  }
}

// ==============================================================================
// IMAGE DOWNSIZING & PRIVATE STORAGE ATTACHMENT HELPERS (health-attachments)
// ==============================================================================

const ATTACHMENTS_BUCKET = "health-attachments"
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>()

export async function compressAndUploadAttachment(
  file: File,
  userId?: string
): Promise<{ path: string; url: string; name: string; sizeSummary: string; isImage: boolean }> {
  if (!userId) {
    throw new Error("You must be signed in to upload attachments.")
  }

  const prepared = await prepareHealthAttachment(file)
  const safeName = prepared.file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const storagePath = `${userId}/${Date.now()}-${safeName}`

  const { error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(storagePath, prepared.file, {
      contentType: prepared.file.type || "application/octet-stream",
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    throw new Error(`Attachment upload failed: ${error.message}`)
  }

  return {
    path: storagePath,
    url: storagePath,
    name: file.name,
    sizeSummary: prepared.sizeSummary,
    isImage: prepared.isImage,
  }
}

export async function getAttachmentSignedUrl(pathOrUrl?: string | null): Promise<string | null> {
  if (!pathOrUrl) return null
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://") || pathOrUrl.startsWith("data:")) {
    return pathOrUrl
  }

  const now = Date.now()
  const cached = signedUrlCache.get(pathOrUrl)
  if (cached && cached.expiresAt > now) {
    return cached.url
  }

  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(pathOrUrl, 300) // 5 min short expiry

  if (error || !data?.signedUrl) {
    console.warn("Failed to sign attachment URL:", error?.message)
    return null
  }

  signedUrlCache.set(pathOrUrl, { url: data.signedUrl, expiresAt: now + 240_000 })
  return data.signedUrl
}

export async function deleteHealthAttachment(pathOrUrl?: string | null): Promise<void> {
  if (!pathOrUrl) return
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://") || pathOrUrl.startsWith("data:")) {
    return
  }
  signedUrlCache.delete(pathOrUrl)
  try {
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([pathOrUrl])
  } catch (err) {
    console.warn("Failed to remove old attachment from storage:", err)
  }
}

// ==============================================================================
// HEALTH PROFILE (single row per user)
// ==============================================================================

export async function fetchHealthProfile(userId?: string): Promise<HealthProfile> {
  const defaultProfile: HealthProfile = {
    allergies: "None listed",
    conditions: "None listed",
    insurance_provider: "",
    insurance_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
  }

  const cached = getCachedItem<HealthProfile>("profile", defaultProfile)

  if (!userId || typeof window !== "undefined" && !navigator.onLine) {
    return cached
  }

  try {
    const { data, error } = await supabase
      .from("health_profile")
      .select("id, user_id, allergies, conditions, insurance_provider, insurance_id, emergency_contact_name, emergency_contact_phone, emergency_contact_relation")
      .eq("user_id", userId)
      .maybeSingle()

    if (!error && data) {
      setCachedItem("profile", data)
      return data
    }
  } catch (err) {
    console.warn("Supabase fetchHealthProfile error, falling back to cache:", err)
  }

  return cached
}

export async function saveHealthProfile(
  profile: Partial<HealthProfile>,
  userId?: string
): Promise<HealthProfile> {
  const current = getCachedItem<HealthProfile>("profile", {
    allergies: "",
    conditions: "",
    insurance_provider: "",
    insurance_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
  })

  const merged: HealthProfile = {
    ...current,
    ...profile,
    updated_at: new Date().toISOString(),
  }

  setCachedItem("profile", merged)

  if (userId && navigator.onLine) {
    const { data, error } = await supabase
      .from("health_profile")
      .upsert(
        {
          user_id: userId,
          allergies: merged.allergies,
          conditions: merged.conditions,
          insurance_provider: merged.insurance_provider,
          insurance_id: merged.insurance_id,
          emergency_contact_name: merged.emergency_contact_name,
          emergency_contact_phone: merged.emergency_contact_phone,
          emergency_contact_relation: merged.emergency_contact_relation,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .maybeSingle()

    if (error) {
      throw new Error(error.message || "Failed to save health profile")
    }
    if (data) {
      setCachedItem("profile", data)
      return data
    }
  }

  return merged
}

// ==============================================================================
// HEALTH PREP ITEMS (checklist per appointment)
// ==============================================================================

export async function fetchPrepItems(visitId?: string | null, userId?: string): Promise<HealthPrepItem[]> {
  const cachedAll = getCachedItem<HealthPrepItem[]>("prep_items", [])
  const filtered = visitId ? cachedAll.filter((i) => i.visit_id === visitId) : cachedAll

  if (!userId || (typeof window !== "undefined" && !navigator.onLine)) {
    return filtered
  }

  try {
    let query = supabase
      .from("health_prep_items")
      .select("id, user_id, visit_id, text, completed, sort_order, created_at")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })

    if (visitId) {
      query = query.eq("visit_id", visitId)
    }

    const { data, error } = await query
    if (!error && data) {
      const otherItems = cachedAll.filter((i) => (visitId ? i.visit_id !== visitId : false))
      const combined = [...otherItems, ...data]
      setCachedItem("prep_items", combined)
      return data
    }
  } catch (err) {
    console.warn("Supabase fetchPrepItems error:", err)
  }

  return filtered
}

export async function savePrepItem(
  item: Omit<HealthPrepItem, "id"> & { id?: string },
  userId?: string
): Promise<HealthPrepItem> {
  const id = item.id || crypto.randomUUID()
  const completeItem: HealthPrepItem = {
    ...item,
    id,
    user_id: userId,
    created_at: item.created_at || new Date().toISOString(),
  }

  const cached = getCachedItem<HealthPrepItem[]>("prep_items", [])
  const exists = cached.some((i) => i.id === id)
  const updated = exists ? cached.map((i) => (i.id === id ? completeItem : i)) : [...cached, completeItem]
  setCachedItem("prep_items", updated)

  if (userId && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from("health_prep_items")
        .upsert(completeItem)
        .select()
        .maybeSingle()
      if (!error && data) return data
    } catch (err) {
      console.warn("Supabase savePrepItem error:", err)
    }
  }

  return completeItem
}

export async function deletePrepItem(id: string, userId?: string): Promise<void> {
  const cached = getCachedItem<HealthPrepItem[]>("prep_items", [])
  setCachedItem("prep_items", cached.filter((i) => i.id !== id))

  if (userId && navigator.onLine) {
    try {
      await supabase.from("health_prep_items").delete().eq("id", id).eq("user_id", userId)
    } catch (err) {
      console.warn("Supabase deletePrepItem error:", err)
    }
  }
}

// ==============================================================================
// HEALTH QUESTIONS
// ==============================================================================

export async function fetchQuestions(userId?: string): Promise<HealthQuestion[]> {
  const cached = getCachedItem<HealthQuestion[]>("questions", [])

  if (!userId || (typeof window !== "undefined" && !navigator.onLine)) {
    return cached
  }

  try {
    const { data, error } = await supabase
      .from("health_questions")
      .select("id, user_id, question, answered, doctor_id, doctor_name, visit_id, answer_notes, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setCachedItem("questions", data)
      return data
    }
  } catch (err) {
    console.warn("Supabase fetchQuestions error:", err)
  }

  return cached
}

export async function saveQuestion(
  q: Omit<HealthQuestion, "id"> & { id?: string },
  userId?: string
): Promise<HealthQuestion> {
  const id = q.id || crypto.randomUUID()
  const completeQuestion: HealthQuestion = {
    ...q,
    id,
    user_id: userId,
    created_at: q.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const cached = getCachedItem<HealthQuestion[]>("questions", [])
  const exists = cached.some((i) => i.id === id)
  const updated = exists ? cached.map((i) => (i.id === id ? completeQuestion : i)) : [completeQuestion, ...cached]
  setCachedItem("questions", updated)

  if (userId && navigator.onLine) {
    const { data, error } = await supabase
      .from("health_questions")
      .upsert(completeQuestion)
      .select()
      .maybeSingle()
    if (error) {
      throw new Error(error.message || "Failed to save question")
    }
    if (data) {
      setCachedItem(
        "questions",
        updated.map((i) => (i.id === data.id ? data : i))
      )
      return data
    }
  }

  return completeQuestion
}

export async function deleteQuestion(id: string, userId?: string): Promise<void> {
  const cached = getCachedItem<HealthQuestion[]>("questions", [])
  setCachedItem("questions", cached.filter((i) => i.id !== id))

  if (userId && navigator.onLine) {
    try {
      await supabase.from("health_questions").delete().eq("id", id).eq("user_id", userId)
    } catch (err) {
      console.warn("Supabase deleteQuestion error:", err)
    }
  }
}

// ==============================================================================
// HEALTH NOTES
// ==============================================================================

export async function fetchHealthNotes(userId?: string): Promise<HealthNote[]> {
  const cached = getCachedItem<HealthNote[]>("notes", [])

  if (!userId || (typeof window !== "undefined" && !navigator.onLine)) {
    return cached
  }

  try {
    const { data, error } = await supabase
      .from("health_notes")
      .select("id, user_id, title, text, date, date_type, doctor_id, doctor_name, visit_id, given_to_doctor, given_method, given_date, created_at, updated_at")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (!error && data) {
      setCachedItem("notes", data)
      return data
    }
  } catch (err) {
    console.warn("Supabase fetchHealthNotes error:", err)
  }

  return cached
}

export async function saveHealthNote(
  note: Omit<HealthNote, "id"> & { id?: string },
  userId?: string
): Promise<HealthNote> {
  const id = note.id || crypto.randomUUID()
  const completeNote: HealthNote = {
    ...note,
    id,
    user_id: userId,
    created_at: note.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const cached = getCachedItem<HealthNote[]>("notes", [])
  const exists = cached.some((i) => i.id === id)
  const updated = exists ? cached.map((i) => (i.id === id ? completeNote : i)) : [completeNote, ...cached]
  setCachedItem("notes", updated)

  if (userId && navigator.onLine) {
    const { data, error } = await supabase
      .from("health_notes")
      .upsert(completeNote)
      .select()
      .maybeSingle()
    if (error) {
      throw new Error(error.message || "Failed to save note")
    }
    if (data) {
      setCachedItem(
        "notes",
        updated.map((i) => (i.id === data.id ? data : i))
      )
      return data
    }
  }

  return completeNote
}

export async function deleteHealthNote(id: string, userId?: string): Promise<void> {
  const cached = getCachedItem<HealthNote[]>("notes", [])
  setCachedItem("notes", cached.filter((i) => i.id !== id))

  if (userId && navigator.onLine) {
    try {
      await supabase.from("health_notes").delete().eq("id", id).eq("user_id", userId)
    } catch (err) {
      console.warn("Supabase deleteHealthNote error:", err)
    }
  }
}

// ==============================================================================
// HEALTH LETTERS
// ==============================================================================

export async function fetchHealthLetters(userId?: string): Promise<HealthLetter[]> {
  const cached = getCachedItem<HealthLetter[]>("letters", [])

  if (!userId || (typeof window !== "undefined" && !navigator.onLine)) {
    return cached
  }

  try {
    const { data, error } = await supabase
      .from("health_letters")
      .select("id, user_id, doctor_id, doctor_name, visit_id, date, date_type, direction, status, notes, attachment_url, attachment_name, given_to_doctor, given_method, given_date, created_at, updated_at")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (!error && data) {
      setCachedItem("letters", data)
      return data
    }
  } catch (err) {
    console.warn("Supabase fetchHealthLetters error:", err)
  }

  return cached
}

export async function saveHealthLetter(
  letter: Omit<HealthLetter, "id"> & { id?: string },
  userId?: string
): Promise<HealthLetter> {
  const id = letter.id || crypto.randomUUID()
  const completeLetter: HealthLetter = {
    ...letter,
    id,
    user_id: userId,
    created_at: letter.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const cached = getCachedItem<HealthLetter[]>("letters", [])
  const exists = cached.some((i) => i.id === id)
  const updated = exists ? cached.map((i) => (i.id === id ? completeLetter : i)) : [completeLetter, ...cached]
  setCachedItem("letters", updated)

  if (userId && navigator.onLine) {
    const { data, error } = await supabase
      .from("health_letters")
      .upsert(completeLetter)
      .select()
      .maybeSingle()
    if (error) {
      throw new Error(error.message || "Failed to save letter")
    }
    if (data) {
      setCachedItem(
        "letters",
        updated.map((i) => (i.id === data.id ? data : i))
      )
      return data
    }
  }

  return completeLetter
}

export async function deleteHealthLetter(id: string, userId?: string): Promise<void> {
  const cached = getCachedItem<HealthLetter[]>("letters", [])
  const target = cached.find((i) => i.id === id)
  setCachedItem("letters", cached.filter((i) => i.id !== id))

  if (target?.attachment_url) {
    await deleteHealthAttachment(target.attachment_url)
  }

  if (userId && navigator.onLine) {
    try {
      await supabase.from("health_letters").delete().eq("id", id).eq("user_id", userId)
    } catch (err) {
      console.warn("Supabase deleteHealthLetter error:", err)
    }
  }
}

// ==============================================================================
// HEALTH REFERRALS
// ==============================================================================

export async function fetchHealthReferrals(userId?: string): Promise<HealthReferral[]> {
  const cached = getCachedItem<HealthReferral[]>("referrals", [])

  if (!userId || (typeof window !== "undefined" && !navigator.onLine)) {
    return cached
  }

  try {
    const { data, error } = await supabase
      .from("health_referrals")
      .select("id, user_id, specialist_name, specialty, doctor_id, referred_by_doctor_id, referred_by_name, visit_id, reason, date, date_type, status, phone, notes, given_to_doctor, given_method, given_date, created_at, updated_at")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (!error && data) {
      setCachedItem("referrals", data)
      return data
    }
  } catch (err) {
    console.warn("Supabase fetchHealthReferrals error:", err)
  }

  return cached
}

export async function saveHealthReferral(
  referral: Omit<HealthReferral, "id"> & { id?: string },
  userId?: string
): Promise<HealthReferral> {
  const id = referral.id || crypto.randomUUID()
  const completeReferral: HealthReferral = {
    ...referral,
    id,
    user_id: userId,
    created_at: referral.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const cached = getCachedItem<HealthReferral[]>("referrals", [])
  const exists = cached.some((i) => i.id === id)
  const updated = exists ? cached.map((i) => (i.id === id ? completeReferral : i)) : [completeReferral, ...cached]
  setCachedItem("referrals", updated)

  if (userId && navigator.onLine) {
    const { data, error } = await supabase
      .from("health_referrals")
      .upsert(completeReferral)
      .select()
      .maybeSingle()
    if (error) {
      throw new Error(error.message || "Failed to save referral")
    }
    if (data) {
      setCachedItem(
        "referrals",
        updated.map((i) => (i.id === data.id ? data : i))
      )
      return data
    }
  }

  return completeReferral
}

export async function deleteHealthReferral(id: string, userId?: string): Promise<void> {
  const cached = getCachedItem<HealthReferral[]>("referrals", [])
  setCachedItem("referrals", cached.filter((i) => i.id !== id))

  if (userId && navigator.onLine) {
    try {
      await supabase.from("health_referrals").delete().eq("id", id).eq("user_id", userId)
    } catch (err) {
      console.warn("Supabase deleteHealthReferral error:", err)
    }
  }
}

// ==============================================================================
// GIVEN TO DOCTOR STATUS UPDATE (Immediate row update)
// ==============================================================================

export async function updateItemGivenStatus(
  table: "health_notes" | "health_letters" | "health_referrals" | "health_visit_summaries",
  cacheKey: "notes" | "letters" | "referrals" | "visit_summaries",
  id: string,
  given_to_doctor: boolean,
  given_method: string | null,
  given_date: string | null,
  userId?: string
): Promise<void> {
  // 1. Update localStorage cache
  const cached = getCachedItem<any[]>(cacheKey, [])
  const updated = cached.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        given_to_doctor,
        given_method,
        given_date,
        updated_at: new Date().toISOString(),
      }
    }
    return item
  })
  setCachedItem(cacheKey, updated)

  // 2. Immediate Supabase update if online
  if (userId && navigator.onLine) {
    try {
      await supabase
        .from(table)
        .update({
          given_to_doctor,
          given_method,
          given_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId)
    } catch (err) {
      console.warn(`Supabase updateItemGivenStatus on ${table} error:`, err)
    }
  }
}

// ==============================================================================
// HEALTH VISIT SUMMARIES
// ==============================================================================

export async function fetchVisitSummaries(userId?: string): Promise<HealthVisitSummary[]> {
  const cached = getCachedItem<HealthVisitSummary[]>("visit_summaries", [])

  if (!userId || (typeof window !== "undefined" && !navigator.onLine)) {
    return cached
  }

  try {
    const { data, error } = await supabase
      .from("health_visit_summaries")
      .select("id, user_id, title, summary_text, date, date_type, doctor_id, doctor_name, visit_id, given_to_doctor, given_method, given_date, created_at, updated_at")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (!error && data) {
      setCachedItem("visit_summaries", data)
      return data
    }
  } catch (err) {
    console.warn("Supabase fetchVisitSummaries error:", err)
  }

  return cached
}

export async function saveVisitSummary(
  summary: Omit<HealthVisitSummary, "id"> & { id?: string },
  userId?: string
): Promise<HealthVisitSummary> {
  const id = summary.id || crypto.randomUUID()
  const completeSummary: HealthVisitSummary = {
    ...summary,
    id,
    user_id: userId,
    created_at: summary.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const cached = getCachedItem<HealthVisitSummary[]>("visit_summaries", [])
  const exists = cached.some((i) => i.id === id)
  const updated = exists ? cached.map((i) => (i.id === id ? completeSummary : i)) : [completeSummary, ...cached]
  setCachedItem("visit_summaries", updated)

  if (userId && navigator.onLine) {
    const { data, error } = await supabase
      .from("health_visit_summaries")
      .upsert(completeSummary)
      .select()
      .maybeSingle()
    if (error) {
      throw new Error(error.message || "Failed to save visit summary")
    }
    if (data) {
      setCachedItem(
        "visit_summaries",
        updated.map((i) => (i.id === data.id ? data : i))
      )
      return data
    }
  }

  return completeSummary
}

export async function deleteVisitSummary(id: string, userId?: string): Promise<void> {
  const cached = getCachedItem<HealthVisitSummary[]>("visit_summaries", [])
  setCachedItem("visit_summaries", cached.filter((i) => i.id !== id))

  if (userId && navigator.onLine) {
    try {
      await supabase.from("health_visit_summaries").delete().eq("id", id).eq("user_id", userId)
    } catch (err) {
      console.warn("Supabase deleteVisitSummary error:", err)
    }
  }
}

// ==============================================================================
// REUSE EXISTING DATA (DOCTORS, VISITS, MEDICATIONS FROM VAULT_ITEMS)
// ==============================================================================

export async function fetchExistingDoctors(userId?: string): Promise<DoctorOption[]> {
  const cached = getCachedItem<DoctorOption[]>("existing_doctors", [])

  if (typeof window !== "undefined" && !navigator.onLine) {
    return cached
  }

  try {
    let query = supabase
      .from("vault_items")
      .select("id, title, notes, website, item_metadata")
      .or("category.eq.My Doctors,category.eq.Doctors,type.eq.doctor-record")
      .order("title", { ascending: true })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query

    if (!error && data) {
      const doctors: DoctorOption[] = data.map((d: any) => ({
        id: d.id,
        name: d.title || d.item_metadata?.doctorName || "Unnamed Doctor",
        specialty: d.item_metadata?.specialty || d.item_metadata?.doctorSpecialty || "",
        phone: d.item_metadata?.phone || d.item_metadata?.doctorPhone || "",
        facility: d.item_metadata?.facility || d.item_metadata?.location || d.item_metadata?.address || "",
        address: d.item_metadata?.address || "",
        portalUrl: d.website || d.item_metadata?.portalUrl || "",
      }))
      setCachedItem("existing_doctors", doctors)
      return doctors
    }
  } catch (err) {
    console.warn("Error fetching existing doctors:", err)
  }

  return cached
}

export async function fetchExistingVisits(userId?: string): Promise<VisitOption[]> {
  const cached = getCachedItem<VisitOption[]>("existing_visits", [])

  if (typeof window !== "undefined" && !navigator.onLine) {
    return cached
  }

  try {
    let query = supabase
      .from("vault_items")
      .select("id, title, notes, item_metadata, created_at")
      .or("category.in.(Health Records,Medical,Appointments),type.in.(health-record,appointment)")
      .order("created_at", { ascending: false })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query

    if (!error && data) {
      const visits: VisitOption[] = data
        .filter((d: any) => d.item_metadata?.date || d.item_metadata?.is_appointment)
        .map((d: any) => ({
          id: d.id,
          title: d.title || d.item_metadata?.title || "Doctor Visit",
          date: d.item_metadata?.date || d.created_at || "",
          doctor: d.item_metadata?.doctor || "",
          location: d.item_metadata?.location || "",
          notes: d.item_metadata?.notes || d.notes || "",
        }))
      setCachedItem("existing_visits", visits)
      return visits
    }
  } catch (err) {
    console.warn("Error fetching existing visits:", err)
  }

  return cached
}

export async function fetchExistingMedications(userId?: string): Promise<MedicationSummary[]> {
  const cached = getCachedItem<MedicationSummary[]>("existing_meds", [])

  if (typeof window !== "undefined" && !navigator.onLine) {
    return cached
  }

  try {
    let query = supabase
      .from("vault_items")
      .select("id, title, notes, item_metadata")
      .or("category.ilike.%medication%,type.ilike.%medication%")
      .order("title", { ascending: true })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query

    if (!error && data) {
      const meds: MedicationSummary[] = data.map((d: any) => ({
        id: d.id,
        name: d.title || "Unnamed Medication",
        dose: d.item_metadata?.dosage || d.item_metadata?.strength || "",
        frequency: d.item_metadata?.frequency || "",
        instructions: d.item_metadata?.instructions || d.notes || "",
      }))
      setCachedItem("existing_meds", meds)
      return meds
    }
  } catch (err) {
    console.warn("Error fetching existing medications:", err)
  }

  return cached
}
