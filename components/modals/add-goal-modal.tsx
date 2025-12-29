"use client"

import { useState, useRef } from "react"
import { X, Plus, Calendar, Camera, Target, ImageIcon, Loader2 } from "lucide-react"

interface AddGoalModalProps {
    onClose: () => void
    onAdd: (item: any) => Promise<void>
    onEdit?: (id: string, item: any) => Promise<void>
    initialData?: any
}

export default function AddGoalModal({ onClose, onAdd, onEdit, initialData }: AddGoalModalProps) {
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.item_metadata?.description || "")
    const [category, setCategory] = useState(initialData?.item_metadata?.goal_category || "Personal")
    const [deadline, setDeadline] = useState(initialData?.item_metadata?.targetDate || "")
    const [steps, setSteps] = useState<string[]>(
        initialData?.item_metadata?.steps?.map((s: any) => s.title) || []
    )
    const [newStep, setNewStep] = useState("")
    const [photos, setPhotos] = useState<string[]>(initialData?.item_metadata?.photos || [])

    // Keep track of existing completed steps to preserve completion status
    const existingStepsMap = useRef<Record<string, boolean>>(
        initialData?.item_metadata?.steps?.reduce((acc: any, s: any) => ({ ...acc, [s.title]: s.completed }), {}) || {}
    )

    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleAddStep = () => {
        if (newStep.trim()) {
            setSteps([...steps, newStep])
            setNewStep("")
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5000000) { // 5MB limit
            alert("File is too large. Please resize to under 5MB.")
            return
        }

        setUploading(true)
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setPhotos([...photos, base64String])
            setUploading(false)
        }
        reader.onerror = () => {
            alert("Failed to read file")
            setUploading(false)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Auto-add pending step if user forgot to click Add
        const finalSteps = [...steps]
        if (newStep.trim()) {
            finalSteps.push(newStep.trim())
        }

        const metadata = {
            is_goal: true,
            description,
            goal_category: category,
            targetDate: deadline,
            // Preserve completion status if step existed, otherwise false
            steps: finalSteps.map(s => ({
                title: s,
                completed: existingStepsMap.current[s] || false
            })),
            photos: photos
        }

        if (initialData && onEdit) {
            await onEdit(initialData.id, {
                title,
                category: "Goals",
                item_metadata: {
                    ...initialData.item_metadata,
                    ...metadata
                }
            })
        } else {
            await onAdd({
                title,
                category: "Goals",
                type: "note",
                item_metadata: metadata
            })
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-[#1e1e1e] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#252525] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Target className="h-6 w-6 text-orange-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">{initialData ? "Edit Goal" : "Goal Planner"}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">

                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Goal Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter goal title"
                                className="w-full bg-[#151515] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        {/* Desc */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter goal description"
                                className="w-full bg-[#151515] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 h-24 resize-none transition-colors"
                            />
                        </div>

                        {/* Cat & Deadline */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-[#151515] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                >
                                    <option>Personal</option>
                                    <option>Career</option>
                                    <option>Health</option>
                                    <option>Financial</option>
                                    <option>Travel</option>
                                    <option>Educational</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Deadline</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full bg-[#151515] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Steps */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Steps</label>
                            <span className="text-xs text-text-500">{steps.length} step(s)</span>
                        </div>

                        <div className="flex gap-2 mb-3">
                            <input
                                value={newStep}
                                onChange={(e) => setNewStep(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddStep()}
                                placeholder="Add a step"
                                className="flex-1 bg-[#151515] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <button onClick={handleAddStep} className="px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium flex items-center transition-colors">
                                <Plus className="h-5 w-5" /> Add
                            </button>
                        </div>

                        <div className="space-y-2">
                            {steps.length === 0 && <p className="text-sm text-gray-500 italic">No steps added yet.</p>}
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 group">
                                    <div className="h-5 w-5 rounded-full border-2 border-orange-500/50 flex items-center justify-center text-[10px] text-orange-500">{idx + 1}</div>
                                    <span className="text-sm flex-1">{step}</span>
                                    <button
                                        onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all p-1"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Photos & Inspiration</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <div className="grid grid-cols-4 gap-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="aspect-square flex flex-col items-center justify-center gap-2 bg-[#151515] border border-white/10 hover:bg-white/5 rounded-xl transition-colors border-dashed"
                            >
                                {uploading ? <Loader2 className="h-6 w-6 animate-spin text-orange-500" /> : <ImageIcon className="h-6 w-6 text-gray-400" />}
                                <span className="text-xs text-gray-500">Upload</span>
                            </button>

                            {photos.map((photo, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#252525] rounded-b-2xl">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.01]"
                    >
                        {initialData ? "Save Changes" : "Create Goal"}
                    </button>
                </div>

            </div>
        </div>
    )
}
