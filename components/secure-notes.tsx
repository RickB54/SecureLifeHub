"use client"

import { useState, useEffect, useRef } from "react"
import {
    Plus,
    Search,
    Trash,
    Mic,
    MicOff,
    Image as ImageIcon,
    MoreVertical,
    ChevronRight,
    ChevronDown,
    StickyNote,
    Clock,
    Star,
    Save,
    Maximize2,
    X,
    PlusCircle,
    FolderPlus,
    ArrowLeft,
    Share2,
    Lock,
    Edit3,
    Calendar
} from "lucide-react"

interface SecureNote {
    id: string
    title: string
    content: string
    updatedAt: string
    isFavorite: boolean
    images?: string[]
    section?: string
}

export default function SecureNotes({
    records,
    addItem,
    updateItem,
    deleteItem,
    theme
}: any) {
    const [notes, setNotes] = useState<SecureNote[]>([])
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const [sections, setSections] = useState<string[]>(["General", "Ideas", "Personal", "Work"])
    const [activeSection, setActiveSection] = useState<string>("all")
    const [showGallery, setShowGallery] = useState(false)

    // Mobile View Management
    const [mobileActiveView, setMobileActiveView] = useState<"list" | "editor">("list")
    const [isMobile, setIsMobile] = useState(false)

    // Local Editor State (to fix the overwriting/jumping issue)
    const [draftTitle, setDraftTitle] = useState("")
    const [draftContent, setDraftContent] = useState("")
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const recognitionRef = useRef<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Detect Mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Sync with vault items
    useEffect(() => {
        const noteItems = records
            .filter((r: any) => r.type === 'note' || r.category === 'Secure Notes' || r.type === 'secure-note')
            .map((r: any) => ({
                id: r.id,
                title: r.title || "Untitled Note",
                content: r.notes || r.content || "",
                updatedAt: r.updated_at || r.updatedAt || new Date().toISOString(),
                isFavorite: r.is_favorite || r.isFavorite || false,
                images: r.item_metadata?.images || [],
                section: r.item_metadata?.section || "General"
            }))

        setNotes(noteItems)

        // Auto-select first note if on desktop and none selected
        if (!isMobile && noteItems.length > 0 && !selectedNoteId) {
            handleSelectNote(noteItems[0].id)
        }

        // Identify unique sections
        const uniqueSections = Array.from(new Set(noteItems.map((n: any) => n.section).filter(Boolean))) as string[]
        if (uniqueSections.length > 0) {
            setSections(prev => Array.from(new Set([...prev, ...uniqueSections])))
        }
    }, [records])

    // Update Drafts when selection changes
    const handleSelectNote = (id: string) => {
        setSelectedNoteId(id)
        const note = notes.find(n => n.id === id)
        if (note) {
            setDraftTitle(note.title)
            setDraftContent(note.content)
        }
        if (isMobile) setMobileActiveView("editor")
    }

    // Auto-save logic (Debounced)
    const queueUpdate = (id: string, updates: Partial<SecureNote>) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

        saveTimeoutRef.current = setTimeout(() => {
            handleSyncUpdate(id, updates)
        }, 1000) // 1 second debounce
    }

    const handleSyncUpdate = async (id: string, updates: Partial<SecureNote>) => {
        const dbUpdates: any = {}
        if (updates.title !== undefined) dbUpdates.title = updates.title
        if (updates.content !== undefined) dbUpdates.notes = updates.content
        if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite

        const metadataUpdates: any = {}
        if (updates.images !== undefined) metadataUpdates.images = updates.images
        if (updates.section !== undefined) metadataUpdates.section = updates.section

        if (Object.keys(metadataUpdates).length > 0) {
            dbUpdates.item_metadata = metadataUpdates
        }

        await updateItem(id, dbUpdates)
    }

    // Handle Speech-to-Text
    useEffect(() => {
        if (typeof window !== 'undefined' && ('WebkitSpeechRecognition' in window || 'speechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).WebkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true

            recognitionRef.current.onresult = (event: any) => {
                let transcript = ''
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript
                }

                if (selectedNoteId) {
                    const newContent = draftContent + " " + transcript
                    setDraftContent(newContent)
                    queueUpdate(selectedNoteId, { content: newContent })
                }
            }

            recognitionRef.current.onend = () => setIsRecording(false)
        }
    }, [selectedNoteId, draftContent])

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition not supported in this browser.")
            return
        }
        if (isRecording) {
            recognitionRef.current.stop()
        } else {
            recognitionRef.current.start()
            setIsRecording(true)
        }
    }

    const handleAddNote = async () => {
        const newNote = {
            title: "New Note",
            notes: "",
            type: "note",
            category: "Secure Notes",
            item_metadata: {
                section: activeSection === "all" ? "General" : activeSection,
                images: []
            }
        }
        const created = await addItem(newNote)
        if (created) {
            handleSelectNote(created.id)
        }
    }

    const handleAddSection = () => {
        const name = prompt("Enter new section name:")
        if (name && !sections.includes(name)) {
            setSections([...sections, name])
            setActiveSection(name)
        }
    }

    const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm("Are you sure you want to delete this note?")) {
            await deleteItem(id)
            if (selectedNoteId === id) {
                setSelectedNoteId(null)
                setMobileActiveView("list")
            }
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || !selectedNoteId) return

        const note = notes.find(n => n.id === selectedNoteId)
        if (!note) return

        const newImages = [...(note.images || [])]

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (!file.type.startsWith('image/')) continue

            const reader = new FileReader()
            const promise = new Promise<string>((resolve) => {
                reader.onload = (event) => resolve(event.target?.result as string)
            })
            reader.readAsDataURL(file)
            const base64 = await promise
            newImages.push(base64)
        }

        handleSyncUpdate(selectedNoteId, { images: newImages })
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleAddImage = () => {
        fileInputRef.current?.click()
    }

    const filteredNotes = notes.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesSection = activeSection === "all" || n.section === activeSection
        return matchesSearch && matchesSection
    })

    const currentNote = notes.find(n => n.id === selectedNoteId)

    return (
        <div className={`flex flex-col h-[calc(100vh-140px)] rounded-3xl overflow-hidden border ${theme === 'light' ? 'bg-white border-gray-200 shadow-2xl' : 'bg-[#1a1a1a] border-white/5 shadow-2xl shadow-black/50'}`}>
            <div className="flex flex-1 overflow-hidden relative">

                {/* Sidebar / List View */}
                <div className={`
          ${isMobile && mobileActiveView === "editor" ? "hidden" : "flex"} 
          w-full md:w-80 flex-shrink-0 border-r flex flex-col 
          ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-[#141414] border-white/5'}
        `}>

                    {/* Header */}
                    <div className="p-4 border-b border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                <StickyNote className="h-5 w-5 text-blue-500" />
                                Secure Notes
                            </h2>
                            <button
                                onClick={handleAddNote}
                                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/40"
                            >
                                <Plus className="h-4 w-4 text-white" />
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none border transition-all ${theme === 'light' ? 'bg-white border-gray-200 focus:border-blue-500' : 'bg-black/40 border-white/5 focus:border-blue-500/50'}`}
                            />
                        </div>
                    </div>

                    {/* Sections Horizontal Scroll */}
                    <div className="px-2 py-3 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveSection("all")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeSection === "all" ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}
                        >
                            All
                        </button>
                        {sections.map(section => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeSection === section ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}
                            >
                                {section}
                            </button>
                        ))}
                        <button
                            onClick={handleAddSection}
                            className="px-2 py-1 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                        >
                            <PlusCircle className="h-3 w-3" />
                        </button>
                    </div>

                    {/* Notes List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {filteredNotes.length === 0 ? (
                            <div className="text-center py-20 opacity-30 select-none">
                                <StickyNote className="h-12 w-12 mx-auto mb-4" />
                                <p className="text-sm">No notes found</p>
                            </div>
                        ) : (
                            filteredNotes.map(note => (
                                <div
                                    key={note.id}
                                    onClick={() => handleSelectNote(note.id)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all group relative border ${selectedNoteId === note.id ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-900/30 translate-x-1' : theme === 'light' ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-sm truncate pr-6 ${selectedNoteId === note.id ? 'text-white' : ''}`}>{note.title}</h3>
                                        <div className="flex items-center gap-1">
                                            {note.isFavorite && <Star className={`h-3 w-3 fill-current ${selectedNoteId === note.id ? 'text-white' : 'text-yellow-500'}`} />}
                                        </div>
                                    </div>
                                    <p className={`text-xs h-8 overflow-hidden line-clamp-2 ${selectedNoteId === note.id ? 'text-blue-100 opacity-80' : 'text-gray-500'}`}>
                                        {note.content || "Empty note..."}
                                    </p>
                                    <div className={`mt-2 flex items-center justify-between text-[10px] ${selectedNoteId === note.id ? 'text-blue-200' : 'text-gray-500'}`}>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteNote(note.id, e)}
                                            className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-500 hover:text-white`}
                                        >
                                            <Trash className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Editor Area */}
                <div className={`
          ${isMobile && mobileActiveView === "list" ? "hidden" : "flex"}
          flex-1 flex flex-col bg-transparent relative
        `}>
                    {currentNote ? (
                        <>
                            {/* Editor Header */}
                            <div className="p-4 md:p-6 border-b border-white/5 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    {isMobile && (
                                        <button
                                            onClick={() => setMobileActiveView("list")}
                                            className="p-2 bg-white/5 rounded-xl text-gray-400"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={draftTitle}
                                            onChange={(e) => {
                                                setDraftTitle(e.target.value)
                                                queueUpdate(currentNote.id, { title: e.target.value })
                                            }}
                                            className="w-full bg-transparent text-xl md:text-3xl font-black outline-none placeholder:opacity-30"
                                            placeholder="Note Title"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const nextSec = sections[(sections.indexOf(currentNote.section || "General") + 1) % sections.length]
                                                handleSyncUpdate(currentNote.id, { section: nextSec })
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/20"
                                        >
                                            <FolderPlus className="h-3 w-3" />
                                            {currentNote.section || "General"}
                                        </button>
                                        <div className="hidden sm:flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(currentNote.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={toggleRecording}
                                            className={`p-2.5 rounded-xl transition-all ${isRecording ? 'bg-red-600 animate-pulse text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                                            title="Voice to Text"
                                        >
                                            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                        </button>

                                        <button
                                            onClick={handleAddImage}
                                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
                                            title="Add Image"
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => handleSyncUpdate(currentNote.id, { isFavorite: !currentNote.isFavorite })}
                                            className={`p-2.5 rounded-xl transition-all ${currentNote.isFavorite ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                                        >
                                            <Star className="h-4 w-4" fill={currentNote.isFavorite ? "currentColor" : "none"} />
                                        </button>

                                        <button
                                            onClick={() => setShowGallery(!showGallery)}
                                            className={`p-2.5 rounded-xl transition-all ${showGallery ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                        </button>

                                        <div className="h-6 w-px bg-white/10 mx-1" />

                                        <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400">
                                            <Maximize2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 relative flex flex-col md:flex-row h-full overflow-hidden">
                                {/* Hidden File Input for Images */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    multiple
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                />
                                <div className="flex-1 h-full p-6 md:p-8 overflow-y-auto">
                                    <textarea
                                        value={draftContent}
                                        onChange={(e) => {
                                            setDraftContent(e.target.value)
                                            queueUpdate(currentNote.id, { content: e.target.value })
                                        }}
                                        className="w-full h-full bg-transparent outline-none resize-none text-lg leading-relaxed font-medium placeholder:opacity-20 custom-scrollbar"
                                        placeholder="Start typing your secure note here..."
                                    />
                                </div>

                                {/* Gallery Panel */}
                                {showGallery && (
                                    <div className={`
                    absolute inset-0 md:relative md:inset-auto z-20
                    w-full md:w-80 border-l border-white/5 flex flex-col p-4 
                    animate-in slide-in-from-right transition-all 
                    ${theme === 'light' ? 'bg-gray-50' : 'bg-[#141414]'}
                  `}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="font-black text-xs uppercase tracking-widest text-gray-500">Image Gallery</h4>
                                            <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-white/5 rounded-lg"><X className="h-4 w-4" /></button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar">
                                            {currentNote.images && currentNote.images.length > 0 ? (
                                                currentNote.images.map((img, idx) => (
                                                    <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-blue-500 transition-all bg-black/40 shadow-xl">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button className="p-2 bg-red-600 rounded-lg shadow-lg hover:scale-110 transition-transform"
                                                                onClick={() => {
                                                                    const updated = currentNote.images?.filter((_, i) => i !== idx)
                                                                    handleSyncUpdate(currentNote.id, { images: updated })
                                                                }}
                                                            ><Trash className="h-3 w-3" /></button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 text-center py-20 opacity-20 border-2 border-dashed border-white/10 rounded-2xl">
                                                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                                    <p className="text-[10px] font-bold">No images added</p>
                                                </div>
                                            )}

                                            <button
                                                onClick={handleAddImage}
                                                className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/30 flex flex-col items-center justify-center gap-2 transition-all group"
                                            >
                                                <PlusCircle className="h-6 w-6 text-gray-600 group-hover:text-blue-500" />
                                                <span className="text-[10px] font-bold text-gray-600 group-hover:text-blue-500">Add Image</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Bar */}
                            <div className="px-4 md:px-6 py-2 border-t border-white/5 flex items-center justify-between bg-black/20 text-[9px] font-black uppercase tracking-widest text-gray-500 overflow-hidden">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 whitespace-nowrap"><Lock className="h-3 w-3 text-emerald-500" />Encrypted</span>
                                    <span className="hidden sm:inline">{draftContent.split(/\s+/).filter(Boolean).length} Words</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-blue-500/70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    Live Syncing...
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Edit3 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black mb-2 uppercase tracking-tighter">My Secure Notes</h3>
                            <p className="text-xs md:text-sm max-w-xs transition-all">Select a note from the library or start a fresh one for your secure thoughts.</p>
                            <button
                                onClick={handleAddNote}
                                className="mt-8 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-widest text-xs"
                            >
                                Create First Note
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
