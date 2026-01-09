// SecureLifeHub Background Service Worker
console.log("SecureLifeHub background service worker loaded.");

const WEB_VAULT_URL = "http://localhost:3005";

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'LOGOUT_SESSIONS') {
        logoutAllSessions();
    }
});

// Function to logout from both extension and web app
async function logoutAllSessions() {
    console.log("Logging out of all sessions...");

    // 1. Clear extension local storage
    await chrome.storage.local.clear();

    // 2. Find and notify web app tabs
    const tabs = await chrome.tabs.query({ url: `${WEB_VAULT_URL}/*` });
    for (const tab of tabs) {
        try {
            // We can either redirect to logout page or clear storage via execution
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/?logout=true';
                }
            });
        } catch (e) {
            console.error("Failed to clear tab storage", e);
        }
    }
}

// Optional: Monitor cookies to detect web-app logout
chrome.cookies.onChanged.addListener((changeInfo) => {
    // If the supabase auth cookie for our domain is removed, logout the extension
    if (changeInfo.cookie.domain.includes("localhost") &&
        changeInfo.cookie.name.includes("auth-token") &&
        changeInfo.removed) {
        console.log("Auth cookie removed, syncing logout...");
        chrome.storage.local.remove(['supabase.auth.token', 'user']);
    }
});
