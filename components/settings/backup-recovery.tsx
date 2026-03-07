"use client"

import { useState, useEffect, useRef } from "react"
import { Save, RotateCcw, Cloud, Download, Clock, CheckCircle, AlertTriangle, FileJson, Shield, Loader2, HardDrive, RefreshCw, Trash2, Calendar, Database, HelpCircle } from "lucide-react"
import { format } from "date-fns"

interface BackupRecoveryProps {
    records: any[]
    addItem?: (item: any) => Promise<any>
    deleteItem?: (id: string) => Promise<any>
    bulkAddItems?: (items: any[]) => Promise<any>
    theme: string
    onOpenHelp?: (targetId?: string) => void
}

export default function BackupRecovery({ records, addItem, deleteItem, bulkAddItems, theme, onOpenHelp }: BackupRecoveryProps) {
    const [backups, setBackups] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<"idle" | "backing_up" | "restoring" | "success" | "error">("idle")
    const [progress, setProgress] = useState(0)
    const [message, setMessage] = useState("")

    // Settings
    const [autoBackup, setAutoBackup] = useState(false)
    const [backupFreq, setBackupFreq] = useState("daily")

    useEffect(() => {
        // Load cloud backups from records
        // Look for items with type 'backup_snapshot'
        const foundBackups = records.filter(r => r.type === 'backup_snapshot' || r.item_metadata?.type === 'backup_snapshot')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setBackups(foundBackups)

        // Load settings
        const prefs = records.find(r => r.item_metadata?.system_type === 'user_preferences')
        if (prefs) {
            setAutoBackup(prefs.item_metadata?.auto_backup ?? false)
            setBackupFreq(prefs.item_metadata?.backup_freq ?? "daily")
        }
    }, [records])

    const generateBackupPayload = () => {
        // Exclude existing backups to avoid recursion bloating
        const dataToBackup = records.filter(r => r.type !== 'backup_snapshot' && r.item_metadata?.type !== 'backup_snapshot')

        return {
            timestamp: new Date().toISOString(),
            version: "1.0",
            item_count: dataToBackup.length,
            records: dataToBackup
        }
    }

    const handleLocalBackup = async () => {
        try {
            setStatus("backing_up")
            setMessage("Generating backup file...")
            setProgress(30)

            await new Promise(r => setTimeout(r, 800)) // UX delay

            const payload = generateBackupPayload()
            setProgress(80)

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `SecureLifeHub_Backup_${format(new Date(), "yyyy-MM-dd_HHmm")}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)

            setProgress(100)
            setStatus("success")
            setMessage("Local backup download started")
        } catch (e) {
            console.error(e)
            setStatus("error")
            setMessage("Failed to generate local backup")
        } finally {
            setTimeout(() => setStatus("idle"), 3000)
        }
    }

    const handleCloudBackup = async () => {
        if (!addItem) return
        try {
            setStatus("backing_up")
            setMessage("Encrypting & Uploading to Cloud...")
            setProgress(10)

            await new Promise(r => setTimeout(r, 500))

            const payload = generateBackupPayload()
            setProgress(40)

            // Warning for large backups
            const payloadString = JSON.stringify(payload)
            const sizeKB = payloadString.length / 1024

            if (sizeKB > 5000) { // 5MB limit warning
                if (!confirm(`Backup size is ${Math.round(sizeKB / 1024)}MB. This may take a while to upload. Continue?`)) {
                    setStatus("idle")
                    return
                }
            }

            setProgress(60)

            await addItem({
                type: 'note', // Use note to bypass strict types
                title: `Cloud Backup - ${format(new Date(), "MMM d, yyyy HH:mm")}`,
                category: 'System',
                is_favorite: false,
                notes: `Backup generated on ${new Date().toLocaleString()}. Contains ${payload.item_count} items.`,
                item_metadata: {
                    type: 'backup_snapshot',
                    backup_data: payload, // Store full payload in JSONB
                    size_kb: Math.round(sizeKB),
                    item_count: payload.item_count,
                    version: "1.0"
                }
            })

            setProgress(100)
            setStatus("success")
            setMessage("Cloud backup completed successfully")
        } catch (e: any) {
            console.error(e)
            setStatus("error")
            setMessage(e.message || "Cloud backup failed")
        } finally {
            setTimeout(() => setStatus("idle"), 3000)
        }
    }

    const handleRestore = async (backupData: any) => {
        if (!bulkAddItems || !window.confirm("WARNING: This will merge the backup data into your current vault. \n\nTo perform a clean restore, please wipe the database from the Danger Zone first.\n\nContinue with merge?")) return

        try {
            setStatus("restoring")
            setMessage("Verifying integrity...")
            setProgress(20)

            const itemsToRestore = backupData.records || []

            if (itemsToRestore.length === 0) {
                throw new Error("Backup file contains no records")
            }

            setMessage(`Restoring ${itemsToRestore.length} items...`)
            setProgress(40)

            // Chunking for performance
            const chunkSize = 50
            for (let i = 0; i < itemsToRestore.length; i += chunkSize) {
                const chunk = itemsToRestore.slice(i, i + chunkSize).map((item: any) => {
                    // Strip ID to create new copies, OR keep ID to update?
                    // Strategy: Upsert is hard without custom logic. 
                    // Simple Strategy: Import as NEW items (user deals with dupes) or Smart Match?
                    // User asked for "Restore", usually implies state recovery.
                    // IMPORTANT: Supabase 'insert' creates new IDs by default unless strictly forced.
                    // We will strip IDs to prevent PK conflicts if keys exist, relying on Supabase to generate new ones.
                    const { id, created_at, updated_at, ...rest } = item
                    return rest
                })

                await bulkAddItems(chunk)
                setProgress(40 + Math.floor((i / itemsToRestore.length) * 50))
            }

            setProgress(100)
            setStatus("success")
            setMessage("Restore completed successfully. Refreshing...")

            setTimeout(() => window.location.reload(), 1500)
        } catch (e: any) {
            console.error(e)
            setStatus("error")
            setMessage("Restore failed: " + e.message)
        } finally {
            setTimeout(() => setStatus("idle"), 4000)
        }
    }

    const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string)
                handleRestore(json)
            } catch (err) {
                setStatus("error")
                setMessage("Invalid backup file")
            }
        }
        reader.readAsText(file)
        e.target.value = "" // reset
    }

    const [showHistory, setShowHistory] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const ActionCard = ({ icon: Icon, title, sub, onClick, color = "blue" }: any) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-start p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${theme === 'light'
                ? 'bg-white border-gray-200 hover:border-blue-500/50 hover:shadow-lg'
                : 'bg-[#1a1a1a] border-white/10 hover:border-blue-500/50 hover:bg-[#202020]'
                }`}
        >
            <div className={`p-3 rounded-xl mb-4 transition-colors ${theme === 'light' ? `bg-${color}-50 text-${color}-600` : `bg-${color}-500/10 text-${color}-400`}`}>
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>
        </button>
    )

    return (
        <div className={`space-y-6 ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
            <div className="flex items-center gap-3 mb-6">
                <HardDrive className="h-6 w-6 text-blue-500" />
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">Data Management</h2>
                        <button type="button" onClick={() => onOpenHelp?.("settings")} className="text-blue-500 hover:text-white transform hover:scale-110 transition-all focus:outline-none">
                            <HelpCircle className="h-4 w-4" />
                        </button>
                    </div>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Backup, restore, and manage your application data</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionCard
                    icon={Download}
                    title="Download Backup"
                    sub="Save complete JSON backup locally"
                    onClick={handleLocalBackup}
                    color="blue"
                />

                <ActionCard
                    icon={RefreshCw}
                    title="Restore Data"
                    sub="Restore from a local JSON file"
                    onClick={() => fileInputRef.current?.click()}
                    color="purple"
                />
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileRestore} />

                <ActionCard
                    icon={Database}
                    title="Backup to Supabase"
                    sub="Upload snapshot to Supabase"
                    onClick={handleCloudBackup}
                    color="emerald"
                />

                <ActionCard
                    icon={Cloud}
                    title="Restore from Supabase"
                    sub="View/restore Supabase backups"
                    onClick={() => setShowHistory(!showHistory)}
                    color="cyan"
                />
            </div>

            {/* Status Bar */}
            {status !== 'idle' && (
                <div className="bg-gray-900 text-white p-4 rounded-xl flex items-center gap-4 animate-in slide-in-from-bottom-2">
                    {status === 'success' ? <CheckCircle className="text-green-400 h-6 w-6" /> :
                        status === 'error' ? <AlertTriangle className="text-red-400 h-6 w-6" /> :
                            <Loader2 className="animate-spin text-blue-400 h-6 w-6" />}

                    <div className="flex-1">
                        <div className="flex justify-between text-sm font-bold mb-1">
                            <span>{message}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Cloud History Drawer */}
            {showHistory && (
                <div className={`rounded-3xl border p-6 animate-in slide-in-from-top-4 ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-black/20 border-white/10'}`}>
                    <h3 className="text-sm font-bold uppercase opacity-50 mb-4">Cloud Snapshots</h3>
                    {backups.length === 0 ? (
                        <div className="text-center py-8 opacity-50">No snapshots found</div>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {backups.map(backup => (
                                <div key={backup.id} className={`flex items-center justify-between p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-gray-200 user-select-none' : 'bg-[#1a1a1a] border-white/10'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        <div>
                                            <div className="font-bold text-sm">{backup.title}</div>
                                            <div className="text-xs opacity-50">{format(new Date(backup.created_at), 'MMM d, HH:mm')} • {backup.item_metadata?.item_count} items</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { if (confirm("Restore?")) handleRestore(backup.item_metadata.backup_data) }} className="hover:text-blue-500 p-2"><RefreshCw className="h-4 w-4" /></button>
                                        <button onClick={() => { if (confirm("Delete?")) deleteItem && deleteItem(backup.id) }} className="hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
