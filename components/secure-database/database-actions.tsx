"use client"

import {
  Download,
  FileDown,
  FilePlus,
  FileUp,
  Settings,
  Trash2,
  Database as DatabaseIcon,
  Copy,
  LayoutGrid,
  ListTodo,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  RefreshCcw,
  Zap,
  Printer
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Database, Field } from "@/types/secure-database"

interface DatabaseActionsProps {
  database?: Database
  onNewDatabase: () => void
  onUseTemplate: (template: Database) => void
  onDeleteDatabases?: (databaseTitles: string[]) => void
  onRecoverDatabases?: (databasesToRecover: Database[]) => void
  allDatabases: Database[]
  currentDb?: string
  onUpdateDatabase?: (database: Database) => void
  onResetToFactory: () => void
  onOpenHelp?: (id: string) => void
}

export function DatabaseActions({
  database,
  onNewDatabase,
  onUseTemplate,
  onDeleteDatabases,
  onRecoverDatabases,
  allDatabases,
  currentDb,
  onUpdateDatabase,
  onResetToFactory,
  onOpenHelp,
}: DatabaseActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [showCardConfig, setShowCardConfig] = useState(false)
  const DEFAULT_PIN = "1234"

  const handleDangerAction = (action: () => void) => {
    if (pinInput !== DEFAULT_PIN) {
      toast.error("INVALID ACCESS CODE: Security protocol breach detected")
      return
    }
    action()
    setPinInput("")
  }

  const handleExport = () => {
    if (!database) return
    setIsProcessing(true)
    try {
        const data = JSON.stringify(database, null, 2)
        const blob = new Blob([data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `SLH-DB-${database.title}-backup.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Database backup generated successfully")
    } catch (e) {
        toast.error("Failed to generate backup")
    } finally {
        setIsProcessing(false)
    }
  }

  const handleExportCsv = () => {
    if (!database) return
    const headers = database.fields.map((f) => f.name).join(",")
    const rows = database.records.map((record) =>
      database.fields
        .map((field) => {
          const value = record.values[field.name]
          if (Array.isArray(value)) return `"${value.join(", ")}"`
          return `"${value || ""}"`
        })
        .join(","),
    )
    const csv = [headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `SLH-DB-${database.title}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV export complete")
  }

  const handleBackupAll = () => {
    setIsProcessing(true)
    try {
        const data = JSON.stringify(allDatabases, null, 2)
        const blob = new Blob([data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `SLH-Full-Vault-Backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Complete vault backup generated")
    } catch (e) {
        toast.error("Vault backup failed")
    } finally {
        setIsProcessing(false)
    }
  }

  const handleRestore = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e: any) => {
          const file = e.target.files[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = async (event: any) => {
              try {
                  const data = JSON.parse(event.target.result)
                  if (Array.isArray(data)) {
                      await onRecoverDatabases?.(data)
                      toast.success("Vault restored from backup")
                  } else if (data.title && data.fields) {
                      await onRecoverDatabases?.([data])
                      toast.success(`Database '${data.title}' restored`)
                  }
              } catch (err) {
                  toast.error("Invalid backup format")
              }
          }
          reader.readAsText(file)
      }
      input.click()
  }

  const handleToggleFieldOnCard = (fieldName: string) => {
    if (!database || !onUpdateDatabase) return
    
    const currentOnCardCount = database.fields.filter(f => f.showOnCard).length
    const isCurrentlyOnCard = database.fields.find(f => f.name === fieldName)?.showOnCard

    if (!isCurrentlyOnCard && currentOnCardCount >= 9) {
      toast.error("DATA SATURATION: Max limit of 9 sectors reached for card face")
      return
    }

    const updatedFields = database.fields.map(f => {
      if (f.name === fieldName) {
        return { ...f, showOnCard: !f.showOnCard }
      }
      return f
    })
    onUpdateDatabase({ ...database, fields: updatedFields })
    toast.success(`${fieldName} visibility toggled on record card`)
  }

  const actionSections = [
    {
        title: "Configuration",
        items: [
            { id: "new", label: "Create Database", icon: PlusCircle, onClick: () => {
                onNewDatabase()
                toast.info("Initializing Architecture Matrix...")
            }, color: "text-indigo-400", disabled: false, variant: "default" },
            { id: "template", label: "Use Template", icon: Copy, onClick: () => {
                if (database) {
                    onUseTemplate(database)
                    toast.success(`Matrix Architecture '${database.title}' cloned to builder`)
                }
            }, color: "text-blue-400", disabled: !database, variant: "default" },
            { id: "display", label: "Change System PIN", icon: ShieldCheck, onClick: () => toast.info("Security PIN update environment restricted"), color: "text-purple-400", disabled: false, variant: "default" },
            { id: "card-face", label: "Show on front of Card", icon: LayoutGrid, onClick: () => setShowCardConfig(true), color: "text-amber-400", disabled: !database, variant: "default" },
            { id: "todo", label: "Task Integration", icon: ListTodo, onClick: () => {
                toast.info("Task synchronization node active")
            }, color: "text-emerald-400", disabled: false, variant: "default" },
        ]
    },
    {
        title: "Data Management",
        items: [
            { id: "export-csv", label: "Export CSV", icon: FileDown, onClick: handleExportCsv, color: "text-amber-400", disabled: !database, variant: "default" },
            { id: "print-db", label: "Print Database", icon: Printer, onClick: () => {
                window.print()
                toast.success("Routing to print architect")
            }, color: "text-emerald-400", disabled: !database, variant: "default" },
            { id: "backup-one", label: "Backup Database", icon: Download, onClick: handleExport, color: "text-indigo-400", disabled: !database, variant: "default" },
            { id: "backup-all", label: "Backup All Databases", icon: FileUp, onClick: handleBackupAll, color: "text-blue-400", disabled: allDatabases.length === 0, variant: "default" },
            { id: "restore", label: "Restore Database", icon: FileUp, onClick: handleRestore, color: "text-rose-400", disabled: false, variant: "default" },
            { id: "recover", label: "Recover Original DBs", icon: RefreshCcw, onClick: () => {
                onResetToFactory()
                toast.success("Synchronizing cloud blueprints...")
            }, color: "text-indigo-400", disabled: false, variant: "default" },
        ]
    },
    {
        title: "Danger Zone",
        items: [
            { id: "delete", label: "Destroy Database", icon: Trash2, onClick: () => {
                if (database && onDeleteDatabases) {
                    handleDangerAction(() => {
                        if (window.confirm(`CRITICAL WARNING: This will permanently purge '${database.title}' and all its records from the cloud. Continue?`)) {
                            onDeleteDatabases([database.id || database.title])
                            toast.success("Database architecture neutralized")
                        }
                    })
                }
            }, color: "text-rose-600", disabled: !database, variant: "danger" },
            { id: "clear", label: "Delete All Databases", icon: Zap, onClick: () => {
                handleDangerAction(() => {
                    if (window.confirm("OMEGA WARNING: This will erase EVERY database in your vault. This action CANNOT be undone. Proceed?")) {
                        onDeleteDatabases?.(allDatabases.map(db => db.id || db.title))
                        toast.success("Global vault purge complete")
                    }
                })
            }, color: "text-amber-600", disabled: allDatabases.length === 0, variant: "danger" },
        ]
    }
  ]

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
        <div className="p-8 bg-gradient-to-b from-indigo-500/10 to-transparent border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Engine Controls</h2>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                            onOpenHelp?.("secure-database")
                            toast.info("Architectural documentation loading...")
                        }} 
                        className="rounded-xl bg-white/5 border border-white/10 text-indigo-400 hover:text-white transition-all active:scale-95"
                    >
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shadow-2xl animate-pulse">
                        <ShieldCheck className="h-5 w-5 text-indigo-400" />
                    </div>
                </div>
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                Manage your secure data structures, persistence, and system-level operations.
            </p>
        </div>

        <ScrollArea className="flex-1 p-6">
            <div className="max-w-xl mx-auto space-y-8">
                {actionSections.map((section) => (
                    <div key={section.title} className="space-y-4">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                                {section.title}
                            </h3>
                            {section.title === "Danger Zone" && (
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-bold text-rose-500/50 uppercase tracking-widest">Pin Required: 1234</span>
                                        <input 
                                            type="password"
                                            maxLength={4}
                                            value={pinInput}
                                            onChange={(e) => setPinInput(e.target.value)}
                                            placeholder="XXXX"
                                            className="w-16 h-8 bg-black border border-white/5 rounded-lg text-center text-xs font-black tracking-widest focus:border-rose-500/50 outline-none transition-all placeholder:text-white/5"
                                        />
                                    </div>
                                    <p className="text-[8px] text-gray-700 italic mt-1 font-bold">Refer to help for decryption keys</p>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {section.items.map((item) => (
                                <button
                                    key={item.id}
                                    disabled={item.disabled}
                                    onClick={item.onClick}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left cursor-pointer relative
                                        ${item.variant === 'danger' 
                                            ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40' 
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                        } ${item.disabled ? 'opacity-20 grayscale pointer-events-none' : ''}`}
                                >
                                    <div className={`p-2 rounded-xl bg-black/40 group-hover:scale-110 transition-transform ${item.color}`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-200 truncate">{item.label}</p>
                                        <p className="text-[9px] text-gray-600 uppercase font-black truncate">Execute Command</p>
                                    </div>
                                    <div 
                                        className="p-2 rounded-lg bg-white/5 border border-white/5 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-indigo-500/20 hover:border-indigo-500/40 cursor-help"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onOpenHelp?.("database-actions")
                                            toast.info("Deep focus help initiated")
                                        }}
                                    >
                                        <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-8 text-center pb-12">
                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 shadow-2xl backdrop-blur-md">
                        <HelpCircle className="h-4 w-4 text-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Need architectural guidance?</span>
                        <Button 
                            variant="link" 
                            onClick={() => {
                                onOpenHelp?.("secure-database")
                                toast.info("Deep architectural documentation requested")
                            }}
                            className="p-0 h-auto text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-all active:scale-90"
                        >
                            Open Documentation
                        </Button>
                   </div>
                </div>
            </div>
        </ScrollArea>

        <Dialog open={showCardConfig} onOpenChange={setShowCardConfig}>
            <DialogContent className="max-w-md bg-[#0d0d0d] border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-3xl">
                <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-transparent border-b border-white/5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <LayoutGrid className="h-6 w-6 text-indigo-400" />
                            Card Face Architect
                        </DialogTitle>
                        <DialogDescription className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                            Pick any fields to prioritize on the front of the database record card. Limit: 9 sectors for optimal visibility.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                
                <ScrollArea className="max-h-[50vh] p-8">
                    <div className="space-y-4">
                        {database?.fields.map((field) => (
                            <div 
                                key={field.name}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer shadow-sm
                                    ${field.showOnCard ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/2 border-white/5 hover:bg-white/5'}
                                `}
                                onClick={() => handleToggleFieldOnCard(field.name)}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-gray-200">{field.name}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60">{field.type} MATRIX</span>
                                </div>
                                <Checkbox 
                                    checked={field.showOnCard}
                                    className="h-6 w-6 rounded-md data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 border-white/20"
                                />
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                
                <div className="p-6 bg-white/2 border-t border-white/5 flex justify-end">
                    <Button 
                        onClick={() => setShowCardConfig(false)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest px-8 rounded-xl h-10 shadow-lg shadow-indigo-500/40"
                    >
                        Save Configuration
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  )
}
