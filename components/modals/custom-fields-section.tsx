"use client"

import { useState } from "react"
import {
    Type,
    Lock,
    Calendar,
    User,
    Grid3X3,
    Globe,
    Mail,
    Phone,
    ShieldQuestion,
    CreditCard,
    AlignLeft,
    MapPin,
    EyeOff,
    Eye,
    Trash2,
    Plus,
    ChevronDown,
    Edit2
} from "lucide-react"

export type CustomFieldType =
    | "text"
    | "password"
    | "date"
    | "login"
    | "pin"
    | "website"
    | "email"
    | "phone"
    | "security"
    | "name"
    | "card"
    | "multiline"
    | "address"
    | "hidden"
    | "native"

export interface CustomField {
    id: string
    label: string
    value: string
    type: CustomFieldType
    isHidden?: boolean
}

const fieldTypes: { type: CustomFieldType; label: string; icon: any }[] = [
    { type: "text", label: "Text", icon: Type },
    { type: "password", label: "Password", icon: Lock },
    { type: "date", label: "Date", icon: Calendar },
    { type: "login", label: "Login or Username", icon: User },
    { type: "pin", label: "Pin Code", icon: Grid3X3 },
    { type: "website", label: "Website Address", icon: Globe },
    { type: "email", label: "Email", icon: Mail },
    { type: "phone", label: "Phone Number", icon: Phone },
    { type: "security", label: "Security Question & Answer", icon: ShieldQuestion },
    { type: "name", label: "Name", icon: User },
    { type: "card", label: "Payment Card", icon: CreditCard },
    { type: "multiline", label: "Multi-line Text", icon: AlignLeft },
    { type: "address", label: "Address", icon: MapPin },
    { type: "hidden", label: "Hidden Field", icon: EyeOff },
    { type: "native", label: "Native App Filler", icon: Globe },
]

export default function CustomFieldsSection({
    fields,
    onChange
}: {
    fields: CustomField[],
    onChange: (fields: CustomField[]) => void
}) {
    const [showMenu, setShowMenu] = useState(false)
    const [editingLabelId, setEditingLabelId] = useState<string | null>(null)

    const addField = (type: CustomFieldType, label: string) => {
        const newField: CustomField = {
            id: Math.random().toString(36).substr(2, 9),
            label: label,
            value: "",
            type: type,
            isHidden: type === "password" || type === "pin" || type === "hidden"
        }
        onChange([...fields, newField])
        setShowMenu(false)
    }

    const removeField = (id: string) => {
        onChange(fields.filter(f => f.id !== id))
    }

    const updateField = (id: string, updates: Partial<CustomField>) => {
        onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f))
    }

    return (
        <div className="space-y-4 mt-6 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-300">Custom Fields</h3>
            </div>

            <div className="space-y-4">
                {fields.map((field) => {
                    const fieldType = fieldTypes.find(t => t.type === field.type)
                    const Icon = fieldType?.icon || Type

                    return (
                        <div key={field.id} className="group space-y-1">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    {editingLabelId === field.id ? (
                                        <input
                                            autoFocus
                                            className="bg-transparent border-b border-blue-500 outline-none text-xs text-blue-400 font-medium py-0"
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            onBlur={() => setEditingLabelId(null)}
                                            onKeyDown={(e) => e.key === 'Enter' && setEditingLabelId(null)}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-medium">{field.label}</span>
                                            <button
                                                type="button"
                                                onClick={() => setEditingLabelId(field.id)}
                                                className="text-[10px] text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Edit Label
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeField(field.id)}
                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Icon className="h-4 w-4" />
                                </div>
                                {field.type === "multiline" ? (
                                    <textarea
                                        className={`w-full pl-10 pr-10 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff] text-sm ${!field.isHidden && (field.type === 'password' || field.type === 'pin' || field.type === 'hidden') ? 'bg-blue-600/30 text-white' : 'bg-[#333] text-white'}`}
                                        value={field.value}
                                        onChange={(e) => updateField(field.id, { value: e.target.value })}
                                        rows={3}
                                    />
                                ) : (
                                    <input
                                        type={field.isHidden ? "password" : "text"}
                                        className={`w-full pl-10 pr-12 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff] text-sm ${!field.isHidden && (field.type === 'password' || field.type === 'pin' || field.type === 'hidden') ? 'bg-blue-600/30 text-white font-medium' : 'bg-[#333] text-white'}`}
                                        value={field.value}
                                        onChange={(e) => updateField(field.id, { value: e.target.value })}
                                    />
                                )}

                                {(field.type === "password" || field.type === "pin" || field.type === "hidden") && (
                                    <button
                                        type="button"
                                        onClick={() => updateField(field.id, { isHidden: !field.isHidden })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {field.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="relative pt-2">
                <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                    <div className="w-6 h-6 rounded border-2 border-blue-400 flex items-center justify-center">
                        <Plus className="h-4 w-4" />
                    </div>
                    Add Custom Field
                </button>

                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                            <div className="p-3 border-b border-gray-700">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Field Type</span>
                            </div>
                            <div className="grid grid-cols-1 max-h-64 overflow-y-auto custom-scrollbar">
                                {fieldTypes.map((ft) => {
                                    const Icon = ft.icon
                                    return (
                                        <button
                                            key={ft.type}
                                            type="button"
                                            onClick={() => addField(ft.type, ft.label)}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#333] text-sm text-gray-200 transition-colors text-left"
                                        >
                                            <Icon className="h-4 w-4 text-blue-400" />
                                            {ft.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
