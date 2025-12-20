"use client"

import { useState } from "react"
import { X, Eye, EyeOff } from "lucide-react"

export default function ChangePasswordModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [error, setError] = useState("")
  const [strengthScore, setStrengthScore] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Calculate password strength if new password field is changed
    if (name === "newPassword") {
      calculatePasswordStrength(value)
    }
  }

  const calculatePasswordStrength = (password) => {
    let score = 0

    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1

    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    setStrengthScore(score)
  }

  const getStrengthLabel = () => {
    if (strengthScore <= 2) return { label: "Weak", color: "bg-red-500" }
    if (strengthScore <= 4) return { label: "Moderate", color: "bg-yellow-500" }
    return { label: "Strong", color: "bg-green-500" }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.currentPassword) {
      setError("Current password is required")
      return
    }

    if (!formData.newPassword) {
      setError("New password is required")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password")
      return
    }

    if (strengthScore < 3) {
      setError("Please use a stronger password")
      return
    }

    // Simulate checking current password
    if (formData.currentPassword !== "SecurePass123!") {
      setError("Current password is incorrect")
      return
    }

    // All validations passed
    onSave(formData.newPassword)
  }

  const strength = getStrengthLabel()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Change Master Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff] pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff] pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Password Strength:</span>
                    <span className="text-xs font-medium">{strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`${strength.color} h-1.5 rounded-full`}
                      style={{ width: `${(strengthScore / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff] pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-800 rounded-md p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="bg-blue-900 bg-opacity-30 border border-blue-800 rounded-md p-3">
              <h3 className="text-sm font-medium text-blue-400 mb-1">Password Tips:</h3>
              <ul className="text-xs text-blue-300 list-disc list-inside space-y-1">
                <li>Use at least 12 characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Include numbers and special characters</li>
                <li>Avoid using personal information</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#007bff] hover:bg-blue-600 text-white rounded-md transition duration-200"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

