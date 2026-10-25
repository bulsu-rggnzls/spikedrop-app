import { app } from 'electron'
import * as path from 'node:path'
import * as fs from 'node:fs'

export interface AppSettings {
  hotkey: string
  valorantProcessName: string
  valorantGamingVolume: number // e.g. 1.0 (100%)
  valorantChillVolume: number // e.g. 0.1 (10%)
  spotifyGamingVolume: number // e.g. 0 (or paused)
  spotifyChillVolume: number // e.g. 80 (80%)
  pauseSpotifyInGaming: boolean
  resumeSpotifyInChill: boolean
  minimizeToTray: boolean
  spotifyClientId: string
  spotifyClientSecret: string
  spotifyAccessToken: string | null
  spotifyRefreshToken: string | null
  spotifyTokenExpiresAt: number | null
}

const DEFAULT_SETTINGS: AppSettings = {
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

class SettingsManager {
  private configPath: string
  private settings: AppSettings

  constructor() {
    const userData = app ? app.getPath('userData') : process.cwd()
    this.configPath = path.join(userData, 'spikedrop-config.json')
    this.settings = this.load()
  }

  private load(): AppSettings {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf-8')
        const data = JSON.parse(raw)
        return { ...DEFAULT_SETTINGS, ...data }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
    return { ...DEFAULT_SETTINGS }
  }

  public getSettings(): AppSettings {
    return { ...this.settings }
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    this.settings = { ...this.settings, ...updates }
    try {
      const dir = path.dirname(this.configPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.settings, null, 2), 'utf-8')
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
    return { ...this.settings }
  }
}

export const store = new SettingsManager()

