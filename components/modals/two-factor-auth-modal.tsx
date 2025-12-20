"use client"

import { useState } from "react"
import { X, Copy, CheckCircle, Smartphone, Mail, Key } from "lucide-react"

export default function TwoFactorAuthModal({ onClose, onEnable }) {
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [recoveryCodesCopied, setRecoveryCodesCopied] = useState(false)

  // Generate a fake QR code URL
  const qrCodeUrl = "/placeholder.svg?height=200&width=200"

  // Generate fake secret key
  const secretKey = "ABCD EFGH IJKL MNOP"

  // Generate fake recovery codes
  const recoveryCodes = [
    "1A2B3C4D5E6F7G8H",
    "9I0J1K2L3M4N5O6P",
    "7Q8R9S0T1U2V3W4X",
    "5Y6Z7A8B9C0D1E2F",
    "3G4H5I6J7K8L9M0N",
    "1O2P3Q4R5S6T7U8V",
  ]

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod)
    setStep(2)
  }

  const handleVerifyCode = (e) => {
    e.preventDefault()

    if (!verificationCode) {
      setError("Please enter the verification code")
      return
    }

    // Simulate verification - in a real app, this would validate against a backend
    if (verificationCode === "123456") {
      setStep(3)
      setError("")
    } else {
      setError("Invalid verification code. Please try again.")
    }
  }

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"))
    setRecoveryCodesCopied(true)

    setTimeout(() => {
      setRecoveryCodesCopied(false)
    }, 3000)
  }

  const finishSetup = () => {
    onEnable(method)
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-gray-300 mb-4">
        Two-factor authentication adds an extra layer of security to your account. Choose how you want to receive
        verification codes:
      </p>

      <div className="space-y-3">
        <button
          onClick={() => handleMethodSelect("authenticator")}
          className="w-full flex items-center p-3 bg-[#333] hover:bg-gray-600 rounded-md transition-colors"
        >
          <Smartphone className="h-5 w-5 mr-3 text-green-400" />
          <div className="text-left">
            <h3 className="font-medium">Authenticator App</h3>
            <p className="text-xs text-gray-400">Use Google Authenticator, Authy, or similar apps</p>
          </div>
        </button>

        <button
          onClick={() => handleMethodSelect("email")}
          className="w-full flex items-center p-3 bg-[#333] hover:bg-gray-600 rounded-md transition-colors"
        >
          <Mail className="h-5 w-5 mr-3 text-blue-400" />
          <div className="text-left">
            <h3 className="font-medium">Email</h3>
            <p className="text-xs text-gray-400">Receive codes via email</p>
          </div>
        </button>

        <button
          onClick={() => handleMethodSelect("security_key")}
          className="w-full flex items-center p-3 bg-[#333] hover:bg-gray-600 rounded-md transition-colors"
        >
          <Key className="h-5 w-5 mr-3 text-yellow-400" />
          <div className="text-left">
            <h3 className="font-medium">Security Key</h3>
            <p className="text-xs text-gray-400">Use a physical security key like YubiKey</p>
          </div>
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      {method === "authenticator" && (
        <>
          <p className="text-gray-300 mb-4">
            Scan this QR code with your authenticator app, or enter the secret key manually:
          </p>

          <div className="flex justify-center mb-4">
            <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="border border-gray-700 rounded-md" />
          </div>

          <div className="bg-[#333] p-3 rounded-md flex justify-between items-center">
            <code className="font-mono text-sm">{secretKey}</code>
            <button onClick={() => navigator.clipboard.writeText(secretKey)} className="text-gray-400 hover:text-white">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {method === "email" && (
        <p className="text-gray-300 mb-4">
          We've sent a verification code to your email address (user123@example.com). Please check your inbox and enter
          the code below.
        </p>
      )}

      {method === "security_key" && (
        <p className="text-gray-300 mb-4">
          Insert your security key and tap it when prompted. Then enter the verification code displayed.
        </p>
      )}

      <form onSubmit={handleVerifyCode}>
        <div className="mb-4">
          <label htmlFor="verification-code" className="block text-sm font-medium mb-1">
            Verification Code
          </label>
          <input
            id="verification-code"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
          />
          <p className="text-xs text-gray-400 mt-1">Hint: Use 123456 for this demo</p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-800 rounded-md p-3 mb-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition duration-200"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#007bff] hover:bg-blue-600 text-white rounded-md transition duration-200"
          >
            Verify
          </button>
        </div>
      </form>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="bg-green-900 bg-opacity-30 border border-green-800 rounded-md p-3 mb-4">
        <p className="text-sm text-green-400">Two-factor authentication has been successfully set up!</p>
      </div>

      <p className="text-gray-300 mb-4">
        Save these recovery codes in a safe place. You can use them to regain access to your account if you lose your
        two-factor authentication device.
      </p>

      <div className="bg-[#333] p-3 rounded-md mb-4">
        <div className="grid grid-cols-2 gap-2">
          {recoveryCodes.map((code, index) => (
            <code key={index} className="font-mono text-sm">
              {code}
            </code>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={copyRecoveryCodes} className="flex items-center text-blue-400 hover:text-blue-300">
          {recoveryCodesCopied ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy recovery codes
            </>
          )}
        </button>

        <button
          onClick={finishSetup}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition duration-200"
        >
          Finish Setup
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Set Up Two-Factor Authentication</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  )
}

