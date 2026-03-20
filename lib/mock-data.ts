import { format } from "date-fns"

export const MOCKED_PASSWORDS = [
    {
        id: "mock-p1",
        title: "Netflix Home Account",
        category: "Logins",
        vault_category: "Social",
        is_favorite: true,
        item_metadata: {
            username: "rick.grimes@example.com",
            password: "••••••••••••",
            url: "https://netflix.com",
            notes: "Shared with the family."
        }
    },
    {
        id: "mock-p2",
        title: "Chase Sapphire Preferred",
        category: "Payment Cards",
        vault_category: "Financial",
        is_favorite: true,
        item_metadata: {
            cardholder_name: "Richard Grimes",
            card_number: "•••• •••• •••• 4421",
            expiry_date: "05/28",
            cvv: "•••",
            issuer: "Chase Bank"
        }
    },
    {
        id: "mock-p3",
        title: "Main Residence",
        category: "Addresses",
        vault_category: "Personal",
        item_metadata: {
            address_line_1: "123 Alexandria Way",
            city: "Alexandria",
            state: "VA",
            zip_code: "22314",
            country: "USA"
        }
    }
]

export const MOCKED_HEALTH = [
    {
        id: "mock-h1",
        title: "Annual Physical Exam",
        category: "Health Records",
        health_category: "General",
        item_metadata: {
            provider: "Dr. Abraham Ford",
            date: format(new Date(), "yyyy-MM-dd"),
            results: "All vitals within normal range. BP slightly elevated but stable.",
            follow_up: "Check again in 6 months."
        }
    },
    {
        id: "mock-h2",
        title: "Daily Multi-Vitamin",
        category: "Medications",
        health_category: "Daily",
        item_metadata: {
            dosage: "1 Tablet",
            frequency: "Daily - Morning",
            purpose: "General health maintenance",
            started: "2024-01-01"
        }
    },
    {
        id: "mock-h3",
        title: "Morning Vitals Scan",
        category: "Vitals",
        health_category: "Daily",
        item_metadata: {
            blood_pressure: "120/80",
            heart_rate: "68 bpm",
            oxygen: "98%",
            weight: "175 lbs",
            date: format(new Date(), "yyyy-MM-dd")
        }
    }
]

export const MOCKED_SUBSCRIPTIONS = [
    {
        id: "mock-s1",
        title: "Spotify Premium",
        category: "Subscriptions",
        item_metadata: {
            cost: 10.99,
            frequency: "monthly",
            renewal_date: format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
            provider: "Spotify",
            status: "active"
        }
    },
    {
        id: "mock-s2",
        title: "Adobe Creative Cloud",
        category: "Subscriptions",
        item_metadata: {
            cost: 54.99,
            frequency: "monthly",
            renewal_date: format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
            provider: "Adobe",
            status: "active"
        }
    }
]

export const MOCKED_GOALS = [
    {
        id: "mock-g1",
        title: "Complete Marathon Training",
        category: "Goals",
        goal_status: "in-progress",
        item_metadata: {
            target_date: "2024-12-31",
            progress: 45,
            priority: "high",
            notes: "Ran 15 miles this weekend."
        }
    },
    {
        id: "mock-g2",
        title: "Morning Meditation Stack",
        category: "Habits",
        goal_status: "active",
        item_metadata: {
            streak: 12,
            best_streak: 30,
            frequency: "daily",
            stability_index: 85
        }
    }
]

export const MOCKED_TASKS = [
    {
        id: "mock-t1",
        title: "Refactor API Infrastructure",
        category: "Tasks",
        item_metadata: {
            priority: "Urgent",
            status: "In Progress",
            due_date: format(new Date(), "yyyy-MM-dd"),
            source: "Secure Database"
        }
    },
    {
        id: "mock-t2",
        title: "Audit Password Security Levels",
        category: "Tasks",
        item_metadata: {
            priority: "Medium",
            status: "Active",
            due_date: format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
            source: "Vault"
        }
    }
]

export const MOCKED_BUDGET = [
    { id: 'm1', category: 'Budget', title: 'Groceries', item_metadata: { budget_type: 'personal', entry_type: 'expense', amount: 150.00, category: 'Food', date: format(new Date(), 'yyyy-MM-dd') } },
    { id: 'm2', category: 'Budget', title: 'Rent', item_metadata: { budget_type: 'personal', entry_type: 'expense', amount: 1200.00, category: 'Housing', date: format(new Date(), 'yyyy-MM-dd') } },
    { id: 'm3', category: 'Budget', title: 'Electric Bill', item_metadata: { budget_type: 'personal', entry_type: 'expense', amount: 95.50, category: 'Utilities', date: format(new Date(), 'yyyy-MM-dd') } },
    { id: 'm11', category: 'Budget', title: 'Salary', item_metadata: { budget_type: 'personal', entry_type: 'income', amount: 2500.00, category: 'Salary', date: format(new Date(), 'yyyy-MM-dd') } },
]
