import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// DOM Elements
const authSection = document.getElementById('auth-section')
const vaultSection = document.getElementById('vault-section')
const loginForm = document.getElementById('login-form')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const errorMsg = document.getElementById('error-msg')
const itemsList = document.getElementById('items-list')
const matchesList = document.getElementById('matches-list')
const currentSiteMatches = document.getElementById('current-site-matches')
const searchInput = document.getElementById('search')

// Menu Elements
const menuBtn = document.getElementById('menu-btn')
const menuOverlay = document.getElementById('menu-overlay')
const closeMenuBtn = document.getElementById('close-menu')
const quickSyncBtn = document.getElementById('quick-sync')
const logoutMenuBtn = document.getElementById('logout-menu-btn')

let user = null
let allItems = []

async function init() {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
        user = session.user
        showVault()
    } else {
        showLogin()
    }
}

function showLogin() {
    authSection.classList.remove('hidden')
    vaultSection.classList.add('hidden')
    if (menuBtn) menuBtn.style.display = 'none';
}

function showVault() {
    authSection.classList.add('hidden')
    vaultSection.classList.remove('hidden')
    if (menuBtn) menuBtn.style.display = 'block';
    fetchItems()
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    errorMsg.classList.add('hidden')

    const email = emailInput.value
    const password = passwordInput.value

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        errorMsg.textContent = error.message
        errorMsg.classList.remove('hidden')
    } else {
        user = data.user
        showVault()
    }
})

// Menu Logic
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        menuOverlay.classList.remove('hidden')
    })
}

if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => {
        menuOverlay.classList.add('hidden')
    })
}

if (quickSyncBtn) {
    quickSyncBtn.addEventListener('click', () => {
        fetchItems()
        menuOverlay.classList.add('hidden')
        // Feedback would be nice but console only for now
        console.log("Synced")
    })
}

if (logoutMenuBtn) {
    logoutMenuBtn.addEventListener('click', async () => {
        await supabase.auth.signOut()
        user = null
        showLogin()
        menuOverlay.classList.add('hidden')
    })
}

async function fetchItems() {
    const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('type', 'password')
        .order('created_at', { ascending: false })

    if (data) {
        allItems = data
        filterItems()

        // Check current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab && tab.url) {
            findMatches(tab.url)
        }
    }
}

function filterItems(query = "") {
    itemsList.innerHTML = ""
    const filtered = allItems.filter(item =>
        (item.title && item.title.toLowerCase().includes(query.toLowerCase())) ||
        (item.username && item.username.toLowerCase().includes(query.toLowerCase()))
    )

    if (filtered.length === 0) {
        itemsList.innerHTML = '<div class="text-center text-gray-500 py-4 text-xs">No items found</div>'
        return
    }

    filtered.forEach(item => {
        const el = createItemElement(item)
        itemsList.appendChild(el)
    })
}

function findMatches(url) {
    try {
        const urlObj = new URL(url)
        const hostname = urlObj.hostname.replace('www.', '')

        // Basic domain matching
        const matches = allItems.filter(item =>
            item.website && item.website.toLowerCase().includes(hostname)
        )

        if (matches.length > 0) {
            currentSiteMatches.classList.remove('hidden')
            matchesList.innerHTML = ""
            matches.forEach(item => {
                const el = createItemElement(item)
                matchesList.appendChild(el)
            })
        } else {
            currentSiteMatches.classList.add('hidden')
        }
    } catch (e) {
        // Invalid URL
    }
}

function createItemElement(item) {
    const div = document.createElement('div')
    div.className = "flex items-center justify-between p-3 bg-[#333] rounded hover:bg-[#444] cursor-pointer transition-colors border border-gray-700"

    const info = document.createElement('div')
    info.className = "flex-1 min-w-0"

    const title = document.createElement('div')
    title.className = "text-sm font-medium truncate text-white"
    title.textContent = item.title || item.website || "Untitled"

    const user = document.createElement('div')
    user.className = "text-xs text-gray-400 truncate"
    user.textContent = item.username || "No username"

    info.appendChild(title)
    info.appendChild(user)

    const kbd = document.createElement('kbd')
    kbd.className = "ml-2 text-[10px] bg-gray-600 px-1.5 py-0.5 rounded text-gray-200"
    kbd.textContent = "Fill"

    div.appendChild(info)
    div.appendChild(kbd)

    div.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'fill',
                data: {
                    username: item.username,
                    password: item.password
                }
            })
            window.close() // Close popup
        }
    })

    return div
}

searchInput.addEventListener('input', (e) => {
    filterItems(e.target.value)
})

init()
