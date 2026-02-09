# 🔐 Biometric Login Guide (Fingerprint & FaceID)

Secure Life Hub uses **Passkey technology** to allow you to unlock your vault instantly using your device's built-in security (Fingerprint sensor, FaceID, or Mac TouchID).

## 🧐 What is a "Passkey"?
A **Passkey** is the technical name for the "Master Key" created when you enable biometrics. 
- **It is NOT your actual fingerprint data.** Your fingerprint never leaves your phone.
- Instead, your phone creates a unique digital "handshake" specifically for `securelifehub.netlify.app`.
- Every time you scan your finger, your phone confirms it's you and performs this handshake to unlock the app instantly.

---

## 🛠️ How to Enable Biometric Login

If you don't see the "Fast Login" option on your login screen, follow these steps:

### Step 1: Log in with your Master Password
You must be logged into your vault to link your device.

### Step 2: Go to Settings
- On Desktop: Click **Settings** in the sidebar or the top header.
- On Mobile: Open the menu and tap **Settings**.

### Step 3: Find "Biometric Login"
Scroll down to the **Security** section. You will see a toggle for **Biometric Login (Fingerprint/FaceID)**.

### Step 4: Click "Enable"
1. Tap the toggle or the **Enable** button.
2. A system window will pop up from your phone (Android/iOS) or computer (Windows/Mac).
3. **CRITICAL:** When asked where to save the passkey, choose **"This Device"** (or "Phone, tablet, or security key").
4. Scan your fingerprint or face when prompted.

### Step 5: Verify
You should see a notification saying *"Biometric login enabled for this device"*.

---

## 🔓 How to Use It (The Login Screen)

Once enabled, your Login screen will change:
1. You will now see a large **"Sign in with Biometrics"** button (with a Fingerprint icon) below the Master Password box.
2. Tap that button.
3. Your phone will ask for your fingerprint/face.
4. **Instantly unlocked!** No more typing long master passwords.

---

## ⚠️ Troubleshooting

### "There aren't any passkeys for this device"
This usually happens if:
- You are accessing the app from a **new website address** (e.g., we moved from `localhost` to `netlify.app`). Passkeys are tied to the specific website address for your safety.
- **Solution**: Go to **Settings**, turn the toggle **OFF**, and then turn it back **ON**. This creates a fresh passkey for the new address.

### "Low Memory" or "Resource Busy" on Mobile
Mobile browsers sometimes struggle if you try to enable biometrics while other apps are running.
- **Solution**: Close other browser tabs, wait 2 seconds after the page loads, and then try enabling it again in Settings.

### Biometrics not showing on Login Screen
If you don't see the fingerprint button:
- Ensure you have **enabled it first** in the Settings menu while logged in.
- The app remembers your device using "Cookies". If you clear your browser history or use "Incognito/Private" mode, you may need to re-enable it.
