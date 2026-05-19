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
parcelRegister("4YzMb", function(module, exports) {
console.log("%c SecureLifeHub Extension Loaded.", "background: #222; color: #bada55; font-size: 14px");
let $39f8846d2b20de8e$var$cachedVaultItems = [];
let $39f8846d2b20de8e$var$autoFillPreffered = false;
// Initialize
chrome.storage.local.get([
    'vaultItems',
    'autoFillEnabled'
], (result)=>{
    $39f8846d2b20de8e$var$cachedVaultItems = result.vaultItems || [];
    $39f8846d2b20de8e$var$autoFillPreffered = result.autoFillEnabled || false;
    if ($39f8846d2b20de8e$var$autoFillPreffered) $39f8846d2b20de8e$var$scanPage();
});
// Watch for changes
chrome.storage.onChanged.addListener((changes, namespace)=>{
    if (namespace === 'local') {
        if (changes.vaultItems) $39f8846d2b20de8e$var$cachedVaultItems = changes.vaultItems.newValue || [];
        if (changes.autoFillEnabled) {
            $39f8846d2b20de8e$var$autoFillPreffered = changes.autoFillEnabled.newValue;
            if ($39f8846d2b20de8e$var$autoFillPreffered) $39f8846d2b20de8e$var$scanPage();
            else $39f8846d2b20de8e$var$removeIcons();
        }
    }
});
// Observer for dynamic forms (SPA)
const $39f8846d2b20de8e$var$observer = new MutationObserver((mutations)=>{
    if ($39f8846d2b20de8e$var$autoFillPreffered) $39f8846d2b20de8e$var$scanPage();
});
$39f8846d2b20de8e$var$observer.observe(document.body, {
    childList: true,
    subtree: true
});
function $39f8846d2b20de8e$var$scanPage() {
    if (!$39f8846d2b20de8e$var$cachedVaultItems.length) return;
    // Don't AUTOMATICALLY autofill on our own app
    const currentHost = window.location.hostname;
    if (currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost.includes('securelifehub')) // We still allow MANUAL fill if the user clicks the button in popup,
    // so we don't return early if we want to allow decoration.
    // But the user usually doesn't want icons on their own app.
    return;
    const hostname = window.location.hostname.replace(/^www\./, '').toLowerCase();
    const matches = $39f8846d2b20de8e$var$cachedVaultItems.filter((item)=>{
        if (!item.website) return false;
        // Normalize stored website
        let storedDomain = item.website.toLowerCase().trim();
        storedDomain = storedDomain.replace(/^https?:\/\//, '');
        storedDomain = storedDomain.replace(/^www\./, '');
        storedDomain = storedDomain.split('/')[0].split('?')[0].split(':')[0];
        // Strict match or subdomain match
        return hostname === storedDomain || hostname.endsWith('.' + storedDomain);
    });
    if (matches.length > 0) {
        // Prioritize exact match
        const exactMatch = matches.find((item)=>{
            let storedDomain = item.website.toLowerCase().trim();
            storedDomain = storedDomain.replace(/^https?:\/\//, '');
            storedDomain = storedDomain.replace(/^www\./, '');
            storedDomain = storedDomain.split('/')[0].split('?')[0].split(':')[0];
            return hostname === storedDomain;
        });
        const bestMatch = exactMatch || matches[0];
        console.log("SecureLifeHub: Credentials found for", hostname, bestMatch);
        $39f8846d2b20de8e$var$identifyAndDecorateFields(bestMatch);
    }
}
function $39f8846d2b20de8e$var$identifyAndDecorateFields(match) {
    const inputs = Array.from(document.querySelectorAll('input:not([data-slh-decorated])'));
    // Simple Heuristic for login fields
    const passwordInput = inputs.find((i)=>i.type === 'password');
    let usernameInput = null;
    if (passwordInput) {
        // Look for preceding text input
        let currentIndex = inputs.indexOf(passwordInput);
        // Search backwards in the DOM order (approximate)
        // A better way is looking at the 'inputs' array we just grabbed
        // logic: user input usually comes before password
        for(let i = currentIndex - 1; i >= 0; i--){
            const candidate = inputs[i];
            const type = candidate.type;
            if ((type === 'text' || type === 'email') && candidate.offsetParent !== null) {
                usernameInput = candidate;
                break;
            }
        }
    } else // Maybe just a username field (step 1 of 2)
    usernameInput = inputs.find((i)=>i.type === 'email' || i.name && i.name.toLowerCase().includes('user'));
    if (usernameInput) $39f8846d2b20de8e$var$decorateInput(usernameInput, match, 'username');
    if (passwordInput) $39f8846d2b20de8e$var$decorateInput(passwordInput, match, 'password');
}
function $39f8846d2b20de8e$var$decorateInput(input, match, fieldType) {
    input.setAttribute('data-slh-decorated', 'true'); // Mark as handled
    input.setAttribute('data-slh-field-type', fieldType); // Mark field type
    // Ensure parent is relative so absolute icon works
    const parent = input.parentElement;
    const computedStyle = window.getComputedStyle(parent);
    if (computedStyle.position === 'static') parent.style.position = 'relative';
    // Create Icon
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icons/field-icon.jpg'); // Adjust if copied elsewhere
    icon.className = 'slh-field-icon';
    icon.title = `SecureLifeHub: Fill ${fieldType === 'username' ? match.username : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}`;
    // Inject
    parent.appendChild(icon);
    // Event
    icon.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        // "Ask" logic: The click IS the answer "Yes"
        $39f8846d2b20de8e$var$fillCredentials(match);
    });
}
function $39f8846d2b20de8e$var$removeIcons() {
    document.querySelectorAll('.slh-field-icon').forEach((el)=>el.remove());
    document.querySelectorAll('[data-slh-decorated]').forEach((el)=>{
        el.removeAttribute('data-slh-decorated');
        el.removeAttribute('data-slh-field-type');
    });
}
function $39f8846d2b20de8e$var$fillCredentials(data) {
    console.log("SecureLifeHub: Filling credentials", {
        username: data.username,
        website: data.website
    });
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"])'));
    // 1. Identify Password Field
    let passwordInput = inputs.find((i)=>i.type === 'password' && i.offsetParent !== null);
    // 2. Identify Username Field
    let usernameInput = null;
    // Strategy A: Find by common attributes (broad match)
    const usernamePatterns = [
        'user',
        'email',
        'login',
        'id',
        'account',
        'name',
        'uname',
        'userid',
        'username'
    ];
    usernameInput = inputs.find((i)=>{
        if (i.type === 'password') return false;
        if (i.offsetParent === null) return false;
        const meta = [
            i.name || '',
            i.id || '',
            i.placeholder || '',
            i.getAttribute('aria-label') || '',
            i.getAttribute('autocomplete') || '',
            i.getAttribute('data-testid') || ''
        ].join(' ').toLowerCase();
        return usernamePatterns.some((p)=>meta.includes(p));
    });
    // Strategy B: If password exists, look for ANY visible text/email/tel input preceding it
    if (!usernameInput && passwordInput) {
        let idx = inputs.indexOf(passwordInput);
        for(let i = idx - 1; i >= 0; i--){
            const candidate = inputs[i];
            const t = candidate.type;
            if ((t === 'text' || t === 'email' || t === 'tel' || t === '') && candidate.offsetParent !== null) {
                usernameInput = candidate;
                break;
            }
        }
    }
    // Strategy C: Absolute fallback — first visible non‑password input on the page
    if (!usernameInput && passwordInput) usernameInput = inputs.find((i)=>i.type !== 'password' && i.offsetParent !== null);
    // Fill them
    if (usernameInput && data.username) $39f8846d2b20de8e$var$performFill(usernameInput, data.username);
    if (passwordInput && data.password) $39f8846d2b20de8e$var$performFill(passwordInput, data.password);
    // Feedback for user (visual flash)
    if (usernameInput) {
        const originalBg = usernameInput.style.backgroundColor;
        usernameInput.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        setTimeout(()=>usernameInput.style.backgroundColor = originalBg, 500);
    }
}
function $39f8846d2b20de8e$var$performFill(element, value) {
    // Focus first so the field is "active"
    element.focus();
    // Clear the field using native setter to bypass React/Vue watchers
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(element, '');
    element.dispatchEvent(new Event('input', {
        bubbles: true
    }));
    // Set the new value via native setter
    nativeInputValueSetter.call(element, value);
    // Fire a comprehensive set of events so all JS frameworks detect the change
    [
        'input',
        'change',
        'keydown',
        'keyup',
        'keypress'
    ].forEach((evtName)=>{
        element.dispatchEvent(new Event(evtName, {
            bubbles: true,
            cancelable: true
        }));
    });
    // Some frameworks (Angular, older jQuery) need a blur to commit
    element.dispatchEvent(new Event('blur', {
        bubbles: true
    }));
    // Then re-focus so the user sees it active
    element.focus();
    console.log("SecureLifeHub: Filled field '", element.name || element.id || element.placeholder, "' with", value.length, "chars");
}
// Listen for manual fill requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    if (request.action === 'ping') {
        // Confirm the content script is alive so popup doesn't try to re-inject
        sendResponse({
            status: 'alive'
        });
        return true;
    }
    if (request.action === 'fill' && request.data) {
        console.log("SecureLifeHub: Manual fill requested", request.data);
        $39f8846d2b20de8e$var$fillCredentials(request.data);
        sendResponse({
            status: 'ok'
        });
    }
    return true; // Keep message channel open for async response
});
// --- SESSION SYNC LOGIC ---
/**
 * Detects if we are on a SecureLifeHub domain and syncs the session to the extension.
 * This allows "Login to Web App -> Auto Login Extension" flow.
 */ function $39f8846d2b20de8e$var$syncSessionWithWebApp() {
    const hostname = window.location.hostname;
    const isAppDomain = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('securelifehub.netlify.app');
    if (!isAppDomain) return;
    // Supabase stores the session in localStorage under a key like 'sb-<project-ref>-auth-token'
    // We can iterate to find it or use the known project ref if we have it.
    // Project Ref: uhkfmppomxibrwhtaxsg
    const PROJECT_REF = "uhkfmppomxibrwhtaxsg";
    const AUTH_KEY = `sb-${PROJECT_REF}-auth-token`;
    const rawSession = localStorage.getItem(AUTH_KEY);
    if (rawSession) try {
        const session = JSON.parse(rawSession);
        if (session && session.access_token) {
            console.log("SecureLifeHub: Web App Session detected, syncing to extension...");
            chrome.runtime.sendMessage({
                type: 'SYNC_SESSION',
                session: session
            });
        }
    } catch (e) {
        console.error("SecureLifeHub: Failed to parse web app session", e);
    }
    // Also listen for changes to localStorage (in case user logs in while tab is open)
    window.addEventListener('storage', (e)=>{
        if (e.key === AUTH_KEY && e.newValue) try {
            const session = JSON.parse(e.newValue);
            chrome.runtime.sendMessage({
                type: 'SYNC_SESSION',
                session: session
            });
        } catch (err) {}
        else if (e.key === AUTH_KEY && !e.newValue) // Logout sync
        chrome.runtime.sendMessage({
            type: 'LOGOUT_SESSION'
        });
    });
    // Check periodically for session (in case of SPA navigation or same-tab login)
    let lastKnownSession = localStorage.getItem(AUTH_KEY);
    setInterval(()=>{
        const currentSession = localStorage.getItem(AUTH_KEY);
        if (currentSession !== lastKnownSession) {
            if (currentSession) try {
                const session = JSON.parse(currentSession);
                if (session && session.access_token) {
                    console.log("SecureLifeHub: Web App Session changed/detected, syncing to extension...");
                    chrome.runtime.sendMessage({
                        type: 'SYNC_SESSION',
                        session: session
                    });
                }
            } catch (e) {}
            else {
                console.log("SecureLifeHub: Web App Session removed, notifying extension...");
                chrome.runtime.sendMessage({
                    type: 'LOGOUT_SESSION'
                });
            }
            lastKnownSession = currentSession;
        }
    }, 2000); // Check every 2 seconds
}
// Run sync check
$39f8846d2b20de8e$var$syncSessionWithWebApp();
console.log("SecureLifeHub: Content script ready.");

});


parcelRequire("4YzMb");
})();
