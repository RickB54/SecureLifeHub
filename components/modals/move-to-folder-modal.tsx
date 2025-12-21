"use client"

import { useState } from "react"
import { X, Folder } from "lucide-react"

interface MoveToFolderModalProps {
  onClose: () => void
  onMove: (folderId: string) => void
  folders: any[]
  record: any
  theme: string
}

export default function MoveToFolderModal({ onClose, onMove, folders, record, theme }: MoveToFolderModalProps) {
  const [selectedFolder, setSelectedFolder] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      onMove(selectedFolder)
    } catch (error) {
      console.log("Move to folder error:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#2a2a2a] text-white'} rounded-xl shadow-2xl w-full max-w-md overflow-hidden`}>
        <div className={`flex justify-between items-center p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-500" />
            Move Item
          </h2>
          <button onClick={onClose} className={`p-2 rounded-full ${theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-700 text-gray-400'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <p className={`text-sm mb-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Select a destination for <strong>{record?.name || record?.website || record?.username || "this item"}</strong>:
            </p>

            <div className={`space-y-2 max-h-60 overflow-y-auto p-2 rounded-lg border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-[#1a1a1a] border-gray-700'}`}>
              <div
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedFolder === ""
                  ? "bg-blue-500 text-white"
                  : theme === 'light' ? "hover:bg-gray-200 text-gray-700" : "hover:bg-gray-700 text-gray-300"
                  }`}
                onClick={() => setSelectedFolder("")}
              >
                <Folder className={`h-5 w-5 mr-3 ${selectedFolder === "" ? "text-white" : "text-blue-400"}`} />
                <span className="font-medium">Root (No folder)</span>
              </div>

              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedFolder === folder.id
                    ? "bg-blue-500 text-white"
                    : theme === 'light' ? "hover:bg-gray-200 text-gray-700" : "hover:bg-gray-700 text-gray-300"
                    }`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <Folder className={`h-5 w-5 mr-3 ${selectedFolder === folder.id ? "text-white" : "text-yellow-400"}`} />
                  <span className="font-medium">{folder.path}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 ${theme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'} rounded-lg transition duration-200`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
            >
              Move
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

