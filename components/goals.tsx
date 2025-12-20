"use client"

import { useState } from "react"
import { Plus, Target, Trash2, CheckCircle2, Circle, Trophy, History, LayoutDashboard, TrendingUp, Calendar, Medal, ImageIcon } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import AddGoalModal from "./modals/add-goal-modal"
import Lightbox from "./media/lightbox"

interface GoalsProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<void>
    deleteItem: (id: string) => Promise<void>
    theme: string
}

export default function Goals({ records = [], addItem, updateItem, deleteItem, theme }: GoalsProps) {
    const [activeTab, setActiveTab] = useState("active") // 'dashboard', 'active', 'history'
    const [showAddModal, setShowAddModal] = useState(false)

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxItems, setLightboxItems] = useState<any[]>([])
    const [lightboxIndex, setLightboxIndex] = useState(0)

    // Filter for items that are clearly identified as goals using the new metadata flag or legacy category
    const allGoals = records.filter(r => r.item_metadata?.is_goal || r.category === "Goals")

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
                                                onClick={() => { if (confirm("Delete goal?")) deleteItem(item.id) }}
                                                className="text-gray-400 hover:text-red-500 transition-colors ml-4 p-1"
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
            {showAddModal && (
                <AddGoalModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={async (data) => {
                        await addItem(data)
                        setShowAddModal(false)
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
                />
            )}
        </div>
    )
}
