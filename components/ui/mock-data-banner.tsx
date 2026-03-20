 "use client"

import { AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface MockDataBannerProps {
    onClear: () => void;
    theme: string;
    isForced?: boolean;
    pageName?: string;
}

export default function MockDataBanner({ onClear, theme, isForced = false, pageName }: MockDataBannerProps) {
    return (
        <div className={`
            animate-in fade-in slide-in-from-top-4 duration-500
            p-6 mb-8 rounded-[2rem] border shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6
            ${theme === 'light' 
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}
        `}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
                    <AlertCircle className="h-6 w-6 shrink-0" />
                </div>
                <div>
                    <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-1 ${theme === 'light' ? 'text-blue-900' : 'text-white'}`}>
                        Viewing Mock Data {pageName ? `• ${pageName}` : ''}
                    </h3>
                    <p className={`text-xs leading-relaxed max-w-xl ${theme === 'light' ? 'text-blue-700/80' : 'text-blue-400/80'}`}>
                        {isForced 
                            ? "Mock data is globally enabled in Settings. Real user data is currently hidden from this view."
                            : "This page is currently showing sample data to demonstrate its high-fidelity features. Start adding your own real data to replace these mock records."}
                    </p>
                </div>
            </div>
            <button 
                onClick={() => {
                    onClear();
                    toast.success("Mock data cleared. You can now start tracking real data.");
                }}
                className={`
                    px-8 py-3 w-full md:w-auto text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg
                    ${theme === 'light' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'}
                `}
            >
                Clear & Start Real Tracking
            </button>
        </div>
    )
}
