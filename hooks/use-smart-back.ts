"use client"

import { useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

const STACK_KEY = "slh_health_nav_stack"
const MAX_STACK = 40

function readStack(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(STACK_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStack(stack: string[]) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-MAX_STACK)))
  } catch {
    // ignore storage errors
  }
}

/**
 * Tracks in-app navigation history in sessionStorage (only inside useEffect after mount
 * to avoid hydration mismatches) and provides smartBack(fallbackUrl) for Health pages.
 *
 * - When in-app history exists, calls router.back() to return to the exact previous page/tab.
 * - When opened directly (refresh, new tab, deep link) with no prior in-app entry,
 *   navigates to fallbackUrl via router.replace/push so Back never leaves the app.
 */
export function useSmartBack() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams?.toString() || ""
  const currentUrl = query ? `${pathname}?${query}` : pathname

  useEffect(() => {
    // Detect if this page load was a hard reload (reset in-app stack so Back uses safe fallback)
    const navEntries = performance.getEntriesByType?.("navigation") as PerformanceNavigationTiming[] | undefined
    const isReload = navEntries?.[0]?.type === "reload"
    const reloadHandledKey = "slh_reload_handled_ts"
    const navStart = String(navEntries?.[0]?.startTime ?? "")

    let stack = readStack()
    if (isReload && sessionStorage.getItem(reloadHandledKey) !== navStart) {
      sessionStorage.setItem(reloadHandledKey, navStart)
      stack = [currentUrl]
      writeStack(stack)
      return
    }

    if (stack.length === 0) {
      writeStack([currentUrl])
      return
    }

    const top = stack[stack.length - 1]
    if (top === currentUrl) return

    // If user hit browser Back and landed on the previous item in our stack, pop top
    if (stack.length >= 2 && stack[stack.length - 2] === currentUrl) {
      writeStack(stack.slice(0, -1))
      return
    }

    writeStack([...stack, currentUrl])
  }, [currentUrl])

  const smartBack = useCallback(
    (fallbackUrl: string) => {
      const stack = readStack()
      if (stack.length > 1) {
        // Pop current entry; browser Back will land on stack[stack.length - 2]
        writeStack(stack.slice(0, -1))
        router.back()
        return
      }
      // No in-app history (direct open / refresh / deep link): go to safe parent fallback
      writeStack([fallbackUrl])
      router.replace(fallbackUrl, { scroll: false })
    },
    [router]
  )

  return { smartBack, currentUrl }
}
