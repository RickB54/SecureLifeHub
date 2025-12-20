"use client"

import { useState, useEffect } from "react"
import { Plus, Box, Trash2, Image as ImageIcon } from "lucide-react"

interface Props {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function Assets({ records, addItem, deleteItem, theme }: Props) {
    const [items, setItems] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        setItems(records.filter(r => r.category === "Assets" || r.item_metadata?.is_asset))
    }, [records])

    const glassCardStyle = theme === 'light'
        ? "bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg border border-white/20 shadow-lg"
        : "bg-gray-800 bg-opacity-40 backdrop-filter backdrop-blur-lg border border-gray-700/50 shadow-lg"

    // Helper for file base64
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
    }

    return (
        <div className="space-y-8 p-4">
            <div className={`p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 ${glassCardStyle}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-emerald-500 flex items-center gap-3">
                            <Box className="h-8 w-8" /> Assets & Inventory
                        </h1>
                        <p className="text-sm opacity-80 mt-1">High-value items, serial numbers, and insurance logs.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-emerald-700 transition-all">
                        <Plus className="h-5 w-5 mr-2" /> Log Asset
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {items.length === 0 ? (
                    <div className={`col-span-full p-12 text-center text-gray-500 rounded-2xl ${glassCardStyle}`}>
                        No assets logged. Track your valuables here.
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className={`p-6 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start ${glassCardStyle}`}>
                            <div className="flex gap-4">
                                {item.item_metadata?.image && (
                                    <div className="h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                                        <img src={item.item_metadata.image} alt={item.title} className="h-full w-full object-cover" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold">{item.title}</h3>
                                    <p className="text-sm opacity-60">Serial: {item.item_metadata?.serial || 'N/A'}</p>
                                    <p className="text-sm opacity-60">Purchased: {item.item_metadata?.purchaseDate || 'N/A'}</p>
                                    {item.item_metadata?.notes && <p className="text-xs mt-2 opacity-50 max-w-sm">{item.item_metadata.notes}</p>}
                                </div>
                            </div>
                            <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-0 w-full sm:w-auto justify-between sm:justify-start">
                                <div>
                                    <div className="text-lg font-mono text-emerald-500">${item.item_metadata?.value || '0.00'}</div>
                                    <div className="text-xs opacity-50">Value</div>
                                </div>
                                <button onClick={() => { if (confirm("Delete?")) deleteItem(item.id) }} className="mt-2 text-red-500 opacity-50 hover:opacity-100 p-2 hover:bg-red-500/10 rounded-full transition-all">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${glassCardStyle} border-none backdrop-blur-xl`}>
                        <h2 className="text-2xl font-bold mb-4">Log New Asset</h2>
                        <form onSubmit={async (e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)

                            // Handle image
                            const file = fd.get("photo") as File
                            let imageBase64 = ""
                            if (file && file.size > 0) {
                                if (file.size > 500000) { // 500KB limit for base64 safety
                                    alert("Image too large. Please use an image under 500KB.")
                                    return
                                }
                                imageBase64 = await convertToBase64(file)
                            }

                            addItem({
                                type: "note",
                                category: "Assets",
                                title: fd.get("title"),
                                item_metadata: {
                                    is_asset: true,
                                    serial: fd.get("serial"),
                                    value: fd.get("value"),
                                    purchaseDate: fd.get("purchaseDate"),
                                    notes: fd.get("notes"),
                                    image: imageBase64 // Store base64 string
                                }
                            })
                            setShowAddModal(false)
                        }} className="space-y-4">
                            <input name="title" required className={`w-full p-3 rounded-lg ${theme === 'light' ? 'bg-gray-100 text-black' : 'bg-black/30 text-white'} border border-transparent focus:border-emerald-500 outline-none`} placeholder="Asset Name (e.g. MacBook Pro)" />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="value" className={`p-3 rounded-lg ${theme === 'light' ? 'bg-gray-100 text-black' : 'bg-black/30 text-white'} border border-transparent focus:border-emerald-500 outline-none`} placeholder="Value ($)" />
                                <input name="serial" className={`p-3 rounded-lg ${theme === 'light' ? 'bg-gray-100 text-black' : 'bg-black/30 text-white'} border border-transparent focus:border-emerald-500 outline-none`} placeholder="Serial Number" />
                            </div>

                            {/* Photo Upload */}
                            <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${theme === 'light' ? 'border-gray-300 hover:bg-gray-50' : 'border-white/10 hover:bg-white/5'}`}>
                                <label className="cursor-pointer block">
                                    <ImageIcon className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                    <span className="text-sm opacity-60">Click to upload photo/warranty (max 500KB)</span>
                                    <input type="file" name="photo" accept="image/*" className="hidden" />
                                </label>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-xs mb-1 opacity-70">Purchase Date</label>
                                <input type="date" name="purchaseDate" className={`w-full p-3 rounded-lg ${theme === 'light' ? 'bg-gray-100 text-black' : 'bg-black/30 text-white'} border border-transparent focus:border-emerald-500 outline-none`} style={{ colorScheme: theme }} />
                            </div>
                            <textarea name="notes" className={`w-full p-3 rounded-lg ${theme === 'light' ? 'bg-gray-100 text-black' : 'bg-black/30 text-white'} border border-transparent focus:border-emerald-500 outline-none`} placeholder="Warranty info, notes..." rows={3} />

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-lg hover:bg-gray-500/20 transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">Save Asset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
