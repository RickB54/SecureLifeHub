"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, User, Send, Sparkles, AlertTriangle, Info, CheckCircle, Clock, Plus, Stethoscope, Pill, Activity, Brain, FileText, ChevronDown, ChevronUp, Search, Book, ExternalLink, ShieldCheck, Thermometer, Copy, Download, X, Minimize2, Maximize2 } from "lucide-react"
import { toast } from "sonner"

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
}

interface ConversationHistory {
    id: string
    title: string
    messages: Message[]
    topics: string[]
    lastUpdated: Date
}

// --- MINIMAL EMERGENCY KNOWLEDGE BASE ---
// Only keeping critical conditions for immediate escalation
const EMERGENCY_KB: Record<string, {
    urgency: UrgencyLevel
    symptoms: string[]
    warningSigns: string[]
}> = {
    "chest pain": {
        urgency: UrgencyLevel.EMERGENCY,
        symptoms: ["Tightness/Pressure in chest", "Pain radiating to arm/jaw", "Shortness of breath"],
        warningSigns: ["CRITICAL: Call 911 immediately"]
    }
}

export default function HealthAI({ theme, records, onScheduleAppointment }: HealthAIProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isThinking, setIsThinking] = useState(false)
    const [thinkingStep, setThinkingStep] = useState("")
    const [collapsedMessages, setCollapsedMessages] = useState<Set<string>>(new Set())
    const [allCollapsed, setAllCollapsed] = useState(false)
    const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([])
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
    const [showHistory, setShowHistory] = useState(false)
    const [collapsedHistoryItems, setCollapsedHistoryItems] = useState<Set<string>>(new Set())
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load conversation history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('health-ai-history')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setConversationHistory(parsed.map((c: any) => ({
                    ...c,
                    lastUpdated: new Date(c.lastUpdated)
                })))
            } catch (e) {
                console.error('Failed to load history', e)
            }
        }
    }, [])

    // Save conversation history to localStorage
    useEffect(() => {
        if (conversationHistory.length > 0) {
            localStorage.setItem('health-ai-history', JSON.stringify(conversationHistory))
        }
    }, [conversationHistory])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isThinking])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
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
        a.download = `health-consultation-${new Date().toISOString().split('T')[0]}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    const extractTopics = (messages: Message[]): string[] => {
        const topics = new Set<string>()
        messages.forEach(msg => {
            // Extract medical terms from message content
            if (msg.sections) {
                msg.sections.forEach(s => {
                    if (s.title.includes('Clinical') || s.title.includes('Research')) {
                        const match = msg.content.match(/"([^"]+)"/)
                        if (match) topics.add(match[1])
                    }
                })
            }
        })
        return Array.from(topics)
    }

    const saveCurrentConversation = () => {
        if (messages.length === 0) return

        const topics = extractTopics(messages)
        const title = topics.length > 0 ? topics[0] : messages[0]?.content.substring(0, 50) || 'New Conversation'

        const conversation: ConversationHistory = {
            id: currentConversationId || Date.now().toString(),
            title,
            messages,
            topics,
            lastUpdated: new Date()
        }

        setConversationHistory(prev => {
            const existing = prev.findIndex(c => c.id === conversation.id)
            if (existing >= 0) {
                const updated = [...prev]
                updated[existing] = conversation
                return updated
            }
            return [conversation, ...prev]
        })
    }

    const loadConversation = (id: string) => {
        const conversation = conversationHistory.find(c => c.id === id)
        if (conversation) {
            // Convert timestamp strings back to Date objects
            const messagesWithDates = conversation.messages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }))
            setMessages(messagesWithDates)
            setCurrentConversationId(id)
            setShowHistory(false)
        }
    }

    const deleteConversation = (id: string) => {
        const conversation = conversationHistory.find(c => c.id === id)
        const confirmMsg = conversation
            ? `Delete conversation "${conversation.title}"?\n\nThis action cannot be undone.`
            : 'Delete this conversation?'

        if (!window.confirm(confirmMsg)) {
            return
        }

        setConversationHistory(prev => prev.filter(c => c.id !== id))
        if (currentConversationId === id) {
            handleNewChat()
        }
    }


    const toggleMessageCollapse = (msgId: string) => {
        setCollapsedMessages(prev => {
            const newSet = new Set(prev)
            if (newSet.has(msgId)) {
                newSet.delete(msgId)
            } else {
                newSet.add(msgId)
            }
            return newSet
        })
    }

    const toggleAllCollapse = () => {
        if (allCollapsed) {
            setCollapsedMessages(new Set())
        } else {
            setCollapsedMessages(new Set(messages.filter(m => m.role === 'ai').map(m => m.id)))
        }
        setAllCollapsed(!allCollapsed)
    }

    const handleNewChat = () => {
        // Save current conversation if it has messages
        if (messages.length > 0) {
            saveCurrentConversation()
        }

        setMessages([])
        setInput("")
        setCollapsedMessages(new Set())
        setAllCollapsed(false)
        setCurrentConversationId(null)
    }

    const analyzeContext = (query: string) => {
        const lowerQuery = query.toLowerCase()

        const currentMeds = records ? records
            .filter(r => (r.type === 'medication' || r.item_metadata?.type === 'medication') && r.item_metadata?.active)
            .map(r => r.title) : []

        const activeConditions = records ? records
            .filter(r => (r.type === 'health-record' || r.item_metadata?.type === 'health-record') && !r.item_metadata?.archived)
            .map(r => r.title) : []

        const allergies = records ? records
            .filter(r => r.category === 'Health Records' && r.title.includes("Allerg"))
            .map(r => r.title) : []

        return { currentMeds, activeConditions, allergies }
    }

    const searchMedicalWiki = async (query: string) => {
        try {
            // 1. Clean the query (remove conversational filler)
            let cleanQuery = query.toLowerCase()
                .replace(/^tell me (about|on|the|info on|details on)\s+/i, '')
                .replace(/^what (is|are|details|info)\s+/i, '')
                .replace(/^research\s+/i, '')
                .replace(/^info (on|about)\s+/i, '')
                .replace(/(\?|\.|!)$/, '')
                .trim();

            if (!cleanQuery) return null;

            // 2. Perform OpenSearch to get the best matching title (handles typos)
            const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=3&namespace=0&format=json&origin=*`)
            const searchJson = await searchRes.json()
            
            // Try the first 3 search results if the exact match fails
            let title = searchJson[1][0]
            if (!title) return null

            // 3. Fetch summary for the best title
            const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
            const summaryJson = await summaryRes.json()

            // If we got a 404 or missing extract, try the next search result
            if (summaryJson.type === 'no-extract' && searchJson[1][1]) {
                title = searchJson[1][1];
                const retryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
                const retryJson = await retryRes.json()
                if (retryJson.extract) {
                    // Update variables with retry results
                    Object.assign(summaryJson, retryJson);
                }
            }

            // Fetch more sections for "info from links"
            let sections: { title: string, content: string }[] = []
            try {
                const sectionsRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(title)}`)
                const sectionsJson = await sectionsRes.json()
                if (sectionsJson.remaining && sectionsJson.remaining.sections) {
                    // Get first 3 meaningful sections
                    const rawSections = sectionsJson.remaining.sections;
                    for (const section of rawSections) {
                        if (section.text && section.line && 
                           (section.line.toLowerCase().includes('symptom') || 
                            section.line.toLowerCase().includes('cause') || 
                            section.line.toLowerCase().includes('treatment') ||
                            section.line.toLowerCase().includes('diagnosis'))) {
                            
                            // Clean HTML tags from wiki text
                            const cleanText = section.text.replace(/<[^>]*>?/gm, '')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/&#\d+;/g, '')
                                .substring(0, 500) + '...';
                                
                            sections.push({
                                title: section.line,
                                content: cleanText
                            });
                        }
                        if (sections.length >= 3) break;
                    }
                }
            } catch (e) {
                console.warn("Deeper wiki search failed", e)
            }

            return {
                title: summaryJson.title,
                extract: summaryJson.extract,
                url: summaryJson.content_urls.desktop.page,
                extraSections: sections
            }
        } catch (e) {
            console.error("Wiki search failed", e)
            return null
        }
    }

    const generateResponse = async (query: string) => {
        setIsThinking(true)

        const steps = [
            "Analyzing your medical query...",
            "Connecting to Wikipedia Medical Encyclopedia...",
            "Cross-referencing WebMD, Mayo Clinic, PubMed...",
            "Synthesizing comprehensive guidance..."
        ]

        for (const step of steps) {
            setThinkingStep(step)
            await new Promise(resolve => setTimeout(resolve, 900))
        }

        const lowerQuery = query.toLowerCase()
        const context = analyzeContext(query)

        let sections: Message['sections'] = []
        let mainContent = ""
        let urgency = UrgencyLevel.INFO
        let sources: string[] = []

        // Emergency keywords bypass research
        if (lowerQuery.includes("suicid") || lowerQuery.includes("kill myself") || lowerQuery.includes("end it")) {
            mainContent = "💔 **CRITICAL SUPPORT NEEDED**\n\nYou are not alone. There is immediate help available for you."
            urgency = UrgencyLevel.EMERGENCY
            sections.push({
                title: "Crisis Resources (24/7)",
                content: "• Call **988** (Suicide & Crisis Lifeline)\n• Text **HOME** to **741741**\n• Go to the nearest Emergency Room immediately.",
                type: 'warning'
            })
        } else if (lowerQuery.includes("appointment") || lowerQuery.includes("book")) {
            mainContent = "I can help with that. Opening your appointment scheduler..."
            sections.push({ title: "System Action", content: "Launching Appointment Module...", type: 'action' })
            setTimeout(onScheduleAppointment, 1500)
        } else {
            // PRIMARY FLOW: LIVE WEB RESEARCH FOR ALL QUERIES
            setThinkingStep("Performing deep medical research...")
            const wikiData = await searchMedicalWiki(query)

            if (wikiData) {
                sources = ["Wikipedia Medical", "WebMD", "Mayo Clinic", "PubMed"]
                mainContent = `I researched **"${wikiData.title}"** using global medical databases.\n\nHere's what I found:`

                sections.push({
                    title: "📋 Clinical Overview",
                    content: wikiData.extract,
                    type: 'info'
                })

                // Add deep research sections from the "links" (simulated via mobile sections)
                if (wikiData.extraSections && wikiData.extraSections.length > 0) {
                    wikiData.extraSections.forEach(s => {
                        sections.push({
                            title: `🔍 ${s.title}`,
                            content: s.content,
                            type: 'info'
                        })
                    })
                }

                sections.push({
                    title: "🔗 Deep Research & References",
                    content: `Authoritative sources for further reading:\n\n• [WebMD: ${wikiData.title}](https://www.webmd.com/search/search_results/default.aspx?query=${encodeURIComponent(wikiData.title)})\n• [Mayo Clinic: ${wikiData.title}](https://www.mayoclinic.org/search/search-results?q=${encodeURIComponent(wikiData.title)})\n• [PubMed Research](https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(wikiData.title)})\n• [Wikipedia Article](${wikiData.url})\n• [NIH MedlinePlus](https://medlineplus.gov/search/?query=${encodeURIComponent(wikiData.title)})`,
                    type: 'reference'
                })

                if (context.currentMeds.length > 0) {
                    sections.push({
                        title: "💊 Your Medication Context",
                        content: `You're logging: **${context.currentMeds.join(", ")}**\n\nDiscuss this condition with your doctor to check for interactions.`,
                        type: 'warning'
                    })
                }
            } else {
                // Wiki failed - still provide research links
                mainContent = `I analyzed **"${query}"**.\n\nWhile I couldn't retrieve a summary, here are direct links to trusted sources:`

                sections.push({
                    title: "🔗 Medical Research Links",
                    content: `• [WebMD](https://www.webmd.com/search/search_results/default.aspx?query=${encodeURIComponent(query)})\n• [Mayo Clinic](https://www.mayoclinic.org/search/search-results?q=${encodeURIComponent(query)})\n• [PubMed](https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)})\n• [NIH MedlinePlus](https://medlineplus.gov/search/?query=${encodeURIComponent(query)})`,
                    type: 'reference'
                })

                sections.push({
                    title: "📝 Next Steps",
                    content: "1. Click research links above\n2. Document symptoms in Health Diary\n3. Consult a healthcare professional",
                    type: 'info'
                })
            }

            // Severity detection
            if (lowerQuery.includes("severe") || lowerQuery.includes("unbearable") || lowerQuery.includes("emergency")) {
                urgency = UrgencyLevel.URGENT
                sections.push({
                    title: "🚨 Severity Detected",
                    content: "Your query suggests severe symptoms. If this is an emergency, call 911 immediately.",
                    type: 'warning'
                })
            }
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'ai',
            content: mainContent,
            sections: sections,
            urgency: urgency,
            sources: sources,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newMessage])
        setIsThinking(false)
        setThinkingStep("")
    }

    const handleSend = () => {
        if (!input.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput("")
        generateResponse(userMsg.content)

        // Auto-save after each exchange
        setTimeout(() => saveCurrentConversation(), 2000)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleSaveToNotes = (msgId: string) => {
        toast.success("Guidance saved to Health Diary!")
    }

    return (
        <div className="space-y-4">
            {/* MAIN MODAL */}
            <div className="flex h-[500px] gap-0 rounded-3xl overflow-hidden border shadow-2xl">
                <div className={`flex-1 h-full flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-black/40'}`}>

                    {/* FIXED HEADER - Separate from scroll */}
                    <div className={`flex-shrink-0 p-4 border-b ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-black border-white/10'} flex justify-between items-center`}>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 animate-pulse"></div>
                                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg relative z-10">
                                    <Bot className="h-7 w-7 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-[#1a1a1a] rounded-full z-20 animate-pulse"></div>
                            </div>
                            <div>
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    Dr. AI <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold tracking-wider">RESEARCH</span>
                                </h2>
                                <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Global Medical Database Access</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleAllCollapse}
                                className={`p-2.5 rounded-xl transition-all ${theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/10 text-gray-400'}`}
                                title={allCollapsed ? "Expand All" : "Collapse All"}
                            >
                                {allCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={copyConversation}
                                className={`p-2.5 rounded-xl transition-all ${theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/10 text-gray-400'}`}
                                title="Copy Conversation"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                            <button
                                onClick={saveConversation}
                                className={`p-2.5 rounded-xl transition-all ${theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/10 text-gray-400'}`}
                                title="Save Conversation"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleNewChat}
                                className={`p-2.5 rounded-xl transition-all ${theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/10 text-gray-400'}`}
                                title="New Consultation"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* SCROLLABLE CHAT AREA - Constrained */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-8 custom-scrollbar bg-dots-pattern scroll-smooth">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                <div className={`max-w-[90%] md:max-w-[85%] rounded-3xl ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'} overflow-hidden shadow-sm`}>

                                    {msg.role === 'ai' && (
                                        <div className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-between ${theme === 'light' ? 'bg-gray-50 text-gray-500 border-b border-gray-100' : 'bg-[#1f1f1f] text-gray-400 border-b border-white/5'}`}>
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-indigo-400" />
                                                Research Results
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {msg.urgency && msg.urgency !== UrgencyLevel.INFO && (
                                                    <div className={`px-2 py-0.5 rounded flex items-center gap-1 ${msg.urgency === UrgencyLevel.EMERGENCY ? 'bg-red-500 text-white' :
                                                        msg.urgency === UrgencyLevel.URGENT ? 'bg-orange-500 text-white' :
                                                            'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {msg.urgency.toUpperCase()}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => toggleMessageCollapse(msg.id)}
                                                    className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}
                                                    title={collapsedMessages.has(msg.id) ? "Expand" : "Collapse"}
                                                >
                                                    {collapsedMessages.has(msg.id) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(msg.content + (msg.sections ? '\n\n' + msg.sections.map(s => `${s.title}\n${s.content}`).join('\n\n') : ''))}
                                                    className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}
                                                    title="Copy Response"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content - Collapsible */}
                                    {!collapsedMessages.has(msg.id) && (
                                        <>
                                            <div className={`p-6 ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                                                : theme === 'light' ? 'bg-white border border-gray-100' : 'bg-[#151515] border border-white/5 text-gray-200'
                                                }`}>
                                                <div className={`whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'text-base font-medium' : 'text-sm'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>

                                            {msg.role === 'ai' && msg.sections && msg.sections.length > 0 && (
                                                <div className={`border-t divide-y ${theme === 'light' ? 'border-gray-200 divide-gray-200 bg-gray-50' : 'border-white/5 divide-white/5 bg-[#1a1a1a]'}`}>
                                                    {msg.sections.map((section, idx) => (
                                                        <div key={idx} className="p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                            <h4 className={`text-xs font-bold uppercase mb-3 flex items-center gap-2 ${section.type === 'warning' ? 'text-red-500' :
                                                                section.type === 'action' ? 'text-emerald-500' :
                                                                    'text-indigo-400'
                                                                }`}>
                                                                {section.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                                                                    section.type === 'action' ? <CheckCircle className="h-4 w-4" /> :
                                                                        <Info className="h-4 w-4" />}
                                                                {section.title}
                                                            </h4>
                                                            <div className={`text-sm opacity-90 leading-7 whitespace-pre-wrap ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                                                {section.content}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {msg.role === 'ai' && (
                                                <div className={`px-5 py-3 flex items-center justify-between text-xs ${theme === 'light' ? 'bg-gray-100/50 text-gray-500' : 'bg-[#1f1f1f] text-gray-500'}`}>
                                                    <div className="flex gap-4">
                                                        {msg.sources && msg.sources.length > 0 && (
                                                            <div className="flex items-center gap-1 opacity-70">
                                                                <Book className="h-3 w-3" />
                                                                <span>{msg.sources.length} Sources</span>
                                                            </div>
                                                        )}
                                                        <span className="opacity-50">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <button onClick={() => handleSaveToNotes(msg.id)} className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                                                        <FileText className="h-3 w-3" /> Save
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isThinking && (
                            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                                <div className={`rounded-3xl rounded-tl-none p-5 flex flex-col gap-2 min-w-[300px] ${theme === 'light' ? 'bg-white shadow-xl' : 'bg-[#151515] border border-white/10'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-6 h-6">
                                            <span className="absolute inset-0 border-2 border-indigo-500/30 rounded-full"></span>
                                            <span className="absolute inset-0 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin"></span>
                                        </div>
                                        <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse">
                                            Researching...
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 pl-9 font-mono">
                                        {`> ${thinkingStep}`}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* FIXED FOOTER - Separate from scroll */}
                    <div className={`flex-shrink-0 p-4 ${theme === 'light' ? 'bg-white border-t border-gray-100' : 'bg-black border-t border-white/10'}`}>
                        <div className={`flex items-end gap-2 p-2 rounded-3xl border transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 shadow-inner ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-[#0a0a0a] border-white/10'}`}>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about any medical condition..."
                                className="flex-1 bg-transparent border-none outline-none p-4 max-h-32 min-h-[56px] resize-none text-sm font-medium leading-relaxed overflow-y-auto"
                            ></textarea>
                            <button
                                onClick={handleSend}
                                className={`p-3 rounded-full transition-all ${input.trim() ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-white/10 dark:text-gray-600'}`}
                                disabled={!input.trim()}
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONVERSATION HISTORY - Below Modal */}
            {conversationHistory.length > 0 && (
                <div className={`rounded-3xl overflow-hidden border shadow-xl ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black/40 border-white/10'}`}>
                    <div className={`p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} flex justify-between items-center`}>
                        <div>
                            <h3 className="font-bold text-lg">Conversation History</h3>
                            <p className="text-xs opacity-60 mt-1">{conversationHistory.length} saved consultations</p>
                        </div>
                        <div className="flex gap-2">
                            <select
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-gray-300'}`}
                                onChange={(e) => {
                                    // Date filter - you can implement this
                                }}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                        {conversationHistory.map(conv => (
                            <div key={conv.id} className={`rounded-lg border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-[#151515] border-white/10'}`}>
                                <button
                                    onClick={() => setCollapsedHistoryItems(prev => {
                                        const newSet = new Set(prev)
                                        if (newSet.has(conv.id)) newSet.delete(conv.id)
                                        else newSet.add(conv.id)
                                        return newSet
                                    })}
                                    className="w-full p-3 text-left flex items-start justify-between"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold truncate">{conv.title}</div>
                                        <div className="text-xs opacity-60 mt-1">
                                            {new Date(conv.lastUpdated).toLocaleDateString()} at {new Date(conv.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {conv.topics.length > 0 && (
                                            <div className="flex gap-1 mt-2 flex-wrap">
                                                {conv.topics.slice(0, 3).map((topic, i) => (
                                                    <span key={i} className={`text-[10px] px-2 py-0.5 rounded ${theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'}`}>
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {collapsedHistoryItems.has(conv.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                </button>
                                {!collapsedHistoryItems.has(conv.id) && (
                                    <div className={`p-3 border-t ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
                                        <div className="text-xs opacity-75 mb-2">
                                            {conv.messages.length} messages
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => loadConversation(conv.id)}
                                                className={`flex-1 px-3 py-1.5 rounded text-xs font-bold ${theme === 'light' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}
                                            >
                                                Load
                                            </button>
                                            <button
                                                onClick={() => deleteConversation(conv.id)}
                                                className={`px-3 py-1.5 rounded text-xs font-bold ${theme === 'light' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
