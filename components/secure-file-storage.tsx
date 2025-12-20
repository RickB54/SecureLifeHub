"use client"

import { useState, useRef } from "react"
import { Upload, Download, File, Trash, Filter } from "lucide-react"
import DeleteConfirmationModal from "./modals/delete-confirmation-modal"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./auth-provider"

export default function SecureFileStorage({ records, addItem, deleteItem }) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Get and normalize secure files
  const secureFiles = (records || [])
    .filter((record) => record.type === "secure-file")
    .map(record => ({
      ...record,
      filename: record.title || "Unknown File",
      fileSize: record.item_metadata?.size || 0,
      fileType: record.item_metadata?.type || "application/octet-stream",
      filePath: record.item_metadata?.path || "",
      uploadDate: record.created_at || new Date().toISOString()
    }))

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !user) return

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('vault_files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      await addItem({
        title: file.name,
        type: "secure-file",
        item_metadata: {
          path: filePath,
          size: file.size,
          type: file.type
        }
      })
      console.log(`File uploaded: ${file.name}`)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  // Handle file download
  const handleFileDownload = async (file) => {
    if (!file.filePath) return

    try {
      const { data, error } = await supabase.storage
        .from('vault_files')
        .createSignedUrl(file.filePath, 60) // 1 minute expiry

      if (error) throw error

      const link = document.createElement("a")
      link.href = data.signedUrl
      link.download = file.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log(`File downloading: ${file.filename}`)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Error downloading file')
    }
  }

  // Handle file delete
  const handleDeleteFile = async () => {
    if (!selectedFile) return

    try {
      if (selectedFile.filePath) {
        const { error } = await supabase.storage
          .from('vault_files')
          .remove([selectedFile.filePath])

        if (error) console.error('Error deleting file from storage:', error)
      }

      await deleteItem(selectedFile.id)
      setDeleteConfirmModalOpen(false)
      setSelectedFile(null)
      console.log(`File deleted: ${selectedFile.filename}`)
    } catch (error) {
      console.error('Error deleting file record:', error)
    }
  }

  // Filter files based on search query
  const getFilteredFiles = () => {
    if (!searchQuery.trim()) return secureFiles

    const query = searchQuery.toLowerCase()
    return secureFiles.filter((file) => file.filename.toLowerCase().includes(query))
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Secure File Storage</h1>
          <p className="text-gray-400">Store physical files securely</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload File
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-[#333] hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <Filter className="h-5 w-5 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#2a2a2a] rounded-lg overflow-hidden">
        {getFilteredFiles().length === 0 ? (
          <div className="p-8 text-center text-gray-400">No files found. Upload a file to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#333] text-left">
                  <th className="py-3 px-4 font-semibold">File Name</th>
                  <th className="py-3 px-4 font-semibold">Size</th>
                  <th className="py-3 px-4 font-semibold">Upload Date</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredFiles().map((file) => (
                  <tr key={file.id} className="border-b border-gray-700">
                    <td className="py-3 px-4 flex items-center">
                      <File className="h-5 w-5 mr-2 text-blue-400" />
                      {file.filename}
                    </td>
                    <td className="py-3 px-4">{formatFileSize(file.fileSize || 0)}</td>
                    <td className="py-3 px-4">{new Date(file.uploadDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => handleFileDownload(file)}
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-400"
                          onClick={() => {
                            setSelectedFile(file)
                            setDeleteConfirmModalOpen(true)
                          }}
                          title="Delete"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModalOpen && selectedFile && (
        <DeleteConfirmationModal
          onClose={() => setDeleteConfirmModalOpen(false)}
          onConfirm={handleDeleteFile}
          itemName={selectedFile.filename}
        />
      )}
    </div>
  )
}

