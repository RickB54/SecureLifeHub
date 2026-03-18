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
  PieChart as PieIcon
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
}

export function ReportsView({ database, onSaveReport, onGetReports, onDeleteReport }: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState("predefined")
  const [selectedFields, setSelectedFields] = useState<string[]>(database.fields.map(f => f.name))
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportResult, setReportResult] = useState<any[] | null>(null)

  const savedReports = useMemo(() => onGetReports(database.title), [database.title, onGetReports])

  const stats = useMemo(() => {
    if (!database) return { count: 0, fields: 0, lastUpdated: "N/A" }
    return {
      count: database.records.length,
      fields: database.fields.length,
      lastUpdated: database.records.length > 0 
        ? new Date(Math.max(...database.records.map(r => new Date(r.lastUpdated).getTime()))).toLocaleDateString()
        : "N/A"
    }
  }, [database])

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"]

  const handleRunReport = (type: string) => {
    setIsGenerating(true)
    setTimeout(() => {
        let result: DbRecord[] = []
        if (type === "summary") {
            result = database.records.slice(0, 10)
        }
        setReportResult(result)
        setIsGenerating(false)
        toast.success(`${type.toUpperCase()} Engine Output Synchronized`)
    }, 800)
  }

  const handleSaveCustomReport = () => {
    const newReport = {
        id: Math.random().toString(36).substr(2, 9),
        title: `Custom ${database.title} Audit`,
        fields: selectedFields,
        created: new Date().toISOString(),
    }
    onSaveReport(database.title, newReport)
    toast.success("Analytical Blueprint Saved")
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] animate-in fade-in duration-500">
        <div className="p-8 border-b border-white/5 bg-white/2">
            <div className="flex items-center justify-between mb-8">
                <div>
                     <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Analytical Engine</h2>
                     <p className="text-[10px] font-black uppercase text-gray-600 tracking-[0.3em]">Persistent Data Intelligence Node Active</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-gray-400">
                        <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-gray-400">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white/5 p-1 rounded-2xl h-14 border border-white/5 max-w-2xl mx-auto flex">
                    <TabsTrigger value="predefined" className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px]">Predefined Reports</TabsTrigger>
                    <TabsTrigger value="custom" className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px]">Custom Architect</TabsTrigger>
                    <TabsTrigger value="saved" className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px]">Saved Blueprints</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        <ScrollArea className="flex-1 p-8">
            <div className="max-w-5xl mx-auto pb-12">
                <Tabs value={activeTab} className="w-full">
                    <TabsContent value="predefined" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { id: "summary", title: "Database Summary", desc: "Overview of all records in the active collection", icon: FileText, color: "text-indigo-400" },
                                { id: "category", title: "Records by Category", desc: "Count of records grouped by structural identifier", icon: PieIcon, color: "text-emerald-400" },
                                { id: "recent", title: "Recently Added", desc: "Entries registered within the last 30 intervals", icon: Clock, color: "text-amber-400" },
                            ].map((rep) => (
                                <div key={rep.id} className="group p-8 rounded-[2.5rem] bg-white/2 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-6 hover:translate-y-[-4px]">
                                    <div className="flex items-center gap-6">
                                        <div className={`h-16 w-16 rounded-[1.5rem] bg-black/40 ${rep.color} flex items-center justify-center ring-4 ring-white/5 group-hover:scale-110 transition-transform`}>
                                            <rep.icon className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white tracking-tight uppercase mb-1">{rep.title}</h4>
                                            <p className="text-xs text-gray-600 font-medium leading-relaxed">{rep.desc}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleRunReport(rep.id)}
                                        className="h-11 px-8 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20"
                                    >
                                        Run
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="custom" className="mt-0">
                        <div className="bg-white/2 border border-white/5 rounded-[3rem] p-10">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase mb-2 text-indigo-400">Custom Report Architect</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-700 tracking-widest">Constructing analytical data views</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="ghost" onClick={() => setSelectedFields([])} className="h-10 text-[10px] font-black uppercase text-gray-500 hover:text-white">Reset</Button>
                                    <Button 
                                        onClick={handleSaveCustomReport}
                                        className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest"
                                    >
                                        <Save className="h-3 w-3 mr-2" />
                                        Save Blueprint
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <div>
                                    <div className="flex items-center justify-between mb-6 px-1">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Select Data Channels</h4>
                                        <button 
                                            onClick={() => setSelectedFields(database.fields.map(f => f.name))}
                                            className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase underline underline-offset-4"
                                        >
                                            Select All Channels
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {database.fields.map((field) => (
                                            <div key={field.name} className={`flex items-center gap-4 p-4 rounded-3xl border transition-all ${selectedFields.includes(field.name) ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/2 border-white/5 opacity-50'}`}>
                                                <Checkbox 
                                                    id={`rep-${field.name}`}
                                                    checked={selectedFields.includes(field.name)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setSelectedFields([...selectedFields, field.name])
                                                        else setSelectedFields(selectedFields.filter(f => f !== field.name))
                                                    }}
                                                    className="h-5 w-5 border-white/20 data-[state=checked]:bg-indigo-500 rounded-lg"
                                                />
                                                <Label htmlFor={`rep-${field.name}`} className="text-[11px] font-black uppercase text-gray-300 cursor-pointer">{field.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6 px-1">Universal Filters</h4>
                                    <div className="p-12 border-2 border-dashed border-white/5 rounded-[3rem] text-center bg-white/1">
                                         <Filter className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                                         <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-6">No active filters applied</p>
                                         <Button variant="outline" className="h-12 px-8 rounded-2xl bg-white/2 border-white/10 hover:bg-white/5 text-white font-black uppercase text-[10px] tracking-widest">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Adaptive Filter
                                         </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="saved" className="mt-0">
                        {savedReports.length === 0 ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center gap-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="h-24 w-24 rounded-[2.5rem] bg-white/2 flex items-center justify-center text-gray-800 border border-white/5">
                                    <RefreshCcw className="h-10 w-10" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2 italic">Null Saved States</h3>
                                    <p className="text-xs text-gray-600 font-medium max-w-xs mx-auto">Create a custom architect blueprint and tap 'Save Blueprint' to register a persistent reporting node.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {savedReports.map((report) => (
                                    <div key={report.id} className="p-8 rounded-[2.5rem] bg-white/2 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group">
                                         <div className="flex items-center gap-6">
                                            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{report.title}</h4>
                                                <p className="text-[9px] text-gray-600 font-black uppercase mt-1 tracking-widest">Created: {new Date(report.created).toLocaleDateString()}</p>
                                            </div>
                                         </div>
                                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <Button variant="ghost" size="icon" onClick={() => handleRunReport("custom")} className="h-10 w-10 rounded-xl bg-white/5 text-indigo-400 hover:bg-indigo-500 hover:text-white">
                                                <RefreshCcw className="h-4 w-4" />
                                             </Button>
                                             <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => {
                                                    onDeleteReport(database.title, report.id)
                                                    toast.success("Blueprint Purged")
                                                }} 
                                                className="h-10 w-10 rounded-xl bg-white/5 text-rose-500 hover:bg-rose-500 hover:text-white"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                             </Button>
                                         </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </ScrollArea>
    </div>
  )
}
