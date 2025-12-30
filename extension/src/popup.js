import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, WEB_VAULT_URL } from './config.js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// -- State --
let user = null
let allItems = [] // The full vault
let filteredItems = [] // Currently shown in list
let preferenceItem = null // System pref item
let selectedItem = null // Currently viewed item

// -- Elements --
const authSection = document.getElementById('auth-section')
const vaultSection = document.getElementById('vault-section')

// List & Sidebar
const itemsList = document.getElementById('items-list')
const searchInput = document.getElementById('search')
const addBtn = document.getElementById('add-btn')
const menuBtn = document.getElementById('menu-btn')

// Main Panel (Views)
const emptyState = document.getElementById('empty-state')
const detailView = document.getElementById('detail-view')
const editForm = document.getElementById('edit-form')

// Details View Elements
const viewIcon = document.getElementById('view-icon')
const viewTitle = document.getElementById('view-title')
const viewFavBtn = document.getElementById('view-fav-btn')
const viewUsername = document.getElementById('view-username')
const viewPassword = document.getElementById('view-password')
const viewWebsite = document.getElementById('view-website')
const viewNotes = document.getElementById('view-notes')
const togglePassBtn = document.getElementById('toggle-pass-btn')
const launchBtn = document.getElementById('launch-btn')
const editBtn = document.getElementById('edit-btn')

// Edit Form Elements
const editId = document.getElementById('edit-id')
const editTitle = document.getElementById('edit-title')
const editUsername = document.getElementById('edit-username')
const editPassword = document.getElementById('edit-password')
const editWebsite = document.getElementById('edit-website')
const editNotes = document.getElementById('edit-notes')
const genPassBtn = document.getElementById('gen-pass-btn')
const cancelEditBtn = document.getElementById('cancel-edit-btn')
const saveBtn = document.getElementById('save-btn')
const deleteBtn = document.getElementById('delete-btn')

// Menus
const menuDropdown = document.getElementById('menu-dropdown')
const menuOverlay = document.getElementById('menu-overlay')
const menuUserEmail = document.getElementById('menu-user-email')

// -- Initialization --
console.log("SecureLifeHub Popup v2 Loaded")

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
}

function showVault() {
    authSection.classList.add('hidden')
    vaultSection.classList.remove('hidden')
    if (menuUserEmail) menuUserEmail.textContent = user.email
    fetchItems()
}

// -- Data Access --
async function fetchItems() {
    const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .order('created_at', { ascending: false })

    if (data) {
        allItems = data
        preferenceItem = allItems.find(i => i.title === "[SYSTEM] User Preferences")
        cacheData(allItems)

        // Initial Filter
        filterItems(searchInput.value)

        // Check for current tab match to auto-select or highlight
        checkForMatches()
    }
}

function cacheData(items) {
    const isAutoFillEnabled = preferenceItem?.item_metadata?.auto_fill_enabled === true
    chrome.storage.local.set({
        vaultItems: items,
        autoFillEnabled: isAutoFillEnabled
    })
    updateAutoFillBadge(isAutoFillEnabled)
}

function updateAutoFillBadge(enabled) {
    const badge = document.getElementById('autofill-status')
    if (badge) {
        if (enabled) {
            badge.textContent = "ON"
            badge.className = "text-xs font-bold px-2 py-0.5 rounded bg-green-500 text-white"
        } else {
            badge.textContent = "OFF"
            badge.className = "text-xs font-bold px-2 py-0.5 rounded bg-gray-600 text-gray-300"
        }
    }
}

// -- Sidebar Rendering --
function filterItems(query = "") {
    itemsList.innerHTML = ""
    query = query.toLowerCase()

    filteredItems = allItems.filter(item =>
        !item.title.startsWith("[SYSTEM]") &&
        (
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.username && item.username.toLowerCase().includes(query)) ||
            (item.website && item.website.toLowerCase().includes(query))
        )
    )

    if (filteredItems.length === 0) {
        itemsList.innerHTML = `<div class="text-center text-gray-500 py-4 text-xs">No items found</div>`
        return
    }

    filteredItems.forEach(item => {
        const el = createListItem(item)
        itemsList.appendChild(el)
    })
}

