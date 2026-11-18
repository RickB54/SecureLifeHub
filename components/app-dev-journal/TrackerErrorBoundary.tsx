"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface TrackerErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface TrackerErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class TrackerErrorBoundary extends Component<
  TrackerErrorBoundaryProps,
  TrackerErrorBoundaryState
> {
  constructor(props: TrackerErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): TrackerErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("TrackerErrorBoundary caught an error:", error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div
          className="ag-tracker-backdrop"
          role="alert"
          style={{ zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            className="ag-tracker-dialog"
            style={{
              maxWidth: "480px",
              margin: "auto",
              padding: "2rem",
              textAlign: "center",
              backgroundColor: "#18181b",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
            }}
          >
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Something went wrong</h3>
              <p className="text-sm text-gray-300">
                An unexpected error occurred in the tracker interface.
              </p>
              {this.state.error?.message && (
                <pre className="text-xs text-red-300/80 bg-black/40 p-2 rounded max-w-full overflow-x-auto text-left font-mono">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload tracker
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
