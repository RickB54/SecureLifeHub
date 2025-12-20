"use client"

import { useState, useEffect } from "react"
import { Copy, ExternalLink, CheckCircle, X } from "lucide-react"

interface AutoFillProps {
  passwordData: any
  onClose: () => void
  theme: string
}

export default function AutoFill({ passwordData, onClose, theme }: AutoFillProps) {
  const [copied, setCopied] = useState({
    username: false,
    password: false,
  })
  const [countdown, setCountdown] = useState(15)

  // Start countdown when component mounts
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto close when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      onClose()
    }
  }, [countdown, onClose])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [type]: true })

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [type]: false }))
    }, 2000)
  }

  const openWebsite = () => {
    let url = passwordData.website

    // Add https:// if not present
    if (url && !url.startsWith("http")) {
      url = "https://" + url
    }

    if (url) {
      window.open(url, "_blank")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#2a2a2a] text-white'} rounded-lg shadow-lg w-full max-w-md`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Auto Fill</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-3">Closes in {countdown}s</span>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className={`mb-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              Copy your credentials for <strong>{passwordData.website}</strong> and paste them into the website.
            </p>

            <div className={`${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-[#333] border-gray-700'} border rounded-md p-4 mb-4`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Username</span>
                <button
                  onClick={() => copyToClipboard(passwordData.username, "username")}
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  {copied.username ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#222] border-gray-800'} p-2 rounded border mb-4 font-mono text-sm`}>
                {passwordData.username}
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Password</span>
                <button
                  onClick={() => copyToClipboard(passwordData.password, "password")}
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  {copied.password ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#222] border-gray-800'} p-2 rounded border font-mono text-sm`}>
                {passwordData.password}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={openWebsite}
              className="flex items-center justify-center bg-[#007bff] hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Open {passwordData.website}
            </button>

            <div className="text-sm text-gray-400 text-center">
              <p>For security reasons, this window will automatically close in {countdown} seconds.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

