export type AudioMode = 'GAMING' | 'CHILL'

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

export interface ValorantStatus {
  isRunning: boolean
  hasAudioSession: boolean
  currentVolume: number | null
}

export interface SpotifyAuthStatus {
  isConnected: boolean
  displayName: string | null
  product: string | null
  hasActiveDevice: boolean
}

export interface AudioSessionInfo {
  pid: number
  processName: string
  volume: number
  isMuted: boolean
}

