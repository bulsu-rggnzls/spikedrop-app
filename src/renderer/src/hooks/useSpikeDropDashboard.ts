import { useState, useEffect, useCallback, useRef } from 'react'
import {
  AppSettings,
  AudioMode,
  ValorantStatus,
  SpotifyAuthStatus,
  AudioSessionInfo
} from '../types'

export interface UseSpikeDropDashboardReturn {
  settings: AppSettings | null
  mode: AudioMode
  isToggling: boolean
  valorantStatus: ValorantStatus
  spotifyStatus: SpotifyAuthStatus
  audioSessions: AudioSessionInfo[]
  toggleMode: () => Promise<void>
  updateSettings: (updates: Partial<AppSettings>) => Promise<AppSettings | null>
  updateHotkey: (newHotkey: string) => Promise<boolean>
  connectSpotify: () => Promise<{ success: boolean; error?: string }>
  disconnectSpotify: () => Promise<void>
  refreshStatuses: () => Promise<void>
}

/**
 * Headless root coordinator hook managing live Electron IPC streams and app lifecycle.
 */
export function useSpikeDropDashboard(pollIntervalMs = 4000): UseSpikeDropDashboardReturn {
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

  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const refreshStatuses = useCallback(async () => {
    try {
      const [vStatus, sStatus, sessions] = await Promise.all([
        window.api.getValorantStatus(),
        window.api.getSpotifyStatus(),
        window.api.getAudioSessions()
      ])

      if (isMountedRef.current) {
        setValorantStatus(vStatus)
        setSpotifyStatus(sStatus)
        setAudioSessions(sessions)
      }
    } catch (err) {
      console.error('Failed to query system status:', err)
    }
  }, [])

  // Initial fetch and real-time subscription bindings
  useEffect(() => {
    void window.api.getSettings().then((s) => {
      if (isMountedRef.current) setSettings(s)
    })
    void window.api.getMode().then((m) => {
      if (isMountedRef.current) setMode(m)
    })
    void refreshStatuses()

    const unsubMode = window.api.onModeChanged((newMode) => {
      if (isMountedRef.current) {
        setMode(newMode)
        void refreshStatuses()
      }
    })

    const unsubSpotify = window.api.onSpotifyStatusChanged((newStatus) => {
      if (isMountedRef.current) {
        setSpotifyStatus(newStatus)
      }
    })

    const interval = window.setInterval(() => {
      void refreshStatuses()
    }, pollIntervalMs)

    return () => {
      unsubMode()
      unsubSpotify()
      window.clearInterval(interval)
    }
  }, [refreshStatuses, pollIntervalMs])

  const toggleMode = useCallback(async () => {
    setIsToggling(true)
    try {
      const newMode = await window.api.toggleMode()
      if (isMountedRef.current) {
        setMode(newMode)
        await refreshStatuses()
      }
    } finally {
      if (isMountedRef.current) {
        setIsToggling(false)
      }
    }
  }, [refreshStatuses])

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>): Promise<AppSettings | null> => {
      if (!settings) return null
      try {
        const updated = await window.api.updateSettings(updates)
        if (isMountedRef.current) {
          setSettings(updated)
        }
        return updated
      } catch (err) {
        console.error('Failed to persist settings:', err)
        return null
      }
    },
    [settings]
  )

  const updateHotkey = useCallback(
    async (newHotkey: string): Promise<boolean> => {
      if (!settings) return false
      const updated = await updateSettings({ hotkey: newHotkey })
      return updated?.hotkey === newHotkey
    },
    [settings, updateSettings]
  )

  const connectSpotify = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!settings?.spotifyClientId) {
      return { success: false, error: 'Spotify Client ID is required before connecting.' }
    }
    return await window.api.startSpotifyAuth(settings.spotifyClientId)
  }, [settings?.spotifyClientId])

  const disconnectSpotify = useCallback(async () => {
    await window.api.disconnectSpotify()
    if (isMountedRef.current) {
      setSpotifyStatus({
        isConnected: false,
        displayName: null,
        product: null,
        hasActiveDevice: false
      })
    }
  }, [])

  return {
    settings,
    mode,
    isToggling,
    valorantStatus,
    spotifyStatus,
    audioSessions,
    toggleMode,
    updateSettings,
    updateHotkey,
    connectSpotify,
    disconnectSpotify,
    refreshStatuses
  }
}
