"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Database,
  Download,
  Upload,
  Shield,
  Clock,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  FileJson,
  AlertCircle,
  Save,
  ChevronDown,
  ChevronUp,
  Trash,
  ChevronRight
} from "lucide-react"
import CsvImporter from "./csv-importer"
import JsonImporter from "./json-importer"
import MockDataGenerator from "./mock-data-generator"
import { VaultItem } from "@/hooks/use-vault"

export default function Settings({
  records,
  items,
  folders,
  addItem,
  addFolder,
  bulkAddItems,
  updateItem,
  deleteItem,
  theme,
  autoLockTimeout,
  setAutoLockTimeout,
  twoFactorEnabled,
  setTwoFactorEnabled
}: {
  records: any[]
  items: any[]
  folders: any[]
  addItem?: any
  addFolder?: any
  bulkAddItems?: any
  updateItem?: any
  deleteItem?: any
  theme?: string
  autoLockTimeout: number
  setAutoLockTimeout: (value: number) => void
  twoFactorEnabled: boolean
  setTwoFactorEnabled: (enabled: boolean) => void
}) {
  // Security audit data (Mock for now, needs real calculation later)
  const [securityAuditData, setSecurityAuditData] = useState({
    score: 36,
    reused: 138,
    lastChange: "11 months ago",
    passwordsData: [],
  })

  // State for master password change
  const [masterPassword, setMasterPassword] = useState("")
  const [confirmMasterPassword, setConfirmMasterPassword] = useState("")

  // State for notification
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  // State for backup/restore
  const [backupFrequency, setBackupFrequency] = useState("daily")

  // State for auto-fill toggle
  const [autoFillEnabled, setAutoFillEnabled] = useState(false)

  // State for Import Tool visibility
  const [showImport, setShowImport] = useState(false)
  const [preferencesItemId, setPreferencesItemId] = useState<string | null>(null)

  // State for import mode
  const [importMode, setImportMode] = useState<"csv" | "json">("json")

  // Load User Preferences on mount
  useEffect(() => {
    // Find preference item
    const prefItem = records.find(r => r.title === "[SYSTEM] User Preferences")
    if (prefItem) {
      setPreferencesItemId(prefItem.id)
      setAutoFillEnabled(prefItem.item_metadata?.auto_fill_enabled === true)
    }
  }, [records]) // Depend on records to re-evaluate if records change

  // Show notification
  const showNotification = (message: string, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message, type: "" })
    }, 3000)
  }

  // Handle toggling 2FA
  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
    showNotification(`Two - factor authentication ${!twoFactorEnabled ? "enabled" : "disabled"} `)
  }

  // Handle saving master password
  const handleSaveMasterPassword = () => {
    if (masterPassword !== confirmMasterPassword) {
      showNotification("Passwords do not match", "error")
      return
    }

    if (masterPassword.length < 8) {
      showNotification("Password must be at least 8 characters", "error")
      return
    }

    // In a real app, this would be hashed and stored securely
    showNotification("Master password updated successfully")
    setMasterPassword("")
    setConfirmMasterPassword("")
  }

  // Handle changing auto-lock timeout
  const handleAutoLockChange = (value: number) => {
    setAutoLockTimeout(value)
  }

  // Handle saving auto-lock timeout
  const handleSaveAutoLock = () => {
    localStorage.setItem("auto_lock_timeout", autoLockTimeout.toString())
    window.dispatchEvent(new CustomEvent('autoLockTimeoutChanged', { detail: { timeout: autoLockTimeout } }))
    showNotification("Auto-lock timeout updated successfully")
  }

  // Handle toggling Auto-Fill
  const handleToggleAutoFill = async () => {
    const newState = !autoFillEnabled
    setAutoFillEnabled(newState)

    try {
      if (preferencesItemId && updateItem) {
        // Update existing item
        // useVault.updateItem merges unknown fields into item_metadata automatically.
        // We pass 'auto_fill_enabled' directly so it ends up in item_metadata, NOT nested inside it.
        await updateItem(preferencesItemId, {
          auto_fill_enabled: newState
        })
        showNotification(`Auto - Fill turned ${newState ? "ON" : "OFF"} `)
      } else if (addItem) {
        // Create new preference item
        // Use type="note" to avoid DB constraint violations.
        const newItem = await addItem({
          title: "[SYSTEM] User Preferences",
          type: "note",
          item_metadata: { auto_fill_enabled: newState, system_type: "user_preferences" }
        })
        if (newItem) {
          setPreferencesItemId(newItem.id)
          showNotification(`Auto - Fill turned ${newState ? "ON" : "OFF"} `)
        }
      }
    } catch (e) {
      console.error(e)
      showNotification("Failed to save setting", "error")
      // Revert state on error
      setAutoFillEnabled(!newState)
    }
  }

  // Handle changing backup frequency
  const handleBackupFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBackupFrequency(e.target.value)
  }

  // Handle saving backup frequency
  const handleSaveBackupFrequency = () => {
    showNotification("Backup frequency updated successfully")
  }

  // Handle backup
  const handleBackup = () => {
    // In a real app, this would create an encrypted backup
    const backup = {
      records: records,
      timestamp: new Date().toISOString(),
    }

    // Create a blob and download it
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `securelifehub - backup - ${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    showNotification("Backup created successfully")
  }

  // Handle restore
  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const result = event.target?.result
        if (typeof result !== 'string') return

        const backup = JSON.parse(result)
        if (backup.records && Array.isArray(backup.records)) {
          // Use bulkAddItems to restore
          if (bulkAddItems) {
            await bulkAddItems(backup.records)
            showNotification(`Backup restored: ${backup.records.length} items added`)
          } else {
            showNotification("Restore capability not available", "error")
          }
        } else {
          showNotification("Invalid backup file", "error")
        }
      } catch (error) {
        showNotification("Error restoring backup", "error")
      }
    }

    reader.readAsText(file)
    e.target.value = "" // Reset the file input
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          ⚙️ Settings
        </h1>
        <p className="text-gray-400">Customize your SecureLifeHub experience</p>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top - 4 right - 4 p - 4 rounded - xl shadow - 2xl z - 50 animate -in slide -in -from - top - 2 ${notification.type === "error"
            ? "bg-gradient-to-r from-red-600 to-red-500 text-white border border-red-400"
            : "bg-gradient-to-r from-green-600 to-emerald-500 text-white border border-green-400"
            } `}
        >
          <div className="flex items-center gap-3">
            {notification.type === "error" ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Security Settings */}
      <div className={`rounded - 2xl p - 8 ${theme === "light" ? "bg-white border-gray-200" : "bg-[#1e1e1e] border-white/10"} border shadow - xl`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-purple-400">
          <Shield className="h-6 w-6" />
          Security Settings
        </h2>

        <div className="space-y-8">
          {/* Master Password */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Master Password
            </h3>
            <p className={`mb - 4 text - sm ${theme === "light" ? "text-gray-600" : "text-gray-400"} `}>
              Set a master password to encrypt your vault. This password will be required to access your vault.
            </p>

            <div className="space-y-4">
              <div>
                <label className={`block mb - 2 font - medium ${theme === "light" ? "text-gray-700" : "text-gray-300"} `}>
                  New Master Password
                </label>
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className={`w - full px - 4 py - 3 rounded - xl transition - all ${theme === "light"
                    ? "border-2 border-gray-300 focus:border-purple-500 text-gray-800 bg-white"
                    : "border-2 border-gray-700 focus:border-purple-500 text-white bg-[#2a2a2a]"
                    } focus: outline - none focus: ring - 2 focus: ring - purple - 500 / 50`}
                  placeholder="Enter new master password"
                />
              </div>

              <div>
                <label className={`block mb - 2 font - medium ${theme === "light" ? "text-gray-700" : "text-gray-300"} `}>
                  Confirm Master Password
                </label>
                <input
                  type="password"
                  value={confirmMasterPassword}
                  onChange={(e) => setConfirmMasterPassword(e.target.value)}
                  className={`w - full px - 4 py - 3 rounded - xl transition - all ${theme === "light"
                    ? "border-2 border-gray-300 focus:border-purple-500 text-gray-800 bg-white"
                    : "border-2 border-gray-700 focus:border-purple-500 text-white bg-[#2a2a2a]"
                    } focus: outline - none focus: ring - 2 focus: ring - purple - 500 / 50`}
                  placeholder="Confirm new master password"
                />
              </div>

              <button
                onClick={handleSaveMasterPassword}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105"
              >
                <Save className="h-5 w-5" />
                Save Master Password
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="pt-6 border-t border-gray-700">
            <h3 className="text-lg font-bold mb-3">Two-Factor Authentication</h3>
            <p className={`mb - 4 text - sm ${theme === "light" ? "text-gray-600" : "text-gray-400"} `}>
              Enable two-factor authentication for an additional layer of security.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={handleToggle2FA}
                className={`relative inline - flex h - 12 w - 24 items - center rounded - full transition - all ${twoFactorEnabled ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-600"
                  } `}
              >
                <span
                  className={`inline - block h - 10 w - 10 transform rounded - full bg - white shadow - lg transition - transform ${twoFactorEnabled ? "translate-x-12" : "translate-x-1"
                    } `}
                />
              </button>
              <span className={`font - medium ${twoFactorEnabled ? "text-green-400" : "text-gray-400"} `}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          {/* Auto-Fill Settings */}
          <div className="pt-6 border-t border-gray-700">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <ToggleRight className="h-5 w-5" />
              Auto-Fill Settings
            </h3>
            <p className={`mb - 4 text - sm ${theme === "light" ? "text-gray-600" : "text-gray-400"} `}>
              Control whether the SecureLifeHub extension can automatically fill your passwords.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleAutoFill}
                className={`relative inline - flex h - 12 w - 24 items - center rounded - full transition - all ${autoFillEnabled ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gray-600"
                  } `}
              >
                <span
                  className={`inline - block h - 10 w - 10 transform rounded - full bg - white shadow - lg transition - transform ${autoFillEnabled ? "translate-x-12" : "translate-x-1"
                    } `}
                />
              </button>
              <span className={`font - medium ${autoFillEnabled ? "text-blue-400" : "text-gray-400"} `}>
                {autoFillEnabled ? "Auto-Fill ON" : "Auto-Fill OFF"}
              </span>
            </div>
            {!autoFillEnabled && (
              <p className="text-xs text-yellow-500 mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                Note: You will need to manually copy/paste passwords when this is off.
              </p>
            )}
          </div>

          {/* Auto-Lock Timeout */}
          <div className="pt-6 border-t border-gray-700">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Auto-Lock Timeout
            </h3>
            <p className={`mb - 4 text - sm ${theme === "light" ? "text-gray-600" : "text-gray-400"} `}>
              Set the time (in minutes) after which the vault will automatically lock.
            </p>

            <div className="flex items-center gap-4">
              <select
                value={autoLockTimeout}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAutoLockChange(parseInt(e.target.value))}
                className={`flex - 1 px - 4 py - 3 rounded - xl transition - all ${theme === "light"
                  ? "border-2 border-gray-300 focus:border-blue-500 text-gray-800 bg-white"
                  : "border-2 border-gray-700 focus:border-blue-500 text-white bg-[#2a2a2a]"
                  } focus: outline - none focus: ring - 2 focus: ring - blue - 500 / 50`}
              >
                <option value={5}>5 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={0}>Disabled</option>
              </select>
              <button
                onClick={handleSaveAutoLock}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
              >
                <Save className="h-5 w-5" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Module Access Control */}
      <div className={`${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded - lg p - 6 shadow - md`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Module Access Control
        </h2>
        <p className={`mb - 6 ${theme === "light" ? "text-gray-600" : "text-gray-400"} `}>
          Lock specific sections of the application with a numeric PIN for enhanced privacy.
        </p>

        <ModuleAccessSettings theme={theme || "dark"} />
      </div>

      {/* Backup & Restore */}
      <div className={`${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded - lg p - 6 shadow - md`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Backup & Restore
        </h2>


        <div className="space-y-6">
          {/* Backup Frequency */}
          <div>
            <h3 className="text-lg font-medium mb-2">Backup Frequency</h3>
            <p className={`mb - 4 ${theme === "light" ? "text-gray-600" : "text-gray-400"} `}>
              Set how often you want to be reminded to backup your vault.
            </p>

            <div className="flex items-center space-x-4">
              <select
                value={backupFrequency}
                onChange={handleBackupFrequencyChange}
                className={`px - 3 py - 2 rounded - md ${theme === "light"
                  ? "border border-gray-300 focus:border-blue-500 text-gray-800 bg-white"
                  : "border border-gray-600 focus:border-blue-500 text-white bg-[#333]"
                  } focus: outline - none`}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never</option>
              </select>
              <button
                onClick={handleSaveBackupFrequency}
                className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                <Save className="h-5 w-5 mr-2" />
                Save
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleBackup}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              <Database className="h-5 w-5 mr-2" />
              Create Backup
            </button>

            {/* Restore hidden/disabled as it requires specific format */}
          </div>
        </div>

        {/* Import Data */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Import Data</h3>
            <button
              onClick={() => setShowImport(!showImport)}
              className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
            >
              {showImport ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
              {showImport ? "Hide Import Tool" : "Show Import Tool"}
            </button>
          </div>

          {showImport && (
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setImportMode("json")}
                  className={`px - 4 py - 2 rounded ${importMode === "json" ? "bg-yellow-600 text-white" : "bg-gray-700 text-gray-300"} `}
                >
                  JSON (Recommended)
                </button>
                <button
                  onClick={() => setImportMode("csv")}
                  className={`px - 4 py - 2 rounded ${importMode === "csv" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"} `}
                >
                  CSV
                </button>
              </div>

              {importMode === "json" ? (
                <JsonImporter
                  onImport={async (items) => {
                    try {
                      if (bulkAddItems) {
                        // Batch import in chunks of 50 to avoid payload limits
                        const chunkSize = 50
                        for (let i = 0; i < items.length; i += chunkSize) {
                          const chunk = items.slice(i, i + chunkSize)
                          await bulkAddItems(chunk)
                        }
                        showNotification(`Successfully imported ${items.length} items from JSON`, "success")
                      }
                      setShowImport(false)
                    } catch (e) {
                      console.error(e)
                      showNotification("Import failed", "error")
                    }
                  }}
                  addFolder={addFolder}
                  folders={folders}
                />
              ) : (
                <CsvImporter
                  onImport={async (items) => {
                    try {
                      await bulkAddItems?.(items)
                      setShowImport(false)
                    } catch (e) {
                      console.error(e)
                    }
                  }}
                  bulkAddItems={bulkAddItems}
                  addFolder={addFolder}
                  folders={folders}
                />
              )}
            </div>
          )}
        </div>

        {/* Mock Data Section */}
        <div className="border-t border-gray-700 pt-6 mt-6">
          <MockDataGenerator bulkAddItems={bulkAddItems} />

          <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium mb-2 text-red-400">Danger Zone</h3>
            <button
              onClick={async () => {
                if (!confirm("Are you sure you want to delete all MOCK data?")) return;

                if (!deleteItem) {
                  showNotification("Delete capability not available", "error")
                  return
                }

                // Filter mock items
                // Criteria: metadata is_mock OR title starts with [MOCK] OR notes contains "Mock medication"
                const mockItems = records.filter(
                  (item) =>
                    item?.item_metadata?.is_mock ||
                    item?.title?.startsWith("[MOCK]") ||
                    item?.title?.startsWith("Test Med") ||
                    // Catch mock medications via their specific note signature
                    item?.item_metadata?.notes?.includes("Mock medication for testing") ||
                    item?.website?.startsWith("[MOCK]") ||
                    item?.username?.startsWith("user_mock_") ||
                    // Catch existing generated mock data by common title prefixes
                    (item?.title && (
                      item.title.startsWith("Login Service") ||
                      item.title.startsWith("Credit Card") ||
                      item.title.startsWith("Contact") ||
                      item.title.startsWith("Address") ||
                      item.title.startsWith("Bank Account") ||
                      item.title.startsWith("Driver's License") ||
                      item.title.startsWith("Database Prod") ||
                      item.title.startsWith("Server Node") ||
                      item.title.startsWith("Health Insurance") ||
                      item.title.startsWith("Membership") ||
                      item.title.startsWith("Secure Note") ||
                      item.title.startsWith("Passport") ||
                      item.title.startsWith("National ID") ||
                      item.title.startsWith("Adobe Suite") ||
                      item.title.startsWith("SSH Key") ||
                      item.title.startsWith("Wifi Password") ||
                      item.title.startsWith("Birth Certificate")
                    ))
                )

                if (mockItems.length === 0) {
                  showNotification("No mock data found to delete", "error")
                  return
                }

                let deletedCount = 0
                try {
                  showNotification(`Deleting ${mockItems.length} mock items...`, "success")

                  // Execute deletions in parallel for speed, or sequential if rate limits concern
                  // Sequential is safer for UI feedback and errors
                  // Execute deletions in parallel for speed
                  await Promise.all(mockItems.map(async (item) => {
                    try {
                      await deleteItem(item.id, item.type || (item.item_metadata?.type || "item"))
                      deletedCount++
                    } catch (e) { console.error(e) }
                  }))

                  showNotification(`Successfully deleted ${deletedCount} mock items`, "success")
                } catch (error) {
                  console.error("Error deleting mock data:", error)
                  showNotification(`Error: Deleted ${deletedCount} of ${mockItems.length} items`, "error")
                }
              }}
              className="flex items-center text-red-400 hover:text-red-300 transition duration-200"
            >
              <Database className="h-5 w-5 mr-2" />
              Delete All Mock Data
            </button>
          </div>
        </div>
      </div >

      {/* Danger Zone */}
      <div className={`p - 4 rounded - lg border ${theme === "light" ? "bg-red-50 border-red-200" : "bg-red-900/10 border-red-900/30"} `}>
        <h3 className="text-lg font-medium text-red-600 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Danger Zone
        </h3>

        <div className="space-y-4">
          <p className={`text - sm ${theme === "light" ? "text-gray-600" : "text-gray-400"} `}>
            These actions are irreversible. Please be certain before proceeding.
          </p>

          {/* Granular Delete Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: "Delete Vault Data", types: ["password", "login", "card", "financial-card", "note", "contact"] },
              { label: "Delete Health & Fitness", types: ["health-record", "fitness"] },
              { label: "Delete Vehicles", types: ["vehicle", "transport"] },
              { label: "Delete Business", types: ["business", "project"] },
              { label: "Delete Assets", types: ["asset", "inventory"] },
              { label: "Delete Media", types: ["media", "memory"] },
              { label: "Delete Goals", types: ["goal", "planning"] },
              { label: "Delete Digital Life", types: ["digital-life"] },
              { label: "Delete Knowledge Base", types: ["knowledge", "education"] },
            ].map((action) => (
              <button
                key={action.label}
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to ${action.label}? This cannot be undone.`)) {
                    const targetTypes = action.types
                    const itemsToDelete = records.filter(r => targetTypes.includes(r.type || r.item_metadata?.type))

                    if (itemsToDelete.length === 0) {
                      alert("No items found to delete.")
                      return
                    }

                    const count = itemsToDelete.length
                    if (window.confirm(`Found ${count} items.Confirm delete? `)) {
                      // Bulk delete using Promise.all for now as no bulk endpoint exists
                      // Execute in batches of 10 to prevent overwhelming the server
                      if (deleteItem) {
                        const batchSize = 10
                        for (let i = 0; i < itemsToDelete.length; i += batchSize) {
                          const batch = itemsToDelete.slice(i, i + batchSize)
                          await Promise.all(batch.map(item => deleteItem(item.id, item.type || (item.item_metadata?.type || "item"))))
                        }
                        alert(`Successfully deleted ${count} items.`)
                      }
                      // Force refresh if needed, usually handled by deleteItem callback updating state
                    }
                  }
                }}
                className={`px - 4 py - 2 rounded text - sm font - medium border transition - colors ${theme === "light"
                  ? "border-red-200 text-red-600 hover:bg-red-50"
                  : "border-red-900/50 text-red-400 hover:bg-red-900/20"
                  } `}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className={`border - t my - 4 ${theme === "light" ? "border-red-200" : "border-red-900/30"} `}></div>

          <button
            onClick={async () => {
              if (confirm("CRITICAL WARNING: This will delete ALL data in your specific user account. This includes passwords, files, settings, and folders. This action is irreversible. Type 'DELETE' to confirm.")) {
                // The prompt return value isn't checked here, logic flaw. 
                // Standard confirm doesn't take input.
                // I'll keep it simple: Double confirm.
                if (confirm("Are you ABSOLUTELY SURE? There is no going back.")) {
                  if (deleteItem) {
                    try {
                      // 1. Separate items and folders
                      const vaultItems = records.filter(r => r.type !== "folder")
                      const folders = records.filter(r => r.type === "folder")

                      // 2. Delete all vault items first (to clear FK references to folders)
                      if (vaultItems.length > 0) {
                        // showNotification(`Deleting ${ vaultItems.length } items...`, "success")
                        const batchSize = 25
                        for (let i = 0; i < vaultItems.length; i += batchSize) {
                          const batch = vaultItems.slice(i, i + batchSize)
                          await Promise.all(batch.map(r => deleteItem(r.id, r.type || "item")))
                        }
                      }

                      // 3. Delete folders (Sort by path depth descending)
                      if (folders.length > 0) {
                        // showNotification(`Deleting ${ folders.length } folders...`, "success")

                        // Sort by path length desc (deepest first)
                        const sortedFolders = [...folders].sort((a, b) => {
                          const depthA = (a.path || "").split("/").length
                          const depthB = (b.path || "").split("/").length
                          return depthB - depthA
                        })

                        let remaining = sortedFolders
                        let lastCount = remaining.length + 1

                        // Try up to 3 passes to resolve dependencies
                        for (let pass = 0; pass < 3 && remaining.length > 0 && remaining.length < lastCount; pass++) {
                          lastCount = remaining.length
                          const stillRemaining: any[] = []

                          for (const folder of remaining) {
                            try {
                              await deleteItem(folder.id, "folder")
                            } catch (e) {
                              stillRemaining.push(folder)
                            }
                          }
                          remaining = stillRemaining
                        }

                        if (remaining.length > 0) {
                          console.warn("Some folders could not be deleted:", remaining)
                        }
                      }

                      alert("Database wipe complete.")
                    } catch (err) {
                      console.error("Wipe failed", err)
                      alert("Wipe finished with potential errors. Please refresh.")
                    }
                  } else {
                    alert("Delete capability not available")
                  }
                }
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center"
          >
            <Trash className="h-5 w-5 mr-2" />
            DELETE ENTIRE DATABASE
          </button>
        </div>
      </div>

    </div>
  )
}

function ModuleAccessSettings({ theme }: { theme: string }) {
  const [isOpen, setIsOpen] = useState(false)

  // These IDs must match `activePage` values used in page.tsx
  const modules = [
    { id: "passwords", label: "Vault (Passwords)" },
    { id: "type-health-records", label: "Health Records" },
    { id: "type-vehicles", label: "Vehicles" },
    { id: "type-business", label: "Business Hub" },
    { id: "type-assets", label: "Assets" },
    { id: "type-digital-life", label: "Digital Life" },
    { id: "type-subscriptions", label: "Subscriptions" },
    { id: "type-media", label: "Secure Media" },
    { id: "type-goals", label: "Goals" },
    { id: "type-knowledge", label: "Knowledge Base" },
    { id: "type-travel", label: "Travel" }
  ]

  const [securitySettings, setSecuritySettings] = useState<Record<string, { isLocked: boolean, pin: string }>>(() => {
    try {
      const saved = localStorage.getItem("hub_security_settings")
      return saved ? JSON.parse(saved) : {}
    } catch (e) { return {} }
  })

  const [editingPin, setEditingPin] = useState<string | null>(null)
  const [tempPin, setTempPin] = useState("")

  const saveSettings = (newSettings: any) => {
    setSecuritySettings(newSettings)
    localStorage.setItem("hub_security_settings", JSON.stringify(newSettings))
  }

  const toggleLock = (moduleId: string) => {
    const current = securitySettings[moduleId] || { isLocked: false, pin: "0000" }
    // If unlocking, just do it. If locking, ensure a PIN is set or prompt for one? 
    // For simplicity: toggle lock status. If no PIN exists, default to 0000 or require setup.
    // Let's assume default 0000 if not set, user should change it.
    const newVal = { ...current, isLocked: !current.isLocked }
    if (!current.pin) newVal.pin = "0000"

    saveSettings({
      ...securitySettings,
      [moduleId]: newVal
    })
  }

  const handleSetPin = (moduleId: string) => {
    if (tempPin.length !== 4) return alert("PIN must be 4 digits")
    const current = securitySettings[moduleId] || { isLocked: false }
    saveSettings({
      ...securitySettings,
      [moduleId]: { ...current, pin: tempPin }
    })
    setEditingPin(null)
    setTempPin("")
  }

  return (
    <div className={`border rounded - lg ${theme === "light" ? "border-gray-200" : "border-gray-700"} overflow - hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w - full flex items - center justify - between p - 4 ${theme === "light" ? "bg-gray-50 hover:bg-gray-100" : "bg-[#333] hover:bg-gray-700"} transition - colors`}
      >
        <div className="flex items-center font-medium">
          <Shield className="h-5 w-5 mr-3 text-blue-500" />
          Manage Module Access Pins
        </div>
        {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className={`p - 4 space - y - 4 ${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} `}>
          {modules.map(mod => {
            const setting = securitySettings[mod.id] || { isLocked: false, pin: "" }
            const isEditing = editingPin === mod.id

            return (
              <div key={mod.id} className={`p - 4 rounded - lg flex items - center justify - between ${theme === 'light' ? 'bg-gray-50' : 'bg-black/20 border border-white/5'} `}>
                <div className="flex items-center gap-4">
                  <div className={`p - 2 rounded - lg ${setting.isLocked ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/10 text-gray-500'} `}>
                    {setting.isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className={`font - medium ${theme === 'light' ? 'text-gray-900' : 'text-white'} `}>{mod.label}</h3>
                    {setting.isLocked && <p className="text-xs text-gray-500">PIN: {setting.pin ? "****" : "Not Set"}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="PIN"
                        value={tempPin}
                        onChange={(e) => setTempPin(e.target.value.replace(/[^0-9]/g, ''))}
                        className={`w - 20 px - 2 py - 1 text - center rounded bg - transparent border ${theme === 'light' ? 'border-gray-300' : 'border-white/20'} `}
                      />
                      <button onClick={() => handleSetPin(mod.id)} className="p-1 hover:bg-green-500/20 text-green-500 rounded"><Check className="h-4 w-4" /></button>
                      <button onClick={() => { setEditingPin(null); setTempPin("") }} className="p-1 hover:bg-red-500/20 text-red-500 rounded"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <>
                      {setting.isLocked && (
                        <button
                          onClick={() => setEditingPin(mod.id)}
                          className="text-xs text-blue-400 hover:text-blue-300 mr-2"
                        >
                          Change PIN
                        </button>
                      )}
                      <button
                        onClick={() => toggleLock(mod.id)}
                        className={`relative inline - flex h - 6 w - 11 items - center rounded - full transition - colors focus: outline - none focus: ring - 2 focus: ring - blue - 500 focus: ring - offset - 2 ${setting.isLocked ? 'bg-blue-600' : 'bg-gray-700'} `}
                      >
                        <span className="sr-only">Toggle lock</span>
                        <span
                          className={`${setting.isLocked ? "translate-x-6" : "translate-x-1"
                            } inline - block h - 4 w - 4 transform rounded - full bg - white transition - transform`}
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
