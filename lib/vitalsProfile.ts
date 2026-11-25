"use client"

import { useState, useEffect, useCallback } from "react"
import { CalorieActivityLevel, GlucoseContextType } from "./vitalsReference"

export type VitalsProfileSex = "" | "male" | "female"
export type VitalsHeightUnit = "ft_in" | "cm"

export interface VitalsProfileData {
  age: string
  infantAgeDetail: "0-4w" | "4w-3m" | "4-12m"
  sex: VitalsProfileSex
  heightUnit: VitalsHeightUnit
  heightFt: string
  heightIn: string
  heightCm: string
  calorieActivity: CalorieActivityLevel
}

const PROFILE_STORAGE_KEY = "slh_vitals_profile_v1"
const LEGACY_BP_STORAGE_KEY = "slh_bp_reference_prefs_v1"
const GLUCOSE_CTX_STORAGE_KEY = "slh_glucose_ctx_overrides_v1"

const DEFAULT_PROFILE: VitalsProfileData = {
  age: "",
  infantAgeDetail: "4-12m",
  sex: "",
  heightUnit: "ft_in",
  heightFt: "",
  heightIn: "",
  heightCm: "",
  calorieActivity: "moderate",
}

type Listener = (next: VitalsProfileData) => void
const listeners = new Set<Listener>()
let cachedProfile: VitalsProfileData | null = null

function readProfileFromStorage(): VitalsProfileData {
  if (typeof window === "undefined") return DEFAULT_PROFILE
  if (cachedProfile) return cachedProfile

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      cachedProfile = {
        age: typeof parsed?.age === "string" || typeof parsed?.age === "number" ? String(parsed.age) : "",
        infantAgeDetail:
          parsed?.infantAgeDetail === "0-4w" || parsed?.infantAgeDetail === "4w-3m" || parsed?.infantAgeDetail === "4-12m"
            ? parsed.infantAgeDetail
            : "4-12m",
        sex: parsed?.sex === "male" || parsed?.sex === "female" ? parsed.sex : "",
        heightUnit: parsed?.heightUnit === "cm" ? "cm" : "ft_in",
        heightFt: typeof parsed?.heightFt === "string" || typeof parsed?.heightFt === "number" ? String(parsed.heightFt) : "",
        heightIn: typeof parsed?.heightIn === "string" || typeof parsed?.heightIn === "number" ? String(parsed.heightIn) : "",
        heightCm: typeof parsed?.heightCm === "string" || typeof parsed?.heightCm === "number" ? String(parsed.heightCm) : "",
        calorieActivity:
          parsed?.calorieActivity === "sedentary" || parsed?.calorieActivity === "moderate" || parsed?.calorieActivity === "active"
            ? parsed.calorieActivity
            : "moderate",
      }
      return cachedProfile
    }

    // One-time migration from earlier Blood Pressure localStorage key if present, then remove duplicate key
    const legacyRaw = window.localStorage.getItem(LEGACY_BP_STORAGE_KEY)
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw)
      const migrated: VitalsProfileData = {
        ...DEFAULT_PROFILE,
        age: typeof legacy?.age === "string" || typeof legacy?.age === "number" ? String(legacy.age) : "",
        sex: legacy?.sex === "male" || legacy?.sex === "female" ? legacy.sex : "",
      }
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(migrated))
      window.localStorage.removeItem(LEGACY_BP_STORAGE_KEY)
      cachedProfile = migrated
      return migrated
    }
  } catch {
    // Ignore storage read errors
  }

  cachedProfile = DEFAULT_PROFILE
  return DEFAULT_PROFILE
}

export function updateSharedVitalsProfile(patch: Partial<VitalsProfileData>): VitalsProfileData {
  const current = readProfileFromStorage()
  const next: VitalsProfileData = { ...current, ...patch }
  cachedProfile = next
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next))
      window.localStorage.removeItem(LEGACY_BP_STORAGE_KEY)
    } catch {
      // Ignore storage write errors
    }
  }
  listeners.forEach((fn) => fn(next))
  return next
}

export function useVitalsProfile() {
  const [profile, setProfile] = useState<VitalsProfileData>(DEFAULT_PROFILE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setProfile(readProfileFromStorage())
    setHydrated(true)
    const listener: Listener = (next) => setProfile(next)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const updateProfile = useCallback((patch: Partial<VitalsProfileData>) => {
    updateSharedVitalsProfile(patch)
  }, [])

  const parsedAge = (() => {
    const t = profile.age.trim()
    if (!t) return null
    const n = Number(t)
    if (!Number.isFinite(n) || n < 0 || n > 125) return null
    return Math.floor(n)
  })()

  const heightInches = (() => {
    if (profile.heightUnit === "cm") {
      const cm = Number(profile.heightCm.trim())
      if (!Number.isFinite(cm) || cm < 30 || cm > 275) return null
      return cm / 2.54
    }
    const ftStr = profile.heightFt.trim()
    const inStr = profile.heightIn.trim()
    if (!ftStr && !inStr) return null
    const ft = ftStr ? Number(ftStr) : 0
    const inch = inStr ? Number(inStr) : 0
    if (!Number.isFinite(ft) || !Number.isFinite(inch) || ft < 0 || inch < 0) return null
    const total = ft * 12 + inch
    if (total < 12 || total > 108) return null
    return total
  })()

  const heightMeters = heightInches !== null ? heightInches * 0.0254 : null

  return {
    profile,
    hydrated,
    updateProfile,
    parsedAge,
    heightInches,
    heightMeters,
  }
}

// Zero-egress local fallback context map for Glucose entries logged without a context
type CtxListener = (map: Record<string, GlucoseContextType>) => void
const ctxListeners = new Set<CtxListener>()
let cachedCtxMap: Record<string, GlucoseContextType> | null = null

function readGlucoseCtxOverrides(): Record<string, GlucoseContextType> {
  if (typeof window === "undefined") return {}
  if (cachedCtxMap) return cachedCtxMap
  try {
    const raw = window.localStorage.getItem(GLUCOSE_CTX_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object") {
        cachedCtxMap = parsed
        return parsed
      }
    }
  } catch {
    // Ignore
  }
  cachedCtxMap = {}
  return {}
}

export function useGlucoseContextOverrides() {
  const [overrides, setOverrides] = useState<Record<string, GlucoseContextType>>({})

  useEffect(() => {
    setOverrides(readGlucoseCtxOverrides())
    const l: CtxListener = (next) => setOverrides(next)
    ctxListeners.add(l)
    return () => {
      ctxListeners.delete(l)
    }
  }, [])

  const setOverrideForEntry = useCallback((entryKey: string, ctx: GlucoseContextType) => {
    const next = { ...readGlucoseCtxOverrides(), [entryKey]: ctx }
    cachedCtxMap = next
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(GLUCOSE_CTX_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore
      }
    }
    ctxListeners.forEach((fn) => fn(next))
  }, [])

  return { overrides, setOverrideForEntry }
}
