"use client"

import { useState } from "react"
import { Database, Loader2, Check } from "lucide-react"

interface MockDataGeneratorProps {
    bulkAddItems?: (items: any[]) => Promise<any>
}

export default function MockDataGenerator({ bulkAddItems }: MockDataGeneratorProps) {
    const [generating, setGenerating] = useState(false)
    const [done, setDone] = useState(false)

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

    return (
        <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center text-yellow-500">
                <Database className="h-5 w-5 mr-2" />
                Demo Data
            </h3>
            <p className="text-sm text-gray-500 mb-4">
                Populate your vault with robust sample data matching Keeper Security record types.
            </p>
            <button
                onClick={generateData}
                disabled={generating}
                className="flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition duration-200 disabled:opacity-50"
            >
                {generating ? (
                    <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Generating...
                    </>
                ) : done ? (
                    <>
                        <Check className="h-5 w-5 mr-2" />
                        Data Added
                    </>
                ) : (
                    <>
                        <Database className="h-5 w-5 mr-2" />
                        Generate Mock Data (Full Suite)
                    </>
                )}
            </button>
        </div>
    )
}
