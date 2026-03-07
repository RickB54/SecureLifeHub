"use client"

import { useMemo } from "react"
import { ArrowRight, HelpCircle } from "lucide-react"

interface SubDashboardProps {
    section: {
        id: string
        title: string
        color?: string
        items: { id: string; label: string; icon: any }[]
    }
    records: any[]
    setActivePage: (page: string) => void
    theme: string
    onOpenHelp?: (targetId?: string) => void
}

export default function SubDashboard({ section, records, setActivePage, theme, onOpenHelp }: SubDashboardProps) {
    const sectionColor = section.color || "blue"

    // Map color names to Tailwind color classes
    const colorClasses: Record<string, { bg: string, text: string, border: string, hover: string, lightBg: string, lightText: string }> = {
        blue: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", hover: "hover:border-blue-500/50", lightBg: "bg-blue-100", lightText: "text-blue-700" },
        purple: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30", hover: "hover:border-purple-500/50", lightBg: "bg-purple-100", lightText: "text-purple-700" },
        emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", hover: "hover:border-emerald-500/50", lightBg: "bg-emerald-100", lightText: "text-emerald-700" },
        orange: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", hover: "hover:border-orange-500/50", lightBg: "bg-orange-100", lightText: "text-orange-700" },
        rose: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30", hover: "hover:border-rose-500/50", lightBg: "bg-rose-100", lightText: "text-rose-700" },
        amber: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", hover: "hover:border-amber-500/50", lightBg: "bg-amber-100", lightText: "text-amber-700" },
        indigo: { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500/30", hover: "hover:border-indigo-500/50", lightBg: "bg-indigo-100", lightText: "text-indigo-700" },
        cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30", hover: "hover:border-cyan-500/50", lightBg: "bg-cyan-100", lightText: "text-cyan-700" },
        pink: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30", hover: "hover:border-pink-500/50", lightBg: "bg-pink-100", lightText: "text-pink-700" },
        teal: { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500/30", hover: "hover:border-teal-500/50", lightBg: "bg-teal-100", lightText: "text-teal-700" },
        violet: { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30", hover: "hover:border-violet-500/50", lightBg: "bg-violet-100", lightText: "text-violet-700" },
        gray: { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30", hover: "hover:border-gray-500/50", lightBg: "bg-gray-100", lightText: "text-gray-700" },
    }

    const themeColors = colorClasses[sectionColor] || colorClasses.blue

    // Calculate stats for each sub-item
    const stats = useMemo(() => {
        return section.items.map(item => {
            return {
                ...item,
                count: records.filter(r => {
                    if (item.id === "type-logins") return r.type === "password" || r.type === "login"
                    if (item.id === "type-payment-cards") return r.type === "financial-card"
                    return false
                }).length
            }
        })
    }, [section, records])

    return (
        <div className={`p-8 h-full overflow-y-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <header className="mb-12">
                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border ${theme === 'dark' ? `${themeColors.bg} ${themeColors.text} ${themeColors.border}` : `${themeColors.lightBg} ${themeColors.lightText}`}`}>
                    Section Workspace
                </div>
                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">{section.title}</h1>
                <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Centrally manage all your {section.title.toLowerCase()} modules and data.
                </p>
                <div className={`h-1 w-24 mt-6 rounded-full ${theme === 'dark' ? themeColors.bg.replace('/20', '') : themeColors.lightBg.replace('100', '500')}`}></div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`group relative text-left p-8 rounded-2xl transition-all duration-500 overflow-hidden ${theme === 'dark'
                            ? `bg-white/5 border border-white/10 ${themeColors.hover}`
                            : 'bg-white border border-gray-200 shadow-sm hover:shadow-xl'
                            }`}
                    >
                        {/* Background Decoration */}
                        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${theme === 'dark' ? themeColors.bg.replace('/20', '') : themeColors.lightBg.replace('100', '500')}`}></div>

                        <div className="flex items-center justify-between mb-8">
                            <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${theme === 'dark' ? `${themeColors.bg} ${themeColors.text}` : `${themeColors.lightBg} ${themeColors.lightText}`}`}>
                                {item.icon}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onOpenHelp?.(item.id); }}
                                    className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <HelpCircle className="h-4 w-4" />
                                </button>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${theme === 'dark' ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-50 group-hover:bg-white'}`}>
                                    <ArrowRight className={`w-5 h-5 transition-transform duration-500 group-hover:translate-x-1 ${theme === 'dark' ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-black'}`} />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-2 tracking-tight group-hover:translate-x-1 transition-transform">{item.label}</h3>
                        <p className={`text-sm tracking-wide leading-relaxed ${theme === 'dark' ? 'text-gray-400/80' : 'text-gray-500'}`}>
                            Open the secure {item.label.toLowerCase()} interface to view, edit, and audit your records.
                        </p>

                        <div className={`mt-6 pt-6 border-t border-white/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-black'} transition-colors`}>
                            <span className={`w-1 h-1 rounded-full ${theme === 'dark' ? themeColors.bg.replace('/20', '') : themeColors.lightBg.replace('100', '500')}`}></span>
                            Open Module
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
