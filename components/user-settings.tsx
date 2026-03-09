"use client"

import { useState, useEffect } from "react"
import { Save, User } from "lucide-react"
import ChangePasswordModal from "./modals/change-password-modal"
import TwoFactorAuthModal from "./modals/two-factor-auth-modal"
import { useAuth } from "./auth-provider"
import { supabase } from "@/lib/supabase"

export default function UserSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const [userData, setUserData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  })

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {}
      setUserData({
        email: user.email || "",
        firstName: meta.firstName || meta.full_name?.split(' ')[0] || "",
        lastName: meta.lastName || meta.full_name?.split(' ').slice(1).join(' ') || "",
        phone: meta.phone || "",
        address: meta.address || "",
      })
    }
  }, [user])

  const [successMessage, setSuccessMessage] = useState("")
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)
  const [twoFactorAuthModalOpen, setTwoFactorAuthModalOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState("")

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value,
    })
  }

  const handleChangePassword = (newPassword: any) => {
    console.log("Password changed to:", newPassword)
    setChangePasswordModalOpen(false)
    setSuccessMessage("Password changed successfully!")

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }

  const handleEnableTwoFactor = (method: string) => {
    console.log("Two-factor authentication enabled with method:", method)
    setTwoFactorAuthModalOpen(false)
    setTwoFactorEnabled(true)
    setTwoFactorMethod(method)
    setSuccessMessage("Two-factor authentication enabled successfully!")

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const full_name = `${userData.firstName} ${userData.lastName}`.trim()

      const { error } = await supabase.auth.updateUser({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          full_name: full_name,
          phone: userData.phone,
          address: userData.address
        }
      })

      if (error) throw error

      setSuccessMessage("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      setSuccessMessage("Error updating profile")
    } finally {
      setLoading(false)
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-purple-600 rounded-full p-3">
          <User className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">User Settings</h1>
          <p className="text-gray-400">Manage your personal account settings</p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-md p-3 text-green-400">
          {successMessage}
        </div>
      )}

      <div className="bg-[#2a2a2a] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={userData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
              />
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={userData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={userData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-2">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={userData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#2a2a2a] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Account Security</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Change Password</h3>
            <p className="text-gray-400 mb-4">It's a good idea to use a strong password that you don't use elsewhere</p>

            <button
              className="bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
              onClick={() => setChangePasswordModalOpen(true)}
            >
              Change Password
            </button>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
            <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>

            <button
              className={`${twoFactorEnabled ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded-md transition duration-200`}
              onClick={() => setTwoFactorAuthModalOpen(true)}
            >
              {twoFactorEnabled ? "Manage Two-Factor Authentication" : "Enable Two-Factor Authentication"}
            </button>
            {twoFactorEnabled && (
              <p className="text-sm text-green-400 mt-2">
                Two-factor authentication is enabled using{" "}
                {twoFactorMethod === "authenticator"
                  ? "an authenticator app"
                  : twoFactorMethod === "email"
                    ? "email"
                    : "a security key"}
                .
              </p>
            )}
          </div>
        </div>
      </div>

      {changePasswordModalOpen && (
        <ChangePasswordModal onClose={() => setChangePasswordModalOpen(false)} onSave={handleChangePassword} />
      )}

      {twoFactorAuthModalOpen && (
        <TwoFactorAuthModal onClose={() => setTwoFactorAuthModalOpen(false)} onEnable={handleEnableTwoFactor} />
      )}
    </div>
  )
}

