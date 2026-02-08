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
    Calendar,
    ChevronLeft,
    Download
} from "lucide-react"

interface SecureNote {
    id: string
    title: string
    content: string
    updatedAt: string
    isFavorite: boolean
    images?: string[]
    section?: string
    parentId?: string | null
    isExpanded?: boolean
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
    const [fullscreenImage, setFullscreenImage] = useState<number | null>(null)
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})

    // Mobile View Management
    const [mobileActiveView, setMobileActiveView] = useState<"list" | "editor">("list")
    const [isMobile, setIsMobile] = useState(false)

    // Local Editor State
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
                section: r.item_metadata?.section || "General",
                parentId: r.item_metadata?.parentId || null
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
        }, 1000)
    }

    const handleSyncUpdate = async (id: string, updates: Partial<SecureNote>) => {
        const dbUpdates: any = {}
        if (updates.title !== undefined) dbUpdates.title = updates.title
        if (updates.content !== undefined) dbUpdates.notes = updates.content
        if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite

        const metadataUpdates: any = {}
        if (updates.images !== undefined) metadataUpdates.images = updates.images
        if (updates.section !== undefined) metadataUpdates.section = updates.section
        if (updates.parentId !== undefined) metadataUpdates.parentId = updates.parentId

        // Retrieve existing metadata to merge
        const existingNote = notes.find(n => n.id === id)
        const currentMetadata = existingNote ? {
            section: existingNote.section,
            images: existingNote.images,
            parentId: existingNote.parentId
        } : {}

        dbUpdates.item_metadata = { ...currentMetadata, ...metadataUpdates }

        await updateItem(id, dbUpdates)
    }

    // Handle Speech-to-Text
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition()
                recognitionRef.current.continuous = true
                recognitionRef.current.interimResults = true

                recognitionRef.current.onresult = (event: any) => {
                    let transcript = ''
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript
                    }

                    if (selectedNoteId) {
                        const newContent = (draftContent || "") + " " + transcript
                        setDraftContent(newContent)
                        queueUpdate(selectedNoteId, { content: newContent })
                    }
                }

                recognitionRef.current.onend = () => setIsRecording(false)
                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech Recognition Error:", event.error)
                    setIsRecording(false)
                    alert(`Speech recognition error: ${event.error}. Ensure you have granted microphone permissions and are using a supported browser like Chrome.`)
                }
            }
        }
    }, [selectedNoteId, draftContent])

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported on this device/browser. Please try using Google Chrome on Desktop or Android.")
            return
        }
        if (isRecording) {
            recognitionRef.current.stop()
        } else {
            try {
                recognitionRef.current.start()
                setIsRecording(true)
            } catch (err) {
                console.error("Failed to start speech recognition:", err)
                alert("Could not start speech recognition. Please check your microphone permissions.")
            }
        }
    }

    const handleAddNote = async (parentId: string | null = null) => {
        const newNote = {
            title: parentId ? "New Sub-page" : "New Note",
            notes: "",
            type: "note",
            category: "Secure Notes",
            item_metadata: {
                section: activeSection === "all" ? "General" : activeSection,
                images: [],
                parentId: parentId
            }
        }
        const created = await addItem(newNote)
        if (created) {
            if (parentId) {
                setExpandedNodes(prev => ({ ...prev, [parentId]: true }))
            }
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
        if (confirm("Are you sure you want to delete this note and all its sub-pages?")) {
            await deleteItem(id)
            // Ideally delete children too, but for now we'll just handle state
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

    const toggleNode = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }))
    }

    // Hierarchical rendering logic
    const renderNoteItem = (note: SecureNote, depth = 0) => {
        const hasChildren = notes.some(n => n.parentId === note.id)
        const isExpanded = expandedNodes[note.id]
        const isSelected = selectedNoteId === note.id

        return (
            <div key={note.id} className="space-y-1">
                <div
                    onClick={() => handleSelectNote(note.id)}
                    className={`
                        p-3 rounded-2xl cursor-pointer transition-all group relative border flex items-center gap-2
                        ${isSelected ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-900/30' : theme === 'light' ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-white/5 border-transparent hover:bg-white/10'}
                    `}
                    style={{ marginLeft: `${depth * 16}px` }}
                >
                    <div className="flex items-center gap-1 min-w-[20px]">
                        {hasChildren && (
                            <button onClick={(e) => toggleNode(note.id, e)} className="p-1 hover:bg-white/10 rounded">
                                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </button>
                        )}
                        {!hasChildren && <StickyNote className="h-3 w-3 opacity-30" />}
                    </div>

                    <div className="flex-1 truncate">
                        <div className="flex justify-between items-center">
                            <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : ''}`}>{note.title}</h3>
                            {note.isFavorite && <Star className={`h-2.5 w-2.5 fill-current ${isSelected ? 'text-white' : 'text-yellow-500'}`} />}
                        </div>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-blue-100 opacity-60' : 'text-gray-500'}`}>
                            {note.content || "No content"}
                        </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAddNote(note.id); }}
                            className={`p-1 rounded-md hover:bg-blue-500 hover:text-white`}
                            title="Add sub-page"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                        <button
                            onClick={(e) => handleDeleteNote(note.id, e)}
                            className={`p-1 rounded-md hover:bg-red-500 hover:text-white`}
                        >
                            <Trash className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                {isExpanded && notes.filter(n => n.parentId === note.id).map(child => renderNoteItem(child, depth + 1))}
            </div>
        )
    }

    const filteredRootNotes = notes.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesSection = activeSection === "all" || n.section === activeSection
        return matchesSearch && matchesSection && (searchQuery ? true : !n.parentId)
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
                                onClick={() => handleAddNote(null)}
                                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/40"
                                title="Add root page"
                            >
                                <Plus className="h-4 w-4 text-white" />
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search all notes..."
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

                    {/* Notes List (Hierarchical) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {filteredRootNotes.length === 0 ? (
                            <div className="text-center py-20 opacity-30 select-none">
                                <StickyNote className="h-12 w-12 mx-auto mb-4" />
                                <p className="text-sm">No notes found</p>
                            </div>
                        ) : (
                            filteredRootNotes.map(note => renderNoteItem(note))
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
                                        {currentNote.parentId && (
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                                <ChevronLeft className="h-3 w-3" />
                                                Sub-page
                                            </div>
                                        )}
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
                                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-1"
                                            title="Upload Image"
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                            <Plus className="h-3 w-3" />
                                        </button>

                                        <button
                                            onClick={() => handleSyncUpdate(currentNote.id, { isFavorite: !currentNote.isFavorite })}
                                            className={`p-2.5 rounded-xl transition-all ${currentNote.isFavorite ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                                        >
                                            <Star className="h-4 w-4" fill={currentNote.isFavorite ? "currentColor" : "none"} />
                                        </button>

                                        <button
                                            onClick={() => setShowGallery(!showGallery)}
                                            className={`p-2.5 rounded-xl transition-all ${showGallery ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-400'}`}
                                            title="Show Gallery"
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
                                                    <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-blue-500 transition-all bg-black/40 shadow-xl cursor-pointer" onClick={() => setFullscreenImage(idx)}>
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    const updated = currentNote.images?.filter((_, i) => i !== idx)
                                                                    handleSyncUpdate(currentNote.id, { images: updated })
                                                                }}
                                                                className="p-2 bg-red-600 rounded-lg shadow-lg hover:scale-110 transition-transform"
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

                            {/* Fullscreen Image Carousel */}
                            {fullscreenImage !== null && currentNote.images && (
                                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center p-6 relative z-10">
                                        <div className="text-white">
                                            <h4 className="font-bold">{currentNote.title}</h4>
                                            <p className="text-xs opacity-50">Image {fullscreenImage + 1} of {currentNote.images.length}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <a
                                                href={currentNote.images[fullscreenImage]}
                                                download={`note-image-${fullscreenImage}.png`}
                                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                            >
                                                <Download className="h-5 w-5" />
                                            </a>
                                            <button
                                                onClick={() => setFullscreenImage(null)}
                                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 relative flex items-center justify-center p-4">
                                        <button
                                            onClick={() => setFullscreenImage((fullscreenImage - 1 + currentNote.images!.length) % currentNote.images!.length)}
                                            className="absolute left-6 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-10"
                                        >
                                            <ChevronLeft className="h-8 w-8" />
                                        </button>

                                        <img
                                            src={currentNote.images[fullscreenImage]}
                                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-500"
                                            alt=""
                                        />

                                        <button
                                            onClick={() => setFullscreenImage((fullscreenImage + 1) % currentNote.images!.length)}
                                            className="absolute right-6 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-10"
                                        >
                                            <ChevronRight className="h-8 w-8" />
                                        </button>
                                    </div>

                                    {/* Thumbnail Strip */}
                                    <div className="p-6 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
                                        {currentNote.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setFullscreenImage(idx)}
                                                className={`
                                                    w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0
                                                    ${fullscreenImage === idx ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'border-transparent opacity-40 hover:opacity-100'}
                                                `}
                                            >
                                                <img src={img} className="w-full h-full object-cover" alt="" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Bar */}
                            <div className="px-4 md:px-6 py-2 border-t border-white/5 flex items-center justify-between bg-black/20 text-[9px] font-black uppercase tracking-widest text-gray-500 overflow-hidden">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 whitespace-nowrap"><Lock className="h-3 w-3 text-emerald-500" />Encrypted</span>
                                    <span className="hidden sm:inline">{(draftContent || "").split(/\s+/).filter(Boolean).length} Words</span>
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
                            <h3 className="text-xl md:text-2xl font-black mb-2 uppercase tracking-tighter">My Secure Notes Library</h3>
                            <p className="text-xs md:text-sm max-w-xs transition-all">Select a note from the library or start a fresh one for your secure thoughts.</p>
                            <button
                                onClick={() => handleAddNote(null)}
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
