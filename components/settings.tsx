"use client"

import { useState } from "react"
import { Save, Lock, Shield, Clock, Database, ToggleLeft, ToggleRight, Check, X, User, ChevronDown, ChevronUp, Unlock } from "lucide-react"
import CsvImporter from "./csv-importer"
import MockDataGenerator from "./mock-data-generator"
import { VaultItem } from "@/hooks/use-vault"

interface SettingsProps {
  records: (VaultItem | any)[]
  bulkAddItems?: (items: any[]) => Promise<any>
  addFolder?: (name: string, parentId?: string) => Promise<any>
  folders?: any[]
  deleteItem?: (id: string) => Promise<any>
  theme: string
}

export default function Settings({ records, bulkAddItems, addFolder, folders, deleteItem, theme }: SettingsProps) {
  // Initialize profile info from localStorage or defaults
  const [profileInfo, setProfileInfo] = useState(() => {
    const saved = localStorage.getItem("profileInfo")
    const initialProfile = saved
      ? JSON.parse(saved)
      : { username: "User123", email: "user123@example.com", phone: "555-5555" }

    console.log("Profile Info initialized:", initialProfile)
    return initialProfile
  })

  // State for 2FA toggle
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // State for auto-lock timeout
  const [autoLockTimeout, setAutoLockTimeout] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("auto_lock_timeout")
      return saved ? parseInt(saved) : 15
    }
    return 15
  })

  // State for backup frequency
  const [backupFrequency, setBackupFrequency] = useState("weekly")

  // State for master password
  const [masterPassword, setMasterPassword] = useState("")
  const [confirmMasterPassword, setConfirmMasterPassword] = useState("")

  // State for notifications
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  // State for import section
  const [showImport, setShowImport] = useState(false)

  // Show notification
  const showNotification = (message: string, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 3000)
  }

  // Handle saving profile info
  const handleSaveProfileInfo = () => {
    // Save to localStorage
    localStorage.setItem("profileInfo", JSON.stringify(profileInfo))

    // Show notification
    showNotification("Profile information updated")

    // Log for debugging
    console.log("Profile Info updated and saved:", profileInfo)
  }

  // Handle profile field changes
  const handleProfileChange = (field: string, value: string) => {
    setProfileInfo((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle toggling 2FA
  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
    showNotification(`Two-factor authentication ${!twoFactorEnabled ? "enabled" : "disabled"}`)
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
  const handleAutoLockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoLockTimeout(Number.parseInt(e.target.value))
  }

  // Handle saving auto-lock timeout
  const handleSaveAutoLock = () => {
    localStorage.setItem("auto_lock_timeout", autoLockTimeout.toString())
    window.dispatchEvent(new CustomEvent('autoLockTimeoutChanged', { detail: { timeout: autoLockTimeout } }))
    showNotification("Auto-lock timeout updated successfully")
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
    a.download = `securepasshub-backup-${new Date().toISOString().split("T")[0]}.json`
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
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${notification.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
        >
          <div className="flex items-center">
            {notification.type === "error" ? <X className="h-5 w-5 mr-2" /> : <Check className="h-5 w-5 mr-2" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className={`${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-lg p-6 shadow-md`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className={`block mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Username</label>
            <div className="flex">
              <input
                type="text"
                value={profileInfo.username}
                onChange={(e) => handleProfileChange("username", e.target.value)}
                className={`flex-1 px-3 py-2 rounded-md ${theme === "light"
                  ? "border border-gray-300 focus:border-blue-500 text-gray-800 bg-white"
                  : "border border-gray-600 focus:border-blue-500 text-white bg-[#333]"
                  } focus:outline-none`}
              />
            </div>
          </div>

          <div>
            <label className={`block mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Email</label>
            <div className="flex">
              <input
                type="email"
                value={profileInfo.email}
                onChange={(e) => handleProfileChange("email", e.target.value)}
                className={`flex-1 px-3 py-2 rounded-md ${theme === "light"
                  ? "border border-gray-300 focus:border-blue-500 text-gray-800 bg-white"
                  : "border border-gray-600 focus:border-blue-500 text-white bg-[#333]"
                  } focus:outline-none`}
              />
            </div>
          </div>

          <div>
            <label className={`block mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>Phone</label>
            <div className="flex">
              <input
                type="tel"
                value={profileInfo.phone}
                onChange={(e) => handleProfileChange("phone", e.target.value)}
                className={`flex-1 px-3 py-2 rounded-md ${theme === "light"
                  ? "border border-gray-300 focus:border-blue-500 text-gray-800 bg-white"
                  : "border border-gray-600 focus:border-blue-500 text-white bg-[#333]"
                  } focus:outline-none`}
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfileInfo}
            className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Profile Information
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className={`${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-lg p-6 shadow-md`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security Settings
        </h2>

        <div className="space-y-6">
          {/* Master Password */}
          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Master Password
            </h3>
            <p className={`mb-4 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
              Set a master password to encrypt your vault. This password will be required to access your vault.
            </p>

            <div className="space-y-4">
              <div>
                <label className={`block mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                  New Master Password
                </label>
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md ${theme === "light"
                    ? "border border-gray-300 focus:border-blue-500 text-gray-800 bg-white"
                    : "border border-gray-600 focus:border-blue-500 text-white bg-[#333]"
                    } focus:outline-none`}
                  placeholder="Enter new master password"
                />
              </div>

              <div>
                <label className={`block mb-1 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                  Confirm Master Password
                </label>
                <input
                  type="password"
                  value={confirmMasterPassword}
                  onChange={(e) => setConfirmMasterPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md ${theme === "light"
                    ? "border border-gray-300 focus:border-blue-500 text-gray-800 bg-white"
                    : "border border-gray-600 focus:border-blue-500 text-white bg-[#333]"
                    } focus:outline-none`}
                  placeholder="Confirm new master password"
                />
              </div>

              <button
                onClick={handleSaveMasterPassword}
                className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Master Password
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div>
            <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
            <p className={`mb-4 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
              Enable two-factor authentication for an additional layer of security.
            </p>

            <div className="flex items-center">
              <button
                onClick={handleToggle2FA}
                className={`flex items-center ${twoFactorEnabled ? "text-green-500" : theme === "light" ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                {twoFactorEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
              <span className="ml-2">{twoFactorEnabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>

          {/* Auto-Lock Timeout */}
          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Auto-Lock Timeout
            </h3>
            <p className={`mb-4 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
              Set the time (in minutes) after which the vault will automatically lock.
            </p>

            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="60"
                value={autoLockTimeout}
                onChange={handleAutoLockChange}
                className="flex-1"
              />
              <span className="w-12 text-center">{autoLockTimeout} min</span>
              <button
                onClick={handleSaveAutoLock}
                className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                <Save className="h-5 w-5 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Module Access Control */}
      <div className={`${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-lg p-6 shadow-md`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Module Access Control
        </h2>
        <p className={`mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
          Lock specific sections of the application with a numeric PIN for enhanced privacy.
        </p>

        <ModuleAccessSettings theme={theme} />
      </div>

      {/* Backup & Restore */}
      <div className={`${theme === "light" ? "bg-white" : "bg-[#2a2a2a]"} rounded-lg p-6 shadow-md`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Backup & Restore
        </h2>


        <div className="space-y-6">
          {/* Backup Frequency */}
          <div>
            <h3 className="text-lg font-medium mb-2">Backup Frequency</h3>
            <p className={`mb-4 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
              Set how often you want to be reminded to backup your vault.
            </p>

            <div className="flex items-center space-x-4">
              <select
                value={backupFrequency}
                onChange={handleBackupFrequencyChange}
                className={`px-3 py-2 rounded-md ${theme === "light"
                  ? "border border-gray-300 focus:border-blue-500 text-gray-800 bg-white"
                  : "border border-gray-600 focus:border-blue-500 text-white bg-[#333]"
                  } focus:outline-none`}
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
                // Criteria: metadata is_mock OR title starts with [MOCK]
                const mockItems = records.filter(
                  (item) =>
                    item?.item_metadata?.is_mock ||
                    item?.title?.startsWith("[MOCK]") ||
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
                  for (const item of mockItems) {
                    await deleteItem(item.id)
                    deletedCount++
                  }

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
    </div >
  )
}

function ModuleAccessSettings({ theme }: { theme: string }) {
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
    <div className="space-y-4">
      {modules.map(mod => {
        const setting = securitySettings[mod.id] || { isLocked: false, pin: "" }
        const isEditing = editingPin === mod.id

        return (
          <div key={mod.id} className={`p-4 rounded-lg flex items-center justify-between ${theme === 'light' ? 'bg-gray-50' : 'bg-black/20 border border-white/5'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${setting.isLocked ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                {setting.isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
              </div>
              <div>
                <h3 className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{mod.label}</h3>
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
                    className={`w-20 px-2 py-1 text-center rounded bg-transparent border ${theme === 'light' ? 'border-gray-300' : 'border-white/20'}`}
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${setting.isLocked ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${setting.isLocked ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
