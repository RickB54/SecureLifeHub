"use client"

// Utility functions to save and load test data
export const saveTestData = () => {
  if (typeof window === "undefined") return false

  try {
    // Save databases
    const databases = localStorage.getItem("customDatabases")
    // Save reports
    const reports = localStorage.getItem("customDatabaseReports")
    // Save record images
    const recordImages = localStorage.getItem("recordImages")

    // Combine all data
    const testData = {
      databases,
      reports,
      recordImages,
      savedAt: new Date().toISOString(),
    }

    // Save to localStorage
    localStorage.setItem("savedTestData", JSON.stringify(testData))
    return true
  } catch (error) {
    console.error("Error saving test data:", error)
    return false
  }
}

export const loadTestData = () => {
  if (typeof window === "undefined") return false

  try {
    // Get saved test data
    const savedTestDataString = localStorage.getItem("savedTestData")
    if (!savedTestDataString) return false

    const savedTestData = JSON.parse(savedTestDataString)

    // Restore databases
    if (savedTestData.databases) {
      localStorage.setItem("customDatabases", savedTestData.databases)
    }

    // Restore reports
    if (savedTestData.reports) {
      localStorage.setItem("customDatabaseReports", savedTestData.reports)
    }

    // Restore record images
    if (savedTestData.recordImages) {
      localStorage.setItem("recordImages", savedTestData.recordImages)
    }

    return true
  } catch (error) {
    console.error("Error loading test data:", error)
    return false
  }
}

export const hasTestData = () => {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("savedTestData")
}

