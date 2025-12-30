"use client"

import { useState } from "react"
import { X, CreditCard } from "lucide-react"
import { cardGradients, formatCardNumber, detectCardType, validateExpiration } from "../../lib/card-utils"

interface AddCardModalProps {
    onClose: () => void
    onAdd: (card: any) => void
    folders: any[]
    theme: string
    initialPath?: string
}

export default function AddCardModal({ onClose, onAdd, folders, theme, initialPath = "" }: AddCardModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        cardNumber: "",
        cardHolder: "",
        expirationDate: "",
        cvv: "",
        cardType: "",
        gradient: cardGradients[0].name,
        notes: "",
        path: initialPath,
        type: "financial_card"
    })

    const [showNewFolder, setShowNewFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        let processedValue = value

        // Auto-format card number
        if (name === "cardNumber") {
            const cleaned = value.replace(/\s/g, "")
            if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
                processedValue = formatCardNumber(cleaned)
                // Auto-detect card type
                const detectedType = detectCardType(cleaned)
                setFormData(prev => ({
                    ...prev,
                    cardNumber: processedValue,
                    cardType: detectedType
                }))
                return
            } else {
                return // Don't update if invalid
            }
        }

        // Auto-format expiration date
        if (name === "expirationDate") {
            const cleaned = value.replace(/\D/g, "")
            if (cleaned.length <= 4) {
                if (cleaned.length >= 2) {
                    processedValue = cleaned.slice(0, 2) + "/" + cleaned.slice(2)
                } else {
                    processedValue = cleaned
                }
            } else {
                return
            }
        }

        // Limit CVV to 3-4 digits
        if (name === "cvv") {
            const cleaned = value.replace(/\D/g, "")
            if (cleaned.length <= 4) {
                processedValue = cleaned
            } else {
                return
            }
        }

        setFormData({
            ...formData,
            [name]: processedValue,
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length < 13) {
            alert("Please enter a valid card number")
            return
        }

        if (!formData.expirationDate || !validateExpiration(formData.expirationDate)) {
            alert("Please enter a valid expiration date (MM/YY)")
            return
        }

        if (!formData.cvv || formData.cvv.length < 3) {
            alert("Please enter a valid CVV")
            return
        }

        if (showNewFolder && newFolderName.trim()) {
            onAdd({
                ...formData,
                path: newFolderName.trim(),
            })
        } else {
            onAdd(formData)
        }
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl ${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-lg shadow-xl max-h-[90vh] overflow-y-auto`}>
                {/* Header */}
                <div className={`sticky top-0 ${theme === "light" ? "bg-white border-b border-gray-200" : "bg-[#2a2a2a] border-b border-gray-700"} p-4 flex justify-between items-center z-10`}>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-blue-500" />
                        Add New Card
                    </h2>
                    <button onClick={onClose} className={`${theme === "light" ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-white"}`}>
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Card Title */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Card Name/Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Personal Visa, Business Mastercard, etc."
                            required
                            className={`w-full px-3 py-2 rounded-md border ${theme === "light" ? "border-gray-300 bg-white" : "border-gray-600 bg-[#333]"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>

                    {/* Card Number */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Card Number *
                        </label>
                        <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="1234 5678 9012 3456"
                            required
                            maxLength={19}
                            className={`w-full px-3 py-2 rounded-md border ${theme === "light" ? "border-gray-300 bg-white" : "border-gray-600 bg-[#333]"} focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                        />
                        {formData.cardType && (
                            <p className="text-sm text-blue-400 mt-1">Detected: {formData.cardType}</p>
                        )}
                    </div>

                    {/* Card Holder */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Card Holder Name
                        </label>
                        <input
                            type="text"
                            name="cardHolder"
                            value={formData.cardHolder}
                            onChange={handleChange}
                            placeholder="JOHN DOE"
                            className={`w-full px-3 py-2 rounded-md border ${theme === "light" ? "border-gray-300 bg-white" : "border-gray-600 bg-[#333]"} focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase`}
                        />
                    </div>

                    {/* Expiration & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                                Expiration Date *
                            </label>
                            <input
                                type="text"
                                name="expirationDate"
                                value={formData.expirationDate}
                                onChange={handleChange}
                                placeholder="MM/YY"
                                required
                                maxLength={5}
                                className={`w-full px-3 py-2 rounded-md border ${theme === "light" ? "border-gray-300 bg-white" : "border-gray-600 bg-[#333]"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                                CVV *
                            </label>
                            <input
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                                placeholder="123"
                                required
                                maxLength={4}
                                className={`w-full px-3 py-2 rounded-md border ${theme === "light" ? "border-gray-300 bg-white" : "border-gray-600 bg-[#333]"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                    </div>

                    {/* Card Gradient Color */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Card Color
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {cardGradients.map((gradient) => (
                                <button
                                    key={gradient.name}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, gradient: gradient.name })}
                                    className={`h-12 rounded-lg bg-gradient-to-br ${gradient.from} ${gradient.to} ${formData.gradient === gradient.name ? 'ring-4 ring-blue-500' : 'opacity-70 hover:opacity-100'} transition-all`}
                                    title={gradient.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Folder Selection */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Folder
                        </label>
                        {!showNewFolder ? (
                            <select
                                name="path"
                                value={formData.path}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 rounded-md border ${theme === "light" ? "border-gray-300 bg-white" : "border-gray-600 bg-[#333]"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                <option value="">No Folder</option>
                                {folders.map((folder) => (
                                    <option key={folder.id} value={folder.path}>
                                        {folder.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Enter new folder name"
                                className={`w-full px-3 py-2 rounded-md border ${theme === "light" ? "border-gray-300 bg-white" : "border-gray-600 bg-[#333]"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => setShowNewFolder(!showNewFolder)}
                            className="text-sm text-blue-500 hover:text-blue-400 mt-1"
                        >
                            {showNewFolder ? "Select existing folder" : "Create new folder"}
                        </button>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Additional notes about this card..."
                            className={`w-full px-3 py-2 rounded-md border ${theme === "light" ? "border-gray-300 bg-white" : "border-gray-600 bg-[#333]"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} transition duration-200`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
                        >
                            Add Card
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
