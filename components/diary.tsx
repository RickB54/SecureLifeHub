"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Search, Plus, Calendar, Mic, Image, Save, Trash2, X, Smile, MoreHorizontal, Edit3, ChevronLeft, ChevronRight, MicOff, Star } from "lucide-react"
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns"

interface DiaryEntry {
    id: string
    title: string
    content: string
    date: Date
    mood: string
    weather?: string
    tags: string[]
    images: string[]
    isFavorite: boolean
}

// Simple rich text editable div
const RichEditor = ({ content, onChange, isListening }: { content: string, onChange: (val: string) => void, isListening: boolean }) => {
    return (
        <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full h-full min-h-[400px] bg-transparent border-none outline-none resize-none text-lg leading-relaxed p-4 ${isListening ? 'animate-pulse bg-blue-500/5 rounded-xl' : ''}`}
            placeholder="Dear Diary..."
        />
    )
}

export default function Diary({ records, addItem, updateItem, deleteItem, theme }: any) {
    const [view, setView] = useState<'list' | 'calendar' | 'editor'>('list')
    const [selectedEntry, setSelectedEntry] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterMood, setFilterMood] = useState<string | null>(null)

    // Editor State
    const [editorTitle, setEditorTitle] = useState("")
    const [editorContent, setEditorContent] = useState("")
    const [editorDate, setEditorDate] = useState<string>(new Date().toISOString().slice(0, 16))
    const [editorMood, setEditorMood] = useState("😊")
    const [editorTags, setEditorTags] = useState<string[]>([])
    const [isListening, setIsListening] = useState(false)

    // Voice to Text
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            // @ts-ignore
            recognitionRef.current = new window.webkitSpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = ''
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript
                    }
                }
                if (finalTranscript) {
                    setEditorContent(prev => prev + " " + finalTranscript)
                }
            }
        }
    }, [])

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
        } else {
            recognitionRef.current?.start()
            setIsListening(true)
        }
    }

    // Filter Entries
    const entries = useMemo(() => {
        return records
            .filter((r: any) => r.type === 'diary' || r.category === 'Diary')
            .map((r: any) => ({
                id: r.id,
                title: r.title || "Untitled Entry",
                content: r.notes || "",
                date: new Date(r.item_metadata?.date || r.created_at),
                mood: r.item_metadata?.mood || "😐",
                tags: r.item_metadata?.tags || [],
                isFavorite: r.is_favorite
            }))
            .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
    }, [records])

    const filteredEntries = entries.filter((e: any) => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesMood = filterMood ? e.mood === filterMood : true
        return matchesSearch && matchesMood
    })

    const handleSave = async () => {
        const payload = {
            type: "note", // Must be a valid ENUM: password, contact, card, note
            title: editorTitle || "Untitled Entry",
            category: "Diary", // Used for filtering
            notes: editorContent,
            is_favorite: false,
            item_metadata: {
                date: editorDate,
                mood: editorMood,
                tags: editorTags,
                type: "diary_entry" // Specific type for the UI
            }
        }

        if (selectedEntry?.id) {
            await updateItem(selectedEntry.id, payload)
        } else {
            await addItem(payload)
        }
        setView('list')
        setSelectedEntry(null)
    }

    const openEditor = (entry?: any) => {
        if (entry) {
            setSelectedEntry(entry)
            setEditorTitle(entry.title)
            setEditorContent(entry.content)
            setEditorDate(new Date(entry.date).toISOString().slice(0, 16))
            setEditorMood(entry.mood)
            setEditorTags(entry.tags || [])
        } else {
            setSelectedEntry(null)
            setEditorTitle("")
            setEditorContent("")
            setEditorDate(new Date().toISOString().slice(0, 16))
            setEditorMood("😊")
            setEditorTags([])
        }
        setView('editor')
    }

    // Calendar Helper
    const [currentMonth, setCurrentMonth] = useState(new Date())

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-[#f8f9fa] text-gray-900' : 'bg-[#121212] text-white'} overflow-hidden`}>
            {/* Header */}
            <div className={`p-6 pb-4 border-b ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/5'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <span className="text-4xl">📔</span> Digital Diary
                    </h1>
                    <button
                        onClick={() => openEditor()}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-2xl font-bold shadow-lg shadow-pink-500/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" /> New Entry
                    </button>
                </div>

                {view === 'list' && (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {/* Search */}
                        <div className={`flex-1 flex items-center px-4 py-3 rounded-2xl border ${theme === 'light' ? 'bg-gray-100 border-transparent' : 'bg-black/20 border-white/10'}`}>
                            <Search className="h-5 w-5 text-gray-400 mr-2" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search memories..."
                                className="bg-transparent border-none outline-none w-full font-medium"
                            />
                        </div>

                        {/* Mood Filter */}
                        <div className="flex gap-2">
                            {['😊', '🥰', '😐', '😢', '😡', '😴'].map(mood => (
                                <button
                                    key={mood}
                                    onClick={() => setFilterMood(filterMood === mood ? null : mood)}
                                    className={`h-12 w-12 flex items-center justify-center rounded-2xl text-xl transition-all ${filterMood === mood
                                        ? 'bg-pink-500 text-white shadow-lg scale-110'
                                        : theme === 'light' ? 'bg-white hover:bg-gray-50 border border-gray-200' : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden relative">
                {view === 'editor' ? (
                    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
                        {/* Editor Toolbar */}
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setView('list')} className="p-2 hover:bg-gray-500/10 rounded-full">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <div className="flex gap-2">
                                <button onClick={toggleListening} className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-500/10 text-gray-500'}`}>
                                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </button>
                                <button onClick={handleSave} className="bg-blue-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2">
                                    <Save className="h-4 w-4" /> Save
                                </button>
                            </div>
                        </div>

                        {/* Editor Surface */}
                        <div className={`flex-1 rounded-3xl p-8 shadow-2xl overflow-y-auto custom-scrollbar ${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'}`}>
                            {/* Metadata Inputs */}
                            <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-500/10 pb-6">
                                <input
                                    type="date"
                                    value={editorDate.slice(0, 10)}
                                    onChange={(e) => setEditorDate(e.target.value)}
                                    className="bg-transparent font-mono text-sm text-gray-500 outline-none"
                                />
                                <div className="flex gap-2">
                                    {['😊', '🥰', '😐', '😢', '😡'].map(mood => (
                                        <button
                                            key={mood}
                                            onClick={() => setEditorMood(mood)}
                                            className={`text-2xl transition-transform hover:scale-125 ${editorMood === mood ? 'scale-125 drop-shadow-md' : 'opacity-50'}`}
                                        >
                                            {mood}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <input
                                value={editorTitle}
                                onChange={(e) => setEditorTitle(e.target.value)}
                                placeholder="Title your day..."
                                className="w-full bg-transparent text-4xl font-bold mb-6 outline-none placeholder:text-gray-300"
                            />

                            <RichEditor content={editorContent} onChange={setEditorContent} isListening={isListening} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        {filteredEntries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                                <div className="text-8xl mb-4">📔</div>
                                <h2 className="text-2xl font-bold mb-2">Your diary is empty</h2>
                                <p>Start writing your story today.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredEntries.map((entry: any) => (
                                    <div
                                        key={entry.id}
                                        onClick={() => openEditor(entry)}
                                        className={`group relative rounded-[2rem] p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl ${theme === 'light' ? 'bg-white shadow-lg shadow-gray-200/50' : 'bg-[#1e1e1e] border border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="text-4xl bg-gray-500/5 p-3 rounded-2xl">{entry.mood}</div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold font-mono text-gray-400 opacity-50">{format(new Date(entry.date), 'dd')}</div>
                                                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">{format(new Date(entry.date), 'MMM')}</div>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold mb-2 line-clamp-1">{entry.title}</h3>
                                        <p className={`line-clamp-3 text-sm leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {entry.content}
                                        </p>

                                        <div className="mt-4 pt-4 border-t border-gray-500/10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); if (confirm("Delete this entry?")) deleteItem(entry.id) }}
                                                className="p-2 hover:bg-red-500/10 text-red-500 rounded-full"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                Read more <ChevronRight className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
