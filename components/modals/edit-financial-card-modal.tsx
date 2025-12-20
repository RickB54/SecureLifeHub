"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface EditFinancialCardModalProps {
  onClose: () => void
  onSave: (data: any) => void
  cardData: any
}

export default function EditFinancialCardModal({ onClose, onSave, cardData }: EditFinancialCardModalProps) {
  const [formData, setFormData] = useState({
    cardType: "credit",
    title: "",
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    custom_fields: [] as { label: string; value: string }[],
  })

  // Initialize form with existing data
  useEffect(() => {
    if (cardData) {
      setFormData({
        cardType: cardData.cardType || "credit",
        title: cardData.title || "",
        name: cardData.name || "",
        cardNumber: cardData.cardNumber || "",
        expiry: cardData.expiry || "",
        cvv: cardData.cvv || "",
        custom_fields: cardData.custom_fields || [],
      })
    }
  }, [cardData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => { // Added type for e here as well
    e.preventDefault()
    try {
      onSave(formData)
      console.log("Edit clicked")
    } catch (error) {
      console.log("Edit financial card error:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Edit Financial Card</h2>
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
                placeholder="•••• •••• •••• ••••"
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
                  placeholder="•••"
                  required
                />
              </div>
            </div>

            {/* Custom Fields */}
            <div>
              <label className="block text-sm font-medium mb-2">Custom Fields</label>
              {(formData.custom_fields || []).map((field, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    placeholder="Label"
                    value={field.label}
                    onChange={(e) => {
                      const newFields = [...(formData.custom_fields || [])]
                      newFields[index].label = e.target.value
                      setFormData({ ...formData, custom_fields: newFields })
                    }}
                    className="w-1/3 px-3 py-2 bg-[#333] border border-gray-700 rounded-md text-sm"
                  />
                  <input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) => {
                      const newFields = [...(formData.custom_fields || [])]
                      newFields[index].value = e.target.value
                      setFormData({ ...formData, custom_fields: newFields })
                    }}
                    className="flex-1 px-3 py-2 bg-[#333] border border-gray-700 rounded-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFields = [...(formData.custom_fields || [])]
                      newFields.splice(index, 1)
                      setFormData({ ...formData, custom_fields: newFields })
                    }}
                    className="text-red-500 hover:text-red-400 p-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, custom_fields: [...(formData.custom_fields || []), { label: "", value: "" }] })}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
              >
                + Add Custom Field
              </button>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

