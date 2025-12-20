"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

interface Props {
    title: string
    description: string
    icon: React.ReactNode
    records: any[]
    addItem: (item: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
    category: string
}

export default function GenericModule({ title, description, icon, records, addItem, deleteItem, theme, category }: Props) {
    // Glass styles
    const glassCardStyle = theme === 'light'
        ? "bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg border border-white/20 shadow-lg"
        : "bg-gray-800 bg-opacity-40 backdrop-filter backdrop-blur-lg border border-gray-700/50 shadow-lg"

    const headerStyle = theme === 'light'
        ? "bg-gradient-to-r from-gray-200 to-gray-300"
        : "bg-gradient-to-r from-gray-800 to-gray-900"

    return (
        <div className="space-y-8 p-4">
            {/* Header */}
            <div className={`p-6 rounded-2xl ${headerStyle} ${glassCardStyle}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            {icon} {title}
                        </h1>
                        <p className="text-sm opacity-80 mt-1">{description}</p>
                    </div>
                    <button
                        className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md transition-transform hover:scale-105"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className={`p-10 rounded-2xl text-center ${glassCardStyle}`}>
                <p className="text-gray-500">No items in {title} yet. Start building your collection.</p>
            </div>
        </div>
    )
}
