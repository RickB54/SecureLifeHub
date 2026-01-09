"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface AddFolderModalProps {
  onClose: () => void
  onAdd: (data: any) => Promise<void>
  folders: any[]
  theme: string
  initialParentId?: string
}

export default function AddFolderModal({ onClose, onAdd, folders, theme, initialParentId }: AddFolderModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    parentFolder: initialParentId || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
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
      console.log("Add folder error:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'light' ? 'bg-white text-gray-900' : 'bg-black text-white border border-white/20'} rounded-lg shadow-lg w-full max-w-md`}>
        <div className={`flex justify-between items-center p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
          <h2 className="text-xl font-bold">Add New Folder</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-200 mb-1">
                Folder Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                placeholder="My Folder"
                required
              />
            </div>

            <div>
              <label htmlFor="parentFolder" className="block text-sm font-bold text-gray-200 mb-1">
                Parent Folder (Optional)
              </label>
              <select
                id="parentFolder"
                name="parentFolder"
                value={formData.parentFolder}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
              >
                <option value="">None (Root level)</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.path || folder.name}
                  </option>
                ))}
              </select>
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
              Add Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

