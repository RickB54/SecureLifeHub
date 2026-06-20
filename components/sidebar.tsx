"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronsDown, ChevronsUp, Home, Key, Wand2, CreditCard, User, Settings, ChevronDown, ChevronRight, FileText, Shield, Star, Car, Wrench, Briefcase, Users, Box, Globe, Smartphone, Book, Plane, Target, Image, Trash, HelpCircle } from "lucide-react"
import { sidebarSections } from "@/lib/sidebar-config"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import { toast } from "sonner"
import { useNotesStore } from "@/store/notes"
import { getReminderData } from "./StickyNotes"

// Helper to check if a reminder is currently triggered (for badge count)
const isReminderTriggered = (reminder: ReturnType<typeof getReminderData>) => {
  if (!reminder) return false;
  const now = new Date();
  const [year, month, day] = reminder.date.split('-').map(Number);
  const [hour, minute] = reminder.time.split(':').map(Number);
  const reminderDate = new Date(year, month - 1, day, hour, minute);
  return reminderDate <= now;
};

interface SidebarProps {
  activePage: string
  setActivePage: (page: string) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  theme: string
  onOpenHelp: (targetId?: string) => void
}

export default function Sidebar({ activePage, setActivePage, isOpen, setIsOpen, theme, onOpenHelp }: SidebarProps) {
  // Default expanded state: all false (collapsed) as requested
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: false,
    vault: false,
    healthFitness: false,
    vehicles: false,
    business: false,
    assets: false,
    digitalLife: false,
    goals: false,
    media: false,
    settings: false,
  })

  // Quick Shortcuts State
  const [pinnedItems, setPinnedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("hub_pinned_shortcuts")
      return saved ? JSON.parse(saved) : ["type-medications", "passwords"] // Default pins
    } catch (e) {
      return ["type-medications", "passwords"]
    }
  })

  const [isMobile, setIsMobile] = useState(false)
  const [pendingUnpin, setPendingUnpin] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const isLongPressActive = useRef(false)
  
  const notesStore = useNotesStore();
  const [activeAlarmCount, setActiveAlarmCount] = useState(0);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const triggeredStr = localStorage.getItem('sticky_notes_triggered_reminders') || '[]';
      let triggeredIds: string[] = [];
      try { triggeredIds = JSON.parse(triggeredStr); } catch {}

      let updatedTriggered = false;
      let count = 0;

      notesStore.notes.forEach(note => {
        const reminder = getReminderData(note);
        if (!reminder) return;

        // Parse reminder date and time
        const [year, month, day] = reminder.date.split('-').map(Number);
        const [hour, minute] = reminder.time.split(':').map(Number);
        if (!year || isNaN(hour)) return;
        const reminderDate = new Date(year, month - 1, day, hour, minute);

        if (reminderDate <= now) {
          count++;
          if (!triggeredIds.includes(note.id)) {
            // Trigger notification
            if (reminder.popup !== false) {
              toast({
                title: `🔔 Reminder: ${note.title || 'Untitled Sticky'}`,
                description: note.content.replace(/^[✅⏳⬜❌☐☑]\s*/gm, '').replace(/[\u200B-\u200D\uFEFF]/g, '').substring(0, 100),
                duration: 10000,
              });
            }
            if (reminder.sound !== false) {
              try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                  const ctx = new AudioContextClass();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.type = 'sine';
                  osc.frequency.setValueAtTime(880, ctx.currentTime);
                  gain.gain.setValueAtTime(0.1, ctx.currentTime);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.15);
                  
                  setTimeout(() => {
                    try {
                      const osc2 = ctx.createOscillator();
                      const gain2 = ctx.createGain();
                      osc2.connect(gain2);
                      gain2.connect(ctx.destination);
                      osc2.type = 'sine';
                      osc2.frequency.setValueAtTime(1100, ctx.currentTime);
                      gain2.gain.setValueAtTime(0.1, ctx.currentTime);
                      osc2.start();
                      osc2.stop(ctx.currentTime + 0.15);
                    } catch (e) {}
                  }, 200);
                }
              } catch (e) {}
            }
            
            triggeredIds.push(note.id);
            updatedTriggered = true;

            // Handle repeating rules
            if (reminder.repeat && reminder.repeat !== 'none') {
              let nextDate = new Date(reminderDate);
              if (reminder.repeat === 'daily') {
                nextDate.setDate(nextDate.getDate() + 1);
              } else if (reminder.repeat === 'weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
              } else if (reminder.repeat === 'monthly') {
                nextDate.setMonth(nextDate.getMonth() + 1);
              } else if (reminder.repeat === 'yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
              }
              
              const nextDateStr = nextDate.toISOString().split('T')[0];
              const nextTimeStr = nextDate.toTimeString().split(' ')[0].substring(0, 5);
              const cleanTags = (note.tags || []).filter(t => !t.startsWith('__reminder:'));
              cleanTags.push(`__reminder:${nextDateStr}|${nextTimeStr}|${reminder.repeat}__`);
              
              notesStore.updateNote(note.id, { tags: cleanTags });
              triggeredIds = triggeredIds.filter(id => id !== note.id);
            }
          }
        }
      });

      if (updatedTriggered) {
        localStorage.setItem('sticky_notes_triggered_reminders', JSON.stringify(triggeredIds));
      }
      setActiveAlarmCount(count);
    };

    const interval = setInterval(checkReminders, 15000);
    checkReminders();
    return () => clearInterval(interval);
  }, [notesStore.notes]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check if any section is expanded
  const isAnyExpanded = Object.values(expandedSections).some(val => val)

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections],
    })
  }

  const togglePin = (e: React.MouseEvent | null, id: string) => {
    if (e) e.stopPropagation()
    const newPins = pinnedItems.includes(id)
      ? pinnedItems.filter((p: string) => p !== id)
      : [...pinnedItems, id]
    setPinnedItems(newPins)
    localStorage.setItem("hub_pinned_shortcuts", JSON.stringify(newPins))
  }

  const startLongPress = (id: string) => {
    isLongPressActive.current = false
    longPressTimer.current = setTimeout(() => {
      isLongPressActive.current = true
      setPendingUnpin(id)
      setShowConfirm(true)
      if (window.navigator.vibrate) window.navigator.vibrate(50)
    }, 2000)
  }

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleShortcutClick = (id: string) => {
    if (!isLongPressActive.current) {
      handleNavigation(id)
    }
    isLongPressActive.current = false
  }

  const toggleAll = () => {
    const newState = !isAnyExpanded
    const updated = Object.keys(expandedSections).reduce((acc, key) => {
      acc[key] = newState
      return acc
    }, {} as Record<string, boolean>)
    setExpandedSections(updated)
  }

  const handleNavigation = (page: string) => {
    setActivePage(page)
    setIsOpen(false)
  }

  // Find item by ID helper
  const findItemById = (id: string) => {
    for (const section of sidebarSections) {
      const item = section.items.find(i => i.id === id)
      if (item) return { item, section }
    }
    return null
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[45]"
          style={{ top: 0 }}
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed left-0 w-64 bg-[#1a1a1a] transition-transform duration-300 ease-in-out z-[50] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } border-r border-gray-800 pt-16 shadow-2xl overflow-hidden flex flex-col`}
        style={{ top: 0, height: '100dvh' }}
      >
        <div className="sticky top-0 bg-[#1a1a1a] z-20">
          <div className="px-6 py-4 border-b border-gray-800/50 flex justify-between items-center bg-[#1a1a1a]/95 backdrop-blur-md">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Navigation</span>
            <button
              onClick={toggleAll}
              className={`p-1 rounded-lg transition-all ${theme === "light" ? "text-gray-800 hover:bg-black/5" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
            >
              {isAnyExpanded ? <ChevronsUp className="h-4 w-4" /> : <ChevronsDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Quick Access Section (Sticky) */}
          {pinnedItems.length > 0 && (
            <div className="px-5 py-4 border-b border-gray-800/50 bg-[#1a1a1a]/95 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500/80">Quick Access</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {pinnedItems.map(id => {
                  const data = findItemById(id)
                  if (!data) return null
                  const { item, section } = data
                  const sectionColor = (section as any).color || "blue"

                  const iconColorClasses: Record<string, string> = {
                    blue: "bg-blue-500/20 text-blue-400",
                    purple: "bg-purple-500/20 text-purple-400",
                    emerald: "bg-emerald-500/20 text-emerald-400",
                    orange: "bg-orange-500/20 text-orange-400",
                    rose: "bg-rose-500/20 text-rose-400",
                    amber: "bg-amber-500/20 text-amber-400",
                    indigo: "bg-indigo-500/20 text-indigo-400",
                    cyan: "bg-cyan-500/20 text-cyan-400",
                    pink: "bg-pink-500/20 text-pink-400",
                    teal: "bg-teal-500/20 text-teal-400",
                    violet: "bg-violet-500/20 text-violet-400",
                    gray: "bg-gray-500/20 text-gray-400",
                  }

                  const activeItemClasses: Record<string, string> = {
                    blue: "ring-2 ring-blue-500/50 bg-blue-500/40 text-white",
                    purple: "ring-2 ring-purple-500/50 bg-purple-500/40 text-white",
                    rose: "ring-2 ring-rose-500/50 bg-rose-500/40 text-white",
                    amber: "ring-2 ring-amber-500/50 bg-amber-500/40 text-white",
                  }

                  const isActive = activePage === id

                  return (
                    <div key={`pin-${id}`} className="relative group">
                      <button
                        onPointerDown={() => startLongPress(id)}
                        onPointerUp={endLongPress}
                        onPointerLeave={endLongPress}
                        onClick={() => handleShortcutClick(id)}
                        title={item.label}
                        className={`aspect-square w-full flex flex-col items-center justify-center rounded-2xl transition-all relative ${isActive
                          ? (activeItemClasses[sectionColor] || "ring-2 ring-blue-500/50 bg-blue-500/40 text-white")
                          : (iconColorClasses[sectionColor] || "bg-blue-500/20 text-blue-400 hover:scale-105 active:scale-95")
                          }`}
                      >
                        {item.icon}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <nav className="p-3 overflow-y-auto flex-1 custom-scrollbar space-y-1">

          {sidebarSections.map((section) => {
            const isTopLevel = (section as any).isTopLevel === true
            const sectionColor = (section as any).color || "blue"

            const colorClasses: Record<string, string> = {
              blue: "text-blue-400", purple: "text-purple-400", emerald: "text-emerald-400",
              orange: "text-orange-400", rose: "text-rose-400", amber: "text-amber-400",
              indigo: "text-indigo-400", cyan: "text-cyan-400", pink: "text-pink-400",
              teal: "text-teal-400", violet: "text-violet-400", gray: "text-gray-400",
            }

            const activeBgClasses: Record<string, string> = {
              blue: "bg-blue-600", purple: "bg-purple-600", emerald: "bg-emerald-600",
              orange: "bg-orange-600", rose: "bg-rose-600", amber: "bg-amber-600",
              indigo: "bg-indigo-600", cyan: "bg-cyan-600", pink: "bg-pink-600",
              teal: "bg-teal-600", violet: "bg-violet-600", gray: "bg-gray-600",
            }

            const iconColor = colorClasses[sectionColor] || "text-blue-400"
            const activeBg = activeBgClasses[sectionColor] || "bg-blue-600"

            if (isTopLevel && section.items.length === 1) {
              const item = section.items[0]
              const isActive = activePage === item.id
              return (
                <div key={section.id} className="group relative">
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all ${isActive ? `${activeBg} text-white shadow-lg` : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    <div className={`${isActive ? "text-white" : iconColor} transition-colors`}>{item.icon}</div>
                    <span className="ml-3 font-black uppercase tracking-widest text-[10px]">{item.label}</span>
                  </button>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-[40]">
                    <button
                      onClick={(e) => togglePin(e, item.id)}
                      className={`p-2 transition-all rounded-xl hover:bg-white/10 opacity-100 ${pinnedItems.includes(item.id) ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
                      aria-label={pinnedItems.includes(item.id) ? "Unpin from shortcuts" : "Pin to shortcuts"}
                    >
                      <Star className={`h-5 w-5 ${pinnedItems.includes(item.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              )
            }

            const isSectionActive = activePage === `section-${section.id}`
            const isSubItemActive = section.items.some(i => i.id === activePage)

            return (
              <div key={section.id} className={`mb-2 p-1 rounded-2xl transition-all ${isSectionActive || isSubItemActive ? 'bg-white/5 border border-white/5' : ''}`}>
                <div className="flex items-center justify-between w-full px-4 py-3 bg-[#1a1a1a] rounded-xl border border-white/5 mb-1 shadow-md">
                  <button
                    onClick={() => {
                      handleNavigation(`section-${section.id}`)
                      if (!expandedSections[section.id]) toggleSection(section.id)
                    }}
                    className={`flex-1 text-left uppercase text-[10px] font-black tracking-[0.2em] transition-colors flex items-center gap-3 ${isSectionActive || isSubItemActive ? iconColor : 'text-gray-500 hover:text-white'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isSectionActive || isSubItemActive ? activeBg : 'bg-gray-800'}`}></div>
                    {section.title}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSection(section.id) }}
                    className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${expandedSections[section.id] ? iconColor : 'text-gray-400'} border border-white/10 ml-2`}
                  >
                    {expandedSections[section.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>

                {expandedSections[section.id] && (
                  <ul className="space-y-1 mt-2 px-1">
                    {section.items.map((item) => {
                      const isItemActive = activePage === item.id
                      const isPinned = pinnedItems.includes(item.id)
                      return (
                        <li key={item.id} className="group relative">
                          <button
                            onClick={() => handleNavigation(item.id)}
                            className={`flex items-center w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all ${isItemActive ? `${activeBg} text-white shadow-md` : "text-gray-500 hover:bg-white/5 hover:text-gray-200"}`}
                          >
                            <div className={`${isItemActive ? "text-white" : iconColor} opacity-70 relative`}>
                              {item.icon}
                              {item.id === 'type-sticky-notes' && activeAlarmCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white font-bold ring-1 ring-black">
                                  {activeAlarmCount}
                                </span>
                              )}
                            </div>
                            <span className="ml-3">{item.label}</span>
                          </button>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-[40]">
                            <button
                              onClick={(e) => { e.stopPropagation(); togglePin(e, item.id); }}
                              className={`p-1.5 transition-all rounded-lg hover:bg-white/20 ${isPinned ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-600 opacity-20 group-hover:opacity-100'}`}
                              aria-label={isPinned ? "Unpin shortcut" : "Pin shortcut"}
                            >
                              <Star className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}

          <div className="mt-8 pt-4 border-t border-gray-800/50">
            <button
              onClick={() => onOpenHelp()}
              className={`flex items-center w-full px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/10 transition-all`}
            >
              <HelpCircle className="h-5 w-5" />
              <span className="ml-3">Help & Manual</span>
            </button>
          </div>
        </nav>
      </aside>

      {showConfirm && pendingUnpin && (
        <DeleteConfirmationModal
          onClose={() => {
            setShowConfirm(false)
            setPendingUnpin(null)
          }}
          onConfirm={() => {
            togglePin(null, pendingUnpin)
            setShowConfirm(false)
            setPendingUnpin(null)
            toast.success("Shortcut removed")
          }}
          itemName={`the '${findItemById(pendingUnpin)?.item.label}' shortcut`}
          theme={theme}
        />
      )}
    </>
  )
}

