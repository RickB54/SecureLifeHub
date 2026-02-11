"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Download, Trash2, Info, Video } from "lucide-react"

interface LightboxProps {
    items: any[]
    currentIndex: number
    onClose: () => void
    onNext: () => void
    onPrev: () => void
    onSelect: (index: number) => void
    onDelete?: (id: string) => void
}

export default function Lightbox({ items, currentIndex, onClose, onNext, onPrev, onSelect, onDelete }: LightboxProps) {
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
            <div className="relative w-full flex-1 flex items-center justify-center p-4">
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
                        autoPlay
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

            {/* Thumbnail Carousel */}
            <div className="w-full bg-black/40 backdrop-blur-md p-4 flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar items-center justify-center border-t border-white/5">
                {items.map((item, idx) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(idx)}
                        className={`relative flex-shrink-0 h-16 aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-pink-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                         {item.item_metadata?.type === 'video' ? (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Video className="h-4 w-4 text-white" />
                            </div>
                        ) : (
                            <img
                                src={item.item_metadata?.url || item.item_metadata?.thumbnail_url}
                                className="w-full h-full object-cover"
                                alt=""
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Info Panel */}
            {showInfo && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-white/10 p-4 rounded-xl max-w-md w-full text-white animate-in slide-in-from-bottom-5 z-[210]">
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
