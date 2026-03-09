"use client"

import { useState } from "react"
import { FileJson, FileSpreadsheet, FileText, Download, ChevronDown, ChevronUp } from "lucide-react"
import { sidebarSections } from "@/lib/sidebar-config"
import { handleExport, getRecordsForItem } from "@/lib/export-utils"

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
                className={`flex items-center gap-3 mb-2 cursor-pointer p-2 rounded-xl transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-orange-100 text-orange-600' : 'bg-orange-500/20 text-orange-400'}`}>
                    <Download className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold">Export Specific Data</h2>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Download individual records data from your vault directly in PDF, CSV, or JSON format.
                    </p>
                </div>
                <div className={`p-2 rounded-full ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-4 duration-300 pt-4">
                {exportableItems.map(item => {
                    const itemCount = getRecordsForItem(item.id, records).length;
                    
                    return (
                        <div key={item.id} className={`flex flex-col p-3 rounded-xl border transition-all ${theme === 'light'
                            ? 'bg-white border-gray-200 shadow-sm hover:border-orange-500/30'
                            : 'bg-[#1a1a1a] border-white/10 hover:border-orange-500/30'
                            }`}>
                            
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 relative">
                                    <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-400'}`}>
                                        <div className="scale-75 origin-center">{item.icon}</div>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold leading-tight">{item.label}</h3>
                                        <p className="text-[9px] opacity-70 font-medium uppercase tracking-widest mt-0.5">{itemCount} Records</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`flex items-center justify-end gap-1 pt-2 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                                <div className="mr-auto text-[9px] font-black uppercase tracking-widest opacity-40">Export AS</div>
                                <button 
                                    onClick={(e) => handleExport(e, item, records, 'json')}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-500/10 hover:text-blue-500 transition-all focus:outline-none"
                                    title={`Export JSON`}
                                >
                                    <FileJson className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                    onClick={(e) => handleExport(e, item, records, 'csv')}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-green-500/10 hover:text-green-500 transition-all focus:outline-none"
                                    title={`Export CSV`}
                                >
                                    <FileSpreadsheet className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                    onClick={(e) => handleExport(e, item, records, 'pdf')}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all focus:outline-none"
                                    title={`Export PDF`}
                                >
                                    <FileText className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}
        </div>
    )
}
