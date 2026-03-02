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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import AddPasswordModal from "./modals/add-password-modal"
import AddFolderModal from "./modals/add-folder-modal"
import MoveToFolderModal from "./modals/move-to-folder-modal"
import EditPasswordModal from "./modals/edit-password-modal"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import AutoFill from "./auto-fill"
import ViewPictureModal from "./modals/view-picture-modal"
import { toast } from "sonner"

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
  setRecords?: any
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
  initialArchivedFilter = false,
  setRecords
}: PasswordsProps) {
  // State for view mode (folder only now)
  const [viewMode, setViewMode] = useState("folder")

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
  const [customDate, setCustomDate] = useState("")

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
  const [initialFolderId, setInitialFolderId] = useState("") // State for pre-selecting folder
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

  // State to control list visibility (User request: hide until letter selected)
  const [listVisible, setListVisible] = useState(false);

  // State for showing password in details panel
  const [showPasswordInDetails, setShowPasswordInDetails] = useState(false);

  // Scroll to letter function
  const scrollToLetter = (letter: string) => {
    // Reveal list if hidden
    if (!listVisible) {
      setListVisible(true);
      // Small delay to allow render
      setTimeout(() => performScroll(letter), 100);
    } else {
      performScroll(letter);
    }
  };

  const performScroll = (letter: string) => {
    const element = document.getElementById(`letter-group-${letter}`);

    // Find the scrollable container - could be table container or grid container
    let container: Element | null = null;

    // Try to find the overflow container based on view mode
    if (viewMode === 'list') {
      // In list view, find the table's parent overflow container
      container = element?.closest('.overflow-x-auto') || null;
    } else if (viewMode === 'grid') {
      // In grid view, find the grid's parent overflow container
      container = element?.closest('.overflow-y-auto') || null;
    }

    // Fallback to main container if specific container not found
    if (!container) {
      container = document.querySelector('main');
    }

    if (element && container) {
      // Calculate position relative to the container
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const offset = elementRect.top - containerRect.top;

      // Current scroll position
      const currentScroll = container.scrollTop;

      // Target scroll position (minus header height ~160px to clear fixed header + search bar)
      const targetScroll = currentScroll + offset - 160;

      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }

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
    // If a new folder was created implicitly by path (legacy) or directly by selection
    let folderId = undefined;
    if (newPassword.folder_id) {
      folderId = newPassword.folder_id;
    } else if (newPassword.path) {
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
      const newState = !record.is_favorite;
      await updateItem(id, { is_favorite: newState })
      toast.success(newState ? "Added to favorites" : "Removed from favorites")
    }
  }

  // Handle toggling archive status
  const handleToggleArchive = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (record) {
      const newState = !record.is_archived;
      await updateItem(id, { is_archived: newState })
      toast.success(newState ? "Item archived" : "Item unarchived")
    }
  }

  // Handle edit password - now shows in side panel instead of modal
  const handleEditPassword = (id: string) => {
    const passwordToEdit = records.find((record) => record.id === id)
    setSelectedRecord(passwordToEdit)
    setShowPasswordInDetails(false) // Reset password visibility when selecting new record
    // Don't open modal - details will show in side panel
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
      // Ensure both picture and image fields are saved to Supabase
      const dataToSave = {
        ...updatedData,
        image: updatedData.picture || updatedData.image, // Map picture to image
        picture: updatedData.picture || updatedData.image, // Keep both for compatibility
      }

      // @ts-ignore
      await updateItem(selectedRecord.id, dataToSave)
      setEditPasswordModalOpen(false)

      // Refresh selected record with updated data
      const updatedRecord = { ...selectedRecord, ...dataToSave }
      setSelectedRecord(updatedRecord)
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

  // Get records based on configuration (strictly passwords/logins only)
  const displayedRecords = records.filter((r: any) => {
    // 1. Strictly MUST be a password or login type.
    const allowedTypes = ["password", "login"];
    if (!allowedTypes.includes(r.type)) return false;

    // 3. Robust exclusion for Medications/Health Records
    const cat = r.category?.toLowerCase()
    const specificNames = ["Hydroxyzine", "Prednisone", "Loratadine", "Famotidine"];
    const isSpecificMed = specificNames.some(name => r.title?.includes(name));
    const isMed = cat === "medications" ||
      cat === "health records" ||
      r.type === "medication" ||
      r.item_metadata?.notes === "Imported Prescription" ||
      isSpecificMed;

    return !isMed
  })

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
  const topLevelFolders = folders.filter((folder) => !folder.parent_id)

  // Function to get direct subfolders of a folder
  const getSubfolders = (parentId: string) => {
    return folders.filter((folder) => folder.parent_id === parentId)
  }

  // Function to get direct passwords in a folder (not in subfolders) from a specific set of items
  const getDirectPasswordsInFolder = (folderId: string, items: any[] = passwords) => {
    return items.filter((password) => password.folder_id === folderId)
  }

  // Add a function to filter passwords based on selected filters and folder
  const getFilteredPasswords = (ignoreFolder = false) => {
    let filtered = passwords

    // Filter by folder - ONLY if not ignored
    if (!ignoreFolder && selectedFolder) {
      filtered = filtered.filter((password) => password.folder_id === selectedFolder)
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
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      const last3Months = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
      const last12Months = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter((password) => {
        const itemDate = new Date(password.updatedAt || password.created_at)
        const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())

        switch (timeFilter) {
          case "today":
            return itemDay.getTime() === today.getTime()
          case "yesterday":
            return itemDay.getTime() === yesterday.getTime()
          case "last7days":
            return itemDate >= last7Days
          case "last30days":
            return itemDate >= last30Days
          case "last3months":
            return itemDate >= last3Months
          case "last12months":
            return itemDate >= last12Months
          case "on":
            if (!customDate) return true
            const onDate = new Date(customDate)
            const onDay = new Date(onDate.getFullYear(), onDate.getMonth(), onDate.getDate())
            return itemDay.getTime() === onDay.getTime()
          case "before":
            if (!customDate) return true
            return itemDate < new Date(customDate)
          case "after":
            if (!customDate) return true
            return itemDate > new Date(customDate)
          default:
            return true
        }
      })
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
        onClick={() => {
          setSelectedRecord(password)
          setShowPasswordInDetails(false)
        }}
      >
        <div className="mr-3 flex-shrink-0">
          {(password.image || password.picture) ? (
            /* Show uploaded password image */
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={password.image || password.picture}
                alt={password.title || "Password"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = password.website
                    ? '<div class="p-2 bg-blue-500/10 rounded-lg"><svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></div>'
                    : '<div class="p-2 bg-purple-500/10 rounded-lg"><svg class="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>';
                }}
              />
            </div>
          ) : password.website ? (
            /* Default website icon */
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ExternalLink className="h-5 w-5 text-blue-400" />
            </div>
          ) : (
            /* Default lock icon */
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Lock className="h-5 w-5 text-purple-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{password.title || password.website || "Untitled"}</div>
          <div className={`text-xs truncate ${theme === "light" ? "text-gray-500" : "text-gray-300"}`}>
            {password.username || password.email || "No username"}
          </div>
        </div>
      </div>
    )
  }

  // Render folder structure recursively
  const renderFolderStructure = (structure: any[], items: any[] = passwords, level = 0) => {
    // Helper to calculate count recursively based on provided items
    const getFolderCount = (fId: string): number => {
      const direct = getDirectPasswordsInFolder(fId, items).length
      // @ts-ignore
      const subs = folders.filter((f) => f.parent_id === fId)
      const subCounts = subs.reduce((acc, sub) => acc + getFolderCount(sub.id), 0)
      return direct + subCounts
    }

    const shouldShowFolder = (folder: any): boolean => {
      const totalCount = getFolderCount(folder.id)
      const isFiltering = searchQuery || categoryFilter !== "all" || favoriteFilter || archivedFilter || timeFilter !== "all"

      // Hide empty folders if ANY filter is active
      if (isFiltering && totalCount === 0) return false

      if (!searchQuery) return true

      const query = searchQuery.toLowerCase()
      const nameMatch = folder.name.toLowerCase().includes(query)
      const hasDirectMatch = getDirectPasswordsInFolder(folder.id, items).length > 0
      // @ts-ignore
      const subs = folders.filter((f) => f.parent_id === folder.id)
      const hasSubfolderMatch = subs.some(sub => shouldShowFolder(sub))

      return nameMatch || hasDirectMatch || hasSubfolderMatch
    }

    const visibleFolders = structure.filter(shouldShowFolder)

    return visibleFolders.map((folder) => {
      const isExpanded = expandedFolders[folder.id]
      const isSelected = selectedFolder === folder.id
      const subfolders = getSubfolders(folder.id)
      const directPasswords = getDirectPasswordsInFolder(folder.id, items)

      // Total count for this folder (direct + recursive subfolders)
      const totalCount = getFolderCount(folder.id)
      const countLabel = totalCount === 1 ? "1 Record" : `${totalCount} Records`
      const effectivelyExpanded = isExpanded || !!searchQuery

      return (
        <div key={folder.id} className={`${level > 0 ? "ml-8" : ""} border-b ${theme === "light" ? "border-gray-100" : "border-gray-800"}`}>
          <div className="flex items-center flex-1 min-w-0 py-2">
            <div
              className={`flex items-center flex-1 cursor-pointer py-2 px-2 rounded-lg transition-colors ${isSelected ? "bg-blue-600/20 dark:bg-blue-600/30" : theme === "light" ? "hover:bg-gray-50" : "hover:bg-white/5"}`}
              onClick={() => {
                setSelectedFolder(folder.id)
                if (!isExpanded) toggleFolder(folder.id)
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(folder.id)
                }}
                className="p-1 mr-2 flex-shrink-0"
              >
                {effectivelyExpanded ? <ChevronDown className="h-4 w-4 text-gray-300" /> : <ChevronRight className="h-4 w-4 text-gray-300" />}
              </button>
              <Folder className={`h-6 w-6 mr-3 flex-shrink-0 ${isSelected ? 'text-blue-400' : 'text-blue-400'}`} />
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${isSelected ? 'text-blue-200 font-bold' : theme === "light" ? "text-gray-900" : "text-gray-100"}`}>{folder.name}</div>
                <div className="text-xs text-gray-300 truncate">{countLabel}</div>
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
                className={`p-2 rounded-full ${activeMenu === `folder-${folder.id}` ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" : "text-gray-300 hover:text-gray-100 dark:hover:text-white"}`}
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
                      setInitialFolderId(folder.id)
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
          </div >

          {effectivelyExpanded && (
            <div className="ml-4 border-l border-white/5">
              {/* Display subfolders recursively */}
              {subfolders.length > 0 && renderFolderStructure(subfolders, items, level + 1)}

              {/* Display direct passwords in this folder */}
              {directPasswords.map((password) => renderFolderListItem(password))}
            </div>
          )}
        </div >
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

      const isFolder = password.type === 'folder';

      return (
        <tr
          key={password.id}
          id={anchorId}
          className={`border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"} hover:bg-white/5 transition-colors cursor-pointer ${isFolder ? 'hidden md:table-row' : ''}`}
          onClick={() => handleEditPassword(password.id)}
        >
          <td className="py-3 px-4 overflow-hidden max-w-[150px] md:max-w-none">
            {password.website ? (
              <div className="flex flex-col">
                <div className="font-medium truncate">{password.title || "Untitled"}</div>
                <a
                  href={password.website.startsWith("http") ? password.website : `https://${password.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center mt-0.5 truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {password.website.replace(/^https?:\/\//, '').replace(/^www\./, '').substring(0, 30)}{password.website.length > 30 ? '...' : ''}
                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                </a>
              </div>
            ) : (
              <span className="font-medium truncate block">{password.title || "Untitled"}</span>
            )}
          </td>
          <td
            className="py-3 px-4 hidden md:table-cell hover:text-blue-400 transition-colors truncate max-w-[150px]"
            onClick={(e) => {
              e.stopPropagation()
              handleEditPassword(password.id)
            }}
            title="Click to Edit"
          >
            {password.username}
          </td>
          <td className="py-3 px-4 hidden lg:table-cell relative min-w-[140px]">
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
          <td className="py-3 px-4 hidden xl:table-cell truncate max-w-[120px]">{password.category || "General"}</td>
          <td className="py-3 px-4 hidden 2xl:table-cell whitespace-nowrap">{new Date(password.updatedAt || password.created_at).toLocaleDateString()}</td>
          <td className="py-3 px-4 text-right md:text-left">
            <div className="flex items-center justify-end md:justify-start space-x-1 sm:space-x-2">
              <button
                className="text-blue-400 hover:text-blue-300 p-1"
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
                className={`${password.is_favorite ? "text-yellow-300" : "text-yellow-400 hover:text-yellow-300"} p-1`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleFavorite(password.id)
                }}
              >
                <Star className="h-4 w-4" fill={password.is_favorite ? "currentColor" : "none"} />
              </button>

              <button
                className="text-red-500 hover:text-red-400 p-1"
                onClick={(e) => {
                  e.stopPropagation()
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
              {new Date(password.updatedAt || password.created_at).toLocaleDateString()}
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
      <div className={`h-full flex flex-col ${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-xl shadow-lg border ${theme === "light" ? "border-gray-200" : "border-gray-700"} w-full max-w-full overflow-hidden`} style={{ maxWidth: '100%', wordWrap: 'break-word' }}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 space-y-3">
          {/* Title Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                {record.website ? <ExternalLink className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" /> : <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h2 className="text-lg sm:text-xl font-bold break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{record.title || "Untitled"}</h2>
                <p className="text-xs sm:text-sm text-gray-500">Record Info</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
              title="Close"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </button>
          </div>

          {/* Action Icons Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap overflow-x-auto">
            <button
              onClick={async () => {
                const newFavoriteStatus = !(record.isFavorite || record.is_favorite)
                const updatedRecord = { ...record, isFavorite: newFavoriteStatus, is_favorite: newFavoriteStatus }
                setSelectedRecord(updatedRecord) // Update local state immediately
                await updateItem(record.id, updatedRecord)
              }}
              className={`p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-full transition-colors ${(record.isFavorite || record.is_favorite) ? 'text-yellow-500' : 'text-gray-400'}`}
              title={(record.isFavorite || record.is_favorite) ? "Remove Favorite" : "Add Favorite"}
            >
              <Star className="h-5 w-5" fill={(record.isFavorite || record.is_favorite) ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => {
                setSelectedRecord(record)
                setMoveToFolderModalOpen(true)
              }}
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-full transition-colors text-purple-500"
              title="Move to Folder"
            >
              <Folder className="h-5 w-5" />
            </button>
            <button
              onClick={async () => {
                const newArchivedStatus = !(record.is_archived || record.isArchived)
                const updatedRecord = { ...record, is_archived: newArchivedStatus, isArchived: newArchivedStatus }
                setSelectedRecord(updatedRecord) // Update local state immediately
                await updateItem(record.id, updatedRecord)
              }}
              className={`p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-full transition-colors ${(record.is_archived || record.isArchived) ? 'text-green-500' : 'text-gray-400'}`}
              title={(record.is_archived || record.isArchived) ? "Unarchive" : "Archive"}
            >
              <Archive className="h-5 w-5" fill={(record.is_archived || record.isArchived) ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => setEditPasswordModalOpen(true)}
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-colors text-blue-500"
              title="Edit"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setDeleteConfirmModalOpen(true)
              }}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors text-red-500"
              title="Delete"
            >
              <Trash className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Section: General */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">General</h3>

            {/* Title Field */}
            <div className="group">
              <label className="text-xs text-gray-300 block mb-1">Title</label>
              <div className="text-sm font-medium p-2 -ml-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-text">
                {record.title || "Untitled"}
              </div>
            </div>

            {/* Login Field */}
            <div className="group relative">
              <label className="text-xs text-gray-300 block mb-1">Login</label>
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
              <label className="text-xs text-gray-300 block mb-1">Password</label>
              <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 -ml-1 sm:-ml-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div
                  className={`flex-1 font-mono text-sm cursor-pointer ${showPasswordInDetails ? 'bg-blue-600/30 text-white font-bold px-1 rounded' : 'text-gray-500'} hover:text-blue-500`}
                  onClick={() => navigator.clipboard.writeText(record.password || "")}
                  title="Click to Copy"
                  style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                >
                  {showPasswordInDetails ? record.password : "••••••••••"}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPasswordInDetails(!showPasswordInDetails)
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  {showPasswordInDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className={`h-1 w-full bg-gray-700 mt-2 rounded-full overflow-hidden ${record.password ? "opacity-100" : "opacity-0"}`}>
                <div className="h-full bg-orange-500 w-2/3"></div> {/* Mock strength meter */}
              </div>
              <p className="text-xs text-gray-300 mt-1">Fair</p>
            </div>

            {/* Website Field */}
            {record.website && (
              <div className="group">
                <label className="text-xs text-gray-300 block mb-1">Website Address</label>
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

            {/* Picture Field - Show uploaded image */}
            {(record.image || record.picture) && (
              <div className="group">
                <label className="text-xs text-gray-300 block mb-2">Picture</label>
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                  <img
                    src={record.image || record.picture}
                    alt={record.title || "Password"}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleViewPicture(record)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Custom Fields Section */}
          {record.item_metadata?.customFields && record.item_metadata.customFields.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Custom Fields</h3>
              <div className="space-y-3">
                {record.item_metadata.customFields.map((field: any) => (
                  <div key={field.id} className="group relative">
                    <label className="text-xs text-gray-300 block mb-1">{field.label}</label>
                    <div className="flex items-center gap-2 p-2 -ml-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div
                        className={`flex-1 text-sm cursor-pointer ${field.type === 'password' || field.type === 'pin' || field.type === 'hidden' ? 'font-mono' : ''} hover:text-blue-500`}
                        onClick={() => navigator.clipboard.writeText(field.value || "")}
                        title="Click to Copy"
                        style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                      >
                        {(field.type === 'password' || field.type === 'pin' || field.type === 'hidden')
                          ? (activePasswordPopup === `custom-${field.id}` ? (
                            <span className="bg-blue-600/30 text-white font-medium px-1 rounded">{field.value}</span>
                          ) : "••••••••")
                          : field.value || "—"}
                      </div>

                      {(field.type === 'password' || field.type === 'pin' || field.type === 'hidden') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActivePasswordPopup(activePasswordPopup === `custom-${field.id}` ? null : `custom-${field.id}`)
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex-shrink-0"
                        >
                          {activePasswordPopup === `custom-${field.id}` ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}

                      <button
                        onClick={() => navigator.clipboard.writeText(field.value || "")}
                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                        title="Copy"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Notes */}
          {record.notes && (
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="group">
                <label className="text-xs text-gray-300 block mb-1">Notes</label>
                <div className="text-sm whitespace-pre-wrap text-gray-200 leading-relaxed">
                  {record.notes}
                </div>
              </div>
            </div>
          )}
        </div>
      </div >
    )
  }


  // Render folder view for passwords (Split Layout)
  const renderFolderView = () => {
    // Get filtered items ignoring folder selection (so we can distribute them into structure)
    const itemsForStructure = getFilteredPasswords(true)
    const topLevelFolders = folders.filter((f: any) => !f.parent_id)

    return (
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-300px)] w-full max-w-full overflow-hidden">
        {/* Left Side: Folder/List - HIDE on mobile when password selected */}
        <div className={`md:w-1/3 border-r border-gray-100 dark:border-gray-800 pr-2 overflow-y-auto ${selectedRecord ? 'hidden md:block' : 'block'} w-full md:max-w-[33%]`}>
          <div className="space-y-2">
            {/* Only show folder structure when NO filters are active */}
            {!favoriteFilter && !archivedFilter && renderFolderStructure(topLevelFolders, itemsForStructure)}

            {/* Passwords without folders - Show when no filters OR show filtered items in flat list */}
            {favoriteFilter || archivedFilter ? (
              /* When filtering, show flat list of matching passwords */
              <div className="space-y-1">
                {itemsForStructure.filter((p) => !p.folder).map((password) => renderFolderListItem(password))}
                {itemsForStructure.filter((p) => !p.folder).length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    <p>No {favoriteFilter ? 'favorite' : 'archived'} items found</p>
                  </div>
                )}
              </div>
            ) : (
              /* Normal view - show passwords without folders */
              <div className={`border-b ${theme === "light" ? "border-gray-100" : "border-gray-800"} mt-4`}>
                <div
                  className={`flex items-center py-3 px-2 cursor-pointer rounded-lg transition-colors ${!selectedFolder ? 'bg-blue-600/20 dark:bg-blue-600/30' : theme === "light" ? "hover:bg-gray-50" : "hover:bg-white/5"}`}
                  onClick={() => setSelectedFolder("")}
                >
                  <Folder className="h-6 w-6 mr-3 text-gray-400" />
                  <div className="flex-1">
                    <div className={`font-semibold ${!selectedFolder ? 'text-blue-400' : theme === "light" ? "text-gray-900" : "text-gray-100"}`}>No Folder</div>
                    <span className="text-xs text-gray-300">
                      {itemsForStructure.filter((p) => !p.folder_id).length} Records
                    </span>
                  </div>
                </div>

                <div className="pl-7 space-y-0 text-sm"> {/* Compact list for root items */}
                  {itemsForStructure.filter((p) => !p.folder_id).map((password) => renderFolderListItem(password))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Details Pane - FULL WIDTH on mobile when password selected */}
        <div className={`h-full w-full md:w-2/3 md:pl-2 ${selectedRecord ? 'block px-2' : 'hidden md:block'}`}>
          {renderRecordDetails(selectedRecord)}
        </div>
      </div>
    )
  }

  // Render A-Z Scrollbar Sidebar
  const renderAZSidebar = () => {
    // Only show A-Z in List View (per user request to avoid clutter)
    if (viewMode !== 'list') return null;

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

          <button
            onClick={() => {
              // Check if all folders are expanded
              const allExpanded = folders.length > 0 && folders.every((folder: any) => expandedFolders[folder.id])

              if (allExpanded) {
                // Collapse all
                setExpandedFolders({})
              } else {
                // Expand all
                const allFolderIds = folders.reduce((acc: Record<string, boolean>, folder: any) => {
                  acc[folder.id] = true
                  return acc
                }, {})
                setExpandedFolders(allFolderIds)
              }
            }}
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition duration-200"
            title={folders.length > 0 && folders.every((folder: any) => expandedFolders[folder.id]) ? "Collapse All Folders" : "Expand All Folders"}
          >
            {folders.length > 0 && folders.every((folder: any) => expandedFolders[folder.id]) ? (
              <ChevronsUp className="h-5 w-5" />
            ) : (
              <ChevronsDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Status Indicator */}
      {(favoriteFilter || archivedFilter) && (
        <div className={`${favoriteFilter ? 'bg-yellow-500/20 border-yellow-500' : 'bg-green-500/20 border-green-500'} border-l-4 rounded-md p-4 mb-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {favoriteFilter ? (
                <>
                  <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                  <span className="font-semibold text-yellow-700 dark:text-yellow-300">Showing Favorites Only</span>
                </>
              ) : (
                <>
                  <Archive className="h-5 w-5 text-green-500" fill="currentColor" />
                  <span className="font-semibold text-green-700 dark:text-green-300">Showing Archived Items Only</span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                setFavoriteFilter(false)
                setArchivedFilter(false)
              }}
              className="text-sm px-3 py-1 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      <Accordion type="single" collapsible defaultValue="filters" className="w-full">
        <AccordionItem value="filters" className="border-none">
          <AccordionTrigger className={`flex items-center justify-between ${theme === "light" ? "bg-gray-100" : "bg-[#1a1a1a]"} rounded-lg px-4 py-3 hover:no-underline shadow-sm mb-2`}>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold">Search & Filters</span>
              {(searchQuery || categoryFilter !== "all" || timeFilter !== "all" || favoriteFilter || archivedFilter) && (
                <span className="flex h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="md:block md:p-0 data-[state=open]:overflow-visible transition-none">
            <div className={`${theme === "light" ? "bg-gray-100" : "bg-[#1a1a1a]"} rounded-lg p-4 sticky top-0 md:relative z-10 shadow-md`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}
            />
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-10 py-2 rounded-md ${theme === "light" ? "bg-white text-gray-900 border-gray-300" : "bg-[#2a2a2a] text-white border-gray-700"} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === "light" ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-gray-200"} transition-colors`}
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Always Visible Dropdowns */}
          <div className="flex gap-2 flex-wrap">
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                className={`flex items-center justify-between ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} px-4 py-2 rounded-md transition duration-200 min-w-32`}
                onClick={() => {
                  setShowCategoryFilterMenu(!showCategoryFilterMenu)
                  setShowStatusFilterMenu(false)
                }}
              >
                <span>{categoryFilter === "all" ? "Categories" : categoryFilter}</span>
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
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative">
              <button
                className={`flex items-center justify-between ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} px-4 py-2 rounded-md transition duration-200 min-w-40`}
                onClick={() => {
                  setShowTimeFilterMenu(!showTimeFilterMenu)
                  setShowCategoryFilterMenu(false)
                  setShowStatusFilterMenu(false)
                }}
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-400" />
                  <span className="truncate">
                    {timeFilter === "all" ? "Any Time" :
                      timeFilter === "today" ? "Today" :
                        timeFilter === "yesterday" ? "Yesterday" :
                          timeFilter === "last7days" ? "Last 7 days" :
                            timeFilter === "last30days" ? "Last 30 days" :
                              timeFilter === "last3months" ? "Last 3 months" :
                                timeFilter === "last12months" ? "Last 12 months" :
                                  timeFilter === "on" ? `On ${customDate || '...'}` :
                                    timeFilter === "before" ? `Before ${customDate || '...'}` :
                                      timeFilter === "after" ? `After ${customDate || '...'}` : "Date Filter"}
                  </span>
                </div>
                {timeFilter !== "all" ? (
                  <X
                    className="h-4 w-4 ml-2 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      setTimeFilter("all")
                      setCustomDate("")
                    }}
                  />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                )}
              </button>

              {showTimeFilterMenu && (
                <div
                  className={`absolute z-[100] mt-1 w-64 ${theme === "light" ? "bg-white" : "bg-[#252526] shadow-2xl border border-white/5"} rounded-xl p-2 animate-in fade-in zoom-in-95`}
                >
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: "all", label: "Any Time" },
                      { id: "today", label: "Today" },
                      { id: "yesterday", label: "Yesterday" },
                      { id: "last7days", label: "Last 7 days" },
                      { id: "last30days", label: "Last 30 days" },
                      { id: "last3months", label: "Last 3 months" },
                      { id: "last12months", label: "Last 12 months" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${timeFilter === opt.id ? "bg-blue-600 text-white" : theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/5"}`}
                        onClick={() => {
                          setTimeFilter(opt.id)
                          setShowTimeFilterMenu(false)
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}

                    <div className={`h-px w-full my-1 ${theme === "light" ? "bg-gray-200" : "bg-gray-700"}`} />

                    {["on", "before", "after"].map((opt) => (
                      <div key={opt} className="px-1">
                        <button
                          className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex justify-between items-center ${timeFilter === opt ? "text-blue-400" : "text-gray-500"}`}
                          onClick={() => setTimeFilter(opt)}
                        >
                          {opt}...
                          {timeFilter === opt && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        </button>
                        {timeFilter === opt && (
                          <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className={`w-full mt-1 px-3 py-1.5 text-sm rounded border ${theme === "light" ? "bg-white border-gray-200" : "bg-black/20 border-white/10"}`}
                            autoFocus
                          />
                        )}
                      </div>
                    ))}

                    <div className={`h-px w-full my-1 ${theme === "light" ? "bg-gray-200" : "bg-gray-700"}`} />

                    <button
                      className="w-full text-center py-2 text-xs font-bold text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                      onClick={() => {
                        setTimeFilter("all")
                        setCustomDate("")
                        setShowTimeFilterMenu(false)
                      }}
                    >
                      Reset Date Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Functions Dropdown */}
            <div className="relative flex items-center gap-2">
              <button
                className={`flex items-center justify-between ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-[#333] hover:bg-gray-600 text-white"} px-4 py-2 rounded-md transition duration-200 min-w-32`}
                onClick={() => {
                  setShowStatusFilterMenu(!showStatusFilterMenu)
                  setShowCategoryFilterMenu(false)
                }}
              >
                <span>Functions</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>

              {/* Quick Clear Filter Button */}
              {(categoryFilter !== "all" || favoriteFilter || archivedFilter) && (
                <button
                  onClick={() => {
                    setCategoryFilter("all")
                    setFavoriteFilter(false)
                    setArchivedFilter(false)
                    toast.success("Filters cleared")
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-xs uppercase tracking-tight transition-all ${theme === 'light' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                  title="Clear all active filters"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}

              {showStatusFilterMenu && (
                <div
                  className={`absolute z-10 mt-1 w-48 ${theme === "light" ? "bg-white" : "bg-[#333]"} rounded-md shadow-lg py-1`}
                >
                  <button
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${favoriteFilter ? "bg-blue-600 text-white" : ""}`}
                    onClick={() => {
                      setFavoriteFilter(!favoriteFilter)
                      setShowStatusFilterMenu(false)
                    }}
                  >
                    <Star className="h-4 w-4" fill={favoriteFilter ? "currentColor" : "none"} />
                    {favoriteFilter ? "Show All" : "Favorites Only"}
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-600"} ${archivedFilter ? "bg-blue-600 text-white" : ""}`}
                    onClick={() => {
                      setArchivedFilter(!archivedFilter)
                      setShowStatusFilterMenu(false)
                    }}
                  >
                    <Archive className="h-4 w-4" />
                    {archivedFilter ? "Show Active" : "Show Archived"}
                  </button>
                  <div className={`h-px ${theme === "light" ? "bg-gray-200" : "bg-gray-700"} my-1`} />
                  <button
                    className={`w-full text-left px-4 py-2 ${theme === "light" ? "hover:bg-gray-100 text-red-600" : "hover:bg-gray-600 text-red-400"}`}
                    onClick={() => {
                      setCategoryFilter("all")
                      setFavoriteFilter(false)
                      setArchivedFilter(false)
                      setShowStatusFilterMenu(false)
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {viewMode !== "folder" && (
          <div className={`w-full md:w-64 rounded-xl p-4 h-fit sticky top-24 ${theme === "light" ? "bg-white border border-gray-200" : "bg-[#1a1a1a] border border-gray-800"}`}>
            <h2 className="text-lg font-semibold mb-4">Folders</h2>
            <div className="space-y-1">
              <div
                className={`flex items-center py-2 cursor-pointer ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} rounded px-2 ${selectedFolder === "" ? "bg-blue-600 text-white" : ""
                  }`}
                onClick={() => setSelectedFolder("")}
              >
                <Folder className={`h-5 w-5 mr-2 ${selectedFolder === "" ? "text-white" : "text-blue-400"}`} />
                <span>All Items</span>
              </div>
              {renderFolderStructure(topLevelFolders, getFilteredPasswords(true))}
            </div>
          </div>
        )}

        <div className="flex-1">
          {viewMode === "list" ? (
            <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-300px)]">
              {/* Left: Password List */}
              <div className={`${selectedRecord ? 'hidden' : 'w-full'} rounded-xl overflow-hidden relative z-40 ${theme === "light" ? "bg-white border border-gray-200" : "bg-[#1a1a1a] border border-gray-800"}`}>
                <div className="overflow-x-auto h-full">
                  <table className="w-full text-left text-sm table-fixed">
                    <thead className={`${theme === "light" ? "bg-gray-50 text-gray-600" : "bg-[#1a1a1a] text-gray-300"} sticky top-0`}>
                      <tr>
                        <th className="py-3 px-4 font-medium w-full md:w-auto">Title / Website</th>
                        <th className="py-3 px-4 font-medium hidden md:table-cell w-48">Username</th>
                        <th className="py-3 px-4 font-medium hidden lg:table-cell w-48">Password</th>
                        <th className="py-3 px-4 font-medium hidden xl:table-cell w-32">Category</th>
                        <th className="py-3 px-4 font-medium hidden 2xl:table-cell w-32">Updated</th>
                        <th className="py-3 px-4 font-medium w-32 md:w-auto text-right md:text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === "light" ? "divide-gray-100" : "divide-gray-800"}`}>
                      {renderPasswordRows()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Password Details Panel */}
              <div className={`${selectedRecord ? 'block w-full' : 'hidden'} h-full sticky top-24 self-start`}>
                {renderRecordDetails(selectedRecord)}
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-300px)]">
              {/* Left: Password Grid */}
              <div className={`${selectedRecord ? 'hidden' : 'w-full'} overflow-y-auto`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">{renderPasswordGrid()}</div>
              </div>

              {/* Right: Password Details Panel */}
              <div className={`${selectedRecord ? 'block w-full' : 'hidden'} h-full overflow-y-auto sticky top-24 self-start`}>
                {renderRecordDetails(selectedRecord)}
              </div>
            </div>
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
              setInitialFolderId("")
            }}
            folders={folders}
            theme={theme}
            initialFolderId={initialFolderId}
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

