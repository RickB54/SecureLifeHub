"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Plus, RefreshCw, ExternalLink, AlertCircle } from "lucide-react"

interface GoogleCalendarEvent {
    id: string
    summary: string
    start: { dateTime?: string; date?: string }
    end: { dateTime?: string; date?: string }
    description?: string
    location?: string
    colorId?: string
    calendarId: string
    calendarName: string
}

interface GoogleCalendarIntegrationProps {
    theme: string
    existingAppointments: any[]
    onScheduleAppointment: () => void
}

export default function GoogleCalendarIntegration({ theme, existingAppointments, onScheduleAppointment }: GoogleCalendarIntegrationProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [calendars, setCalendars] = useState<any[]>([])
    const [events, setEvents] = useState<GoogleCalendarEvent[]>([])
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Check if Google Calendar is connected
    useEffect(() => {
        // TODO: Check actual Google API connection status
        const connected = localStorage.getItem('google-calendar-connected') === 'true'
        setIsConnected(connected)
    }, [])

    const connectGoogleCalendar = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // TODO: Implement Google OAuth
            // For now, we'll simulate the connection
            const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

            if (!CLIENT_ID) {
                throw new Error('Google Calendar API not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env file.')
            }

            // Placeholder for actual OAuth flow
            alert('Google Calendar Integration:\n\nTo fully enable this feature, you need to:\n\n1. Create a Google Cloud Project\n2. Enable Google Calendar API\n3. Create OAuth 2.0 credentials\n4. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env\n\nFor now, it will work with mock data.')

            localStorage.setItem('google-calendar-connected', 'true')
            setIsConnected(true)

            // Mock calendars for demo
            setCalendars([
                { id: 'primary', summary: 'Personal', backgroundColor: '#4285F4' },
                { id: 'business', summary: 'Business', backgroundColor: '#0B8043' },
                { id: 'family', summary: 'Family', backgroundColor: '#F4B400' }
            ])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const disconnectGoogleCalendar = () => {
        if (confirm('Disconnect Google Calendar?\n\nYou can reconnect anytime.')) {
            localStorage.removeItem('google-calendar-connected')
            setIsConnected(false)
            setCalendars([])
            setEvents([])
        }
    }

    const fetchCalendarEvents = async () => {
        if (!isConnected) return

        setIsLoading(true)
        try {
            // TODO: Implement actual Google Calendar API call
            // const response = await gapi.client.calendar.events.list({...})

            // Mock events for demo
            const mockEvents: GoogleCalendarEvent[] = [
                {
                    id: '1',
                    summary: 'Team Meeting',
                    start: { dateTime: new Date(2026, 0, 10, 10, 0).toISOString() },
                    end: { dateTime: new Date(2026, 0, 10, 11, 0).toISOString() },
                    calendarId: 'business',
                    calendarName: 'Business'
                },
                {
                    id: '2',
                    summary: 'Dentist Appointment',
                    start: { dateTime: new Date(2026, 0, 15, 14, 30).toISOString() },
                    end: { dateTime: new Date(2026, 0, 15, 15, 30).toISOString() },
                    calendarId: 'personal',
                    calendarName: 'Personal'
                }
            ]

            setEvents(mockEvents)
        } catch (err) {
            console.error('Failed to fetch calendar events', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isConnected) {
            fetchCalendarEvents()
        }
    }, [isConnected, selectedDate])

    const getDayEvents = (date: Date) => {
        const dayStart = new Date(date)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)

        return events.filter(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date!)
            return eventStart >= dayStart && eventStart <= dayEnd
        })
    }

    const isBusy = (date: Date, hour: number) => {
        const dayEvents = getDayEvents(date)
        return dayEvents.some(event => {
            const eventStart = new Date(event.start.dateTime!)
            const eventHour = eventStart.getHours()
            return eventHour === hour
        })
    }

    if (!isConnected) {
        return (
            <div className={`rounded-3xl border p-8 text-center ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black/40 border-white/10'}`}>
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-blue-500 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Connect Google Calendar</h3>
                <p className={`text-sm mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    View all your calendars (Personal, Business, Family) in one place to avoid scheduling conflicts.
                </p>
                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-sm text-red-500">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div className="text-left">{error}</div>
                    </div>
                )}
                <button
                    onClick={connectGoogleCalendar}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold">Integrated Calendar View</h3>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {calendars.length} calendar{calendars.length !== 1 ? 's' : ''} connected
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchCalendarEvents}
                        disabled={isLoading}
                        className={`p-2 rounded-xl ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'} transition-all disabled:opacity-50`}
                        title="Refresh"
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={onScheduleAppointment}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Schedule Appointment
                    </button>
                    <button
                        onClick={disconnectGoogleCalendar}
                        className={`px-4 py-2 rounded-xl text-sm ${theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/10 text-gray-400'}`}
                    >
                        Disconnect
                    </button>
                </div>
            </div>

            {/* Calendar Chips */}
            <div className="flex gap-2 flex-wrap">
                {calendars.map(cal => (
                    <div
                        key={cal.id}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2"
                        style={{ backgroundColor: cal.backgroundColor + '20', color: cal.backgroundColor }}
                    >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cal.backgroundColor }}></div>
                        {cal.summary}
                    </div>
                ))}
            </div>

            {/* Unified Timeline View */}
            <div className={`rounded-3xl border overflow-hidden ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black/40 border-white/10'}`}>
                <div className="p-6">
                    <h4 className="font-bold mb-4">Today's Schedule - {selectedDate.toLocaleDateString()}</h4>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {Array.from({ length: 24 }, (_, hour) => {
                            const hourEvents = events.filter(e => {
                                const eventStart = new Date(e.start.dateTime!)
                                return eventStart.getHours() === hour
                            })
                            const busy = isBusy(selectedDate, hour)

                            return (
                                <div
                                    key={hour}
                                    className={`flex gap-3 p-3 rounded-xl transition-all ${busy
                                            ? theme === 'light'
                                                ? 'bg-blue-50 border border-blue-200'
                                                : 'bg-blue-500/10 border border-blue-500/20'
                                            : theme === 'light'
                                                ? 'hover:bg-gray-50'
                                                : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="w-20 text-sm font-mono opacity-60">
                                        {hour.toString().padStart(2, '0')}:00
                                    </div>
                                    <div className="flex-1">
                                        {hourEvents.length > 0 ? (
                                            hourEvents.map(event => (
                                                <div
                                                    key={event.id}
                                                    className={`p-3 rounded-lg mb-2 ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-white/5 border border-white/10'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-bold text-sm">{event.summary}</h5>
                                                            <p className="text-xs opacity-60">{event.calendarName}</p>
                                                        </div>
                                                        <ExternalLink className="h-4 w-4 opacity-50" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-sm opacity-40">Available</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Upcoming Health Appointments */}
            {existingAppointments.length > 0 && (
                <div>
                    <h4 className="font-bold mb-3">Your Health Appointments</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {existingAppointments.map(apt => (
                            <div
                                key={apt.id}
                                className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-green-50 border-green-200' : 'bg-green-500/10 border-green-500/20'}`}
                            >
                                <h5 className="font-bold text-sm mb-1">{apt.title}</h5>
                                <p className="text-xs opacity-75">{new Date(apt.item_metadata.date).toLocaleString()}</p>
                                {apt.item_metadata.doctor && (
                                    <p className="text-xs opacity-60 mt-1">Dr. {apt.item_metadata.doctor}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