function createListItem(item) {
    const div = document.createElement('div')
    // Highlight if selected
    const isSelected = selectedItem && selectedItem.id === item.id
    const bgClass = isSelected ? "bg-blue-900/40 border-l-2 border-blue-500" : "hover:bg-[#333] border-l-2 border-transparent"

    div.className = `flex items-center gap-3 p-3 rounded-r cursor-pointer transition-colors ${bgClass}`

    // Icon
    const letter = (item.title || "?")[0].toUpperCase()
    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
            ${letter}
        </div>
        <div class="overflow-hidden">
            <div class="text-sm font-medium text-gray-200 truncate">${item.title || "Untitled"}</div>
            <div class="text-xs text-gray-500 truncate">${item.username || ""}</div>
        </div>
    `
    div.addEventListener('click', () => selectItem(item))
    return div
}

// -- Selection & Views --
function selectItem(item) {
    selectedItem = item

    // Re-render list to update selection highlight
    filterItems(searchInput.value)

    // Show Details
    renderDetailView(item)
}

function renderDetailView(item) {
    emptyState.classList.add('hidden')
    editForm.classList.add('hidden')
    detailView.classList.remove('hidden')

    // Populate Fields
    viewTitle.textContent = item.title || "Untitled"
    viewIcon.textContent = (item.title || "?")[0].toUpperCase()

    viewUsername.textContent = item.username || "---"
    viewPassword.textContent = item.password // Will be blurred via CSS
    viewWebsite.textContent = item.website || "---"
    viewNotes.textContent = item.notes || "No notes."

    // Reset password blur
    viewPassword.classList.add('blur-[4px]')

    // Update Favorite Icon (basic visual toggle for now)
    if (item.is_favorite) {
        viewFavBtn.classList.add('text-yellow-500')
    } else {
        viewFavBtn.classList.remove('text-yellow-500')
    }
}

function renderEditForm(item = null) {
    emptyState.classList.add('hidden')
    detailView.classList.add('hidden')
    editForm.classList.remove('hidden')

    if (item) {
        document.getElementById('form-title').textContent = "Edit Item"
        editId.value = item.id
        editTitle.value = item.title || ""
        editUsername.value = item.username || ""
        editPassword.value = item.password || ""
        editWebsite.value = item.website || ""
        editNotes.value = item.notes || ""
        deleteBtn.classList.remove('hidden')
    } else {
        document.getElementById('form-title').textContent = "New Item"
        editId.value = ""
        editTitle.value = ""
        editUsername.value = ""
        editPassword.value = ""
        editWebsite.value = ""
        editNotes.value = ""
        deleteBtn.classList.add('hidden') // Can't delete what doesn't exist yet
    }
}

// -- Actions --

// Save
saveBtn.addEventListener('click', async () => {
    const isNew = !editId.value
    const payload = {
        user_id: user.id,
        title: editTitle.value,
        username: editUsername.value,
        password: editPassword.value,
        website: editWebsite.value,
        notes: editNotes.value,
        type: 'password' // Default type
    }

    // Optimistic Update
    saveBtn.textContent = "Saving..."
    saveBtn.disabled = true

    let error = null
    let resultItem = null

    if (isNew) {
        const { data, error: err } = await supabase.from('vault_items').insert(payload).select().single()
        error = err
        resultItem = data
    } else {
        const { data, error: err } = await supabase.from('vault_items').update(payload).eq('id', editId.value).select().single()
        error = err
        resultItem = data
    }

    saveBtn.textContent = "Save"
    saveBtn.disabled = false

    if (!error && resultItem) {
        if (isNew) allItems.unshift(resultItem) // Add to top
        else {
            const idx = allItems.findIndex(i => i.id === resultItem.id)
            if (idx !== -1) allItems[idx] = resultItem
        }

        cacheData(allItems) // Sync to local storage
        selectItem(resultItem) // Go back to view
    } else {
        console.error("Save failed", error)
        alert("Failed to save item.")
    }
})

// Delete
deleteBtn.addEventListener('click', async () => {
    if (!confirm("Are you sure you want to delete this item?")) return

    const id = editId.value
    const { error } = await supabase.from('vault_items').delete().eq('id', id)

    if (!error) {
        allItems = allItems.filter(i => i.id !== id)
        cacheData(allItems)

        selectedItem = null
        filterItems(searchInput.value)
        emptyState.classList.remove('hidden')
        editForm.classList.add('hidden')
    }
})

// Copy Utils
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target')
        const el = document.getElementById(targetId)
        if (el) {
            navigator.clipboard.writeText(el.textContent)

            // Visual feedback
            const originalHTML = btn.innerHTML
            btn.innerHTML = `<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
            setTimeout(() => btn.innerHTML = originalHTML, 1500)
        }
    })
})

// Launch
launchBtn.addEventListener('click', async () => {
    if (selectedItem && selectedItem.website) {
        let url = selectedItem.website
        if (!url.startsWith('http')) url = 'https://' + url

        // Open tab
        chrome.tabs.create({ url }, (tab) => {
            // We can try to proactively fill, but content script usually handles onLoad check.
            // But we can also send an explicit message to be safe.
        })
    }
})

// Toggle Password Visibility
togglePassBtn.addEventListener('click', () => {
    if (viewPassword.classList.contains('blur-[4px]')) {
        viewPassword.classList.remove('blur-[4px]')
    } else {
        viewPassword.classList.add('blur-[4px]')
    }
})

// Navigation & Toolbar
addBtn.addEventListener('click', () => renderEditForm(null))
editBtn.addEventListener('click', () => renderEditForm(selectedItem))
cancelEditBtn.addEventListener('click', () => {
    if (selectedItem) renderDetailView(selectedItem)
    else {
        editForm.classList.add('hidden')
        emptyState.classList.remove('hidden')
    }
})

// Search
searchInput.addEventListener('input', (e) => filterItems(e.target.value))

