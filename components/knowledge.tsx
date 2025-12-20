"use client"

import { useState, useEffect } from "react"
import { Plus, Book, FileText, Trash2, Tag, Search, BookOpen } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface Props {
    records: any[]
    addItem: (item: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function Knowledge({ records, addItem, deleteItem, theme }: Props) {
    const [items, setItems] = useState<any[]>([])
    const [filterTag, setFilterTag] = useState("All")
    const [searchTerm, setSearchTerm] = useState("")
    const [showAddModal, setShowAddModal] = useState(false)
    const [activeNote, setActiveNote] = useState<any>(null)

    useEffect(() => {
        setItems(records.filter(r => r.category === "Knowledge Vault" || r.item_metadata?.is_knowledge))
    }, [records])

    // Extract unique tags
    const tags = ["All", ...Array.from(new Set(items.map(i => i.item_metadata?.tag || "Uncategorized")))]

    const filteredItems = items.filter(item => {
        const matchesTag = filterTag === "All" || (item.item_metadata?.tag || "Uncategorized") === filterTag
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.item_metadata?.content?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesTag && matchesSearch
    })

    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm"
        : "bg-white/5 border border-white/10"

    const renderMarkdown = (content: string) => {
        return (
            <ReactMarkdown
                className="prose prose-sm dark:prose-invert max-w-none"
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 text-yellow-500" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-4 text-yellow-400" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2 opacity-80" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2 opacity-80" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono text-yellow-300" {...props} />
                }}
            >
                {content}
            </ReactMarkdown>
        )
    }

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center gap-3">
                            <Book className="h-8 w-8 text-yellow-500" /> Knowledge Vault
                        </h1>
                        <p className="text-gray-400 mt-1">Your private wiki, SOPs, and field notes.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-medium transition-all shadow-lg shadow-yellow-500/20"
                    >
                        <Plus className="h-4 w-4 mr-2" /> New Entry
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex gap-4 mb-2 overflow-x-auto pb-2 no-scrollbar">
                    {tags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setFilterTag(tag)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filterTag === tag
                                    ? "bg-yellow-500 text-black"
                                    : `${theme === 'light' ? 'bg-white text-gray-600 hover:bg-gray-100' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.length === 0 ? (
                        <div className={`col-span-full p-12 text-center rounded-2xl border-2 border-dashed ${theme === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="opacity-50">No entries found for "{filterTag}".</p>
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setActiveNote(item)}
                                className={`group p-6 rounded-2xl flex flex-col h-[280px] cursor-pointer hover:-translate-y-1 transition-all ${glassCardStyle}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2 text-yellow-500">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">{item.item_metadata?.tag || "Note"}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (confirm("Delete note?")) deleteItem(item.id) }}
                                        className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 p-1.5 rounded transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <h3 className={`text-lg font-bold mb-3 line-clamp-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                                <div className="flex-1 overflow-hidden relative">
                                    <div className="opacity-60 text-sm line-clamp-6">
                                        {/* Simple preview without hefty markdown rendering for grid performance */}
                                        {item.item_metadata?.content?.slice(0, 300)}...
                                    </div>
                                    <div className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t ${theme === 'light' ? 'from-white via-white/80' : 'from-[#1a1a1a] via-[#1a1a1a]/80'} to-transparent`} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* View/Edit Modal (Read-only view for now + Edit button placeholder) */}
            {activeNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setActiveNote(null)}>
                    <div className={`w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-8 shadow-2xl ${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'}`} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-3">
                                    {activeNote.item_metadata?.tag || "Uncategorized"}
                                </span>
                                <h2 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{activeNote.title}</h2>
                            </div>
                            <button onClick={() => setActiveNote(null)} className="p-2 hover:bg-white/10 rounded-lg">✕</button>
                        </div>
                        <div className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                            {renderMarkdown(activeNote.item_metadata?.content || "")}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} w-full max-w-2xl rounded-2xl p-6 shadow-2xl`}>
                        <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>New Knowledge Entry</h2>
                        <form onSubmit={(e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)
                            addItem({
                                type: "note",
                                category: "Knowledge Vault",
                                title: fd.get("title"),
                                item_metadata: {
                                    is_knowledge: true,
                                    tag: fd.get("tag"),
                                    content: fd.get("content")
                                }
                            })
                            setShowAddModal(false)
                        }} className="space-y-4">
                            <input name="title" required className={`w-full p-4 rounded-xl text-lg font-bold outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'}`} placeholder="Title (e.g. Router Config)" />
                            <input name="tag" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'}`} placeholder="Tag (e.g. Wiki, SOP, Ideas)" />

                            <div className="relative">
                                <textarea
                                    name="content"
                                    required
                                    rows={12}
                                    className={`w-full p-4 rounded-xl font-mono text-sm leading-relaxed outline-none resize-none ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'}`}
                                    placeholder="# Heading\n\nWrite your content in Markdown..."
                                />
                                <div className="absolute bottom-4 right-4 text-xs opacity-50 pointer-events-none">Markdown Supported</div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className={`px-6 py-3 rounded-xl font-medium ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}>Cancel</button>
                                <button type="submit" className="px-6 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-bold shadow-lg shadow-yellow-500/20">Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
