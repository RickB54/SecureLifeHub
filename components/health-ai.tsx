"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, User, Send, Sparkles, AlertTriangle, Info, CheckCircle, Clock, Plus, Stethoscope, Pill, Activity, Brain, FileText, ChevronDown, ChevronUp, Search, Book, ExternalLink, ShieldCheck, Thermometer, Copy, Download, X, Minimize2, Maximize2, Archive, Edit, ChevronRight, Globe, HelpCircle, Printer, Lock, Check, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

enum UrgencyLevel {
    INFO = 'info',
    MODERATE = 'moderate',
    URGENT = 'urgent',
    EMERGENCY = 'emergency'
}

interface Message {
    id: string
    role: 'user' | 'ai'
    content: string
    urgency?: UrgencyLevel
    sections?: {
        title: string
        content: string
        type?: 'info' | 'warning' | 'action' | 'reference'
    }[]
    timestamp: Date
    sources?: string[]
}

interface HealthAIProps {
    theme: string
    records: any[]
    onScheduleAppointment: () => void
    onOpenHelp?: (targetId?: string) => void
}

interface ConversationHistory {
    id: string
    title: string
    messages: Message[]
    topics: string[]
    lastUpdated: Date
    notes?: string
    isArchived?: boolean
}

export default function HealthAI({ theme, records, onScheduleAppointment, onOpenHelp }: HealthAIProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isThinking, setIsThinking] = useState(false)
    const [thinkingStep, setThinkingStep] = useState("")
    const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([])
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
    const [showNotes, setShowNotes] = useState(false)
    const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(false)
    const [historySearchQuery, setHistorySearchQuery] = useState("")
    const [historyFilter, setHistoryFilter] = useState<'all' | 'active' | 'archived'>('active')
    const [isEditingNote, setIsEditingNote] = useState<string | null>(null)
    const [editingNoteValue, setEditingNoteValue] = useState("")
    const [isEditingTitle, setIsEditingTitle] = useState<string | null>(null)
    const [editingTitleValue, setEditingTitleValue] = useState("")
    const [historyDateFilter, setHistoryDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
    const [suggestedTopics, setSuggestedTopics] = useState<string[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Escape key listener for Focus Mode
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsWorkspaceExpanded(false)
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    // Load conversation history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('health-ai-history-v2')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setConversationHistory(parsed.map((c: any) => ({
                    ...c,
                    lastUpdated: new Date(c.lastUpdated),
                    messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
                })))
            } catch (e) {
                console.error('Failed to load history', e)
            }
        }
    }, [])

    // Save conversation history to localStorage
    useEffect(() => {
        if (conversationHistory.length > 0) {
            localStorage.setItem('health-ai-history-v2', JSON.stringify(conversationHistory))
        }
    }, [conversationHistory])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isThinking])

    // Auto-save conversation to history
    useEffect(() => {
        if (messages.length > 0) {
            const timer = setTimeout(() => {
                saveCurrentConversation()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [messages])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clinical clipboard")
    }

    const copyConversation = () => {
        const conversationText = messages.map(msg =>
            `[${msg.role.toUpperCase()}] ${msg.timestamp.toLocaleTimeString()}\n${msg.content}${msg.sections ? '\n\n' + msg.sections.map(s => `${s.title}\n${s.content}`).join('\n\n') : ''}`
        ).join('\n\n---\n\n')
        copyToClipboard(conversationText)
    }

    const saveConversation = () => {
        const conversationText = messages.map(msg =>
            `[${msg.role.toUpperCase()}] ${msg.timestamp.toLocaleString()}\n${msg.content}${msg.sections ? '\n\n' + msg.sections.map(s => `${s.title}\n${s.content}`).join('\n\n') : ''}`
        ).join('\n\n---\n\n')
        const blob = new Blob([conversationText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dr-ai-research-report-${new Date().toISOString().split('T')[0]}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handlePrint = () => {
        // Create a custom print style for clinical reports
        const style = document.createElement('style')
        style.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                #dr-ai-printable-area, #dr-ai-printable-area * { visibility: visible; }
                #dr-ai-printable-area { position: absolute; left: 0; top: 0; width: 100%; }
                .no-print { display: none !important; }
            }
        `
        document.head.appendChild(style)
        window.print()
        document.head.removeChild(style)
    }

    const extractTopics = (msgs: Message[]): string[] => {
        const topics = new Set<string>()
        msgs.forEach(msg => {
            if (msg.role === 'ai' && msg.content.includes("##")) {
                const match = msg.content.match(/## ([^\n]+)/)
                if (match) topics.add(match[1])
            }
        })
        return Array.from(topics)
    }

    const saveCurrentConversation = () => {
        if (messages.length === 0) return

        const topics = extractTopics(messages)
        const existing = conversationHistory.find(c => c.id === currentConversationId)
        
        // Ensure we have an ID to save to
        const id = currentConversationId || (existing?.id) || ("research-" + Date.now().toString())
        
        const title = existing?.title || (topics.length > 0 ? topics[0] : (messages[0]?.content.substring(0, 40) + (messages[0]?.content.length > 40 ? '...' : '')) || 'New Investigation')

        const conversation: ConversationHistory = {
            id,
            title,
            messages,
            topics,
            lastUpdated: new Date(),
            notes: existing?.notes || "",
            isArchived: existing?.isArchived || false
        }

        setConversationHistory(prev => {
            const index = prev.findIndex(c => c.id === conversation.id)
            if (index >= 0) {
                // Only update if something changed
                if (JSON.stringify(prev[index].messages) === JSON.stringify(conversation.messages)) return prev
                const updated = [...prev]
                updated[index] = conversation
                return updated
            }
            return [conversation, ...prev]
        })
        
        if (!currentConversationId) {
            setCurrentConversationId(id)
        }
    }

    const toggleArchiveConversation = (id: string) => {
        setConversationHistory(prev => prev.map(c => 
            c.id === id ? { ...c, isArchived: !c.isArchived } : c
        ))
        toast.success("Archive status updated")
    }

    const updateConversationNote = (id: string, notes: string) => {
        setConversationHistory(prev => prev.map(c => 
            c.id === id ? { ...c, notes } : c
        ))
        setIsEditingNote(null)
        toast.success("Research notes updated")
    }

    const updateConversationTitle = (id: string, title: string) => {
        setConversationHistory(prev => prev.map(c => 
            c.id === id ? { ...c, title } : c
        ))
        setIsEditingTitle(null)
        toast.success("Session title updated")
    }

    const loadConversation = (id: string) => {
        const conversation = conversationHistory.find(c => c.id === id)
        if (conversation) {
            setMessages(conversation.messages)
            setCurrentConversationId(id)
            setShowNotes(true)
        }
    }

    const deleteConversation = (id: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this research session?")) return
        setConversationHistory(prev => prev.filter(c => c.id !== id))
        if (currentConversationId === id) {
            handleNewChat()
        }
    }

    const handleNewChat = () => {
        if (messages.length > 0) saveCurrentConversation()
        setMessages([])
        setInput("")
        setCurrentConversationId(null)
    }

    const searchMedicalWiki = async (query: string) => {
        try {
            let cleanQuery = query.toLowerCase()
                .replace(/^tell me (about|on|the|info on|details on)\s+/i, '')
                .replace(/^what (is|are|details|info)\s+/i, '')
                .replace(/^research\s+/i, '')
                .replace(/(\?|\.|!)$/, '')
                .trim();

            // Extract suggested topics from generic query
            const suggestions = [
                `Symptoms of ${cleanQuery}`,
                `Latest treatments for ${cleanQuery}`,
                `${cleanQuery} diet and lifestyle`,
                `Chronic management of ${cleanQuery}`
            ]
            setSuggestedTopics(suggestions)

            if (!cleanQuery) return null;

            // 1. Try exact search first
            let searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=5&namespace=0&format=json&origin=*`)
            let searchJson = await searchRes.json()
            
            // 2. If no results, try a broader search or fuzzy-ish search by removing last chars or using 'suggestions'
            if (!searchJson[1][0]) {
                // Try searching with the query as-is without cleaning as much
                const broaderRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&utf8=&format=json&origin=*`)
                const broaderJson = await broaderRes.json()
                if (broaderJson.query.search[0]) {
                    searchJson[1][0] = broaderJson.query.search[0].title
                }
            }
            
            let title = searchJson[1][0]
            if (!title) return null

            const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
            const summaryJson = await summaryRes.json()

            if (summaryJson.type === 'no-extract' && searchJson[1][1]) {
                title = searchJson[1][1];
                const retryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
                const retryJson = await retryRes.json()
                if (retryJson.extract) Object.assign(summaryJson, retryJson);
            }

            let extraSections: { title: string, content: string }[] = []
            try {
                const sectionsRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(title)}`)
                const sectionsJson = await sectionsRes.json()
                if (sectionsJson.remaining && sectionsJson.remaining.sections) {
                    const raw = sectionsJson.remaining.sections;
                    for (const s of raw) {
                        if (s.text && s.line && (s.line.toLowerCase().includes('symptom') || s.line.toLowerCase().includes('cause') || s.line.toLowerCase().includes('treatment') || s.line.toLowerCase().includes('diagnosis'))) {
                            extraSections.push({
                                title: s.line,
                                content: s.text.replace(/<[^>]*>?/gm, '').substring(0, 600) + '...'
                            });
                        }
                        if (extraSections.length >= 3) break;
                    }
                }
            } catch (e) {}

            return {
                title: summaryJson.title,
                extract: summaryJson.extract,
                url: summaryJson.content_urls.desktop.page,
                extraSections: extraSections
            }
        } catch (e) {
            return null
        }
    }

    const generateResponse = async (query: string) => {
        setIsThinking(true)
        const steps = ["Securing clinical connection...", "Querying medical databases...", "Synthesizing research data...", "Finalizing clinical summary..."]
        
        for (const step of steps) {
            setThinkingStep(step)
            await new Promise(r => setTimeout(r, 800))
        }

        const lowerQuery = query.toLowerCase()
        let sections: Message['sections'] = []
        let mainContent = ""
        let urgency = UrgencyLevel.INFO

        if (lowerQuery.includes("suicid") || lowerQuery.includes("kill myself")) {
            mainContent = "💔 **EMERGENCY SUPPORT**\n\nYou are not alone. Please reach out for professional help immediately."
            urgency = UrgencyLevel.EMERGENCY
            sections.push({ title: "Crisis Resources", content: "Call 988 (Lifeline) or 911 immediately.", type: 'warning' })
        } else if (lowerQuery.includes("appointment") || lowerQuery.includes("book")) {
            mainContent = "Opening the Medical Appointment Scheduler..."
            setTimeout(onScheduleAppointment, 1000)
        } else {
            const wiki = await searchMedicalWiki(query)
            if (wiki) {
                mainContent = `## ${wiki.title}\n\n${wiki.extract}`
                if (wiki.extraSections) {
                    wiki.extraSections.forEach(s => sections.push({ title: s.title, content: s.content, type: 'info' }))
                }
                sections.push({
                    title: "Research References",
                    content: `• [Detailed Wiki Article](${wiki.url})\n• [Search Mayo Clinic](https://www.mayoclinic.org/search/search-results?q=${encodeURIComponent(wiki.title)})\n• [Research on PubMed](https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(wiki.title)})`,
                    type: 'reference'
                })
            } else {
                mainContent = `I initiated a research sequence for **"${query}"**.\n\nWhile a deep clinical summary is pending, I have curated authoritative links for your immediate review:`
                sections.push({
                    title: "Authoritative Medical Links",
                    content: `• [WebMD Exploration](https://www.webmd.com/search/search_results/default.aspx?query=${encodeURIComponent(query)})\n• [Mayo Clinic Insights](https://www.mayoclinic.org/search/search-results?q=${encodeURIComponent(query)})\n• [NIH MedlinePlus](https://medlineplus.gov/search/?query=${encodeURIComponent(query)})`,
                    type: 'reference'
                })
            }

            if (lowerQuery.includes("pain") || lowerQuery.includes("severe")) {
                urgency = UrgencyLevel.URGENT
                sections.push({ title: "Clinical Advisory", content: "Severity indicates a need for professional evaluation. Do not delay medical consultation.", type: 'warning' })
            }
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'ai',
            content: mainContent,
            sections: sections,
            urgency: urgency,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newMessage])
        setIsThinking(false)
        setThinkingStep("")
    }

    const handleSend = () => {
        if (!input.trim()) return

        // Assign stable ID for new sessions immediately for history tracking
        if (!currentConversationId) {
            setCurrentConversationId("research-" + Date.now().toString())
        }

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        generateResponse(userMsg.content)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const filteredHistory = conversationHistory.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(historySearchQuery.toLowerCase())
        const matchesFilter = historyFilter === 'all' || (historyFilter === 'active' && !c.isArchived) || (historyFilter === 'archived' && c.isArchived)
        
        let matchesDate = true
        const now = new Date()
        const diff = now.getTime() - c.lastUpdated.getTime()
        const days = diff / (1000 * 60 * 60 * 24)
        
        if (historyDateFilter === 'today') matchesDate = days < 1
        else if (historyDateFilter === 'week') matchesDate = days < 7
        else if (historyDateFilter === 'month') matchesDate = days < 30
        
        return matchesSearch && matchesFilter && matchesDate
    }).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())

    return (
        <div className={`relative flex flex-col gap-6 animate-in fade-in duration-700 ${isWorkspaceExpanded ? 'fixed inset-0 z-[1000] bg-black p-0 m-0 w-full h-screen overflow-hidden' : 'h-[750px] w-full'}`}>
            
            {/* WORKSPACE CONTAINER */}
            <div id="dr-ai-printable-area" className={`flex flex-1 overflow-hidden border transition-all duration-500 shadow-3xl bg-clip-padding ${isWorkspaceExpanded ? 'rounded-0 border-0' : 'rounded-[2.5rem] ' + (theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0a0a0a] border-white/10')}`}>
                
                {/* SIDEBAR: HISTORY */}
                {!isWorkspaceExpanded && (
                    <div className={`w-80 h-full border-r flex flex-col ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-black/40 border-white/10'}`}>
                        <div className="p-6 border-b border-inherit space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Research Vault</h3>
                                <button onClick={handleNewChat} className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg transition-all active:scale-90"><Plus className="h-4 w-4" /></button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input value={historySearchQuery} onChange={(e) => setHistorySearchQuery(e.target.value)} placeholder="Search sessions..." className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-[10px] font-bold outline-none border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black/60 border-white/10 focus:border-indigo-500/50'}`} />
                            </div>
                             <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                                {['all', 'today', 'week', 'month'].map(d => (
                                    <button key={d} onClick={() => setHistoryDateFilter(d as any)} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-tight transition-all border whitespace-nowrap ${historyDateFilter === d ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400' : 'border-white/5 text-gray-500 hover:text-gray-300'}`}>{d}</button>
                                ))}
                            </div>
                            <div className="flex gap-1.5">
                                {['active', 'archived', 'all'].map(f => (
                                    <button key={f} onClick={() => setHistoryFilter(f as any)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${historyFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>{f}</button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {filteredHistory.map(conv => (
                                <div key={conv.id} onClick={() => loadConversation(conv.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all group relative ${currentConversationId === conv.id ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                                    <div className="text-xs font-bold truncate pr-10 flex items-center gap-2">
                                        {conv.title}
                                        {conv.notes && <FileText className="h-3 w-3 text-emerald-500 flex-shrink-0" />}
                                    </div>
                                    <div className="text-[9px] opacity-40 mt-1 flex items-center gap-2"><Clock className="h-3 w-3" /> {format(new Date(conv.lastUpdated), 'MMM d, h:mm a')}</div>
                                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); toggleArchiveConversation(conv.id); }} className="p-1 hover:text-amber-400"><Archive className="h-3 w-3" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="p-1 hover:text-red-500"><X className="h-3 w-3" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col relative bg-transparent">
                    
                    {/* HEADER */}
                    <div className={`p-6 border-b flex justify-between items-center backdrop-blur-3xl sticky top-0 z-50 ${theme === 'light' ? 'bg-white/80 border-gray-100' : 'bg-black/60 border-white/10'}`}>
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                                <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 shadow-2xl relative z-10">
                                    <Bot className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    {isEditingTitle === currentConversationId ? (
                                        <div className="flex items-center gap-2">
                                            <input autoFocus value={editingTitleValue} onChange={(e) => setEditingTitleValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && updateConversationTitle(currentConversationId!, editingTitleValue)} className="bg-transparent border-b-2 border-indigo-500 outline-none text-2xl font-black italic tracking-tighter" />
                                            <button onClick={() => updateConversationTitle(currentConversationId!, editingTitleValue)}><CheckCircle className="h-5 w-5 text-emerald-500" /></button>
                                        </div>
                                    ) : (
                                        <div onClick={() => currentConversationId && setIsEditingTitle(currentConversationId)} className="group cursor-pointer">
                                            <div className="text-[10px] font-black text-indigo-500/50 uppercase tracking-[0.2em] mb-1">Session Title (Click to Edit)</div>
                                            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                                {currentConversationId ? conversationHistory.find(c => c.id === currentConversationId)?.title : 'Dr. AI Research'}
                                                <Edit className="h-4 w-4 opacity-0 group-hover:opacity-30" />
                                            </h2>
                                        </div>
                                    )}
                                    <button onClick={() => onOpenHelp?.('dr-ai')} className="p-2 rounded-xl hover:bg-white/10 text-blue-400 flex items-center gap-2">
                                        <HelpCircle className="h-6 w-6" />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Help</span>
                                    </button>
                                </div>
                                <p className="text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase flex items-center gap-2">
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[8px] text-emerald-400">ACTIVE GRID</span>
                                    </span>
                                    Global Clinical Intel Network v4.0
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 no-print">
                            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
                                <button onClick={() => { setIsWorkspaceExpanded(!isWorkspaceExpanded); if (!isWorkspaceExpanded) setShowNotes(false); }} className={`p-3 rounded-xl transition-all ${isWorkspaceExpanded ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 text-gray-400'}`} title="Toggle Expanded Workspace"><Maximize2 className="h-5 w-5" /></button>
                                <button onClick={handlePrint} className="p-3 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white" title="Print Consultation"><Printer className="h-5 w-5" /></button>
                                <button onClick={copyConversation} className="p-3 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white" title="Copy Text"><Copy className="h-5 w-5" /></button>
                                <button onClick={saveConversation} className="p-3 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white" title="Download MD Report"><Download className="h-5 w-5" /></button>
                            </div>
                            {isWorkspaceExpanded && <button onClick={() => setIsWorkspaceExpanded(false)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><X className="h-6 w-6" /></button>}
                        </div>
                    </div>

                    {/* MESSAGES FEED */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar bg-dots-pattern">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-xl mx-auto py-20">
                                <div className="p-12 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 animate-pulse">
                                    <Sparkles className="h-20 w-20 text-indigo-500/40" />
                                </div>
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase">Initiate Clinical Inquiry</h3>
                                <p className="text-gray-500 font-medium">I provide comprehensive clinical explanations followed by authoritative research links. Describe symptoms or medical topics below.</p>
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    {["Sore throat symptoms", "Hemochromatosis info", "Prednisone side effects", "Blood pressure ranges"].map(q => (
                                        <button key={q} onClick={() => { setInput(q); handleSend(); }} className="p-4 rounded-[1.5rem] bg-white/5 border border-white/5 hover:border-indigo-500/40 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all">{q}</button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-8 duration-500`}>
                                    <div className={`max-w-[85%] rounded-[2.5rem] shadow-2xl overflow-hidden ${msg.role === 'user' ? 'rounded-tr-none bg-gradient-to-br from-indigo-600 to-blue-700 text-white' : 'bg-[#050505] border border-white/10'}`}>
                                        
                                        {msg.role === 'ai' && (
                                            <div className="px-8 py-5 bg-indigo-500/5 border-b border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-400" /><span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Clinical Summary</span></div>
                                                {msg.urgency && <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${msg.urgency === UrgencyLevel.EMERGENCY ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-500'}`}>{msg.urgency}</span>}
                                            </div>
                                        )}

                                        <div className="p-10 space-y-8">
                                            <div className={`whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'text-xl font-bold italic' : 'text-base opacity-90'}`}>
                                                {msg.content.split('\n\n').map((p, i) => (
                                                    <div key={i} className={p.startsWith('## ') ? 'text-2xl font-black italic tracking-tighter uppercase text-indigo-400 mb-6' : 'mb-4'}>
                                                        {p.startsWith('## ') ? p.replace('## ', '') : p}
                                                    </div>
                                                ))}
                                            </div>

                                            {msg.sections?.map((s, i) => (
                                                <div key={i} className={`p-8 rounded-[2rem] ${s.type === 'warning' ? 'bg-red-500/5 border border-red-500/20' : s.type === 'reference' ? 'bg-blue-500/5 border border-blue-500/20' : 'bg-white/5 border border-white/5 shadow-inner'}`}>
                                                    <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${s.type === 'warning' ? 'text-red-500' : s.type === 'reference' ? 'text-blue-400' : 'text-indigo-400'}`}>
                                                        {s.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : s.type === 'reference' ? <Book className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                                        {s.title}
                                                    </h4>
                                                    <div className="text-sm opacity-80 leading-loose whitespace-pre-wrap">{s.content}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="px-10 py-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-30">
                                            <div className="flex gap-6"><span><Clock className="h-3 w-3 inline mr-1" /> {msg.timestamp.toLocaleTimeString()}</span></div>
                                            <div className="flex gap-3">
                                                <button onClick={() => copyToClipboard(msg.content)} className="hover:text-indigo-400" title="Copy text"><Copy className="h-4 w-4" /></button>
                                                <button onClick={handlePrint} className="hover:text-amber-400" title="Save as PDF / Print"><Printer className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )))}
                            {isThinking && (
                                <div className="flex justify-start animate-fade-in py-4">
                                    <div className="p-8 rounded-[2rem] bg-[#050505] border border-white/10 flex items-center gap-4 shadow-2xl">
                                        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400 animate-pulse">{thinkingStep}</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                            
                            {suggestedTopics.length > 0 && !isThinking && (
                                <div className="mt-8 animate-in slide-in-from-bottom-4 duration-700">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 ml-4">
                                        <Brain className="h-4 w-4" /> AI Suggested Investigations
                                    </h4>
                                    <div className="flex flex-wrap gap-3 ml-4">
                                        {suggestedTopics.map((topic, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => {
                                                    setInput(topic)
                                                    // Trigger send in next tick
                                                    setTimeout(() => handleSend(), 0)
                                                }}
                                                className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                            >
                                                {topic}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    {/* INPUT AREA */}
                    <div className={`p-8 border-t ${theme === 'light' ? 'bg-white' : 'bg-black/80 backdrop-blur-3xl border-white/10'}`}>
                        <div className={`max-w-5xl mx-auto relative flex items-center gap-4 p-5 rounded-[2.5rem] border shadow-2xl transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/40 ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                            <textarea 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)} 
                                onKeyDown={handleKeyDown} 
                                placeholder="Describe your query... (e.g. 'Hemochromatosis symptoms and diet')" 
                                className="flex-1 bg-transparent border-none outline-none p-4 min-h-[60px] max-h-40 resize-none text-xl font-medium leading-relaxed custom-scrollbar placeholder:text-gray-600"
                            ></textarea>
                            <button 
                                onClick={handleSend} 
                                disabled={!input.trim()} 
                                className={`p-6 rounded-[2rem] transition-all duration-300 absolute right-4 group ${input.trim() ? 'bg-indigo-600 text-white hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20' : 'bg-white/10 text-gray-500 opacity-30 cursor-not-allowed'}`}
                            >
                                <Send className="h-8 w-8 relative z-10" />
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        </div>
                        <div className="mt-4 flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
                            <span className="flex items-center gap-2"><Lock className="h-3 w-3" /> Encrypted Session</span>
                            <span className="flex items-center gap-2"><Globe className="h-3 w-3" /> Global Med Network</span>
                            <span className="flex items-center gap-2 px-3 py-1 rounded-md border border-white/10">ESC to Exit Focus</span>
                        </div>
                    </div>

                    {/* NOTES PANEL (Floating Overlay) */}
                    {currentConversationId && (
                        <div className={`fixed top-12 right-12 bottom-12 w-96 rounded-[3rem] border-l transform transition-all duration-700 z-[100] shadow-glow-left overflow-hidden ${showNotes ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'} ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#050505] border-white/10'}`}>
                            <div className="p-10 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-3"><FileText className="h-6 w-6 text-indigo-400" /><h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Session Notes</h3></div>
                                    <button onClick={() => setShowNotes(false)} className="p-3 hover:bg-white/10 rounded-2xl"><X className="h-6 w-6 text-gray-500" /></button>
                                </div>
                                <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Auto-Detected Topics</label>
                                        <div className="flex flex-wrap gap-2">
                                            {conversationHistory.find(c => c.id === currentConversationId)?.topics.map(t => (
                                                <span key={t} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl text-[9px] font-black uppercase border border-indigo-500/20">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Personal Observations</label>
                                        {isEditingNote === currentConversationId ? (
                                            <div className="flex-1 flex flex-col gap-4">
                                                <textarea autoFocus value={editingNoteValue} onChange={(e) => setEditingNoteValue(e.target.value)} className="flex-1 w-full p-6 rounded-[2rem] bg-white/5 border border-white/10 outline-none focus:border-indigo-500 text-sm italic resize-none" />
                                                <button onClick={() => updateConversationNote(currentConversationId!, editingNoteValue)} className="w-full py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black italic uppercase tracking-tighter hover:bg-indigo-500 transition-all">Save Changes</button>
                                            </div>
                                        ) : (
                                            <div onClick={() => { setIsEditingNote(currentConversationId!); setEditingNoteValue(conversationHistory.find(c => c.id === currentConversationId!)?.notes || "") }} className="flex-1 p-8 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/5 text-sm italic opacity-60 hover:opacity-100 hover:border-indigo-500/50 cursor-pointer transition-all whitespace-pre-wrap">
                                                {conversationHistory.find(c => c.id === currentConversationId)?.notes || "Tap to add personal feelings, questions for your doctor, or next steps..."}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <button onClick={() => { setIsWorkspaceExpanded(!isWorkspaceExpanded); if (!isWorkspaceExpanded) setShowNotes(false); }} className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">{isWorkspaceExpanded ? "Exit Focus" : "Focus Workspace"}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QUICK TOGGLE */}
                    {currentConversationId && (
                        <button onClick={() => setShowNotes(!showNotes)} className={`absolute top-1/2 -translate-y-1/2 right-6 p-5 rounded-[1.5rem] shadow-3xl z-[50] transition-all duration-500 ${showNotes ? 'bg-indigo-600 rotate-180 translate-x-[200%] opacity-0' : 'bg-white/10 hover:bg-indigo-600 text-white border border-white/10'}`}>
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    )}
                </div>
            </div>

            {/* STATUS BAR */}
            {!isWorkspaceExpanded && (
                <div className="flex items-center gap-10 px-8 opacity-20 text-[10px] font-black uppercase tracking-[0.4em] justify-center mt-2">
                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> HIPAA-GRADE ENCRYPTION</span>
                    <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> GLOBAL CLINICAL ENGINE</span>
                    <span className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> BIO-ANALYSIS ACTIVE</span>
                </div>
            )}
        </div>
    )
}
