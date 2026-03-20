import { format, subDays, addDays } from "date-fns"

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
        title: "Blood Pressure",
        category: "Vitals",
        health_category: "Daily",
        item_metadata: {
            value: "118/78",
            unit: "mmHg",
            date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
            notes: "Stable morning reading."
        }
    },
    {
        id: "mock-h3-2",
        title: "Blood Pressure",
        category: "Vitals",
        health_category: "Daily",
        item_metadata: {
            value: "121/81",
            unit: "mmHg",
            date: format(new Date(), "yyyy-MM-dd"),
            notes: "Slightly elevated after coffee."
        }
    },
    {
        id: "mock-h-weight",
        title: "Weight",
        category: "Vitals",
        item_metadata: {
            value: "178.5",
            unit: "lbs",
            date: format(subDays(new Date(), 2), "yyyy-MM-dd")
        }
    },
    {
        id: "mock-h-weight-2",
        title: "Weight",
        category: "Vitals",
        item_metadata: {
            value: "177.2",
            unit: "lbs",
            date: format(new Date(), "yyyy-MM-dd")
        }
    },
    {
        id: "mock-h4",
        type: "health-checkin",
        title: "Daily Check-in: 😊",
        category: "Health Diary",
        item_metadata: {
            date: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            mood: "😊",
            energy: 8,
            capacity: "High",
            notes: "Feeling great after a good sleep.",
            is_diary: true
        }
    },
    {
        id: "mock-h5",
        type: "health-record",
        title: "General Practitioner Visit",
        category: "Health Records",
        item_metadata: {
            is_health_record: true,
            type: "Appointment",
            date: format(addDays(new Date(), 2), "yyyy-MM-dd'T'10:00:00"),
            doctor: "Dr. Hershel Greene",
            location: "Alexandria Medical Center",
            specialty: "Family Medicine",
            notes: "Routine semi-annual checkup."
        }
    }
]

export const MOCKED_SUBSCRIPTIONS = [
    {
        id: "mock-s1",
        title: "Spotify Premium",
        type: "subscription",
        category: "Subscriptions",
        item_metadata: {
            cost: "10.99",
            billing_cycle: "Monthly",
            renewal_date: format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
            sub_category: "Music",
            status: "active",
            auto_renew: true,
            color: "#1DB954"
        }
    },
    {
        id: "mock-s2",
        title: "Adobe Creative Cloud",
        type: "subscription",
        category: "Subscriptions",
        item_metadata: {
            cost: "54.99",
            billing_cycle: "Monthly",
            renewal_date: format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
            sub_category: "Software",
            status: "active",
            auto_renew: true,
            color: "#FF0000"
        }
    }
]

export const MOCKED_GOALS = [
    {
        id: "mock-g1",
        title: "Complete Marathon Training",
        category: "Goals",
        item_metadata: {
            is_goal: true,
            target_date: "2024-12-31",
            progress: 45,
            priority: "high",
            notes: "Ran 15 miles this weekend.",
            checkpoints: [
                { id: "cp1", title: "5K Baseline", completed: true },
                { id: "cp2", title: "10K Milestone", completed: true },
                { id: "cp3", title: "Half Marathon", completed: false }
            ]
        }
    },
    {
        id: "mock-g2",
        title: "Morning Meditation Stack",
        category: "Goals",
        item_metadata: {
            is_goal: true,
            streak: 12,
            best_streak: 30,
            frequency: "daily",
            progress: 85,
            priority: "medium",
            is_habit: true
        }
    }
]

export const MOCKED_TASKS = [
    {
        id: "mock-t1",
        type: "architect-task",
        title: "Refactor API Infrastructure",
        category: "Tasks",
        item_metadata: {
            priority: "urgent",
            completed: false,
            description: "Update the core routing matrix for better throughput.",
            category: "Core Ops",
            dueDate: format(new Date(), "yyyy-MM-dd")
        }
    },
    {
        id: "mock-t2",
        type: "architect-task",
        title: "Audit Security Protocols",
        category: "Tasks",
        item_metadata: {
            priority: "high",
            completed: true,
            description: "Review all RSA keys and rotation intervals.",
            category: "Security",
            dueDate: format(addDays(new Date(), 2), "yyyy-MM-dd")
        }
    }
]

export const MOCKED_BUDGET = [
    { id: 'm1', category: 'Budget', title: 'Groceries', item_metadata: { budget_type: 'personal', entry_type: 'expense', amount: 150.00, category: 'Food', date: format(new Date(), 'yyyy-MM-dd') } },
    { id: 'm2', category: 'Budget', title: 'Rent', item_metadata: { budget_type: 'personal', entry_type: 'expense', amount: 1200.00, category: 'Housing', date: format(new Date(), 'yyyy-MM-dd') } },
    { id: 'm3', category: 'Budget', title: 'Electric Bill', item_metadata: { budget_type: 'personal', entry_type: 'expense', amount: 95.50, category: 'Utilities', date: format(new Date(), 'yyyy-MM-dd') } },
    { id: 'm11', category: 'Budget', title: 'Salary', item_metadata: { budget_type: 'personal', entry_type: 'income', amount: 2500.00, category: 'Salary', date: format(new Date(), 'yyyy-MM-dd') } },
]
