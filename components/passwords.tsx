"use client"

import { useState, useRef, useEffect } from "react"
import {
  Plus,
  Folder,
  MoreHorizontal,
  Grid,
  ListIcon,
  Search,
  ChevronDown,
  Star,
  Archive,
  Trash,
  Edit,
  ChevronRight,
  Eye,
  EyeOff,
  FolderTree,
  ExternalLink,
  Copy,
  Filter,
  Image,
} from "lucide-react"
import AddPasswordModal from "./modals/add-password-modal"
import AddFolderModal from "./modals/add-folder-modal"
import MoveToFolderModal from "./modals/move-to-folder-modal"
import EditPasswordModal from "./modals/edit-password-modal"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import AutoFill from "./auto-fill"
import ViewPictureModal from "./modals/view-picture-modal"

interface PasswordsProps {
  records: any[]
  addItem: (item: any) => Promise<void>
  addFolder: (name: string, parent?: string) => Promise<void>
  updateItem: (id: string, item: any) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  theme: string
  initialCategoryFilter?: string
  showAllTypes?: boolean
  initialFavoriteFilter?: boolean
  initialArchivedFilter?: boolean
}

export default function Passwords({
  records,
  addItem,
  addFolder,
  updateItem,
  deleteItem,
  theme,
  initialCategoryFilter = "all",
  showAllTypes = false,
  initialFavoriteFilter = false,
  initialArchivedFilter = false
}: PasswordsProps) {
  // State for view mode (grid, list, or folder)
  const [viewMode, setViewMode] = useState("list")

  // State for filters
  const [typeFilter, setTypeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter)
  const [timeFilter, setTimeFilter] = useState("all")
  const [favoriteFilter, setFavoriteFilter] = useState(initialFavoriteFilter)
  const [archivedFilter, setArchivedFilter] = useState(initialArchivedFilter)
  const [selectedFolder, setSelectedFolder] = useState("")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showCategoryFilterMenu, setShowCategoryFilterMenu] = useState(false)
  const [showTimeFilterMenu, setShowTimeFilterMenu] = useState(false)
  const [showStatusFilterMenu, setShowStatusFilterMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // State for showing/hiding filters
  const [showFilters, setShowFilters] = useState(false)

  // State for visible card numbers
  // @ts-ignore
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})

  // State for expanded folders
  // @ts-ignore
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  // State for modals
  const [addPasswordModalOpen, setAddPasswordModalOpen] = useState(false)
  const [addFolderModalOpen, setAddFolderModalOpen] = useState(false)
  const [moveToFolderModalOpen, setMoveToFolderModalOpen] = useState(false)
  const [editPasswordModalOpen, setEditPasswordModalOpen] = useState(false)
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [autoFillModalOpen, setAutoFillModalOpen] = useState(false)
  const [viewPictureModalOpen, setViewPictureModalOpen] = useState(false)

  // Ref for dropdown menus
  const menuRef = useRef<HTMLDivElement>(null)

  // State for active dropdown menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

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

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords({
      ...visiblePasswords,
      [id]: !visiblePasswords[id],
    })
  }

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders({
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId],
    })
  }

  // Handle adding a new password
  const handleAddPassword = async (newPassword: any) => {
    let folderId = null;

    // If a new folder was created implicitly by path
    if (newPassword.path) {
      const existingFolder = folders.find(f => f.path === newPassword.path);

      if (!existingFolder) {
        // Create new folder if it doesn't exist
        const folderName = newPassword.path.split("/").pop()
        await addFolder(folderName)
        // Note: We can't easily get the ID of the just-created folder here without refetching or returning it from addFolder
        // checking if we can find it after addFolder logic depends on parent updates.
        // For now, relies on path matching which should work, but ideal is to have ID.
      } else {
        folderId = existingFolder.id;
      }
    }

    await addItem({
      ...newPassword,
      type: "password",
      folder_id: folderId // Explicitly save folder_id
    })
    setAddPasswordModalOpen(false)
  }

  // Handle adding a new folder
  const handleAddFolder = async (folderData: any) => {
    await addFolder(folderData.name, folderData.parentFolder)
    setAddFolderModalOpen(false)
  }

  // Handle moving a record to a folder
  const handleMoveToFolder = async (folderId: string) => {
    if (!selectedRecord) return

    // Find the target folder
    const targetFolder = records.find((r) => r.id === folderId)
    const targetPath = targetFolder ? targetFolder.path : ""

    // @ts-ignore
    await updateItem(selectedRecord.id, {
      path: targetPath,
      folder_id: targetFolder?.id || null, // Ensure we clear the folder ID if moving to root
      folder: targetPath // Update legacy folder field if it exists
    })

    setMoveToFolderModalOpen(false)
    setSelectedRecord(null)
  }

  // Handle deleting a record
  const handleDelete = async (id: string) => {
    await deleteItem(id)
  }

  // Handle toggling favorite status
  const handleToggleFavorite = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (record) {
      // Use is_favorite (snake_case) to match DB
      await updateItem(id, { is_favorite: !record.is_favorite })
    }
  }

  // Handle toggling archive status
  const handleToggleArchive = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (record) {
      // Use is_archived (snake_case) to match DB
      await updateItem(id, { is_archived: !record.is_archived })
    }
  }

  // Handle edit password
  const handleEditPassword = (id: string) => {
    const passwordToEdit = records.find((record) => record.id === id)
    setSelectedRecord(passwordToEdit)
    setEditPasswordModalOpen(true)
  }

  // Handle duplicate password
  const handleDuplicatePassword = async (password: any) => {
    try {
      const { id, created_at, updated_at, ...rest } = password
      await addItem({
        ...rest,
        username: `${rest.username || ''} (Copy)`,
        type: "password"
      })
    } catch (error) {
      console.error("Failed to duplicate password", error)
    }
  }

  // Handle save edited password
  const handleSaveEditedPassword = async (updatedData: any) => {
    if (!selectedRecord) return
    // @ts-ignore
    await updateItem(selectedRecord.id, updatedData)
    setEditPasswordModalOpen(false)
    setSelectedRecord(null)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return
    await deleteItem(selectedRecord.id)
    setDeleteConfirmModalOpen(false)
    setSelectedRecord(null)
  }

  // Sync state with props when they change
  useEffect(() => {
    setCategoryFilter(initialCategoryFilter)
  }, [initialCategoryFilter])

  useEffect(() => {
    setFavoriteFilter(initialFavoriteFilter)
  }, [initialFavoriteFilter])

  useEffect(() => {
    setArchivedFilter(initialArchivedFilter)
  }, [initialArchivedFilter])

  // Handle view picture
  const handleViewPicture = (password: any) => {
    setSelectedRecord(password)
    setViewPictureModalOpen(true)
    console.log("Picture viewed: " + password.id)
  }

  // Get all folders
  const folders = records.filter((record) => record.type === "folder")

  // Get records based on configuration (default to passwords only, unless showAllTypes is true)
  const displayedRecords = showAllTypes
    ? records.filter(r => r.type !== "folder")
    : records.filter((record) => record.type === "password")

  // Use displayedRecords instead of 'passwords' for filtering
  const passwords = displayedRecords

  // Get all unique categories
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

  // Build folder structure
  const topLevelFolders = folders.filter((folder) => !folder.path.includes("/"))

  // Function to get direct subfolders of a folder
  const getSubfolders = (parentPath: string) => {
    return folders.filter((folder) => {
      const folderParts = folder.path.split("/")
      return folderParts.length > 1 && folder.path.startsWith(parentPath + "/")
    })
  }

  // Function to get direct passwords in a folder (not in subfolders)
  const getDirectPasswordsInFolder = (folderPath: string) => {
    // Find the folder object that matches this path to get its ID
    const folderObj = folders.find(f => f.path === folderPath)

    return passwords.filter((password) => {
      // For top-level folders, match exact path
      if (!folderPath.includes("/")) {
        const passwordParts = password.path ? password.path.split("/") : []
        const isPathMatch = passwordParts.length === 1 && passwordParts[0] === folderPath;
        const isIdMatch = folderObj && password.folder_id === folderObj.id;
        return isPathMatch || isIdMatch
      }

      // For subfolders
      const isPathMatch = password.path === folderPath || password.folder === folderPath;
      const isIdMatch = folderObj && password.folder_id === folderObj.id;
      return isPathMatch || isIdMatch
    })
  }

  // Add a function to filter passwords based on selected filters and folder
  const getFilteredPasswords = () => {
    let filtered = passwords

    // Filter by folder
    if (selectedFolder) {
      const folder = folders.find((f) => f.id === selectedFolder)
      if (folder) {
        filtered = filtered.filter((password) => password.path === folder.path || password.folder === folder.path)
      }
    }

    // Filter by type
    if (typeFilter !== "all") {
      if (typeFilter === "password") {
        filtered = filtered.filter((password) => !password.isFolder)
      } else if (typeFilter === "folder") {
        filtered = filtered.filter((password) => password.isFolder)
      }
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((password) => password.category === categoryFilter)
    }

    // Filter by time
    if (timeFilter !== "all") {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      if (timeFilter === "last30days") {
        filtered = filtered.filter((password) => {
          const updatedAt = new Date(password.updatedAt)
          return updatedAt >= thirtyDaysAgo
        })
      }
    }

    // Filter by favorites
    if (favoriteFilter) {
      filtered = filtered.filter((password) => password.is_favorite)
    }

    // Filter by archived
    if (archivedFilter) {
      filtered = filtered.filter((password) => password.is_archived)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (password) =>
          password.username?.toLowerCase().includes(query) ||
          password.website?.toLowerCase().includes(query) ||
          password.category?.toLowerCase().includes(query) ||
          password.notes?.toLowerCase().includes(query),
      )
      console.log("Search applied")
    }

    return filtered
  }

  // Render password card
  const renderPasswordCard = (password: any) => {
    return (
      <div
        key={password.id}
        className="glass-panel rounded-xl p-4 hover:bg-white/5 transition-all group"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">
            {password.website ? (
              <a
                href={password.website.startsWith("http") ? password.website : `https://${password.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 hover:underline flex items-center"
              >
                {password.website}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            ) : (
              "Unnamed"
            )}
          </h3>
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-20`}>Username:</span>
            <span className="flex-1 truncate">{password.username}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-20`}>Password:</span>
            <div className="flex items-center flex-1">
              <span className="truncate">{visiblePasswords[password.id] ? password.password : "••••••••••"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePasswordVisibility(password.id)
                }}
                className="ml-2 text-gray-400 hover:text-white"
              >
                {visiblePasswords[password.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-20`}>Category:</span>
            <span className="flex-1 truncate">{password.category || "General"}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-20`}>Folder:</span>
            <span className="flex-1 truncate">{password.path || password.folder || "None"}</span>
          </div>
        </div>
        <div
          className={`flex justify-end mt-2 pt-2 border-t ${theme === "light" ? "border-gray-200" : "border-gray-600"}`}
        >
          <div className="flex items-center space-x-2">
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedRecord(password)
                setAutoFillModalOpen(true)
              }}
              title="Auto Fill"
            >
              <Copy className="h-4 w-4" />
            </button>
            {password.picture && (
              <button
                className="text-blue-400 hover:text-blue-300"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewPicture(password)
                }}
                title="View Picture"
              >
                <Image className="h-4 w-4" />
              </button>
            )}
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={(e) => {
                e.stopPropagation()
                handleEditPassword(password.id)
              }}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedRecord(password)
                setMoveToFolderModalOpen(true)
              }}
              title="Move to Folder"
            >
              <Folder className="h-4 w-4" />
            </button>
            <button
              className={`${password.is_favorite ? "text-yellow-300" : "text-yellow-400 hover:text-yellow-300"}`}
              onClick={(e) => {
                e.stopPropagation()
                handleToggleFavorite(password.id)
              }}
            >
              <Star className="h-4 w-4" fill={password.is_favorite ? "currentColor" : "none"} />
            </button>
            <button
              className="text-red-500 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedRecord(password)
                setDeleteConfirmModalOpen(true)
              }}
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render folder structure recursively
  const renderFolderStructure = (structure: any[], level = 0) => {
    return structure.map((folder) => {
      const isExpanded = expandedFolders[folder.id]
      const isSelected = selectedFolder === folder.id
      const subfolders = getSubfolders(folder.path)
      const directPasswords = getDirectPasswordsInFolder(folder.path)

      return (
        <div key={folder.id} className={`ml-${level > 0 ? "4" : "0"}`}>
          <div
            className={`flex items-center py-2 cursor-pointer ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} rounded px-2 ${isSelected ? "bg-blue-600 text-white" : ""
              }`}
            onClick={() => {
              toggleFolder(folder.id)
              setSelectedFolder(folder.id)
            }}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            <Folder className="h-5 w-5 mr-2 text-yellow-400" />
            <span>
              {folder.name} (
              {directPasswords.length +
                subfolders.reduce((acc, sf) => {
                  const sfPasswords = passwords.filter((p) => p.path === sf.path || p.folder === sf.path)
                  return acc + sfPasswords.length
                }, 0)}
              )
            </span>
          </div>

          {isExpanded && (
            <div className="ml-4 space-y-3 mt-2">
              {/* Display direct passwords in this folder */}
              {directPasswords.length > 0 && (
                <div className="mb-3">
                  <div className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"} mb-2`}>
                    Direct passwords in {folder.name}:
                  </div>
                  <div className="space-y-3">{directPasswords.map((password) => renderPasswordCard(password))}</div>
                </div>
              )}

              {/* Display subfolders */}
              {subfolders.length > 0 && (
                <div>
                  {subfolders.map((subfolder) => {
                    const isSubfolderExpanded = expandedFolders[subfolder.id]
                    const isSubfolderSelected = selectedFolder === subfolder.id
                    const subfolderPasswords = passwords.filter(
                      (p) => p.path === subfolder.path || p.folder === subfolder.path,
                    )

                    return (
                      <div key={subfolder.id} className="mt-2">
                        <div
                          className={`flex items-center py-2 cursor-pointer ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} rounded px-2 ${isSubfolderSelected ? "bg-blue-600 text-white" : ""
                            }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFolder(subfolder.id)
                            setSelectedFolder(subfolder.id)
                          }}
                        >
                          {isSubfolderExpanded ? (
                            <ChevronDown className="h-4 w-4 mr-2" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2" />
                          )}
                          <Folder className="h-5 w-5 mr-2 text-yellow-400" />
                          <span>
                            {subfolder.name} ({subfolderPasswords.length})
                          </span>
                        </div>

                        {isSubfolderExpanded && (
                          <div className="ml-4 space-y-3 mt-2">
                            {subfolderPasswords.map((password) => renderPasswordCard(password))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )
    })
  }

  // Render table rows for passwords
  const renderPasswordRows = () => {
    const filteredPasswords = getFilteredPasswords()

    if (filteredPasswords.length === 0) {
      return (
        <tr>
          <td colSpan={6} className={`py-4 text-center ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
            No passwords found. Try changing your filters or adding a new password.
          </td>
        </tr>
      )
    }

    return filteredPasswords.map((password) => (
      <tr key={password.id} className={`border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
        <td className="py-3 px-4">
          {password.website ? (
            <a
              href={password.website.startsWith("http") ? password.website : `https://${password.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline flex items-center"
            >
              {password.website}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          ) : (
            "No website"
          )}
        </td>
        <td className="py-3 px-4">{password.username}</td>
        <td className="py-3 px-4">
          <div className="flex items-center">
            <span>{visiblePasswords[password.id] ? password.password : "••••••••••"}</span>
            <button
              onClick={() => togglePasswordVisibility(password.id)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              {visiblePasswords[password.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </td>
        <td className="py-3 px-4">{password.category || "General"}</td>
        <td className="py-3 px-4">{new Date(password.updatedAt).toLocaleDateString()}</td>
        <td className="py-3 px-4">
          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={() => {
                setSelectedRecord(password)
                setAutoFillModalOpen(true)
              }}
              title="Auto Fill"
            >
              <Copy className="h-4 w-4" />
            </button>
            {password.picture && (
              <button
                className="text-blue-400 hover:text-blue-300"
                onClick={() => handleViewPicture(password)}
                title="View Picture"
              >
                <Image className="h-4 w-4" />
              </button>
            )}
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={() => {
                console.log("Action clicked:", "Edit")
                handleEditPassword(password.id)
              }}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              className={`${password.is_favorite ? "text-yellow-300" : "text-yellow-400 hover:text-yellow-300"}`}
              onClick={() => handleToggleFavorite(password.id)}
            >
              <Star className="h-4 w-4" fill={password.is_favorite ? "currentColor" : "none"} />
            </button>
            <button
              className={`${password.is_archived ? "text-green-400" : "text-gray-400 hover:text-gray-300"}`}
              onClick={() => handleToggleArchive(password.id)}
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={() => {
                console.log("Action clicked:", "Move to Folder")
                setSelectedRecord(password)
                setMoveToFolderModalOpen(true)
              }}
            >
              <Folder className="h-4 w-4" />
            </button>
            <button
              className="text-red-500 hover:text-red-400"
              onClick={() => {
                console.log("Action clicked:", "Delete")
                setSelectedRecord(password)
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

  // Render grid items for passwords
  const renderPasswordGrid = () => {
    const filteredPasswords = getFilteredPasswords()

    if (filteredPasswords.length === 0) {
      return (
        <div className={`col-span-full py-8 text-center ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
          No passwords found. Try changing your filters or adding a new password.
        </div>
      )
    }

    return filteredPasswords.map((password) => (
      <div
        key={password.id}
        className="glass-panel rounded-xl p-4 hover:bg-white/5 transition-all flex flex-col group relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold">
            {password.website ? (
              <a
                href={password.website.startsWith("http") ? password.website : `https://${password.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 hover:underline flex items-center"
              >
                {password.website}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            ) : (
              "Unnamed"
            )}
          </h3>
          <div className="relative">
            <button
              className={`${theme === "light" ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveMenu(activeMenu === password.id ? null : password.id)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {activeMenu === password.id && (
              <div
                ref={menuRef}
                className={`absolute right-0 mt-2 w-48 ${theme === "light" ? "bg-white" : "bg-[#333]"} rounded-md shadow-lg py-1 z-10`}
              >
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={() => {
                    setSelectedRecord(password)
                    setAutoFillModalOpen(true)
                    setActiveMenu(null)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Auto Fill
                </button>
                {password.picture && (
                  <button
                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                    onClick={() => {
                      handleViewPicture(password)
                      setActiveMenu(null)
                    }}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    View Picture
                  </button>
                )}
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={() => {
                    handleEditPassword(password.id)
                    setActiveMenu(null)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={() => {
                    togglePasswordVisibility(password.id)
                    setActiveMenu(null)
                  }}
                >
                  {visiblePasswords[password.id] ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Password
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Password
                    </>
                  )}
                </button>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={() => {
                    handleToggleFavorite(password.id)
                    setActiveMenu(null)
                  }}
                >
                  <Star className="h-4 w-4 mr-2" fill={password.isFavorite ? "currentColor" : "none"} />
                  {password.isFavorite ? "Remove Favorite" : "Add Favorite"}
                </button>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={() => {
                    setSelectedRecord(password)
                    setMoveToFolderModalOpen(true)
                    setActiveMenu(null)
                  }}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Move to Folder
                </button>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left text-red-500 ${theme === "light" ? "hover:bg-red-50" : "hover:bg-red-900 hover:bg-opacity-50"}`}
                  onClick={() => {
                    setSelectedRecord(password)
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
            <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Username:</span>
            <span className="flex-1 truncate">{password.username}</span>
          </div>

          <div className="flex items-center">
            <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Password:</span>
            <div className="flex items-center flex-1">
              <span className="truncate">{visiblePasswords[password.id] ? password.password : "••••••••••"}</span>
              <button
                onClick={() => togglePasswordVisibility(password.id)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                {visiblePasswords[password.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Category:</span>
            <span className="flex-1 truncate">{password.category || "General"}</span>
          </div>

          <div className="flex items-center">
            <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Folder:</span>
            <span className="flex-1 truncate">{password.path || password.folder || "None"}</span>
          </div>
        </div>

        <div
          className={`flex justify-between items-center mt-4 pt-3 border-t ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}
        >
          <span className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
            {new Date(password.updatedAt).toLocaleDateString()}
          </span>

          <div className="flex items-center space-x-2">
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={() => {
                setSelectedRecord(password)
                setAutoFillModalOpen(true)
              }}
              title="Auto Fill"
            >
              <Copy className="h-4 w-4" />
            </button>
            {password.picture && (
              <button
                className="text-blue-400 hover:text-blue-300"
                onClick={() => handleViewPicture(password)}
                title="View Picture"
              >
                <Image className="h-4 w-4" />
              </button>
            )}
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={() => {
                console.log("Action clicked:", "Edit")
                handleEditPassword(password.id)
              }}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              className="text-blue-400 hover:text-blue-300"
              onClick={() => {
                setSelectedRecord(password)
                setMoveToFolderModalOpen(true)
              }}
              title="Move to Folder"
            >
              <Folder className="h-4 w-4" />
            </button>
            <button
              className={`${password.isFavorite ? "text-yellow-300" : "text-yellow-400 hover:text-yellow-300"}`}
              onClick={() => handleToggleFavorite(password.id)}
            >
              <Star className="h-4 w-4" fill={password.isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              className="text-red-500 hover:text-red-400"
              onClick={() => {
                console.log("Action clicked:", "Delete")
                setSelectedRecord(password)
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

  // Render folder view for passwords
  const renderFolderView = () => {
    return (
      <div className="space-y-4">
        {renderFolderStructure(topLevelFolders)}

        {/* Show passwords without folders */}
        {passwords.filter((p) => !p.path && !p.folder).length > 0 && (
          <div className={`${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-lg p-4`}>
            <div className="flex items-center mb-3">
              <Folder className="h-5 w-5 mr-2 text-blue-400" />
              <h3 className="font-semibold">No Folder</h3>
              <span className={`ml-2 text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                ({passwords.filter((p) => !p.path && !p.folder).length})
              </span>
            </div>

            <div className="pl-7 space-y-3 mt-2">
              {passwords.filter((p) => !p.path && !p.folder).map((password) => renderPasswordCard(password))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Passwords</h1>
          <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>Manage your saved passwords</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAddPasswordModalOpen(true)}
            className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Password
          </button>

          <button
            onClick={() => setAddFolderModalOpen(true)}
            className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <Folder className="h-5 w-5 mr-2" />
            Add New Folder
          </button>



          <div className={`flex items-center ${theme === "light" ? "bg-gray-200" : "bg-[#333]"} rounded-md`}>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "text-[#007bff]" : theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-white"}`}
              aria-label="List view"
            >
              <ListIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "text-[#007bff]" : theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-white"}`}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("folder")}
              className={`p-2 ${viewMode === "folder" ? "text-[#007bff]" : theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-white"}`}
              aria-label="Folder view"
            >
              <FolderTree className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => {
              setShowFilters(!showFilters)
              console.log("Filters toggled on Passwords page:", !showFilters)
            }}
            className={`flex items-center ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-[#333] hover:bg-gray-600"} ${theme === "light" ? "text-gray-800" : "text-white"} p-2 rounded-md transition duration-200`}
            aria-label="Toggle filters"
          >
            <Filter
              className={`h-5 w-5 ${showFilters ? "text-[#007bff]" : theme === "light" ? "text-gray-600" : "text-gray-400"}`}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {viewMode !== "folder" && (
          <div className="w-full md:w-64 glass-panel rounded-xl p-4 h-fit sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Folders</h2>
            <div className="space-y-1">
              <div
                className={`flex items-center py-2 cursor-pointer ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} rounded px-2 ${selectedFolder === "" ? "bg-blue-600 text-white" : ""
                  }`}
                onClick={() => setSelectedFolder("")}
              >
                <Folder className="h-5 w-5 mr-2 text-blue-400" />
                <span>All Items</span>
              </div>
              {renderFolderStructure(topLevelFolders)}
            </div>
          </div>
        )}

        <div className="flex-1">
          {showFilters && (
            <div className={`${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-lg p-4 mb-4`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}
                  />
                  <input
                    type="text"
                    placeholder="Search passwords..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      console.log("Search applied")
                    }}
                    className={`w-full pl-10 pr-4 py-2 ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-[#333] border-gray-500"} border rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]`}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <button
                      className={`flex items-center justify-between ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} px-4 py-2 rounded-md transition duration-200 min-w-32`}
                      onClick={() => {
                        setShowFilterMenu(!showFilterMenu)
                        setShowCategoryFilterMenu(false)
                        setShowTimeFilterMenu(false)
                        setShowStatusFilterMenu(false)
                      }}
                    >
                      <span>
                        {typeFilter === "all"
                          ? "All"
                          : typeFilter === "password"
                            ? "Password"
                            : typeFilter === "folder"
                              ? "Folder"
                              : "All"}
                      </span>
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
                            console.log("Filter applied")
                          }}
                        >
                          All
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${typeFilter === "password" ? "bg-blue-600 text-white" : ""}`}
                          onClick={() => {
                            setTypeFilter("password")
                            setShowFilterMenu(false)
                            console.log("Filter applied")
                          }}
                        >
                          Password
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${typeFilter === "folder" ? "bg-blue-600 text-white" : ""}`}
                          onClick={() => {
                            setTypeFilter("folder")
                            setShowFilterMenu(false)
                            console.log("Filter applied")
                          }}
                        >
                          Folder
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      className={`flex items-center justify-between ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} px-4 py-2 rounded-md transition duration-200 min-w-32`}
                      onClick={() => {
                        setShowCategoryFilterMenu(!showCategoryFilterMenu)
                        setShowFilterMenu(false)
                        setShowTimeFilterMenu(false)
                        setShowStatusFilterMenu(false)
                      }}
                    >
                      <span>{categoryFilter === "all" ? "All Categories" : categoryFilter}</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>

                    {showCategoryFilterMenu && (
                      <div
                        className={`absolute z-10 mt-1 w-full ${theme === "light" ? "bg-white" : "bg-[#333]"} rounded-md shadow-lg py-1 max-h-60 overflow-y-auto`}
                      >
                        <button
                          className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${categoryFilter === "all" ? "bg-blue-600 text-white" : ""}`}
                          onClick={() => {
                            setCategoryFilter("all")
                            setShowCategoryFilterMenu(false)
                            console.log("Filter applied")
                          }}
                        >
                          All Categories
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category}
                            className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${categoryFilter === category ? "bg-blue-600 text-white" : ""}`}
                            onClick={() => {
                              setCategoryFilter(category)
                              setShowCategoryFilterMenu(false)
                              console.log("Filter applied")
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      className={`flex items-center justify-between ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} px-4 py-2 rounded-md transition duration-200 min-w-32`}
                      onClick={() => {
                        setShowTimeFilterMenu(!showTimeFilterMenu)
                        setShowFilterMenu(false)
                        setShowCategoryFilterMenu(false)
                        setShowStatusFilterMenu(false)
                      }}
                    >
                      <span>
                        {timeFilter === "all" ? "All Time" : timeFilter === "last30days" ? "Last 30 Days" : "All Time"}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>

                    {showTimeFilterMenu && (
                      <div
                        className={`absolute z-10 mt-1 w-full ${theme === "light" ? "bg-white" : "bg-[#333]"} rounded-md shadow-lg py-1`}
                      >
                        <button
                          className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${timeFilter === "all" ? "bg-blue-600 text-white" : ""}`}
                          onClick={() => {
                            setTimeFilter("all")
                            setShowTimeFilterMenu(false)
                            console.log("Filter applied")
                          }}
                        >
                          All Time
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${timeFilter === "last30days" ? "bg-blue-600 text-white" : ""}`}
                          onClick={() => {
                            setTimeFilter("last30days")
                            setShowTimeFilterMenu(false)
                            console.log("Filter applied")
                          }}
                        >
                          Last 30 Days
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      className={`flex items-center justify-between ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} px-4 py-2 rounded-md transition duration-200 min-w-32`}
                      onClick={() => {
                        setShowStatusFilterMenu(!showStatusFilterMenu)
                        setShowFilterMenu(false)
                        setShowCategoryFilterMenu(false)
                        setShowTimeFilterMenu(false)
                      }}
                    >
                      <span>
                        {favoriteFilter ? "Favorites" : archivedFilter ? "Archived" : "All Statuses"}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>

                    {showStatusFilterMenu && (
                      <div
                        className={`absolute z-10 mt-1 w-full ${theme === "light" ? "bg-white" : "bg-[#333]"} rounded-md shadow-lg py-1`}
                      >
                        <button
                          className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${!favoriteFilter && !archivedFilter ? "bg-blue-600 text-white" : ""}`}
                          onClick={() => {
                            setFavoriteFilter(false)
                            setArchivedFilter(false)
                            setShowStatusFilterMenu(false)
                            console.log("Filter applied: All Statuses")
                          }}
                        >
                          All Statuses
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${favoriteFilter ? "bg-blue-600 text-white" : ""}`}
                          onClick={() => {
                            setFavoriteFilter(true)
                            setArchivedFilter(false)
                            setShowStatusFilterMenu(false)
                            console.log("Filter applied: Favorites")
                          }}
                        >
                          Favorites
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${archivedFilter ? "bg-blue-600 text-white" : ""}`}
                          onClick={() => {
                            setFavoriteFilter(false)
                            setArchivedFilter(true)
                            setShowStatusFilterMenu(false)
                            console.log("Filter applied: Archived")
                          }}
                        >
                          Archived
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    className={`flex items-center ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} px-4 py-2 rounded-md transition duration-200`}
                    onClick={() => {
                      setTypeFilter("all")
                      setCategoryFilter("all")
                      setTimeFilter("all")
                      setFavoriteFilter(false)
                      setArchivedFilter(false)
                      setSearchQuery("")
                      console.log("Filters reset")
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewMode === "list" ? (
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${theme === "light" ? "bg-gray-100" : "bg-[#333]"} text-left`}>
                      <th className="py-3 px-4 font-semibold">Website</th>
                      <th className="py-3 px-4 font-semibold">Username</th>
                      <th className="py-3 px-4 font-semibold">Password</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Last Updated</th>
                      <th className="py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>{renderPasswordRows()}</tbody>
                </table>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">{renderPasswordGrid()}</div>
          ) : (
            <div>{renderFolderView()}</div>
          )}
        </div>
      </div>

      {/* Modals */}
      {addPasswordModalOpen && (
        <AddPasswordModal
          onClose={() => setAddPasswordModalOpen(false)}
          onAdd={handleAddPassword}
          folders={folders}
          theme={theme}
        />
      )}

      {addFolderModalOpen && (
        <AddFolderModal
          onClose={() => setAddFolderModalOpen(false)}
          onAdd={handleAddFolder}
          folders={folders}
          theme={theme}
        />
      )}

      {moveToFolderModalOpen && (
        <MoveToFolderModal
          onClose={() => setMoveToFolderModalOpen(false)}
          onMove={handleMoveToFolder}
          folders={folders}
          record={selectedRecord}
          theme={theme}
        />
      )}

      {/* Edit Password Modal */}
      {editPasswordModalOpen && (
        <EditPasswordModal
          onClose={() => setEditPasswordModalOpen(false)}
          onSave={handleSaveEditedPassword}
          passwordData={selectedRecord}
          folders={folders}
          theme={theme}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModalOpen && (
        <DeleteConfirmationModal
          onClose={() => setDeleteConfirmModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={selectedRecord?.website || selectedRecord?.username || "this password"}
          theme={theme}
        />
      )}

      {/* Auto Fill Modal */}
      {autoFillModalOpen && selectedRecord && (
        <AutoFill passwordData={selectedRecord} onClose={() => setAutoFillModalOpen(false)} theme={theme} />
      )}

      {/* View Picture Modal */}
      {viewPictureModalOpen && selectedRecord && selectedRecord.picture && (
        <ViewPictureModal
          onClose={() => setViewPictureModalOpen(false)}
          picture={selectedRecord.picture}
          passwordName={selectedRecord.website || selectedRecord.username}
          theme={theme}
        />
      )}
    </div>
  )
}

