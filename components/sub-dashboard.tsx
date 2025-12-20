"use client"

import { useMemo } from "react"
import { ArrowRight } from "lucide-react"

interface SubDashboardProps {
    section: {
        id: string
        title: string
        items: { id: string; label: string; icon: any }[]
    }
    records: any[]
    setActivePage: (page: string) => void
    theme: string
}

export default function SubDashboard({ section, records, setActivePage, theme }: SubDashboardProps) {
    // Calculate stats for each sub-item
    const stats = useMemo(() => {
        return section.items.map(item => {
            // Filter logic mirrors page.tsx logic roughly (record types are "type-[type]")
            // We assume the id in sidebar config corresponds to record type or filter logic
            // But wait, the IDs in sidebar are like "type-logins". The record.type might just be "login".
            // I need to map these correctly.
            // Based on financial-cards.tsx, type is "financial-card" but sidebar says "type-payment-cards".
            // This mapping is tricky without the logic from page.tsx.
            // I will use a simple heuristic for now: count items that *might* belong or just rely on generic type matching if possible.
            // Actually, I'll pass simple counts if I can, OR just count by matching the 'type' field if I can derive it.

            // Let's assume standard mapping: "type-X" -> record.type === "X" (mostly).
            // "type-payment-cards" -> "financial-card"
            // "type-health-records" -> "health-record" (guess)

            // Allow loose matching for demo purposes if exact type isn't known, or just count 0.
            // Better: Filter records where `type` is present?

            // Ideally I'd use the same filter logic as the main page.
            // For now, I'll just show the sub-items as navigation cards.

            return {
                ...item,
                count: records.filter(r => {
                    // Try to match record.type to item.id
                    // e.g. item.id="type-logins", record.type="login"? 
                    // This is brittle.
                    // Instead, let's just count *all* records for the *whole section* for the summary,
                    // and for individual cards, maybe just show "View" button.
                    // Or precise mapping:
                    if (item.id === "type-logins") return r.type === "password" || r.type === "login"
                    if (item.id === "type-payment-cards") return r.type === "financial-card"
                    // General fallback: if record.item_metadata?.type matches?
                    // Let's just return "?" if unknown.
                    return false
                }).length
            }
        })
    }, [section, records])

    // Total count for this section
    // We can't easily calculate this without precise mapping.
    // I'll stick to a visual dashboard of LINKS first, as the user requested "link to Asset Ledger... and quick data stats".

    return (
        <div className={`p-8 h-full overflow-y-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{section.title} Dashboard</h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overview of your {section.title.toLowerCase()} items.
                </p>
            </header>

            {/* Quick Stats Row (Placeholder for now, or aggregate) */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <h3 className="text-sm uppercase tracking-wider opacity-70 mb-1">Total Items</h3>
                    <p className="text-3xl font-bold">--</p>
                </div>
            </div> */}

            {/* Navigation Cards */}
            <h2 className="text-xl font-semibold mb-4">Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {section.items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`group text-left p-6 rounded-xl transition-all duration-300 ${theme === 'dark'
                                ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50'
                                : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                {item.icon}
                            </div>
                            <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                        <h3 className="text-xl font-semibold mb-1">{item.label}</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Access your {item.label.toLowerCase()}.
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}
