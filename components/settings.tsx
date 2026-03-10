"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Database,
  Activity,
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
  ChevronRight,
  Maximize,
  Minimize,
  Moon,
  Sun,
  RotateCcw,
  User,
  Mail,
  Globe,
  FolderTree,
  Grid,
  HelpCircle
} from "lucide-react"
import { sidebarSections } from "@/lib/sidebar-config"
import { toast } from "sonner"
import CsvImporter from "./csv-importer"
import JsonImporter from "./json-importer"
import PinAuthScreen from "./security/pin-auth-screen"
import { VaultItem } from "@/hooks/use-vault"
import BackupRecovery from "./settings/backup-recovery"
import ExportData from "./settings/export-data"
import TwoFactorAuthModal from "@/components/modals/two-factor-auth-modal"

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
  toggleTheme,
  autoLockTimeout,
  setAutoLockTimeout,
  twoFactorEnabled,
  setTwoFactorEnabled,
  startupPage,
  setStartupPage,
  isFullscreen,
  setIsFullscreen,
  onOpenHelp
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
  toggleTheme?: () => void
  autoLockTimeout: number
  setAutoLockTimeout: (value: number) => void
  twoFactorEnabled: boolean
  setTwoFactorEnabled: (enabled: boolean) => void
  startupPage?: string
  setStartupPage?: (page: string) => void
  isFullscreen?: boolean
  setIsFullscreen?: (val: boolean) => void
  onOpenHelp?: (targetId?: string) => void
}) {
  const currentTheme = theme || "dark";
  const globalToggleTheme = toggleTheme || (() => {});
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
  const [isDangerZoneUnlocked, setIsDangerZoneUnlocked] = useState(false)
  const [showPinScreen, setShowPinScreen] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [sessionDurationDays, setSessionDurationDays] = useState(90)
  const [showSessionHelp, setShowSessionHelp] = useState(false)
  const [selectedWipeIds, setSelectedWipeIds] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [show2FA, setShow2FA] = useState(false)

  // Robust mock identification logic
  const isItemMock = (r: any) => {
    // 1. Check explicit metadata flags
    if (r.item_metadata?.mock === true || r.item_metadata?.is_mock === true || r.is_mock === true) return true;
    
    // 2. Check heuristically based on known internal demo patterns
    const title = (r.title || "").toLowerCase();
    const patterns = [
      /adobe suite/i,
      /bank account/i,
      /database prod/i,
      /login service/i,
      /membership .* gym/i,
      /server node/i,
      /ssh key .* aws/i,
      /wifi password/i,
      /credit card [0-9]+ - bank [0-9]+/i,
      /membership [0-9]+/i,
      /server [0-9]+/i,
      /database [0-9]+/i,
      /john doe/i,
      /jane doe/i
    ];
    
    const username = ((r.username || r.item_metadata?.username || r.item_metadata?.email || "") + "").toLowerCase();
    const commonMockUsers = ["no username", "db_admin", "member_id", "admin", "root", "user1@example.com"];
    
    if (patterns.some(p => p.test(title))) return true;
    if (commonMockUsers.some(u => username.includes(u))) return true;
    if (username.includes("example.com") && (title.includes("service") || title.includes("login"))) return true;
    
    // Check specific combinations of names that indicate mock data
    if ((title.includes("membership") || title.includes("gym")) && (title.includes("member_id") || title.includes("no username"))) return true;
    if (title.includes("ssh key") && title.includes("aws")) return true;
    if (title.includes("adobe suite")) return true;

    // 3. User information based checks (e.g. John Doe for cards)
    const holder = ((r.item_metadata?.name || r.item_metadata?.cardHolder || "") + "").toUpperCase();
    if (holder === "JOHN DOE") return true;

    return false;
  };

  // Load Biometric State + Session Duration
  useEffect(() => {
    setBiometricEnabled(localStorage.getItem('biometric_enabled') === 'true')
    const saved = parseInt(localStorage.getItem('session_duration_days') || '90')
    setSessionDurationDays(isNaN(saved) ? 90 : saved)
  }, [])

  const handleSaveSessionDuration = (days: number) => {
    setSessionDurationDays(days)
    localStorage.setItem('session_duration_days', days.toString())
    // Also stamp the last full-login time if not already set, so the timer starts now
    if (!localStorage.getItem('full_login_timestamp')) {
      localStorage.setItem('full_login_timestamp', Date.now().toString())
    }
    showNotification(`Session duration set to ${days === 0 ? 'Never expire' : days + ' days'}`)
  }

  const { user } = useAuth()

  const handleToggleBiometric = async () => {
    if (!biometricEnabled) {
      // Enabling Biometrics
      if (!window.PublicKeyCredential) {
        showNotification("Biometrics not supported on this browser", "error")
        return
      }

      try {
        await new Promise(r => setTimeout(r, 300));

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: {
              name: "Secure Life Hub",
              id: currentDomain === 'localhost' ? 'localhost' : currentDomain
            },
            user: {
              id: Uint8Array.from(user?.id?.substring(0, 16) || 'fallbackuserid12', c => c.charCodeAt(0)),
              name: user?.email || "user@securelifehub.com",
              displayName: user?.user_metadata?.full_name || "SecureLifeHub User"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              userVerification: "required",
              residentKey: "preferred",
              requireResidentKey: false
            },
            timeout: 60000
          }
        });

        if (credential) {
          const cred = credential as PublicKeyCredential;
          const id = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
          localStorage.setItem('biometric_id', id);
          localStorage.setItem('biometric_enabled', 'true')
          setBiometricEnabled(true)
          showNotification("Biometric login enabled for this device")
        }
      } catch (e) {
        console.error("Biometric enrollment failed:", e)
        showNotification("Enrollment failed or cancelled. Note: Some browsers require HTTPS.", "error")
      }
    } else {
      // Disabling
      localStorage.removeItem('biometric_enabled')
      setBiometricEnabled(false)
      showNotification("Biometric login disabled")
    }
  }

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
    if (!twoFactorEnabled) {
      setShow2FA(true)
    } else {
      setTwoFactorEnabled(false)
      localStorage.setItem('hub_2fa_enabled', 'false')
      showNotification("Two-factor authentication disabled")
    }
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

  const SettingsCard = ({ title, icon: Icon, children, color = "blue", className = "", helpId, hideHeaderHelp = false }: any) => (
    <div className={`p-6 rounded-3xl border relative overflow-hidden ${theme === "light" ? "bg-white border-gray-200 shadow-xl shadow-gray-200/50" : "bg-[#1a1a1a] border-white/5"} ${className}`}>
      <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none`}>
        <Icon className="h-32 w-32" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-2xl ${theme === "light" ? `bg-${color}-100 text-${color}-600` : `bg-${color}-500/20 text-${color}-400`}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{title}</h3>
            {!hideHeaderHelp && (
              <button 
                type="button"
                onClick={() => onOpenHelp?.(helpId || "settings")}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-blue-400 transition-all focus:outline-none opacity-100"
                title={`Explain ${title}`}
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  )

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          ⚙️ Settings
        </h1>
        <p className="text-gray-400">Manage security, automation, and data</p>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2 border ${notification.type === "error" ? "bg-red-950/90 border-red-500 text-red-200" : "bg-emerald-950/90 border-emerald-500 text-emerald-200"}`}>
          <div className="flex items-center gap-3">
            {notification.type === "error" ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
            <span className="font-bold">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Account Section */}
        <SettingsCard title="Account" icon={User} color="blue" helpId="settings-account">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-400/70 mb-1">Authenticated Account</div>
                  <div className="font-black text-xl md:text-2xl text-white">{user?.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {user?.app_metadata?.provider === 'google' ? (
                      <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Globe className="h-2.5 w-2.5" /> Google Account
                      </span>
                    ) : (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Mail className="h-2.5 w-2.5" /> Email Account
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Security Section */}
        <SettingsCard title="Security" icon={Shield} color="purple" helpId="settings-security">
          <div className="space-y-6">
            {/* Master Password */}
            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <h4 className="font-bold mb-3 text-sm uppercase tracking-wider opacity-70">Master Password</h4>
              <div className="space-y-3">
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-purple-500/50 transition-colors"
                />
                <input
                  type="password"
                  value={confirmMasterPassword}
                  onChange={(e) => setConfirmMasterPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-purple-500/50 transition-colors"
                />
                <button onClick={handleSaveMasterPassword} className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-purple-900/20">
                  Update Password
                </button>
              </div>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-bold">Two-Factor Auth</div>
                  <button type="button" onClick={() => onOpenHelp?.("settings-security")} className="text-purple-400 hover:text-white transform hover:scale-110 transition-all focus:outline-none">
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-xs opacity-50">Additional layer of security</div>
              </div>
              <button onClick={handleToggle2FA} className={`relative h-8 w-14 rounded-full transition-colors ${twoFactorEnabled ? 'bg-green-500' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            {/* Biometric Login */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${biometricEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/10 text-gray-500'}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold">Biometric Login</div>
                  <div className="text-[10px] opacity-70 text-blue-400 font-bold uppercase tracking-wider">Choose "This Device" 📲 when asked</div>
                </div>
              </div>
              <button
                onClick={handleToggleBiometric}
                className={`relative h-8 w-14 rounded-full transition-colors ${biometricEnabled ? 'bg-blue-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${biometricEnabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            {/* Biometric Session Duration */}
            <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-bold">Biometric Session Duration</div>
                    <button
                      type="button"
                      onClick={() => setShowSessionHelp(!showSessionHelp)}
                      className="text-purple-400 hover:text-white transform hover:scale-110 transition-all focus:outline-none"
                      title="What is session duration?"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-purple-400 font-medium mt-0.5">
                    {sessionDurationDays === 0
                      ? 'Fingerprint valid until you sign out'
                      : `Re-enter master password every ${sessionDurationDays} days`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sessionDurationDays}
                    onChange={(e) => handleSaveSessionDuration(parseInt(e.target.value))}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                    <option value={365}>1 year</option>
                    <option value={0}>Never expire</option>
                  </select>
                </div>
              </div>

              {/* Inline Help Tooltip */}
              {showSessionHelp && (
                <div className="mt-2 p-4 rounded-xl bg-purple-900/20 border border-purple-500/20 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <HelpCircle className="h-3.5 w-3.5" />
                    About Biometric Session Duration
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your fingerprint/face login works by verifying your identity on this device, then reusing a saved secure session token. That token doesn&apos;t last forever — this setting controls <strong className="text-gray-200">how many days</strong> it stays valid before you&apos;re asked to sign in with your Master Password again.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                    <li><strong className="text-gray-300">7 days</strong> — Highest security; re-login weekly</li>
                    <li><strong className="text-gray-300">30/60/90 days</strong> — Good balance for daily use</li>
                    <li><strong className="text-gray-300">180 days / 1 year</strong> — Convenient for trusted personal devices</li>
                    <li><strong className="text-gray-300">Never expire</strong> — Fingerprint works until you manually sign out</li>
                  </ul>
                  <p className="text-[10px] text-gray-600">
                    💡 Tip: After changing this, sign in once with your Master Password to restart the timer.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${typeof window !== 'undefined' && localStorage.getItem('remember_master_pass') === 'true' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/10 text-gray-500'}`}>
                  <Save className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-bold">Remember Master Password</div>
                    <button type="button" onClick={() => onOpenHelp?.("settings-security")} className="text-amber-400 hover:text-white transform hover:scale-110 transition-all focus:outline-none">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-[10px] opacity-70 text-amber-400 font-bold uppercase tracking-wider">For External Testing Only 🖥️📱</div>
                </div>
              </div>
              <button
                onClick={() => {
                  const isEnabled = localStorage.getItem('remember_master_pass') === 'true';
                  if (!isEnabled) {
                    const pass = prompt("Enter Master Password to save:");
                    if (pass) {
                      localStorage.setItem('saved_master_pass', btoa(pass));
                      localStorage.setItem('remember_master_pass', 'true');
                      toast.success("Master password saved on this device (for testing)");
                    }
                  } else {
                    localStorage.removeItem('saved_master_pass');
                    localStorage.setItem('remember_master_pass', 'false');
                    toast.info("Master password removed from local storage");
                  }
                  window.dispatchEvent(new Event('storage'));
                }}
                className={`relative h-8 w-14 rounded-full transition-colors ${typeof window !== 'undefined' && localStorage.getItem('remember_master_pass') === 'true' ? 'bg-amber-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${typeof window !== 'undefined' && localStorage.getItem('remember_master_pass') === 'true' ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </SettingsCard>

        {/* Automation Section */}
        <SettingsCard title="Automation" icon={Clock} color="blue" helpId="settings-automation">
          <div className="space-y-6">
            {/* Auto-Lock */}
            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <h4 className="font-bold mb-3 text-sm uppercase tracking-wider opacity-70">Auto-Lock Timer</h4>
              <div className="flex gap-2">
                <select
                  value={autoLockTimeout}
                  onChange={(e) => handleAutoLockChange(parseInt(e.target.value))}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 outline-none"
                >
                  <option value={5}>5 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={0}>Disabled</option>
                </select>
                <button onClick={handleSaveAutoLock} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-colors">
                  Save
                </button>
              </div>
            </div>

            {/* Startup Page Selection - Accordion Grid View */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Grid className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm uppercase tracking-widest">Startup View Configuration</h4>
                    <button type="button" onClick={() => onOpenHelp?.("settings-automation")} className="text-blue-400 hover:text-white transform hover:scale-110 transition-all focus:outline-none">
                      <HelpCircle className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">Choose your landing page after login.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sidebarSections.map(section => {
                  const isSectionActive = section.items.some(i => i.id === (startupPage || "dashboard"));
                  const activeItemName = section.items.find(i => i.id === (startupPage || "dashboard"))?.label;
                  
                  // Simple local expansion state management could be added as a parent-level toggler
                  // but for immediate UX without complex state lifting, we'll use a local state
                  // Since we are inside a map, we need to handle this carefully.
                  // I'll add an "expandedSections" state to the main Settings component.
                  return (
                    <div 
                      key={section.id} 
                      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                        isSectionActive 
                          ? `border-${section.color}-500/30 bg-${section.color}-500/5 ring-1 ring-${section.color}-500/20 shadow-lg shadow-${section.color}-900/10` 
                          : 'border-white/5 bg-black/20 hover:border-white/10'
                      }`}
                    >
                      <button
                        onClick={() => {
                          const element = document.getElementById(`content-${section.id}`);
                          const chevron = document.getElementById(`chevron-${section.id}`);
                          if (element) {
                            const isHidden = element.classList.contains('hidden');
                            // Close all others first? (Accordion behavior) - optional
                            // Toggle this one
                            if (isHidden) {
                              element.classList.remove('hidden');
                              element.classList.add('block', 'animate-in', 'fade-in', 'slide-in-from-top-1');
                              chevron?.classList.add('rotate-180');
                            } else {
                              element.classList.add('hidden');
                              element.classList.remove('block');
                              chevron?.classList.remove('rotate-180');
                            }
                          }
                        }}
                        className="w-full flex flex-col p-3 text-left transition-colors hover:bg-white/5 group"
                      >
                        <div className="flex items-center justify-between pointer-events-none">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-${section.color}-500/20 text-${section.color}-400 group-hover:scale-110 transition-transform`}>
                              {section.items[0]?.icon}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest text-${section.color}-400`}>
                              {section.title}
                            </span>
                          </div>
                          <ChevronDown id={`chevron-${section.id}`} className="h-3 w-3 text-gray-600 transition-transform duration-300" />
                        </div>
                        
                        {isSectionActive && (
                          <div className="mt-2.5 flex items-center gap-1.5 animate-in fade-in">
                            <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-200 break-words">{activeItemName}</span>
                          </div>
                        )}
                      </button>

                      <div id={`content-${section.id}`} className="hidden p-2 pt-0 space-y-1 bg-black/20 border-t border-white/5">
                        {section.items.map(item => {
                          const isActive = (startupPage || "dashboard") === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setStartupPage?.(item.id);
                                localStorage.setItem("hub_startup_page", item.id);
                                toast.success(`Startup view set to ${item.label}`, {
                                  icon: <Check className={`h-4 w-4 text-${section.color}-400`} />
                                });
                              }}
                              className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all ${
                                isActive 
                                  ? `bg-${section.color}-600 text-white shadow-md` 
                                  : 'hover:bg-white/10 text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              <div className={isActive ? 'text-white' : `text-${section.color}-500/50`}>
                                {item.icon}
                              </div>
                              <span className="text-[10px] font-bold truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Auto-Fill */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-bold">Auto-Fill</div>
                </div>
                <div className={`text-xs ${autoFillEnabled ? 'text-blue-400' : 'text-gray-500'}`}>
                  {autoFillEnabled ? "Extension Access Enabled" : "Manual Copy/Paste Only"}
                </div>
              </div>
              <button onClick={handleToggleAutoFill} className={`relative h-8 w-14 rounded-full transition-colors ${autoFillEnabled ? 'bg-blue-500' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${autoFillEnabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            {/* Full Screen Mode */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <div>
                <div className="font-bold">Full Screen Mode</div>
                <div className={`text-xs ${isFullscreen ? 'text-blue-400' : 'text-gray-500'}`}>
                  {isFullscreen ? "Immersive View Active" : "Standard Layout"}
                </div>
              </div>
              <button 
                onClick={() => {
                  const newState = !isFullscreen;
                  setIsFullscreen?.(newState);
                  
                  // Hardware-level fullscreen
                  if (newState) {
                    if (document.documentElement.requestFullscreen) {
                      document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
                    } else if ((document.documentElement as any).webkitRequestFullscreen) {
                      (document.documentElement as any).webkitRequestFullscreen({ navigationUI: 'hide' });
                    } else if ((document.documentElement as any).msRequestFullscreen) {
                      (document.documentElement as any).msRequestFullscreen({ navigationUI: 'hide' });
                    }
                  } else {
                    if (document.fullscreenElement && document.exitFullscreen) {
                      document.exitFullscreen().catch(() => {});
                    } else if ((document as any).webkitExitFullscreen) {
                      (document as any).webkitExitFullscreen();
                    } else if ((document as any).msExitFullscreen) {
                      (document as any).msExitFullscreen();
                    }
                  }
                }} 
                className={`flex items-center justify-center p-2 rounded-xl transition-all ${isFullscreen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-700 text-gray-300'}`}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </SettingsCard>

        {/* Appearance Section */}
        <SettingsCard title="Appearance" icon={Sun} color="amber" helpId="settings-appearance">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <div>
                <div className="font-bold">Dark Mode</div>
                <div className="text-xs opacity-50">Switch between light and dark themes</div>
              </div>
              <button 
                onClick={globalToggleTheme} 
                className={`relative h-8 w-14 rounded-full transition-colors ${currentTheme === 'dark' ? 'bg-blue-600' : 'bg-gray-400'}`}
              >
                <div className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${currentTheme === 'dark' ? 'translate-x-6' : ''} flex items-center justify-center`}>
                   {currentTheme === 'light' ? <Sun className="h-3 w-3 text-amber-500" /> : <Moon className="h-3 w-3 text-blue-600" />}
                </div>
              </button>
            </div>
            
            <div className={`h-px w-full ${currentTheme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`} />

            {/* Recents Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-bold">Recent History Management</div>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Manage individual items in your activity feed</div>
                </div>
              </div>

              <div className={`max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-2 rounded-2xl p-2 ${currentTheme === 'light' ? 'bg-gray-50' : 'bg-black/40 border border-white/5'}`}>
                {records
                  .filter(r => {
                      if (!r.updatedAt && !r.updated_at) return false;
                      const resetDate = localStorage.getItem('hub_recents_reset_date');
                      const updateDate = new Date(r.updatedAt || r.updated_at);
                      if (resetDate && updateDate < new Date(resetDate)) return false;
                      
                      const hiddenIds = JSON.parse(localStorage.getItem('hub_hidden_recent_ids') || '[]');
                      if (hiddenIds.includes(r.id)) return false;
                      
                      return true;
                  })
                  .sort((a,b) => new Date(b.updatedAt || b.updated_at).getTime() - new Date(a.updatedAt || a.updated_at).getTime())
                  .slice(0, 15)
                  .map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                       <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 rounded-lg bg-black/20 text-gray-500">
                             <RotateCcw className="h-3 w-3" />
                          </div>
                          <div className="truncate">
                             <div className="text-xs font-bold text-gray-200 truncate">{item.title || item.name || "Untitled"}</div>
                             <div className="text-[9px] text-gray-500 uppercase tracking-tighter">{item.category || "General"}</div>
                          </div>
                       </div>
                       <button 
                         onClick={() => {
                            const hiddenIds = JSON.parse(localStorage.getItem('hub_hidden_recent_ids') || '[]');
                            localStorage.setItem('hub_hidden_recent_ids', JSON.stringify([...hiddenIds, item.id]));
                            window.dispatchEvent(new Event('storage'));
                            toast.success("Item removed from recents");
                         }}
                         className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                         title="Remove from recents"
                       >
                         <Trash className="h-3.5 w-3.5" />
                       </button>
                    </div>
                  ))
                }
                {[...records].filter(r => {
                    if (!r.updatedAt && !r.updated_at) return false;
                    const resetDate = localStorage.getItem('hub_recents_reset_date');
                    const updateDate = new Date(r.updatedAt || r.updated_at);
                    if (resetDate && updateDate < new Date(resetDate)) return false;
                    const hiddenIds = JSON.parse(localStorage.getItem('hub_hidden_recent_ids') || '[]');
                    return !hiddenIds.includes(r.id);
                }).length === 0 && (
                  <div className="text-center py-8">
                     <p className="text-[10px] text-gray-500 font-bold uppercase">No recent activity to manage</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-bold">Reset Recent Items</div>
                  </div>
                  <div className="text-xs text-blue-400 font-medium">Reset 'Recents' folder history to start fresh from now</div>
                </div>
                <button 
                  onClick={() => {
                    if (confirm("Reset recent items history? New items from this point forward will show in Recents.")) {
                      localStorage.setItem('hub_recents_reset_date', new Date().toISOString());
                      localStorage.removeItem('hub_hidden_recent_ids');
                      toast.success("Recents history reset");
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentTheme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Access Control */}
        <SettingsCard title="Module Access" icon={Lock} color="emerald" className="lg:col-span-2" helpId="settings-access">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm opacity-60">Control PIN restriction and mock data demonstration for each module.</p>
          </div>
          <ModuleAccessSettings 
            theme={theme || "dark"} 
            records={records}
            deleteItem={deleteItem}
          />
        </SettingsCard>

        {/* Combined Data Management Section */}
        <SettingsCard title="Data Management" icon={Database} color="blue" helpId="settings-data" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 p-1.5 rounded-lg bg-blue-500/10 w-fit">
                <Download className="h-4 w-4 text-blue-400" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Backup & Restore</h4>
              </div>
              <BackupRecovery
                records={records}
                addItem={addItem}
                deleteItem={deleteItem}
                bulkAddItems={bulkAddItems}
                theme={theme || "dark"}
                onOpenHelp={onOpenHelp}
              />
            </div>
            <div className="space-y-4 md:border-l border-white/5 md:pl-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 p-1.5 rounded-lg bg-pink-500/10 w-fit">
                  <Upload className="h-4 w-4 text-pink-400" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-400">Export Vault</h4>
                </div>
                <ExportData records={records} theme={theme || "dark"} />
              </div>
              
              <div className="pt-6 border-t border-white/5 mt-auto">
                <button 
                  onClick={async () => {
                    const mockItems = records.filter(isItemMock);
                    if (mockItems.length === 0) return toast.info("No mock data detected in your vault.");
                    
                    if (confirm(`DETECTED: ${mockItems.length} leftover mock/demo records. \n\nWould you like to PERMANENTLY delete them now to sanitize your vault?`)) {
                      if (!deleteItem) return;
                      toast.info("Sanitizing vault...");
                      for (const item of mockItems) {
                        await deleteItem(item.id, item.type || "item", { skipRefresh: true });
                      }
                      window.dispatchEvent(new CustomEvent('vault-refresh'));
                      toast.success(`Sanitized: Removed ${mockItems.length} mock records.`);
                    }
                  }}
                  className="w-full py-4 px-6 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 rounded-2xl flex items-center justify-center gap-3 transition-all font-black uppercase tracking-widest text-[10px]"
                >
                  <Database className="h-4 w-4" /> Sanitize Vault (Wipe Mocks)
                </button>
              </div>
            </div>
          </div>
        </SettingsCard>
      </div>

      {/* Advanced & Danger Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SettingsCard title="Danger Zone" icon={AlertCircle} color="red" className="border-red-500/20 lg:col-span-2" helpId="settings-danger-zone">
          {!isDangerZoneUnlocked ? (
            <div className="text-center py-12">
              <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <Lock className="h-10 w-10 text-red-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Restricted Security Area</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">This area contains destructive actions that cannot be undone. Please proceed with extreme caution.</p>
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => setShowPinScreen(true)}
                  className="bg-red-500 hover:bg-red-400 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-900/40 uppercase tracking-widest text-sm active:scale-95"
                >
                  Unlock Danger Zone
                </button>
                <button
                  type="button"
                  onClick={() => onOpenHelp?.("settings-danger-zone")}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Explain Danger Zone"
                >
                  <HelpCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {/* Individual Page Wipe Section */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between border-b border-red-500/20 pb-4">
                   <div className="flex items-center gap-3">
                     <Trash className="h-6 w-6 text-red-500" />
                     <div>
                       <h4 className="text-xl font-black uppercase tracking-tighter">Individual Page Wipe</h4>
                       <p className="text-xs text-gray-500">Delete all records for a specific section without affecting other data.</p>
                     </div>
                   </div>
                   {selectedWipeIds.length > 0 && (
                     <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                       <div className="text-right">
                         <div className="text-xs font-black text-red-400 uppercase tracking-widest">{selectedWipeIds.length} Categories Selected</div>
                         <button 
                           onClick={() => setSelectedWipeIds([])}
                           className="text-[10px] text-gray-500 hover:text-white uppercase font-bold"
                         >
                           Clear Selection
                         </button>
                       </div>
                       <button
                         disabled={isBulkDeleting}
                         onClick={async () => {
                           if (confirm(`⚠️ MASS WIPE: Are you sure you want to delete ALL data in ${selectedWipeIds.length} selected categories? This cannot be undone.`)) {
                             setIsBulkDeleting(true);
                             showNotification(`Initializing bulk wipe...`, "error");
                             
                             try {
                               for (const id of selectedWipeIds) {
                                 // We need to re-find the filter logic for each ID
                                 // This is a bit redundant but safe
                                 const item = sidebarSections.flatMap(s => s.items).find(i => i.id === id);
                                 if (!item) continue;
                                 
                                 const getFilter = (id: string, label: string) => {
                                   if (id === 'all-items') return (r: any) => r.type !== 'folder';
                                   if (id === 'type-secure-notes') return (r: any) => r.type === 'note' || r.type === 'secure-note';
                                   if (id === 'type-payment-cards') return (r: any) => r.type === 'card' || r.type === 'financial-card';
                                   if (id === 'type-health-records') return (r: any) => r.category === 'Health Records' || r.type === 'health-record';
                                   if (id === 'type-medications') return (r: any) => r.type === 'medication' || r.category?.toLowerCase() === 'medications';
                                   if (id === 'type-vitals') return (r: any) => r.category?.toLowerCase() === 'vitals' || r.item_metadata?.is_vital === true;
                                   if (id === 'type-health-diary') return (r: any) => r.category?.toLowerCase() === 'health diary';
                                   if (id === 'type-medical') return (r: any) => r.category === 'Health Insurance';
                                   if (id === 'type-vehicles') return (r: any) => r.type === 'vehicle' || r.category === 'Vehicle Profiles';
                                   if (id === 'type-vehicle-docs') return (r: any) => r.category === 'Registration & Docs';
                                   if (id === 'type-maintenance') return (r: any) => r.type === 'maintenance' || r.category === 'Maintenance Logs';
                                   if (id === 'type-business') return (r: any) => r.type === 'business' || r.category === 'Business Hub';
                                   if (id === 'type-clients') return (r: any) => r.type === 'client' || r.category === 'Client Records';
                                   if (id === 'type-assets') return (r: any) => r.type === 'asset' || r.category === 'Asset Ledger';
                                   if (id === 'type-budget') return (r: any) => r.category === 'Budget' || r.item_metadata?.is_budget === true;
                                   if (id === 'type-media') return (r: any) => r.type === 'media' || r.category === 'Secure Media' || r.category === 'Memories & Media';
                                   if (id === 'type-goals') return (r: any) => r.type === 'goal' || r.category === 'Goals & Timeline';
                                   if (id === 'type-digital-life') return (r: any) => r.category === 'Online Presence' || r.type === 'online-presence';
                                   if (id === 'type-diary') return (r: any) => r.type === 'diary' || r.category === 'My Diary';
                                   if (id === 'type-subscriptions') return (r: any) => r.category === 'Subscriptions';
                                   if (id === 'type-social') return (r: any) => r.category === 'Social Media';
                                   return (r: any) => r.category === label || (r.type === 'password' && r.category === label);
                                 };

                                 const filter = getFilter(id, item.label);
                                 const targets = records.filter(filter);
                                 for (const r of targets) {
                                   await deleteItem(r.id, r.type || "item", { skipRefresh: true });
                                 }
                               }
                               window.dispatchEvent(new CustomEvent('vault-refresh'));
                               toast.success(`Bulk wipe complete.`);
                               setSelectedWipeIds([]);
                             } catch (e) {
                               console.error(e);
                               toast.error("Bulk wipe failed mid-process.");
                             } finally {
                               setIsBulkDeleting(false);
                             }
                           }
                         }}
                         className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-900/40 transition-all flex items-center gap-2"
                       >
                         {isBulkDeleting ? <RotateCcw className="h-3 w-3 animate-spin" /> : <Trash className="h-3 w-3" />}
                         Wipe Selected
                       </button>
                     </div>
                   )}
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sidebarSections.filter(s => !['dashboard', 'vault', 'configuration'].includes(s.id)).map(section => (
                    <div key={section.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                        <div className={`p-1.5 rounded-lg bg-${section.color}-500/20 text-${section.color}-400`}>
                          {section.items[0]?.icon && section.items[0].icon}
                        </div>
                        <h5 className="font-bold text-sm uppercase tracking-wider">{section.title}</h5>
                      </div>
                      <div className="space-y-2">
                        {section.items.map(item => {
                          const id = item.id;
                          // Define what items are data-holding.
                          const isDataHolding = id.startsWith('type-') || id === 'all-items';
                          if (!isDataHolding) return null;

                          // Define filter logic based on item ID
                          const getFilter = () => {
                            if (id === 'all-items') return (r: any) => r.type !== 'folder';
                            if (id === 'type-secure-notes') return (r: any) => r.type === 'note' || r.type === 'secure-note';
                            if (id === 'type-payment-cards') return (r: any) => r.type === 'card' || r.type === 'financial-card';
                            if (id === 'type-health-records') return (r: any) => r.category === 'Health Records' || r.type === 'health-record';
                            if (id === 'type-medications') return (r: any) => r.type === 'medication' || r.category?.toLowerCase() === 'medications';
                            if (id === 'type-vitals') return (r: any) => r.category?.toLowerCase() === 'vitals' || r.item_metadata?.is_vital === true;
                            if (id === 'type-health-diary') return (r: any) => r.category?.toLowerCase() === 'health diary';
                            if (id === 'type-medical') return (r: any) => r.category === 'Health Insurance';
                            if (id === 'type-vehicles') return (r: any) => r.type === 'vehicle' || r.category === 'Vehicle Profiles';
                            if (id === 'type-vehicle-docs') return (r: any) => r.category === 'Registration & Docs';
                            if (id === 'type-maintenance') return (r: any) => r.type === 'maintenance' || r.category === 'Maintenance Logs';
                            if (id === 'type-business') return (r: any) => r.type === 'business' || r.category === 'Business Hub';
                            if (id === 'type-clients') return (r: any) => r.type === 'client' || r.category === 'Client Records';
                            if (id === 'type-assets') return (r: any) => r.type === 'asset' || r.category === 'Asset Ledger';
                            if (id === 'type-budget') return (r: any) => r.category === 'Budget' || r.item_metadata?.is_budget === true;
                            if (id === 'type-media') return (r: any) => r.type === 'media' || r.category === 'Secure Media' || r.category === 'Memories & Media';
                            if (id === 'type-goals') return (r: any) => r.type === 'goal' || r.category === 'Goals & Timeline';
                            if (id === 'type-digital-life') return (r: any) => r.category === 'Online Presence' || r.type === 'online-presence';
                            if (id === 'type-diary') return (r: any) => r.type === 'diary' || r.category === 'My Diary';
                            if (id === 'type-subscriptions') return (r: any) => r.category === 'Subscriptions';
                            if (id === 'type-social') return (r: any) => r.category === 'Social Media';
                            
                            // Fallback for Passwords Categories handled in page.tsx
                            const categoryLabel = item.label;
                            return (r: any) => r.category === categoryLabel || (r.type === 'password' && r.category === categoryLabel);
                          };

                          const filter = getFilter();
                          const count = records.filter(filter).length;
                          const displayLabel = id === 'type-vitals' ? 'Vitals Historical Log' : item.label;

                           const isSelected = selectedWipeIds.includes(item.id);

                           return (
                             <div 
                               key={item.id}
                               className={`relative group rounded-xl border transition-all ${
                                 isSelected 
                                   ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-900/20' 
                                   : 'border-red-500/10 bg-red-500/5 hover:bg-red-500/15'
                               }`}
                             >
                               <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                 <input 
                                   type="checkbox"
                                   checked={isSelected}
                                   onChange={() => {
                                     setSelectedWipeIds(prev => 
                                       prev.includes(item.id) 
                                         ? prev.filter(i => i !== item.id) 
                                         : [...prev, item.id]
                                     )
                                   }}
                                   className="h-3.5 w-3.5 rounded border-red-500/30 bg-black/40 text-red-600 focus:ring-red-500/50 cursor-pointer"
                                 />
                               </div>

                               <button
                                 disabled={isBulkDeleting}
                                 onClick={async () => {
                                   if (isSelected) {
                                      // Toggle off if clicking while selected
                                      setSelectedWipeIds(prev => prev.filter(i => i !== item.id));
                                      return;
                                   }

                                   if (count === 0) {
                                     toast.error(`No data found for ${displayLabel}`);
                                     return;
                                   }

                                   if (confirm(`⚠️ CRITICAL: Are you sure you want to delete ALL ${count} items in "${displayLabel}"? This action is permanent and cannot be undone.`)) {
                                     if (!deleteItem) return;
                                     showNotification(`Wiping ${count} items...`, "error");
                                     
                                     try {
                                       const targets = records.filter(filter);
                                       for (const r of targets) {
                                         await deleteItem(r.id, r.type || "item", { skipRefresh: true });
                                       }
                                       window.dispatchEvent(new CustomEvent('vault-refresh'));
                                       toast.success(`Successfully deleted all ${displayLabel} data.`);
                                     } catch (e) {
                                       console.error(e);
                                       toast.error("Failed to complete wipe.");
                                     }
                                   }
                                 }}
                                 className="w-full h-full flex items-center justify-between p-3 transition-all text-left"
                               >
                                 <div className="text-left">
                                   <div className={`text-xs font-bold transition-colors ${isSelected ? 'text-white' : 'text-red-400 group-hover:text-red-300'}`}>
                                     Wipe {displayLabel}
                                   </div>
                                   <div className={`text-[10px] transition-opacity ${isSelected ? 'opacity-70' : 'opacity-40'}`}>
                                     {count} items recorded
                                   </div>
                                 </div>
                                 {!isSelected && (
                                   <Trash className="h-4 w-4 text-red-500 opacity-30 group-hover:opacity-100" />
                                 )}
                               </button>
                             </div>
                           );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-red-500/20 my-8" />

              {/* Master Actions Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-red-500/20 pb-4">
                  <Lock className="h-6 w-6 text-red-500" />
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter">Master Actions</h4>
                    <p className="text-xs text-gray-500">Global operations across the entire vault.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={async () => {
                      if (confirm("MASTER ERASE: Delete ALL PASSWORDS and logins?")) {
                        if (!deleteItem) return;
                        const pws = records.filter(r => r.type === "password" || r.type === "login")
                        if (pws.length === 0) return toast.info("No passwords found.");
                        if (confirm(`You are about to erase ${pws.length} passwords. This cannot be undone!`)) {
                          for (const r of pws) await deleteItem(r.id, "item", { skipRefresh: true })
                          window.dispatchEvent(new CustomEvent('vault-refresh'))
                          toast.success("All passwords erased.");
                        }
                      }
                    }}
                    className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-red-900/40 transition-all uppercase tracking-widest text-xs"
                  >
                    <Lock className="h-5 w-5" /> Erase All Passwords
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm("CRITICAL: Delete ALL folders? This will move all items to the root.")) {
                        if (!deleteItem) return;
                        const vaultFolders = records.filter(r => r.type === "folder")
                        if (vaultFolders.length === 0) return toast.info("No folders found.");
                        for (const r of vaultFolders) await deleteItem(r.id, "folder", { skipRefresh: true })
                        window.dispatchEvent(new CustomEvent('vault-refresh'))
                        toast.success("All folders removed.");
                      }
                    }}
                    className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-orange-900/40 transition-all uppercase tracking-widest text-xs"
                  >
                    <FolderTree className="h-5 w-5" /> Remove All Folders
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("MASTER RESET: Clear all module PIN locks? This will unlock Health, Diary, and all other sections.")) {
                        localStorage.removeItem("hub_security_settings");
                        window.dispatchEvent(new CustomEvent('vault-refresh'));
                        toast.success("Security settings reset.");
                        setTimeout(() => window.location.reload(), 1000);
                      }
                    }}
                    className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs"
                  >
                    <Unlock className="h-5 w-5" /> Reset Module Pins
                  </button>

                  <button
                    onClick={async () => {
                      const mockItems = records.filter(isItemMock);
                      
                      if (mockItems.length === 0) return toast.info("No mock data found to clean up.");
                      
                      if (confirm(`MASS CLEANUP: Found ${mockItems.length} mock records. Do you want to permanently delete them and keep only your real data?`)) {
                        if (!deleteItem) return;
                        toast.info("Cleaning up mock data...");
                        for (const item of mockItems) {
                          await deleteItem(item.id, item.type || "item", { skipRefresh: true });
                        }
                        window.dispatchEvent(new CustomEvent('vault-refresh'));
                        toast.success(`Successfully removed ${mockItems.length} mock records.`);
                      }
                    }}
                    className="w-full py-5 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/50 text-yellow-500 rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs"
                  >
                    <Database className="h-5 w-5" /> Wipe All Mock Data
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm("⚠️ NUCLEAR OPTION: Delete EVERY SINGLE PIECE of data in this vault (including folders and passwords)?")) {
                        if (confirm("FINAL WARNING: This is absolutely irreversible. Type 'DELETE' to continue.")) {
                          const input = prompt("Type 'DELETE' to confirm nuclear wipe:");
                          if (input === 'DELETE') {
                            if (!deleteItem) return;
                            const all = [...records];
                            for (const r of all) {
                              await deleteItem(r.id, r.type || "item", { skipRefresh: true });
                            }
                            window.dispatchEvent(new CustomEvent('vault-refresh'));
                            toast.success("Vault completely wiped.");
                            setTimeout(() => window.location.reload(), 1000);
                          }
                        }
                      }
                    }}
                    className="w-full py-5 bg-black border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs shadow-2xl"
                  >
                    <AlertCircle className="h-5 w-5" /> Nuclear Wipe (All Data)
                  </button>
                </div>
              </div>
            </div>
          )}
        </SettingsCard>
      </div>

      {showPinScreen && (
        <PinAuthScreen
          moduleName="Danger Zone"
          hashedPin="1234"
          theme={theme || "dark"}
          onSuccess={() => { setIsDangerZoneUnlocked(true); setShowPinScreen(false); }}
          onCancel={() => setShowPinScreen(false)}
        />
      )}

      {show2FA && (
        <TwoFactorAuthModal 
          onClose={() => setShow2FA(false)} 
          onEnable={(method: any) => {
            setTwoFactorEnabled(true)
            localStorage.setItem('hub_2fa_enabled', 'true')
            localStorage.setItem('hub_2fa_method', method)
            setShow2FA(false)
            showNotification("Two-factor authentication enabled successfully")
          }} 
        />
      )}
    </div>
  )
}

function ModuleAccessSettings({ 
  theme, 
  records, 
  deleteItem 
}: { 
  theme: string, 
  records: any[], 
  deleteItem: (id: string, type?: string, options?: any) => Promise<void> 
}) {
  // These IDs must match `activePage` values used in page.tsx
  const modules = [
    { id: "passwords", label: "Vault (Passwords)" },
    { id: "type-diary", label: "My Diary" },
    { id: "financial-cards", label: "Financial Hub" },
    { id: "type-budget", label: "Budget Manager" },
    { id: "type-health-records", label: "Health Records" },
    { id: "type-vehicles", label: "Vehicles" },
    { id: "type-business", label: "Business Hub" },
    { id: "type-assets", label: "Inventory & Assets" },
    { id: "type-digital-life", label: "Digital Life" },
    { id: "type-subscriptions", label: "Subscriptions" },
    { id: "type-secure-notes", label: "Secure Notes" },
    { id: "type-media", label: "Secure Media" },
    { id: "type-goals", label: "Goals" },
    { id: "type-knowledge", label: "Education & Knowledge" },
    { id: "type-travel", label: "Travel & Plans" }
  ]

  const [securitySettings, setSecuritySettings] = useState<Record<string, { isLocked: boolean, pin: string }>>(() => {
    try {
      const saved = localStorage.getItem("hub_security_settings")
      return saved ? JSON.parse(saved) : {}
    } catch (e) { return {} }
  })

  const [mockSettings, setMockSettings] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("hub_mock_settings");
      if (saved) return JSON.parse(saved);
      // Fallback for budget mock setting if it exists
      const budgetMock = localStorage.getItem("budget_mock_data_enabled") === "true";
      return { "type-budget": budgetMock };
    } catch (e) { return {} }
  })

  const [editingPin, setEditingPin] = useState<string | null>(null)
  const [tempPin, setTempPin] = useState("")

  const saveSettings = (newSettings: any) => {
    setSecuritySettings(newSettings)
    localStorage.setItem("hub_security_settings", JSON.stringify(newSettings))
    window.dispatchEvent(new Event("hub_security_settings_changed"))
  }

  const toggleLock = (moduleId: string) => {
    const current = securitySettings[moduleId] || { isLocked: false, pin: "0000" }
    const newVal = { ...current, isLocked: !current.isLocked }
    if (!current.pin) newVal.pin = "0000"

    saveSettings({
      ...securitySettings,
      [moduleId]: newVal
    })
  }

  const toggleMock = async (moduleId: string) => {
    const newVal = !mockSettings[moduleId];
    
    // If turning OFF, we need to actually remove any mock data from this module
    if (!newVal && deleteItem && records) {
      const confirmCleanup = window.confirm(`Turning off demo data for this module. Would you like to PERMANENTLY REMOVE all currently existing demo records from your database for "${modules.find(m => m.id === moduleId)?.label || moduleId}"? \n\n(Your real data will not be affected)`);
      
      if (confirmCleanup) {
        toast.info("Cleaning up demo data...");
        // Identify mock items for this module. 
        // We look for item_metadata.mock === true OR budget_mock === true
        const mockItems = records.filter(r => {
          if (!isItemMock(r)) return false;
          
          // Match module
          if (moduleId === "passwords" && (r.type === "password" || r.type === "login")) return true;
          if (moduleId === "diary" && r.type === "diary") return true;
          if (moduleId === "financial" && (r.type === "card" || r.type === "payment-card" || r.type === "financial-card")) return true;
          if (moduleId === "type-budget" && r.item_metadata?.is_budget === true) return true;
          if (moduleId === "type-health-records" && (r.type === "health-record" || r.category === "Health Records")) return true;
          if (moduleId === "type-vehicles" && r.type === "vehicle") return true;
          if (moduleId === "type-secure-notes" && (r.type === "note" || r.type === "secure-note")) return true;
          
          return false;
        });

        for (const item of mockItems) {
          await deleteItem(item.id, item.type || "item", { skipRefresh: true });
        }
        window.dispatchEvent(new CustomEvent('vault-refresh'));
        toast.success(`Removed ${mockItems.length} demo records.`);
      }
    }

    const updated = { ...mockSettings, [moduleId]: newVal };
    setMockSettings(updated);
    localStorage.setItem("hub_mock_settings", JSON.stringify(updated));
    
    // Explicitly handle budget for backwards compatibility
    if (moduleId === "type-budget") {
      localStorage.setItem("budget_mock_data_enabled", newVal.toString());
    }
    window.dispatchEvent(new Event('storage'));
  }

  const handleToggleAllMocks = async () => {
    const isAnyOn = Object.values(mockSettings).some(Boolean);
    const newVal = !isAnyOn; // If any is on, turn all off. If all off, turn all on.
    
    // Add warning when enabling all
    if (newVal) {
      const confirmWarning = window.confirm(
        "WARNING: You are about to turn on Demo Data for ALL modules at once.\n\nThis will instantly place fake demonstration data into your Vault, Passwords, Financial Cards, and every other active list. If you already have your own real, personal data scattered in these modules, it may become confusing to see them mixed with demo records.\n\nPlease note: Turning this OFF later will ONLY remove the fake entries. Your real data will be perfectly safe.\n\nStill, we highly recommend turning demo mode on 'one module at a time' simply for a cleaner viewing experience.\n\nAre you absolutely sure you want to flood the entire app with demo data right now?"
      );
      if (!confirmWarning) return;
    } else {
      // Turning OFF all mocks - cleanup records
      if (deleteItem && records) {
        const confirmCleanup = window.confirm("You are turning off the Master Demo Switch. Would you like to PERMANENTLY DELETE all demo records currently in your vault? \n\n(This ensures your real data is clean and unmixed)");
        if (confirmCleanup) {
          toast.info("Mass cleaning demo data...");
          const mockItems = records.filter(isItemMock);
          for (const item of mockItems) {
            await deleteItem(item.id, item.type || "item", { skipRefresh: true });
          }
          window.dispatchEvent(new CustomEvent('vault-refresh'));
          toast.success(`Cleaned up ${mockItems.length} demo items.`);
        }
      }
    }
    
    const updated: Record<string, boolean> = {};
    modules.forEach(m => {
      updated[m.id] = newVal;
    });
    setMockSettings(updated);
    localStorage.setItem("hub_mock_settings", JSON.stringify(updated));
    localStorage.setItem("budget_mock_data_enabled", newVal.toString());
    window.dispatchEvent(new Event('storage'));
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

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-4 ${theme === 'light' ? 'bg-gray-50 hover:bg-gray-100 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
      >
        <span className="font-medium text-sm">Configure Access Controls</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2">
          {/* Master Mock Toggle */}
          <div className={`flex items-center justify-between p-4 mb-4 rounded-2xl border transition-all ${theme === 'light' ? 'bg-yellow-50 border-yellow-200' : 'bg-black/40 border-yellow-500/20 shadow-lg shadow-yellow-500/5'}`}>
            <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg ${Object.values(mockSettings).some(Boolean) ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/10 text-gray-500'}`}>
                 <Database className="h-5 w-5" />
               </div>
               <div>
                 <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Master Demo Data Switch</h4>
                 <p className="text-[10px] text-gray-400 mt-1 max-w-[280px]">
                    Turn Demo Mode ON/OFF across all modules simultaneously. <br/>
                    <span className="text-yellow-500 font-bold mt-1 inline-block">Heads up: We recommend turning these on one-by-one instead.</span><br/>
                    <span className="opacity-70">Turning Demo off deletes the fake data, your real data is never touched.</span>
                 </p>
               </div>
            </div>
            <button
                onClick={handleToggleAllMocks}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all focus:outline-none ${Object.values(mockSettings).some(Boolean) ? 'bg-yellow-500' : 'bg-gray-700'}`}
                title="Toggle Master Mock Data"
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${Object.values(mockSettings).some(Boolean) ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map(mod => {
            const setting = securitySettings[mod.id] || { isLocked: false, pin: "" }
            const isMockEnabled = mockSettings[mod.id] || false
            const isEditing = editingPin === mod.id

            return (
              <div key={mod.id} className={`p-4 rounded-xl flex items-center justify-between transition-all ${theme === 'light' ? 'bg-gray-50 border border-gray-100' : 'bg-black/20 border border-white/5 hover:border-white/10'} `}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg transition-colors ${setting.isLocked ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/10 text-gray-400'} `}>
                    {setting.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </div>
                  <div>
                    <h3 className={`font-medium text-sm ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'} `}>{mod.label}</h3>
                    {setting.isLocked && <p className="text-[10px] text-gray-500 font-mono mt-0.5">PIN: {setting.pin ? "••••" : "Not Set"}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mock Data Toggle */}
                  <div className="flex flex-col items-center gap-1 mr-2 border-r border-white/10 pr-4">
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Toggle Mock Data</span>
                    <div className="flex items-center gap-2">
                      <Database className={`h-4 w-4 ${isMockEnabled ? 'text-yellow-400' : 'text-gray-500'}`} />
                      <button
                        onClick={() => toggleMock(mod.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all focus:outline-none ${isMockEnabled ? 'bg-yellow-500' : 'bg-gray-700'}`}
                        title="Toggle Mock/Demo Data"
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isMockEnabled ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Lock Toggle */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Toggle Access Lock</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 mt-1">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="PIN"
                          value={tempPin}
                          onChange={(e) => setTempPin(e.target.value.replace(/[^0-9]/g, ''))}
                          className={`w-16 px-2 py-1 text-center text-sm rounded bg-transparent border focus:outline-none focus:border-blue-500 ${theme === 'light' ? 'border-gray-300' : 'border-white/20'} `}
                          autoFocus
                        />
                        <button onClick={() => handleSetPin(mod.id)} className="p-1 hover:bg-green-500/20 text-green-500 rounded transition-colors"><Check className="h-4 w-4" /></button>
                        <button onClick={() => { setEditingPin(null); setTempPin("") }} className="p-1 hover:bg-red-500/20 text-red-500 rounded transition-colors"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center mt-1">
                        {setting.isLocked && (
                          <button
                            onClick={() => setEditingPin(mod.id)}
                            className="text-[10px] font-medium text-blue-400 hover:text-blue-300 transition-colors mr-2"
                          >
                            CHANGE PIN
                          </button>
                        )}
                        <button
                          onClick={() => toggleLock(mod.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${setting.isLocked ? 'bg-blue-600' : 'bg-gray-700'} `}
                          title="Toggle Access Lock"
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.isLocked ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        </div>
      )}
    </div>
  )
}
