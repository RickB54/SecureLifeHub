"use client"

import { useState, useRef } from "react"
import { Image, X } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"
import CustomFieldsSection, { CustomField } from "./custom-fields-section"

// Update the component to accept folders prop and initialFolderId
export default function AddPasswordModal({ onClose, onAdd, folders, theme, initialFolderId = "" }: { onClose: () => void, onAdd: (data: any) => void, folders: any[], theme: string, initialFolderId?: string }) {
  const [formData, setFormData] = useState({
    website: "",
    username: "",
    password: "",
    notes: "",
    category: "General",
    folder_id: initialFolderId, // Use initialFolderId
    picture: "", // Add picture field
    customFields: [] as CustomField[]
  })

  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false) // Visibility state
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Categories list
  const categories = [
    "General",
    "Work",
    "Personal",
    "Finance",
    "Social",
    "Servers",
    "Health Insurance",
    "Memberships",
    "Secure Notes",
    "Passports",
    "Identity Cards",
    "Software Licenses",
    "SSH Keys",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCustomFieldsChange = (fields: CustomField[]) => {
    setFormData({
      ...formData,
      customFields: fields
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        if (typeof base64String === 'string') {
          setFormData({
            ...formData,
            picture: base64String,
          })
          setPreviewImage(base64String)
        }
        console.log("Picture uploaded")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Prepare metadata
      const item_metadata = {
        customFields: formData.customFields,
        picture: formData.picture
      }

      // If creating a new folder
      const selectedFolder = folders.find(f => f.id === formData.folder_id)
      const folderPath = showNewFolder ? newFolderName.trim() : (selectedFolder ? selectedFolder.path : "")

      const finalData = {
        ...formData,
        item_metadata,
        path: folderPath
      }

      onAdd(finalData)
      console.log("Add clicked")
    } catch (error) {
      console.log("Add password error:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${theme === 'light' ? 'bg-white text-gray-900' : 'bg-black text-white border border-white/20'} rounded-lg shadow-lg w-full max-w-2xl my-8`}>
        <div className={`flex justify-between items-center p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
          <h2 className="text-xl font-bold">Add New Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="website" className="block text-sm font-bold text-gray-200 mb-1">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="text"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                placeholder="example.com"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-200 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                placeholder="username@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="folder" className="block text-sm font-medium mb-1">
                Folder
              </label>
              {!showNewFolder ? (
                <div className="space-y-2">
                  <select
                    id="folder_id"
                    name="folder_id"
                    value={formData.folder_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                  >
                    <option value="">No folder (Root)</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name || folder.path}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewFolder(true)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    + Create new folder
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                    placeholder="New folder name"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewFolder(false)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Use existing folder
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="picture" className="block text-sm font-medium mb-1">
                Picture (Optional)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center px-3 py-2 bg-[#333] border border-gray-700 rounded-md hover:bg-gray-600"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Upload Image
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {previewImage && <span className="text-green-500 text-sm">Image uploaded</span>}
              </div>
              {previewImage && (
                <div className="mt-2">
                  <img
                    src={previewImage || "/placeholder.svg"}
                    alt="Preview"
                    className="h-20 object-contain rounded-md"
                  />
                </div>
              )}
            </div>

            <CustomFieldsSection
              fields={formData.customFields}
              onChange={handleCustomFieldsChange}
            />

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                placeholder="Add notes (optional)"
              />
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
              Add Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

