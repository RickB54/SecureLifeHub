"use client"

import { useState, useEffect } from "react"
import { Plus, Globe, Trash2, Key, Users, Shield, Copy, Eye, EyeOff, Smartphone, Youtube, Facebook, Twitter, Instagram, Linkedin, Video, ExternalLink, Calendar, MapPin, Newspaper, TrendingUp, Filter, Bookmark, Search, Clock, ArrowRight, RefreshCw, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Props {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
    initialTab?: string
}

// --- API Helpers (RSS to JSON proxies for interactions without Backend Keys) ---
const RSS_TO_JSON_API = "https://api.rss2json.com/v1/api.json?rss_url="
const FEEDS = {
    world: "http://feeds.bbci.co.uk/news/world/rss.xml",
    tech: "http://feeds.feedburner.com/TechCrunch/",
    sports: "https://www.espn.com/espn/rss/news",
    entertainment: "https://www.eonline.com/syndication/feeds/rssfeeds/topstories.xml",
    finance: "https://feeds.bloomberg.com/markets/news.rss"
}

export default function DigitalLife({ records, addItem, deleteItem, theme, initialTab = "hub" }: Props) {
    const [items, setItems] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState(initialTab) // hub, assets, legacy, audit
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedNewsFilter, setSelectedNewsFilter] = useState("world")

    // --- Live Data State ---
    const [newsData, setNewsData] = useState<any[]>([])
    const [eventsData, setEventsData] = useState<any[]>([])
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [dataError, setDataError] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [showAllEvents, setShowAllEvents] = useState(false)

    useEffect(() => {
        setItems(records.filter(r => r.category === "Digital Life" || r.item_metadata?.is_digital))
    }, [records])

    // Fetch Live Data on Mount (Category Change)
    useEffect(() => {
        if (activeTab === 'hub') {
            fetchLiveData()
        }
    }, [activeTab, selectedNewsFilter])

    const fetchLiveData = async () => {
        setIsLoadingData(true)
        setDataError(false)
        try {
            const feedUrl = FEEDS[selectedNewsFilter as keyof typeof FEEDS] || FEEDS.world
            const newsRes = await fetch(`${RSS_TO_JSON_API}${encodeURIComponent(feedUrl)}`)
            const newsJson = await newsRes.json()

            if (newsJson.items) {
                setNewsData(newsJson.items.map((item: any, idx: number) => ({
                    id: idx,
                    title: item.title,
                    category: selectedNewsFilter,
                    time: new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    source: newsJson.feed?.title || "News Source",
                    url: item.link
                })))
            }

            const year = new Date().getFullYear()
            const countryCode = "US" 
            const holidaysRes = await fetch(`https://date.nager.at/api/v3/NextPublicHolidays/${countryCode}`)
            const holidaysJson = await holidaysRes.json()

            if (Array.isArray(holidaysJson)) {
                setEventsData(holidaysJson.map((h: any, idx: number) => ({
                    id: `${h.date}-${idx}`,
                    title: h.localName,
                    date: h.date,
                    location: "National",
                    type: "Holiday"
                })))
            }

            setLastUpdated(new Date())

        } catch (error) {
            console.error("Failed to fetch live data", error)
            setDataError(true)
            toast.error("Could not refresh live feed")
        } finally {
            setIsLoadingData(false)
        }
    }

    const assets = items.filter(i => !i.item_metadata?.is_legacy && !i.item_metadata?.is_2fa)
    const legacyContacts = items.filter(i => i.item_metadata?.is_legacy)

    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm"
        : "bg-white/5 border border-white/10"

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    const socialLinks = [
        { name: "YouTube", icon: Youtube, color: "text-red-500", url: "https://youtube.com" },
        { name: "Facebook", icon: Facebook, color: "text-blue-600", url: "https://facebook.com" },
        { name: "Instagram", icon: Instagram, color: "text-pink-500", url: "https://instagram.com" },
        { name: "Twitter / X", icon: Twitter, color: "text-sky-500", url: "https://twitter.com" },
        { name: "TikTok", icon: Video, color: "text-black dark:text-white", url: "https://tiktok.com" },
        { name: "LinkedIn", icon: Linkedin, color: "text-blue-700", url: "https://linkedin.com" },
        { name: "Pinterest", icon: MapPin, color: "text-red-600", url: "https://pinterest.com" },
        { name: "Reddit", icon: ExternalLink, color: "text-orange-500", url: "https://reddit.com" },
    ]

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500 flex items-center gap-3">
                            <Smartphone className="h-8 w-8 text-pink-500" /> Social Life
                        </h1>
                        <p className="text-gray-400 mt-1">Social media, live news, and events.</p>
                    </div>
                    {activeTab === 'hub' && (
                        <div className="flex items-center gap-2">
                            <span className={`text-xs ${isLoadingData ? 'text-yellow-500' : 'text-green-500'} flex items-center gap-1`}>
                                <span className={`block h-2 w-2 rounded-full ${isLoadingData ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                                {isLoadingData ? 'Updating...' : 'Live'}
                            </span>
                            <button onClick={fetchLiveData} disabled={isLoadingData} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isLoadingData ? 'animate-spin' : ''}`}>
                                <RefreshCw className="h-4 w-4 opacity-50" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
                    {['hub', 'assets', 'legacy', 'audit'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === tab
                                ? "bg-pink-500 text-white"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {tab === 'hub' && <TrendingUp className="h-4 w-4" />}
                            {tab === 'assets' && <Globe className="h-4 w-4" />}
                            {tab === 'legacy' && <Users className="h-4 w-4" />}
                            {tab === 'audit' && <Shield className="h-4 w-4" />}
                            {tab === 'hub' ? 'Social Hub' : tab === 'assets' ? 'Online Assets' : tab === 'legacy' ? 'Legacy Contacts' : 'Security Audit'}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto px-8 pb-8 space-y-6 custom-scrollbar ${isLoadingData ? 'opacity-80' : ''}`}>

                {activeTab === 'hub' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <section>
                            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                <ExternalLink className="h-5 w-5 text-pink-500" /> Quick Access
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all hover:scale-105 ${glassCardStyle} hover:bg-white/10 group`}
                                    >
                                        <link.icon className={`h-8 w-8 mb-2 ${link.color} group-hover:drop-shadow-lg transition-all`} />
                                        <span className={`text-xs font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{link.name}</span>
                                    </a>
                                ))}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className={`text-lg font-bold flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                        <Newspaper className="h-5 w-5 text-purple-500" />
                                        {selectedNewsFilter.charAt(0).toUpperCase() + selectedNewsFilter.slice(1)} News
                                    </h2>
                                    <div className="flex gap-2">
                                        {['world', 'tech', 'finance', 'sports', 'entertainment'].map(filter => (
                                            <button
                                                key={filter}
                                                onClick={() => setSelectedNewsFilter(filter)}
                                                className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg border transition-colors ${selectedNewsFilter === filter ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-500/30 text-gray-500 hover:text-gray-300'}`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 min-h-[300px]">
                                    {isLoadingData && newsData.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-48 opacity-50 space-y-2">
                                            <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
                                            <p className="text-xs">Fetching headlines...</p>
                                        </div>
                                    ) : newsData.length > 0 ? (
                                        newsData.slice(0, 6).map(item => (
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                key={item.id}
                                                className={`block p-4 rounded-xl hover:bg-white/5 transition-all group cursor-pointer ${glassCardStyle}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                                                        <Globe className="h-6 w-6 text-purple-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'}`}>
                                                                {item.category.toUpperCase()}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" /> {item.time || 'Today'}
                                                            </span>
                                                        </div>
                                                        <h3 className={`font-bold text-sm mb-1 truncate group-hover:text-purple-400 transition-colors ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                                            {item.title}
                                                        </h3>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            {item.source} <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center opacity-50">
                                            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                            No news available.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className={`text-lg font-bold flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                    <Calendar className="h-5 w-5 text-orange-500" /> Holidays & Events
                                </h2>
                                <div className={`p-4 rounded-2xl space-y-4 ${glassCardStyle}`}>
                                    {eventsData.length > 0 ? eventsData.slice(0, showAllEvents ? undefined : 5).map(event => (
                                        <div key={event.id} className="flex items-start gap-3 pb-4 border-b border-gray-500/10 last:border-0 last:pb-0">
                                            <div className="text-center bg-orange-500/10 text-orange-500 rounded-lg p-2 min-w-[50px]">
                                                <div className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                                                <div className="text-lg font-bold">{new Date(event.date).getDate() + 1}</div>
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{event.title}</h4>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <MapPin className="h-3 w-3" /> {event.location}
                                                </div>
                                                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider opacity-50">{event.type}</div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-4 text-xs opacity-50">Loading events...</div>
                                    )}
                                    <button
                                        onClick={() => setShowAllEvents(!showAllEvents)}
                                        className="w-full py-2 text-xs font-bold text-center text-orange-500 hover:text-orange-400 transition-colors"
                                    >
                                        {showAllEvents ? "Show Less" : "View All"}
                                    </button>
                                </div>

                                <div
                                    onClick={() => window.open("https://trends.google.com", "_blank")}
                                    className={`p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all`}
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                                        <TrendingUp className="h-12 w-12" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-xs font-bold uppercase opacity-80 mb-1">Viral Today</div>
                                        <h3 className="font-bold text-lg leading-tight mb-2">Social Pulse</h3>
                                        <p className="text-xs opacity-90 mb-3">See what's trending across all platforms.</p>
                                        <button className="text-xs bg-white text-pink-600 px-3 py-1.5 rounded-full font-bold shadow-lg">View Trends</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'assets' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-end">
                            <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-bold shadow-lg">
                                <Plus className="h-4 w-4 mr-2" /> Add Asset
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assets.length === 0 ? (
                                <div className={`col-span-full p-12 text-center rounded-2xl border-2 border-dashed ${theme === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
                                    <Globe className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p className="opacity-50">No digital assets tracked.</p>
                                </div>
                            ) : (
                                assets.map(item => (
                                    <div key={item.id} className={`p-6 rounded-2xl group ${glassCardStyle}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <button onClick={() => { if (confirm("Delete asset?")) deleteItem(item.id) }} className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-500/10 rounded">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <h3 className={`font-bold text-lg mb-1 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                                        <div className="text-xs font-mono opacity-50 mb-4">{item.item_metadata?.digitalType}</div>
                                        <div className="p-3 rounded-lg bg-black/20 text-sm font-mono break-all opacity-80">
                                            {item.item_metadata?.url || 'No URL'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'legacy' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-blue-50 text-blue-900' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                            <div className="flex items-start gap-4">
                                <Users className="h-8 w-8 text-blue-500" />
                                <div>
                                    <h3 className="font-bold text-lg">Digital Heir</h3>
                                    <p className="text-sm opacity-70 mt-1 max-w-2xl">
                                        Designate a trusted contact who can access your social life in case of emergency.
                                        This information is stored securely in your vault.
                                    </p>
                                </div>
                                <button onClick={() => setShowAddModal(true)} className="ml-auto flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20">
                                    <Plus className="h-4 w-4 mr-2" /> Add Contact
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {legacyContacts.map(contact => (
                                <div key={contact.id} className={`p-6 rounded-2xl relative overflow-hidden ${glassCardStyle}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xl font-bold text-white">
                                            {contact.title.charAt(0)}
                                        </div>
                                        <button onClick={() => { if (confirm("Remove contact?")) deleteItem(contact.id) }} className="text-red-500 p-2 hover:bg-red-500/10 rounded">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{contact.title}</h3>
                                    <p className="opacity-50 text-sm mb-4">{contact.item_metadata?.relation || 'Trusted Contact'}</p>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between p-2 rounded bg-black/5 dark:bg-white/5">
                                            <span className="opacity-50">Email</span>
                                            <span>{contact.item_metadata?.email}</span>
                                        </div>
                                        <div className="flex justify-between p-2 rounded bg-black/5 dark:bg-white/5">
                                            <span className="opacity-50">Phone</span>
                                            <span>{contact.item_metadata?.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className={`p-8 rounded-[2.5rem] ${glassCardStyle} bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20`}>
                            <h2 className="text-3xl font-black italic tracking-tighter text-indigo-400 uppercase mb-2">Platform Privacy Audit</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
                                Systematically secure your digital footprint. Perform these checkups quarterly to ensure your data remains your own.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { name: "Google Account", icon: Globe, tasks: ["Check 2FA", "Review Third-party Apps", "Location History"], color: "text-blue-500" },
                                { name: "Facebook / Meta", icon: Facebook, tasks: ["Privacy Checkup", "Ad Preferences", "Face Recognition"], color: "text-blue-600" },
                                { name: "Instagram", icon: Instagram, tasks: ["Account Privacy", "Story Sharing", "Sensitive Content"], color: "text-pink-500" },
                                { name: "Twitter / X", icon: Twitter, tasks: ["Protect Posts", "Data Sharing", "Direct Messages"], color: "text-sky-500" },
                                { name: "LinkedIn", icon: Linkedin, tasks: ["Profile Visibility", "Data Privacy", "Job Seeking Prefs"], color: "text-blue-700" },
                                { name: "TikTok", icon: Video, tasks: ["Digital Wellbeing", "Ads Data", "Safety Settings"], color: "text-black dark:text-white" }
                            ].map((platform, pIdx) => (
                                <div key={pIdx} className={`p-6 rounded-[2rem] border ${glassCardStyle} hover:border-indigo-500/30 transition-all`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                <platform.icon className={`h-6 w-6 ${platform.color}`} />
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tight">{platform.name}</h3>
                                        </div>
                                        <span className="text-[10px] font-black uppercase px-2 py-1 bg-green-500/10 text-green-500 rounded">Recommended</span>
                                    </div>
                                    <div className="space-y-3">
                                        {platform.tasks.map((task, tIdx) => (
                                            <div key={tIdx} className="flex items-center gap-3 p-3 rounded-xl bg-black/20 hover:bg-black/40 cursor-pointer transition-colors group">
                                                <div className="h-5 w-5 rounded-full border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-colors" />
                                                <span className="text-sm font-bold text-gray-300">{task}</span>
                                                <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-6 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                                        Launch Full Audit
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} w-full max-w-lg rounded-2xl p-6 shadow-2xl`}>
                        <h2 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            {activeTab === 'assets' ? 'Add Digital Asset' : 'Add Legacy Contact'}
                        </h2>

                        <form onSubmit={(e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)
                            const baseItem = {
                                type: "note",
                                category: "Digital Life", 
                                title: fd.get("title"),
                                item_metadata: {
                                    is_digital: true,
                                    is_legacy: activeTab === 'legacy',
                                    is_2fa: false,
                                    digitalType: fd.get("digitalType"),
                                    url: fd.get("url"),
                                    notes: fd.get("notes"),
                                    relation: fd.get("relation"),
                                    email: fd.get("email"),
                                    phone: fd.get("phone"),
                                }
                            }
                            addItem(baseItem)
                            setShowAddModal(false)
                        }} className="space-y-4">

                            <div>
                                <label className="text-xs font-bold opacity-50 uppercase ml-1 block mb-1">
                                    {activeTab === 'assets' ? 'Asset Name' : 'Contact Name'}
                                </label>
                                <input name="title" required className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder={activeTab === 'assets' ? 'e.g. Instagram' : 'e.g. John Doe'} />
                            </div>

                            {activeTab === 'assets' && (
                                <>
                                    <select name="digitalType" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}>
                                        <option value="social">Social Media</option>
                                        <option value="domain">Domain / Hosting</option>
                                        <option value="subscription">Subscription</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <input name="url" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="URL" />
                                </>
                            )}

                            {activeTab === 'legacy' && (
                                <>
                                    <input name="relation" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Relationship (e.g. Spouse, Lawyer)" />
                                    <input name="email" type="email" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Email" />
                                    <input name="phone" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Phone" />
                                </>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 py-3 rounded-xl font-medium ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-300'}`}>Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold shadow-lg shadow-pink-500/20">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
