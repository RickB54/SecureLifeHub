"use client"

import { useState, useEffect } from "react"
import { Plus, X, Layout, Type, Calendar, CheckSquare, List as ListIcon, FileText, Image as ImageIcon, Hash, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database, Field, FieldType } from "@/types/secure-database"

interface FormBuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDatabaseCreate: (database: Database) => void
  onDatabaseUpdate?: (database: Database) => void
  editingDatabase?: Database
  templateDatabase?: Database
}

export function FormBuilder({
  open,
  onOpenChange,
  onDatabaseCreate,
  onDatabaseUpdate,
  editingDatabase,
  templateDatabase,
}: FormBuilderProps) {
  const [title, setTitle] = useState("")
  const [fields, setFields] = useState<Field[]>([{ name: "Title", type: "text" }])
  const [color, setColor] = useState("indigo")
  const [newOptionStates, setNewOptionStates] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    if (open) {
      if (editingDatabase) {
        setFields(JSON.parse(JSON.stringify(editingDatabase.fields)))
        setTitle(editingDatabase.title)
        setColor(editingDatabase.color || "indigo")
      } else if (templateDatabase) {
        setFields(JSON.parse(JSON.stringify(templateDatabase.fields)))
        setTitle(`${templateDatabase.title} (Clone)`)
        setColor(templateDatabase.color || "indigo")
      } else {
        setTitle("")
        setFields([{ name: "Title", type: "text" }])
        setColor("indigo")
      }
      setNewOptionStates({})
    }
  }, [open, editingDatabase, templateDatabase])

  const handleAddField = () => {
    setFields([...fields, { name: "", type: "text" }])
  }

  const handleRemoveField = (index: number) => {
    if (fields.length <= 1) return
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, field: Partial<Field>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...field }
    setFields(newFields)
  }

  const handleAddOption = (fieldIndex: number) => {
    const optionText = newOptionStates[fieldIndex]
    if (!optionText) return

    const field = fields[fieldIndex]
    const newOpts = [...(field.options || []), optionText]
    handleFieldChange(fieldIndex, { options: newOpts })
    setNewOptionStates(prev => ({ ...prev, [fieldIndex]: "" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || fields.some((f) => !f.name)) return

    const dbData: Database = {
      id: editingDatabase?.id,
      title,
      fields,
      records: editingDatabase ? editingDatabase.records : [],
      color,
    }

    if (editingDatabase && onDatabaseUpdate) {
      onDatabaseUpdate(dbData)
    } else {
      onDatabaseCreate(dbData)
    }
    onOpenChange(false)
  }

  const colors = [
    "indigo", "blue", "cyan", "teal", "emerald", "green", "amber", "rose", "red", "pink", "purple"
  ]

  const fieldTypes: { value: FieldType; label: string; icon: any; color: string }[] = [
    { value: "text", label: "Short Text", icon: Type, color: "text-blue-400" },
    { value: "number", label: "Numeric", icon: Hash, color: "text-amber-400" },
    { value: "date", label: "Date/Time", icon: Calendar, color: "text-emerald-400" },
    { value: "checkbox", label: "Multi Select", icon: CheckSquare, color: "text-purple-400" },
    { value: "dropdown", label: "Single Select", icon: ListIcon, color: "text-indigo-400" },
    { value: "textarea", label: "Long Text", icon: FileText, color: "text-gray-400" },
    { value: "gallery", label: "Media Assets", icon: ImageIcon, color: "text-rose-400" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] h-[85vh] p-0 bg-[#0a0a0a] border-white/10 text-white overflow-hidden flex flex-col">
        <DialogHeader className="p-8 bg-gradient-to-b from-indigo-500/10 to-transparent border-b border-white/5">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                    <Layout className="h-6 w-6" />
                </div>
                <div>
                   <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                     {editingDatabase ? "Configure Architecture" : "Architect Blueprint"}
                   </DialogTitle>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                     {editingDatabase ? `Modifying ${editingDatabase.title}` : "Define new data schema"}
                   </p>
                </div>
            </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-8">
            <form id="builder-form" onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Database Identity</label>
                        <Input
                            placeholder="e.g. Bio-Metrics Vault"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Visual Signature</label>
                        <div className="flex flex-wrap gap-2 p-2 bg-white/5 border border-white/10 rounded-2xl h-14 items-center px-4">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-6 h-6 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : 'opacity-40 hover:opacity-100 hover:scale-110'} ${
                                        c === 'indigo' ? 'bg-indigo-500' : 
                                        c === 'blue' ? 'bg-blue-500' : 
                                        c === 'cyan' ? 'bg-cyan-500' : 
                                        c === 'teal' ? 'bg-teal-500' : 
                                        c === 'emerald' ? 'bg-emerald-500' : 
                                        c === 'green' ? 'bg-green-500' : 
                                        c === 'amber' ? 'bg-amber-500' : 
                                        c === 'rose' ? 'bg-rose-500' : 
                                        c === 'red' ? 'bg-red-500' : 
                                        c === 'pink' ? 'bg-pink-500' : 
                                        'bg-purple-500'
                                    }`}
                                    style={{ backgroundColor: `var(--${c}-500, ${c})` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Schema Fields</label>
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{fields.length} Fields Defined</Badge>
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={index} className="space-y-4">
                                <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Field Label"
                                                value={field.name}
                                                onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                                                className="bg-transparent border-none p-0 h-auto text-sm font-bold focus-visible:ring-0 placeholder:text-gray-700"
                                                required
                                            />
                                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-tighter">Attribute Name</p>
                                        </div>
                                        <div className="flex-1">
                                            <Select
                                                value={field.type}
                                                onValueChange={(value: FieldType) => handleFieldChange(index, { type: value })}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-10 text-xs text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white shadow-2xl">
                                                    {fieldTypes.map(type => (
                                                        <SelectItem key={type.value} value={type.value} className="focus:bg-white/10">
                                                            <div className="flex items-center gap-2">
                                                                <type.icon className={`h-3.5 w-3.5 ${type.color}`} />
                                                                <span className="text-[11px] font-bold uppercase tracking-tight">{type.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2 px-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleFieldChange(index, { showOnCard: !field.showOnCard })
                                                }}
                                                className={`p-2.5 rounded-xl transition-all ${field.showOnCard ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-700 hover:text-gray-500'}`}
                                                title={field.showOnCard ? "Visible on Card Front" : "Hidden in Card View"}
                                            >
                                                {field.showOnCard ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            </button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveField(index)}
                                                className="h-10 w-10 text-gray-700 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl"
                                                disabled={fields.length === 1}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Additional Options for Dropdown/Checkbox */}
                                    {(field.type === "dropdown" || field.type === "checkbox") && (
                                        <div className="mt-2 p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Option Matrix</label>
                                                <label className="text-[8px] border-none text-gray-500 font-black uppercase tracking-widest">{(field.options || []).length} Options</label>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {(field.options || []).map((opt, i) => (
                                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold group/opt">
                                                        {opt}
                                                        <X 
                                                            className="h-3 w-3 text-gray-600 hover:text-rose-400 cursor-pointer" 
                                                            onClick={() => {
                                                                const newOpts = [...(field.options || [])]
                                                                newOpts.splice(i, 1)
                                                                handleFieldChange(index, { options: newOpts })
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Enter option..."
                                                    className="h-9 bg-black/40 border-white/10 rounded-lg text-[11px] font-bold placeholder:text-gray-700"
                                                    value={newOptionStates[index] || ""}
                                                    onChange={(e) => setNewOptionStates(prev => ({ ...prev, [index]: e.target.value }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            handleAddOption(index)
                                                        }
                                                    }}
                                                />
                                                <Button 
                                                    type="button"
                                                    size="sm"
                                                    className="h-9 px-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                                    onClick={() => handleAddOption(index)}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Tactical Inclusion: Add Section Here */}
                                <div className="flex justify-center -my-2 relative z-10">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newFields = [...fields]
                                            newFields.splice(index + 1, 0, { name: "", type: "text" })
                                            setFields(newFields)
                                        }}
                                        className="px-3 py-1 rounded-full bg-black border border-white/10 hover:border-indigo-500/40 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-indigo-400 transition-all flex items-center gap-2 group/add"
                                    >
                                        <Plus className="h-2.5 w-2.5 text-indigo-500 transition-transform group-hover/add:rotate-90" />
                                        Add Section Here
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button 
                        type="button" 
                        onClick={handleAddField} 
                        variant="ghost" 
                        className="w-full h-14 rounded-2xl border-2 border-dashed border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-gray-500 hover:text-indigo-400 transition-all group"
                    >
                        <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                        <span className="font-black uppercase tracking-[0.2em] text-[10px]">Add Data Channel</span>
                    </Button>
                </div>
            </form>
        </ScrollArea>

        <div className="p-8 border-t border-white/5 bg-[#111] flex items-center justify-between">
            <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="px-8 text-gray-500 hover:text-white uppercase font-black text-[10px] tracking-widest"
            >
                Abort
            </Button>
            <Button 
                type="submit" 
                form="builder-form"
                className="px-10 h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20"
            >
                {editingDatabase ? "Commit Architecture" : "Initialize Database"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
