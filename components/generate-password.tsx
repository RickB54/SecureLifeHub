"use client"

import { useState } from "react"
import { Copy, RefreshCw } from "lucide-react"

export default function GeneratePassword() {
  const [password, setPassword] = useState("Kj#9mPx$2vLq")
  const [length, setLength] = useState(12)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  // Generate password
  const generatePassword = () => {
    try {
      const lowercase = "abcdefghijklmnopqrstuvwxyz"
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      const numbers = "0123456789"
      const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

      let chars = lowercase
      if (includeUppercase) chars += uppercase
      if (includeNumbers) chars += numbers
      if (includeSymbols) chars += symbols

      let newPassword = ""
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        newPassword += chars[randomIndex]
      }

      setPassword(newPassword)
      console.log("Generated password:", newPassword)
    } catch (error) {
      console.log("Generate password error:", error)
    }
  }

  // Copy password to clipboard
  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(password)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
      console.log("Password copied to clipboard")
    } catch (error) {
      console.log("Copy error:", error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="bg-[#2a2a2a] rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Generate Password</h1>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={password}
              readOnly
              className="w-full px-4 py-3 bg-[#333] border border-gray-700 rounded-md text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#007bff]"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="p-1 text-gray-400 hover:text-white"
                aria-label="Copy password"
              >
                <Copy className="h-5 w-5" />
              </button>
              <button
                onClick={generatePassword}
                className="p-1 text-gray-400 hover:text-white"
                aria-label="Generate new password"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
          {copySuccess && <p className="text-green-500 text-sm mt-1">Password copied to clipboard!</p>}
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex justify-between items-center mb-2">
              <span>Password Length: {length}</span>
              <span className="text-sm text-gray-400">(8-32 characters)</span>
            </label>
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(Number.parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="uppercase"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"
              />
              <label htmlFor="uppercase" className="ml-2">
                Include Uppercase Letters
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="numbers"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"
              />
              <label htmlFor="numbers" className="ml-2">
                Include Numbers
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="symbols"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"
              />
              <label htmlFor="symbols" className="ml-2">
                Include Symbols
              </label>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={generatePassword}
              className="flex-1 bg-[#007bff] hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
            >
              Generate
            </button>

            <button
              onClick={copyToClipboard}
              className="flex-1 bg-[#007bff] hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

