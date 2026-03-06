"use client"

import { X, Copy, Check } from "lucide-react"
import { useState } from "react"

interface ViewFinancialCardModalProps {
  onClose: () => void
  cardData: any
}

export default function ViewFinancialCardModal({ onClose, cardData }: ViewFinancialCardModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null)

    if (!cardData) return null

    const handleCopy = (text: string, field: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const { title, name, cardType, cardNumber, expiry, cvv, custom_fields } = cardData

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold">Card Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Title</label>
                            <div className="text-lg font-medium text-white">{title}</div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Type</label>
                                <div className="text-base text-gray-300 capitalize">{cardType}</div>
                            </div>
                            {cardData.cardColor && (
                                <div className="text-right">
                                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Card Color</label>
                                    <div className="flex justify-end mt-1">
                                        <div 
                                            className="w-8 h-8 rounded-full border border-gray-600 shadow-sm"
                                            style={{ backgroundColor: cardData.cardColor }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Card Number</label>
                            <div className="flex items-center justify-between bg-[#333] p-3 rounded mt-1 border border-gray-700 font-mono text-lg tracking-wide">
                                <span>{cardNumber}</span>
                                <button
                                    onClick={() => handleCopy(cardNumber, 'number')}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {copiedField === 'number' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Expiry</label>
                                <div className="text-base text-white mt-1">{expiry}</div>
                            </div>
                            <div className="relative">
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">CVV</label>
                                <div className="flex items-center justify-between bg-[#333] p-2 rounded mt-1 border border-gray-700 font-mono">
                                    <span>{cvv}</span>
                                    <button
                                        onClick={() => handleCopy(cvv, 'cvv')}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        {copiedField === 'cvv' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Cardholder Name</label>
                            <div className="text-base text-white mt-1">{name}</div>
                        </div>

                        {custom_fields && custom_fields.length > 0 && (
                            <div className="pt-4 border-t border-gray-700">
                                <h3 className="text-sm font-semibold mb-3 text-gray-300">Custom Fields</h3>
                                <div className="space-y-3">
                                    {custom_fields.map((field: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center bg-[#333] p-2 rounded border border-gray-700">
                                            <span className="text-sm text-gray-400">{field.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-white font-medium">{field.value}</span>
                                                <button
                                                    onClick={() => handleCopy(field.value, `custom-${idx}`)}
                                                    className="text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {copiedField === `custom-${idx}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#222] p-4 rounded-b-lg flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition duration-200 text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
