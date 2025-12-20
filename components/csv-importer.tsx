"use client"

import { useState, useRef } from "react"
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react"

interface CsvImporterProps {
    onImport: (items: any[], folderMapping?: any) => Promise<void>
    bulkAddItems?: (items: any[]) => Promise<any>
    addFolder?: (name: string, parentId?: string) => Promise<any>
    folders?: any[]
}

export default function CsvImporter({ onImport, bulkAddItems, addFolder, folders }: CsvImporterProps) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string[][]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [mapping, setMapping] = useState<any>({
        title: "",
        username: "",
        password: "",
        website: "",
        notes: "",
        folder: "",
    })
    const [uploading, setUploading] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [error, setError] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Simple CSV parser that handles quotes
    const parseCSV = (text: string) => {
        const lines = text.split(/\r\n|\n/)
        const result: string[][] = []

        // Helper to parse a line
        const parseLine = (line: string) => {
            const row: string[] = []
            let currentCell = ""
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
                const char = line[i]
                if (char === '"') {
                    if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                        currentCell += '"'
                        i++
                    } else {
                        inQuotes = !inQuotes
                    }
                } else if (char === ',' && !inQuotes) {
                    row.push(currentCell)
                    currentCell = ""
                } else {
                    currentCell += char
                }
            }
            row.push(currentCell)
            return row
        }

        for (const line of lines) {
            if (line.trim()) {
                result.push(parseLine(line))
            }
        }
        return result
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError("")
        setStatusMessage("")
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setFile(selectedFile)
        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const text = event.target?.result
                if (typeof text !== "string") return

                const data = parseCSV(text)

                if (data.length < 1) {
                    setError("File is empty or invalid CSV")
                    return
                }

                const headerRow = data[0]
                setHeaders(headerRow)
                setPreview(data.slice(1, 6)) // Show first 5 rows

                // Auto-detect mapping
                const newMapping = { ...mapping }
                headerRow.forEach((header, index) => {
                    const h = header.toLowerCase().trim()
                    if (h === "title" || h === "name" || h === "record title") newMapping.title = index.toString()
                    else if (h === "login" || h === "username" || h === "email") newMapping.username = index.toString()
                    else if (h === "password") newMapping.password = index.toString()
                    else if (h === "website address" || h === "url" || h === "website") newMapping.website = index.toString()
                    else if (h === "notes" || h === "note") newMapping.notes = index.toString()
                    else if (h === "folder" || h === "folders") newMapping.folder = index.toString()
                })
                setMapping(newMapping)

            } catch (err) {
                setError("Failed to parse file")
                console.error(err)
            }
        }
        reader.readAsText(selectedFile)
    }

    const handleImport = async () => {
        if (!file || !onImport) return

        // Validate mapping
        if (!mapping.title || (!mapping.password && !mapping.username)) {
            if (!confirm("Title or Password/Username columns not mapped. Continue anyway?")) return
        }

        setUploading(true)
        try {
            const reader = new FileReader()
            reader.onload = async (event) => {
                const text = event.target?.result
                if (typeof text !== "string") return

                const data = parseCSV(text)
                const rows = data.slice(1) // Skip header

                // 1. Process Folders first
                setStatusMessage("Processing folders...")
                const folderMap = new Map<string, string>() // path -> id

                if (mapping.folder && addFolder && folders) {
                    // Pre-fill existing folders
                    folders.forEach(f => {
                        if (f.path) folderMap.set(f.path, f.id)
                        if (f.name) folderMap.set(f.name, f.id) // Fallback
                    })

                    const uniquePaths = new Set<string>()
                    rows.forEach(row => {
                        const path = row[parseInt(mapping.folder)]
                        if (path && path.trim()) {
                            // Keeper uses backslashes for subfolders usually, or we assume simple names
                            // Let's normalize backslashes to forward slashes if needed
                            const normalizedPath = path.replace(/\\/g, "/")
                            uniquePaths.add(normalizedPath)
                        }
                    })

                    // Create missing folders
                    // This is recursive and might be slow for deep nesting, simplify to direct creation for now
                    // or assume addFolder can handle "Personal/Finance" logic? 
                    // Our addFolder is simple (name, parentId).
                    // Complex folder creation is risky. 
                    // Strategy: Just create the leaf folder for now or try to match existing.
                    // For Keeper import safety: We will map the "Folder" string to item_metadata.folder anyway.
                    // And try to link to a top-level folder if it exists or create "Imported" folder?
                    // Better: Create top-level folders for each unique path found?
                    // User said: "make sure that i can import over 600 passwords files with ALL fields"

                    // Simple approach for stability: Create unique folder names at root level if they don't exist.
                    for (const path of Array.from(uniquePaths)) {
                        // Check if exists
                        const parts = path.split("/")
                        const leafName = parts[parts.length - 1] // Just take the last part for now to be safe

                        let existingId = folderMap.get(leafName) || folderMap.get(path)

                        if (!existingId) {
                            try {
                                // Check if we can create it
                                setStatusMessage(`Creating folder: ${leafName}...`)
                                const newFolder = await addFolder(leafName)
                                if (newFolder && newFolder.id) {
                                    folderMap.set(path, newFolder.id)
                                    folderMap.set(leafName, newFolder.id)
                                }
                            } catch (e) {
                                console.error("Failed to create folder", leafName)
                            }
                        }
                    }
                }

                // 2. Process Items
                setStatusMessage("Processing items...")
                const items = rows.map(row => {
                    const item: any = {
                        type: "password", // Default
                        is_favorite: false,
                        is_archived: false,
                        item_metadata: {}
                    }

                    // Standard Fields
                    if (mapping.title) item.title = row[parseInt(mapping.title)] || "Untitled"
                    if (mapping.username) item.username = row[parseInt(mapping.username)]
                    if (mapping.password) item.password = row[parseInt(mapping.password)]
                    if (mapping.website) item.website = row[parseInt(mapping.website)]
                    if (mapping.notes) item.notes = row[parseInt(mapping.notes)]

                    // Folder Link
                    if (mapping.folder) {
                        const path = row[parseInt(mapping.folder)]
                        if (path) {
                            const normalizedPath = path.replace(/\\/g, "/")
                            item.item_metadata.folder = normalizedPath // Save text path

                            // Try to link ID
                            const folderId = folderMap.get(normalizedPath) || folderMap.get(path.split("/").pop() || "")
                            if (folderId) item.folder_id = folderId
                        }
                    }

                    // Map ALL extra fields to metadata
                    // Loop through all headers
                    headers.forEach((h, index) => {
                        // If this index is NOT one of the mapped core fields
                        const isCore = Object.values(mapping).includes(index.toString())
                        if (!isCore) {
                            const value = row[index]
                            if (value && value.trim()) {
                                item.item_metadata[h] = value
                            }
                        }
                    })

                    // Handle Keeper "Custom Field" pairs if detected
                    // Keeper format: "Custom Field 1 Name", "Custom Field 1 Value"
                    // We already mapped them to metadata above, e.g. metadata["Custom Field 1 Name"] = "My Field"
                    // This isn't ideal but preserves the data.
                    // A smarter parser would pair them, but for "importing ALL fields", storing as key-value in metadata is safe.

                    return item
                }).filter(item => item.title || item.username || item.password)

                await onImport(items, folderMap)
                setFile(null)
                setPreview([])
                setStatusMessage("Import complete!")
            }
            reader.readAsText(file)
        } catch (err) {
            setError("Import failed")
            console.error(err)
        } finally {
            setUploading(false)
            setTimeout(() => setStatusMessage(""), 3000)
        }
    }

    return (
        <div className="bg-[#1e1e1e] p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-400" />
                Import Passwords from CSV (Keeper / Generic)
            </h3>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-[#252525] transition-colors"
                >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-300 font-medium">Click to upload CSV file</p>
                    <p className="text-sm text-gray-500 mt-1">Supports standard CSV and Keeper export</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-[#252525] p-3 rounded-md">
                        <span className="flex items-center text-sm font-medium">
                            <FileText className="mr-2 h-4 w-4" />
                            {file.name}
                        </span>
                        <button onClick={() => setFile(null)} className="text-gray-400 hover:text-white text-sm">
                            Change
                        </button>
                    </div>

                    {/* Mapping */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(mapping).map(field => (
                            <div key={field}>
                                <label className="block text-xs uppercase text-gray-500 mb-1">{field}</label>
                                <select
                                    value={mapping[field]}
                                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                                    className="w-full bg-[#333] text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 outline-none"
                                >
                                    <option value="">Skip</option>
                                    {headers.map((h, i) => (
                                        <option key={i} value={i}>{h}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Preview */}
                    <div className="overflow-x-auto border border-gray-700 rounded-md max-h-60">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#252525] text-gray-400 sticky top-0">
                                <tr>
                                    {headers.map((h, i) => (
                                        <th key={i} className="px-3 py-2 font-medium bg-[#252525]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {preview.map((row, i) => (
                                    <tr key={i} className="hover:bg-[#252525]">
                                        {row.map((cell, j) => (
                                            <td key={j} className="px-3 py-2 truncate max-w-[150px]">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {error && (
                        <div className="flex items-center text-red-400 text-sm bg-red-900/20 p-3 rounded">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}

                    {statusMessage && (
                        <div className="flex items-center text-blue-400 text-sm bg-blue-900/20 p-3 rounded">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {statusMessage}
                        </div>
                    )}

                    <button
                        onClick={handleImport}
                        disabled={uploading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? "Importing..." : "Import 600+ Items"}
                    </button>
                </div>
            )}
        </div>
    )
}
