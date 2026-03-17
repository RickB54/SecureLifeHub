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
  Copy,
  Eye,
  EyeOff,
  Star,
  FileText,
  Download,
  Sliders,
} from "lucide-react"
import { toast } from "sonner"
import AddFinancialCardModal from "./modals/add-financial-card-modal"
import EditFinancialCardModal from "./modals/edit-financial-card-modal"
import DeleteConfirmationModal from "./modals/delete-confirmation-modal"
import ViewFinancialCardModal from "./modals/view-financial-card-modal"

interface FinancialCard {
  id: string
  title: string
  type: string
  item_metadata?: {
    cardType?: string
    name?: string
    cardNumber?: string
    expiry?: string
    cvv?: string
    cardColor?: string
    custom_fields?: any[]
  }
  is_archived?: boolean
  is_favorite?: boolean
  updatedAt?: string
  // Flattened properties for internal use
  cardType?: string
  name?: string
  cardNumber?: string
  expiry?: string
  cvv?: string
  cardColor?: string
  custom_fields?: any[]
}

interface FinancialCardsProps {
  records: any[]
  addItem: (item: any) => Promise<void>
  updateItem: (id: string, item: any) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}

export default function FinancialCards({ records, addItem, updateItem, deleteItem }: FinancialCardsProps) {
  // State for view mode (grid or list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid") // Default to grid view

  // State for filters
  const [typeFilter, setTypeFilter] = useState("all")
  const [expiryFilter, setExpiryFilter] = useState("all")
  const [showArchived, setShowArchived] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showExpiryFilterMenu, setShowExpiryFilterMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // State for modals
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<FinancialCard | null>(null)

  // State for card actions menu
  const [activeMenu, setActiveMenu] = useState(null)

  // State for visible card numbers
  const [visibleCardNumbers, setVisibleCardNumbers] = useState<Record<string, boolean>>({})

  // Ref for clicking outside to close menus
  const menuRef = useRef<HTMLDivElement>(null)

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

  // Get and normalize financial card records
  const cardRecords = (records || [])
    .filter((record) => record.type === "financial-card")
    .map(record => ({
      ...record,
      // Flatten metadata for easier access
      cardType: record.item_metadata?.cardType || "credit",
      name: record.item_metadata?.name || "",
      cardNumber: record.item_metadata?.cardNumber || "",
      expiry: record.item_metadata?.expiry || "",
      cvv: record.item_metadata?.cvv || "",
      cardColor: record.item_metadata?.cardColor || "",
      custom_fields: record.item_metadata?.custom_fields || [],
    }))

  // Toggle card number visibility
  const toggleCardNumberVisibility = (id: string) => {
    setVisibleCardNumbers({
      ...visibleCardNumbers,
      [id]: !visibleCardNumbers[id],
    })
    console.log("Card number toggled")
  }

  // Add a function to filter cards based on selected filters
  const getFilteredCards = () => {
    let filtered = cardRecords.filter(c => showArchived ? c.is_archived : !c.is_archived)

    // Filter by type
    if (typeFilter !== "all") {
      if (typeFilter === "favorites") {
        filtered = filtered.filter((card) => card.is_favorite)
      } else if (typeFilter === "mastercard") {
        filtered = filtered.filter((card) => {
          return card.title?.toLowerCase().includes("mastercard") || card.cardType?.toLowerCase() === "mastercard"
        })
      } else if (typeFilter === "visa") {
        filtered = filtered.filter((card) => {
          return card.title?.toLowerCase().includes("visa") || card.cardType?.toLowerCase() === "visa"
        })
      } else if (typeFilter === "amex") {
        filtered = filtered.filter((card) => {
          return (
            card.title?.toLowerCase().includes("amex") ||
            card.title?.toLowerCase().includes("american express") ||
            card.cardType?.toLowerCase() === "amex"
          )
        })
      } else if (typeFilter === "debit") {
        filtered = filtered.filter((card) => {
          return (
            card.title?.toLowerCase().includes("debit") ||
            card.type?.toLowerCase() === "debit" ||
            card.cardType?.toLowerCase() === "debit"
          )
        })
      } else {
        filtered = filtered.filter((card) => card.cardType === typeFilter)
      }
    }

    // Filter by expiry
    if (expiryFilter !== "all") {
      const now = new Date()
      const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())

      if (expiryFilter === "expiring-soon") {
        filtered = filtered.filter((card) => {
          if (!card.expiry) return false

          const [month, year] = card.expiry.split("/")
          const expiryDate = new Date(2000 + Number.parseInt(year), Number.parseInt(month) - 1, 1)

          return expiryDate <= threeMonthsFromNow && expiryDate >= now
        })
      }
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (card) =>
          card.title?.toLowerCase().includes(query) ||
          card.name?.toLowerCase().includes(query) ||
          card.cardNumber?.includes(query),
      )
    }

    return filtered.sort((a, b) => {
      // 1. Favorites first
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;

      // 2. Debit cards first within the same favorite status
      const aIsDebit = a.cardType?.toLowerCase().includes('debit') || a.category?.toLowerCase().includes('debit') || a.title?.toLowerCase().includes('debit');
      const bIsDebit = b.cardType?.toLowerCase().includes('debit') || b.category?.toLowerCase().includes('debit') || b.title?.toLowerCase().includes('debit');

      if (aIsDebit && !bIsDebit) return -1;
      if (!aIsDebit && bIsDebit) return 1;

      // 3. Fallback to title
      return (a.title || "").localeCompare(b.title || "");
    });
  }

  // Handle adding new card
  const handleAddCard = async (newCard: any) => {
    // Extract metadata fields
    const { cardNumber, cvv, expiry, cardType, name, title, cardColor, ...rest } = newCard
    const metadata = { cardNumber, cvv, expiry, cardType, name, cardColor }

    await addItem({
      title: title || "New Card",
      type: "financial-card",
      item_metadata: metadata,
      ...rest
    })
    setAddModalOpen(false)
  }

  // Handle deleting a record
  const handleDelete = async (id: string) => {
    await deleteItem(id)
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

  // Handle duplicate
  const handleDuplicate = async (card: FinancialCard) => {
    try {
      console.log("Duplicating card:", card.title)

      // Explicitly construct the metadata from the source card to ensure we have a clean object
      const newMetadata = {
        cardType: card.cardType,
        name: card.name,
        cardNumber: card.cardNumber,
        expiry: card.expiry,
        cvv: card.cvv,
        cardColor: card.cardColor,
        custom_fields: card.custom_fields || []
      }

      await addItem({
        title: `${card.title} (Copy)`,
        type: "financial-card",
        item_metadata: newMetadata
      })
      console.log("Card duplicated successfully")
    } catch (error) {
      console.error("Failed to duplicate card:", error)
    }
  }

  // Handle edit card
  const handleEditCard = (id: string) => {
    const cardToEdit = cardRecords.find((record) => record.id === id)
    setSelectedCard(cardToEdit)
    setEditModalOpen(true)
  }

  // Handle view details
  const handleViewCard = (id: string) => {
    const cardToView = cardRecords.find((record) => record.id === id)
    setSelectedCard(cardToView)
    setViewModalOpen(true)
  }

  // Handle save edited card
  const handleSaveEditedCard = async (updatedData: any) => {
    if (!selectedCard) return

    // Extract metadata fields
    const { cardNumber, cvv, expiry, cardType, name, title, cardColor, ...rest } = updatedData
    const metadata = {
      cardNumber: cardNumber || selectedCard.cardNumber,
      cvv: cvv || selectedCard.cvv,
      expiry: expiry || selectedCard.expiry,
      cardType: cardType || selectedCard.cardType,
      name: name || selectedCard.name,
      cardColor: cardColor || selectedCard.cardColor
    }

    await updateItem(selectedCard.id, {
      title: title || selectedCard.title,
      item_metadata: {
        ...metadata,
        custom_fields: updatedData.custom_fields
      },
      ...rest
    })

    setEditModalOpen(false)
    setSelectedCard(null)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedCard) return
    await deleteItem(selectedCard.id)
    setDeleteConfirmModalOpen(false)
    setSelectedCard(null)
  }

  // Copy card number to clipboard
  const handleCopyCardNumber = (cardNumber: string) => {
    if (!cardNumber) return

    navigator.clipboard
      .writeText(cardNumber)
      .then(() => {
        toast.success("Card number copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy card number:", err)
        toast.error("Failed to copy card number")
      })
  }

  // Handle download card details
  const handleDownloadCard = (card: FinancialCard) => {
    if (!card) return

    const cardData = {
      title: card.title,
      type: card.cardType,
      name: card.name,
      number: card.cardNumber,
      expiry: card.expiry,
      cvv: card.cvv,
      bank:
        card.cardType === "credit" ? "Bank of America" : card.cardType === "debit" ? "Chase Bank" : "American Express",
    }

    const dataStr = JSON.stringify(cardData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${card.title.replace(/\s+/g, "_")}_details.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    console.log("Card details downloaded:", card.title)
  }

  // Get card background color based on type or custom color
  const getCardBackground = (card: any) => {
    if (card.cardColor) {
      return { backgroundColor: card.cardColor }
    }

    const cardBrand = card.title?.toLowerCase().includes("visa")
      ? "visa"
      : card.title?.toLowerCase().includes("mastercard")
        ? "mastercard"
        : card.title?.toLowerCase().includes("amex") || card.title?.toLowerCase().includes("american express")
          ? "amex"
          : "default"

    switch (cardBrand) {
      case "visa":
        return { background: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)" }
      case "mastercard":
        return { background: "linear-gradient(135deg, #991b1b 0%, #450a0a 100%)" }
      case "amex":
        return { background: "linear-gradient(135deg, #854d0e 0%, #422006 100%)" }
      default:
        return { background: "linear-gradient(135deg, #374151 0%, #111827 100%)" }
    }
  }

  // Format card number with dots and last 4 digits
  const formatCardNumber = (number: string, id: string) => {
    if (!number) return "•••• •••• •••• ••••"

    if (visibleCardNumbers[id]) {
      // Format with spaces for readability
      return number.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
    } else {
      const last4 = number.slice(-4)
      return `•••• •••• •••• ${last4}`
    }
  }

  // Get bank name and card type based on card details
  const getBankAndType = (card: any) => {
    if (card.title?.toLowerCase().includes("visa")) {
      return "Bank of America • Visa"
    } else if (card.title?.toLowerCase().includes("mastercard")) {
      return "Bank of America • Mastercard"
    } else if (card.title?.toLowerCase().includes("amex") || card.title?.toLowerCase().includes("american express")) {
      return "American Express • American Express"
    } else if (card.cardType === "credit") {
      return "Bank of America • Mastercard"
    } else if (card.cardType === "debit") {
      return "Chase Bank • Visa"
    } else {
      return "Bank • Card"
    }
  }

  // Render table rows
  const renderTableRows = () => {
    const filteredCards = getFilteredCards()

    if (filteredCards.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="py-4 text-center text-gray-400">
            No cards found. Try changing your filters or adding a new card.
          </td>
        </tr>
      )
    }

    return filteredCards.map((card) => (
      <tr key={card.id} className="border-b border-gray-700">
        <td className="py-3 px-4">{card.cardType}</td>
        <td className="py-3 px-4">{card.title}</td>
        <td className="py-3 px-4">{card.name}</td>
        <td className="py-3 px-4">
          <div className="flex items-center">
            <span 
              className="cursor-pointer hover:text-blue-400 transition-colors" 
              onClick={(e) => {
                e.stopPropagation();
                handleCopyCardNumber(card.cardNumber);
              }}
              title="Click to Copy"
            >
              {formatCardNumber(card.cardNumber, card.id)}
            </span>
            <button className="ml-2 text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); toggleCardNumberVisibility(card.id); }}>
              {visibleCardNumbers[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              className="ml-2 text-gray-400 hover:text-white"
              onClick={() => handleCopyCardNumber(card.cardNumber)}
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </td>
        <td className="py-3 px-4">{card.expiry}</td>
        <td className="py-3 px-4">
          <span className={visibleCardNumbers[card.id] ? "" : "filter blur-sm"}>{card.cvv}</span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center space-x-2">
            <button className="text-blue-400 hover:text-blue-300" onClick={() => handleEditCard(card.id)}>
              <Edit className="h-4 w-4" />
            </button>
            <button
              className={`${card.is_archived ? "text-green-400" : "text-gray-400 hover:text-gray-300"}`}
              onClick={() => handleToggleArchive(card.id)}
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              className="text-red-500 hover:text-red-400"
              onClick={() => {
                setSelectedCard(card)
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
    const filteredCards = getFilteredCards()

    if (filteredCards.length === 0) {
      return (
        <div className="col-span-full py-8 text-center text-gray-400">
          No cards found. Try changing your filters or adding a new card.
        </div>
      )
    }

    return filteredCards.map((card) => {
      // Determine card type for styling
      const cardBrand = card.title?.toLowerCase().includes("visa")
        ? "visa"
        : card.title?.toLowerCase().includes("mastercard")
          ? "mastercard"
          : card.title?.toLowerCase().includes("amex") || card.title?.toLowerCase().includes("american express")
            ? "amex"
            : "credit"

      return (
        <div key={card.id} style={getCardBackground(card)} className="rounded-lg overflow-hidden shadow-lg min-h-[220px] flex flex-col">
          <div className="p-4">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-semibold text-lg">{card.title || "Unnamed Card"}</h3>
              <div className="flex space-x-2">
                <button
                  className={`${card.is_favorite ? "text-yellow-300" : "text-gray-400 hover:text-yellow-300"}`}
                  onClick={() => handleToggleFavorite(card.id)}
                  aria-label={card.is_favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className="h-5 w-5" fill={card.is_favorite ? "currentColor" : "none"} />
                </button>
                <button
                  className="text-gray-400 hover:text-white relative"
                  onClick={() => setActiveMenu(activeMenu === card.id ? null : card.id)}
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>

                {/* Dropdown menu */}
                {activeMenu === card.id && (
                  <div ref={menuRef} className="absolute right-0 mt-8 w-48 bg-[#333] rounded-md shadow-lg py-1 z-10">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-600"
                      onClick={() => {
                        handleEditCard(card.id)
                        setActiveMenu(null)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-600"
                      onClick={() => {
                        handleDuplicate(card)
                        setActiveMenu(null)
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-600"
                      onClick={() => {
                        handleCopyCardNumber(card.cardNumber)
                        setActiveMenu(null)
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Card Number
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-600"
                      onClick={() => {
                        toggleCardNumberVisibility(card.id)
                        setActiveMenu(null)
                      }}
                    >
                      {visibleCardNumbers[card.id] ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide Card Number
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          View Card Number
                        </>
                      )}
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-600"
                      onClick={() => {
                        handleDownloadCard(card)
                        setActiveMenu(null)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-600"
                      onClick={() => {
                        handleToggleArchive(card.id)
                        setActiveMenu(null)
                      }}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      {card.is_archived ? "Unarchive" : "Archive"}
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-red-900 hover:bg-opacity-50"
                      onClick={() => {
                        setSelectedCard(card)
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

            <div 
              className="mb-6 cursor-pointer hover:text-blue-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyCardNumber(card.cardNumber);
              }}
              title="Click to Copy"
            >
              <div className="text-lg font-mono tracking-wider">{formatCardNumber(card.cardNumber, card.id)}</div>
              {visibleCardNumbers[card.id] && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-400">CVV: </span>
                  <span className="font-mono">{card.cvv || "---"}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs text-gray-400">Card Holder</div>
                <div className="font-semibold uppercase">{card.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Expires</div>
                <div>{card.expiry}</div>
              </div>
            </div>
          </div>

          <div className="bg-black bg-opacity-30 p-3">
            <div className="flex justify-between items-center">
              <div className="text-sm">{getBankAndType(card)}</div>
              <div className="flex space-x-2 flex-wrap sm:flex-nowrap">
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => toggleCardNumberVisibility(card.id)}
                  aria-label={visibleCardNumbers[card.id] ? "Hide card number" : "View card number"}
                >
                  {visibleCardNumbers[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => handleViewCard(card.id)}
                  aria-label="View details"
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => handleEditCard(card.id)}
                  aria-label="Edit card"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => handleCopyCardNumber(card.cardNumber)}
                  aria-label="Copy card number"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => handleDownloadCard(card)}
                  aria-label="Download card details"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  className="text-red-500 hover:text-red-400"
                  onClick={() => {
                    setSelectedCard(card)
                    setDeleteConfirmModalOpen(true)
                  }}
                  aria-label="Delete card"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Cards</h1>
          <p className="text-gray-400">Manage your credit and debit cards</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Card
          </button>

          <div className="flex items-center bg-[#333] rounded-md">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "text-[#007bff]" : "text-gray-400 hover:text-white"}`}
              aria-label="List view"
            >
              <ListIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowArchived((prev) => !prev)}
              className={`p-2 ${showArchived ? "text-[#007bff]" : "text-gray-400 hover:text-white"}`}
              title="Show Archived"
            >
              <Archive className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                const showFavs = getFilteredCards().every(c => c.is_favorite)
                // Toggle: if all shown are favorites, show all. Otherwise show only favorites.
                if (showFavs) {
                  // Currently showing favorites, go back to all
                  setTypeFilter("all")
                } else {
                  // Show favorites by using a custom filter
                  setTypeFilter("favorites")
                }
              }}
              className={`p-2 ${typeFilter === "favorites" ? "text-yellow-400" : "text-gray-400 hover:text-white"}`}
              title="Show Favorites"
            >
              <Star className="h-5 w-5" fill={typeFilter === "favorites" ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "text-[#007bff]" : "text-gray-400 hover:text-white"}`}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>



      <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search financial cards..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                console.log("Search applied")
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#333] border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <button
                className="flex items-center justify-between bg-[#333] hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200 min-w-32"
                onClick={() => {
                  setShowFilterMenu(!showFilterMenu)
                  setShowExpiryFilterMenu(false)
                }}
              >
                <span>
                  {typeFilter === "all" ? "All Cards" : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                </span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>

              {showFilterMenu && (
                <div className="absolute z-10 mt-1 w-full bg-[#333] rounded-md shadow-lg py-1">
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${typeFilter === "all" ? "bg-blue-600" : ""}`}
                    onClick={() => {
                      setTypeFilter("all")
                      setShowFilterMenu(false)
                      console.log("Filter applied: All Cards")
                    }}
                  >
                    All Cards
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${typeFilter === "mastercard" ? "bg-blue-600" : ""}`}
                    onClick={() => {
                      setTypeFilter("mastercard")
                      setShowFilterMenu(false)
                      console.log("Filter applied: Mastercard")
                    }}
                  >
                    Mastercard
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${typeFilter === "visa" ? "bg-blue-600" : ""}`}
                    onClick={() => {
                      setTypeFilter("visa")
                      setShowFilterMenu(false)
                      console.log("Filter applied: Visa")
                    }}
                  >
                    Visa
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${typeFilter === "amex" ? "bg-blue-600" : ""}`}
                    onClick={() => {
                      setTypeFilter("amex")
                      setShowFilterMenu(false)
                      console.log("Filter applied: American Express")
                    }}
                  >
                    American Express
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${typeFilter === "debit" ? "bg-blue-600" : ""}`}
                    onClick={() => {
                      setTypeFilter("debit")
                      setShowFilterMenu(false)
                      console.log("Filter applied: Debit")
                    }}
                  >
                    Debit
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="flex items-center justify-between bg-[#333] hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200 min-w-32"
                onClick={() => {
                  setShowExpiryFilterMenu(!showExpiryFilterMenu)
                  setShowFilterMenu(false)
                }}
              >
                <span>
                  {expiryFilter === "all"
                    ? "All Expiry"
                    : expiryFilter === "expiring-soon"
                      ? "Expiring Soon"
                      : "All Expiry"}
                </span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>

              {showExpiryFilterMenu && (
                <div className="absolute z-10 mt-1 w-full bg-[#333] rounded-md shadow-lg py-1">
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${expiryFilter === "all" ? "bg-blue-600" : ""}`}
                    onClick={() => {
                      setExpiryFilter("all")
                      setShowExpiryFilterMenu(false)
                      console.log("Filter applied: All Expiry")
                    }}
                  >
                    All Expiry
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${expiryFilter === "expiring-soon" ? "bg-blue-600" : ""}`}
                    onClick={() => {
                      setExpiryFilter("expiring-soon")
                      setShowExpiryFilterMenu(false)
                      console.log("Filter applied: Expiring Soon")
                    }}
                  >
                    Expiring Soon
                  </button>
                </div>
              )}
            </div>

            <button
              className="bg-[#333] hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
              onClick={() => {
                setTypeFilter("all")
                setExpiryFilter("all")
                setSearchQuery("")
                console.log("Filters reset")
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {
    viewMode === "list" ? (
      <div className="bg-[#2a2a2a] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#333] text-left">
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Title</th>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Card Number</th>
                <th className="py-3 px-4 font-semibold">Expiry</th>
                <th className="py-3 px-4 font-semibold">CVV</th>
                <th className="py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      </div>
    ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderGridItems()}</div>
  )
  }

  {/* Modal */ }
  { addModalOpen && <AddFinancialCardModal onClose={() => setAddModalOpen(false)} onAdd={handleAddCard} /> }

  {/* Edit Card Modal */ }
  {
    editModalOpen && (
      <EditFinancialCardModal
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEditedCard}
        cardData={selectedCard}
      />
    )
  }

  {/* View Card Modal */ }
  {
    viewModalOpen && selectedCard && (
      <ViewFinancialCardModal
        cardData={selectedCard}
        onClose={() => {
          setViewModalOpen(false)
          setSelectedCard(null)
        }}
      />
    )
  }

  {/* Delete Confirmation Modal */ }
  {
    deleteConfirmModalOpen && (
      <DeleteConfirmationModal
        onClose={() => setDeleteConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedCard?.title || "this card"}
      />
    )
  }
    </div >
  )
}
