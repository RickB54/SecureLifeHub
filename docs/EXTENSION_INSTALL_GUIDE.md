# SecureLifeHub Extension Installation Guide

This document provides complete, step-by-step instructions on how to install the SecureLifeHub Chrome Extension on any of your devices (other PCs, Android phones, or iPhones). 

Because the extension is an "unpacked" custom extension, it is not installed directly from the Chrome Web Store. Instead, you load it manually from the compiled folder.

---

## 1. Get the Extension File

Yes, putting the file on your **Google Drive** is the absolute best and easiest way to do this!

1. On your main PC (where the project is working), locate the **`SecureLifeHub_Extension.zip`** file we just created. It is located in your main project folder (`c:\VIBE IDE Projects\secure-life-hub\SecureLifeHub_Extension.zip`).
2. Upload this `SecureLifeHub_Extension.zip` file to your **Google Drive**.
3. Now, whenever you are on another device, simply open Google Drive and download this ZIP file.

---

## 2. How to Install on Another PC / Laptop

1. Download the `SecureLifeHub_Extension.zip` from your Google Drive to the new PC.
2. **Extract/Unzip** the file into a folder (for example, to your Desktop or Documents folder).
3. Open **Google Chrome** on the new PC.
4. Type `chrome://extensions/` into the URL address bar and hit Enter.
5. Look in the top-right corner of the page and turn **ON** the switch for **Developer mode**.
6. Look in the top-left corner and click the button that says **Load unpacked**.
7. A file picker will open. Navigate to where you extracted the ZIP file and select the extracted folder (it contains files like `manifest.json`, `popup.html`, etc.).
8. Click **Select Folder**.

*The extension is now installed and will point directly to your live production Netlify app!*

---

## 3. How to Install on a Mobile Phone (Android or iOS)

**IMPORTANT:** The standard "Google Chrome" app that comes installed on phones **does not support extensions** of any kind. 

To use Chrome extensions on your phone, you must use a mobile browser built on Chromium that specifically allows extensions. 

### For Android Users: Use Kiwi Browser or Yandex Browser
1. Open the Google Play Store and install **Kiwi Browser** (highly recommended for Chrome extensions).
2. Open the Google Drive app on your phone and download the `SecureLifeHub_Extension.zip` file.
3. Open your phone's File Manager / "My Files" app, find the ZIP file, and **Extract/Unzip** it.
4. Open the **Kiwi Browser**.
5. Tap the three dots (menu) in the top right corner and select **Extensions**.
6. Turn on **Developer mode** (a toggle switch).
7. Tap the **+(from .zip/.crx/.user.js)** button or **Load unpacked**.
8. Select the extracted folder (or the ZIP file directly, as Kiwi Browser often supports loading directly from the ZIP).

### For iPhone / iOS Users: Use Orion Browser
*Apple restricts browser engines heavily, so Kiwi is not on iOS. However, Orion Browser supports Chrome extensions.*
1. Open the App Store and install **Orion Browser by Kagi**.
2. Open the Google Drive app and download the `SecureLifeHub_Extension.zip` file. Save it to your "Files" app.
3. Open the "Files" app, find the ZIP file, and tap it to extract it into a folder.
4. Open **Orion Browser**.
5. Tap the three dots (menu) and go to **Extensions**.
6. Look for the option to install an extension from a file (Load Unpacked / Install from File) and select the extracted folder.

---

## Troubleshooting

- **"It keeps looking for localhost:3005"**: This means you are loading an old version of the folder. Make sure you delete the old extension from Chrome, redownload the latest ZIP from Google Drive, and load it fresh.
- **"Manifest file is missing"**: When clicking "Load unpacked", make sure you are selecting the exact folder that contains the file named `manifest.json`. If you select the folder above it, Chrome won't find the extension.
