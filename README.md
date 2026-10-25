# SpikeDrop - Valorant & Spotify Global Audio Switcher

A lightweight, modern Windows desktop utility built with **Electron + React + TypeScript + Tailwind CSS** that runs in the background and system tray.

With a single global hotkey press (default: `F8` or `Alt + \`), switch instantly between two audio profiles mid-game without alt-tabbing:

* **🎯 Gaming Mode (Focus):** Valorant Windows Audio Mixer volume set to **100%**, Spotify playback automatically paused.
* **🎵 Chill Mode (Music):** Valorant Windows Audio Mixer volume lowered to **10%** (or muted), Spotify playback resumed and set to **80%**.

---

## 🛡️ Vanguard Safety Guarantee

SpikeDrop **never** injects DLLs, reads process memory, or hooks into the `VALORANT-Win64-Shipping.exe` game executable.

Instead, it manipulates the Windows OS-level Core Audio Session (`IAudioSessionManager2` / `ISimpleAudioVolume`) via standard WASAPI. To the game and Riot Vanguard, this is indistinguishable from adjusting the slider in the Windows Volume Mixer.

---

## ⚡ Tech Stack & Architecture

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Framework** | Electron + `electron-vite` | Fast desktop environment with Vite bundling |
| **Language** | TypeScript | End-to-end type safety for IPC, Spotify API, and UI state |
| **Frontend UI** | React 19 & Tailwind CSS | Dark Valorant & Spotify themed HUD |
| **OS Audio Hook** | Windows Core Audio (WASAPI) | Controls individual application volume in Windows Volume Mixer |
| **Global Inputs** | Electron `globalShortcut` | Intercepts keyboard hotkeys while gaming in fullscreen |
| **Music Controller** | Spotify Web API (PKCE OAuth) | Controls playback state (`play`, `pause`, `volume`) |
| **Packaging** | `electron-builder` | Builds single `.exe` installer or portable executable |

---

## 📁 Directory Structure

```text
SpikeDrop/
├── electron.vite.config.ts       # Vite bundler configuration
├── package.json
├── tsconfig.json
├── resources/
│   ├── icon.png                  # App icon
│   └── bin/
│       ├── AudioController.cs    # Native C# WASAPI volume controller
│       ├── AudioController.exe   # Compiled ultra-fast native binary (~15ms response)
│       └── AudioController.ps1   # PowerShell fallback
└── src/
    ├── main/
    │   ├── index.ts              # Electron lifecycle, Window creation, System Tray
    │   ├── shortcuts.ts          # Global hotkey registration & state toggle dispatcher
    │   ├── windowsAudio.ts       # WASAPI wrapper to find & adjust Valorant volume
    │   ├── spotifyController.ts  # Spotify PKCE OAuth & Web API (Play, Pause, Volume)
    │   └── store.ts              # Persistent configuration store (JSON in appData)
    ├── preload/
    │   ├── index.ts              # contextBridge exposing safe IPC APIs
    │   └── index.d.ts            # Type definitions for window.api
    └── renderer/
        ├── index.html
        ├── src/
        │   ├── main.tsx          # React application root
        │   ├── App.tsx           # Dashboard layout & live state coordinator
        │   ├── index.css         # Tailwind & custom slider/scroll aesthetics
        │   ├── components/
        │   │   ├── TitleBar.tsx        # Frameless window controls & drag header
        │   │   ├── ModeIndicator.tsx   # Visual mode HUD & live status indicator
        │   │   ├── ProcessStatus.tsx   # Real-time Valorant detection badge
        │   │   ├── VolumeSliders.tsx   # Game min-volume & music target-volume sliders
        │   │   ├── HotkeyConfig.tsx    # Keybind recorder & preset selector
        │   │   └── SpotifyAuth.tsx     # Spotify OAuth Connect/Disconnect button
        │   └── types/
        │       └── index.ts            # TypeScript definitions for the UI
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```

### 3. Build for Windows Production
```bash
npm run build:win
```
The output executable will be created in `dist/`.

---

## 🎵 Setting Up Spotify Integration

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create a free app.
2. In your app settings, add this **Redirect URI**:
   ```text
   http://127.0.0.1:8888/callback
   ```
3. Copy your **Client ID** from the dashboard.
4. In SpikeDrop, paste your Client ID under **Spotify Integration** and click **Connect Spotify**.
5. Your default browser will open asking to authorize SpikeDrop; click **Agree** and return to the app!

---

## ⌨️ Hotkey Customization

* Press **Record Keybind** in the dashboard and press your preferred key combination (e.g., `F8`, `Alt + \`, `Ctrl + Shift + S`, `F9`).
* The key combination is registered globally, allowing you to toggle modes while focused inside Valorant in full screen.

