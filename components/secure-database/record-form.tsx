"use client"

import { useState } from "react"
import { Pencil, Plus, Trash2, Save, AlertTriangle, Type, Hash, Calendar as CalendarIcon, CheckSquare, List as ListIcon, FileText, Image as ImageIcon } from "lucide-react"
import type { Database, DbRecord, Field } from "@/types/secure-database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface RecordFormProps {
  database: Database
  record?: DbRecord
  onSubmit: (values: { [key: string]: any }) => void
  onUpdateDatabase?: (updatedDatabase: Database) => void
}

export function RecordForm({ database, record, onSubmit, onUpdateDatabase }: RecordFormProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [newOption, setNewOption] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const values: { [key: string]: any } = {}

    database.fields.forEach((field) => {
      if (field.type === "checkbox") {
        const selectedOptions = formData.getAll(field.name)
        values[field.name] = selectedOptions
      } else {
        values[field.name] = formData.get(field.name)
      }
    })

    onSubmit(values)
  }

  const renderField = (field: Field) => {
    const value = record?.values[field.name]
    
    const fieldHeader = (
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 block mb-2">{field.name}</label>
    )

    const inputClasses = "bg-white/5 border-white/10 rounded-2xl focus:ring-indigo-500 text-white placeholder:text-gray-700 transition-all font-bold"

    switch (field.type) {
      case "text":
      case "number":
      case "date":
        return (
          <div className="space-y-1">
            {fieldHeader}
            <Input type={field.type} name={field.name} defaultValue={value || ""} className={`h-12 ${inputClasses}`} />
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-1">
            {fieldHeader}
            <Textarea name={field.name} defaultValue={value || ""} className={`min-h-[120px] ${inputClasses}`} />
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-1">
            {fieldHeader}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2 bg-white/2 rounded-3xl border border-white/5">
                {field.options?.map((option) => (
                  <div key={option} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <Checkbox
                      id={`${field.name}-${option}`}
                      name={field.name}
                      value={option}
                      defaultChecked={(value || []).includes(option)}
                      className="border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                    />
                    <Label htmlFor={`${field.name}-${option}`} className="text-sm font-bold text-gray-300 cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
            </div>
          </div>
        )

      case "dropdown":
        return (
          <div className="space-y-1">
            {fieldHeader}
            <Select name={field.name} defaultValue={value}>
                <SelectTrigger className={`h-12 ${inputClasses}`}>
                  <SelectValue placeholder="Selection Required..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white shadow-2xl">
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option} className="focus:bg-white/10 font-bold">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
            </Select>
          </div>
        )

      case "gallery":
        return (
          <div className="space-y-1 opacity-50">
            {fieldHeader}
            <div className="p-8 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center gap-3">
                <ImageIcon className="h-8 w-8 text-gray-700" />
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Media module available post-init</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
        <ScrollArea className="flex-1 p-8">
            <form id="record-form" onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8 pb-12">
                {database.fields.map((field) => (
                    <div key={field.name} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {renderField(field)}
                    </div>
                ))}
            </form>
        </ScrollArea>
        <div className="p-8 border-t border-white/5 bg-[#111] flex items-center justify-end">
            <Button 
                type="submit" 
                form="record-form"
                className="px-12 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20"
            >
                {record ? "Commit Changes" : "Create Node"}
            </Button>
        </div>
    </div>
  )
}
