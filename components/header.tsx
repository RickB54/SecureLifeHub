"use client"

import { useState } from "react"
import { Lock, Moon, Sun, User, Menu, ChevronDown, ArrowLeft, Settings, Maximize, Minimize } from "lucide-react"

import { useAuth } from "./auth-provider"

interface HeaderProps {
  onLogout: () => void
  toggleSidebar: () => void
  onNavigate: (page: string) => void
  theme: string
  toggleTheme: () => void
  activePage: string
}

export default function Header({ onLogout, toggleSidebar, onNavigate, theme, toggleTheme, activePage }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { user } = useAuth()

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Get display name from user metadata or fallback to email username
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
  const email = user?.email || "No email"

  return (
    <header
      className={`fixed top-0 left-0 right-0 ${theme === "light" ? "bg-white shadow-md" : "bg-[#2a2a2a] shadow-md"} z-10`}
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
              onClick={() => onNavigate("dashboard")}
              className={`mr-3 flex items-center ${theme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-300 hover:text-white"}`}
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          <div className="flex items-center">
            <Lock className={`h-6 w-6 ${theme === "light" ? "text-gray-800" : "text-white"} mr-2`} />
            <h1 className={`text-xl font-bold ${theme === "light" ? "text-gray-800" : "text-white"}`}>Secure Life Hub</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
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
            title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleTheme}
            className={`${theme === "light" ? "text-gray-800 hover:text-[#007bff]" : "text-white hover:text-[#007bff]"}`}
            aria-label={`Toggle ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center space-x-1 ${theme === "light" ? "text-gray-800 hover:text-[#007bff]" : "text-white hover:text-[#007bff]"}`}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="bg-purple-600 rounded-full p-1">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{displayName}</span>
                <span className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                  {email}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            {userMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 ${theme === "light" ? "bg-white" : "bg-[#333]"} rounded-md shadow-lg py-1 z-20`}
              >
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    onNavigate("user-settings")
                  }}
                  className={`w-full text-left px-4 py-2 ${theme === "light" ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-gray-600"}`}
                >
                  Settings
                </button>
                <button
                  onClick={onLogout}
                  className={`w-full text-left px-4 py-2 text-red-500 ${theme === "light" ? "hover:bg-red-50" : "hover:bg-red-600 hover:text-white"}`}
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

