# 📱 Building Android APK for Flo Period Tracker

Your Flo Period Tracker mobile app is 100% prepared to be converted into an Android APK whenever you want! Here are the 2 fastest ways:

---

## ⚡ Method 1: Using Capacitor (Standard Native APK)

Capacitor wraps this lightweight web app in a native Android container that compiles directly to an APK file.

### Prerequisites
- Node.js (already installed on your machine)
- Android Studio (free from [developer.android.com/studio](https://developer.android.com/studio))

### Steps:

1. **Install Capacitor Android dependencies**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Build the production web app**:
   ```bash
   npm run build
   ```

3. **Initialize Android project**:
   ```bash
   npx cap add android
   ```

4. **Sync web files to Android**:
   ```bash
   npx cap sync
   ```

5. **Open in Android Studio & Generate APK**:
   ```bash
   npx cap open android
   ```
   - In Android Studio, go to menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Android Studio will generate `app-debug.apk` in `android/app/build/outputs/apk/debug/`!
   - You can copy this APK straight to your phone and install it.

---

## 🚀 Method 2: Instant PWA Install (No Android Studio required!)

Since the app includes a valid `manifest.json` and mobile viewport configuration:

1. Run the app on your computer:
   ```bash
   npm run dev -- --host
   ```
2. Open the URL on your phone's browser (e.g. Chrome on Android or Safari on iOS).
3. Tap **"Add to Home Screen"** or **"Install App"**.
4. The app installs as a standalone fullscreen app on your phone with the dark pink icon, working 100% offline with local storage!
