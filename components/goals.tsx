"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Target, Trash2, CheckCircle2, Circle, Trophy, History, LayoutDashboard, TrendingUp, Calendar, Medal, ImageIcon, Pencil, HelpCircle } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import AddGoalModal from "./modals/add-goal-modal"
import Lightbox from "./media/lightbox"
import { toast } from "sonner"
import { MOCKED_GOALS } from "../lib/mock-data"
import MockDataBanner from "./ui/mock-data-banner"

interface GoalsProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<void>
    deleteItem: (id: string) => Promise<void>
    theme: string
    initialTab?: string
    mockSettings?: Record<string, boolean>
}

export default function Goals({ records = [], addItem, updateItem, deleteItem, theme, initialTab = "active", mockSettings }: GoalsProps) {
    const [activeTab, setActiveTab] = useState(initialTab) // 'dashboard', 'active', 'history', 'habits'
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingGoal, setEditingGoal] = useState<any>(null)

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxItems, setLightboxItems] = useState<any[]>([])
    const [lightboxIndex, setLightboxIndex] = useState(0)

    // Mock data state
    const [showMockData, setShowMockData] = useState(false)
    const [isForcedMock, setIsForcedMock] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const dismissed = localStorage.getItem('goals_mock_dismissed') === 'true'
            const localMock = mockSettings?.['type-goals'] || false
            
            setIsForcedMock(localMock)
            
            // Show mock if forced OR (no real records AND not dismissed)
            const realRecordsCount = records.filter(r => r.item_metadata?.is_goal || r.category === "Goals").length

            if (localMock) {
                setShowMockData(true)
            } else if (realRecordsCount === 0 && !dismissed) {
                setShowMockData(true)
            } else {
                setShowMockData(false)
            }
        }
    }, [records, mockSettings])

    const handleClearMockData = () => {
        setShowMockData(false)
        if (typeof window !== 'undefined') {
            localStorage.setItem('goals_mock_dismissed', 'true')
            localStorage.setItem('goals_mock_enabled', 'false')
            window.dispatchEvent(new Event('storage'))
        }
    }

    const isDark = theme !== 'light'
    
    // Filter for items that are clearly identified as goals
    const allGoals = useMemo(() => {
        const base = showMockData ? MOCKED_GOALS : records;
        return base.filter(r => r.item_metadata?.is_goal || r.category === "Goals")
    }, [records, showMockData])

    // Helper to calculate progress
    const getProgress = (item: any) => {
        const steps = item.item_metadata?.steps || []
        if (!steps || steps.length === 0) return 0
        const completed = steps.filter((s: any) => s.completed).length
        return Math.round((completed / steps.length) * 100)
    }

    const activeGoals = allGoals.filter(g => getProgress(g) < 100)
    const completedGoals = allGoals.filter(g => getProgress(g) === 100)

    // Analytics Data
    const totalGoals = allGoals.length
    const completedCount = completedGoals.length
    const activeCount = activeGoals.length
    const successRate = totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : 0

    const chartData = [
        { name: 'Active', value: activeCount, color: '#ec4899' }, // pink-500
        { name: 'Completed', value: completedCount, color: '#10b981' }, // green-500
    ]

    // Badges Logic
    const badges = [
        { id: 'starter', name: "Goal Setter", icon: Target, unlocked: totalGoals >= 1, desc: "Created your first goal" },
        { id: 'achiever', name: "Achiever", icon: CheckCircle2, unlocked: completedCount >= 1, desc: "Completed 1 goal" },
        { id: 'pro', name: "Pro Planner", icon: Trophy, unlocked: completedCount >= 5, desc: "Completed 5 goals" },
        { id: 'master', name: "Life Master", icon: Medal, unlocked: completedCount >= 10, desc: "Completed 10 goals" },
    ]

    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm hover:shadow-md"
        : "bg-[#1e1e1e] border border-white/10 hover:border-white/20"

    const toggleStep = async (item: any, stepIndex: number) => {
        if (!item.item_metadata?.steps) return

        const newSteps = [...item.item_metadata.steps]
        newSteps[stepIndex].completed = !newSteps[stepIndex].completed

        const updatedMetadata = {
            ...item.item_metadata,
            steps: newSteps
        }

        await updateItem(item.id, { item_metadata: updatedMetadata })
    }

    const openLightbox = (goal: any, photoIndex: number) => {
        const photos = goal.item_metadata?.photos || []
        const items = photos.map((url: string, idx: number) => ({
            id: `${goal.id}-photo-${idx}`,
            title: goal.title,
            category: 'Goal Photo',
            created_at: goal.created_at,
            item_metadata: { url, notes: `Photo ${idx + 1} of ${photos.length}` }
        }))
        setLightboxItems(items)
        setLightboxIndex(photoIndex)
        setLightboxOpen(true)
    }

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500 flex items-center gap-3">
                            <Target className="h-8 w-8 text-pink-500" /> Goals & Timeline
                        </h1>
                        <p className={`mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            Track your life goals, milestones, and achievements.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10 pb-4 justify-between items-center">
                    <div className="flex gap-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { id: 'active', label: 'Active Goals', icon: Target },
                            { id: 'habits', label: 'Habit Stacks', icon: TrendingUp },
                            { id: 'history', label: 'History', icon: History }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? "bg-pink-600 text-white shadow-lg shadow-pink-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" /> {tab.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center bg-pink-600 text-white px-6 py-2 rounded-xl shadow-md hover:bg-pink-700 transition-all font-medium text-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Set Goal
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                {showMockData && (
                    <MockDataBanner theme={theme} onClear={handleClearMockData} isForced={isForcedMock} pageName="Goals" />
                )
                }

                {/* === DASHBOARD TAB === */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className={`p-6 rounded-2xl ${glassCardStyle} flex flex-col items-center justify-center text-center`}>
                                <div className="text-3xl font-bold text-pink-500 mb-1">{totalGoals}</div>
                                <div className="text-xs uppercase font-bold opacity-50">Total Goals</div>
                            </div>
                            <div className={`p-6 rounded-2xl ${glassCardStyle} flex flex-col items-center justify-center text-center`}>
                                <div className="text-3xl font-bold text-green-500 mb-1">{completedCount}</div>
                                <div className="text-xs uppercase font-bold opacity-50">Completed</div>
                            </div>
                            <div className={`p-6 rounded-2xl ${glassCardStyle} flex flex-col items-center justify-center text-center`}>
                                <div className="text-3xl font-bold text-orange-500 mb-1">{activeCount}</div>
                                <div className="text-xs uppercase font-bold opacity-50">In Progress</div>
                            </div>
                            <div className={`p-6 rounded-2xl ${glassCardStyle} flex flex-col items-center justify-center text-center`}>
                                <div className="text-3xl font-bold text-blue-500 mb-1">{successRate}%</div>
                                <div className="text-xs uppercase font-bold opacity-50">Success Rate</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Chart */}
                            <div className={`md:col-span-1 p-6 rounded-2xl ${glassCardStyle} min-h-[300px] flex flex-col`}>
                                <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                    <TrendingUp className="h-5 w-5 text-pink-500" /> Status Breakdown
                                </h3>
                                <div className="flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '8px', border: 'none' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className={`md:col-span-2 p-6 rounded-2xl ${glassCardStyle}`}>
                                <h3 className={`font-bold mb-6 flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                    <Trophy className="h-5 w-5 text-yellow-500" /> Achievements
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {badges.map(badge => (
                                        <div key={badge.id} className={`flex flex-col items-center text-center p-4 rounded-xl transition-all ${badge.unlocked
                                            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                                            : 'bg-black/20 border border-white/5 opacity-50 grayscale'
                                            }`}>
                                            <div className={`p-3 rounded-full mb-3 ${badge.unlocked ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-gray-700 text-gray-400'}`}>
                                                <badge.icon className="h-6 w-6" />
                                            </div>
                                            <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                                            <p className="text-[10px] opacity-70">{badge.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === ACTIVE GOALS TAB === */}
                {activeTab === 'active' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                        {activeGoals.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center pt-20 opacity-50">
                                <Target className="h-16 w-16 mb-4 text-gray-600" />
                                <p className="text-gray-500">No active goals. Set one to get started!</p>
                            </div>
                        ) : (
                            activeGoals.map(item => {
                                const steps = item.item_metadata?.steps || []
                                const progress = getProgress(item)
                                const photos = item.item_metadata?.photos || []

                                return (
                                    <div key={item.id} className={`p-6 rounded-2xl ${glassCardStyle} border-l-4 border-l-pink-500 transition-all flex flex-col`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                                                    {item.item_metadata?.targetDate && (
                                                        <span className="text-xs font-mono bg-pink-500/10 text-pink-500 px-2 py-1 rounded flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(item.item_metadata.targetDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className={`text-sm mb-4 leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {item.item_metadata?.description || "No description provided."}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setEditingGoal(item)}
                                                className="text-gray-400 hover:text-blue-400 transition-colors ml-4 p-1"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => { if (confirm("Delete goal?")) deleteItem(item.id) }}
                                                className="text-gray-400 hover:text-red-500 transition-colors ml-2 p-1"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Progress */}
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs opacity-60 mb-6">
                                            <span>{progress}% Complete</span>
                                            <span>{steps.filter((s: any) => s.completed).length}/{steps.length} Steps</span>
                                        </div>

                                        {/* Photos */}
                                        {photos.length > 0 && (
                                            <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                                <div className="flex gap-2">
                                                    {photos.map((photo: string, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => openLightbox(item, idx)}
                                                            className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:opacity-80 transition-opacity relative"
                                                        >
                                                            <img src={photo} alt="Goal" className="h-full w-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Steps */}
                                        <div className="space-y-2 mt-auto">
                                            {steps.map((step: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => toggleStep(item, idx)}
                                                    className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'
                                                        }`}
                                                >
                                                    <div className={`mt-0.5 ${step.completed ? 'text-pink-500' : 'text-gray-400'}`}>
                                                        {step.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                                    </div>
                                                    <span className={`text-sm ${step.completed ? 'opacity-50 line-through' : ''} ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                                                        {step.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}

                {/* === HABIT STACKS TAB === */}
                {activeTab === 'habits' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Tab Intro */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-10 rounded-[3rem] bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent border border-pink-500/10 backdrop-blur-3xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                <TrendingUp className="h-48 w-48 -mr-16 -mt-16" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-2">Routine Architecture</h2>
                                <p className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] max-w-md leading-relaxed">Compound your growth by stacking atomic habits into unbreakable chains of execution.</p>
                            </div>
                            <button 
                                onClick={async () => {
                                    const name = prompt("Enter Architecture Name (e.g. Morning Ritual):")
                                    if (!name) return
                                    await addItem({
                                        type: "habit-stack",
                                        title: name,
                                        category: "Goals",
                                        item_metadata: {
                                            is_habit_stack: true,
                                            habits: [
                                                { trigger: "Waking up", action: "Drink 500ml water", icon: "💧" }
                                            ],
                                            color: "#ec4899",
                                            streak: 0,
                                            lastCompleted: null,
                                            history: []
                                        }
                                    })
                                }}
                                className="relative z-10 bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-pink-900/40 transition-all hover:scale-105 active:scale-95 font-black uppercase tracking-widest text-xs flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> Initialize Stack
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {records.filter(r => r.type === "habit-stack" || r.item_metadata?.is_habit_stack).map(stack => (
                                <div key={stack.id} className={`group p-10 rounded-[3.5rem] border transition-all duration-500 hover:shadow-2xl relative overflow-hidden flex flex-col ${isDark ? 'bg-[#151515] border-white/5 hover:border-pink-500/30' : 'bg-white border-gray-100 shadow-xl'}`}>
                                    {/* Stability Index Background */}
                                    <div className="absolute top-0 right-0 h-1 w-full bg-white/5 overflow-hidden">
                                        <div className="h-full bg-pink-500 transition-all duration-1000" style={{ width: `${Math.min(100, (stack.item_metadata.streak || 0) * 10)}%` }} />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-10">
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-pink-500 text-black tracking-widest">Active Link</span>
                                                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-white/5 text-gray-500 border border-white/5 tracking-widest">
                                                       {stack.item_metadata?.streak || 0} Solar Cycle Streak
                                                    </span>
                                                </div>
                                                <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase group-hover:text-pink-500 transition-colors">{stack.title}</h3>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => deleteItem(stack.id)} className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 text-gray-700 hover:text-red-500 transition-all">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Habit Chain */}
                                        <div className="space-y-0 flex-1 ml-4 border-l-2 border-dashed border-white/10 pl-10 pb-4">
                                            {(stack.item_metadata?.habits || []).map((h: any, idx: number) => (
                                                <div key={idx} className="relative py-6 group/item">
                                                    {/* Connector Dot */}
                                                    <div className="absolute -left-[3.15rem] top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#151515] border-2 border-white/10 flex items-center justify-center group-hover/item:border-pink-500 transition-colors z-20">
                                                        <div className={`h-2 w-2 rounded-full ${stack.item_metadata.lastCompleted === new Date().toDateString() ? 'bg-pink-500 shadow-[0_0_10px_#ec4899]' : 'bg-white/20'}`} />
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-6">
                                                        <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover/item:scale-110 transition-all shadow-2xl relative overflow-hidden">
                                                            <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                            {h.icon || '⚡'}
                                                        </div>
                                                        
                                                        <div className="flex-1">
                                                            <p className="text-[9px] font-black uppercase text-pink-500/60 tracking-widest mb-1">Trigger: {h.trigger}</p>
                                                            <p className="text-xl font-bold text-white uppercase tracking-tight group-hover/item:text-pink-400 transition-colors line-clamp-1">I will {h.action}</p>
                                                        </div>

                                                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={async () => {
                                                                    const trigger = prompt("Edit Trigger:", h.trigger)
                                                                    const action = prompt("Edit Action:", h.action)
                                                                    if (!action) return
                                                                    const newHabits = [...stack.item_metadata.habits]
                                                                    newHabits[idx] = { ...h, trigger: trigger || h.trigger, action }
                                                                    await updateItem(stack.id, { item_metadata: { ...stack.item_metadata, habits: newHabits } })
                                                                }}
                                                                className="p-2 text-gray-700 hover:text-white"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button 
                                                onClick={async () => {
                                                    const trigger = prompt("After what event?")
                                                    const action = prompt("What action will you take?")
                                                    if (!trigger || !action) return
                                                    const icon = prompt("Emoji Icon?", "🔥")
                                                    const newHabits = [...(stack.item_metadata.habits || []), { trigger, action, icon: icon || "🔥" }]
                                                    await updateItem(stack.id, { item_metadata: { ...stack.item_metadata, habits: newHabits } })
                                                }}
                                                className="w-full mt-6 py-4 border-2 border-dashed border-white/5 rounded-3xl text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 hover:text-pink-500 hover:border-pink-500/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus className="h-3 w-3" /> Expand Architecture
                                            </button>
                                        </div>

                                        {/* Persistence Control */}
                                        <div className="mt-12 pt-10 border-t border-white/5 grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={async () => {
                                                    const today = new Date().toDateString()
                                                    if (stack.item_metadata.lastCompleted === today) {
                                                        toast.error("Architecture secured for current cycle")
                                                        return
                                                    }
                                                    await updateItem(stack.id, { 
                                                        item_metadata: { 
                                                            ...stack.item_metadata, 
                                                            lastCompleted: today,
                                                            streak: (stack.item_metadata.streak || 0) + 1
                                                        } 
                                                    })
                                                    toast.success("Routine verified. Momentum +1 🔥")
                                                }}
                                                className="col-span-1 py-5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-[2rem] font-black uppercase italic tracking-tighter shadow-3xl shadow-pink-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px]"
                                            >
                                                Secure Today
                                            </button>
                                            <div className="col-span-1 p-4 rounded-[2rem] bg-white/2 border border-white/5 flex flex-col items-center justify-center">
                                                <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest mb-1">Stability Index</span>
                                                <p className="text-xl font-black italic text-white tracking-tighter">
                                                    {Math.min(100, (stack.item_metadata.streak || 0) * 8)}<span className="text-[10px] opacity-20 not-italic uppercase ml-1">%</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* === HISTORY TAB === */}
                {activeTab === 'history' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {completedGoals.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center pt-20 opacity-50">
                                <Trophy className="h-16 w-16 mb-4 text-yellow-600" />
                                <p className="text-gray-500">No completed goals yet. Keep going!</p>
                            </div>
                        ) : (
                            completedGoals.map(item => (
                                <div key={item.id} className={`p-6 rounded-2xl ${glassCardStyle} flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity`}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-500/20 text-green-500 rounded-full">
                                            <Trophy className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                                            <p className="text-sm opacity-60">Completed on {new Date(item.updatedAt || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-green-500 font-bold flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" /> 100%
                                        </div>
                                        <button onClick={() => { if (confirm("Delete history record?")) deleteItem(item.id) }} className="text-gray-500 hover:text-red-500 p-2">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {(showAddModal || editingGoal) && (
                <AddGoalModal
                    initialData={editingGoal}
                    onClose={() => {
                        setShowAddModal(false)
                        setEditingGoal(null)
                    }}
                    onAdd={async (data) => {
                        await addItem(data)
                        setShowAddModal(false)
                    }}
                    onEdit={async (id, data) => {
                        await updateItem(id, data)
                        setEditingGoal(null)
                    }}
                />
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <Lightbox
                    items={lightboxItems}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNext={() => setLightboxIndex((prev) => (prev + 1) % lightboxItems.length)}
                    onPrev={() => setLightboxIndex((prev) => (prev - 1 + lightboxItems.length) % lightboxItems.length)}
                    onSelect={() => {}}
                />
            )}
        </div>
    )
}
