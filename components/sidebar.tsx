"use client"

import { useState } from "react"
import { ChevronsDown, ChevronsUp, Home, Key, Wand2, CreditCard, User, Settings, ChevronDown, ChevronRight, FileText, Shield, Star, Car, Wrench, Briefcase, Users, Box, Globe, Smartphone, Book, Plane, Target, Image, Trash } from "lucide-react"
import { sidebarSections } from "@/lib/sidebar-config"

interface SidebarProps {
  activePage: string
  setActivePage: (page: string) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  theme: string
}

export default function Sidebar({ activePage, setActivePage, isOpen, setIsOpen, theme }: SidebarProps) {
  // Default expanded state: all false (collapsed) as requested
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: false,
    vault: false,
    'payment-cards': false,
    'vault-advanced': false,
    recordTypes: false,
    healthFitness: false,
    vehicles: false,
    business: false,
    assets: false,
    digitalLife: false,
    knowledge: false,
    travel: false,
    goals: false,
    media: false,
    configuration: false,
  })

  // Check if any section is expanded to determine button state
  const isAnyExpanded = Object.values(expandedSections).some(val => val)

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections],
    })
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
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  // Use imported sections
  const sections = sidebarSections

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#2a2a2a] transition-transform duration-300 ease-in-out z-30 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } h-full border-r border-gray-800 pt-16`}
      >
        <div className="flex flex-col h-full">
          <div className="sticky top-0 bg-[#2a2a2a] z-10 px-6 py-4 border-b border-gray-800 flex justify-end">
            <button
              onClick={toggleAll}
              className={`mr-3 ${theme === "light" ? "text-gray-800 hover:text-[#007bff]" : "text-white hover:text-[#007bff]"}`}
              aria-label="Toggle all sections"
            >
              {isAnyExpanded ? <ChevronsUp className="h-5 w-5" /> : <ChevronsDown className="h-5 w-5" />}
            </button>
          </div>

          <nav className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {sections.map((section) => {
              // @ts-ignore - isTopLevel is a custom property
              const isTopLevel = section.isTopLevel === true

              // For top-level items, render as a single button
              if (isTopLevel && section.items.length === 1) {
                const item = section.items[0]
                return (
                  <div key={section.id} className="mb-2">
                    <button
                      onClick={() => handleNavigation(item.id)}
                      className={`flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium ${activePage === item.id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                        }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </button>
                  </div>
                )
              }

              // For regular sections with dropdowns
              return (
                <div key={section.id} className="mb-6">
                  <div className="flex items-center justify-between w-full mb-2 sticky top-0 bg-[#2a2a2a] py-1">
                    {/* Section Title Link */}
                    <button
                      onClick={() => {
                        handleNavigation(`section-${section.id}`)
                        if (!expandedSections[section.id]) toggleSection(section.id)
                        // Auto-close on mobile when a main section link is clicked
                        if (window.innerWidth < 768) setIsOpen(false)
                      }}
                      className="flex-1 text-left text-gray-400 uppercase text-xs font-semibold hover:text-white transition-colors"
                    >
                      {section.title}
                    </button>

                    {/* Toggle Chevron */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSection(section.id) }}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      {expandedSections[section.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {expandedSections[section.id] && (
                    <ul className="space-y-1 pl-1">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => {
                              handleNavigation(item.id)
                              // Explicitly close sidebar on mobile for sub-items too
                              if (window.innerWidth < 768) setIsOpen(false)
                            }}
                            className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${activePage === item.id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                              }`}
                          >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

