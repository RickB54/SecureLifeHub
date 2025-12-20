"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a1a] text-white p-4">
          <h1 className="text-2xl font-bold mb-4">Error: Please refresh</h1>
          <p className="text-red-500 mb-4">Something went wrong.</p>
          <button
            className="bg-[#007bff] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

