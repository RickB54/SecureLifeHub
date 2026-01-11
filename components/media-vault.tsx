"use client"

import { useState } from "react"
import { Image, Video, Plus, Search, Lock, Folder, Grid, List, MoreVertical, Trash2, Filter, LayoutGrid } from "lucide-react"
import Lightbox from "./media/lightbox"

interface MediaVaultProps {
    records: any[]
    setRecords: (records: any[]) => void
    addItem: (item: any) => Promise<any>
    addFolder: (name: string) => Promise<any>
    deleteItem: (id: string, type?: string) => Promise<any>
    theme: string
}

export default function MediaVault({ records = [], addItem, addFolder, deleteItem, theme }: MediaVaultProps) {
    // State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null) // null = All
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false)
    const [newAlbumName, setNewAlbumName] = useState("")
    const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'video'>('all')

    // Derived Data
    const allMedia = records.filter(r => r.category === "Secure Media" || r.type === "media")
    const folders = records.filter(r => r.category === "Secure Media" && r.type === "folder")

    // Filter Items based on search and folder
    const filteredItems = allMedia.filter(item => {
        if (item.type === "folder") return false

        // Type Filter
        if (mediaTypeFilter === 'video' && item.item_metadata?.type !== 'video') return false

        // Search Filter
        const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase())

        // Folder Filter: check both root folder_id and metadata folderId
        const itemFolderId = item.folder_id || item.item_metadata?.folderId
        const inFolder = selectedFolder ? itemFolderId === selectedFolder : true

        return matchesSearch && inFolder
    })

    // Actions
    const handleDelete = async (id: string) => {
        if (deleteItem) await deleteItem(id)
    }

    // Styles
    const glassPanel = theme === 'light' ? 'bg-white/80 border-gray-200' : 'bg-white/5 border-white/10'
    const activeClass = theme === 'light' ? 'bg-pink-100 text-pink-600' : 'bg-pink-500/20 text-pink-400'

    return (
        <div className={`h-full flex ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>

            {/* Sidebar (Folders) */}
            <div className={`w-64 border-r flex flex-col ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/5'}`}>
                <div className="p-6">
                    <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        <Image className="h-5 w-5 text-pink-500" /> Library
                    </h2>

                    <div className="space-y-1">
                        <button
                            onClick={() => { setSelectedFolder(null); setMediaTypeFilter('all'); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!selectedFolder && mediaTypeFilter === 'all' ? activeClass : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            <span className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> All Media</span>
                            <span className="text-xs opacity-50">{allMedia.filter(i => i.type !== 'folder').length}</span>
                        </button>
                        <button
                            onClick={() => { setSelectedFolder(null); setMediaTypeFilter('video'); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!selectedFolder && mediaTypeFilter === 'video' ? activeClass : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            <span className="flex items-center gap-2"><Video className="h-4 w-4" /> Videos</span>
                            <span className="text-xs opacity-50">{allMedia.filter(i => i.item_metadata?.type === 'video').length}</span>
                        </button>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-2 px-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Albums</span>
                            <button
                                onClick={() => setIsAlbumModalOpen(true)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            {folders.map(folder => (
                                <div key={folder.id} className="group flex items-center gap-1 pr-2">
                                    <button
                                        onClick={() => setSelectedFolder(folder.id)}
                                        className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedFolder === folder.id ? activeClass : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                    >
                                        <span className="flex items-center gap-2"><Folder className="h-4 w-4" /> {folder.title || folder.name}</span>
                                    </button>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation()
                                            if (confirm(`Delete album "${folder.title || folder.name}"? This will not delete the media inside.`)) {
                                                await deleteItem(folder.id, "folder")
                                                if (selectedFolder === folder.id) setSelectedFolder(null)
                                            }
                                        }}
                                        className="p-1.5 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            {folders.length === 0 && <p className="px-3 text-xs text-gray-600 italic">No albums yet</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header / Toolbar */}
                <div className={`p-6 border-b flex items-center justify-between ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/5'}`}>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">
                            {selectedFolder ? folders.find(f => f.id === selectedFolder)?.title : "All Media"}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">{filteredItems.length} items • Encrypted</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className={`pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-64 ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/20 text-white'}`}
                            />
                        </div>

                        <div className={`flex items-center p-1 rounded-lg border ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? (theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-white/10 text-white') : 'text-gray-500'}`}><Grid className="h-4 w-4" /></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? (theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-white/10 text-white') : 'text-gray-500'}`}><List className="h-4 w-4" /></button>
                        </div>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium shadow-lg shadow-pink-500/20 transition-all hover:scale-105"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Upload
                        </button>
                    </div>
                </div>

                {/* Content Grid/List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                            <Image className="h-16 w-16 mb-4 text-gray-500" />
                            <p className="text-lg">No media found</p>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "space-y-2"}>
                            {filteredItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={`group relative cursor-pointer overflow-hidden ${viewMode === 'grid'
                                        ? `aspect-square rounded-xl border ${theme === 'light' ? 'bg-gray-100 border-gray-200 hover:shadow-lg' : 'bg-gray-800 border-white/10 hover:border-pink-500/50'}`
                                        : `flex items-center p-3 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`
                                        } transition-all`}
                                >
                                    {/* Thumbnail */}
                                    {viewMode === 'grid' ? (
                                        <>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                {item.item_metadata?.type === 'video' ? <Video className="h-8 w-8 opacity-40" /> : <Image className="h-8 w-8 opacity-40" />}
                                            </div>
                                            {/* Simulate Image if URL exists */}
                                            {(item.item_metadata?.url || item.item_metadata?.thumbnail_url) && (
                                                <img
                                                    src={item.item_metadata.url || item.item_metadata.thumbnail_url}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                    alt={item.title}
                                                />
                                            )}

                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-xs font-bold text-white truncate">{item.title}</p>
                                                <p className="text-[10px] text-gray-300">{new Date(item.created_at || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-4 ${theme === 'light' ? 'bg-gray-100' : 'bg-white/10'}`}>
                                                {item.item_metadata?.type === 'video' ? <Video className="h-5 w-5 opacity-60" /> : <Image className="h-5 w-5 opacity-60" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</h4>
                                                <p className="text-xs text-gray-500">{new Date(item.created_at || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <Lightbox
                    items={filteredItems}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNext={() => setLightboxIndex((prev: any) => (prev + 1) % filteredItems.length)}
                    onPrev={() => setLightboxIndex((prev: any) => (prev - 1 + filteredItems.length) % filteredItems.length)}
                    onDelete={handleDelete}
                />
            )}

            {/* Add Modal (Simplified from previous, kept inline for now) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl overflow-hidden relative`}>
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500"></div>

                        <div className="flex justify-between items-center mb-8">
                            <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Encrypt & Save</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <Plus className="h-6 w-6 rotate-45 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault()
                            const fd = new FormData(e.currentTarget)
                            const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement
                            const file = fileInput?.files?.[0]

                            if (!file) return alert("Please select a file")

                            // Convert to base64 for "vault storage"
                            const reader = new FileReader()
                            reader.onloadend = async () => {
                                try {
                                    await addItem({
                                        title: fd.get("title") as string,
                                        type: "note", // Use 'note' for database compatibility
                                        category: "Secure Media",
                                        folder_id: selectedFolder || null, // Proper field for useVault
                                        item_metadata: {
                                            type: file.type.startsWith('video') ? "video" : "image",
                                            url: reader.result as string,
                                            notes: fd.get("notes"),
                                            folderId: selectedFolder, // Keep for legacy filter support
                                            fileName: file.name,
                                            fileSize: file.size
                                        }
                                    })
                                    setIsAddModalOpen(false)
                                } catch (err) {
                                    console.error("Upload error:", err)
                                    alert("Encryption failed. The file might be too large or the connection was lost.")
                                }
                            }
                            reader.readAsDataURL(file)
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Media Title</label>
                                <input name="title" required placeholder="e.g. Private Document Scan" className={`w-full rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:ring-2 focus:ring-pink-500/50 transition-all ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 border-white/10 text-white border'}`} />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Photo / Video File</label>
                                <label className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer block relative group ${theme === 'light' ? 'border-gray-300 hover:border-pink-500 hover:bg-pink-50' : 'border-white/10 hover:border-pink-500/50 hover:bg-pink-500/5'}`}>
                                    <input type="file" required accept="image/*,video/*" className="hidden" onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            const label = e.target.parentElement?.querySelector('.file-label')
                                            if (label) label.textContent = file.name
                                        }
                                    }} />
                                    <div className="relative z-10">
                                        <Plus className="h-12 w-12 mx-auto mb-4 text-pink-500 group-hover:scale-110 transition-transform" />
                                        <p className="font-bold text-lg mb-1 file-label uppercase italic tracking-tighter">Choose File</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Max 50MB • All Data Encrypted</p>
                                    </div>
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Private Notes</label>
                                <textarea name="notes" placeholder="Optional context..." className={`w-full rounded-2xl px-6 py-4 h-24 font-medium outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 border-white/10 text-white border'}`} />
                            </div>

                            <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className={`flex-1 py-4 rounded-2xl font-black uppercase italic tracking-tighter transition-all ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'bg-white/5 hover:bg-white/10 text-white'}`}>Discard</button>
                                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-2xl font-black uppercase italic tracking-tighter text-white shadow-xl shadow-pink-900/20 transition-all active:scale-95">Encrypt & Secure</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Album Modal */}
            {isAlbumModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative`}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className={`text-2xl font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>New Album</h2>
                            <button onClick={() => setIsAlbumModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <Plus className="h-6 w-6 rotate-45 text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Album Title</label>
                                <input
                                    value={newAlbumName}
                                    onChange={(e) => setNewAlbumName(e.target.value)}
                                    placeholder="e.g. Summer Vacation 2025"
                                    className={`w-full rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-pink-500/50 transition-all ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 border-white/10 text-white border'}`}
                                />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setIsAlbumModalOpen(false)}
                                    className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-tighter transition-all ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!newAlbumName.trim()) return
                                        await addFolder(newAlbumName)
                                        setNewAlbumName("")
                                        setIsAlbumModalOpen(false)
                                    }}
                                    className="flex-1 py-4 bg-pink-600 hover:bg-pink-500 rounded-xl font-bold uppercase tracking-tighter text-white transition-all shadow-lg shadow-pink-900/20"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
