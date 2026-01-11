"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Download, Trash2, Info } from "lucide-react"

interface LightboxProps {
    items: any[]
    currentIndex: number
    onClose: () => void
    onNext: () => void
    onPrev: () => void
    onDelete?: (id: string) => void
}

export default function Lightbox({ items, currentIndex, onClose, onNext, onPrev, onDelete }: LightboxProps) {
    const currentItem = items[currentIndex]
    const [showInfo, setShowInfo] = useState(false)

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
            if (e.key === "ArrowRight") onNext()
            if (e.key === "ArrowLeft") onPrev()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose, onNext, onPrev])

    if (!currentItem) return null

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
            {/* Toolbar */}
            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                <div className="text-white/80 text-sm font-medium">
                    {currentIndex + 1} / {items.length}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`p-2 rounded-full hover:bg-white/10 transition-colors ${showInfo ? 'text-white' : 'text-gray-400'}`}
                    >
                        <Info className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => {
                            const link = document.createElement('a')
                            link.href = currentItem.item_metadata?.url || ""
                            link.download = currentItem.title || "secure-media"
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                        }}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Download"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                    {onDelete && (
                        <button
                            onClick={() => {
                                if (confirm("Delete this item?")) {
                                    onDelete(currentItem.id)
                                    onClose()
                                }
                            }}
                            className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
                <button
                    onClick={onPrev}
                    className="absolute left-4 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-all hover:scale-110 z-10"
                >
                    <ChevronLeft className="h-8 w-8" />
                </button>

                {currentItem.item_metadata?.type === "video" ? (
                    <video
                        src={currentItem.item_metadata.url}
                        controls
                        className="max-h-full max-w-full rounded-lg shadow-2xl"
                    />
                ) : (
                    <img
                        src={currentItem.item_metadata?.url || currentItem.item_metadata?.thumbnail_url}
                        alt={currentItem.title}
                        className="max-h-full max-w-full rounded-lg shadow-2xl object-contain"
                    />
                )}

                <button
                    onClick={onNext}
                    className="absolute right-4 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-all hover:scale-110 z-10"
                >
                    <ChevronRight className="h-8 w-8" />
                </button>
            </div>

            {/* Info Panel */}
            {showInfo && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl max-w-md w-full text-white animate-in slide-in-from-bottom-5">
                    <h3 className="font-bold text-lg mb-1">{currentItem.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{currentItem.category}</p>
                    {currentItem.item_metadata?.notes && (
                        <div className="bg-white/5 p-3 rounded-lg text-sm text-gray-300">
                            {currentItem.item_metadata.notes}
                        </div>
                    )}
                    <div className="mt-3 text-xs text-gray-500 font-mono">
                        Added: {new Date(currentItem.created_at || Date.now()).toLocaleDateString()}
                    </div>
                </div>
            )}
        </div>
    )
}
