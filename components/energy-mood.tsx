"use client"

import { useState } from "react"
import { Zap, Moon, Sun, Cloud, CloudRain, Smile, Meh, Frown, Battery, BatteryLow, BatteryMedium, BatteryFull, Activity, Plus, Trash2, Calendar, TrendingUp } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface EnergyMoodProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    deleteItem: (id: string) => Promise<void>
    theme: string
}

export default function EnergyMood({ records = [], addItem, deleteItem, theme }: EnergyMoodProps) {
    const logs = records.filter(r => r.type === "energy-mood-log")
    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm"
        : "bg-white/5 border border-white/10"

    const [energy, setEnergy] = useState(50)
    const [mood, setMood] = useState("meh")

    const moodIcons = {
        happy: Smile,
        meh: Meh,
        sad: Frown,
    }

    const energyIcons = (val: number) => {
        if (val < 33) return BatteryLow
        if (val < 66) return BatteryMedium
        return BatteryFull
    }

    const saveLog = async () => {
        await addItem({
            type: "energy-mood-log",
            title: `Energy & Mood Log`,
            category: "Health & Fitness",
            item_metadata: {
                energy,
                mood,
                timestamp: new Date().toISOString()
            }
        })
    }

    const chartData = logs.slice(-7).map(log => ({
        time: new Date(log.item_metadata.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        energy: log.item_metadata.energy
    }))

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden p-8`}>
            <div className="mb-8">
                <h1 className="text-3xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 uppercase flex items-center gap-3">
                    <Zap className="h-8 w-8 text-yellow-500" /> Energy & Mood Tracker
                </h1>
                <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-xs">Architect your vitality</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Logger Card */}
                <div className={`p-8 rounded-[2.5rem] ${glassCardStyle} flex flex-col gap-8`}>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Current State</h3>
                        
                        <div className="space-y-12">
                            {/* Energy Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold uppercase">Energy Level</span>
                                    <span className="text-2xl font-black italic text-yellow-500">{energy}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={energy} 
                                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-500"
                                />
                            </div>

                            {/* Mood Selection */}
                            <div className="space-y-4">
                                <span className="text-sm font-bold uppercase block">Mood Signature</span>
                                <div className="flex gap-4">
                                    {['sad', 'meh', 'happy'].map(m => {
                                        const Icon = moodIcons[m as keyof typeof moodIcons]
                                        return (
                                            <button 
                                                key={m}
                                                onClick={() => setMood(m)}
                                                className={`flex-1 p-6 rounded-2xl border transition-all flex flex-col items-center gap-2 ${mood === m ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'}`}
                                            >
                                                <Icon className="h-8 w-8" />
                                                <span className="text-[10px] font-black uppercase">{m}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={saveLog}
                        className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-2xl font-black uppercase italic tracking-tighter shadow-xl shadow-orange-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Secure State Log
                    </button>
                </div>

                {/* Chart Card */}
                <div className={`p-8 rounded-[2.5rem] ${glassCardStyle} flex flex-col`}>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Vitality Waveform</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e1e1e', borderRadius: '16px', border: '1px solid #ffffff10' }}
                                    itemStyle={{ color: '#eab308', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={4} fillOpacity={1} fill="url(#colorEnergy)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className={`flex-1 overflow-y-auto rounded-[2.5rem] ${glassCardStyle} p-8 custom-scrollbar`}>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Historical Logs</h3>
                <div className="space-y-4">
                    {logs.length === 0 ? (
                        <div className="text-center py-20 opacity-20 flex flex-col items-center">
                            <Activity className="h-12 w-12 mb-4" />
                            <p className="font-black uppercase tracking-widest">No spectral data detected</p>
                        </div>
                    ) : (
                        logs.sort((a,b) => new Date(b.item_metadata.timestamp).getTime() - new Date(a.item_metadata.timestamp).getTime()).map(log => {
                            const MoodIcon = moodIcons[log.item_metadata.mood as keyof typeof moodIcons] || Meh
                            return (
                                <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
                                            <MoodIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black uppercase text-white">{log.item_metadata.mood} Mood</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase">{new Date(log.item_metadata.timestamp).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-sm font-black italic text-orange-500">{log.item_metadata.energy}%</div>
                                            <div className="text-[8px] font-black uppercase text-gray-600">Energy</div>
                                        </div>
                                        <button onClick={() => deleteItem(log.id)} className="p-2 text-gray-700 hover:text-red-500 transition-colors">
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
    )
}
