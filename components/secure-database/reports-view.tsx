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
  Plus,
  Trash2,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  ChevronLeft,
  X,
  Save,
  Clock,
  PieChart as PieIcon,
  HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { Database as DatabaseType, DbRecord, Field } from "@/types/secure-database"
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

interface ReportsViewProps {
  database: DatabaseType
  onSaveReport: (dbTitle: string, report: any) => void
  onGetReports: (dbTitle: string) => any[]
  onDeleteReport: (dbTitle: string, reportId: string) => void
  onOpenHelp?: (id: string) => void
}

export function ReportsView({ database, onSaveReport, onGetReports, onDeleteReport, onOpenHelp }: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState("predefined")
  const [selectedFields, setSelectedFields] = useState<string[]>(database.fields.map(f => f.name))
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportResult, setReportResult] = useState<any[] | null>(null)
  const [reportType, setReportType] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")

  const savedReports = useMemo(() => onGetReports(database.title), [database.title, onGetReports])

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4", "#a855f7"]

  const handleRunReport = (type: string) => {
    setIsGenerating(true)
    setReportType(type)
    
    // Simulate engine processing
    setTimeout(() => {
        let data: any[] = []
        
        if (type === "summary") {
            data = database.records.map(r => ({
                id: r.id,
                ...r.values,
                created: new Date(r.created).toLocaleDateString(),
            }))
        } else if (type === "category") {
            // Find a categorical field (dropdown or checkbox or just use the first non-text field)
            const catField = database.fields.find(f => f.type === "dropdown" || f.type === "checkbox") || database.fields[0]
            const counts: { [key: string]: number } = {}
            
            database.records.forEach(r => {
                const val = r.values[catField.name]
                if (Array.isArray(val)) {
                    val.forEach(v => {
                        counts[String(v)] = (counts[String(v)] || 0) + 1
                    })
                } else {
                    const label = String(val || "Uncategorized")
                    counts[label] = (counts[label] || 0) + 1
                }
            })
            
            data = Object.entries(counts).map(([name, count]) => ({ name, count }))
        } else if (type === "recent") {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            
            data = database.records
                .filter(r => new Date(r.created) >= thirtyDaysAgo)
                .map(r => ({
                    id: r.id,
                    ...r.values,
                    created: new Date(r.created).toLocaleDateString()
                }))
        } else if (type === "custom") {
            data = database.records.map(r => {
                const row: any = { id: r.id }
                selectedFields.forEach(f => {
                    row[f] = r.values[f]
                })
                row.created = new Date(r.created).toLocaleDateString()
                return row
            })
        }

        setReportResult(data)
        setIsGenerating(false)
        toast.success(`${type.toUpperCase()} Intel Matrix Synchronized`)
    }, 1200)
  }

  const handleExportCSV = () => {
    if (!reportResult || reportResult.length === 0) return
    
    const headers = Object.keys(reportResult[0]).filter(h => h !== 'id')
    const csvContent = [
        headers.join(','),
        ...reportResult.map(row => headers.map(h => `"${String(row[h] || '')}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${database.title}_report_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Intelligence Data Exported to CSV")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSaveCustomReport = () => {
    if (selectedFields.length === 0) {
        toast.error("Select at least one data channel for the blueprint")
        return
    }
    const newReport = {
        id: Math.random().toString(36).substr(2, 9),
        title: `Audit: ${database.title} (${selectedFields.length} Channels)`,
        fields: selectedFields,
        created: new Date().toISOString(),
    }
    onSaveReport(database.title, newReport)
    toast.success("Analytical Blueprint Saved to Memory")
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] animate-in fade-in duration-700">
        <div className="p-10 border-b border-white/5 bg-white/2 backdrop-blur-3xl sticky top-0 z-10 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <div className="flex items-center gap-4">
                     <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 flex items-center gap-4">
                        <TrendingUp className="h-10 w-10 text-indigo-500" />
                        Reporting Engine
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onOpenHelp?.("secure-database")}
                            className="h-10 w-10 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10"
                        >
                            <HelpCircle className="h-5 w-5 text-gray-400 group-hover:text-white" />
                        </Button>
                     </h2>
                     <div className="flex items-center gap-3">
                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em]">Active Architecture: {database.title}</p>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     </div>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        onClick={handlePrint}
                        disabled={!reportResult}
                        className="h-12 px-6 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest gap-3"
                    >
                        <Printer className="h-4 w-4" />
                        Print Report
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleExportCSV}
                        disabled={!reportResult}
                        className="h-12 px-6 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest gap-3"
                    >
                        <Download className="h-4 w-4 text-emerald-400" />
                        Export Data
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-black/40 p-1.5 rounded-[2rem] h-16 border border-white/5 max-w-2xl mx-auto flex shadow-2xl">
                    <TabsTrigger value="predefined" className="flex-1 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Templates</TabsTrigger>
                    <TabsTrigger value="custom" className="flex-1 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Custom Architect</TabsTrigger>
                    <TabsTrigger value="saved" className="flex-1 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Blueprints</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        <ScrollArea className="flex-1">
            <div className="p-10 max-w-6xl mx-auto space-y-12 pb-32">
                <div className="print:hidden">
                    <Tabs value={activeTab} className="w-full">
                        <TabsContent value="predefined" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { id: "summary", title: "Global Summary", desc: "Complete diagnostic overview of all records", icon: FileText, color: "text-indigo-400" },
                                    { id: "category", title: "Logic Grouping", desc: "Data distribution by structural identifiers", icon: PieIcon, color: "text-emerald-400" },
                                    { id: "recent", title: "Temporal Scan", desc: "Evolution analysis of last 30 cycles", icon: Clock, color: "text-amber-400" },
                                ].map((rep) => (
                                    <div key={rep.id} className="group p-8 rounded-[3rem] bg-white/2 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all flex flex-col items-start gap-8 relative overflow-hidden">
                                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/2 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                                        <div className={`h-16 w-16 rounded-[1.5rem] bg-black/40 ${rep.color} flex items-center justify-center ring-4 ring-white/5 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl`}>
                                            <rep.icon className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white tracking-tight uppercase mb-2">{rep.title}</h4>
                                            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest leading-relaxed">{rep.desc}</p>
                                        </div>
                                        <Button 
                                            onClick={() => handleRunReport(rep.id)}
                                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all font-black uppercase text-[11px] tracking-[0.2em] group/btn"
                                        >
                                            Initialize Audit
                                            <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="custom" className="mt-0">
                            <div className="bg-white/2 border border-white/5 rounded-[4rem] p-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                                    <div>
                                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-2 italic">Architecture Builder</h3>
                                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] flex items-center gap-2">
                                            <Zap className="h-3 w-3" />
                                            Constructing Custom Analytical Matrix
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="ghost" onClick={() => setSelectedFields([])} className="h-12 px-8 text-[11px] font-black uppercase text-gray-500 hover:text-white tracking-widest">Reset</Button>
                                        <Button 
                                            onClick={handleSaveCustomReport}
                                            className="h-14 px-8 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-indigo-500/30"
                                        >
                                            <Save className="h-4 w-4 mr-3" />
                                            Register Blueprint
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-16">
                                    <div>
                                        <div className="flex items-center justify-between mb-8 px-2">
                                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600">Active Intelligence Channels</h4>
                                            <button 
                                                onClick={() => setSelectedFields(database.fields.map(f => f.name))}
                                                className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest border-b border-indigo-500/30 pb-1"
                                            >
                                                Select All Vectors
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {database.fields.map((field) => (
                                                <div 
                                                    key={field.name} 
                                                    onClick={() => {
                                                        if (selectedFields.includes(field.name)) setSelectedFields(selectedFields.filter(f => f !== field.name))
                                                        else setSelectedFields([...selectedFields, field.name])
                                                    }}
                                                    className={`group flex items-center gap-5 p-6 rounded-[2rem] border transition-all cursor-pointer ${selectedFields.includes(field.name) ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-white/2 border-white/5 opacity-50 hover:opacity-80'}`}
                                                >
                                                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedFields.includes(field.name) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 group-hover:border-white/30'}`}>
                                                        {selectedFields.includes(field.name) && <CheckCircle className="h-3.5 w-3.5" />}
                                                    </div>
                                                    <span className="text-[12px] font-black uppercase tracking-widest text-white">{field.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-8">
                                        <Button 
                                            onClick={() => handleRunReport("custom")}
                                            className="h-20 px-16 rounded-[2rem] bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-[13px] tracking-[0.3em] shadow-[0_20px_50px_rgba(99,102,241,0.3)] active:scale-95 transition-all"
                                        >
                                            Generate Analytical Output
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="saved" className="mt-0">
                            {savedReports.length === 0 ? (
                                <div className="h-[400px] rounded-[4rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center gap-8 animate-in zoom-in-95 duration-500">
                                    <div className="h-28 w-28 rounded-[3rem] bg-white/2 flex items-center justify-center text-gray-800 border border-white/5 relative">
                                        <RefreshCcw className="h-12 w-12 opacity-20" />
                                        <div className="absolute inset-4 rounded-3xl border border-white/5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-3 italic">Vault Null State</h3>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">No custom blueprints registered in persistent memory. Architect an audit view and save it to synchronize a persistent node.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {savedReports.map((report) => (
                                        <div key={report.id} className="group p-10 rounded-[3.5rem] bg-white/2 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all flex items-center justify-between relative overflow-hidden">
                                             <div className="flex items-center gap-8">
                                                <div className="h-20 w-20 rounded-[1.75rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                                                    <ShieldCheck className="h-10 w-10" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white uppercase tracking-tight italic">{report.title}</h4>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <Badge className="bg-white/5 text-[8px] font-black uppercase text-gray-500 border-none">{report.fields.length} Vectors</Badge>
                                                        <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest">Reg: {new Date(report.created).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                             </div>
                                             <div className="flex gap-3">
                                                 <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => {
                                                        setSelectedFields(report.fields)
                                                        handleRunReport("custom")
                                                        setActiveTab("custom") // Go back to custom to see results or just run
                                                    }} 
                                                    className="h-14 w-14 rounded-2xl bg-white/5 text-indigo-400 hover:bg-indigo-600 hover:text-white shadow-lg transition-all"
                                                >
                                                    <RefreshCcw className="h-6 w-6" />
                                                 </Button>
                                                 <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => {
                                                        onDeleteReport(database.title, report.id)
                                                        toast.success("Intelligence Module Purged")
                                                    }} 
                                                    className="h-14 w-14 rounded-2xl bg-white/5 text-rose-500 hover:bg-rose-600 hover:text-white shadow-lg transition-all"
                                                >
                                                    <Trash2 className="h-6 w-6" />
                                                 </Button>
                                             </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {isGenerating && (
                    <div className="flex flex-col items-center justify-center p-20 gap-8 animate-in pulse duration-1000">
                        <div className="relative">
                            <div className="w-24 h-24 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                            <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-500 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Synchronizing Logic Nodes</h3>
                            <p className="text-xs text-indigo-400 font-black uppercase tracking-[0.5em] animate-pulse italic">Processing High Fidelity Assets...</p>
                        </div>
                    </div>
                )}

                {reportResult && !isGenerating && (
                    <div className="space-y-12 animate-in slide-in-from-bottom-12 duration-1000">
                        <div className="flex items-center justify-between border-b-2 border-indigo-500/20 pb-8">
                            <div>
                                <h3 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
                                    Analytical Results
                                    <span className="text-indigo-500 ml-4 italic">[{reportType || 'CUSTOM'}]</span>
                                </h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-3">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    Data Integrity Verified • {reportResult.length} Units Found
                                </p>
                            </div>
                            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-2xl print:hidden">
                                <Button 
                                    variant={viewMode === 'table' ? 'default' : 'ghost'} 
                                    onClick={() => setViewMode('table')}
                                    className={`h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Data Table
                                </Button>
                                <Button 
                                    variant={viewMode === 'chart' ? 'default' : 'ghost'} 
                                    onClick={() => setViewMode('chart')}
                                    className={`h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === 'chart' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Chart View
                                </Button>
                            </div>
                        </div>

                        {viewMode === "table" ? (
                            <div className="bg-white/2 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl print:bg-white print:text-black print:rounded-none pr-4">
                                <ScrollArea className="max-h-[70vh]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-black/40 border-b border-white/5">
                                                {Object.keys(reportResult[0]).filter(k => k !== 'id').map(header => (
                                                    <th key={header} className="p-8 text-[11px] font-black uppercase text-indigo-400 tracking-[0.2em]">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {reportResult.map((row, i) => (
                                                <tr key={row.id || i} className="hover:bg-indigo-500/5 transition-colors group">
                                                    {Object.keys(row).filter(k => k !== 'id').map(key => (
                                                        <td key={key} className="p-8">
                                                            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                                                                {Array.isArray(row[key]) ? row[key].join(', ') : String(row[key] || '—')}
                                                            </span>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="bg-white/2 border border-white/5 rounded-[4rem] p-16 h-[600px] flex items-center justify-center relative overflow-hidden">
                                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                                 <ResponsiveContainer width="100%" height="100%">
                                    {reportType === "category" ? (
                                        <PieChart>
                                            <Pie
                                                data={reportResult}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={100}
                                                outerRadius={180}
                                                paddingAngle={8}
                                                dataKey="count"
                                                nameKey="name"
                                                stroke="none"
                                                cornerRadius={12}
                                            >
                                                {reportResult.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '15px' }}
                                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                            />
                                        </PieChart>
                                    ) : (
                                        <BarChart 
                                            data={reportResult.slice(0, 15)}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis 
                                                dataKey={reportType === "summary" || reportType === "custom" || reportType === "recent" ? database.fields[0].name : "name"} 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }}
                                                angle={-45}
                                                textAnchor="end"
                                                interval={0}
                                            />
                                            <YAxis 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }}
                                            />
                                            <Tooltip 
                                                cursor={{ fill: 'rgba(99,102,241,0.1)' }}
                                                contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '15px' }}
                                            />
                                            <Bar dataKey={reportType === "category" ? "count" : "id"} fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40}>
                                                {reportResult.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    )}
                                 </ResponsiveContainer>
                            </div>
                        )}
                        
                        <div className="flex justify-center flex-col items-center gap-6 pt-12 border-t border-white/5 print:hidden">
                            <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em] italic">Intelligence Matrix Audit Complete</p>
                            <Button variant="ghost" className="text-indigo-400 hover:text-white uppercase font-black text-xs tracking-widest gap-2" onClick={() => setReportResult(null)}>
                                <X className="h-4 w-4" />
                                Clear Output Node
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    </div>
  )
}
