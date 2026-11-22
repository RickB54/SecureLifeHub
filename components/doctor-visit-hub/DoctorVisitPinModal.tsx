"use client"

import React, { useState } from "react"
import { Lock, KeyRound, X, Check, Trash2, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { hashPin, savePinHash, getSavedPinHash } from "./doctor-visit-api"

interface DoctorVisitPinModalProps {
  isOpen: boolean
  mode: "auth" | "manage" // "auth" = enter PIN to unlock; "manage" = set/change/remove PIN
  onSuccess: () => void
  onClose: () => void
  theme?: string
}

export default function DoctorVisitPinModal({
  isOpen,
  mode,
  onSuccess,
  onClose,
  theme = "dark",
}: DoctorVisitPinModalProps) {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [currentPin, setCurrentPin] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [step, setStep] = useState<"enter" | "set_new" | "confirm_new">("enter")

  if (!isOpen) return null

  const savedHash = getSavedPinHash()
  const isDark = theme !== "light"

  const handleDigit = (digit: string) => {
    setErrorMsg("")
    if (mode === "auth") {
      if (pin.length < 4) {
        const next = pin + digit
        setPin(next)
        if (next.length === 4) {
          validateAuth(next)
        }
      }
    } else {
      // manage mode
      if (step === "enter" && savedHash) {
        if (currentPin.length < 4) {
          const next = currentPin + digit
          setCurrentPin(next)
          if (next.length === 4) {
            validateCurrent(next)
          }
        }
      } else if (step === "set_new" || !savedHash) {
        if (pin.length < 4) {
          const next = pin + digit
          setPin(next)
          if (next.length === 4) {
            setStep("confirm_new")
          }
        }
      } else if (step === "confirm_new") {
        if (confirmPin.length < 4) {
          const next = confirmPin + digit
          setConfirmPin(next)
          if (next.length === 4) {
            finalizeNewPin(next)
          }
        }
      }
    }
  }

  const handleBackspace = () => {
    setErrorMsg("")
    if (mode === "auth") {
      setPin((p) => p.slice(0, -1))
    } else {
      if (step === "enter" && savedHash) {
        setCurrentPin((p) => p.slice(0, -1))
      } else if (step === "set_new" || !savedHash) {
        setPin((p) => p.slice(0, -1))
      } else if (step === "confirm_new") {
        setConfirmPin((p) => p.slice(0, -1))
      }
    }
  }

  const validateAuth = async (enteredPin: string) => {
    if (!savedHash) {
      onSuccess()
      return
    }
    const hash = await hashPin(enteredPin)
    if (hash === savedHash) {
      onSuccess()
    } else {
      setErrorMsg("Incorrect PIN. Please try again.")
      setTimeout(() => setPin(""), 600)
    }
  }

  const validateCurrent = async (enteredPin: string) => {
    const hash = await hashPin(enteredPin)
    if (hash === savedHash) {
      setStep("set_new")
      setCurrentPin("")
    } else {
      setErrorMsg("Incorrect current PIN.")
      setTimeout(() => setCurrentPin(""), 600)
    }
  }

  const finalizeNewPin = async (confirmed: string) => {
    if (confirmed !== pin) {
      setErrorMsg("PINs do not match. Start over.")
      setPin("")
      setConfirmPin("")
      setStep("set_new")
      return
    }
    const hash = await hashPin(confirmed)
    savePinHash(hash)
    onSuccess()
  }

  const handleRemovePin = () => {
    if (confirm("Remove PIN lock? The Doctor Visit Hub will open without a PIN.")) {
      savePinHash(null)
      onSuccess()
    }
  }

  const getDots = () => {
    let value = pin
    if (mode === "manage") {
      if (step === "enter" && savedHash) value = currentPin
      else if (step === "confirm_new") value = confirmPin
    }
    return [0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={`w-4 h-4 rounded-full border-2 transition-all ${
          i < value.length
            ? "bg-blue-500 border-blue-500 shadow-md shadow-blue-500/50 scale-110"
            : isDark
            ? "border-slate-600 bg-slate-800/50"
            : "border-slate-300 bg-slate-100"
        }`}
      />
    ))
  }

  const getPromptText = () => {
    if (mode === "auth") return "Enter 4-digit PIN to access Doctor Visit Hub"
    if (step === "enter" && savedHash) return "Enter current PIN to change settings"
    if (step === "set_new" || !savedHash) return "Choose a new 4-digit PIN"
    return "Re-enter new 4-digit PIN to confirm"
  }

  return (
    <div
      className="fixed inset-0 z-[100050] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border transition-all ${
          isDark
            ? "bg-slate-900 border-slate-700/80 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {mode === "auth" ? "Visit Hub Security" : "PIN Lock Settings"}
              </h3>
              <p className="text-xs text-slate-400">
                {savedHash ? "PIN Protected" : "No PIN Configured"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Prompt */}
        <div className="text-center py-3">
          <p className="text-sm font-medium text-slate-300">{getPromptText()}</p>
          <div className="flex justify-center gap-3 my-5">{getDots()}</div>
          {errorMsg && (
            <p className="text-xs font-semibold text-rose-400 animate-pulse">{errorMsg}</p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className={`h-14 rounded-2xl text-xl font-bold transition-all active:scale-95 flex items-center justify-center ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700/50"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
              }`}
            >
              {digit}
            </button>
          ))}
          <div className="flex items-center justify-center">
            {mode === "manage" && savedHash && (
              <button
                type="button"
                onClick={handleRemovePin}
                title="Remove PIN"
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex flex-col items-center gap-0.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className={`h-14 rounded-2xl text-xl font-bold transition-all active:scale-95 flex items-center justify-center ${
              isDark
                ? "bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700/50"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
            }`}
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className={`h-14 rounded-2xl font-semibold transition-all active:scale-95 flex items-center justify-center text-sm ${
              isDark
                ? "bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-500"
            }`}
          >
            Delete
          </button>
        </div>

        {/* Footer info */}
        {mode === "auth" && (
          <p className="text-[11px] text-center text-slate-500">
            PIN protects personal medical info during visits.
          </p>
        )}
      </div>
    </div>
  )
}
