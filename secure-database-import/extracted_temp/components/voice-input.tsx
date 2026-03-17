"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getSpeechRecognition, isSpeechRecognitionSupported } from "@/lib/utils"

interface VoiceInputProps {
  onTextReceived: (text: string) => void
  stopOnSilence?: boolean
  className?: string
  color?: any
}

export function VoiceInput({ onTextReceived, stopOnSilence = true, className, color }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [hasReceivedSpeech, setHasReceivedSpeech] = useState(false)
  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Set up a timeout to detect silence
  const resetSilenceTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a 5-second timeout for silence
    timeoutRef.current = setTimeout(() => {
      if (isListening && !hasReceivedSpeech) {
        // If we haven't received any speech after 5 seconds, restart recognition
        if (recognitionRef.current) {
          console.log("No speech detected, restarting recognition")
          try {
            recognitionRef.current.stop()
            // Small delay before restarting
            setTimeout(() => {
              if (isListening) {
                recognitionRef.current.start()
              }
            }, 100)
          } catch (error) {
            console.error("Error restarting recognition:", error)
          }
        }
      }
    }, 5000)
  }

  useEffect(() => {
    // Initialize speech recognition
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition = getSpeechRecognition()
      if (!SpeechRecognition) return
      
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        setHasReceivedSpeech(true)
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('')

        // Send the transcript to the parent component
        onTextReceived(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.log('Speech recognition error', event.error)
        
        if (event.error === 'no-speech') {
          // Handle no-speech error gracefully - don't show error to user
          // Just restart recognition if we're still supposed to be listening
          if (isListening) {
            try {
              recognitionRef.current.stop()
              setTimeout(() => {
                if (isListening) {
                  recognitionRef.current.start()
                  resetSilenceTimeout()
                }
              }, 100)
            } catch (error) {
              console.error("Error restarting recognition after no-speech:", error)
            }
          }
        } else {
          // For other errors, show a toast and stop listening
          setIsListening(false)
          toast({
            title: "Voice Input Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          })
        }
      }

      recognitionRef.current.onend = () => {
        // Clear any pending timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        if (isListening) {
          // If we're still supposed to be listening, restart
          try {
            recognitionRef.current.start()
            resetSilenceTimeout()
          } catch (error) {
            console.error("Error restarting recognition:", error)
            setIsListening(false)
          }
        } else {
          setIsListening(false)
        }
      }

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started")
        setHasReceivedSpeech(false)
        resetSilenceTimeout()
      }

      recognitionRef.current.onspeechstart = () => {
        console.log("Speech started")
        setHasReceivedSpeech(true)
        // Clear the silence timeout since we've detected speech
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.error("Error stopping recognition during cleanup:", error)
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [onTextReceived, toast, isListening]),
\
  const toggleListening = async () => {
    if (!isSpeechRecognitionSupported()) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser. Please try Chrome, Edge, or Safari.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      // Stop listening
      setIsListening(false)
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      } catch (error) {
        console.error("Error stopping recognition:", error)
      }
    } else {
      // Start listening
      try {
        setIsInitializing(true)

        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true })

        setIsListening(true)
        setHasReceivedSpeech(false)

        try {
          recognitionRef.current.start()
        } catch (error) {
          console.error("Error starting recognition:", error)
          // If recognition is already started, stop it first
          if (error instanceof DOMException && error.name === "InvalidStateError") {
            recognitionRef.current.stop()
            setTimeout(() => {
              recognitionRef.current.start()
            }, 100)
          } else {
            throw error
          }
        }

        toast({
          title: "Voice Input Active",
          description: "Speak now. Your speech will be converted to text.",
        })
      } catch (error) {
        console.error("Error accessing microphone", error)
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        })
        setIsListening(false)
      } finally {
        setIsInitializing(false)
      }
    }
  }

  const buttonClass = color ? color.accent : ""

  return (
    <Button
      type="button"
      size="icon"
      variant={isListening ? "default" : "outline"}
      onClick={toggleListening}
      className={`relative ${isListening ? buttonClass : ""} ${className || ""}`}
      disabled={isInitializing}
      title={isListening ? "Stop voice input" : "Start voice input"}
    >
      {isInitializing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${hasReceivedSpeech ? "bg-green-400" : "bg-red-400"} opacity-75`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${hasReceivedSpeech ? "bg-green-500" : "bg-red-500"}`}
            ></span>
          </span>
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
      <span className="sr-only">{isListening ? "Stop voice input" : "Start voice input"}</span>
    </Button>
  )
}

