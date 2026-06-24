"use client"

import { useState } from "react"
import { Lock, Clock, Moon, Sun, User, Menu, ChevronDown, ArrowLeft, Settings, Maximize, Minimize, HelpCircle, Shield } from "lucide-react"

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
  const { user, timeLeft } = useAuth()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState)
    
    // Hardware-level fullscreen for better immersion
    if (newState) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen({ navigationUI: 'hide' });
      } else if ((document.documentElement as any).msRequestFullscreen) {
        (document.documentElement as any).msRequestFullscreen({ navigationUI: 'hide' });
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }

  // Get display name from user metadata or fallback to email username
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
  const email = user?.email || "No email"

  return (
    <header
      className={`fixed top-0 left-0 right-0 ${theme === "light" ? "bg-white shadow-md" : "bg-[#2a2a2a] shadow-md"} z-[60]`}
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
              onClick={() => {
                if (activePage === "gdft") {
                  if (window.confirm("Are you sure you want to leave the GDFT app?")) {
                    onBack()
                  }
                } else {
                  onBack()
                }
              }}
              className={`mr-3 flex items-center ${theme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-300 hover:text-white"}`}
              title={activePage === "gdft" ? "Back to SLH App" : "Go Back"}
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium hidden sm:inline">{activePage === "gdft" ? "Exit" : "Back"}</span>
            </button>
          )}

          <div className="flex items-center">
            <Logo
              size="sm"
              className="mr-2 cursor-pointer"
              onClick={() => onNavigate("dashboard")}
              showText={false}
            />
            <h1 className={`text-lg md:text-xl font-bold ${theme === "light" ? "text-gray-800" : "text-white"} transition-all duration-300 ${timeLeft !== null && timeLeft > 0 ? 'hidden md:block' : 'block'}`}>
              Secure Life Hub
            </h1>

            {/* Auto-lock countdown timer - Now in center-left for better visibility */}
            {timeLeft !== null && timeLeft > 0 && (
              <div 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'} ml-3 sm:ml-4 transition-all duration-300 cursor-pointer hover:bg-opacity-20`}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('mousedown')); // Reset timer on click
                }}
                title="Auto-lock Timer (Click to extend)"
              >
                <Clock className="h-3.5 w-3.5" />
                <div className="flex flex-col items-start leading-none pr-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Lock</span>
                  <span className="text-xs font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={onOpenHelp}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all ${theme === "light" ? "text-gray-600 hover:bg-blue-50 hover:text-blue-600" : "text-gray-300 hover:bg-blue-500/10 hover:text-blue-400"}`}
            aria-label="Help"
            title="App Manual & Help"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="text-xs font-bold hidden sm:inline">Help</span>
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

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center space-x-1 ${theme === "light" ? "text-gray-800 hover:text-[#007bff]" : "text-white hover:text-[#007bff]"}`}
            >
              <div className="bg-purple-600 rounded-full p-1">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col items-start min-w-0 leading-none">
                <span className="text-xs font-black truncate max-w-[100px]">{displayName}</span>
                <span className="text-[9px] font-bold text-blue-400 opacity-100 truncate max-w-[100px]">{email}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            
            {userMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 ${theme === "light" ? "bg-white shadow-xl border border-gray-100" : "bg-[#1a1a1a] shadow-2xl border border-white/5"} rounded-xl py-2 z-50`}
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 mb-1">
                  <p className="text-sm font-black text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-blue-400 font-bold break-all opacity-90">{email}</p>
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
