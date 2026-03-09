"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  User as UserIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Calendar,
  Filter,
  PieChart as PieChartIcon,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Target,
  Search,
  ArrowRightLeft,
  FileText,
  Printer,
  ChevronDown,
  Download,
  AlertCircle,
  Sparkles
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie,
  LineChart,
  Line
} from 'recharts'
import { format } from "date-fns"
import { toast } from "sonner"
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Props {
    records: any[]
    addItem: (item: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

type BudgetType = 'personal' | 'business'
type ViewMode = 'overview' | 'transactions' | 'categories' | 'planning'

export default function BudgetManager({ records, addItem, deleteItem, theme }: Props) {
    const [budgetType, setBudgetType] = useState<BudgetType>('personal')
    const [viewMode, setViewMode] = useState<ViewMode>('overview')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
    const [addEntryType, setAddEntryType] = useState<'income' | 'expense'>('expense')
    const [searchQuery, setSearchQuery] = useState("")
    const [currentTimeRange, setCurrentTimeRange] = useState("This Month")

    // Categories derived from records
    const financialCategories = useMemo(() => {
        const defaults = {
            income: ['Service Income', 'Product Sales', 'Consulting', 'Other Income'],
            expense: ['Payroll', 'Supplies', 'Marketing', 'Utilities', 'Rent']
        }

        const custom = records.filter(r => 
            r.item_metadata?.is_financial_category && 
            r.item_metadata?.budget_type === budgetType
        )

        return {
            income: [...new Set([...defaults.income, ...custom.filter(c => c.item_metadata?.category_type === 'income').map(c => c.title)])],
            expense: [...new Set([...defaults.expense, ...custom.filter(c => c.item_metadata?.category_type === 'expense').map(c => c.title)])]
        }
    }, [records, budgetType])

    // Filter records for the current budget type (Personal vs Business)
    const allBudgetItems = useMemo(() => {
        return records.filter(r => 
            (r.category === "Budget" || r.item_metadata?.is_budget) && 
            (r.item_metadata?.budget_type === budgetType)
        )
    }, [records, budgetType])

    // Stats Calculation
    const stats = useMemo(() => {
        const income = allBudgetItems
            .filter(i => i.item_metadata?.entry_type === 'income')
            .reduce((sum, i) => sum + (parseFloat(i.item_metadata?.amount) || 0), 0)
        
        const expenses = allBudgetItems
            .filter(i => i.item_metadata?.entry_type === 'expense')
            .reduce((sum, i) => sum + (parseFloat(i.item_metadata?.amount) || 0), 0)
        
        const taxDeductible = allBudgetItems
            .filter(i => i.item_metadata?.is_tax_deductible)
            .reduce((sum, i) => sum + (parseFloat(i.item_metadata?.amount) || 0), 0)

        const taxItemsCount = allBudgetItems.filter(i => i.item_metadata?.is_tax_deductible).length

        return {
            income,
            expenses,
            profit: income - expenses,
            taxDeductible,
            taxItemsCount
        }
    }, [allBudgetItems])

    // Prepare chart data
    const categoryData = useMemo(() => {
        const data: any[] = []
        
        // Expense breakdown
        allBudgetItems
            .filter(i => i.item_metadata?.entry_type === 'expense')
            .forEach(item => {
                const cat = item.item_metadata?.category || 'Uncategorized'
                const existing = data.find(a => a.name === cat)
                if (existing) {
                    existing.value += parseFloat(item.item_metadata?.amount) || 0
                } else {
                    data.push({ name: cat, value: parseFloat(item.item_metadata?.amount) || 0, type: 'expense' })
                }
            })

        // Income/Assets as a single category for breakdown comparison if requested, 
        // but user specifically asked for "debts (red) and assets/income (green)"
        const incomeTotal = allBudgetItems
            .filter(i => i.item_metadata?.entry_type === 'income')
            .reduce((s, i) => s + (parseFloat(i.item_metadata?.amount) || 0), 0)
        
        if (incomeTotal > 0) {
            data.push({ name: 'Total Assets/Income', value: incomeTotal, type: 'income' })
        }

        return data.sort((a, b) => b.value - a.value)
    }, [allBudgetItems])

    const monthlyPerformanceData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const currentMonthIdx = new Date().getMonth()
        const last6Months = []
        for (let i = 5; i >= 0; i--) {
            const idx = (currentMonthIdx - i + 12) % 12
            last6Months.push(months[idx])
        }

        return last6Months.map(month => {
            const monthItems = allBudgetItems.filter(item => {
                const itemDate = new Date(item.item_metadata?.date || Date.now())
                return format(itemDate, 'MMM') === month
            })
            return {
                name: month,
                income: monthItems.filter(i => i.item_metadata?.entry_type === 'income').reduce((s, i) => s + (parseFloat(i.item_metadata?.amount) || 0), 0),
                expenses: monthItems.filter(i => i.item_metadata?.entry_type === 'expense').reduce((s, i) => s + (parseFloat(i.item_metadata?.amount) || 0), 0)
            }
        })
    }, [allBudgetItems])

    // Export Logic
    const handleExportCSV = () => {
        const headers = ["Date", "Title", "Category", "Type", "Amount", "Tax Deductible", "Notes"]
        const rows = allBudgetItems.map(i => [
            i.item_metadata?.date,
            `"${i.title?.replace(/"/g, '""')}"`,
            i.item_metadata?.category,
            i.item_metadata?.entry_type,
            i.item_metadata?.amount,
            i.item_metadata?.is_tax_deductible ? "Yes" : "No",
            `"${(i.item_metadata?.notes || "")?.replace(/"/g, '""')}"`
        ])
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `budget_${budgetType}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
        toast.success("CSV Exported")
    }

    const handleExportJSON = () => {
        const blob = new Blob([JSON.stringify(allBudgetItems, null, 2)], { type: 'application/json' })
        saveAs(blob, `budget_${budgetType}_${format(new Date(), 'yyyy-MM-dd')}.json`)
        toast.success("JSON Exported")
    }

    const handleExportPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(20)
        doc.text(`${budgetType.toUpperCase()} Financial Report`, 14, 22)
        doc.setFontSize(11)
        doc.text(`Generated on ${format(new Date(), 'PPP')}`, 14, 30)

        const tableData = allBudgetItems.map(i => [
            i.item_metadata?.date,
            i.title,
            i.item_metadata?.category,
            i.item_metadata?.entry_type?.toUpperCase(),
            `$${parseFloat(i.item_metadata?.amount).toLocaleString()}`
        ])

        autoTable(doc, {
            startY: 40,
            head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }
        })

        doc.save(`budget_${budgetType}_report.pdf`)
        toast.success("PDF Exported")
    }

    const handlePrint = () => {
        window.print()
    }

    const advisorInsights = useMemo(() => {
        if (allBudgetItems.length === 0) return "No data yet. Start tracking to see insights."
        const highestExpense = [...categoryData].filter(c => c.type === 'expense')[0]
        const savingsRate = stats.income > 0 ? (stats.profit / stats.income) * 100 : 0
        
        let advice = `Based on your ${budgetType} ledger, your primary spending is in ${highestExpense?.name || 'various categories'}. `
        if (savingsRate > 20) advice += "Your savings rate is excellent! Consider investing the surplus."
        else if (savingsRate > 0) advice += "You are maintaining a profit, but look for small cuts in luxuries."
        else advice += "You are currently in a deficit. Review your largest categories to find immediate saving opportunities."
        
        return advice
    }, [categoryData, stats, allBudgetItems, budgetType])

    const glassCardStyle = theme === 'light'
        ? "bg-white border border-gray-200"
        : "bg-[#111111] border border-white/5"

    const [showAdvisor, setShowAdvisor] = useState(false)

    const COLORS_MAP: Record<string, string> = {
        'income': '#10b981',
        'expense': '#ef4444'
    }

    const inputStyle = `w-full px-4 py-3 rounded-xl outline-none transition-all ${theme === 'light'
            ? 'bg-gray-50 border border-gray-200 focus:border-blue-500 text-gray-900'
            : 'bg-[#1a1a1a] border border-white/10 focus:border-blue-500 text-white placeholder:text-gray-600'
        }`

    const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#0a0a0a]'} text-white overflow-y-auto no-scrollbar`}>
            
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Header - Matching Screenshot */}
            <div className={`px-4 md:px-8 py-4 shrink-0 sticky top-0 z-10 ${theme === 'light' ? 'bg-gray-50/80' : 'bg-[#0a0a0a]/80'} backdrop-blur-md`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-6">
                        <h1 className={`text-4xl font-bold tracking-tight ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            Financial Dashboard
                        </h1>
                        {/* Personal/Business Switcher */}
                        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                            <button 
                                onClick={() => setBudgetType('personal')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${budgetType === 'personal' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                Personal
                            </button>
                            <button 
                                onClick={() => setBudgetType('business')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${budgetType === 'business' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                Business
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 mr-2">
                             <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-[#151515] border-white/10 text-gray-400'}`}>
                                <span>{currentTimeRange}</span>
                                <ChevronDown className="h-4 w-4" />
                             </div>
                             <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-[#151515] border-white/10 text-gray-400'}`}>
                                <Calendar className="h-4 w-4" />
                                <span>Custom Range</span>
                             </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleExportPDF} className={`p-2 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-[#151515] border-white/10 text-gray-400'}`}>
                                <FileText className="h-4 w-4" />
                            </button>
                            <button onClick={handlePrint} className={`p-2 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-[#151515] border-white/10 text-gray-400'}`}>
                                <Printer className="h-4 w-4" />
                            </button>
                            <button onClick={handleExportCSV} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-[#151515] border-white/10 text-gray-400'}`}>
                                <Download className="h-4 w-4" />
                                <span>CSV</span>
                            </button>
                            <button onClick={handleExportJSON} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-[#151515] border-white/10 text-gray-400'}`}>
                                <Download className="h-4 w-4" />
                                <span>JSON</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Hero Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {/* Income Card */}
                    <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-500/20 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400">Total Income</h3>
                            <button 
                                onClick={() => { setAddEntryType('income'); setShowAddModal(true); }}
                                className="flex items-center gap-1.5 text-xs font-bold text-green-500 hover:text-green-400"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Income <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="text-4xl font-bold text-green-500">${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>

                    {/* Expense Card */}
                    <div className="p-6 rounded-2xl bg-[#1a0d0d] border border-red-500/20 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400">Total Expenses</h3>
                            <button 
                                onClick={() => { setAddEntryType('expense'); setShowAddModal(true); }}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-400"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Expense <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="text-4xl font-bold text-red-500">${stats.expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>

                    {/* Profit/Loss Card */}
                    <div className={`p-6 rounded-2xl shadow-xl transition-colors duration-500 ${
                        stats.profit > 0 ? 'bg-green-600 border border-green-500 shadow-green-500/10' : 
                        stats.profit < 0 ? 'bg-red-600 border border-red-500 shadow-red-500/10' : 
                        'bg-blue-600 border border-blue-500 shadow-blue-500/10'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white/70">Net Profit/Loss</h3>
                            <button onClick={() => setShowAdvisor(true)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                                <Sparkles className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div className="text-4xl font-bold text-white">${stats.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-xs font-bold text-white/80 mt-2 uppercase tracking-tight">
                            {stats.profit > 0 ? 'Profit Margin Active' : stats.profit < 0 ? 'Deficit Warning' : 'Break-Even Status'}
                        </div>
                    </div>
                </div>

                {/* Tax Deductible Bar */}
                <div className="mt-6 p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-between group cursor-pointer hover:bg-purple-900/30 transition-colors">
                    <div>
                        <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Tax-Deductible Inventory</div>
                        <div className="text-2xl font-bold text-purple-400">${stats.taxDeductible.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="text-[10px] font-bold text-gray-500 mt-1">{stats.taxItemsCount} items marked for tax deduction</div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-purple-400 opacity-50 transition-transform group-hover:translate-y-0.5" />
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 mt-6 border-b border-white/5 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'transactions', label: 'Transactions' },
                        { id: 'categories', label: 'Categories' },
                        { id: 'planning', label: 'Planning' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setViewMode(tab.id as any)}
                            className={`px-4 md:px-8 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-tight transition-all relative shrink-0 ${viewMode === tab.id 
                                ? 'text-white' 
                                : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {tab.label}
                            {viewMode === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 animate-in fade-in" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 custom-scrollbar">
                {viewMode === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 animate-in fade-in duration-500 pb-10">
                        {/* Summary Chart (Pie) */}
                        <div className={`p-6 md:p-8 rounded-3xl ${glassCardStyle}`}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold">Category Breakdown</h3>
                                <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                                    <PieChartIcon className="h-4 w-4 p-0.5 text-blue-400" />
                                </div>
                            </div>
                            <div className="h-[250px] md:h-[300px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }]}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.type === 'income' ? '#10b981' : (COLORS[index % COLORS.length])} 
                                                />
                                            ))}
                                            {categoryData.length === 0 && <Cell fill="#1a1a1a" />}
                                        </Pie>
                                        <Tooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload
                                                    return (
                                                        <div className="bg-[#111] border border-white/10 p-4 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className={`w-2 h-2 rounded-full ${data.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                <div className="text-xs font-black uppercase tracking-widest text-white">{data.name}</div>
                                                            </div>
                                                            <div className="text-xl font-bold text-white mb-1">${data.value.toLocaleString()}</div>
                                                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                                                                {data.type === 'income' ? 'Total Assets Contribution' : 'Relative Spending Impact'}
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Net Flow</span>
                                    <span className={`text-2xl md:text-3xl font-black ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        ${Math.abs(stats.profit).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                    </span>
                                </div>

                                {/* Detailed breakdown list below pie chart */}
                                <div className="mt-8 space-y-3 max-h-[200px] overflow-y-auto no-scrollbar scroll-smooth">
                                    {categoryData.map((item, idx) => (
                                        <div key={item.name} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.type === 'income' ? '#10b981' : COLORS[idx % COLORS.length] }} />
                                                <div className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-tight">{item.name}</div>
                                            </div>
                                            <div className={`text-xs font-black ${item.type === 'income' ? 'text-green-500' : 'text-white'}`}>
                                                ${item.value.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Performance Chart (Bar) */}
                        <div className={`p-6 md:p-8 rounded-3xl ${glassCardStyle}`}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold">Monthly Performance</h3>
                                <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                                    <BarChart className="h-4 w-4 p-0.5 text-blue-400" />
                                </div>
                            </div>
                            <div className="h-[250px] md:h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyPerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#555', fontSize: 10}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#555', fontSize: 10}} />
                                        <Tooltip 
                                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        />
                                        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Movements Section */}
                        <div className={`p-6 md:p-8 rounded-3xl ${glassCardStyle} lg:col-span-2`}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold">Recent Financial Flow</h3>
                                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">Automated Ledger</div>
                            </div>
                            <div className="space-y-4">
                                {allBudgetItems.length === 0 ? (
                                    <div className="py-20 text-center opacity-20">No financial movements tracked.</div>
                                ) : (
                                    allBudgetItems.slice(0, 10).map(item => (
                                        <div key={item.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.item_metadata?.entry_type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {item.item_metadata?.entry_type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-bold truncate pr-4">{item.title}</div>
                                                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">{item.item_metadata?.category || 'General'} • {item.item_metadata?.date}</div>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-4 shrink-0">
                                                <div className={`text-sm font-black ${item.item_metadata?.entry_type === 'income' ? 'text-green-500' : 'text-white'}`}>
                                                    {item.item_metadata?.entry_type === 'income' ? '+' : '-'}${parseFloat(item.item_metadata?.amount || 0).toLocaleString()}
                                                </div>
                                                <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500/50 hover:text-red-500 transition-all">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'planning' && (
                    <div className="mt-6 animate-in slide-in-from-bottom-4 duration-500">
                         <div className={`p-8 rounded-3xl ${glassCardStyle}`}>
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">Budget vs Actual ({currentTimeRange})</h3>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                                    Set monthly targets and track your performance. Positive variance in Income is good (<span className="text-green-500 underline underline-offset-4 decoration-2">Green</span>), positive variance in Expenses is bad (<span className="text-red-500 underline underline-offset-4 decoration-2">Red</span>).
                                </p>
                            </div>

                            <div className="w-full">
                                {/* Mobile View - Cards */}
                                <div className="md:hidden space-y-4">
                                    {[
                                        { label: 'Service Income', type: 'Income', target: 0, actual: 0, color: 'text-green-500' },
                                        { label: 'Product Sales', type: 'Income', target: 0, actual: 0, color: 'text-green-500' },
                                        { label: 'Consulting', type: 'Income', target: 0, actual: 0, color: 'text-green-500' },
                                        { label: 'Other Income', type: 'Income', target: 0, actual: 0, color: 'text-green-500' },
                                    ].map(item => (
                                        <div key={item.label} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div className="text-lg font-black">{item.label}</div>
                                                <div className={`text-[10px] font-bold uppercase ${item.color}`}>{item.type}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Target</div>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                                        <input type="text" defaultValue="0.00" className="w-full bg-black/40 border border-white/10 rounded-lg px-6 py-1 text-sm font-bold outline-none" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Actual</div>
                                                    <div className="text-sm font-bold">${item.actual.toFixed(2)}</div>
                                                </div>
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 w-0" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View - Table */}
                                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5 pb-4">
                                                <th className="text-left py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-1/4">Category</th>
                                                <th className="text-left py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</th>
                                                <th className="text-left py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Budget Target</th>
                                                <th className="text-left py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actual</th>
                                                <th className="text-left py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Variance</th>
                                                <th className="text-left py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {[
                                                { label: 'Service Income', type: 'Income', target: 0, actual: 0, color: 'text-green-500' },
                                                { label: 'Product Sales', type: 'Income', target: 0, actual: 0, color: 'text-green-500' },
                                                { label: 'Consulting', type: 'Income', target: 0, actual: 0, color: 'text-green-500' },
                                                { label: 'Other Income', type: 'Income', target: 0, actual: 0, color: 'text-green-500' },
                                            ].map(item => (
                                                <tr key={item.label} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-6 font-bold text-sm">{item.label}</td>
                                                    <td className={`py-6 text-[10px] font-bold uppercase ${item.color}`}>{item.type}</td>
                                                    <td className="py-6">
                                                        <div className="relative w-24">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                                            <input 
                                                                type="text" 
                                                                defaultValue="0.00" 
                                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-7 py-1.5 text-xs font-bold outline-none focus:border-blue-500"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-6 font-bold text-sm">${item.actual.toFixed(2)}</td>
                                                    <td className="py-6 font-bold text-sm text-green-500">+0.00</td>
                                                    <td className="py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-white/10 w-0" />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-500">0%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                         </div>
                    </div>
                )}

                {viewMode === 'transactions' && (
                    <div className="mt-6 space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className={`p-8 rounded-3xl ${glassCardStyle}`}>
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">Transaction Ledger</h3>
                                <p className="text-xs text-gray-500">View all your individual income and expense records. &quot;Manual&quot; income entries can be deleted here if they duplicate your Invoices.</p>
                            </div>

                            <div className="space-y-8">
                                {/* Income Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-green-500 mb-4 px-2">Income & Invoices</h4>
                                    
                                    {/* Mobile View - Cards */}
                                    <div className="md:hidden space-y-3">
                                        {allBudgetItems.filter(i => i.item_metadata?.entry_type === 'income').length === 0 ? (
                                            <div className="p-8 text-center text-xs text-gray-600 italic">No income records found.</div>
                                        ) : (
                                            allBudgetItems.filter(i => i.item_metadata?.entry_type === 'income').map(item => (
                                                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.item_metadata?.date}</div>
                                                        <div className="text-sm font-black text-green-500">${parseFloat(item.item_metadata?.amount).toLocaleString()}</div>
                                                    </div>
                                                    <div className="text-xs font-bold text-white">{item.item_metadata?.category || 'Revenue'}</div>
                                                    <div className="text-[11px] text-gray-400">{item.title}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Desktop View - Table */}
                                    <div className="hidden md:block w-full overflow-hidden rounded-xl border border-white/5">
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-white/5">
                                                        <th className="text-left p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                                                        <th className="text-left p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Source</th>
                                                        <th className="text-left p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
                                                        <th className="text-left p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allBudgetItems.filter(i => i.item_metadata?.entry_type === 'income').length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="p-8 text-center text-xs text-gray-600 italic">No income records found.</td>
                                                        </tr>
                                                    ) : (
                                                        allBudgetItems.filter(i => i.item_metadata?.entry_type === 'income').map(item => (
                                                            <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                                                <td className="p-4 text-xs font-medium text-gray-400">{item.item_metadata?.date}</td>
                                                                <td className="p-4 text-xs font-bold text-white">{item.item_metadata?.category || 'Revenue'}</td>
                                                                <td className="p-4 text-xs text-gray-400">{item.title}</td>
                                                                <td className="p-4 text-sm font-black text-green-500">${parseFloat(item.item_metadata?.amount).toLocaleString()}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Expenses Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-red-500 mb-4 px-2">Expenses</h4>
                                    
                                    {/* Mobile View - Cards */}
                                    <div className="md:hidden space-y-3">
                                        {allBudgetItems.filter(i => i.item_metadata?.entry_type === 'expense').length === 0 ? (
                                            <div className="p-8 text-center text-xs text-gray-600 italic">No expense records found.</div>
                                        ) : (
                                            allBudgetItems.filter(i => i.item_metadata?.entry_type === 'expense').map(item => (
                                                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.item_metadata?.date}</div>
                                                        <div className="text-sm font-black text-red-500">${parseFloat(item.item_metadata?.amount).toLocaleString()}</div>
                                                    </div>
                                                    <div className="text-xs font-bold text-white">{item.item_metadata?.category || 'General'}</div>
                                                    <div className="text-[11px] text-gray-400">{item.title}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Desktop View - Table */}
                                    <div className="hidden md:block w-full overflow-hidden rounded-xl border border-white/5">
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-white/5">
                                                        <th className="text-left p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                                                        <th className="text-left p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                                                        <th className="text-left p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
                                                        <th className="text-left p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allBudgetItems.filter(i => i.item_metadata?.entry_type === 'expense').length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="p-8 text-center text-xs text-gray-600 italic">No expense records found.</td>
                                                        </tr>
                                                    ) : (
                                                        allBudgetItems.filter(i => i.item_metadata?.entry_type === 'expense').map(item => (
                                                            <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                                                <td className="p-4 text-xs font-medium text-gray-400">{item.item_metadata?.date}</td>
                                                                <td className="p-4 text-xs font-bold text-white">{item.item_metadata?.category || 'General'}</td>
                                                                <td className="p-4 text-xs text-gray-400">{item.title}</td>
                                                                <td className="p-4 text-sm font-black text-red-500">${parseFloat(item.item_metadata?.amount).toLocaleString()}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'categories' && (
                    <div className="mt-6 animate-in fade-in duration-500">
                        <div className={`p-8 rounded-3xl ${glassCardStyle}`}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold">Manage Categories</h3>
                                <button
                                    onClick={() => setShowAddCategoryModal(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-red-900/20 transition-all"
                                >
                                    <Plus className="h-4 w-4" /> Add Category
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h4 className="text-sm font-bold text-green-500 mb-6 uppercase tracking-widest">Income Categories</h4>
                                    <div className="space-y-3">
                                        {financialCategories.income.map(cat => (
                                            <div key={cat} className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-green-500 font-bold hover:bg-green-500/10 transition-colors cursor-pointer text-lg">
                                                {cat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-red-500 mb-6 uppercase tracking-widest">Expense Categories</h4>
                                    <div className="space-y-3">
                                        {financialCategories.expense.map(cat => (
                                            <div key={cat} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 font-bold hover:bg-red-500/10 transition-colors cursor-pointer text-lg">
                                                {cat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#111111]'} w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5`}>
                        <div className="px-10 py-8 bg-[#1a1a1a] flex items-center justify-between border-b border-white/5">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Record {addEntryType}</h2>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${budgetType === 'business' ? 'bg-indigo-500 text-white' : 'bg-blue-600 text-white'}`}>
                                {budgetType} Ledger
                            </div>
                        </div>

                        <form onSubmit={async (e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)
                            
                            const amount = fd.get("amount")
                            if (!amount || parseFloat(amount.toString()) <= 0) {
                                toast.error("Please enter a valid amount")
                                return
                            }

                            await addItem({
                                type: "note",
                                category: "Budget",
                                title: fd.get("title"),
                                item_metadata: {
                                    is_budget: true,
                                    budget_type: budgetType,
                                    entry_type: addEntryType,
                                    amount: fd.get("amount"),
                                    category: fd.get("category"),
                                    date: fd.get("date") || format(new Date(), 'yyyy-MM-dd'),
                                    is_tax_deductible: fd.get("is_tax_deductible") === 'on',
                                    notes: fd.get("notes")
                                }
                            })
                            setShowAddModal(false)
                            toast.success("Command captured.")
                        }} className="p-10 space-y-8">
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Description</label>
                                    <input name="title" required className={inputStyle} placeholder="e.g. Weekly Payroll, Customer Invoice..." />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Category</label>
                                    <select name="category" className={inputStyle}>
                                        {(addEntryType === 'income' ? financialCategories.income : financialCategories.expense).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Amount</label>
                                    <div className="relative">
                                        <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${addEntryType === 'income' ? 'text-green-500' : 'text-red-500'}`} />
                                        <input name="amount" type="number" step="0.01" required className={inputStyle + " pl-10"} placeholder="0.00" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Entry Date</label>
                                    <input name="date" type="date" className={inputStyle} defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input type="checkbox" name="is_tax_deductible" id="tax_check" className="h-5 w-5 rounded-lg accent-purple-600" />
                                    <label htmlFor="tax_check" className="text-xs font-bold text-gray-400 cursor-pointer">Tax Deductible?</label>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Supplementary Notes</label>
                                    <textarea name="notes" className={inputStyle + " h-24 resize-none"} placeholder="Internal documentation..." />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-400 hover:text-white transition-colors'}`}>Discard</button>
                                <button type="submit" className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] text-white shadow-2xl transition-all active:scale-95 ${addEntryType === 'income' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}>Execute command</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add Category Modal */}
            {showAddCategoryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#111111]'} w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5`}>
                        <div className="px-10 py-8 bg-[#1a1a1a] flex items-center justify-between border-b border-white/5">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white">New Category</h2>
                        </div>

                        <form onSubmit={async (e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)
                            
                            await addItem({
                                type: "note",
                                category: "Budget",
                                title: fd.get("title"),
                                item_metadata: {
                                    is_financial_category: true,
                                    budget_type: budgetType,
                                    category_type: fd.get("category_type"),
                                }
                            })
                            setShowAddCategoryModal(false)
                            toast.success("Category added to your ledger.")
                        }} className="p-10 space-y-8">
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Category Name</label>
                                    <input name="title" required className={inputStyle} placeholder="e.g. Advertising, Lab Supplies..." />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Category Type</label>
                                    <select name="category_type" className={inputStyle}>
                                        <option value="expense">Expense Category</option>
                                        <option value="income">Income Category</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddCategoryModal(false)} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-400 hover:text-white transition-colors'}`}>Cancel</button>
                                <button type="submit" className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] text-white shadow-2xl bg-red-600 hover:bg-red-500 transition-all active:scale-95`}>Create Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* AI Advisor Modal */}
            {showAdvisor && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#111111]'} w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/5`}>
                        <div className="px-12 py-10 bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-between border-b border-white/5">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Budget Advisor</h2>
                                </div>
                                <p className="text-blue-100/60 font-medium text-sm">Powered by Vault Quantum Analytics</p>
                            </div>
                            <button onClick={() => setShowAdvisor(false)} className="p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all">
                                <Plus className="h-6 w-6 rotate-45" />
                            </button>
                        </div>

                        <div className="p-12 space-y-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stability Score</div>
                                    <div className="text-4xl font-black text-white">{stats.profit > 0 ? '8.4' : '4.2'}<span className="text-sm font-bold text-gray-500"> / 10</span></div>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Burn Rate</div>
                                    <div className="text-4xl font-black text-white">{stats.income > 0 ? (stats.expenses / stats.income * 100).toFixed(0) : '100'}%</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Strategic Analysis</h3>
                                <div className={`p-8 rounded-[2rem] leading-relaxed font-medium text-lg ${theme === 'light' ? 'bg-gray-50 text-gray-800' : 'bg-white/5 text-gray-300 border border-white/5'}`}>
                                    "{advisorInsights}"
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Action Items</h3>
                                <div className="grid gap-3">
                                    {stats.profit < 0 && (
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            Immediate deficit detected. Review highest spending categories.
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-500/5 border border-green-500/10 text-green-400 text-sm font-bold">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        Automation: Setup periodic recurring transfers to savings.
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-blue-400 text-sm font-bold">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        Optimization: Tax deductible records found ({stats.taxItemsCount}). Save all receipts.
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setShowAdvisor(false)} className="w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[13px] shadow-2xl shadow-blue-500/20 transition-all active:scale-95">
                                Acknowledge Insights
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
