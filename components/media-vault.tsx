"use client"

import { useState } from "react"
import { Image, Video, Plus, Search, Lock, Folder, Grid, List, MoreVertical, Trash2, Filter, LayoutGrid } from "lucide-react"
import Lightbox from "./media/lightbox"

interface MediaVaultProps {
    records: any[]
    setRecords: (records: any[]) => void
    addItem: (item: any) => Promise<any>
    addFolder: (name: string, category?: string) => Promise<any>
    deleteItem: (id: string, type?: string) => Promise<any>
    refresh: () => void
    theme: string
}

export default function MediaVault({ records = [], addItem, addFolder, deleteItem, refresh, theme }: MediaVaultProps) {
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
    const mediaFolders = records.filter(r => (r.category === "Secure Media" || !r.category) && r.type === "folder")

    // Filter Items based on search and folder
    const filteredContent = records.filter(item => {
        // Only include Secure Media and Folders
        if (item.category !== "Secure Media" && item.type !== "folder") return false

        // Type Filter (for media items)
        if (item.type !== "folder") {
            if (mediaTypeFilter === 'video' && item.item_metadata?.type !== 'video') return false
        } else {
            // Folders only show in 'all' view or as roots
            if (mediaTypeFilter === 'video') return false
        }

        // Search Filter
        const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             item.name?.toLowerCase().includes(searchTerm.toLowerCase())

        // Folder Filter
        const itemFolderId = item.folder_id || item.item_metadata?.folderId
        
        // Logic:
        // 1. If we are in "All Media" (selectedFolder == null):
        //    Show everything EXCEPT folders (if they are at root?) 
        //    Actually, user said: "i should see the pics inside this gallery and thier albums also".
        //    So we show Root Items AND Folders.
        // 2. If an album is selected:
        //    Show only items IN that album.
        
        const inFolder = selectedFolder 
            ? itemFolderId === selectedFolder 
            : (item.type === "folder" || !itemFolderId)

        return matchesSearch && inFolder
    })

    // Separate folders and media for indexing if needed, but for the grid we can mix
    const displayItems = filteredContent.filter(i => i.type !== 'folder')
    const displayFolders = filteredContent.filter(i => i.type === 'folder')

    // Actions
    const handleDelete = async (id: string) => {
        if (deleteItem) await deleteItem(id)
    }

    // Styles
    const glassPanel = theme === 'light' ? 'bg-white/80 border-gray-200' : 'bg-white/5 border-white/10'
    const activeClass = theme === 'light' ? 'bg-pink-100 text-pink-600' : 'bg-pink-500/20 text-pink-400'

    return (
        <div className={`h-full flex flex-col lg:flex-row ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>

            {/* Sidebar (Folders) - Responsive: Horizontal on mobile, vertical on desktop */}
            <div className={`w-full lg:w-64 border-b lg:border-r flex flex-col ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/5'}`}>
                <div className="p-4 lg:p-6 flex flex-col lg:block">
                    <h2 className={`text-lg font-bold mb-4 lg:mb-6 flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        <Image className="h-5 w-5 text-pink-500" /> Library
                    </h2>

                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 custom-scrollbar no-scrollbar">
                        <button
                            onClick={() => { setSelectedFolder(null); setMediaTypeFilter('all'); }}
                            className={`flex-shrink-0 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!selectedFolder && mediaTypeFilter === 'all' ? activeClass : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            <span className="flex items-center gap-2 whitespace-nowrap"><LayoutGrid className="h-4 w-4" /> All Media</span>
                            <span className="text-xs opacity-50 ml-3 lg:ml-0">{allMedia.filter(i => i.type !== 'folder').length}</span>
                        </button>
                        <button
                            onClick={() => { setSelectedFolder(null); setMediaTypeFilter('video'); }}
                            className={`flex-shrink-0 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!selectedFolder && mediaTypeFilter === 'video' ? activeClass : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            <span className="flex items-center gap-2 whitespace-nowrap"><Video className="h-4 w-4" /> Videos</span>
                            <span className="text-xs opacity-50 ml-3 lg:ml-0">{allMedia.filter(i => i.item_metadata?.type === 'video').length}</span>
                        </button>

                        <div className="w-px h-6 bg-white/10 mx-2 lg:hidden self-center" />

                        <div className="flex lg:flex-col gap-2">
                             {mediaFolders.map(folder => (
                                <div key={folder.id} className="group flex items-center gap-1 pr-2">
                                    <button
                                        onClick={() => setSelectedFolder(folder.id)}
                                        className={`flex-shrink-0 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedFolder === folder.id ? activeClass : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                    >
                                        <span className="flex items-center gap-2 whitespace-nowrap"><Folder className="h-4 w-4" /> {folder.title || folder.name}</span>
                                    </button>
                                     <button
                                        onClick={async (e) => {
                                            e.stopPropagation()
                                            if (confirm(`Delete album "${folder.title || folder.name}"? This will not delete the media inside.`)) {
                                                await deleteItem(folder.id, "folder")
                                                refresh()
                                                if (selectedFolder === folder.id) setSelectedFolder(null)
                                            }
                                        }}
                                        className="p-1.5 opacity-0 lg:group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all hidden lg:block"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => setIsAlbumModalOpen(true)}
                            className="flex-shrink-0 p-2 text-pink-500 hover:bg-pink-500/10 rounded-lg transition-colors"
                            title="New Album"
                        >
                             <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header / Toolbar */}
                <div className={`p-4 md:p-6 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/5'}`}>
                    <div className="w-full md:w-auto">
                        <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">
                            {selectedFolder ? mediaFolders.find(f => f.id === selectedFolder)?.name || mediaFolders.find(f => f.id === selectedFolder)?.title : "All Media"}
                        </h1>
                        <p className="text-[10px] md:text-xs text-gray-500 mt-1">{displayItems.length} items • {displayFolders.length} albums • Encrypted</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className={`pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-full ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/20 text-white'}`}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                             <div className={`flex flex-1 items-center p-1 rounded-lg border ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
                                <button onClick={() => setViewMode('grid')} className={`flex-1 md:flex-none p-1.5 rounded flex justify-center ${viewMode === 'grid' ? (theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-white/10 text-white') : 'text-gray-500'}`}><Grid className="h-4 w-4" /></button>
                                <button onClick={() => setViewMode('list')} className={`flex-1 md:flex-none p-1.5 rounded flex justify-center ${viewMode === 'list' ? (theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-white/10 text-white') : 'text-gray-500'}`}><List className="h-4 w-4" /></button>
                            </div>

                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium shadow-lg shadow-pink-500/20 transition-all hover:scale-105"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Upload
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Grid/List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredContent.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                            <Image className="h-16 w-16 mb-4 text-gray-500" />
                            <p className="text-lg">No media found</p>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "space-y-2"}>
                            {/* Render Folders First */}
                            {displayFolders.map(folder => (
                                <div
                                    key={folder.id}
                                    onClick={() => setSelectedFolder(folder.id)}
                                    className={`group relative cursor-pointer overflow-hidden aspect-square rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${theme === 'light' ? 'bg-white border-gray-200 hover:shadow-lg' : 'bg-white/5 border-white/10 hover:border-pink-500/50'}`}
                                >
                                    <div className="p-4 bg-pink-500/20 rounded-2xl text-pink-500 group-hover:scale-110 transition-transform">
                                        <Folder className="h-10 w-10 fill-pink-500/20" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className={`text-sm font-bold truncate ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{folder.name || folder.title}</p>
                                        <p className="text-[10px] text-gray-500">Album</p>
                                    </div>
                                </div>
                            ))}

                            {/* Render Media Items */}
                            {displayItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    onClick={() => setLightboxIndex(displayItems.indexOf(item))}
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
                    items={displayItems}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNext={() => setLightboxIndex((prev: any) => (prev + 1) % filteredItems.length)}
                    onPrev={() => setLightboxIndex((prev: any) => (prev - 1 + filteredItems.length) % filteredItems.length)}
                    onSelect={(index: number) => setLightboxIndex(index)}
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
                            const files = Array.from(fileInput?.files || [])

                            if (files.length === 0) return alert("Please select a file")

                            const uploadPromises = files.map(file => {
                                return new Promise<void>((resolve, reject) => {
                                    const reader = new FileReader()
                                    reader.onloadend = async () => {
                                        let result = reader.result as string;

                                        if (file.type.startsWith('image/')) {
                                            result = await new Promise((resolve) => {
                                                const img = new (window as any).Image();
                                                img.src = result;
                                                img.onload = () => {
                                                    const canvas = document.createElement('canvas');
                                                    const MAX_WIDTH = 1200;
                                                    let width = img.width;
                                                    let height = img.height;
                                                    if (width > MAX_WIDTH) {
                                                        height = (MAX_WIDTH / width) * height;
                                                        width = MAX_WIDTH;
                                                    }
                                                    canvas.width = width;
                                                    canvas.height = height;
                                                    const ctx = canvas.getContext('2d');
                                                    ctx?.drawImage(img, 0, 0, width, height);
                                                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                                                };
                                            });
                                        }

                                        try {
                                            await addItem({
                                                title: files.length === 1 ? (fd.get("title") as string) : file.name,
                                                type: "note",
                                                category: "Secure Media",
                                                folder_id: selectedFolder || null,
                                                item_metadata: {
                                                    type: file.type.startsWith('video') ? "video" : "image",
                                                    url: result,
                                                    notes: fd.get("notes"),
                                                    folderId: selectedFolder,
                                                    fileName: file.name,
                                                    fileSize: file.size
                                                }
                                            })
                                            resolve()
                                        } catch (err) {
                                            reject(err)
                                        }
                                    }
                                    reader.readAsDataURL(file)
                                })
                            })

                            try {
                                await Promise.all(uploadPromises)
                                refresh()
                                setIsAddModalOpen(false)
                            } catch (err) {
                                console.error("Upload error:", err)
                                alert("Encryption failed. One or more files might be too large.")
                            }
                        }}
 className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Media Title</label>
                                <input name="title" required placeholder="e.g. Private Document Scan" className={`w-full rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:ring-2 focus:ring-pink-500/50 transition-all ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 border-white/10 text-white border'}`} />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Photo / Video File</label>
                                <label className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer block relative group ${theme === 'light' ? 'border-gray-300 hover:border-pink-500 hover:bg-pink-50' : 'border-white/10 hover:border-pink-500/50 hover:bg-pink-500/5'}`}>
                                    <input type="file" multiple required accept="image/*,video/*" className="hidden" onChange={(e) => {
                                        const files = e.target.files
                                        if (files && files.length > 0) {
                                            const label = e.target.parentElement?.querySelector('.file-label')
                                            if (label) label.textContent = files.length === 1 ? files[0].name : `${files.length} files selected`
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
                                        await addFolder(newAlbumName, "Secure Media")
                                        refresh() // Call refresh
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
