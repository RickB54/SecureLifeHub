"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface AddFinancialCardModalProps {
  onClose: () => void
  onAdd: (data: any) => void
}

export default function AddFinancialCardModal({ onClose, onAdd }: AddFinancialCardModalProps) {
  const [formData, setFormData] = useState({
    cardType: "credit",
    title: "",
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardColor: "#1e3a8a", // Default navy blue
  })

  const presetColors = [
    { name: "Navy", value: "#1e3a8a" },
    { name: "Red", value: "#991b1b" },
    { name: "Orange", value: "#c2410c" },
    { name: "Green", value: "#166534" },
    { name: "Gold", value: "#854d0e" },
    { name: "Purple", value: "#5b21b6" },
    { name: "Black", value: "#171717" },
    { name: "Gray", value: "#374151" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target

    // Auto-formatting for Card Number (16 digits with spaces)
    if (name === "cardNumber") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 16)
      value = digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
    }

    // Auto-formatting for Expiry Date (MM/YY)
    if (name === "expiry") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 4)
      if (digitsOnly.length >= 2) {
        value = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}`
      } else {
        value = digitsOnly
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      onAdd(formData)
    } catch (error) {
      console.log("Add financial card error:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Add Financial Card</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="cardType" className="block text-sm font-medium mb-1">
                Card Type
              </label>
              <select
                id="cardType"
                name="cardType"
                value={formData.cardType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
              >
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
                <option value="prepaid">Prepaid Card</option>
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                placeholder="Personal Visa"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Cardholder Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                Card Number
              </label>
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                value={formData.cardNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                placeholder="0000 0000 0000 0000"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium mb-1">
                  Expiry Date
                </label>
                <input
                  id="expiry"
                  name="expiry"
                  type="text"
                  value={formData.expiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                  placeholder="MM/YY"
                  required
                />
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                  CVV
                </label>
                <input
                  id="cvv"
                  name="cvv"
                  type="text"
                  value={formData.cvv}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                  placeholder="000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Card Color</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    title={color.name}
                    className={`w-8 h-8 rounded-full border-2 ${formData.cardColor === color.value ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData({ ...formData, cardColor: color.value })}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.cardColor}
                  onChange={(e) => setFormData({ ...formData, cardColor: e.target.value })}
                  className="w-10 h-10 bg-transparent border-none rounded-md cursor-pointer"
                />
                <span className="text-sm text-gray-400">Custom color</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#007bff] hover:bg-blue-600 text-white rounded-md transition duration-200"
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
