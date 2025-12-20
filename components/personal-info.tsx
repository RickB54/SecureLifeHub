"use client"

import { useState, useRef, useEffect } from "react"
import {
  Plus,
  MoreHorizontal,
  Grid,
  ListIcon,
  Search,
  ChevronDown,
  Edit,
  Trash,
  Archive,
  Star,
  FileDown,
  FileUp,
  Filter,
} from "lucide-react"
import AddPersonalInfoModal from "./modals/add-personal-info-modal"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import EditPersonalInfoModal from "./modals/edit-personal-info-modal"

import { VaultItem } from "@/hooks/use-vault"

interface PersonalInfoProps {
  records: (VaultItem | any)[]
  addItem: (item: any) => Promise<any>
  updateItem: (id: string, updates: any) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  bulkAddItems?: (items: any[]) => Promise<any>
  theme: string
}

export default function PersonalInfo({ records, addItem, updateItem, deleteItem, bulkAddItems, theme }: PersonalInfoProps) {
  // State for view mode (grid or list)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // State for filters
  const [typeFilter, setTypeFilter] = useState("all")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [favoriteFilter, setFavoriteFilter] = useState(false)
  const [archivedFilter, setArchivedFilter] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // State for modals
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<VaultItem | null>(null)

  // State for action menus
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Ref for clicking outside to close menus
  const menuRef = useRef<HTMLDivElement>(null)

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get personal info records
  const personalInfoRecords = (records || []).filter(
    (record) =>
      record.type === "personal-info" ||
      record.type === "contact" ||
      record.type === "Contact" ||
      record.type === "address" ||
      record.type === "identity",
  )

  // Get contact records specifically
  const contactRecords = personalInfoRecords.filter((record) => record.type === "contact" || record.type === "Contact")

  // Filter records based on selected filters
  const getFilteredRecords = () => {
    let filtered = personalInfoRecords

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((record) => record.type?.toLowerCase() === typeFilter.toLowerCase())
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.title?.toLowerCase().includes(query) ||
          record.name?.toLowerCase().includes(query) ||
          record.item_metadata?.details?.toLowerCase().includes(query) ||
          record.item_metadata?.businessName?.toLowerCase().includes(query) ||
          record.item_metadata?.telephone?.includes(query) ||
          record.item_metadata?.email?.toLowerCase().includes(query) ||
          record.item_metadata?.address?.toLowerCase().includes(query) ||
          record.notes?.toLowerCase().includes(query),
      )
    }

    // Filter by favorites
    if (favoriteFilter) {
      filtered = filtered.filter((record) => record.is_favorite)
    }

    // Filter by archived
    if (archivedFilter) {
      filtered = filtered.filter((record) => record.is_archived)
    }

    return filtered
  }

  // Handle adding new personal info
  const handleAddPersonalInfo = async (newInfo: any) => {
    await addItem({
      ...newInfo,
      type: newInfo.type || "personal-info"
    })
    setAddModalOpen(false)
  }

  // Handle editing personal info
  const handleEditPersonalInfo = async (updatedInfo: any) => {
    if (!selectedRecord) return
    await updateItem(selectedRecord.id, updatedInfo)
    setEditModalOpen(false)
    setSelectedRecord(null)
  }

  // Handle deleting a record
  const handleDelete = async () => {
    if (!selectedRecord) return
    await deleteItem(selectedRecord.id)
    setDeleteConfirmModalOpen(false)
    setSelectedRecord(null)
  }

  // Handle toggling archive status
  const handleToggleArchive = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (record) {
      await updateItem(id, { is_archived: !record.is_archived })
    }
  }

  // Handle toggling favorite status
  const handleToggleFavorite = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (record) {
      await updateItem(id, { is_favorite: !record.is_favorite })
    }
  }

  // Export contacts to CSV
  const exportContacts = () => {
    // Define CSV headers
    const headers = [
      "id",
      "type",
      "name",
      "businessName",
      "telephone",
      "email",
      "address",
      "notes",
      "isFavorite",
      "isArchived",
    ]

    // Create CSV content
    let csvContent = headers.join(",") + "\n"

    // Add each contact as a row
    contactRecords.forEach((contact) => {
      const row = [
        contact.id,
        contact.type || "Contact",
        contact.name || "",
        contact.item_metadata?.businessName || "",
        contact.item_metadata?.telephone || "",
        contact.item_metadata?.email || "",
        contact.item_metadata?.address || "",
        contact.notes || "",
        contact.is_favorite ? "true" : "false",
        contact.is_archived ? "true" : "false",
      ]

      // Escape any commas in the values
      const escapedRow = row.map((value) => {
        if (value && typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })

      csvContent += escapedRow.join(",") + "\n"
    })

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "contacts.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log("Contacts exported")
  }

  // Import contacts from CSV
  const importContacts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const content = e.target?.result
      if (typeof content !== "string") return

      const lines = content.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      const newContacts: any[] = []

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue

        const values = parseCSVLine(lines[i])
        if (values.length !== headers.length) continue

        const contact: any = { item_metadata: {} }

        headers.forEach((header, index) => {
          const value = values[index]

          if (header === "id") return // Skip ID for new items

          if (header === "type") contact.type = value
          else if (header === "name") contact.name = value
          else if (header === "notes") contact.notes = value
          else if (header === "is_favorite" || header === "isFavorite") contact.is_favorite = value.toLowerCase() === "true"
          else if (header === "is_archived" || header === "isArchived") contact.is_archived = value.toLowerCase() === "true"
          else {
            // Map legacy/flat fields to metadata
            if (["businessName", "telephone", "email", "address", "details"].includes(header)) {
              contact.item_metadata[header] = value
            } else {
              // Default to metadata for unknown columns
              contact.item_metadata[header] = value
            }
          }
        })

        // Ensure type defaults
        if (!contact.type) contact.type = "contact"

        newContacts.push(contact)
      }

      if (bulkAddItems) {
      } else {
        console.error("bulkAddItems not available")
      }
    }

    reader.readAsText(file)

    // Reset file input
    event.target.value = ""
  }

  // Helper function to parse CSV line handling quoted values
  const parseCSVLine = (line: string) => {
    const values: string[] = []
    let inQuotes = false
    let currentValue = ""

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quotes (two double quotes in a row)
          currentValue += '"'
          i++ // Skip the next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        // End of value
        values.push(currentValue)
        currentValue = ""
      } else {
        // Add character to current value
        currentValue += char
      }
    }

    // Add the last value
    values.push(currentValue)

    return values
  }

  // Render table rows
  const renderTableRows = () => {
    const filteredRecords = getFilteredRecords()

    if (filteredRecords.length === 0) {
      return (
        <tr>
          <td colSpan={5} className={`py-4 text-center ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
            No personal information found. Try changing your filters or adding new information.
          </td>
        </tr>
      )
    }

    return filteredRecords.map((record) => (
      <tr key={record.id} className={`border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
        <td className="py-3 px-4">{record.type}</td>
        <td className="py-3 px-4">{record.title || record.name}</td>
        <td className="py-3 px-4">{record.name || record.businessName}</td>
        <td className="py-3 px-4">{record.details || record.telephone || record.email}</td>
        <td className="py-3 px-4">
          <div className="flex items-center space-x-2">
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={() => {
                setSelectedRecord(record)
                setEditModalOpen(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              className={`${record.isFavorite ? "text-yellow-300" : "text-yellow-400 hover:text-yellow-300"}`}
              onClick={() => handleToggleFavorite(record.id)}
            >
              <Star className="h-4 w-4" fill={record.isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              className={`${record.isArchived ? "text-green-400" : "text-gray-400 hover:text-gray-300"}`}
              onClick={() => handleToggleArchive(record.id)}
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              className="text-red-500 hover:text-red-400"
              onClick={() => {
                setSelectedRecord(record)
                setDeleteConfirmModalOpen(true)
              }}
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    ))
  }

  // Render grid items
  const renderGridItems = () => {
    const filteredRecords = getFilteredRecords()

    if (filteredRecords.length === 0) {
      return (
        <div className={`col-span-full py-8 text-center ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
          No personal information found. Try changing your filters or adding new information.
        </div>
      )
    }

    return filteredRecords.map((record) => (
      <div
        key={record.id}
        className={`${theme === "light" ? "bg-white shadow-md" : "bg-[#2a2a2a]"} rounded-lg p-4 shadow-md flex flex-col`}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold">{record.title || record.name || "Unnamed"}</h3>
          <div className="relative">
            <button
              className={`${theme === "light" ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveMenu(activeMenu === record.id ? null : record.id)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {/* Dropdown menu */}
            {activeMenu === record.id && (
              <div
                ref={menuRef}
                className={`absolute right-0 mt-2 w-48 ${theme === "light" ? "bg-white" : "bg-[#333]"} rounded-md shadow-lg py-1 z-10`}
              >
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={() => {
                    setSelectedRecord(record)
                    setEditModalOpen(true)
                    setActiveMenu(null)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={() => {
                    handleToggleFavorite(record.id)
                    setActiveMenu(null)
                  }}
                >
                  <Star className="h-4 w-4 mr-2" fill={record.isFavorite ? "currentColor" : "none"} />
                  {record.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </button>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={() => {
                    handleToggleArchive(record.id)
                    setActiveMenu(null)
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {record.isArchived ? "Unarchive" : "Archive"}
                </button>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left text-red-500 ${theme === "light" ? "hover:bg-red-50" : "hover:bg-red-900 hover:bg-opacity-50"}`}
                  onClick={() => {
                    setSelectedRecord(record)
                    setDeleteConfirmModalOpen(true)
                    setActiveMenu(null)
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center">
            <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Type:</span>
            <span className="flex-1 truncate capitalize">{record.type}</span>
          </div>

          {record.type === "contact" || record.type === "Contact" ? (
            <>
              <div className="flex items-center">
                <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Name:</span>
                <span className="flex-1 truncate">{record.name || record.title}</span>
              </div>

              {record.item_metadata?.businessName && (
                <div className="flex items-center">
                  <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Business:</span>
                  <span className="flex-1 truncate">{record.item_metadata.businessName}</span>
                </div>
              )}

              {record.item_metadata?.telephone && (
                <div className="flex items-center">
                  <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Phone:</span>
                  <span className="flex-1 truncate">{record.item_metadata.telephone}</span>
                </div>
              )}

              {record.item_metadata?.email && (
                <div className="flex items-center">
                  <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Email:</span>
                  <span className="flex-1 truncate">{record.item_metadata.email}</span>
                </div>
              )}

              {record.item_metadata?.address && (
                <div className="flex items-center">
                  <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Address:</span>
                  <span className="flex-1 truncate">{record.item_metadata.address}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center">
                <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Name:</span>
                <span className="flex-1 truncate">{record.name || record.title}</span>
              </div>

              {record.item_metadata?.details && (
                <div className="flex items-center">
                  <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Details:</span>
                  <span className="flex-1 truncate">{record.item_metadata.details}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div
          className={`flex justify-between items-center mt-4 pt-3 border-t ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}
        >
          <span className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
            {new Date(record.updated_at || record.created_at).toLocaleDateString()}
          </span>

          <div className="flex items-center space-x-2">
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={() => {
                setSelectedRecord(record)
                setEditModalOpen(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              className={`${record.is_favorite ? "text-yellow-300" : "text-yellow-400 hover:text-yellow-300"}`}
              onClick={() => handleToggleFavorite(record.id)}
            >
              <Star className="h-4 w-4" fill={record.is_favorite ? "currentColor" : "none"} />
            </button>
            <button
              className="text-red-500 hover:text-red-400"
              onClick={() => {
                setSelectedRecord(record)
                setDeleteConfirmModalOpen(true)
              }}
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Personal Information</h1>
          <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
            Manage your personal information securely
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New
          </button>

          <div className={`flex items-center ${theme === "light" ? "bg-gray-200" : "bg-[#333]"} rounded-md`}>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "text-[#007bff]" : theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-white"}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "text-[#007bff]" : theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-white"}`}
            >
              <ListIcon className="h-5 w-5" />
            </button>
          </div>

          {/* CSV Import/Export Buttons */}
          <button
            onClick={exportContacts}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <FileDown className="h-5 w-5 mr-2" />
            Export Contacts
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <FileUp className="h-5 w-5 mr-2" />
            Import Contacts
          </button>
          <input type="file" ref={fileInputRef} onChange={importContacts} accept=".csv" className="hidden" />
        </div>
      </div>

      <button
        onClick={() => {
          setShowFilters(!showFilters)
          console.log("Filters toggled on Personal Info page:", !showFilters)
        }}
        className={`flex items-center ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-[#333] hover:bg-gray-600"} text-${theme === "light" ? "gray-800" : "white"} px-4 py-2 rounded-md transition duration-200`}
      >
        <Filter
          className={`h-5 w-5 mr-2 ${showFilters ? "text-[#007bff]" : theme === "light" ? "text-gray-600" : "text-gray-400"}`}
        />
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {showFilters && (
        <div className={`${theme === "light" ? "bg-white shadow-md" : "bg-[#2a2a2a]"} rounded-lg p-4 mb-4`}>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}
              />
              <input
                type="text"
                placeholder="Search personal information..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-[#333] border-gray-500"} border rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]`}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <button
                  className={`flex items-center justify-between ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} px-4 py-2 rounded-md transition duration-200 min-w-32`}
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                >
                  <span>Type: {typeFilter === "all" ? "All" : typeFilter}</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>

                {showFilterMenu && (
                  <div
                    className={`absolute z-10 mt-1 w-full ${theme === "light" ? "bg-white" : "bg-[#333]"} rounded-md shadow-lg py-1`}
                  >
                    <button
                      className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${typeFilter === "all" ? "bg-blue-600 text-white" : ""}`}
                      onClick={() => {
                        setTypeFilter("all")
                        setShowFilterMenu(false)
                      }}
                    >
                      All
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${typeFilter === "contact" ? "bg-blue-600 text-white" : ""}`}
                      onClick={() => {
                        setTypeFilter("contact")
                        setShowFilterMenu(false)
                      }}
                    >
                      Contact
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${typeFilter === "address" ? "bg-blue-600 text-white" : ""}`}
                      onClick={() => {
                        setTypeFilter("address")
                        setShowFilterMenu(false)
                      }}
                    >
                      Address
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${typeFilter === "identity" ? "bg-blue-600 text-white" : ""}`}
                      onClick={() => {
                        setTypeFilter("identity")
                        setShowFilterMenu(false)
                      }}
                    >
                      Identity
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  className={`flex items-center justify-between ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} ${favoriteFilter ? "bg-blue-600 text-white" : ""} px-4 py-2 rounded-md transition duration-200`}
                  onClick={() => {
                    setFavoriteFilter(!favoriteFilter)
                    setArchivedFilter(false) // Turn off archived filter when favorites is toggled
                    console.log("Filter applied: Favorites")
                  }}
                >
                  <span>Favorites</span>
                  <Star className="h-4 w-4 ml-2" fill={favoriteFilter ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="relative">
                <button
                  className={`flex items-center justify-between ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} ${archivedFilter ? "bg-blue-600 text-white" : ""} px-4 py-2 rounded-md transition duration-200`}
                  onClick={() => {
                    setArchivedFilter(!archivedFilter)
                    setFavoriteFilter(false) // Turn off favorites filter when archived is toggled
                    console.log("Filter applied: Archives")
                  }}
                >
                  <span>Archives</span>
                  <Archive className="h-4 w-4 ml-2" />
                </button>
              </div>

              <button
                className={`${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} px-4 py-2 rounded-md transition duration-200`}
                onClick={() => {
                  setTypeFilter("all")
                  setSearchQuery("")
                  setFavoriteFilter(false)
                  setArchivedFilter(false)
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <div className={`${theme === "light" ? "bg-white shadow-md" : "bg-[#2a2a2a]"} rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${theme === "light" ? "bg-gray-100" : "bg-[#333]"} text-left`}>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Title</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Details</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{renderGridItems()}</div>
      )}

      {/* Modals */}
      {addModalOpen && (
        <AddPersonalInfoModal onClose={() => setAddModalOpen(false)} onAdd={handleAddPersonalInfo} theme={theme} />
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <EditPersonalInfoModal
          onClose={() => setEditModalOpen(false)}
          onSave={handleEditPersonalInfo}
          personalInfoData={selectedRecord}
          theme={theme}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModalOpen && (
        <DeleteConfirmationModal
          onClose={() => setDeleteConfirmModalOpen(false)}
          onConfirm={handleDelete}
          itemName={selectedRecord?.title || selectedRecord?.name || "this item"}
          theme={theme}
        />
      )}
    </div>
  )
}

