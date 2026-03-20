import { useState, useMemo } from "react"
import { 
    Zap, Moon, Sun, Cloud, CloudRain, Smile, Meh, Frown, 
    Battery, BatteryLow, BatteryMedium, BatteryFull, Activity, 
    Plus, Trash2, Calendar, TrendingUp, Sparkles, Coffee, 
    Utensils, MessageSquare, Brain, Target
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts"
import { toast } from "sonner"

interface EnergyMoodProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    deleteItem: (id: string) => Promise<void>
    theme: string
}

const MOODS = [
    { id: 'ecstatic', label: 'Ecstatic', emoji: '🤩', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'happy', label: 'Happy', emoji: '😊', color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'calm', label: 'Calm', emoji: '😌', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'meh', label: 'Neutral', emoji: '😐', color: 'text-gray-400', bg: 'bg-gray-400/10' },
    { id: 'tired', label: 'Tired', emoji: '🥱', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'sad', label: 'Low', emoji: '😔', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'stressed', label: 'Stressed', emoji: '😤', color: 'text-red-400', bg: 'bg-red-400/10' },
]

export default function EnergyMood({ records = [], addItem, deleteItem, theme }: EnergyMoodProps) {
    const isDark = theme !== 'light'
    const logs = useMemo(() => 
        records.filter(r => r.type === "energy-mood-log")
        .sort((a,b) => new Date(b.item_metadata.timestamp).getTime() - new Date(a.item_metadata.timestamp).getTime()),
        [records]
    )

    const [energy, setEnergy] = useState(7)
    const [capacity, setCapacity] = useState(5)
    const [selectedMood, setSelectedMood] = useState('meh')
    const [reflection, setReflection] = useState("")

    const glassCardStyle = isDark
        ? "bg-white/5 border border-white/10"
        : "bg-white border border-gray-200 shadow-sm"

    const saveLog = async () => {
        try {
            await addItem({
                type: "energy-mood-log",
                title: `Vitality Sync: ${MOODS.find(m => m.id === selectedMood)?.emoji || '✨'}`,
                category: "Health Hub",
                item_metadata: {
                    energy,
                    capacity,
                    mood: selectedMood,
                    reflection,
                    timestamp: new Date().toISOString()
                }
            })
            setReflection("")
            toast.success("State synchronized to vault")
        } catch (e) {
            toast.error("Failed to log state")
        }
    }

    const chartData = useMemo(() => 
        [...logs].reverse().slice(-14).map(log => ({
            day: new Date(log.item_metadata.timestamp).toLocaleDateString([], { weekday: 'short', hour: '2-digit' }),
            energy: log.item_metadata.energy,
            capacity: log.item_metadata.capacity,
            moodLabel: MOODS.find(m => m.id === log.item_metadata.mood)?.label || 'Unknown'
        })),
        [logs]
    )

    const avgEnergy = useMemo(() => 
        logs.length > 0 ? (logs.reduce((acc, curr) => acc + (curr.item_metadata.energy || 0), 0) / logs.length).toFixed(1) : 0,
        [logs]
    )

    return (
        <div className={`h-full flex flex-col ${isDark ? 'bg-[#121212]' : 'bg-gray-50'} text-white overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8`}>
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-5xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 uppercase flex items-center gap-4">
                    <Activity className="h-10 w-10 text-yellow-500" /> State of Being
                </h1>
                <p className="text-gray-500 mt-2 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">Human Capacity & Mood Architecture</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Check-in Section */}
                <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
                    <div className={`p-8 rounded-[2.5rem] ${glassCardStyle} relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Sparkles className="h-32 w-32" />
                        </div>
                        
                        <div className="relative z-10 space-y-10">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-yellow-500" /> Instant Check-in
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Energy & Spoons */}
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <BatteryFull className="h-4 w-4 text-yellow-400" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Energy Level</span>
                                                </div>
                                                <span className="text-2xl font-black italic text-yellow-500">{energy}/10</span>
                                            </div>
                                            <input 
                                                type="range" min="1" max="10" step="1" value={energy} 
                                                onChange={(e) => setEnergy(parseInt(e.target.value))}
                                                className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-yellow-500"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Coffee className="h-4 w-4 text-orange-400" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Capacity / Spoons</span>
                                                </div>
                                                <span className="text-2xl font-black italic text-orange-500">{capacity}/10</span>
                                            </div>
                                            <input 
                                                type="range" min="1" max="10" step="1" value={capacity} 
                                                onChange={(e) => setCapacity(parseInt(e.target.value))}
                                                className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Mood Grid */}
                                    <div className="space-y-4">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-4">Mood Signature</span>
                                        <div className="grid grid-cols-4 gap-2">
                                            {MOODS.map(m => (
                                                <button 
                                                    key={m.id}
                                                    onClick={() => setSelectedMood(m.id)}
                                                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 group overflow-hidden relative ${selectedMood === m.id ? 'bg-white/10 border-white/30 text-white font-bold ring-2 ring-white/5' : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'}`}
                                                    title={m.label}
                                                >
                                                    <span className={`text-2xl mb-1 group-hover:scale-110 transition-transform ${selectedMood === m.id ? 'grayscale-0' : 'grayscale opacity-50 text-gray-500'}`}>{m.emoji}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">{m.label}</span>
                                                    {selectedMood === m.id && (
                                                       <div className={`absolute bottom-0 left-0 right-0 h-1 ${m.bg.replace('/10', '')}`} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reflection Area */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-blue-400" /> Quick Reflection
                                </h3>
                                <textarea 
                                    placeholder="What influenced your energy today? (Sleep, stress, events...)"
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    className={`w-full p-6 rounded-3xl border outline-none text-sm min-h-[100px] transition-all ${isDark ? 'bg-black/20 border-white/5 focus:border-white/20 text-white' : 'bg-gray-50 border-gray-100 focus:border-blue-400'}`}
                                />
                            </div>

                            <button 
                                onClick={saveLog}
                                className="w-full py-5 bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 text-white rounded-[2rem] font-black uppercase italic tracking-tighter shadow-2xl shadow-orange-900/40 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <Target className="h-5 w-5" /> Commit State to Repository
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vertical Stats / Insights */}
                <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
                    <div className={`p-8 rounded-[2.5rem] ${glassCardStyle} flex flex-col h-full`}>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8 font-mono">Vitality Analytics</h3>
                        
                        <div className="space-y-8 flex-1">
                            <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Average Energy</p>
                                    <p className="text-3xl font-black italic text-yellow-500">{avgEnergy}<span className="text-sm opacity-50 not-italic ml-1">/10</span></p>
                                </div>
                                <Activity className="h-8 w-8 text-yellow-500/20" />
                            </div>

                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="day" hide />
                                        <YAxis domain={[0, 10]} hide />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#121212', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', padding: '16px' }}
                                            labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', marginBottom: '8px', color: '#6b7280' }}
                                        />
                                        <Area type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={4} fill="url(#colorE)" dot={{ r: 4, fill: '#eab308', strokeWidth: 0 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                                    <Brain className="h-3 w-3" /> Cognitive Insight
                                </h4>
                                <p className="text-[10px] leading-relaxed text-gray-400 font-bold">
                                    {logs.length > 5 
                                        ? "Your capacity remains 15% higher in the mornings following 'Calm' entries. Consider scheduling deep work before 11 AM."
                                        : "Collect 5+ logs to generate AI-driven capacity optimization patterns."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historical Ledger */}
                <div className="lg:col-span-12">
                    <div className={`p-8 rounded-[3rem] ${glassCardStyle}`}>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Historical State Ledger</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Timeline of human performance</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {logs.length === 0 ? (
                                <div className="text-center py-24 opacity-20">
                                    <Activity className="h-16 w-16 mx-auto mb-4" />
                                    <p className="font-black uppercase tracking-[0.3em] text-xs">No temporal data points detected</p>
                                </div>
                            ) : (
                                logs.map(log => {
                                    const moodMeta = MOODS.find(m => m.id === log.item_metadata.mood)
                                    return (
                                        <div key={log.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl border border-white/10 ${moodMeta?.bg || 'bg-white/5'}`}>
                                                    {moodMeta?.emoji || '✨'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-black uppercase text-white tracking-tight">{moodMeta?.label || 'Unknown'} Mood</span>
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-gray-500">{new Date(log.item_metadata.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{new Date(log.item_metadata.timestamp).toDateString()}</div>
                                                    {log.item_metadata.reflection && (
                                                        <p className="text-xs text-gray-400 italic font-medium max-w-md line-clamp-1 group-hover:line-clamp-none transition-all">"{log.item_metadata.reflection}"</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between md:justify-end gap-12">
                                                <div className="flex gap-8">
                                                    <div className="text-center">
                                                        <div className="text-xl font-black italic text-yellow-500">{log.item_metadata.energy || 0}</div>
                                                        <div className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">Energy</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-black italic text-orange-500">{log.item_metadata.capacity || 0}</div>
                                                        <div className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">Spoons</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => deleteItem(log.id)} className="p-3 rounded-xl bg-red-500/0 hover:bg-red-500/10 text-gray-700 hover:text-red-500 transition-all">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
