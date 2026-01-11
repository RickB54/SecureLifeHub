import { ChevronsDown, ChevronsUp, Home, Key, Wand2, CreditCard, User, Settings, ChevronDown, ChevronRight, FileText, Shield, Star, Car, Wrench, Briefcase, Users, Box, Globe, Smartphone, Book, Plane, Target, Image, Trash } from "lucide-react"

export const sidebarSections = [
    {
        id: "dashboard",
        title: "Dashboard",
        color: "blue",
        items: [{ id: "dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> }],
        isTopLevel: true,
    },
    {
        id: "vault",
        title: "Vault",
        color: "purple",
        items: [{ id: "all-items", label: "Vault", icon: <Key className="h-5 w-5" /> }],
        isTopLevel: true,
    },
    {
        id: "payment-cards",
        title: "Payment Cards",
        color: "emerald",
        items: [{ id: "type-payment-cards", label: "Payment Cards", icon: <CreditCard className="h-5 w-5" /> }],
        isTopLevel: true,
    },
    {
        id: "vault-advanced",
        title: "Vault Advanced",
        color: "orange",
        items: [
            { id: "favorites", label: "Favorites", icon: <Star className="h-5 w-5" /> },
            { id: "trash", label: "Deleted", icon: <Trash className="h-5 w-5" /> },
            { id: "generate-password", label: "Generate Password", icon: <Wand2 className="h-5 w-5" /> },
        ],
    },
    {
        id: "healthFitness",
        title: "Health & Fitness",
        color: "rose",
        items: [
            { id: "type-health-records", label: "Health Records", icon: <FileText className="h-4 w-4" /> },
            { id: "type-medications", label: "Medications", icon: <FileText className="h-4 w-4" /> },
            { id: "type-vitals", label: "Vitals", icon: <FileText className="h-4 w-4" /> },
            { id: "type-health-diary", label: "Health Diary", icon: <FileText className="h-4 w-4" /> },
            { id: "type-medical", label: "Health Insurance", icon: <FileText className="h-4 w-4" /> },
        ]
    },
    {
        id: "vehicles",
        title: "Vehicles & Transport",
        color: "amber",
        items: [
            { id: "type-vehicles", label: "Vehicle Profiles", icon: <Car className="h-4 w-4" /> },
            { id: "type-vehicle-docs", label: "Registration & Docs", icon: <FileText className="h-4 w-4" /> },
            { id: "type-maintenance", label: "Maintenance Logs", icon: <Wrench className="h-4 w-4" /> },
        ]
    },
    {
        id: "business",
        title: "Business & Projects",
        color: "indigo",
        items: [
            { id: "type-business", label: "Business Hub", icon: <Briefcase className="h-4 w-4" /> },
            { id: "type-clients", label: "Client Records", icon: <Users className="h-4 w-4" /> },
        ]
    },
    {
        id: "assets",
        title: "Assets & Inventory",
        color: "cyan",
        items: [
            { id: "type-assets", label: "Asset Ledger", icon: <Box className="h-4 w-4" /> },
            { id: "type-budget", label: "Budget Manager", icon: <CreditCard className="h-4 w-4" /> },
        ]
    },
    {
        id: "media",
        title: "Memories & Media",
        color: "pink",
        items: [
            { id: "type-media", label: "Secure Pictures & Videos", icon: <Image className="h-4 w-4" /> },
        ]
    },
    {
        id: "goals",
        title: "Goals & Planning",
        color: "teal",
        items: [
            { id: "type-goals", label: "Goals & Timeline", icon: <Target className="h-4 w-4" /> },
        ]
    },
    {
        id: "digitalLife",
        title: "Social Life",
        color: "violet",
        items: [
            { id: "type-digital-life", label: "Online Presence", icon: <Globe className="h-4 w-4" /> },
            { id: "type-diary", label: "My Diary", icon: <Book className="h-4 w-4" /> },
            { id: "type-subscriptions", label: "Subscription Manager", icon: <CreditCard className="h-4 w-4" /> },
            { id: "type-social", label: "Social Media", icon: <Smartphone className="h-4 w-4" /> },
        ]
    },
    {
        id: "configuration",
        title: "Configuration",
        color: "gray",
        items: [
            { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
            { id: "security-audit", label: "Security Audit", icon: <Shield className="h-5 w-5" /> }
        ],
    },
]

