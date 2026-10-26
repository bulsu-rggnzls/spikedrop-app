import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Provide a mock API if running in a standalone browser tab instead of Electron
if (typeof window !== 'undefined' && !window.api) {
  let mockMode: 'GAMING' | 'CHILL' = 'GAMING'
  let mockSettings = {
    hotkey: 'F8',
    valorantProcessName: 'VALORANT-Win64-Shipping',
    valorantGamingVolume: 1.0,
    valorantChillVolume: 0.1,
    spotifyGamingVolume: 0,
    spotifyChillVolume: 80,
    pauseSpotifyInGaming: true,
    resumeSpotifyInChill: true,
    minimizeToTray: true,
    spotifyClientId: '',
    spotifyClientSecret: '',
    spotifyAccessToken: null,
    spotifyRefreshToken: null,
    spotifyTokenExpiresAt: null
  }
  const modeListeners: Array<(m: 'GAMING' | 'CHILL') => void> = []

  ;(window as any).api = {
    isElectron: false,
    getSettings: async () => ({ ...mockSettings }),
    updateSettings: async (updates: any) => {
      mockSettings = { ...mockSettings, ...updates }
      return { ...mockSettings }
    },
    getMode: async () => mockMode,
    toggleMode: async () => {
      mockMode = mockMode === 'GAMING' ? 'CHILL' : 'GAMING'
      modeListeners.forEach((l) => l(mockMode))
      return mockMode
    },
    onModeChanged: (cb: any) => {
      modeListeners.push(cb)
      return () => {
        const idx = modeListeners.indexOf(cb)
        if (idx !== -1) modeListeners.splice(idx, 1)
      }
    },
    getValorantStatus: async () => ({
      isRunning: false,
      hasAudioSession: false,
      currentVolume: null
    }),
    getAudioSessions: async () => [],
    getSpotifyStatus: async () => ({
      isConnected: false,
      displayName: null,
      product: null,
      hasActiveDevice: false
    }),
    startSpotifyAuth: async () => ({
      success: false,
      error: 'Spotify OAuth requires running in the Electron app (`npm run dev`).'
    }),
    disconnectSpotify: async () => true,
    onSpotifyStatusChanged: () => () => {},
    testValorantVolume: async () => false,
    minimizeWindow: () => {},
    maximizeWindow: () => {},
    closeWindow: () => {}
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
