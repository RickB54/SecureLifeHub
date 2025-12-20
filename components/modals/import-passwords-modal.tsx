"use client"

import { useState } from "react"
import { X, Upload, AlertCircle } from "lucide-react"

export default function ImportPasswordsModal({ onClose, onImport }) {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type !== "text/csv") {
      setError("Please select a CSV file")
      return
    }
    setFile(selectedFile)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file to import")
      return
    }

    try {
      setIsUploading(true)
      setProgress(0)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // Read the file
      const text = await readFileAsText(file)

      // Parse CSV
      const { headers, data } = parseCSV(text)

      // Validate headers for Keeper Security format
      const requiredHeaders = ["url", "username", "password"]
      const keeperHeaders = ["url", "username", "password", "notes", "title", "folder", "custom_fields"]

      // Check if we have at least the minimum required headers
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

      if (missingHeaders.length > 0) {
        setError(`Missing required headers: ${missingHeaders.join(", ")}`)
        clearInterval(progressInterval)
        setIsUploading(false)
        return
      }

      // Complete progress
      setProgress(100)
      clearInterval(progressInterval)

      // Process the data
      const importedRecords = data.map((row) => {
        return {
          website: row.url || row.website || "",
          username: row.username || row.email || "",
          password: row.password || "",
          notes: row.notes || "",
          category: row.folder || row.category || "General",
          path: row.folder || "",
          // Use title as website if url is not available
          ...(row.title && !row.url && { website: row.title }),
        }
      })

      // Call the import handler
      setTimeout(() => {
        onImport(importedRecords)
        console.log(`Import completed: ${importedRecords.length} entries`)
      }, 500)
    } catch (error) {
      console.log("Import error:", error)
      setError("Failed to import passwords. Please check the file format.")
      setIsUploading(false)
    }
  }

  // Helper to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  // Helper to parse CSV
  const parseCSV = (text) => {
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    const data = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      // Handle quoted values with commas
      const values = []
      let inQuote = false
      let currentValue = ""

      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j]

        if (char === '"') {
          inQuote = !inQuote
        } else if (char === "," && !inQuote) {
          values.push(currentValue)
          currentValue = ""
        } else {
          currentValue += char
        }
      }

      values.push(currentValue)

      // Create object from headers and values
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].replace(/^"|"$/g, "") : ""
      })

      data.push(row)
    }

    return { headers, data }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Import Passwords</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="file" className="block text-sm font-medium mb-1">
                Select CSV File
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-md p-6 text-center">
                <input id="file" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                <label htmlFor="file" className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium">{file ? file.name : "Click to select a CSV file"}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    {file ? `${(file.size / 1024).toFixed(2)} KB` : "Supports Keeper Security CSV format"}
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-800 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#007bff] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="bg-blue-900 bg-opacity-30 border border-blue-800 rounded-md p-3">
              <h3 className="text-sm font-medium text-blue-400 mb-1">Important Notes:</h3>
              <ul className="text-xs text-blue-300 list-disc list-inside space-y-1">
                <li>
                  Supports Keeper Security CSV format with headers: url, username, password, notes, title, folder,
                  custom_fields
                </li>
                <li>The import supports 600+ entries</li>
                <li>After importing, please delete the CSV file from your computer for security</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition duration-200"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#007bff] hover:bg-blue-600 text-white rounded-md transition duration-200"
              disabled={!file || isUploading}
            >
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

