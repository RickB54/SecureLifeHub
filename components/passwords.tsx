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
  ArrowLeft,
  RotateCcw,
  Shield,
  Download,
  Paperclip,
  Upload,
  FileText,
  Maximize,
  Minimize,
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
  isFullscreen?: boolean
  setIsFullscreen?: (val: boolean) => void
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
  setRecords,
  isFullscreen,
  setIsFullscreen
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
  const [viewHistoryModalOpen, setViewHistoryModalOpen] = useState(false)

  // Ref for dropdown menus
  const menuRef = useRef<HTMLDivElement>(null)

  // State for active dropdown menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false)

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
      folder_id: (newPassword.folder_id === "" || !newPassword.folder_id) ? null : newPassword.folder_id // Explicitly handle root as null
    })
    setAddPasswordModalOpen(false)
  }

  // Expand or collapse all folders
  const handleToggleAllFolders = () => {
    const isAnyCollapsed = folders.some(f => !expandedFolders[f.id]);
    if (isAnyCollapsed) {
      // Expand all
      const all: Record<string, boolean> = {};
      folders.forEach(f => { all[f.id] = true; });
      setExpandedFolders(all);
      toast.success("All folders expanded");
    } else {
      // Collapse all
      setExpandedFolders({});
      toast.success("All folders collapsed");
    }
  };

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
      const newState = !(record.is_favorite || record.isFavorite);
      const updatedRecord = { ...record, is_favorite: newState, isFavorite: newState };
      
      // Update persistent storage
      await updateItem(id, { is_favorite: newState, isFavorite: newState })
      
      // Update local state if currently viewing this record
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(updatedRecord);
      }
      
      toast.success(newState ? "Added to favorites" : "Removed from favorites")
    }
  }

  // Handle toggling archive status
  const handleToggleArchive = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (record) {
      const newState = !(record.is_archived || record.isArchived);
      const updatedRecord = { ...record, is_archived: newState, isArchived: newState };
      
      // Update persistent storage
      await updateItem(id, { is_archived: newState, isArchived: newState })
      
      // Update local state if currently viewing this record
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(updatedRecord);
      }
      
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

  // Handle adding an attachment
  const handleAddAttachment = async (recordId: string, file: File) => {
    const record = records.find(r => r.id === recordId)
    if (!record) return

    const newAttachment = {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
      uploaded_at: new Date().toISOString()
    }

    const updatedAttachments = [...(record.attachments || []), newAttachment]
    const updatedRecord = { ...record, attachments: updatedAttachments }
    
    await updateItem(recordId, updatedRecord)
    setSelectedRecord(updatedRecord)
    toast.success("Attachment added successfully")
  }

  // Handle deleting an attachment
  const handleDeleteAttachment = async (recordId: string, attachmentId: string) => {
    const record = records.find(r => r.id === recordId)
    if (!record) return

    const updatedAttachments = (record.attachments || []).filter((a: any) => a.id !== attachmentId)
    const updatedRecord = { ...record, attachments: updatedAttachments }
    
    await updateItem(recordId, updatedRecord)
    setSelectedRecord(updatedRecord)
    toast.success("Attachment removed")
  }

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
      if (selectedFolder === "no-folder") {
        filtered = filtered.filter((password) => !password.folder_id || password.folder_id === "")
      } else {
        filtered = filtered.filter((password) => password.folder_id === selectedFolder)
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
      filtered = filtered.filter((password) => password.is_favorite || password.isFavorite)
    }

    // Filter by archived
    if (archivedFilter) {
      filtered = filtered.filter((password) => password.is_archived || password.isArchived)
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

    // Sort by title (default)
    filtered.sort((a, b) => {
      const titleA = a.title || a.website || "Untitled";
      const titleB = b.title || b.website || "Untitled";
      return titleA.localeCompare(titleB);
    });

    // Special case for 'recent' - override sorting and limit to 10
    if (timeFilter === 'recent') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.created_at).getTime();
        const dateB = new Date(b.updatedAt || b.created_at).getTime();
        return dateB - dateA;
      });
      return filtered.slice(0, 10);
    }

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
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm truncate">{password.title || password.website || "Untitled"}</div>
            {(password.is_favorite || password.isFavorite) && (
              <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" fill="currentColor" />
            )}
          </div>
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
                setSelectedRecord(null) // Reset record to show folder contents on the right
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

  // Render folder details
  const renderFolderDetail = (fId: string) => {
    const isNoFolder = fId === "no-folder" || fId === ""
    const folder = folders.find((f: any) => f.id === fId)
    const folderName = isNoFolder ? "No Folder" : (folder?.name || "Unknown Folder")
    const folderId = fId

    const itemsForStructure = getFilteredPasswords(true)
    const directItems = isNoFolder
      ? itemsForStructure.filter((p) => !p.folder_id)
      : itemsForStructure.filter((p) => p.folder_id === folderId)

    const subFolders = isNoFolder ? [] : getSubfolders(folderId)

    return (
      <div
        className={`h-full flex flex-col ${theme === "light" ? "bg-[#1e1e1e]" : "bg-[#2a2a2a]"} rounded-xl shadow-lg border border-gray-700 w-full max-w-full overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg flex-shrink-0">
                <Folder className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h2 className="text-lg sm:text-xl font-bold truncate">{folderName}</h2>
                <div className="text-xs sm:text-sm text-gray-500">
                  {directItems.length} Records {subFolders.length > 0 && `• ${subFolders.length} Folders`}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedFolder("")}
              className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
              title="Close"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contents list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {subFolders.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sub-Folders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subFolders.map((sf) => (
                  <div
                    key={sf.id}
                    onClick={() => {
                      setSelectedFolder(sf.id)
                      setSelectedRecord(null)
                    }}
                    className={`flex items-center p-3 rounded-lg border border-gray-700 bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all cursor-pointer group`}
                  >
                    <Folder className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                    <span className="font-medium truncate text-sm text-gray-200 group-hover:text-blue-400">
                      {sf.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Records</h3>
            <div className="space-y-1">
              {directItems.map((item) => renderFolderListItem(item))}
              {directItems.length === 0 && (
                <div className="text-center py-20 text-gray-500 italic flex flex-col items-center">
                  <div className="p-4 bg-gray-800/50 rounded-full mb-4">
                    <Lock className="h-8 w-8 opacity-20" />
                  </div>
                  <p>No records found in this folder</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render right-side details pane for selected record
  const renderRecordDetails = (record: any) => {
    if (!record) {
      if (selectedFolder) {
        return renderFolderDetail(selectedFolder)
      }
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
          <Folder className="h-16 w-16 mb-4" />
          <p>Select an item to view details</p>
        </div>
      )
    }

    return (
      <div className={`h-full flex flex-col ${theme === "light" ? "bg-white" : "bg-[#1e1e1e]"} rounded-xl shadow-2xl border ${theme === "light" ? "border-gray-200" : "border-white/10"} w-full max-w-full overflow-hidden`} style={{ maxWidth: '100%', wordWrap: 'break-word' }}>
        {/* Header - Keeper Style */}
        <div className={`p-4 sm:p-6 border-b ${theme === "light" ? "border-gray-100" : "border-white/5"} space-y-4`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className={`p-3 ${theme === "light" ? "bg-blue-50" : "bg-blue-500/10"} rounded-xl flex-shrink-0 border ${theme === "light" ? "border-blue-100" : "border-blue-500/20"}`}>
                {record.website ? <ExternalLink className="h-8 w-8 text-blue-500" /> : <Lock className="h-8 w-8 text-blue-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight break-words" style={{ wordBreak: 'break-word' }}>{record.title || "Untitled"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-bold uppercase tracking-widest ${theme === "light" ? "text-gray-400" : "text-gray-500"}`}>General</span>
                  {record.folder_id && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs text-blue-400 font-medium">
                        {folders.find(f => f.id === record.folder_id)?.name || "Folder"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${theme === 'light' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}
                  onClick={() => {/* Share logic */}}
                >
                  Share
                </button>
              </div>
              <button
                onClick={() => setEditPasswordModalOpen(true)}
                className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                title="Edit"
              >
                <Edit className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'} ${activeMenu === `more-${record.id}` ? (theme === 'light' ? 'bg-gray-200' : 'bg-white/10 text-white') : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveMenu(activeMenu === `more-${record.id}` ? null : `more-${record.id}`)
                  }}
                  title="More Actions"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>

                {activeMenu === `more-${record.id}` && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-white/10'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-1">
                      <button
                        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${theme === "light" ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/5 text-gray-200"}`}
                        onClick={() => {
                          setSelectedRecord(record)
                          setMoveToFolderModalOpen(true)
                          setActiveMenu(null)
                        }}
                      >
                        <FolderTree className="h-4 w-4 mr-3 text-blue-400" />
                        Move to Folder
                      </button>
                      <button
                        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${theme === "light" ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/5 text-gray-200"}`}
                        onClick={() => {
                          handleDuplicatePassword(record)
                          setActiveMenu(null)
                          toast.success("Record duplicated")
                        }}
                      >
                        <Copy className="h-4 w-4 mr-3 text-purple-400" />
                        Duplicate Record
                      </button>
                      <button
                        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${theme === "light" ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/5 text-gray-300"}`}
                        onClick={() => {
                          setViewHistoryModalOpen(true)
                          setActiveMenu(null)
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-3 text-green-400" />
                        View History
                      </button>
                    </div>
                    <div className={`h-px w-full ${theme === "light" ? "bg-gray-100" : "bg-white/5"}`} />
                    <div className="p-1">
                      <button
                        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-red-500 transition-colors ${theme === "light" ? "hover:bg-red-50" : "hover:bg-red-500/10"}`}
                        onClick={() => {
                          setDeleteConfirmModalOpen(true)
                          setActiveMenu(null)
                        }}
                      >
                        <Trash className="h-4 w-4 mr-3" />
                        Delete Record
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedRecord(null)
                  setShowPasswordInDetails(false)
                }}
                className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-500/10 text-red-400'}`}
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar Sub-Header - Favorite/Archive/Delete */}
        <div className={`px-6 py-2 border-b ${theme === "light" ? "bg-gray-50 border-gray-100" : "bg-black/20 border-white/5"} flex items-center gap-4`}>
           <button
              onClick={() => handleToggleFavorite(record.id)}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase transition-colors ${(record.isFavorite || record.is_favorite) ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Star className="h-4 w-4" fill={(record.isFavorite || record.is_favorite) ? "currentColor" : "none"} />
              {(record.isFavorite || record.is_favorite) ? "Favorite" : "Add Favorite"}
            </button>
            <button
              onClick={() => handleToggleArchive(record.id)}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase transition-colors ${(record.is_archived || record.isArchived) ? 'text-green-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Archive className="h-4 w-4" fill={(record.is_archived || record.isArchived) ? "currentColor" : "none"} />
              {(record.is_archived || record.isArchived) ? "Archived" : "Archive"}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setDeleteConfirmModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase text-red-500/70 hover:text-red-500 transition-colors"
            >
              <Trash className="h-4 w-4" />
              Delete
            </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 ${theme === 'light' ? 'bg-white' : 'bg-[#1a1a1a]'}`}>
          {/* Section: Credentials */}
          <div className="max-w-4xl space-y-6">
            {/* Title Field */}
            <div className="group border-b border-white/5 pb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Title</label>
              <div className="text-lg font-bold text-gray-100">
                {record.title || "Untitled"}
              </div>
            </div>

            {/* Login Field */}
            <div className="group border-b border-white/5 pb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Login</label>
              <div
                className="text-lg font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center justify-between"
                onClick={() => {
                  navigator.clipboard.writeText(record.username || "")
                  toast.success("Login copied")
                }}
                title="Click to Copy"
              >
                <span>{record.username || "—"}</span>
                <Copy className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Password Field */}
            <div className="group border-b border-white/5 pb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Password</label>
              <div className="flex items-center gap-4 py-2 hover:bg-white/5 rounded-lg pr-4 -ml-4 pl-4 transition-colors">
                <div
                  className={`flex-1 font-mono text-xl tracking-tight cursor-pointer ${showPasswordInDetails ? 'text-white font-bold' : 'text-gray-500 font-bold overflow-hidden'} hover:text-blue-400`}
                  onClick={() => {
                      navigator.clipboard.writeText(record.password || "");
                      toast.success("Password copied");
                  }}
                  title="Click to Copy"
                  style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                >
                  {showPasswordInDetails ? record.password : "••••••••••••"}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPasswordInDetails(!showPasswordInDetails)
                  }}
                  className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                >
                  {showPasswordInDetails ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>

              {/* Strength Meter - Keeper Style */}
              <div className="mt-4 space-y-1.5">
                <div className={`h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex gap-0.5`}>
                  <div className={`h-full bg-green-500 w-[95%] rounded-full`} />
                </div>
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Strong</p>
              </div>
            </div>

            {/* Website Field */}
            {record.website && (
              <div className="group border-b border-white/5 pb-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Website Address</label>
                <a
                  href={record.website.startsWith("http") ? record.website : `https://${record.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-blue-500 hover:text-blue-400 flex items-center gap-2 group/link"
                >
                  <span className="truncate">{record.website}</span>
                  <ExternalLink className="h-4 w-4 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                </a>
              </div>
            )}

            {/* Picture Field - Show uploaded image */}
            {(record.image || record.picture) && (
              <div className="group">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4">Picture</label>
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 group-hover:border-blue-500/50 transition-all cursor-pointer shadow-2xl" onClick={() => handleViewPicture(record)}>
                  <img
                    src={record.image || record.picture}
                    alt={record.title || "Password"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Attachments - Keeper Style */}
          <div className="max-w-4xl pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Attachments</h3>
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) handleAddAttachment(record.id, file);
                    };
                    input.click();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${theme === 'light' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Attachment
                </button>
              </div>
              
              <div className="space-y-3">
                {(record.attachments || []).map((att: any) => (
                  <div key={att.id} className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 font-bold text-[10px]">{att.type || 'DOC'}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-200">{att.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">{att.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => toast.success(`Downloading ${att.name}...`)}
                         className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-blue-400 transition-all"
                         title="Download"
                       >
                         <Download className="h-5 w-5" />
                       </button>
                       <button 
                         onClick={() => handleDeleteAttachment(record.id, att.id)}
                         className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                         title="Remove"
                       >
                         <Trash className="h-4 w-4" />
                       </button>
                    </div>
                  </div>
                ))}
                
                {(!record.attachments || record.attachments.length === 0) && (
                  <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                     <Paperclip className="h-8 w-8 text-gray-600 mx-auto mb-2 opacity-20" />
                     <p className="text-xs text-gray-500 font-medium">No attachments yet</p>
                  </div>
                )}
              </div>
          </div>

          {/* Custom Fields Section */}
          {record.item_metadata?.customFields && record.item_metadata.customFields.length > 0 && (
            <div className="max-w-4xl pt-8 border-t border-white/5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Custom Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {record.item_metadata.customFields.map((field: any) => (
                  <div key={field.id} className="group border-b border-white/5 pb-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{field.label}</label>
                    <div className="flex items-center gap-2 group/field">
                      <div
                        className={`flex-1 text-sm font-medium ${field.type === 'password' || field.type === 'pin' || field.type === 'hidden' ? 'font-mono' : ''} text-gray-200 transition-colors cursor-pointer group-hover/field:text-blue-400`}
                        onClick={() => {
                            navigator.clipboard.writeText(field.value || "");
                            toast.success(`${field.label} copied`);
                        }}
                        title="Click to Copy"
                        style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                      >
                        {(field.type === 'password' || field.type === 'pin' || field.type === 'hidden')
                          ? (activePasswordPopup === `custom-${field.id}` ? (
                            <span className="text-white">{field.value}</span>
                          ) : "••••••••")
                          : field.value || "—"}
                      </div>

                      {(field.type === 'password' || field.type === 'pin' || field.type === 'hidden') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActivePasswordPopup(activePasswordPopup === `custom-${field.id}` ? null : `custom-${field.id}`)
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                        >
                          {activePasswordPopup === `custom-${field.id}` ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      )}

                      <button
                        onClick={() => {
                            navigator.clipboard.writeText(field.value || "");
                            toast.success(`${field.label} copied`);
                        }}
                        className="p-1.5 opacity-0 group-hover/field:opacity-100 transition-opacity text-blue-500 hover:bg-blue-500/10 rounded-lg"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Notes */}
          {record.notes && (
            <div className="max-w-4xl pt-8 border-t border-white/5 mb-20">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4">Note</label>
              <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-gray-50' : 'bg-white/5'} text-sm whitespace-pre-wrap text-gray-200 leading-relaxed font-medium border border-white/5`}>
                {record.notes}
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
        {/* Left Side: Folder/List - HIDE COMPLETELY when password selected for "Full Page" mode */}
        <div className={`md:w-1/3 border-r border-gray-100 dark:border-gray-800 pr-2 overflow-y-auto ${selectedRecord ? 'hidden' : 'block'} w-full md:max-w-[33%]`}>
          <div className="space-y-2">
            {/* Folder structure */}
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

                {/* Favorites Virtual Folder */}
                <div
                  className={`flex items-center py-3 px-2 cursor-pointer rounded-lg transition-colors ${favoriteFilter ? 'bg-blue-600/20 dark:bg-blue-600/30' : theme === "light" ? "hover:bg-gray-50" : "hover:bg-white/5"}`}
                  onClick={() => {
                    setFavoriteFilter(true)
                    setArchivedFilter(false)
                    setTimeFilter('all')
                    setCategoryFilter('all')
                    setSelectedFolder("")
                    setSelectedRecord(null)
                  }}
                >
                  <Star className="h-6 w-6 mr-3 text-yellow-400" fill={favoriteFilter ? "currentColor" : "none"} />
                  <div className="flex-1">
                    <div className={`font-semibold ${favoriteFilter ? 'text-blue-400' : theme === "light" ? "text-gray-900" : "text-gray-100"}`}>Favorites</div>
                    <span className="text-xs text-gray-300">
                      {passwords.filter(p => p.is_favorite || p.isFavorite).length} Records
                    </span>
                  </div>
                </div>

                <div
                  className={`flex items-center py-3 px-2 cursor-pointer rounded-lg transition-colors ${!selectedFolder && !favoriteFilter && !archivedFilter && timeFilter === 'all' ? 'bg-blue-600/20 dark:bg-blue-600/30' : theme === "light" ? "hover:bg-gray-50" : "hover:bg-white/5"}`}
                  onClick={() => {
                    setSelectedFolder("")
                    setFavoriteFilter(false)
                    setArchivedFilter(false)
                    setTimeFilter('all')
                    setSelectedRecord(null)
                  }}
                >
                  <Folder className="h-6 w-6 mr-3 text-gray-400" />
                  <div className="flex-1">
                    <div className={`font-semibold ${!selectedFolder && !favoriteFilter && !archivedFilter && timeFilter === 'all' ? 'text-blue-400' : theme === "light" ? "text-gray-900" : "text-gray-100"}`}>No Folder</div>
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

        {/* Right Side: Details Pane - FULL WIDTH when record selected */}
        <div className={`h-full w-full ${selectedRecord ? 'md:w-full' : 'md:w-2/3'} md:pl-2 ${selectedRecord || selectedFolder ? 'block px-2' : 'hidden md:block'}`}>
          {selectedRecord ? renderRecordDetails(selectedRecord) : selectedFolder ? renderFolderDetail(selectedFolder) : renderRecordDetails(null)}
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
    <div className={`space-y-4 px-2 md:px-4 pb-10 relative h-full flex flex-col overflow-visible ${isFullscreen ? 'fixed inset-0 z-[10000] bg-background p-4 md:p-8' : ''}`}>
      {renderAZSidebar()}

      {/* COMPACT HEADER: Always visible, integrated search and counts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-white/5 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Mobile Back Button - ONLY on mobile when record selected OR folder selected */}
          {(selectedRecord || selectedFolder) && (
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedRecord) setSelectedRecord(null);
                  else setSelectedFolder("");
                }}
                className={`p-1.5 rounded-xl transition-all ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-gray-300'} flex items-center gap-2 pr-3`}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-tight">
                  {selectedRecord ? "Back" : "Folders"}
                </span>
              </button>
            </div>
          )}

          {/* Vault Title - Visible always on desktop, and on mobile when no record selected */}
          <div className={`flex-shrink-0 ${selectedRecord ? 'hidden md:block' : 'block'}`}>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Vault</h1>
            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${theme === "light" ? "text-gray-400" : "text-gray-500"} flex items-center gap-1.5 sm:gap-2 flex-wrap`}>
              <span>{passwords.length} Records</span>
              <span className="opacity-30">•</span>
              <span>{records.filter(r => r.type === 'note' || r.type === 'secure-note' || r.category === 'Secure Notes').length} Notes</span>
              <span className="opacity-30">•</span>
              <span>{folders.length} Folders</span>
            </div>
          </div>

          {/* Search bar integrated on the same line */}
          <div className="flex-1 max-w-xl hidden sm:block">
             <div className="relative w-full">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}
              />
              <input
                type="text"
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-10 py-2 rounded-xl text-sm ${theme === "light" ? "bg-white text-gray-900 border-gray-200" : "bg-white/5 text-white border-white/5"} border focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === "light" ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-gray-200"}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {!selectedRecord && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setAddPasswordModalOpen(true)}
                className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded-lg transition-all text-[10px] sm:text-[11px] font-bold uppercase tracking-tight shadow-md whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Password
              </button>
              <button
                onClick={() => setAddFolderModalOpen(true)}
                className={`flex items-center ${theme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'} px-2.5 py-1.5 rounded-lg transition-all text-[10px] sm:text-[11px] font-bold uppercase tracking-tight shadow-sm whitespace-nowrap`}
              >
                <Plus className="h-3.5 w-3.5 mr-1 text-blue-400" />
                Folder
              </button>

              {/* Categories Dropdown Container */}
              <div className="relative" ref={activeMenu === 'categories-header' ? menuRef : null}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === 'categories-header' ? null : 'categories-header');
                  }}
                  className={`flex items-center ${theme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'} px-2.5 py-1.5 rounded-lg transition-all text-[10px] sm:text-[11px] font-bold uppercase tracking-tight shadow-sm whitespace-nowrap`}
                >
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  {favoriteFilter ? 'Favorites' : archivedFilter ? 'Archived' : timeFilter === 'recent' ? 'Recent' : categoryFilter !== 'all' ? categoryFilter : 'Categories'}
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${activeMenu === 'categories-header' ? 'rotate-180' : ''}`} />
                </button>

                {/* Categories Floating Dropdown Menu */}
                {activeMenu === 'categories-header' && (
                  <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-white/10'}`}>
                    <div className="p-1.5 space-y-0.5">
                      {[
                        { name: 'All Items', icon: Folder, count: passwords.length, color: 'text-blue-500', action: () => { setFavoriteFilter(false); setArchivedFilter(false); setTimeFilter('all'); setCategoryFilter('all'); setSelectedFolder(""); } },
                        { name: 'Favorites', icon: Star, count: passwords.filter(p => p.is_favorite || p.isFavorite).length, color: 'text-yellow-500', action: () => { setFavoriteFilter(true); setArchivedFilter(false); setTimeFilter('all'); setCategoryFilter('all'); setSelectedFolder(""); } },
                        { name: 'Recent', icon: RotateCcw, count: Math.min(10, passwords.length), color: 'text-purple-500', action: () => { setTimeFilter('recent'); setFavoriteFilter(false); setArchivedFilter(false); setCategoryFilter('all'); setSelectedFolder(""); } },
                        { name: 'Archived', icon: Archive, count: passwords.filter(p => p.is_archived || p.isArchived).length, color: 'text-green-500', action: () => { setArchivedFilter(true); setFavoriteFilter(false); setTimeFilter('all'); setCategoryFilter('all'); setSelectedFolder(""); } },
                      ].map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => {
                            cat.action();
                            setActiveMenu(null);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/5 text-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <cat.icon className={`h-4 w-4 ${cat.color}`} fill={(cat.name === 'Favorites' && favoriteFilter) || (cat.name === 'Archived' && archivedFilter) ? 'currentColor' : 'none'} />
                            <span className="font-semibold">{cat.name}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-white/10 text-gray-400'}`}>{cat.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Expand/Collapse All Button - MOVED TO LAST POSITION */}
              <button
                onClick={handleToggleAllFolders}
                className={`flex items-center justify-center ${theme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'} px-2 py-1.5 rounded-lg transition-all shadow-sm`}
                title="Expand/Collapse All Folders"
              >
                {folders.some(f => !expandedFolders[f.id]) ? (
                  <ChevronsDown className="h-4 w-4 text-blue-400" />
                ) : (
                  <ChevronsUp className="h-4 w-4 text-blue-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH - Only visible on small screens when no record selected */}
      {!selectedRecord && (
        <div className="sm:hidden relative w-full px-2">
          <Search className={`absolute left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`} />
          <input
            type="text"
            placeholder="Search vault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm ${theme === "light" ? "bg-white text-gray-900 border-gray-200" : "bg-white/5 text-white border-white/5"} border focus:outline-none shadow-sm`}
          />
        </div>
      )}

      {/* FILTERS & CONTENT GRID */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 mt-2">
        {/* Left Side: Navigation / List (Hidden when record selected OR folder selected on mobile) */}
            <div className={`w-full md:w-1/3 lg:w-1/4 flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar ${(selectedRecord || selectedFolder) ? 'hidden md:flex' : 'flex'}`}>
              {/* Folder Navigation / Categories Accordion */}
              <div className={`rounded-2xl overflow-hidden border shadow-sm ${theme === "light" ? "bg-white border-gray-200" : "bg-[#1a1a1a] border-white/5"}`}>
                <Accordion 
                  type="single" 
                  collapsible 
                  className="w-full" 
                  value={isCategoriesExpanded ? "categories" : ""}
                  onValueChange={(val) => setIsCategoriesExpanded(val === "categories")}
                >
                  <AccordionItem value="categories" className="border-none">
                    <AccordionTrigger 
                      className="px-4 py-3 hover:bg-white/5 hover:no-underline transition-all"
                    >
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-left">Categories</h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-2">
                      <div className="grid grid-cols-1 gap-1">
                        {[
                          { name: 'All Items', icon: Folder, count: passwords.length, color: 'text-blue-500', action: () => { setFavoriteFilter(false); setArchivedFilter(false); setTimeFilter('all'); setCategoryFilter('all'); setSelectedFolder(""); } },
                          { name: 'Favorites', icon: Star, count: passwords.filter(p => p.is_favorite || p.isFavorite).length, color: 'text-yellow-500', action: () => { setFavoriteFilter(true); setArchivedFilter(false); setTimeFilter('all'); setCategoryFilter('all'); setSelectedFolder(""); } },
                          { name: 'Recent', icon: RotateCcw, count: Math.min(10, passwords.length), color: 'text-purple-500', action: () => { setTimeFilter('recent'); setFavoriteFilter(false); setArchivedFilter(false); setCategoryFilter('all'); setSelectedFolder(""); } },
                          { name: 'Archived', icon: Archive, count: passwords.filter(p => p.is_archived || p.isArchived).length, color: 'text-green-500', action: () => { setArchivedFilter(true); setFavoriteFilter(false); setTimeFilter('all'); setCategoryFilter('all'); setSelectedFolder(""); } },
                        ].map((cat) => (
                          <button 
                           key={cat.name}
                           onClick={cat.action}
                           className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${theme === 'light' ? 'hover:bg-gray-50 text-gray-700' : 'hover:bg-white/5 text-gray-300'}`}
                          >
                            <div className="flex items-center gap-3">
                              <cat.icon className={`h-4 w-4 ${cat.color}`} fill={(cat.name === 'Favorites' && (favoriteFilter)) || (cat.name === 'Archived' && (archivedFilter)) ? 'currentColor' : 'none'} />
                              <span className="font-medium">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-white/5 text-gray-400'}`}>{cat.count}</span>
                              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Folder Structure */}
              <div className="flex-1">
                {viewMode === 'folder' ? (
                   <div className="space-y-4">
                     <div className="flex items-center justify-between px-4">
                       <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">My Folders</h3>
                     </div>
                     
                     {/* Root Folder Entry - Enhanced Visibility */}
                     <div className="px-2 mb-2">
                        <div
                         className={`flex items-center cursor-pointer py-3 px-3 rounded-xl transition-all border ${selectedFolder === "no-folder" || selectedFolder === "" ? "bg-blue-600/20 border-blue-500/40 shadow-lg shadow-blue-500/10" : theme === "light" ? "hover:bg-gray-50 border-gray-100" : "hover:bg-white/5 border-white/5"}`}
                         onClick={() => {
                           setSelectedFolder("no-folder")
                           setSelectedRecord(null)
                           setCategoryFilter('all')
                           setFavoriteFilter(false)
                           setArchivedFilter(false)
                         }}
                        >
                          <div className={`p-2 rounded-lg ${selectedFolder === "no-folder" || selectedFolder === "" ? 'bg-blue-500/20' : 'bg-gray-500/10'} mr-3`}>
                             <Folder className={`h-5 w-5 ${selectedFolder === "no-folder" || selectedFolder === "" ? 'text-blue-400' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-bold text-sm ${selectedFolder === "no-folder" || selectedFolder === "" ? 'text-blue-100' : theme === "light" ? "text-gray-900" : "text-gray-100"}`}>No folder (Root)</div>
                            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                              {passwords.filter((p: any) => !p.folder_id).length} Records
                            </div>
                          </div>
                          {(selectedFolder === "no-folder" || selectedFolder === "") && <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
                        </div>
                     </div>

                     {renderFolderStructure(folders.filter((f: any) => !f.parent_id), getFilteredPasswords(true))}
                   </div>
                ) : (
                  <div className="space-y-2">
                     {renderPasswordRows()}
                  </div>
                )}
              </div>
            </div>

        {/* Right Side: Details / Main View (Full-page when record selected) */}
        <div className={`flex-1 h-full overflow-hidden ${selectedRecord ? 'relative' : ''}`}>
           {selectedRecord ? (
              <div className="h-full w-full animate-in fade-in slide-in-from-right-4 duration-300">
                {renderRecordDetails(selectedRecord)}
              </div>
           ) : viewMode === "list" ? (
             <div className="h-full flex flex-col gap-4">
                <div className={`flex-1 rounded-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/5'} overflow-hidden shadow-sm`}>
                    <div className="overflow-x-auto h-full scrollbar-hide">
                      <table className="w-full text-left text-sm table-fixed">
                        <thead className={`${theme === "light" ? "bg-gray-50 text-gray-600" : "bg-white/5 text-gray-400"} sticky top-0 z-10 font-bold uppercase text-[10px] tracking-wider`}>
                          <tr>
                            <th className="py-4 px-6 w-full md:w-auto">Record Title</th>
                            <th className="py-4 px-6 hidden md:table-cell w-48">Username</th>
                            <th className="py-4 px-6 hidden lg:table-cell w-32 text-right">Updated</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === "light" ? "divide-gray-100" : "divide-white/5"}`}>
                          {renderPasswordRows()}
                        </tbody>
                      </table>
                      {getFilteredPasswords().length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-50">
                          <Search className="h-12 w-12 mb-4" />
                          <p className="font-bold">No records matched your search</p>
                          <p className="text-xs">Try searching for a different keyword</p>
                        </div>
                      )}
                    </div>
                </div>
             </div>
           ) : viewMode === "grid" ? (
             <div className="h-full overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                  {renderPasswordGrid()}
                </div>
             </div>
           ) : (
             <div className="h-full">
               {selectedFolder ? renderFolderDetail(selectedFolder) : (
                 <div className="h-full flex items-center justify-center opacity-20">
                    <Folder className="h-24 w-24" />
                 </div>
               )}
             </div>
           )}
        </div>
      </div>

      {/* MODALS */}
      {addPasswordModalOpen && (
        <AddPasswordModal
          onClose={() => setAddPasswordModalOpen(false)}
          onAdd={async (item: any) => {
            await handleAddPassword(item);
            setInitialFolderId("");
          }}
          folders={folders}
          theme={theme}
          initialFolderId={initialFolderId}
        />
      )}
      {addFolderModalOpen && (
        <AddFolderModal
          onClose={() => setAddFolderModalOpen(false)}
          onAdd={handleAddFolder}
          folders={folders}
          theme={theme}
          initialParentId={initialParentFolderId}
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
      {editPasswordModalOpen && (
        <EditPasswordModal
          onClose={() => setEditPasswordModalOpen(false)}
          onSave={handleSaveEditedPassword}
          passwordData={selectedRecord}
          folders={folders}
          theme={theme}
        />
      )}
      {deleteConfirmModalOpen && (
        <DeleteConfirmationModal
          onClose={() => setDeleteConfirmModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={selectedRecord?.website || selectedRecord?.username || "this password"}
          theme={theme}
        />
      )}
      {autoFillModalOpen && selectedRecord && (
        <AutoFill passwordData={selectedRecord} onClose={() => setAutoFillModalOpen(false)} theme={theme} />
      )}
      {viewPictureModalOpen && selectedRecord && selectedRecord.picture && (
        <ViewPictureModal
          onClose={() => setViewPictureModalOpen(false)}
          picture={selectedRecord.picture}
          passwordName={selectedRecord.website || selectedRecord.username}
          theme={theme}
        />
      )}
      {viewHistoryModalOpen && selectedRecord && (
        <ViewHistoryModal
          record={selectedRecord}
          onClose={() => setViewHistoryModalOpen(false)}
          theme={theme}
        />
      )}
    </div>
  )
}

const ViewHistoryModal = ({ record, onClose, theme }: { record: any, onClose: () => void, theme: string }) => {
  const history = [
    { date: record.created_at, action: "Record Created", details: "Initial entry established" },
    ...(record.updated_at ? [{ date: record.updated_at, action: "Record Updated", details: "Last modification recorded" }] : [])
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-md rounded-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/10'} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <RotateCcw className="h-5 w-5 text-green-400" />
             <h2 className="text-lg font-bold">Record History</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
           {history.map((item, i) => (
             <div key={i} className="flex gap-4 relative">
                {i < history.length - 1 && <div className="absolute left-2.5 top-6 bottom-[-24px] w-px bg-white/10" />}
                <div className="h-5 w-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center z-10 mt-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold text-gray-100">{item.action}</p>
                   <p className="text-[10px] uppercase font-bold text-gray-500 mt-0.5 tracking-wider">
                     {new Date(item.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                   </p>
                   <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{item.details}</p>
                </div>
             </div>
           ))}
           {history.length === 0 && (
             <div className="py-10 text-center opacity-30">
                <RotateCcw className="h-10 w-10 mx-auto mb-2" />
                <p>No history records found</p>
             </div>
           )}
        </div>
        <div className="px-6 py-4 bg-black/20 border-t border-white/5 text-center">
            <button onClick={onClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all w-full shadow-lg shadow-blue-600/20">Done</button>
        </div>
      </div>
    </div>
  )
}

