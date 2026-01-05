console.log("%c SecureLifeHub Extension Loaded.", "background: #222; color: #bada55; font-size: 14px");

let cachedVaultItems = [];
let autoFillPreffered = false;

// Initialize
chrome.storage.local.get(['vaultItems', 'autoFillEnabled'], (result) => {
    cachedVaultItems = result.vaultItems || [];
    autoFillPreffered = result.autoFillEnabled || false;
    if (autoFillPreffered) scanPage();
});

// Watch for changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.vaultItems) cachedVaultItems = changes.vaultItems.newValue || [];
        if (changes.autoFillEnabled) {
            autoFillPreffered = changes.autoFillEnabled.newValue;
            if (autoFillPreffered) scanPage();
            else removeIcons();
        }
    }
});

// Observer for dynamic forms (SPA)
const observer = new MutationObserver((mutations) => {
    if (autoFillPreffered) scanPage();
});
observer.observe(document.body, { childList: true, subtree: true });

function scanPage() {
    if (!cachedVaultItems.length) return;

    // Don't autofill on our own app (allow strict block on local dev environment)
    const currentHost = window.location.hostname;
    // Block ANY localhost or 127.0.0.1 regardless of port, and production domain
    if (currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost.includes('securelifehub')) {
        console.log("SecureLifeHub: Skipping autofill on own app");
        return;
    }

    const hostname = window.location.hostname.replace(/^www\./, '').toLowerCase();

    const match = cachedVaultItems.find(item => {
        if (!item.website) return false;

        // Normalize stored website
        let storedDomain = item.website.toLowerCase().trim();
        storedDomain = storedDomain.replace(/^https?:\/\//, '');
        storedDomain = storedDomain.replace(/^www\./, '');
        storedDomain = storedDomain.split('/')[0].split('?')[0].split(':')[0];

        // Strict match or subdomain match
        return hostname === storedDomain || hostname.endsWith('.' + storedDomain);
    });

    if (match) {
        console.log("SecureLifeHub: Credentials found for", hostname, match);
        identifyAndDecorateFields(match);
    }
}

function identifyAndDecorateFields(match) {
    const inputs = Array.from(document.querySelectorAll('input:not([data-slh-decorated])'));

    // Simple Heuristic for login fields
    const passwordInput = inputs.find(i => i.type === 'password');
    let usernameInput = null;

    if (passwordInput) {
        // Look for preceding text input
        let currentIndex = inputs.indexOf(passwordInput);
        // Search backwards in the DOM order (approximate)
        // A better way is looking at the 'inputs' array we just grabbed
        // logic: user input usually comes before password
        for (let i = currentIndex - 1; i >= 0; i--) {
            const candidate = inputs[i];
            const type = candidate.type;
            if ((type === 'text' || type === 'email') && candidate.offsetParent !== null) {
                usernameInput = candidate;
                break;
            }
        }
    } else {
        // Maybe just a username field (step 1 of 2)
        usernameInput = inputs.find(i => i.type === 'email' || (i.name && i.name.toLowerCase().includes('user')));
    }

    if (usernameInput) decorateInput(usernameInput, match, 'username');
    if (passwordInput) decorateInput(passwordInput, match, 'password');
}

function decorateInput(input, match, fieldType) {
    input.setAttribute('data-slh-decorated', 'true'); // Mark as handled
    input.setAttribute('data-slh-field-type', fieldType); // Mark field type

    // Ensure parent is relative so absolute icon works
    const parent = input.parentElement;
    const computedStyle = window.getComputedStyle(parent);
    if (computedStyle.position === 'static') {
        parent.style.position = 'relative';
    }

    // Create Icon
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icons/field-icon.jpg'); // Adjust if copied elsewhere
    icon.className = 'slh-field-icon';
    icon.title = `SecureLifeHub: Fill ${fieldType === 'username' ? match.username : '••••••••'}`;

    // Inject
    parent.appendChild(icon);

    // Event
    icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // "Ask" logic: The click IS the answer "Yes"
        fillCredentials(match);
    });
}

function removeIcons() {
    document.querySelectorAll('.slh-field-icon').forEach(el => el.remove());
    document.querySelectorAll('[data-slh-decorated]').forEach(el => {
        el.removeAttribute('data-slh-decorated');
        el.removeAttribute('data-slh-field-type');
    });
}

function fillCredentials(data) {
    console.log("SecureLifeHub: Filling credentials", {
        username: data.username,
        passwordLength: data.password ? data.password.length : 0,
        website: data.website
    });

    // Find all inputs on the page
    const inputs = Array.from(document.querySelectorAll('input'));

    // Find password field
    const passwordInput = inputs.find(i => i.type === 'password' && i.offsetParent !== null);

    // Find username field (email or text before password)
    let usernameInput = null;

    if (passwordInput) {
        let idx = inputs.indexOf(passwordInput);
        // Search backwards for username field
        for (let i = idx - 1; i >= 0; i--) {
            const candidate = inputs[i];
            if ((candidate.type === 'text' || candidate.type === 'email') && candidate.offsetParent !== null) {
                usernameInput = candidate;
                break;
            }
        }
    } else {
        // No password field visible, might be step 1 of multi-step login
        usernameInput = inputs.find(i =>
            (i.type === 'email' || i.type === 'text') &&
            i.offsetParent !== null &&
            (i.name?.toLowerCase().includes('user') ||
                i.name?.toLowerCase().includes('email') ||
                i.id?.toLowerCase().includes('user') ||
                i.id?.toLowerCase().includes('email') ||
                i.autocomplete === 'username' ||
                i.autocomplete === 'email')
        );
    }

    // Fill username field
    if (usernameInput && data.username) {
        console.log("SecureLifeHub: Filling username:", data.username);
        performFill(usernameInput, data.username);
    } else {
        console.log("SecureLifeHub: Username field not found or no username data");
    }

    // Fill password field
    if (passwordInput && data.password) {
        console.log("SecureLifeHub: Filling password (length:", data.password.length, ")");
        performFill(passwordInput, data.password);
    } else {
        console.log("SecureLifeHub: Password field not found or no password data");
    }
}


function performFill(element, value) {
    // Clear the field first
    element.value = '';

    // Use native setter to bypass React/Vue watchers
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(element, value);

    // Trigger all possible events to ensure frameworks detect the change
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('keyup', { bubbles: true }));
    element.dispatchEvent(new Event('keydown', { bubbles: true }));

    // Focus the element to ensure it's recognized
    element.focus();

    console.log("SecureLifeHub: Filled field with value length:", value.length);
}

// Listen for manual fill requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fill' && request.data) {
        console.log("SecureLifeHub: Manual fill requested", request.data);
        fillCredentials(request.data);
    }
});

console.log("SecureLifeHub: Content script ready.");
