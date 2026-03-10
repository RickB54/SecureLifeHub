"use client"

import { useState } from "react"
import { FileJson, FileSpreadsheet, FileText, Download, ChevronDown, ChevronUp, Upload } from "lucide-react"
import { sidebarSections } from "@/lib/sidebar-config"
import { handleExport, getRecordsForItem } from "@/lib/export-utils"
import { toast } from "sonner"

interface ExportDataProps {
    records: any[]
    theme: string
}

export default function ExportData({ records, theme }: ExportDataProps) {
    // Collect all valid items that have records.
    // Skip settings, dashboard, delete/trash etc.
    const exportableItems = sidebarSections.flatMap(section => 
        section.items.map(item => ({ ...item, sectionName: section.title, sectionColor: section.color }))
    ).filter(item => 
        !['dashboard', 'settings', 'favorites', 'trash', 'generate-password'].includes(item.id)
    );

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`space-y-6 ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
            <div 
                className={`flex items-center gap-3 mb-2 cursor-pointer p-3 rounded-2xl transition-all ${theme === 'light' ? 'hover:bg-gray-100 bg-orange-50' : 'hover:bg-white/5 bg-white/5'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-orange-500/20 text-orange-400'}`}>
                    <Download className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Import & Export Hub</h2>
                    <p className={`text-[11px] font-medium leading-tight ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Bulk manage individual category data. Download as PDF/CSV/JSON or import external records.
                    </p>
                </div>
                <div className={`p-2 rounded-full ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`}>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-300 pt-4">
                {exportableItems.map((item, idx) => {
                    const itemCount = getRecordsForItem(item.id, records).length;
                    // Rotate through colors for a vibrant look
                    const colors = ['orange', 'blue', 'emerald', 'purple', 'rose', 'indigo', 'amber', 'teal'];
                    const color = colors[idx % colors.length];
                    
                    return (
                        <div key={item.id} className={`flex flex-col p-4 rounded-2xl border transition-all hover:scale-[1.02] ${theme === 'light'
                            ? `bg-white border-gray-200 shadow-sm hover:border-${color}-500/30`
                            : `bg-white/5 border-white/5 hover:border-${color}-500/50`
                            }`}>
                            
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3 relative">
                                    <div className={`p-2 rounded-xl ${theme === 'light' ? `bg-${color}-50 text-${color}-600` : `bg-${color}-500/10 text-${color}-400`}`}>
                                        <div className="scale-90 origin-center">{item.icon}</div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tight leading-none">{item.label}</h3>
                                        <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest mt-1">{itemCount} Records</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`flex flex-col gap-3 pt-3 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Export</span>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={(e) => handleExport(e, item, records, 'json')}
                                            className={`p-1.5 rounded-lg text-gray-500 hover:bg-blue-500/10 hover:text-blue-500 transition-all focus:outline-none`}
                                            title={`Export JSON`}
                                        >
                                            <FileJson className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => handleExport(e, item, records, 'csv')}
                                            className={`p-1.5 rounded-lg text-gray-500 hover:bg-green-500/10 hover:text-green-500 transition-all focus:outline-none`}
                                            title={`Export CSV`}
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => handleExport(e, item, records, 'pdf')}
                                            className={`p-1.5 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all focus:outline-none`}
                                            title={`Export PDF`}
                                        >
                                            <FileText className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Import</span>
                                    <button 
                                        onClick={() => {
                                            toast.info(`Import tool for ${item.label} coming soon! Use the global import button above for now.`);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg bg-${color}-500/10 text-${color}-500 text-[10px] font-black uppercase tracking-widest hover:bg-${color}-500/20 transition-all flex items-center gap-2`}
                                    >
                                        <Upload className="h-3 w-3" /> Import
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}
        </div>
    )
}
