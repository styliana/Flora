# 🌸 Flora - 100% offline & private Period Tracker

A private, minimalist, and clinically rigorous period & fertility tracking app. Built with React 19, Tailwind CSS v4, Lucide icons, and 100% offline local device storage. No tracking, no accounts, and no data leaves your phone.

---

## ✨ Features

- **🌸 Period Tracking**: Tap any day to tick or untick period bleeding days.
- **⚡ 1-Tap Quick Tick Mode**: Easily toggle consecutive period days on the calendar with one touch.
- **📅 Scrollable Calendar**: Smooth month-by-month navigation and continuous multi-month scroll view.
- **🎨 Exact Color Indicators**:
  - **Dark Pink** (`#be185d`): Registered period days.
  - **Dashed Dark Pink**: Forecasted future period days.
  - **Bottle Green** (`#15803d`): Fertile days (higher chance of pregnancy).
  - **Bold Deep Bottle Green** (`#064e3b` with `★`): **Main fertile day (Peak Ovulation)**, visually bolded and highlighted.
  - **Gray** (`#64748b`): Regular days.
- **🔮 Cycle Forecasting**:
  - Calculates average cycle length and bleeding duration automatically from your registered periods.
  - Clinical luteal phase calculation (ovulation occurs ~14 days before the next period).
  - Fertile window projection (5 days leading to ovulation + ovulation day).
  - Projects the next 6+ cycles forward.
- **💾 Local Storage & Privacy**: 100% offline; data never leaves your device.
- **📤 Download Backup Text (.txt)**: Download a plain text file of your registered period days anytime.
- **📥 Restore on New Phone**: Upload the `.txt` backup file or paste your dates into the app to restore all records on a new phone.
- **📱 Mobile App & APK Ready**: Includes PWA manifest and Capacitor configuration for building an Android APK (`README_APK.md`).

---

## 🚀 Running the App

1. **Start the local server**:
   ```bash
   npm run dev
   ```
2. Open the URL shown in your terminal (e.g. `http://localhost:5173/`).
3. To view it on your phone immediately:
   ```bash
   npm run dev -- --host
   ```
   Open the network IP on your phone's browser and tap **"Add to Home Screen"** to install it as a fullscreen app.

---

## 📦 Building Android APK

See [`README_APK.md`](file:///C:/Users/DELL/Documents/flo/README_APK.md) for full instructions on generating a native `.apk` using Capacitor or installing as a standalone PWA.
