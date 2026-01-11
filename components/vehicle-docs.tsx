"use client"

import { useState, useRef, useMemo } from "react"
import { Search, Plus, FileText, Upload, Trash2, Shield, Calendar, CreditCard, User, AlertCircle, X, Download, Filter, LayoutGrid } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface VehicleDocsProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function VehicleDocs({ records, addItem, deleteItem, theme }: VehicleDocsProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Filter documentation records
    const docRecords = useMemo(() => {
        return records.filter(r =>
            r.category === "Vehicle Documentation" ||
            r.type === "vehicle-doc" ||
            r.item_metadata?.is_vehicle_doc
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }, [records])

    const filteredDocs = docRecords.filter(doc =>
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.item_metadata?.provider?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const reader = new FileReader()
        reader.onloadend = async () => {
            try {
                const base64 = reader.result as string
                await addItem({
                    title: file.name.split('.')[0],
                    type: "note",
                    category: "Vehicle Documentation",
                    item_metadata: {
                        is_vehicle_doc: true,
                        fileType: file.type,
                        fileName: file.name,
                        fileSize: file.size,
                        url: base64,
                        date: new Date().toISOString(),
                        provider: "Self-Uploaded"
                    }
                })
                toast.success("Document securely uploaded")
            } catch (err) {
                toast.error("Failed to upload document")
            } finally {
                setUploading(false)
            }
        }
        reader.readAsDataURL(file)
    }

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header */}
            <div className={`p-8 border-b ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/5'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 italic uppercase tracking-tighter">
                            Registration & Docs
                        </h1>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Secure storage for all vehicle credentials</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search documents..."
                                className={`pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-64 ${theme === 'light' ? 'bg-gray-100 text-gray-900 shadow-inner' : 'bg-black/40 text-white border border-white/10'}`}
                            />
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black uppercase italic tracking-tighter transition-all hover:scale-105 shadow-lg shadow-amber-900/20"
                        >
                            <Upload className="h-4 w-4 mr-2" /> {uploading ? "Securing..." : "Add Document"}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                    </div>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2">
                    {['All', 'Insurance', 'Registration', 'Owner Manual', 'Title'].map(cat => (
                        <button key={cat} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${theme === 'light' ? 'border-gray-200 text-gray-500 hover:bg-gray-50' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {filteredDocs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 mt-20">
                        <FileText className="h-24 w-24 mb-6 text-gray-500" />
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">No documents found</h2>
                        <p className="text-sm font-bold uppercase tracking-widest mt-2">Upload your registration, insurance cards, or title scans</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDocs.map((doc) => (
                            <div
                                key={doc.id}
                                className={`group rounded-[2rem] border overflow-hidden transition-all hover:scale-[1.02] ${theme === 'light' ? 'bg-white border-gray-200 shadow-xl' : 'bg-white/5 border-white/10'}`}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-4 rounded-2xl ${theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/10 text-amber-500'}`}>
                                            <Shield className="h-8 w-8" />
                                        </div>
                                        <button
                                            onClick={() => { if (confirm("Delete document?")) deleteItem(doc.id) }}
                                            className="p-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <h3 className={`text-lg font-black uppercase italic tracking-tighter truncate ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                        {doc.title}
                                    </h3>
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">
                                        {doc.item_metadata?.provider || "Secured Archive"}
                                    </p>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                                            <span className="text-gray-500 font-bold uppercase tracking-widest">Added</span>
                                            <span className="font-mono font-bold text-amber-500">{format(new Date(doc.created_at), 'MM/dd/yyyy')}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                                            <span className="text-gray-500 font-bold uppercase tracking-widest">Status</span>
                                            <span className="flex items-center gap-1 text-emerald-500 font-black uppercase tracking-widest italic">
                                                <AlertCircle className="h-3 w-3" /> Encrypted
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (doc.item_metadata?.url) {
                                                const link = document.createElement('a');
                                                link.href = doc.item_metadata.url;
                                                link.download = doc.item_metadata.fileName || `${doc.title}.png`;
                                                link.click();
                                            }
                                        }}
                                        className={`w-full mt-6 py-3 rounded-xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-2 transition-all ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}
                                    >
                                        <Download className="h-4 w-4" /> Export Doc
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
