"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Login from "@/components/login"
import PinAuthScreen from "@/components/security/pin-auth-screen"
import { useAuth } from "@/components/auth-provider"
import { useVault } from "@/hooks/use-vault"

import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Dashboard from "@/components/dashboard"
import Passwords from "@/components/passwords"
import PersonalInfo from "@/components/personal-info"
import FinancialCards from "@/components/financial-cards"
import GeneratePassword from "@/components/generate-password"
import Settings from "@/components/settings"
import PlaceholderPage from "@/components/placeholder-page"
import ErrorBoundary from "@/components/error-boundary"
import UserSettings from "@/components/user-settings"
import SecureFileStorage from "@/components/secure-file-storage"
import HealthInsurance from "@/components/health-insurance"
import SecurityAudit from "@/components/security-audit"
import HealthRecords from "@/components/health-records"
import Medications from "@/components/medications"
import HealthDiary from "@/components/health-diary"
import Vehicles from "@/components/vehicles"
import Business from "@/components/business"
import Assets from "@/components/assets"
import HealthPortals from "@/components/health-portals"
import Doctors from "@/components/doctors"
import DigitalLife from "@/components/digital-life"
import Diary from "@/components/diary"
import Knowledge from "@/components/knowledge"
import Travel from "@/components/travel"
import Goals from "@/components/goals"
import BudgetManager from "@/components/budget-manager"
import SubDashboard from "@/components/sub-dashboard"
import MediaVault from "@/components/media-vault"
import VehicleDocs from "@/components/vehicle-docs"
import MaintenanceLogs from "@/components/maintenance-logs"
import Subscriptions from "@/components/subscriptions"
import EnergyMood from "@/components/energy-mood"
import SmartBills from "@/components/smart-bills"
import TaskArchitect from "@/components/task-architect"
import { sidebarSections } from "@/lib/sidebar-config"
import HelpModal from "@/components/modals/help-modal"
import SecureNotes from "@/components/secure-notes"
import SecureDatabase from "@/components/secure-database/secure-database"
import { Minimize } from "lucide-react"

