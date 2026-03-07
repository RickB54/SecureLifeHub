"use client"

import { useState } from "react"
import { Shield } from "lucide-react"

interface LogoProps {
    className?: string
    showText?: boolean
    size?: "sm" | "md" | "lg" | "xl"
    onClick?: () => void
}

export default function Logo({ className = "", showText = false, size = "md", onClick }: LogoProps) {
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

    const slSizeClasses = {
        sm: "text-[10px]",
        md: "text-[14px]",
        lg: "text-[24px]",
        xl: "text-[34px]"
    }

    return (
        <div
            className={`relative ${sizeClasses[size]} flex items-center justify-center rounded-full overflow-hidden group ${className}`}
            onClick={onClick}
        >
            {/* High-quality CSS Fallback Logo */}
            {imgError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#4f83cc] to-[#1e3a8a] border-[0.5px] border-white/40 rounded-full">
                    <div className="relative flex flex-col items-center justify-center">
                        <Shield className={`${iconSizeClasses[size]} text-gray-200 drop-shadow-md group-hover:scale-110 transition-transform duration-500`} fill="rgba(255,255,255,0.1)" />
                        <span className={`absolute ${slSizeClasses[size]} font-black text-white tracking-tighter`}>SL</span>
                    </div>
                </div>
            )}

            {!imgError && (
                <img
                    src="/icon.png"
                    alt="Secure Life Hub"
                    className="w-full h-full object-cover z-10"
                    onError={() => setImgError(true)}
                />
            )}
        </div>
    )
}
