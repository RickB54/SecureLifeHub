console.log("SecureLifeHub content script loaded.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fill') {
        fillCredentials(request.data);
        sendResponse({ status: 'filled' });
    }
});

function fillCredentials(data) {
    console.log("Attempting to fill credentials...", data);
    const inputs = Array.from(document.querySelectorAll('input'));

    let passwordInput = null;
    let usernameInput = null;

    // 1. Find Password Field
    // Priority: explicit type="password"
    passwordInput = inputs.find(i => i.type === 'password');

    // 2. Find Username/Email Field
    // Priority: 
    // a. autocomplete="username" or "email"
    // b. type="email"
    // c. name/id contains "user", "login", "email" (regex)
    // d. visible text input preceding the password input (if password exists)

    const userRegex = /(user|login|email|id)/i;

    // Logic if we have specific attributes
    usernameInput = inputs.find(i =>
        (i.autocomplete && (i.autocomplete === 'username' || i.autocomplete === 'email')) ||
        (i.type === 'email')
    );

    // Logic by name/id if no specific type/autocomplete found
    if (!usernameInput) {
        usernameInput = inputs.find(i =>
            i.type === 'text' && (userRegex.test(i.name) || userRegex.test(i.id))
        );
    }

    // Fallback: If password exists, look for the nearest preceding text input
    if (!usernameInput && passwordInput) {
        let currentIndex = inputs.indexOf(passwordInput);
        for (let i = currentIndex - 1; i >= 0; i--) {
            const candidate = inputs[i];
            if (candidate.type === 'text' && candidate.offsetParent !== null) { // check visibility
                usernameInput = candidate;
                break;
            }
        }
    }

    // 3. Fill Fields
    if (usernameInput && data.username) {
        console.log("Filling username:", usernameInput);
        fillField(usernameInput, data.username);
    } else {
        console.log("No username field found.");
    }

    if (passwordInput && data.password) {
        console.log("Filling password:", passwordInput);
        fillField(passwordInput, data.password);
    } else {
        console.log("No password field found (might be a 2-step login).");
    }
}

function fillField(element, value) {
    element.focus();
    element.value = value;
    element.setAttribute('value', value); // React workaround sometimes
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
}