// Matches
async function checkForMatches() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab && tab.url) {
        let currentDomain = ""
        try {
            currentDomain = new URL(tab.url).hostname.toLowerCase().replace(/^www\./, '')
        } catch (e) {
            console.log("Invalid tab URL", tab.url)
            return
        }

        console.log("Checking matches for domain:", currentDomain)

        // Find ALL matches
        const matches = allItems.filter(item => {
            if (!item.website) return false

            // Normalize stored website
            let storedDomain = item.website.toLowerCase().trim()

            // Remove protocol
            storedDomain = storedDomain.replace(/^https?:\/\//, '')
            // Remove www.
            storedDomain = storedDomain.replace(/^www\./, '')
            // Remove path/query
            storedDomain = storedDomain.split('/')[0].split('?')[0].split(':')[0]

            // Check if domains match (or are subdomains)
            const isMatch = currentDomain === storedDomain || currentDomain.endsWith('.' + storedDomain)
            return isMatch
        })

        if (matches.length > 0) {
            console.log("Found matches:", matches)
            // 1. Filter the list to show only matches
            filteredItems = matches
            itemsList.innerHTML = ""
            filteredItems.forEach(item => {
                const el = createListItem(item)
                itemsList.appendChild(el)
            })

            // 2. Auto-select the first one
            selectItem(matches[0])
        }
    }
}

// Manual Auto-Fill Button
const manualFillBtn = document.getElementById('manual-fill-btn')
if (manualFillBtn) {
    manualFillBtn.addEventListener('click', async () => {
        if (!selectedItem) return
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab) {
            chrome.tabs.sendMessage(tab.id, { action: 'fill', data: selectedItem })
        }
    })
}


// -- Menu & Auth --

// Menu Toggle
menuBtn.addEventListener('click', () => {
    const isHidden = menuDropdown.classList.contains('hidden')
    if (isHidden) {
        menuDropdown.classList.remove('hidden')
        menuOverlay.classList.remove('hidden')
    } else {
        closeMenu()
    }
})
menuOverlay.addEventListener('click', closeMenu)

function closeMenu() {
    menuDropdown.classList.add('hidden')
    menuOverlay.classList.add('hidden')
}

// Login
const loginForm = document.getElementById('login-form')
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
        document.getElementById('error-msg').textContent = error.message
        document.getElementById('error-msg').classList.remove('hidden')
    } else {
        user = data.user
        showVault()
    }
})

// Logout
document.getElementById('logout-menu-btn').addEventListener('click', async () => {
    await supabase.auth.signOut()

    // Clear Local Cache
    chrome.storage.local.clear()

    // Attempt global logout?
    // We can't easily access the main app's LocalStorage from here due to domain isolation.
    // But we can open a logout URL in the background.

    user = null
    showLogin()
    closeMenu()
})

// Auto-Fill Toggle (Menu Item)
document.getElementById('autofill-toggle-btn').addEventListener('click', async () => {
    await toggleAutoFill()
})

async function toggleAutoFill(forceState = null) {
    if (!preferenceItem) {
        // Create defaults if missing
        const { data } = await supabase.from('vault_items').insert({
            user_id: user.id,
            title: "[SYSTEM] User Preferences",
            type: "note",
            item_metadata: { auto_fill_enabled: true }
        }).select().single()
        preferenceItem = data
    } else {
        const newState = forceState !== null ? forceState : !(preferenceItem.item_metadata?.auto_fill_enabled === true)
        preferenceItem.item_metadata = { ...preferenceItem.item_metadata, auto_fill_enabled: newState }

        // UI Update
        updateAutoFillBadge(newState)

        // Cache Update
        chrome.storage.local.set({ autoFillEnabled: newState })

        // DB Update
        await supabase.from('vault_items').update({
            item_metadata: preferenceItem.item_metadata
        }).eq('id', preferenceItem.id)
    }
}

// Open Web Vault
document.getElementById('open-vault-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: WEB_VAULT_URL })
    closeMenu()
})

// Generate Password (Simple)
genPassBtn.addEventListener('click', () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 16; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    editPassword.value = pass
})


// Toggle Favorite
viewFavBtn.addEventListener('click', async () => {
    if (!selectedItem) return

    const newFavStatus = !selectedItem.is_favorite
    selectedItem.is_favorite = newFavStatus

    // Optimistic UI update
    if (newFavStatus) {
        viewFavBtn.classList.add('text-yellow-500')
    } else {
        viewFavBtn.classList.remove('text-yellow-500')
    }

    // Database Update
    const { error } = await supabase
        .from('vault_items')
        .update({ is_favorite: newFavStatus })
        .eq('id', selectedItem.id)

    if (error) {
        console.error("Failed to update favorite", error)
        // Revert UI
        selectedItem.is_favorite = !newFavStatus
        renderDetailView(selectedItem)
        alert("Failed to update favorite status")
    } else {
        // Update local cache
        const idx = allItems.findIndex(i => i.id === selectedItem.id)
        if (idx !== -1) allItems[idx] = selectedItem
        cacheData(allItems)
    }
})

init()
