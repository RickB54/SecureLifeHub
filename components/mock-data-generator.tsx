"use client"

import { useState } from "react"
import { Database, Loader2, Check, Trash, Sparkles } from "lucide-react"

interface MockDataGeneratorProps {
    bulkAddItems?: (items: any[]) => Promise<any>
    records: any[]
    deleteItem?: (id: string) => Promise<any>
    updateItem?: (id: string, updates: any) => Promise<any>
}

export default function MockDataGenerator({ bulkAddItems, records, deleteItem, updateItem }: MockDataGeneratorProps) {
    const [generating, setGenerating] = useState(false)
    const [removing, setRemoving] = useState(false)
    const [repairing, setRepairing] = useState(false)
    const [done, setDone] = useState(false)
    const [removedDone, setRemovedDone] = useState(false)
    const [repairDone, setRepairDone] = useState(false)

    const generateData = async () => {
        if (!bulkAddItems) return
        setGenerating(true)

        try {
            const categories = [
                "Logins", "Payment Cards", "Contacts", "Addresses", "Bank Accounts",
                "Files", "Photos", "Driver's Licenses", "Birth Certificates",
                "Databases", "Servers", "Health Insurance", "Memberships",
                "Secure Notes", "Passports", "Identity Cards", "Software Licenses",
                "SSH Keys", "General"
            ]

            const mockItems: any[] = []

            // Helper to add multiple items per category
            const addItems = (category: string, count: number, factory: (i: number) => any) => {
                for (let i = 1; i <= count; i++) {
                    const item = factory(i)
                    if (!item.item_metadata) item.item_metadata = {}
                    item.item_metadata.is_mock = true
                    mockItems.push(item)
                }
            }

            // 1. Logins (Standard Passwords)
            addItems("Logins", 6, (i) => ({
                type: "password",
                title: `Login Service ${i}`,
                username: `user${i}@example.com`,
                password: `strong-password-${Math.random().toString(36).substring(7)}`,
                website: `https://service${i}.com`,
                category: "Logins",
                notes: "Generated mock login"
            }))

            // 2. Payment Cards
            addItems("Payment Cards", 5, (i) => ({
                type: "financial-card",
                title: `Credit Card ${i} - Bank ${i}`,
                category: "Payment Cards",
                item_metadata: {
                    cardNumber: `4${Math.floor(Math.random() * 1000000000000000)}`,
                    cvv: Math.floor(Math.random() * 900) + 100,
                    expiry: "12/28",
                    cardType: i % 2 === 0 ? "Visa" : "Mastercard",
                    name: "John Doe",
                    pin: "1234"
                },
                is_favorite: i === 1
            }))

            // 3. Contacts
            addItems("Contacts", 5, (i) => ({
                type: "contact",
                title: `Contact ${i} - Friend`,
                category: "Contacts",
                item_metadata: {
                    firstName: "Jane",
                    lastName: `Doe ${i}`,
                    email: `jane.doe${i}@example.com`,
                    telephone: `555-010${i}`,
                    address: `${100 + i} Main St, City`,
                    company: `Company ${i}`
                }
            }))

            // 4. Addresses
            addItems("Addresses", 5, (i) => ({
                type: "address",
                title: `Address ${i} - Location`,
                category: "Addresses",
                item_metadata: {
                    address: `${i * 10} Oak Avenue, Springfield, IL`,
                    city: "Springfield",
                    state: "IL",
                    zip: "62704",
                    country: "USA"
                }
            }))

            // 5. Bank Accounts
            addItems("Bank Accounts", 5, (i) => ({
                type: "password", // Keeper treats these as complex records, often mapped to metadata
                title: `Bank Account ${i}`,
                category: "Bank Accounts",
                item_metadata: {
                    bankName: `Bank of America ${i}`,
                    accountType: "Checking",
                    accountNumber: `987654321${i}`,
                    routingNumber: `123456789`,
                    swiftCode: `BOFAUS3N`
                }
            }))

            // 6. Driver's Licenses
            addItems("Driver's Licenses", 5, (i) => ({
                type: "identity",
                title: `Driver's License ${i}`,
                category: "Driver's Licenses",
                item_metadata: {
                    licenseNumber: `D${Math.floor(Math.random() * 10000000)}`,
                    state: "CA",
                    expirationDate: "2030-01-01",
                    dob: "1990-05-15",
                    fullName: "John Doe"
                }
            }))

            // 7. Databases
            addItems("Databases", 5, (i) => ({
                type: "password",
                title: `Database Prod ${i}`,
                category: "Databases",
                username: "db_admin",
                password: "db_password_secure",
                item_metadata: {
                    hostname: `db-prod-${i}.aws.amazon.com`,
                    port: "5432",
                    databaseName: "users_db",
                    type: "PostgreSQL"
                }
            }))

            // 8. Servers
            addItems("Servers", 5, (i) => ({
                type: "password",
                title: `Server Node ${i}`,
                category: "Servers",
                username: "root",
                password: "root_password",
                item_metadata: {
                    hostname: `192.168.1.${10 + i}`,
                    protocol: "SSH",
                    privateKey: "-----BEGIN RSA PRIVATE KEY-----..."
                }
            }))

            // 9. Health Insurance
            addItems("Health Insurance", 5, (i) => ({
                type: "identity",
                title: `Health Insurance ${i}`,
                category: "Health Insurance",
                item_metadata: {
                    provider: "Blue Cross Blue Shield",
                    policyNumber: `XJ${Math.floor(Math.random() * 1000000)}`,
                    groupNumber: "12345",
                    subscriberName: "John Doe"
                }
            }))

            // 10. Memberships
            addItems("Memberships", 5, (i) => ({
                type: "password",
                title: `Membership ${i} - Gym`,
                category: "Memberships",
                username: "member_id",
                item_metadata: {
                    memberId: `MEMBER-${i}`,
                    provider: "Gold's Gym",
                    expirationDate: "2025-12-31"
                }
            }))

            // 11. Secure Notes
            addItems("Secure Notes", 5, (i) => ({
                type: "note",
                title: `Secure Note ${i}`,
                category: "Secure Notes",
                notes: `This is a secure note content #${i}. \nStore private info here.`
            }))

            // 12. Passports
            addItems("Passports", 5, (i) => ({
                type: "identity",
                title: `Passport ${i}`,
                category: "Passports",
                item_metadata: {
                    passportNumber: `P${Math.floor(Math.random() * 100000000)}`,
                    issuingCountry: "USA",
                    expirationDate: "2029-05-20",
                    fullName: "John Doe"
                }
            }))

            // 13. Identity Cards
            addItems("Identity Cards", 5, (i) => ({
                type: "identity",
                title: `National ID ${i}`,
                category: "Identity Cards",
                item_metadata: {
                    number: `ID-${i}`,
                    country: "France",
                    expirationDate: "2030-01-01"
                }
            }))

            // 14. Software Licenses
            addItems("Software Licenses", 5, (i) => ({
                type: "password",
                title: `Adobe Suite ${i}`,
                category: "Software Licenses",
                item_metadata: {
                    licenseKey: `XXXX-YYYY-ZZZZ-000${i}`,
                    product: "Photoshop",
                    purchaseDate: "2023-01-01"
                }
            }))

            // 15. SSH Keys
            addItems("SSH Keys", 5, (i) => ({
                type: "password",
                title: `SSH Key ${i} - AWS`,
                category: "SSH Keys",
                item_metadata: {
                    publicKey: "ssh-rsa AAAAB3NzaC1yc2E...",
                    privateKey: "-----BEGIN OPENSSH PRIVATE KEY-----...",
                    format: "OpenSSH"
                }
            }))

            // 16. General
            addItems("General", 5, (i) => ({
                type: "password",
                title: `Wifi Password ${i}`,
                category: "General",
                password: "wifi-password",
                item_metadata: {
                    ssid: `MyHomeWifi-${i}`,
                    security: "WPA2"
                }
            }))

            // Files, Photos, Birth Certificates - mainly File types or Identity
            // 17. Birth Certificates (Identity)
            addItems("Birth Certificates", 3, (i) => ({
                type: "identity",
                title: `Birth Certificate ${i}`,
                category: "Birth Certificates",
                item_metadata: {
                    name: "John Doe",
                    dob: "1990-01-01",
                    placeOfBirth: "New York"
                }
            }))

            await bulkAddItems(mockItems)
            setDone(true)
            setTimeout(() => setDone(false), 3000)
        } catch (e) {
            console.error("Failed to generate mock data", e)
        } finally {
            setGenerating(false)
        }
    }

    const removeMockData = async () => {
        if (!deleteItem) return
        if (!confirm("Are you sure you want to remove all mock data? This will only remove data marked as mock data.")) return

        setRemoving(true)
        try {
            const mockItems = records.filter(r => r.item_metadata?.is_mock === true)
            for (const item of mockItems) {
                await deleteItem(item.id)
            }
            setRemovedDone(true)
            setTimeout(() => setRemovedDone(false), 3000)
        } catch (e) {
            console.error("Failed to remove mock data", e)
        } finally {
            setRemoving(false)
        }
    }

    const isMisclassifiedMed = (r: any) => {
        const cat = r.category?.toLowerCase();
        const specificNames = ["Hydroxyzine", "Prednisone", "Loratadine", "Famotidine"];
        const isSpecificMed = specificNames.some(name => r.title?.toLowerCase().includes(name.toLowerCase()));

        const hasMedMetadata = r.item_metadata && (
            r.item_metadata.dosage ||
            r.item_metadata.frequency ||
            r.item_metadata.pillShape ||
            r.item_metadata.pillColor
        );

        const isMed = cat === "medications" ||
            cat === "health records" ||
            r.type === "medication" ||
            r.item_metadata?.notes === "Imported Prescription" ||
            isSpecificMed ||
            hasMedMetadata;

        return isMed && r.type === "password"
    }

    const repairVault = async () => {
        if (!updateItem) return
        setRepairing(true)
        try {
            const misclassified = records.filter(isMisclassifiedMed)
            for (const item of misclassified) {
                await updateItem(item.id, { type: "note" })
            }
            setRepairDone(true)
            setTimeout(() => setRepairDone(false), 3000)
        } catch (e) {
            console.error("Failed to repair vault", e)
        } finally {
            setRepairing(false)
        }
    }

    const misclassifiedCount = records.filter(isMisclassifiedMed).length

    console.log("🛠️ Vault Repair Check:", {
        recordsCount: records.length,
        misclassifiedCount,
        samplePasswords: records.filter(r => r.type === 'password').slice(0, 5).map(r => ({ title: r.title, cat: r.category }))
    });

    return (
        <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center text-yellow-500">
                <Database className="h-5 w-5 mr-2" />
                Demo Data
            </h3>
            <p className="text-sm text-gray-400 mb-6">
                Populate your vault with robust sample data matching Keeper Security record types.
            </p>
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={generateData}
                        disabled={generating || removing || repairing}
                        className="flex-1 min-w-[200px] flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 shadow-lg shadow-yellow-900/20"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Creating...
                            </>
                        ) : done ? (
                            <>
                                <Check className="h-5 w-5 mr-2" />
                                Data Added
                            </>
                        ) : (
                            <>
                                <Database className="h-5 w-5 mr-2" />
                                Generate Full Suite
                            </>
                        )}
                    </button>

                    <button
                        onClick={removeMockData}
                        disabled={generating || removing || repairing}
                        className="flex-1 min-w-[200px] flex items-center justify-center bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/30 px-4 py-3 rounded-xl font-bold transition-all duration-200 disabled:opacity-50"
                    >
                        {removing ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Removing...
                            </>
                        ) : removedDone ? (
                            <>
                                <Check className="h-5 w-5 mr-2" />
                                Cleaned!
                            </>
                        ) : (
                            <>
                                <Trash className="h-5 w-5 mr-2 opacity-50" />
                                Remove All Mock Data
                            </>
                        )}
                    </button>
                </div>

                <button
                    onClick={repairVault}
                    disabled={repairing}
                    className={`w-full flex items-center justify-center border px-4 py-3 rounded-xl font-bold transition-all ${misclassifiedCount > 0
                            ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse-slow"
                            : "bg-gray-500/5 hover:bg-gray-500/10 text-gray-500 border-gray-700"
                        }`}
                >
                    {repairing ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Repairing {misclassifiedCount} items...
                        </>
                    ) : repairDone ? (
                        <>
                            <Check className="h-5 w-5 mr-2" />
                            Vault Repaired!
                        </>
                    ) : misclassifiedCount > 0 ? (
                        <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Fix {misclassifiedCount} Meds in Passwords Section
                        </>
                    ) : (
                        <>
                            <Check className="h-5 w-5 mr-2 opacity-30" />
                            Scan & Fix Medication Visibility
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
