// SecureLifeHub Background Service Worker
console.log("SecureLifeHub background service worker loaded.");

const PROJECT_REF = "uhkfmppomxibrwhtaxsg";
const AUTH_KEY = `sb-${PROJECT_REF}-auth-token`;

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'LOGOUT_SESSIONS') {
        logoutAllSessions();
    } else if (message.type === 'SYNC_SESSION') {
        syncSession(message.session);
    } else if (message.type === 'LOGOUT_SESSION') {
        clearExtensionSession();
    } else if (message.type === 'SYNC_TO_WEB_APP') {
        syncToWebApp(message.session);
    }
});

/**
 * Update any open web app tabs with session from extension
 */
async function syncToWebApp(session) {
    console.log("SecureLifeHub: Syncing session TO web app tabs.");
    const tabs = await chrome.tabs.query({});
    const appTabs = tabs.filter(t => t.url && (t.url.includes('localhost') || t.url.includes('securelifehub.netlify.app')));

    for (const tab of appTabs) {
        try {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (key, sessionData) => {
                    // Only sync if not already logged in or if the session is different
                    const current = localStorage.getItem(key);
                    if (!current || JSON.stringify(JSON.parse(current)) !== JSON.stringify(sessionData)) {
                        localStorage.setItem(key, JSON.stringify(sessionData));
                        window.location.reload();
                    }
                },
                args: [AUTH_KEY, session]
            });
        } catch (e) {
            console.error("Failed to sync session to tab", e);
        }
    }
}

/**
 * Update extension's auth storage with session from web app
 */
function syncSession(session) {
    console.log("SecureLifeHub: External session sync triggered.");
    // We store it in chrome storage so the popup can find it, 
    // AND we can try to inject it into the internal storage used by supabase-js if needed.
    // However, supabase-js in the extension popup uses its own localStorage.
    // To truely sync, we might need the popup to check chrome.storage on load.

    chrome.storage.local.set({
        'sync_session': session,
        'user': session.user
    });
}

function clearExtensionSession() {
    console.log("SecureLifeHub: External logout sync triggered.");
    chrome.storage.local.remove(['sync_session', 'user', 'vaultItems']);
}

// Function to logout from both extension and web app
async function logoutAllSessions() {
    console.log("Logging out of all sessions...");

    // 1. Clear extension local storage
    await chrome.storage.local.clear();

    // 2. Find and notify web app tabs (both localhost and production)
    const tabs = await chrome.tabs.query({});
    const appTabs = tabs.filter(t => t.url && (t.url.includes('localhost') || t.url.includes('securelifehub.netlify.app')));

    for (const tab of appTabs) {
        try {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (key) => {
                    localStorage.removeItem(key);
                    sessionStorage.clear();
                    window.location.reload();
                },
                args: [AUTH_KEY]
            });
        } catch (e) {
            console.error("Failed to clear tab storage", e);
        }
    }
}
