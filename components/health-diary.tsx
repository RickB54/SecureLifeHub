"use client"

import { useState, useEffect } from "react"
import { Plus, Book, Trash2, Calendar, Mic, MicOff, Loader2, HelpCircle } from "lucide-react"
import { toast } from "sonner"

interface HealthDiaryProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
    onOpenHelp?: (targetId?: string) => void
}

export default function HealthDiary({ records, addItem, deleteItem, theme, onOpenHelp }: HealthDiaryProps) {
    const [entries, setEntries] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [activeField, setActiveField] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        date: new Date().toISOString().split('T')[0]
    })

    // Filter for Diary
    useEffect(() => {
        const diaryEntries = records.filter(r => r.category === "Health Diary" || r.item_metadata?.is_diary)
        setEntries(diaryEntries)
    }, [records])

    // Speech Recognition Setup
    const startSpeechToText = (field: 'title' | 'content') => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            toast.error("Speech recognition is not supported in this browser.")
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setIsListening(true)
            setActiveField(field)
            toast.info(`Listening for ${field}...`)
        }

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setFormData(prev => ({
                ...prev,
                [field]: prev[field] ? prev[field] + " " + transcript : transcript
            }))
            setIsListening(false)
            setActiveField(null)
        }

        recognition.onerror = (event: any) => {
            console.error(event.error)
            setIsListening(false)
            setActiveField(null)
            toast.error("Error recognizing speech.")
        }

        recognition.onend = () => {
            setIsListening(false)
            setActiveField(null)
        }

        recognition.start()
    }

    // UI Styles
    const glassCardStyle = theme === 'light'
        ? "bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg border border-white/20 shadow-lg"
        : "bg-gray-800 bg-opacity-40 backdrop-filter backdrop-blur-lg border border-gray-700/50 shadow-lg"

    const headerStyle = theme === 'light'
        ? "bg-gradient-to-r from-purple-400/20 to-indigo-400/20"
        : "bg-gradient-to-r from-purple-900/40 to-indigo-900/40"

    return (
        <div className="space-y-8 p-4">
            {/* Header */}
            <div className={`p-6 rounded-2xl ${headerStyle} ${glassCardStyle}`}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center gap-3">
                            Health Diary
                            <button onClick={() => onOpenHelp?.('type-health-diary')} className="p-1 hover:text-emerald-400 opacity-50"><HelpCircle className="h-5 w-5" /></button>
                        </h1>
                        <p className="text-gray-400 mt-1 uppercase tracking-widest text-[10px] font-black opacity-70">Symptom tracking & wellness journal</p>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({
                                title: "",
                                content: "",
                                date: new Date().toISOString().split('T')[0]
                            })
                            setShowAddModal(true)
                        }}
                        className="flex items-center bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl shadow-md transition-all transform hover:scale-105"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Entry
                    </button>
                </div>
            </div>

            {/* Diary Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {entries.length === 0 ? (
                    <div className="col-span-full p-10 text-center text-gray-500">
                        No diary entries found. Write your first entry today.
                    </div>
                ) : (
                    entries.map(entry => (
                        <div key={entry.id} className={`p-6 rounded-2xl flex flex-col justify-between h-64 ${glassCardStyle} hover:shadow-xl transition-shadow`}>
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center text-sm font-medium bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full w-fit">
                                        <Calendar className="h-3 w-3 mr-2 text-purple-400" />
                                        {entry.item_metadata?.date}
                                    </div>
                                    <button
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        onClick={() => {
                                            if (confirm("Delete this entry?")) deleteItem(entry.id)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold mb-2 line-clamp-1">{entry.title}</h3>
                                <p className="text-sm opacity-70 line-clamp-5 leading-relaxed">
                                    {entry.item_metadata?.content}
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200/10 flex justify-between items-center text-xs opacity-50">
                                <span>Health Diary</span>
                                <span>Read More</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${glassCardStyle} border-none`}>
                        <h2 className="text-2xl font-bold mb-4">New Diary Entry</h2>
                        <form onSubmit={(e: any) => {
                            e.preventDefault()
                            addItem({
                                type: "note",
                                category: "Health Diary",
                                title: formData.title,
                                item_metadata: {
                                    is_diary: true,
                                    date: formData.date,
                                    content: formData.content
                                }
                            })
                            setShowAddModal(false)
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                    className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100 dark:text-gray-900' : 'bg-black/30 text-white'}`}
                                    style={{ colorScheme: theme }}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium">Title / Mood</label>
                                    <button
                                        type="button"
                                        onClick={() => startSpeechToText('title')}
                                        className={`p-1.5 rounded-full transition-all ${isListening && activeField === 'title' ? 'bg-red-500 text-white animate-pulse' : 'text-purple-500 hover:bg-purple-500/10'}`}
                                        title="Use Voice to Text"
                                    >
                                        {isListening && activeField === 'title' ? <Mic className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </button>
                                </div>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'}`}
                                    placeholder="e.g. Feeling energetic today"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium">Content</label>
                                    <button
                                        type="button"
                                        onClick={() => startSpeechToText('content')}
                                        className={`p-1.5 rounded-full transition-all ${isListening && activeField === 'content' ? 'bg-red-500 text-white animate-pulse' : 'text-purple-500 hover:bg-purple-500/10'}`}
                                        title="Use Voice to Text"
                                    >
                                        {isListening && activeField === 'content' ? <Mic className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </button>
                                </div>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                    rows={8}
                                    className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'} custom-scrollbar`}
                                    placeholder="How are you feeling properly? Symptoms? Changes?"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className={`px-5 py-2 rounded-lg hover:bg-gray-500/20 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-lg shadow-purple-900/20 transition-all">Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
