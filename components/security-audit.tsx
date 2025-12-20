"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Filter, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"

export default function SecurityAudit({ records, securityAuditData, setSecurityAuditData }) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuditRunning, setIsAuditRunning] = useState(false)

  // Get all passwords
  const passwords = records.filter((record) => record.type === "password")

  // Current date for age calculations
  const currentDate = new Date("2025-03-18")

  // Function to check if a password is weak
  const isWeakPassword = (password) => {
    // Check if password is less than 8 characters
    if (!password || password.length < 8) return true

    // Check if password has special characters or numbers
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)
    const hasNumber = /\d/.test(password)

    return !(hasSpecialChar && hasNumber)
  }

  // Function to check if a password is medium strength
  const isMediumPassword = (password) => {
    // Not weak but could be stronger
    if (isWeakPassword(password)) return false

    // Check for stronger criteria (length >= 12 and uppercase, lowercase, numbers, special chars)
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)

    return !(password.length >= 12 && hasUppercase && hasLowercase && hasNumber && hasSpecialChar)
  }

  // Function to check if a password is old (older than 6 months)
  const isOldPassword = (lastUpdated) => {
    if (!lastUpdated) return true

    // Parse the lastUpdated date
    const updateDate = new Date(lastUpdated)

    // Calculate the difference in months
    const monthDiff =
      (currentDate.getFullYear() - updateDate.getFullYear()) * 12 + (currentDate.getMonth() - updateDate.getMonth())

    return monthDiff >= 6
  }

  // Function to get time ago string
  const getTimeAgo = (lastUpdated) => {
    if (!lastUpdated) return "unknown"

    const updateDate = new Date(lastUpdated)
    const monthDiff =
      (currentDate.getFullYear() - updateDate.getFullYear()) * 12 + (currentDate.getMonth() - updateDate.getMonth())

    if (monthDiff === 0) {
      const dayDiff = currentDate.getDate() - updateDate.getDate()
      if (dayDiff === 0) return "today"
      if (dayDiff === 1) return "yesterday"
      return `${dayDiff} days ago`
    }

    if (monthDiff === 1) return "1 month ago"
    if (monthDiff < 12) return `${monthDiff} months ago`

    const yearDiff = Math.floor(monthDiff / 12)
    return yearDiff === 1 ? "1 year ago" : `${yearDiff} years ago`
  }

  // Function to analyze passwords and calculate security metrics
  const analyzePasswords = () => {
    setIsAuditRunning(true)

    // Start with a perfect score
    let score = 100

    // Count issues
    let weakCount = 0
    let reusedCount = 0
    let oldCount = 0

    // Track password usage to detect reuse
    const passwordUsage = {}

    // Analyze each password
    const passwordsData = passwords.map((password) => {
      // Check strength
      let strength = "strong"
      if (isWeakPassword(password.password)) {
        strength = "weak"
        weakCount++
        score -= 10 // Deduct 10 points for weak password
      } else if (isMediumPassword(password.password)) {
        strength = "medium"
        score -= 5 // Deduct 5 points for medium password
      }

      // Check reuse
      if (!passwordUsage[password.password]) {
        passwordUsage[password.password] = [password.website || password.username]
      } else {
        passwordUsage[password.password].push(password.website || password.username)
      }

      // Check age
      const isOld = isOldPassword(password.updatedAt)
      if (isOld) {
        oldCount++
        score -= 5 // Deduct 5 points for old password
      }

      return {
        name: password.website || password.username || "Unnamed",
        strength,
        reused: "No", // Will update after analyzing all passwords
        lastChange: getTimeAgo(password.updatedAt),
      }
    })

    // Update reused status and count
    for (const pwd in passwordUsage) {
      if (passwordUsage[pwd].length > 1) {
        // This password is reused
        reusedCount += passwordUsage[pwd].length

        // Update the reused status in passwordsData
        passwordsData.forEach((data) => {
          if (passwordUsage[pwd].includes(data.name)) {
            data.reused = "Yes"
            // Additional penalty for reused passwords
            score -= 20 / passwordUsage[pwd].length // Distribute the 20-point penalty
          }
        })
      }
    }

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)))

    // Update security audit data
    const updatedAuditData = {
      score,
      reused: reusedCount,
      weak: weakCount,
      old: oldCount,
      passwordsData,
      lastRun: new Date().toISOString(),
    }

    setSecurityAuditData(updatedAuditData)
    setIsAuditRunning(false)
    console.log("Audit re-run")
  }

  // Run analysis when records change (using a stable hash to avoid infinite loops)
  const recordsHash = records
    .filter(r => r.type === 'password')
    .map(r => `${r.id}-${r.updatedAt}`)
    .sort()
    .join('|')

  useEffect(() => {
    if (records.length > 0) {
      analyzePasswords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordsHash])

  // Handle re-run audit
  const handleRerunAudit = () => {
    analyzePasswords()
  }

  // Filter passwords based on search query
  const getFilteredPasswords = () => {
    if (!securityAuditData || !securityAuditData.passwordsData) return []

    if (!searchQuery.trim()) return securityAuditData.passwordsData

    const query = searchQuery.toLowerCase()
    return securityAuditData.passwordsData.filter((password) => password.name.toLowerCase().includes(query))
  }

  // Get security score color
  const getScoreColor = (score) => {
    if (score < 40) return "text-red-500"
    if (score < 70) return "text-yellow-500"
    return "text-green-500"
  }

  // Get security score label
  const getScoreLabel = (score) => {
    if (score < 40) return "Weak"
    if (score < 70) return "Fair"
    return "Strong"
  }

  // Get strength icon
  const getStrengthIcon = (strength) => {
    if (strength === "weak") return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (strength === "medium") return <AlertCircle className="h-5 w-5 text-yellow-500" />
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  // Generate recommendations based on actual issues
  const getRecommendations = () => {
    const recommendations = []

    if (securityAuditData?.old > 0) {
      recommendations.push({
        icon: <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />,
        text: "Update passwords that haven't been changed in over 6 months",
      })
    }

    if (securityAuditData?.weak > 0) {
      recommendations.push({
        icon: <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />,
        text: "Replace weak passwords with stronger ones",
      })
    }

    if (securityAuditData?.reused > 0) {
      recommendations.push({
        icon: <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />,
        text: "Use unique passwords for each account",
      })
    }

    if (recommendations.length === 0) {
      recommendations.push({
        icon: <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />,
        text: "Your password security looks good! Keep up the good work.",
      })
    }

    return recommendations
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Security Audit</h1>
          <p className="text-gray-400">Analyze your password security</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRerunAudit}
            disabled={isAuditRunning}
            className="flex items-center bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isAuditRunning ? "animate-spin" : ""}`} />
            {isAuditRunning ? "Running..." : "Re-run Audit"}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-[#333] hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <Filter className="h-5 w-5 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search passwords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-[#333] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff]"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2a2a2a] rounded-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Security Score</h2>
          <div className="relative w-32 h-32 mb-2">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={
                  securityAuditData?.score < 40 ? "#ef4444" : securityAuditData?.score < 70 ? "#f59e0b" : "#10b981"
                }
                strokeWidth="10"
                strokeDasharray={`${(securityAuditData?.score || 0) * 2.83} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text
                x="50"
                y="50"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                fill="white"
              >
                {securityAuditData?.score || 0}%
              </text>
            </svg>
          </div>
          <div className={`text-lg font-bold ${getScoreColor(securityAuditData?.score || 0)}`}>
            {getScoreLabel(securityAuditData?.score || 0)}
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Password Issues</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Reused Passwords</span>
              <span className="text-red-500 font-semibold">{securityAuditData?.reused || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Weak Passwords</span>
              <span className="text-yellow-500 font-semibold">{securityAuditData?.weak || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Old Passwords</span>
              <span className="text-yellow-500 font-semibold">{securityAuditData?.old || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <ul className="space-y-2 text-sm">
            {getRecommendations().map((recommendation, index) => (
              <li key={index} className="flex items-start">
                {recommendation.icon}
                <span>{recommendation.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-[#2a2a2a] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Password Analysis</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#333] text-left">
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Password Strength</th>
                <th className="py-3 px-4 font-semibold">Reused</th>
                <th className="py-3 px-4 font-semibold">Last Change</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredPasswords().map((password, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-3 px-4">{password.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {getStrengthIcon(password.strength)}
                      <span className="ml-2">
                        {password.strength.charAt(0).toUpperCase() + password.strength.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={password.reused === "Yes" ? "text-red-500" : "text-green-500"}>
                      {password.reused}
                    </span>
                  </td>
                  <td className="py-3 px-4">{password.lastChange}</td>
                </tr>
              ))}
              {getFilteredPasswords().length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">
                    No password data available. Add passwords to see analysis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

