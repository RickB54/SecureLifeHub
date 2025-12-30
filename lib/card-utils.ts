// Financial card color gradients
export const cardGradients = [
    { name: 'red', from: 'from-red-600', to: 'to-red-800', label: 'Classic Red' },
    { name: 'blue', from: 'from-blue-600', to: 'to-blue-800', label: 'Ocean Blue' },
    { name: 'gold', from: 'from-yellow-600', to: 'to-yellow-800', label: 'Gold' },
    { name: 'green', from: 'from-green-600', to: 'to-green-800', label: 'Emerald' },
    { name: 'purple', from: 'from-purple-600', to: 'to-purple-800', label: 'Royal Purple' },
]

// Format card number with spaces
export const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ')
}

// Mask card number (show last 4 digits)
export const maskCardNumber = (cardNumber: string): string => {
    if (!cardNumber) return '•••• •••• •••• ••••'
    const cleaned = cardNumber.replace(/\s/g, '')
    if (cleaned.length < 4) return '•••• •••• •••• ' + cleaned
    const lastFour = cleaned.slice(-4)
    return `•••• •••• •••• ${lastFour}`
}

// Detect card type from number
export const detectCardType = (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\s/g, '')

    if (/^4/.test(cleaned)) return 'Visa'
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard'
    if (/^3[47]/.test(cleaned)) return 'American Express'
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover'

    return 'Unknown'
}

// Validate expiration date (MM/YY format)
export const validateExpiration = (expiration: string): boolean => {
    const match = expiration.match(/^(\d{2})\/(\d{2})$/)
    if (!match) return false

    const month = parseInt(match[1], 10)
    const year = parseInt('20' + match[2], 10)

    if (month < 1 || month > 12) return false

    const now = new Date()
    const expDate = new Date(year, month - 1)

    return expDate >= now
}
