import { contextBridge, ipcRenderer } from 'electron'

export interface AppSettings {
  hotkey: string
  valorantProcessName: string
  valorantGamingVolume: number
  valorantChillVolume: number
  spotifyGamingVolume: number
  spotifyChillVolume: number
  pauseSpotifyInGaming: boolean
  resumeSpotifyInChill: boolean
  minimizeToTray: boolean
  spotifyClientId: string
  spotifyClientSecret: string
  spotifyAccessToken: string | null
  spotifyRefreshToken: string | null
  spotifyTokenExpiresAt: number | null
}

export interface AudioSessionInfo {
  pid: number
  processName: string
  volume: number
  isMuted: boolean
}

export interface SpotifyAuthStatus {
  isConnected: boolean
  displayName: string | null
  product: string | null
  hasActiveDevice: boolean
}

export interface ValorantStatus {
  isRunning: boolean
  hasAudioSession: boolean
  currentVolume: number | null
}

export type AudioMode = 'GAMING' | 'CHILL'

const api = {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  updateSettings: (updates: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('update-settings', updates),

  getMode: (): Promise<AudioMode> => ipcRenderer.invoke('get-mode'),
  toggleMode: (): Promise<AudioMode> => ipcRenderer.invoke('toggle-mode'),
  onModeChanged: (callback: (mode: AudioMode) => void) => {
    const handler = (_event: any, mode: AudioMode) => callback(mode)
    ipcRenderer.on('mode-changed', handler)
    return () => ipcRenderer.removeListener('mode-changed', handler)
  },

  getValorantStatus: (): Promise<ValorantStatus> => ipcRenderer.invoke('get-valorant-status'),
  getAudioSessions: (): Promise<AudioSessionInfo[]> => ipcRenderer.invoke('get-audio-sessions'),

  getSpotifyStatus: (): Promise<SpotifyAuthStatus> => ipcRenderer.invoke('get-spotify-status'),
  startSpotifyAuth: (clientId?: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('start-spotify-auth', clientId),
  disconnectSpotify: (): Promise<boolean> => ipcRenderer.invoke('disconnect-spotify'),
  onSpotifyStatusChanged: (callback: (status: SpotifyAuthStatus) => void) => {
    const handler = (_event: any, status: SpotifyAuthStatus) => callback(status)
    ipcRenderer.on('spotify-status-changed', handler)
    return () => ipcRenderer.removeListener('spotify-status-changed', handler)
  },

  testValorantVolume: (volumePercent: number): Promise<boolean> =>
    ipcRenderer.invoke('test-valorant-volume', volumePercent),

  minimizeWindow: (): void => ipcRenderer.send('window-minimize'),
  maximizeWindow: (): void => ipcRenderer.send('window-maximize'),
  closeWindow: (): void => ipcRenderer.send('window-close')
}

export type ApiType = typeof api

try {
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error('Failed to expose api to renderer:', error)
}

