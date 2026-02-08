"use client"

import { useState } from "react"
import { Shield } from "lucide-react"

interface LogoProps {
    className?: string
    showText?: boolean
    size?: "sm" | "md" | "lg" | "xl"
    onClick?: () => void
}

export default function Logo({ className = "", showText = true, size = "md", onClick }: LogoProps) {
    const [imgError, setImgError] = useState(false)

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-24 h-24",
        xl: "w-32 h-32"
    }

    const iconSizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-12 w-12",
        xl: "h-16 w-16"
    }

    const textSizeClasses = {
        sm: "text-[4px]",
        md: "text-[6px]",
        lg: "text-[9px]",
        xl: "text-[11px]"
    }

    const slSizeClasses = {
        sm: "text-[6px]",
        md: "text-[10px]",
        lg: "text-[16px]",
        xl: "text-[20px]"
    }

    return (
        <div
            className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center bg-gradient-to-b from-[#4f83cc] to-[#1e3a8a] border border-white/20 shadow-xl overflow-hidden group ${className}`}
            onClick={onClick}
        >
            {/* High-quality CSS Fallback Logo that matches screenshot */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative flex flex-col items-center justify-center">
                    <Shield className={`${iconSizeClasses[size]} text-gray-200 drop-shadow-md group-hover:scale-110 transition-transform duration-500`} fill="rgba(255,255,255,0.1)" />
                    <span className={`absolute ${slSizeClasses[size]} font-black text-white tracking-tighter`}>SL</span>
                </div>
                {showText && (
                    <span className={`mt-1 ${textSizeClasses[size]} font-black text-white/90 uppercase tracking-widest`}>SecureLifeHub</span>
                )}
            </div>

            {!imgError && (
                <img
                    src="/securelifehub-logo.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    onError={() => setImgError(true)}
                />
            )}
        </div>
    )
}
