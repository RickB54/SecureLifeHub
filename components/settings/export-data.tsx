"use client"

import { FileJson, FileSpreadsheet, FileText, Download } from "lucide-react"
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

    return (
        <div className={`space-y-6 ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-orange-100 text-orange-600' : 'bg-orange-500/20 text-orange-400'}`}>
                    <Download className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Export Specific Data</h2>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Download individual records data from your vault directly in PDF, CSV, or JSON format.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exportableItems.map(item => {
                    const itemCount = getRecordsForItem(item.id, records).length;
                    
                    return (
                        <div key={item.id} className={`flex flex-col p-4 rounded-2xl border transition-all ${theme === 'light'
                            ? 'bg-white border-gray-200 shadow-sm hover:border-orange-500/30'
                            : 'bg-[#1a1a1a] border-white/10 hover:border-orange-500/30'
                            }`}>
                            
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-400'}`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{item.label}</h3>
                                        <p className="text-xs opacity-50 font-medium uppercase tracking-widest">{itemCount} Records</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`flex items-center justify-end gap-1 pt-3 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                                <div className="mr-auto text-[10px] font-black uppercase tracking-widest opacity-30">Export AS</div>
                                <button 
                                    onClick={(e) => handleExport(e, item, records, 'json')}
                                    className="p-2 rounded-xl text-gray-500 hover:bg-blue-500/10 hover:text-blue-500 transition-all focus:outline-none"
                                    title={`Export ${item.label} to JSON ${item.id === 'passwords' ? '(Recommended for Passwords)' : ''}`}
                                >
                                    <FileJson className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={(e) => handleExport(e, item, records, 'csv')}
                                    className="p-2 rounded-xl text-gray-500 hover:bg-green-500/10 hover:text-green-500 transition-all focus:outline-none"
                                    title={`Export ${item.label} to CSV`}
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={(e) => handleExport(e, item, records, 'pdf')}
                                    className="p-2 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all focus:outline-none"
                                    title={`Export ${item.label} to PDF`}
                                >
                                    <FileText className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
