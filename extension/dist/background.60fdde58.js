(() => {

      var $parcel$global = globalThis;
    
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequirecf85"];

if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequirecf85"] = parcelRequire;
}

var parcelRegister = parcelRequire.register;
parcelRegister("eQGot", function(module, exports) {
// SecureLifeHub Background Service Worker
console.log("SecureLifeHub background service worker loaded.");
const $acf6ce898a345e0f$var$PROJECT_REF = "uhkfmppomxibrwhtaxsg";
const $acf6ce898a345e0f$var$AUTH_KEY = `sb-${$acf6ce898a345e0f$var$PROJECT_REF}-auth-token`;
// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    if (message.type === 'LOGOUT_SESSIONS') $acf6ce898a345e0f$var$logoutAllSessions();
    else if (message.type === 'SYNC_SESSION') $acf6ce898a345e0f$var$syncSession(message.session);
    else if (message.type === 'LOGOUT_SESSION') $acf6ce898a345e0f$var$clearExtensionSession();
    else if (message.type === 'SYNC_TO_WEB_APP') $acf6ce898a345e0f$var$syncToWebApp(message.session);
});
/**
 * Update any open web app tabs with session from extension
 */ async function $acf6ce898a345e0f$var$syncToWebApp(session) {
    console.log("SecureLifeHub: Syncing session TO web app tabs.");
    const tabs = await chrome.tabs.query({});
    const appTabs = tabs.filter((t)=>t.url && (t.url.includes('localhost') || t.url.includes('securelifehub.netlify.app')));
    for (const tab of appTabs)try {
        chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            func: (key, sessionData)=>{
                // Only sync if not already logged in or if the session is different
                const current = localStorage.getItem(key);
                if (!current || JSON.stringify(JSON.parse(current)) !== JSON.stringify(sessionData)) {
                    localStorage.setItem(key, JSON.stringify(sessionData));
                    window.location.reload();
                }
            },
            args: [
                $acf6ce898a345e0f$var$AUTH_KEY,
                session
            ]
        });
    } catch (e) {
        console.error("Failed to sync session to tab", e);
    }
}
/**
 * Update extension's auth storage with session from web app
 */ function $acf6ce898a345e0f$var$syncSession(session) {
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
function $acf6ce898a345e0f$var$clearExtensionSession() {
    console.log("SecureLifeHub: External logout sync triggered.");
    chrome.storage.local.remove([
        'sync_session',
        'user',
        'vaultItems'
    ]);
}
// Function to logout from both extension and web app
async function $acf6ce898a345e0f$var$logoutAllSessions() {
    console.log("Logging out of all sessions...");
    // 1. Clear extension local storage
    await chrome.storage.local.clear();
    // 2. Find and notify web app tabs (both localhost and production)
    const tabs = await chrome.tabs.query({});
    const appTabs = tabs.filter((t)=>t.url && (t.url.includes('localhost') || t.url.includes('securelifehub.netlify.app')));
    for (const tab of appTabs)try {
        chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            func: (key)=>{
                localStorage.removeItem(key);
                sessionStorage.clear();
                window.location.reload();
            },
            args: [
                $acf6ce898a345e0f$var$AUTH_KEY
            ]
        });
    } catch (e) {
        console.error("Failed to clear tab storage", e);
    }
}

});


parcelRequire("eQGot");
})();
