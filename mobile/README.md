# SulyapPH — React Native Mobile Application

This directory contains the **React Native** cross-platform mobile application for **SulyapPH (CALABARZON Cultural Heritage Portal & e-Passport)**.

---

## 🚀 Features

- **High-Performance 360° Living Virtual Tour:** Hardware-accelerated WebGL sphere viewer (`Panorama360Viewer.tsx`) supporting interactive touch pan, tilt, pinch-zoom, and orientation gyro.
- **Dynamic In-App Branding Synchronization:** Real-time customization of the app name, subtitle, badge, theme color, and logo/thumbnail icon.
- **19 CALABARZON Heritage Sites:** Rich multimedia profiles across Cavite, Laguna, Batangas, Rizal, and Quezon.
- **Digital Cultural Heritage Passport:** 19 collectible arrival stamps awarded upon completing field quizzes or GPS check-in.

---

## 📱 Quick Start

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Run on Android
Ensure your Android phone (with USB debugging enabled) or emulator is connected:
```bash
npm run android
```

### 3. Build Production Android APK (.apk)
```bash
npm run build:apk
```

The compiled release package will be located at:
`mobile/android/app/build/outputs/apk/release/app-release.apk`
(or download the pre-compiled version from the web portal at `/downloads/sulyap-calabarzon.apk`).

---

## 📂 Architecture

```
mobile/
├── App.tsx                     # Main navigation container & bottom tab bar
├── index.js                    # React Native AppRegistry entry
├── app.json                    # Native package configuration
├── src/
│   ├── components/
│   │   └── Panorama360Viewer.tsx  # WebGL 360° krpano/Three.js panorama viewer
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Province filter, hero banner, places list
│   │   ├── PlaceDetailScreen.tsx  # Heritage narrative, 360 viewer, field quiz
│   │   ├── PassportScreen.tsx     # 19 digital arrival stamps & certificate
│   │   └── SettingsScreen.tsx     # Real-time app name & logo customizer
│   └── lib/
│       ├── branding.ts            # Reactive native branding store & hook
│       └── destinations.ts        # Typed 19 CALABARZON heritage destinations
```
