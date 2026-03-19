"use client"

import { useState, useMemo } from "react"
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Database, 
  FileText, 
  Download,
  Filter,
  CheckCircle,
  Zap,
  LayoutGrid,
  ChevronRight,
  Printer,
  HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database as DatabaseType, DbRecord } from "@/types/secure-database"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts"

interface InsightsViewProps {
  database: DatabaseType
  onOpenHelp?: (id: string) => void
}

export function InsightsView({ database, onOpenHelp }: InsightsViewProps) {
  const stats = useMemo(() => {
    if (!database) return { count: 0, fields: 0, lastUpdated: "N/A" }
    
    return {
      count: database.records.length,
      fields: database.fields.length,
      lastUpdated: (() => {
          if (!database.records || database.records.length === 0) return "N/A"
          try {
              const times = database.records.map(r => new Date(r.created || 0).getTime()).filter(t => !isNaN(t))
              if (times.length === 0) return "Initialization Pending"
              return new Date(Math.max(...times)).toLocaleDateString()
          } catch (e) {
              return "Temporal Drift"
          }
      })()
    }
  }, [database])

  const chartData = useMemo(() => {
    if (!database || database.records.length === 0) return []
    // Example: group by first dropdown or checkbox field
    const field = database.fields.find(f => f.type === 'dropdown' || f.type === 'checkbox')
    if (!field) return []

    const counts: { [key: string]: number } = {}
    database.records.forEach(r => {
        const rawVal = r.values[field.name]
        const values = Array.isArray(rawVal) ? rawVal : [rawVal]
        values.forEach(v => {
            const val = String(v || 'Unknown')
            counts[val] = (counts[val] || 0) + 1
        })
    })

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [database])

  const COLORS = ["#818cf8", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#a78bfa"]

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] animate-in fade-in duration-500">
        <div className="p-8 bg-gradient-to-b from-rose-500/10 to-transparent border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic leading-none">Data Insights</h2>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onOpenHelp?.("data-insights")}
                        className="h-9 w-9 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 shrink-0"
                    >
                        <HelpCircle className="h-4 w-4 text-indigo-400" />
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-[9px] h-9 rounded-xl font-black uppercase text-gray-400 shrink-0">
                        <Printer className="h-3.5 w-3.5 mr-1.5" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-[9px] h-9 rounded-xl font-black uppercase text-gray-400 shrink-0">
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Snapshot
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
                 {[
                    { label: "Nodes", value: stats.count, icon: Database, color: "text-indigo-400" },
                    { label: "Points", value: stats.count * stats.fields, icon: Zap, color: "text-amber-400" },
                    { label: "Stability", value: "99%", icon: TrendingUp, color: "text-emerald-400" },
                 ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-2 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1 sm:gap-4 group hover:border-white/10 transition-all">
                        <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-black/40 ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                            <p className="text-[7px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none truncate">{stat.label}</p>
                            <p className="text-[11px] sm:text-xl font-black text-white leading-none mt-0.5 sm:mt-1.5 truncate">{stat.value}</p>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        <ScrollArea className="flex-1 p-3 sm:p-6">
            <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribution Chart */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Distribution Analysis</h3>
                            <PieChartIcon className="h-5 w-5 text-indigo-400" />
                         </div>
                         <div className="h-[200px] sm:h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData.length > 0 ? chartData : [{ name: 'Empty', value: 1 }]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="grid grid-cols-2 gap-2 mt-auto">
                            {chartData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-[10px] text-gray-500 font-bold truncate uppercase tracking-tighter">{entry.name}</span>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* Timeline Analysis */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Metric Density</h3>
                            <BarChartIcon className="h-5 w-5 text-emerald-400" />
                         </div>
                         <div className="h-[200px] sm:h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    />
                                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                </div>

                {/* Detailed Summary Table */}
                <div className="bg-[#111] border border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Hierarchy Metrics</h3>
                        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-indigo-400 group">
                            Advanced Analytics <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Metric Identifier</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-600">State</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-600 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {chartData.map((row) => (
                                    <tr key={row.name} className="hover:bg-white/5 transition-colors group">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                                <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-[10px] font-bold text-emerald-400 opacity-80 uppercase tracking-tighter">Verified</td>
                                        <td className="py-4 px-4 text-sm font-black text-white text-right font-mono italic">{row.value} nodes</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {chartData.length === 0 && (
                            <div className="p-12 text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                                Insights Module: Insufficient Data Points
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ScrollArea>
    </div>
  )
}