function HomeContent() {
  // Security audit data (Mock for now, needs real calculation later)
  const [securityAuditData, setSecurityAuditData] = useState({
    score: 36,
    reused: 138,
    lastChange: "11 months ago",
    passwordsData: [],
  })

  // Security & Settings State
  const [autoLockTimeout, setAutoLockTimeout] = useState(30)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Theme state
  const [theme, setTheme] = useState("dark")

  // 1. Initial State
  const searchParams = useSearchParams()
  const router = useRouter()
  // Ensure we initialize exactly to the desired start state to avoid flicker/loops
  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== "undefined") {
      const pageParam = new URLSearchParams(window.location.search).get("page")
      if (pageParam) return pageParam
      const savedStartup = localStorage.getItem("hub_startup_page")
      if (savedStartup) return savedStartup
    }
    return "dashboard"
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpInitialPage, setHelpInitialPage] = useState<string | undefined>(undefined)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [startupPage, setStartupPage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("hub_startup_page") || "dashboard"
    }
    return "dashboard"
  })

  // Swipe-to-open sidebar gesture
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = Math.abs(touch.clientY - touchStartY.current)

    // Allow more vertical wobble for angled swipes
    if (deltaY > 80) return

    // Open sidebar: swipe right starting within 80px of the left edge, only 40px travel needed
    if (deltaX > 40 && touchStartX.current < 80) {
      setSidebarOpen(true)
    }
    // Close sidebar: swipe left when open
    else if (deltaX < -40 && sidebarOpen) {
      setSidebarOpen(false)
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  // Auth from Context
  const { user, loading: authLoading, signOut, isLocked, setIsLocked } = useAuth()

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // -- Navigation History & Scroll Memory --
  const [navHistory, setNavHistory] = useState<string[]>([])
  const scrollPositions = useRef<Record<string, number>>({})

  const handleNavigate = (page: string) => {
    if (page === activePage) return
    const mainEl = document.getElementById("main-scroll-container")
    if (mainEl && typeof window !== "undefined") scrollPositions.current[activePage] = mainEl.scrollTop
    setNavHistory(prev => [...prev, activePage])
    setActivePage(page)
    router.push(`/?page=${page}`, { scroll: false })
  }

  const handleBack = () => {
    const mainEl = document.getElementById("main-scroll-container")
    if (mainEl && typeof window !== "undefined") scrollPositions.current[activePage] = mainEl.scrollTop
    
    if (navHistory.length === 0) {
      setActivePage("dashboard")
      router.push("/?page=dashboard", { scroll: false })
      return
    }
    const newHistory = [...navHistory]
    const prevPage = newHistory.pop()
    setNavHistory(newHistory)
    if (prevPage) {
      setActivePage(prevPage)
      router.push(`/?page=${prevPage}`, { scroll: false })
    }
  }

  // Restore scroll positions when activePage changes
  useEffect(() => {
    if (typeof window === "undefined") return
    const pos = scrollPositions.current[activePage] || 0
    
    // Use a slightly longer sequence for complex pages
    const restore = () => {
      const mainEl = document.getElementById("main-scroll-container")
      if (mainEl) {
        mainEl.scrollTo({ top: pos, behavior: "instant" })
        return true
      }
      return false
    }

    // Attempt 1: Immediate
    restore()

    // Attempt 2: Short delay
    const tm1 = setTimeout(restore, 50)
    
    // Attempt 3: Medium delay (most reliable for complex lists)
    const tm2 = setTimeout(restore, 250)

    // Attempt 4: Safety catch for very slow renders
    const tm3 = setTimeout(restore, 600)
    
    return () => {
      clearTimeout(tm1)
      clearTimeout(tm2)
      clearTimeout(tm3)
    }
  }, [activePage])

  // Restore scroll positions after closing Help Modal
  const lastScrollHelp = useRef(0)
  useEffect(() => {
    if (typeof window === "undefined") return
    const mainEl = document.getElementById("main-scroll-container")
    if (!mainEl) return
    
    if (helpOpen) {
      lastScrollHelp.current = mainEl.scrollTop
    } else {
      const tm = setTimeout(() => {
        mainEl.scrollTo({ top: lastScrollHelp.current, behavior: "instant" })
      }, 50)
      return () => clearTimeout(tm)
    }
  }, [helpOpen])

  // 2. CONSOLIDATED STARTUP & NAVIGATION EFFECT
  useEffect(() => {
    if (authLoading) return

    const pageParam = searchParams.get("page")
    const savedStartup = localStorage.getItem("hub_startup_page") || "dashboard"
    const isRecovery = (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) || searchParams.get('type') === 'recovery'
    
    // Sync local state for Settings UI
    if (savedStartup !== startupPage) setStartupPage(savedStartup)

    // A. Unified Landing Logic (Startup preference vs URL sync vs Session Override)
    let forcePage = null
    if (typeof window !== 'undefined') {
      forcePage = sessionStorage.getItem('slh_target_page')
      if (forcePage) sessionStorage.removeItem('slh_target_page')
    }

    const isNavigated = navHistory.length > 0
    const desiredPage = forcePage || pageParam || (isNavigated || isRecovery ? "dashboard" : savedStartup)

    if (desiredPage !== activePage && !isLocked && user) {
      console.log(`🚀 Navigating to: ${desiredPage} (Context: ${forcePage ? 'Session' : pageParam ? 'URL' : 'Startup'})`)
      const mainEl = document.getElementById("main-scroll-container")
      if (mainEl && typeof window !== "undefined") scrollPositions.current[activePage] = mainEl.scrollTop
      setActivePage(desiredPage)
      
      // If we landed on a non-root page via startup, update URL to match
      if (!pageParam && desiredPage !== "dashboard") {
        router.push(`/?page=${desiredPage}`)
      }
    }

    // C. Reset history on lock to ensure startup preference applies on next unlock
    if (isLocked && navHistory.length > 0) {
      setNavHistory([])
    }

    // D. Clean URL tokens while preserving page (SKIP if recovery flow is active)
    if (!isRecovery && typeof window !== 'undefined' && (searchParams.get('access_token') || searchParams.get('refresh_token'))) {
      const cleanParams = new URLSearchParams(window.location.search)
      cleanParams.delete('access_token')
      cleanParams.delete('refresh_token')
      const newQuery = cleanParams.toString()
      window.history.replaceState({}, '', `/${newQuery ? '?' + newQuery : ''}`)
    }
  }, [user, isLocked, authLoading, searchParams, activePage, startupPage, navHistory.length])

  const [securitySettings, setSecuritySettings] = useState<Record<string, { isLocked: boolean, pin: string }>>({})
  const [unlockedModules, setUnlockedModules] = useState<string[]>([])
  const [mockSettings, setMockSettings] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("hub_mock_settings")
        if (saved) return JSON.parse(saved)
      } catch (e) {}
      // Default to true for demo experience if no settings exist yet
      return { 
        "type-health-records": true, 
        "passwords": true, 
        "type-goals": true, 
        "type-tasks": true,
        "type-subscriptions": true,
        "type-budget": true
      }
    }
    return {}
  })

  // Load security & mock settings on mount, update on activePage change, and listen for live updates
  useEffect(() => {
    const handleStorage = () => {
      try {
        const savedSec = localStorage.getItem("hub_security_settings")
        if (savedSec) setSecuritySettings(JSON.parse(savedSec))
        
        const savedMocks = localStorage.getItem("hub_mock_settings")
        if (savedMocks) setMockSettings(JSON.parse(savedMocks))
      } catch (e) {
        console.error("Failed to load settings", e)
      }
    }

    const handleTimeoutSync = (e: any) => {
      let timeoutVal: number | null = null;
      if (e.detail?.timeout !== undefined) {
        timeoutVal = parseFloat(e.detail.timeout);
      } else {
        const saved = localStorage.getItem("auto_lock_timeout");
        if (saved && saved !== "disabled") {
          timeoutVal = parseFloat(saved);
        }
      }
      
      if (timeoutVal !== null && !isNaN(timeoutVal)) {
        setAutoLockTimeout(timeoutVal);
      }
    }

    handleStorage()
    handleTimeoutSync({ detail: {} }) // Initial load for timeout
    
    window.addEventListener("hub_security_settings_changed", handleStorage)
    window.addEventListener("autoLockTimeoutChanged", handleTimeoutSync as EventListener)
    window.addEventListener("storage", handleStorage) // Pick up hub_mock_settings
    
    return () => {
      window.removeEventListener("hub_security_settings_changed", handleStorage)
      window.removeEventListener("autoLockTimeoutChanged", handleTimeoutSync as EventListener)
      window.removeEventListener("storage", handleStorage)
    }
  }, [activePage])


  // Data from Supabase Hook
  const {
    records,
    items,
    folders,
    loading: vaultLoading,
    addItem,
    addFolder,
    updateItem,
    updateFolder,
    deleteItem,
    bulkAddItems, // Destructure bulkAddItems
    refresh
  } = useVault()
  // Note: We need to adapt the setRecords for legacy components if they rely on it heavily,
  // OR update the components to use specific handlers.
  // For now, we will create a wrapper "setRecords" that logs a warning or tries to map logic.
  // Ideally, we'd update Dashboard/Passwords to take specific handlers.

  // Temporary bridge: Some components overwrite "records" state directly.
  // We need to pass the real handlers to them. 
  // Let's modify the props passed to children to use the new handlers.

  // Handle global refresh events (from deep components like Settings optimized loops)
  useEffect(() => {
    const handleRefresh = () => {
      console.log("🔄 Global vault refresh triggered")
      refresh()
    }
    window.addEventListener('vault-refresh', handleRefresh)
    return () => window.removeEventListener('vault-refresh', handleRefresh)
  }, [refresh])

  // Apply theme to document body
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode")
      document.body.classList.remove("dark-mode")
    } else {
      document.body.classList.add("dark-mode")
      document.body.classList.remove("light-mode")
    }
  }, [theme])

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Handle logout
  const handleLogout = async () => {
    setNavHistory([])
    setActivePage("dashboard")
    scrollPositions.current = {} // Reset scroll memory on logout
    if (typeof window !== 'undefined' && localStorage.getItem('biometric_enabled') === 'true') {
      setIsLocked(true)
      router.push("/")
    } else {
      await signOut()
      router.push("/")
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  // Render login page if not authenticated or locked
  if (!user || isLocked) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      }>
        <Login isUnlockMode={isLocked} />
      </Suspense>
    )
  }

  // Inject handlers into components
  // We will need to update Dashboard and Passwords to accept `addItem` etc instead of `setRecords`
  // But for this step, we'll pass them as extra props and rely on `records` being the source of truth.

  const commonProps = {
    records,
    items,
    folders,
    addItem,
    addFolder,
    updateItem,
    updateFolder,
    deleteItem,
    bulkAddItems,
    autoLockTimeout,
    setAutoLockTimeout,
    twoFactorEnabled,
    setTwoFactorEnabled,
    startupPage,
    setStartupPage,
    refresh,
    theme,
    toggleTheme,
    setActivePage: handleNavigate, // Use history-aware navigation
    setRecords: () => console.warn("Direct setRecords not supported in Supabase mode"), // Placeholder
    onOpenHelp: (targetId?: string) => {
      if (targetId) setHelpInitialPage(targetId)
      else setHelpInitialPage(undefined)
      setHelpOpen(true)
    },
    isFullscreen,
    setIsFullscreen,
    mockSettings // Pass down to modules
  }




  // Render active page based on state
  const renderActivePage = () => {
    // Check lock status
    const lockConfig = securitySettings[activePage]
    if (lockConfig?.isLocked && !unlockedModules.includes(activePage)) {
      return (
        <PinAuthScreen
          moduleName={activePage.replace('type-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          hashedPin={lockConfig.pin}
          theme={theme}
          onSuccess={() => setUnlockedModules(prev => [...prev, activePage])}
          onCancel={handleBack} // Go back to previous page on cancel
        />
      )
    }

    switch (activePage) {
      case "dashboard":
        return <Dashboard {...commonProps} securitySettings={securitySettings} />
      case "passwords":
        return <Passwords {...commonProps} />
      case "personal-info":
        return <PersonalInfo {...commonProps} />
      case "financial-cards":
        return <FinancialCards {...commonProps} />
      case "generate-password":
        return <GeneratePassword />
      case "secure-database":
        return <SecureDatabase onOpenHelp={commonProps.onOpenHelp} />
      case "settings":
        return <Settings {...commonProps} />
      case "user-settings":
        return <UserSettings />
      case "secure-file-storage":
        return <SecureFileStorage {...commonProps} />
      case "security-audit":
        return (
          <SecurityAudit
            records={records}
            securityAuditData={securityAuditData}
            setSecurityAuditData={setSecurityAuditData}
          />
        )
      // New Record Types Routing
      case "type-health-records":
        return <HealthRecords key="type-health-records" {...commonProps} initialTab="dashboard" />
      case "type-vitals":
        return <HealthRecords key="type-vitals" {...commonProps} initialTab="vitals" />
      case "type-medications":
        return <HealthRecords key="type-medications" {...commonProps} initialTab="meds" />
      case "type-health-ai":
        return <HealthRecords key="type-health-ai" {...commonProps} initialTab="ai" />
      case "type-health-diary":
        return <HealthDiary {...commonProps} />
      case "type-energy-mood":
        return <EnergyMood {...commonProps} />
      case "type-health-portals":
        return <HealthPortals {...commonProps} />
      case "type-doctors":
        return <Doctors {...commonProps} />
      case "type-medical":
        return (
          <HealthInsurance
            records={records}
            addItem={addItem}
            updateItem={updateItem}
            deleteItem={deleteItem}
            theme={theme}
          />
        )
      case "type-logins":
        return <Passwords {...commonProps} initialCategoryFilter="Logins" />
      case "financial-cards":
      case "type-payment-cards":
        return <FinancialCards {...commonProps} />
      case "type-contacts":
        return <PersonalInfo {...commonProps} />
      case "type-addresses":
        return <Passwords {...commonProps} initialCategoryFilter="Addresses" />
      case "type-bank-accounts":
        return <Passwords {...commonProps} initialCategoryFilter="Bank Accounts" />
      case "type-drivers-licenses":
        return <Passwords {...commonProps} initialCategoryFilter="Driver's Licenses" />
      case "type-passports":
        return <Passwords {...commonProps} initialCategoryFilter="Passports" />
      case "type-identity-cards":
        return <Passwords {...commonProps} initialCategoryFilter="Identity Cards" />
      case "type-medical":
        return <Passwords {...commonProps} initialCategoryFilter="Health Insurance" />

      // Vehicles
      case "type-vehicles":
        return <Vehicles {...commonProps} />
      case "type-vehicle-docs":
        return <VehicleDocs {...commonProps} />
      case "type-maintenance":
        return <MaintenanceLogs {...commonProps} />

      // Business
      case "type-business":
      case "type-clients":
        return <Business {...commonProps} />

      // Assets
      case "type-assets":
        return <Assets {...commonProps} />
      case "type-budget":
        return <BudgetManager {...commonProps} />
      case "type-bills":
        return <SmartBills {...commonProps} />

      // Digital Life
      case "type-digital-life":
      case "type-social":
      case "type-social-audit":
        return <DigitalLife {...commonProps} initialTab={activePage === "type-social-audit" ? "audit" : "dashboard"} />
      case "type-diary":
        return <Diary {...commonProps} />

      // Subscriptions
      case "type-subscriptions":
        return <Subscriptions records={records} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} theme={theme} onOpenHelp={commonProps.onOpenHelp} />


      // Knowledge
      case "type-knowledge":
        return <Knowledge {...commonProps} />

      // Media
      case "type-media":
        return <MediaVault {...commonProps} />

      // Travel
      case "type-travel":
        return <Travel {...commonProps} />
      // type-passports is already handled below, keep it simple for now or override it.
      // If I want the Travel Hub to handle passports, I should move the router case up or remove the below one.
      // For now, I will let type-passports go to the specific list view as keys, unless the user clicks "Travel Hub".
      // But wait, in sidebar I used `type-passports` under Travel.
      // Let's redirect `type-passports` to `Travel` if we want the hub experience, OR keep it as a password list.
      // The user said "Travel & Mobility... Passport info".
      // I'll leave type-passports mapping to the Passwords list for now as it's consistent with existing behavior, 
      // For now, I will leave type-passports mapping to the Passwords list for now as it's consistent with existing behavior, 
      // but I'll add `type-travel` for the hub.

      // Goals
      case "type-goals":
        return <Goals {...commonProps} />
      case "type-habits":
        return <Goals {...commonProps} initialTab="habits" />
      case "type-tasks":
        return <TaskArchitect {...commonProps} />

      case "type-ssh-keys":
        return <Passwords {...commonProps} initialCategoryFilter="SSH Keys" />
      case "type-databases":
        return <Passwords {...commonProps} initialCategoryFilter="Databases" />
      case "type-servers":
        return <Passwords {...commonProps} initialCategoryFilter="Servers" />
      case "type-software-licenses":
        return <Passwords {...commonProps} initialCategoryFilter="Software Licenses" />
      case "type-secure-notes":
        return <SecureNotes {...commonProps} />

      // Global Filters
      case "favorites":
        return <Passwords {...commonProps} showAllTypes={true} initialFavoriteFilter={true} />
      case "trash":
      case "deleted":
        return <Passwords {...commonProps} showAllTypes={true} initialArchivedFilter={true} />
      case "all-items":
      case "all":
        return <Passwords {...commonProps} showAllTypes={true} />

      default:
        // Handle Section Dashboards
        if (activePage.startsWith('section-')) {
          const sectionId = activePage.replace('section-', '')
          const section = sidebarSections.find(s => s.id === sectionId)
          if (section) {
            return (
              <SubDashboard
                section={section}
                records={records}
                setActivePage={handleNavigate}
                theme={theme}
                onOpenHelp={commonProps.onOpenHelp}
              />
            )
          }
        }

        return <PlaceholderPage title={activePage} />
    }
  }

  return (
    <ErrorBoundary>
      <div
        className={`flex flex-col h-screen overflow-hidden ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-[#1a1a1a] text-white"} ${isFullscreen ? 'overscroll-none select-none touch-pan-y' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header is ALWAYS visible — even in fullscreen mode */}
        <Header
          onLogout={handleLogout}
          onLock={() => setIsLocked(true)}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={handleNavigate}
          onBack={handleBack}
          theme={theme}
          toggleTheme={toggleTheme}
          activePage={activePage}
          onOpenHelp={() => commonProps.onOpenHelp(activePage)}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
        />
        <div className={`flex flex-1 overflow-hidden pt-16`}>
          {/* Sidebar always rendered so hamburger menu works in fullscreen mode too */}
          <Sidebar
            activePage={activePage}
            setActivePage={handleNavigate}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            theme={theme}
            onOpenHelp={commonProps.onOpenHelp}
          />
          <main id="main-scroll-container" className={`flex-1 overflow-y-auto custom-scrollbar h-full ${isFullscreen ? 'p-0 overscroll-contain' : 'p-4 md:p-6'}`}>
            {renderActivePage()}
          </main>
        </div>
        <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} theme={theme} initialPageId={helpInitialPage || activePage} />
      </div>
    </ErrorBoundary>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}

