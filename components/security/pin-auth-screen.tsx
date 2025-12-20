"use client"

import { useState, useEffect } from "react"
import { Lock, Unlock, ChevronRight, AlertCircle, Delete } from "lucide-react"

interface PinAuthScreenProps {
    moduleName: string
    onSuccess: () => void
    onCancel: () => void
    hashedPin?: string // in a real app, this would be hashed. For now, we compare direct string.
    theme: string
}

export default function PinAuthScreen({ moduleName, onSuccess, onCancel, hashedPin, theme }: PinAuthScreenProps) {
    const [pin, setPin] = useState("")
    const [error, setError] = useState(false)
    const [shake, setShake] = useState(false)

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === hashedPin) {
                onSuccess()
            } else {
                setError(true)
                setShake(true)
                setTimeout(() => {
                    setPin("")
                    setShake(false)
                    setError(false)
                }, 500)
            }
        }
    }, [pin, hashedPin, onSuccess])

    const handleNumClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num)
            setError(false)
        }
    }

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1))
        setError(false)
    }

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-xl ${theme === 'light' ? 'bg-white/80' : 'bg-black/90'}`}>
            <div className={`w-full max-w-sm p-8 rounded-3xl flex flex-col items-center ${shake ? 'animate-shake' : ''}`}>

                <div className="mb-8 flex flex-col items-center">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${error ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {error ? <AlertCircle className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        {moduleName} Locked
                    </h2>
                    <p className="text-gray-500 text-sm">Enter 4-digit PIN to access</p>
                </div>

                {/* PIN Dots */}
                <div className="flex gap-4 mb-10">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-4 w-4 rounded-full transition-all duration-300 ${i < pin.length
                                    ? (error ? 'bg-red-500' : (theme === 'light' ? 'bg-blue-600' : 'bg-white'))
                                    : (theme === 'light' ? 'bg-gray-200' : 'bg-white/10')
                                }`}
                        />
                    ))}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumClick(num.toString())}
                            className={`aspect-square rounded-2xl text-2xl font-semibold transition-all active:scale-95
                        ${theme === 'light'
                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                                }`}
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={onCancel}
                        className="aspect-square flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleNumClick("0")}
                        className={`aspect-square rounded-2xl text-2xl font-semibold transition-all active:scale-95
                    ${theme === 'light'
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                            }`}
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="aspect-square flex items-center justify-center text-gray-500 hover:text-gray-400"
                    >
                        <Delete className="h-6 w-6" />
                    </button>
                </div>

            </div>
            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
        </div>
    )
}
