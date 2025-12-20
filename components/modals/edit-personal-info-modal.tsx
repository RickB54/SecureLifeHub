"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface EditPersonalInfoModalProps {
  onClose: () => void
  onSave: (data: any) => void
  personalInfoData: any
  theme?: string
}

export default function EditPersonalInfoModal({ onClose, onSave, personalInfoData, theme }: EditPersonalInfoModalProps) {
  const [formData, setFormData] = useState({
    type: "contact",
    title: "",
    name: "",
    details: "",
  })

  // Initialize form with existing data
  useEffect(() => {
    if (personalInfoData) {
      setFormData({
        type: personalInfoData.type || "contact",
        title: personalInfoData.title || "",
        name: personalInfoData.name || "",
        details: personalInfoData.details || "",
        frontImage: personalInfoData.frontImage || "",
        backImage: personalInfoData.backImage || "",
      })
    }
  }, [personalInfoData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      onSave(formData)
    } catch (error) {
      console.log("Edit personal info error:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Edit Personal Information</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
              >
                <option value="contact">Contact</option>
                <option value="address">Address</option>
                <option value="identity">Identity</option>
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
                placeholder="Home Address"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
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
              <label htmlFor="details" className="block text-sm font-medium mb-1">
                Details
              </label>
              <textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                placeholder="Additional details"
              />
            </div>

            {/* Identity Document Uploads */}
            {formData.type === 'identity' && (
              <div className="space-y-4 pt-2 border-t border-gray-700">
                <h3 className="font-semibold text-sm">Identity Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Front Image</label>
                    {/* @ts-ignore */}
                    {formData.frontImage && (
                      /* @ts-ignore */
                      <img src={formData.frontImage} alt="Front" className="w-full h-32 object-cover rounded-md mb-2 border border-gray-600" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, frontImage: reader.result as string }))
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="text-xs w-full text-gray-400 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#333] file:text-white hover:file:bg-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Back Image</label>
                    {/* @ts-ignore */}
                    {formData.backImage && (
                      /* @ts-ignore */
                      <img src={formData.backImage} alt="Back" className="w-full h-32 object-cover rounded-md mb-2 border border-gray-600" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, backImage: reader.result as string }))
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="text-xs w-full text-gray-400 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#333] file:text-white hover:file:bg-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}
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

