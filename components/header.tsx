"use client"

import { useState } from "react"
import { Lock, Moon, Sun, User, Menu, ChevronDown, ArrowLeft, Settings, Maximize, Minimize, HelpCircle, Shield } from "lucide-react"

import { useAuth } from "./auth-provider"
import Logo from "./logo"

interface HeaderProps {
  onLogout: () => void
  onLock: () => void
  toggleSidebar: () => void
  onNavigate: (page: string) => void
  onBack: () => void
  theme: string
  toggleTheme: () => void
  activePage: string
  onOpenHelp: () => void
  isFullscreen: boolean
  setIsFullscreen: (val: boolean) => void
}

export default function Header({ 
  onLogout, 
  onLock, 
  toggleSidebar, 
  onNavigate, 
  onBack, 
  theme, 
  toggleTheme, 
  activePage, 
  onOpenHelp,
  isFullscreen,
  setIsFullscreen
}: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { user } = useAuth()

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    
    // Also try browser-level fullscreen for better immersion if possible
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }

  // Get display name from user metadata or fallback to email username
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
  const email = user?.email || "No email"

  return (
    <header
      className={`fixed top-0 left-0 right-0 ${theme === "light" ? "bg-white shadow-md" : "bg-[#2a2a2a] shadow-md"} z-20`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className={`mr-3 ${theme === "light" ? "text-gray-800 hover:text-[#007bff]" : "text-white hover:text-[#007bff]"}`}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          {activePage !== "dashboard" && (
            <button
              onClick={onBack}
              className={`mr-3 flex items-center ${theme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-300 hover:text-white"}`}
              title="Go Back"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
          )}

          <div className="flex items-center">
            <Logo
              size="sm"
              className="mr-2 cursor-pointer"
              onClick={() => onNavigate("dashboard")}
              showText={false}
            />
            <h1 className={`text-lg md:text-xl font-bold ${theme === "light" ? "text-gray-800" : "text-white"}`}>Secure Life Hub</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={onOpenHelp}
            className={`${theme === "light" ? "text-gray-800 hover:text-blue-500" : "text-white hover:text-blue-400"} transition-colors`}
            aria-label="Help"
            title="App Manual & Help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => onNavigate("settings")}
            className={`${theme === "light" ? "text-gray-800 hover:text-[#007bff]" : "text-white hover:text-[#007bff]"}`}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className={`${theme === "light" ? "text-gray-800 hover:text-[#007bff]" : "text-white hover:text-[#007bff]"}`}
            aria-label="Toggle Full Screen"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleTheme}
            className={`${theme === "light" ? "text-gray-800 hover:text-[#007bff]" : "text-white hover:text-[#007bff]"}`}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center space-x-1 ${theme === "light" ? "text-gray-800 hover:text-[#007bff]" : "text-white hover:text-[#007bff]"}`}
            >
              <div className="bg-purple-600 rounded-full p-1">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden lg:flex flex-col items-start max-w-[100px]">
                <span className="text-xs font-bold truncate w-full">{displayName}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
            {userMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 ${theme === "light" ? "bg-white shadow-xl border border-gray-100" : "bg-[#1a1a1a] shadow-2xl border border-white/5"} rounded-xl py-2 z-50`}
              >
                <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5 mb-1 lg:hidden">
                  <p className="text-xs font-bold truncate">{displayName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{email}</p>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    onNavigate("settings")
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium ${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/5 text-gray-300'}`}
                >
                  Settings & Account
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    onLock()
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-bold text-blue-500 hover:bg-blue-500/10 transition-colors flex items-center gap-2`}
                >
                  <Lock className="h-4 w-4" /> Lock Vault
                </button>
                <button
                  onClick={onLogout}
                  className={`w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors`}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
