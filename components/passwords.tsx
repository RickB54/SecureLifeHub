"use client"

import { useState, useRef, useEffect } from "react"
import {
  Plus,
  Lock,
  Folder,
  X,
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
  ChevronsUp,
  ChevronsDown,
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
  addFolder: (name: string, parent?: string) => Promise<any>
  updateItem: (id: string, item: any) => Promise<any>
  updateFolder: (id: string, updates: any) => Promise<any>
  deleteItem: (id: string, type?: string) => Promise<any>
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
  updateFolder,
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
  const [initialFolderPath, setInitialFolderPath] = useState("") // State for pre-selecting folder
  const [initialParentFolderId, setInitialParentFolderId] = useState<string | undefined>(undefined)
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
  }, [])

  // State for active password popup
  const [activePasswordPopup, setActivePasswordPopup] = useState<string | null>(null)

  // Close password popup when clicking outside
  useEffect(() => {
    const handlePopupClickOutside = (event: MouseEvent) => {
      // If we clicked outside any popup-trigger (which we handle with stopPropagation usually), close it.
      // Actually simple: click anywhere on document closes it, UNLESS it was the trigger or popup itself.
      // We put stopPropagation on trigger and popup, so document listener is enough.
      setActivePasswordPopup(null)
    }
    document.addEventListener("click", handlePopupClickOutside)
    return () => document.removeEventListener("click", handlePopupClickOutside)
  }, [])

  // Scroll to letter function
  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-group-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


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
        const newFolder = await addFolder(folderName)
        if (newFolder) {
          folderId = newFolder.id
        }
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

    if (selectedRecord.type === 'folder') {
      // Moving a folder
      await updateFolder(selectedRecord.id, {
        parent_id: targetFolder?.id || null
      })
    } else {
      // Moving an item
      // @ts-ignore
      await updateItem(selectedRecord.id, {
        path: targetPath,
        folder_id: targetFolder?.id || null, // Ensure we clear the folder ID if moving to root
        folder: targetPath // Update legacy folder field if it exists
      })
    }

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
    if (!selectedRecord) {
      console.error("No record selected for update")
      return
    }

    try {
      // @ts-ignore
      await updateItem(selectedRecord.id, updatedData)
      setEditPasswordModalOpen(false)
      setSelectedRecord(null)
    } catch (error) {
      console.error("Failed to update password:", error)
      alert("Failed to save changes. Please try again.")
    }
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

  // Function to get direct passwords in a folder (not in subfolders) from a specific set of items
  const getDirectPasswordsInFolder = (folderPath: string, items: any[] = passwords) => {
    // Find the folder object that matches this path to get its ID
    const folderObj = folders.find(f => f.path === folderPath)

    return items.filter((password) => {
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
  const getFilteredPasswords = (ignoreFolder = false) => {
    let filtered = passwords

    // Filter by folder - ONLY if not ignored
    if (!ignoreFolder && selectedFolder) {
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
          password.title?.toLowerCase().includes(query) ||
          password.username?.toLowerCase().includes(query) ||
          password.website?.toLowerCase().includes(query) ||
          password.category?.toLowerCase().includes(query) ||
          password.notes?.toLowerCase().includes(query),
      )
    }

    // Sort by title
    filtered.sort((a, b) => {
      const titleA = a.title || a.website || "Untitled";
      const titleB = b.title || b.website || "Untitled";
      return titleA.localeCompare(titleB);
    });

    return filtered
  }

  const renderPasswordCard = (password: any) => {
    return (
      <div
        key={password.id}
        className="glass-panel rounded-xl p-3 hover:bg-white/5 transition-all group relative overflow-visible"
      >
        <div className="flex justify-between items-start gap-3">
          {/* Left Side: Info */}
          <div className="flex-1 min-w-0">
            {/* Top Line: Website/Title */}
            <h3 className="font-medium truncate items-center flex">

              <div className="flex flex-col">
                {password.website ? (
                  <a
                    href={password.website.startsWith("http") ? password.website : `https://${password.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-blue-400 transition-colors truncate flex items-center gap-1"
                    title={password.title}
                  >
                    {password.title || "Untitled"}
                    <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
                  </a>
                ) : (
                  <span className="font-medium truncate" title={password.title}>{password.title || "Untitled"}</span>
                )}
                {password.website && (
                  <span className="text-xs text-blue-400 truncate opacity-80">{password.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}</span>
                )}
              </div>
            </h3>

            {/* Bottom Line: Username • Password */}
            <div className="flex items-center text-sm mt-1 gap-2 text-gray-500 dark:text-gray-400">
              <span
                className="truncate max-w-[120px] cursor-pointer hover:text-white transition-colors p-0.5 -m-0.5 rounded hover:bg-white/5"
                title="Click to Edit Username"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditPassword(password.id);
                }}
              >
                {password.username}
              </span>
              <span className="text-xs opacity-50">•</span>

              {/* Eye Icon / Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Toggle logic
                  setActivePasswordPopup(activePasswordPopup === password.id ? null : password.id)
                }}
                className="text-gray-400 hover:text-white"
              >
                {activePasswordPopup === password.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>

              {activePasswordPopup === password.id && (
                <div
                  className="absolute left-0 bottom-full mb-1 z-[9999] bg-black text-white px-3 py-2 rounded shadow-lg text-sm font-mono cursor-pointer border border-gray-700 animate-in fade-in zoom-in-95"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log("Popup clicked - copying text")
                    navigator.clipboard.writeText(password.password)
                    setActivePasswordPopup(null)
                  }}
                  style={{ minWidth: "max-content" }}
                >
                  {password.password}
                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-black border-r border-b border-gray-700 transform rotate-45"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Actions (Wrap if needed, but flex-nowrap prevents it) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-md transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedRecord(password)
              setAutoFillModalOpen(true)
            }}
            title="Auto Fill"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            className={`p-1.5 ${password.is_favorite ? "text-yellow-300" : "text-gray-400 hover:text-yellow-300"} hover:bg-yellow-500/10 rounded-md transition-colors`}
            onClick={(e) => {
              e.stopPropagation()
              handleToggleFavorite(password.id)
            }}
          >
            <Star className="h-4 w-4" fill={password.is_favorite ? "currentColor" : "none"} />
          </button>

          {/* More Menu for compact layout actions */}
          <div className="relative">
            <button
              className={`p-1.5 ${theme === "light" ? "text-gray-500" : "text-gray-400"} hover:bg-gray-500/10 rounded-md transition-colors`}
              onClick={(e) => {
                e.stopPropagation()
                setActiveMenu(activeMenu === password.id ? null : password.id)
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {activeMenu === password.id && (
              <div
                ref={menuRef}
                className={`absolute right-0 mt-2 w-48 ${theme === "light" ? "bg-white" : "bg-[#333]"} rounded-md shadow-lg py-1 z-[9999] border ${theme === "light" ? "border-gray-200" : "border-gray-600"}`}
              >
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditPassword(password.id)
                    setActiveMenu(null)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRecord(password)
                    setMoveToFolderModalOpen(true)
                    setActiveMenu(null)
                  }}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Move to Folder
                </button>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleFavorite(password.id)
                    setActiveMenu(null)
                  }}
                >
                  <Star className="h-4 w-4 mr-2" fill={password.is_favorite ? "currentColor" : "none"} />
                  {password.is_favorite ? "Remove Favorite" : "Add Favorite"}
                </button>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleArchive(password.id)
                    setActiveMenu(null)
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {password.is_archived ? "Unarchive" : "Archive"}
                </button>
                {password.picture && (
                  <button
                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewPicture(password)
                      setActiveMenu(null)
                    }}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    View Picture
                  </button>
                )}
                <div className={`border-t my-1 ${theme === "light" ? "border-gray-200" : "border-gray-600"}`}></div>
                <button
                  className={`flex items-center w-full px-4 py-2 text-sm text-left text-red-500 ${theme === "light" ? "hover:bg-red-50" : "hover:bg-red-900/20"}`}
                  onClick={(e) => {
                    e.stopPropagation()
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
      </div>
    )
  }

  // Render folder item (password) in the tree
  const renderFolderListItem = (password: any) => {
    return (
      <div
        key={password.id}
        className={`flex items-center py-3 px-2 border-b ${theme === "light" ? "border-gray-100 hover:bg-gray-50" : "border-gray-800 hover:bg-white/5"} cursor-pointer transition-colors group`}
        onClick={() => handleEditPassword(password.id)}
      >
        <div className="mr-3 text-gray-400 group-hover:text-blue-500">
          <Lock className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{password.title || password.website || "Untitled"}</div>
          <div className={`text-xs truncate ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
            {password.username || password.email || "No username"}
          </div>
        </div>

        {/* Quick Actions on Hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedRecord(password)
              setAutoFillModalOpen(true)
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-blue-500"
            title="Auto Fill"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // Render folder structure recursively
  const renderFolderStructure = (structure: any[], items: any[] = passwords, level = 0) => {
    const shouldShowFolder = (folder: any): boolean => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      const nameMatch = folder.name.toLowerCase().includes(query)
      const hasDirectMatch = getDirectPasswordsInFolder(folder.path, items).length > 0
      const subfolders = getSubfolders(folder.path)
      const hasSubfolderMatch = subfolders.some(sub => shouldShowFolder(sub))
      return nameMatch || hasDirectMatch || hasSubfolderMatch
    }

    const visibleFolders = structure.filter(shouldShowFolder)

    return visibleFolders.map((folder) => {
      const isExpanded = expandedFolders[folder.id]
      const isSelected = selectedFolder === folder.id
      const subfolders = getSubfolders(folder.path)
      const directPasswords = getDirectPasswordsInFolder(folder.path, items)

      // Calculate count recursively based on provided items
      const getFolderCount = (fPath: string): number => {
        const direct = getDirectPasswordsInFolder(fPath, items).length
        const subs = getSubfolders(fPath)
        const subCounts = subs.reduce((acc, sub) => acc + getFolderCount(sub.path), 0)
        return direct + subCounts
      }

      // Total count for this folder (direct + recursive subfolders)
      const totalCount = getFolderCount(folder.path)
      const countLabel = totalCount === 1 ? "1 Record" : `${totalCount} Records`
      const effectivelyExpanded = isExpanded || !!searchQuery

      return (
        <div key={folder.id} className={`${level > 0 ? "ml-8" : ""} border-b ${theme === "light" ? "border-gray-100" : "border-gray-800"}`}>
          <div className="flex items-center flex-1 min-w-0 py-2">
            <div
              className={`flex items-center flex-1 cursor-pointer py-2 px-2 rounded-lg transition-colors ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : theme === "light" ? "hover:bg-gray-50" : "hover:bg-white/5"}`}
              onClick={() => {
                toggleFolder(folder.id)
                setSelectedFolder(folder.id)
              }}
            >
              <div className={`mr-3 ${theme === "light" ? "text-gray-400" : "text-gray-500"}`}>
                {effectivelyExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>

              <div className="mr-3">
                <Folder className={`h-8 w-8 ${theme === "light" ? "text-gray-700" : "text-gray-400"}`} />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className={`font-semibold text-sm ${theme === "light" ? "text-gray-900" : "text-gray-100"}`}>
                  {folder.name}
                </span>
                <span className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  {countLabel}
                </span>
              </div>
            </div>

            <div className="relative mr-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (activeMenu === `folder-${folder.id}`) {
                    setActiveMenu(null)
                  } else {
                    setActiveMenu(`folder-${folder.id}`)
                  }
                }}
                className={`p-2 rounded-full ${activeMenu === `folder-${folder.id}` ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {activeMenu === `folder-${folder.id}` && (
                <div
                  className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-xl border overflow-hidden z-[100] ${theme === "light" ? "bg-white border-gray-200" : "bg-[#2a2a2a] border-gray-700"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={`flex items-center w-full px-4 py-3 text-sm text-left ${theme === "light" ? "hover:bg-gray-50 text-gray-700" : "hover:bg-white/5 text-gray-200"}`}
                    onClick={() => {
                      setInitialFolderPath(folder.path)
                      setAddPasswordModalOpen(true)
                      setActiveMenu(null)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-3" />
                    New Record
                  </button>
                  <button
                    className={`flex items-center w-full px-4 py-3 text-sm text-left ${theme === "light" ? "hover:bg-gray-50 text-gray-700" : "hover:bg-white/5 text-gray-200"}`}
                    onClick={() => {
                      setInitialParentFolderId(folder.id)
                      setAddFolderModalOpen(true)
                      setActiveMenu(null)
                    }}
                  >
                    <Folder className="h-4 w-4 mr-3" />
                    New Folder
                  </button>
                  <button
                    className={`flex items-center w-full px-4 py-3 text-sm text-left ${theme === "light" ? "hover:bg-gray-50 text-gray-700" : "hover:bg-white/5 text-gray-200"}`}
                    onClick={() => {
                      setSelectedRecord(folder)
                      setMoveToFolderModalOpen(true)
                      setActiveMenu(null)
                    }}
                  >
                    <FolderTree className="h-4 w-4 mr-3" />
                    Move To
                  </button>
                  <div className={`h-px w-full ${theme === "light" ? "bg-gray-100" : "bg-gray-700"} my-1`} />
                  <button
                    className={`flex items-center w-full px-4 py-3 text-sm text-left text-red-500 ${theme === "light" ? "hover:bg-red-50" : "hover:bg-red-900/30"}`}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete folder "${folder.name}"? Items inside will be moved to the main list.`)) {
                        deleteItem(folder.id, 'folder')
                          .then(() => setSelectedFolder(""))
                          .catch(err => console.error("Failed to delete folder", err))
                      }
                      setActiveMenu(null)
                    }}
                  >
                    <Trash className="h-4 w-4 mr-3" />
                    Delete Folder
                  </button>
                </div>
              )}
            </div>
          </div>

          {effectivelyExpanded && (
            <div>
              {/* Display direct passwords in this folder */}
              {directPasswords.length > 0 && (
                <div className="ml-8 border-l border-gray-100 dark:border-gray-800">
                  {directPasswords.map((password) => renderFolderListItem(password))}
                </div>
              )}

              {/* Display subfolders */}
              {subfolders.length > 0 && (
                <div>
                  {renderFolderStructure(subfolders, items, level + 1)}
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

    return filteredPasswords.map((password, index) => {
      const title = password.title || password.website || "Untitled";
      const firstLetter = title.charAt(0).toUpperCase();
      const prevTitle = index > 0 ? (filteredPasswords[index - 1].title || filteredPasswords[index - 1].website || "Untitled") : "";
      const prevLetter = index > 0 ? prevTitle.charAt(0).toUpperCase() : null;

      const isFirstOfLetter = firstLetter !== prevLetter;
      const anchorId = isFirstOfLetter ? `letter-group-${firstLetter}` : undefined;

      return (
        <tr
          key={password.id}
          id={anchorId}
          className={`border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"} hover:bg-white/5 transition-colors cursor-pointer`}
        >
          <td className="py-3 px-4">
            {password.website ? (
              <div>
                <div className="font-medium">{password.title || "Untitled"}</div>
                <a
                  href={password.website.startsWith("http") ? password.website : `https://${password.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center mt-0.5"
                >
                  {password.website.replace(/^https?:\/\//, '').replace(/^www\./, '').substring(0, 30)}{password.website.length > 30 ? '...' : ''}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            ) : (
              <span className="font-medium">{password.title || "Untitled"}</span>
            )}
          </td>
          <td
            className="py-3 px-4 cursor-pointer hover:text-blue-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleEditPassword(password.id)
            }}
            title="Click to Edit"
          >
            {password.username}
          </td>
          <td className="py-3 px-4 hidden md:table-cell relative min-w-[140px]">
            <div className="flex items-center justify-between group/pass">
              <span className={`truncate font-mono ${activePasswordPopup === password.id ? "text-white select-all" : "text-gray-500"}`}>
                {activePasswordPopup === password.id ? password.password : "••••••••••"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.nativeEvent.stopImmediatePropagation()
                  // Toggle visibility
                  if (activePasswordPopup === password.id) {
                    setActivePasswordPopup(null)
                  } else {
                    setActivePasswordPopup(password.id)
                  }
                }}
                className="ml-2 text-gray-400 hover:text-white focus:outline-none p-1 rounded hover:bg-white/10"
                title={activePasswordPopup === password.id ? "Hide Password" : "Show Password"}
              >
                {activePasswordPopup === password.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </td>
          <td className="py-3 px-4 hidden lg:table-cell">{password.category || "General"}</td>
          <td className="py-3 px-4 hidden xl:table-cell">{new Date(password.updatedAt).toLocaleDateString()}</td>
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
      )
    })
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

    return filteredPasswords.map((password, index) => {
      const firstLetter = (password.title || password.website || "Untitled").charAt(0).toUpperCase();
      const prevLetter = index > 0
        ? (filteredPasswords[index - 1].title || filteredPasswords[index - 1].website || "Untitled").charAt(0).toUpperCase()
        : null;

      const isFirstOfLetter = firstLetter !== prevLetter;
      const anchorId = isFirstOfLetter ? `letter-group-${firstLetter}` : "";

      return (
        <div
          key={password.id}
          id={anchorId}
          className="glass-panel rounded-xl p-4 hover:bg-white/5 transition-all flex flex-col group relative"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold">

              <div className="flex flex-col">
                {password.website ? (
                  <a
                    href={password.website.startsWith("http") ? password.website : `https://${password.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    {password.title || "Untitled"}
                    <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                  </a>
                ) : (
                  <span>{password.title || "Untitled"}</span>
                )}
                {password.website && (
                  <span className="text-xs text-blue-400 truncate opacity-80 font-normal mt-0.5">{password.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}</span>
                )}
              </div>
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
                  className={`absolute right-0 mt-2 w-48 ${theme === "light" ? "bg-white" : "bg-[#333]"} rounded-md shadow-lg py-1 z-[100]`}
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
                      // Toggle popup for grid view menu action
                      if (activePasswordPopup === password.id) {
                        setActivePasswordPopup(null)
                      } else {
                        setActivePasswordPopup(password.id)
                      }
                      setActiveMenu(null)
                    }}
                  >
                    {activePasswordPopup === password.id ? (
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

                  {/* Grid Item Password Popup - Rendered outside the button to avoid nesting issues, but positioned relative to card */}
                  {activePasswordPopup === password.id && (
                    <div
                      className="absolute bottom-16 right-4 z-50 bg-black text-white px-3 py-2 rounded shadow-lg text-sm font-mono cursor-pointer border border-gray-700 animate-in fade-in zoom-in-95"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(password.password)
                        setActivePasswordPopup(null)
                      }}
                    >
                      {password.password}
                    </div>
                  )}
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
              <span
                className="flex-1 truncate cursor-pointer hover:text-white transition-colors"
                onClick={() => handleEditPassword(password.id)}
                title="Click to edit username"
              >
                {password.username}
              </span>
            </div>

            <div className="flex items-center">
              <span className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} w-24`}>Password:</span>
              <div className="flex items-center flex-1 relative">
                <span className={`truncate font-mono ${activePasswordPopup === password.id ? "text-white select-all" : "text-gray-500"}`}>
                  {activePasswordPopup === password.id ? password.password : "••••••••••"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.nativeEvent.stopImmediatePropagation()
                    if (activePasswordPopup === password.id) {
                      setActivePasswordPopup(null)
                    } else {
                      setActivePasswordPopup(password.id)
                    }
                  }}
                  className="ml-2 text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
                >
                  {activePasswordPopup === password.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
      )
    })
  }

  // Render right-side details pane for selected record
  const renderRecordDetails = (record: any) => {
    if (!record) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
          <Folder className="h-16 w-16 mb-4" />
          <p>Select an item to view details</p>
        </div>
      )
    }

    return (
      <div className={`h-full flex flex-col ${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-xl shadow-lg border ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {record.website ? <ExternalLink className="h-8 w-8 text-blue-500" /> : <Lock className="h-8 w-8 text-gray-500" />}
            </div>
            <div>
              <h2 className="text-xl font-bold">{record.title || "Untitled"}</h2>
              <p className="text-sm text-gray-500">Record Info</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditPassword(record.id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Edit"
            >
              <Edit className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={() => setSelectedRecord(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section: General */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">General</h3>

            {/* Title Field */}
            <div className="group">
              <label className="text-xs text-gray-500 block mb-1">Title</label>
              <div className="text-sm font-medium p-2 -ml-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-text">
                {record.title || "Untitled"}
              </div>
            </div>

            {/* Login Field */}
            <div className="group relative">
              <label className="text-xs text-gray-500 block mb-1">Login</label>
              <div
                className="text-sm font-medium p-2 -ml-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer flex items-center justify-between"
                onClick={(e) => {
                  navigator.clipboard.writeText(record.username || "")
                  // Could add copied feedback here
                }}
                title="Click to Copy"
              >
                <span>{record.username || "—"}</span>
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
              </div>
            </div>

            {/* Password Field */}
            <div className="group relative">
              <label className="text-xs text-gray-500 block mb-1">Password</label>
              <div className="flex items-center gap-2 p-2 -ml-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div
                  className="flex-1 font-mono text-sm cursor-pointer hover:text-blue-500"
                  onClick={() => navigator.clipboard.writeText(record.password || "")}
                  title="Click to Copy"
                >
                  {activePasswordPopup === record.id ? record.password : "••••••••••"}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActivePasswordPopup(activePasswordPopup === record.id ? null : record.id)
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  {activePasswordPopup === record.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className={`h-1 w-full bg-gray-200 mt-2 rounded-full overflow-hidden ${record.password ? "opacity-100" : "opacity-0"}`}>
                <div className="h-full bg-orange-500 w-2/3"></div> {/* Mock strength meter */}
              </div>
              <p className="text-xs text-gray-400 mt-1">Fair</p>
            </div>

            {/* Website Field */}
            {record.website && (
              <div className="group">
                <label className="text-xs text-gray-500 block mb-1">Website Address</label>
                <a
                  href={record.website.startsWith("http") ? record.website : `https://${record.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline flex items-center gap-1 p-2 -ml-2"
                >
                  {record.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Mock "Custom Fields" or Notes can go here */}
          {record.notes && (
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="group">
                <label className="text-xs text-gray-500 block mb-1">Notes</label>
                <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {record.notes}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }


  // Render folder view for passwords (Split Layout)
  const renderFolderView = () => {
    // Get filtered items ignoring folder selection (so we can distribute them into structure)
    const itemsForStructure = getFilteredPasswords(true)

    return (
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-250px)]">
        {/* Left Side: Folder Tree (Scrollable) */}
        <div className={`flex-1 md:w-1/3 overflow-y-auto pr-2 custom-scrollbar ${selectedRecord ? 'hidden md:block' : 'block'}`}>
          <div className="space-y-2">
            {renderFolderStructure(topLevelFolders, itemsForStructure)}

            {/* Show passwords without folders */}
            {itemsForStructure.filter((p) => !p.path && !p.folder).length > 0 && (
              <div className={`${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-lg p-4 border-b ${theme === "light" ? "border-gray-100" : "border-gray-800"}`}>
                <div className="flex items-center mb-3">
                  <Folder className="h-5 w-5 mr-2 text-blue-400" />
                  <h3 className="font-semibold">No Folder</h3>
                  <span className={`ml-2 text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                    ({itemsForStructure.filter((p) => !p.path && !p.folder).length})
                  </span>
                </div>

                <div className="pl-7 space-y-0 text-sm"> {/* Compact list for root items */}
                  {itemsForStructure.filter((p) => !p.path && !p.folder).map((password) => renderFolderListItem(password))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Details Pane (Visible when record selected) */}
        <div className={`md:w-2/3 h-full pl-2 ${selectedRecord ? 'block' : 'hidden md:block'}`}>
          {renderRecordDetails(selectedRecord)}
        </div>
      </div>
    )
  }

  // Render A-Z Scrollbar Sidebar
  const renderAZSidebar = () => {
    if (viewMode === 'folder') return null;

    return (
      <div className={`fixed right-2 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-1 p-1 rounded-full ${theme === 'light' ? 'bg-gray-100/80' : 'bg-black/40'} backdrop-blur-sm shadow-sm max-h-[80vh] overflow-y-auto w-6 items-center`}>
        {alphabet.map(letter => (
          <button
            key={letter}
            onClick={() => scrollToLetter(letter)}
            className={`text-[10px] w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-500 hover:text-white transition-colors ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}
          >
            {letter}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 px-2 md:px-4 pb-10 relative">
      {renderAZSidebar()}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Passwords
            <span className={`text-lg font-normal ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
              <span className="mr-2">Passwords: {records.filter(r => r.type !== 'folder').length}</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="ml-2">Folders: {records.filter(r => r.type === 'folder').length}</span>
            </span>
          </h1>
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

          {viewMode === "folder" && (
            <div className={`flex items-center ${theme === "light" ? "bg-gray-200" : "bg-[#333]"} rounded-md ml-2`}>
              <button
                onClick={() => setExpandedFolders(Object.keys(folders).reduce((acc, key) => ({ ...acc, [key]: true }), {}))}
                className={`p-2 ${theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-white"}`}
                title="Expand All"
              >
                <ChevronsDown className="h-5 w-5" />
              </button>
              <button
                onClick={() => setExpandedFolders({})}
                className={`p-2 ${theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-white"}`}
                title="Collapse All"
              >
                <ChevronsUp className="h-5 w-5" />
              </button>
            </div>
          )}

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

      <div className={`${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-lg p-4 sticky top-0 z-40 shadow-md`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
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

          {showFilters && (
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
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {viewMode !== "folder" && (
          <div className="w-full md:w-64 glass-panel rounded-xl p-4 h-fit sticky top-24">
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
              {renderFolderStructure(topLevelFolders, getFilteredPasswords(true))}
            </div>
          </div>
        )}

        <div className="flex-1">
          {viewMode === "list" ? (
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${theme === "light" ? "bg-gray-100" : "bg-[#333]"} text-left`}>
                      <th className="py-3 px-4 font-semibold">Name</th>
                      <th className="py-3 px-4 font-semibold">Username</th>
                      <th className="py-3 px-4 font-semibold hidden md:table-cell">Password</th>
                      <th className="py-3 px-4 font-semibold hidden lg:table-cell">Category</th>
                      <th className="py-3 px-4 font-semibold hidden xl:table-cell">Last Updated</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
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
      </div >

      {/* Modals */}
      {
        addPasswordModalOpen && (
          <AddPasswordModal
            onClose={() => setAddPasswordModalOpen(false)}
            onAdd={async (item: any) => {
              await handleAddPassword(item)
              setInitialFolderPath("")
            }}
            folders={folders}
            theme={theme}
            initialPath={initialFolderPath}
          />
        )
      }

      {
        addFolderModalOpen && (
          <AddFolderModal
            onClose={() => setAddFolderModalOpen(false)}
            onAdd={handleAddFolder}
            folders={folders}
            theme={theme}
            initialParentId={initialParentFolderId}
          />
        )
      }

      {
        moveToFolderModalOpen && (
          <MoveToFolderModal
            onClose={() => setMoveToFolderModalOpen(false)}
            onMove={handleMoveToFolder}
            folders={folders}
            record={selectedRecord}
            theme={theme}
          />
        )
      }

      {/* Edit Password Modal */}
      {
        editPasswordModalOpen && (
          <EditPasswordModal
            onClose={() => setEditPasswordModalOpen(false)}
            onSave={handleSaveEditedPassword}
            passwordData={selectedRecord}
            folders={folders}
            theme={theme}
          />
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deleteConfirmModalOpen && (
          <DeleteConfirmationModal
            onClose={() => setDeleteConfirmModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            itemName={selectedRecord?.website || selectedRecord?.username || "this password"}
            theme={theme}
          />
        )
      }

      {/* Auto Fill Modal */}
      {
        autoFillModalOpen && selectedRecord && (
          <AutoFill passwordData={selectedRecord} onClose={() => setAutoFillModalOpen(false)} theme={theme} />
        )
      }

      {/* View Picture Modal */}
      {
        viewPictureModalOpen && selectedRecord && selectedRecord.picture && (
          <ViewPictureModal
            onClose={() => setViewPictureModalOpen(false)}
            picture={selectedRecord.picture}
            passwordName={selectedRecord.website || selectedRecord.username}
            theme={theme}
          />
        )
      }
    </div >
  )
}

