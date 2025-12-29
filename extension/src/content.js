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

    const hostname = window.location.hostname.replace(/^www\./, '').toLowerCase();

    const match = cachedVaultItems.find(item => {
        if (!item.website) return false;

        // Normalize stored website
        let storedDomain = item.website.toLowerCase().trim();
        storedDomain = storedDomain.replace(/^https?:\/\//, '');
        storedDomain = storedDomain.replace(/^www\./, '');
        storedDomain = storedDomain.split('/')[0].split('?')[0];

        // Strict match or subdomain match
        return hostname === storedDomain || hostname.endsWith('.' + storedDomain);
    });

    if (match) {
        // console.log("SecureLifeHub: Credentials identified for this domain.");
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

    if (usernameInput) decorateInput(usernameInput, match);
    if (passwordInput) decorateInput(passwordInput, match);
}

function decorateInput(input, match) {
    input.setAttribute('data-slh-decorated', 'true'); // Mark as handled

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
    icon.title = `SecureLifeHub: Fill ${match.username}`;

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
    document.querySelectorAll('[data-slh-decorated]').forEach(el => el.removeAttribute('data-slh-decorated'));
}

function fillCredentials(data) {
    // Re-find inputs (they might have changed or we just want to be sure)
    // We can recycle the logic or just target the ones we decorated if we stored references.
    // But generic fill is safer.

    const inputs = Array.from(document.querySelectorAll('input'));
    const passwordInput = inputs.find(i => i.type === 'password');
    let usernameInput = null;

    // Reuse heuristic
    if (passwordInput) {
        let idx = inputs.indexOf(passwordInput);
        for (let i = idx - 1; i >= 0; i--) {
            if ((inputs[i].type === 'text' || inputs[i].type === 'email') && inputs[i].offsetParent) {
                usernameInput = inputs[i];
                break;
            }
        }
    } else {
        usernameInput = inputs.find(i => i.type === 'email');
    }

    if (usernameInput && data.username) performFill(usernameInput, data.username);
    if (passwordInput && data.password) performFill(passwordInput, data.password);
}


function performFill(element, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

// Listen for manual fill requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fill' && request.data) {
        console.log("SecureLifeHub: Manual fill requested", request.data);
        fillCredentials(request.data);
    }
});

console.log("SecureLifeHub: Content script ready.");
