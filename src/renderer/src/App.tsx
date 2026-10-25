import React, { useState, useEffect } from 'react'
import { TitleBar } from './components/TitleBar'
import { ModeIndicator } from './components/ModeIndicator'
import { VolumeSliders } from './components/VolumeSliders'
import { HotkeyConfig } from './components/HotkeyConfig'
import { SpotifyAuth } from './components/SpotifyAuth'
import { ProcessStatus } from './components/ProcessStatus'
import { AppSettings, AudioMode, ValorantStatus, SpotifyAuthStatus, AudioSessionInfo } from './types'
import { ShieldCheck, Info } from 'lucide-react'

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [mode, setMode] = useState<AudioMode>('GAMING')
  const [isToggling, setIsToggling] = useState(false)
  const [valorantStatus, setValorantStatus] = useState<ValorantStatus>({
    isRunning: false,
    hasAudioSession: false,
    currentVolume: null
  })
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyAuthStatus>({
    isConnected: false,
    displayName: null,
    product: null,
    hasActiveDevice: false
  })
  const [audioSessions, setAudioSessions] = useState<AudioSessionInfo[]>([])

  // Load initial settings and data
  useEffect(() => {
    window.api.getSettings().then(setSettings)
    window.api.getMode().then(setMode)
    refreshStatuses()

    // Listen for live mode changes (from global hotkey or tray)
    const unsubMode = window.api.onModeChanged((newMode) => {
      setMode(newMode)
      refreshStatuses()
    })

    const unsubSpotify = window.api.onSpotifyStatusChanged((newStatus) => {
      setSpotifyStatus(newStatus)
    })

    // Poll process and status every 4 seconds
    const interval = setInterval(refreshStatuses, 4000)

    return () => {
      unsubMode()
      unsubSpotify()
      clearInterval(interval)
    }
  }, [])

  const refreshStatuses = async () => {
    try {
      const [vStatus, sStatus, sessions] = await Promise.all([
        window.api.getValorantStatus(),
        window.api.getSpotifyStatus(),
        window.api.getAudioSessions()
      ])
      setValorantStatus(vStatus)
      setSpotifyStatus(sStatus)
      setAudioSessions(sessions)
    } catch (err) {
      console.error('Error refreshing statuses:', err)
    }
  }

  const handleToggleMode = async () => {
    setIsToggling(true)
    try {
      const newMode = await window.api.toggleMode()
      setMode(newMode)
      await refreshStatuses()
    } finally {
      setIsToggling(false)
    }
  }

  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    if (!settings) return
    const updated = await window.api.updateSettings(updates)
    setSettings(updated)
  }

  const handleUpdateHotkey = async (newHotkey: string): Promise<boolean> => {
    if (!settings) return false
    const updated = await window.api.updateSettings({ hotkey: newHotkey })
    setSettings(updated)
    return updated.hotkey === newHotkey
  }

  const handleConnectSpotify = async () => {
    if (!settings?.spotifyClientId) {
      alert('Please enter a Spotify Client ID first.')
      return
    }
    const res = await window.api.startSpotifyAuth(settings.spotifyClientId)
    if (!res.success && res.error) {
      alert(res.error)
    }
  }

  const handleDisconnectSpotify = async () => {
    await window.api.disconnectSpotify()
    setSpotifyStatus({
      isConnected: false,
      displayName: null,
      product: null,
      hasActiveDevice: false
    })
  }

  if (!settings) {
    return (
      <div className="h-screen w-screen bg-valorant-dark flex items-center justify-center text-gray-400">
        Loading SpikeDrop...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f1923] text-valorant-text selection:bg-valorant-red selection:text-white">
      <TitleBar />

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Active Mode Visual Indicator */}
        <ModeIndicator
          mode={mode}
          hotkey={settings.hotkey}
          onToggle={handleToggleMode}
          isToggling={isToggling}
        />

        {/* Game Status & Detection */}
        <ProcessStatus
          status={valorantStatus}
          sessions={audioSessions}
          onRefresh={refreshStatuses}
        />

        {/* Volume Sliders for Valorant and Spotify */}
        <VolumeSliders settings={settings} onUpdate={handleUpdateSettings} />

        {/* Global Hotkey Config */}
        <HotkeyConfig
          hotkey={settings.hotkey}
          onUpdateHotkey={handleUpdateHotkey}
        />

        {/* Spotify OAuth & Player Connect */}
        <SpotifyAuth
          status={spotifyStatus}
          clientId={settings.spotifyClientId}
          onUpdateClientId={(id) => handleUpdateSettings({ spotifyClientId: id })}
          onConnect={handleConnectSpotify}
          onDisconnect={handleDisconnectSpotify}
          onRefreshStatus={refreshStatuses}
        />

        {/* Bottom Preferences & Vanguard Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-4 text-xs text-gray-400 border-t border-[#1b2733]">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <ShieldCheck className="w-4 h-4 text-spotify-green" />
            <span>
              100% Vanguard Safe: Adjusts Windows Volume Mixer (WASAPI) with zero game memory injection.
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
            <input
              type="checkbox"
              checked={settings.minimizeToTray}
              onChange={(e) => handleUpdateSettings({ minimizeToTray: e.target.checked })}
              className="rounded accent-valorant-red"
            />
            <span>Minimize to System Tray on close</span>
          </label>
        </div>
      </main>
    </div>
  )
}
export default App

