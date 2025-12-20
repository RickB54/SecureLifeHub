"\"use client"

import { X, AlertTriangle } from "lucide-react"

interface DeleteConfirmationModalProps {
  onClose: () => void
  onConfirm: () => void
  itemName?: string
  theme?: string
}

export default function DeleteConfirmationModal({ onClose, onConfirm, itemName, theme }: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Confirm Delete</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Are you sure?</h3>
              <p className="text-gray-400">
                You are about to delete {itemName || "this item"}. This action cannot be undone.
              </p>
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
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

