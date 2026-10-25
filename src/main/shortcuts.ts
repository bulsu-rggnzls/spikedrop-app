import { globalShortcut, BrowserWindow, Notification } from 'electron'
import { store } from './store'
import { windowsAudio } from './windowsAudio'
import { spotifyController } from './spotifyController'

export type AudioMode = 'GAMING' | 'CHILL'

export class ShortcutManager {
  private currentMode: AudioMode = 'GAMING'
  private mainWindow: BrowserWindow | null = null
  private registeredHotkey: string | null = null

  constructor() {}

  public setMainWindow(win: BrowserWindow): void {
    this.mainWindow = win
  }

  public getMode(): AudioMode {
    return this.currentMode
  }

  public register(): boolean {
    const settings = store.getSettings()
    const hotkey = settings.hotkey || 'F8'

    if (this.registeredHotkey) {
      try {
        globalShortcut.unregister(this.registeredHotkey)
      } catch {
        // ignore
      }
    }

    try {
      const success = globalShortcut.register(hotkey, () => {
        this.toggleAudioMode()
      })

      if (success) {
        this.registeredHotkey = hotkey
        console.log(`Global hotkey registered: ${hotkey}`)
        return true
      } else {
        console.warn(`Failed to register global hotkey: ${hotkey}`)
        return false
      }
    } catch (err) {
      console.error(`Error registering hotkey ${hotkey}:`, err)
      return false
    }
  }

  public updateHotkey(newHotkey: string): boolean {
    store.updateSettings({ hotkey: newHotkey })
    return this.register()
  }

  public unregisterAll(): void {
    globalShortcut.unregisterAll()
    this.registeredHotkey = null
  }

  public async toggleAudioMode(): Promise<AudioMode> {
    const settings = store.getSettings()

    if (this.currentMode === 'GAMING') {
      this.currentMode = 'CHILL'
      await Promise.allSettled([
        windowsAudio.setProcessVolume(settings.valorantProcessName, settings.valorantChillVolume),
        spotifyController.setSpotifyVolume(settings.spotifyChillVolume),
        settings.resumeSpotifyInChill ? spotifyController.setSpotifyPlayback(true) : Promise.resolve(false)
      ])
    } else {
      this.currentMode = 'GAMING'
      await Promise.allSettled([
        windowsAudio.setProcessVolume(settings.valorantProcessName, settings.valorantGamingVolume),
        settings.spotifyGamingVolume > 0
          ? spotifyController.setSpotifyVolume(settings.spotifyGamingVolume)
          : Promise.resolve(false),
        settings.pauseSpotifyInGaming ? spotifyController.setSpotifyPlayback(false) : Promise.resolve(false)
      ])
    }

    this.notifyModeChanged()
    return this.currentMode
  }

  public async setMode(mode: AudioMode): Promise<AudioMode> {
    if (this.currentMode !== mode) {
      return this.toggleAudioMode()
    }
    return this.currentMode
  }

  private notifyModeChanged(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('mode-changed', this.currentMode)
    }

    if (Notification.isSupported()) {
      const isChill = this.currentMode === 'CHILL'
      new Notification({
        title: isChill ? 'Chill Mode Active 🎵' : 'Gaming Mode Active 🎯',
        body: isChill
          ? 'Valorant audio reduced, Spotify resumed.'
          : 'Valorant audio restored to 100%, Spotify paused.',
        silent: true
      }).show()
    }
  }
}

export const shortcutManager = new ShortcutManager()

