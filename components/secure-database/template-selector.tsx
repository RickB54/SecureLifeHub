"use client"

import { useState } from "react"
import { X, Search, Database as DatabaseIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database } from "@/types/secure-database"
import { defaultTemplates } from "./templates"

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (template: Database) => void
  existingDatabases: Database[]
}

export function TemplateSelector({ isOpen, onClose, onSelect, existingDatabases }: TemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Combine user databases and default templates for the selection
  const allAvailableTemplates = [
    ...existingDatabases.map(db => ({ ...db, id: db.id || db.title, isUserDb: true })),
    ...defaultTemplates.filter(t => !existingDatabases.some(ed => ed.title === t.title)).map(t => ({ ...t, id: t.title, isUserDb: false }))
  ]

  const filteredTemplates = allAvailableTemplates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.fields.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!isOpen) return null

  const handleConfirm = () => {
    const selected = allAvailableTemplates.find(t => t.id === selectedId)
    if (selected) {
      // Create a clean copy without records for the template
      const templateCopy: Database = {
        ...selected,
        id: undefined, // Let the system generate a new one
        records: [], // Templates shouldn't carry over data
        title: `Copy of ${selected.title}`
      }
      onSelect(templateCopy)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-blue-500/5 to-transparent flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Use Database as Template</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-sm">
              Select a blueprint to use as a template. You'll be able to modify all fields in the architect before finalizing.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5">
            <X className="h-6 w-6 text-gray-500" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-8 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="SEARCH BLUEPRINTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all uppercase tracking-widest placeholder:text-gray-700"
            />
          </div>
        </div>

        {/* Templates List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2 px-4">
            {filteredTemplates.map((template) => {
              const isSelected = selectedId === template.id
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedId(template.id || null)}
                  className={`w-full group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 text-left
                    ${isSelected 
                      ? 'bg-blue-600/10 border-blue-500/30' 
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                    }`}
                >
                  <div className={`mt-1 shrink-0 p-1 rounded-full border-2 transition-colors
                    ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-white/10'}`}>
                    {isSelected ? <CheckCircle2 className="h-3 w-3 text-white" /> : <div className="h-3 w-3" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-black uppercase italic tracking-tight ${isSelected ? 'text-blue-400' : 'text-gray-200'}`}>
                        {template.title}
                      </h4>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                        {template.fields.length} Fields
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed line-clamp-2 uppercase tracking-tight opacity-60">
                      Fields: {template.fields.map(f => f.name).join(", ")}
                    </p>
                    
                    {template.isUserDb && (
                      <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em]">
                        Your Custom Meta-Structure
                      </span>
                    )}
                  </div>
                </button>
              )
            })}

            {filteredTemplates.length === 0 && (
              <div className="py-20 text-center">
                <DatabaseIcon className="h-12 w-12 text-gray-800 mx-auto mb-4 opacity-20" />
                <p className="text-xs text-gray-600 font-black uppercase tracking-[0.2em]">No Blueprints Found Matching Query</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-black/40 flex items-center justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-widest h-12 px-8 rounded-xl hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId}
            className={`text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-xl shadow-lg transition-all
              ${selectedId 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95' 
                : 'bg-white/5 text-gray-600 cursor-not-allowed opacity-50'
              }`}
          >
            Use as Template
          </Button>
        </div>
      </div>
    </div>
  )
}
