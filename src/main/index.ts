import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { windowsAudio } from './windowsAudio'
import { spotifyController } from './spotifyController'
import { shortcutManager } from './shortcuts'
import { store, AppSettings } from './store'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function getPreloadPath(): string {
  const mjsPath = path.join(__dirname, '../preload/index.mjs')
  if (fs.existsSync(mjsPath)) return mjsPath
  return path.join(__dirname, '../preload/index.js')
}

function getIconPath(): string {
  const isPackaged = app.isPackaged
  const baseDir = isPackaged
    ? path.join(process.resourcesPath)
    : path.join(__dirname, '../../resources')

  const candidate = path.join(baseDir, 'icon.png')
  if (fs.existsSync(candidate)) return candidate
  return path.join(__dirname, '../../resources/icon.png')
}

function createWindow(): BrowserWindow {
  const iconPath = getIconPath()

  mainWindow = new BrowserWindow({
    title: 'SpikeDrop - Valorant & Spotify Global Audio Switcher',
    width: 860,
    height: 720,
    minWidth: 700,
    minHeight: 600,
    frame: false,
    show: false,
    backgroundColor: '#0f1923',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: getPreloadPath(),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  shortcutManager.setMainWindow(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })

  // Fallback to guarantee window shows up if ready-to-show is delayed by dev server
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show()
      mainWindow.focus()
    }
  }, 1500)

  mainWindow.on('close', (event) => {
    const settings = store.getSettings()
    if (!isQuitting && settings.minimizeToTray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  // Load renderer
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function createTray(): void {
  const iconPath = getIconPath()
  let trayImage: nativeImage

  if (fs.existsSync(iconPath)) {
    trayImage = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  } else {
    trayImage = nativeImage.createEmpty()
  }

  tray = new Tray(trayImage)
  tray.setToolTip('SpikeDrop - Valorant & Spotify Global Audio Switcher')

  const updateTrayMenu = () => {
    const currentMode = shortcutManager.getMode()
    const settings = store.getSettings()

    const contextMenu = Menu.buildFromTemplate([
      {
        label: `Current Mode: ${currentMode === 'GAMING' ? '🎯 Gaming' : '🎵 Chill'}`,
        enabled: false
      },
      {
        label: `Toggle Mode (${settings.hotkey})`,
        click: () => {
          shortcutManager.toggleAudioMode()
          updateTrayMenu()
        }
      },
      { type: 'separator' },
      {
        label: 'Open SpikeDrop',
        click: () => {
          mainWindow?.show()
          mainWindow?.focus()
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        click: () => {
          isQuitting = true
          app.quit()
        }
      }
    ])

    tray?.setContextMenu(contextMenu)
  }

  updateTrayMenu()

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      if (mainWindow.isFocused()) {
        mainWindow.hide()
      } else {
        mainWindow.focus()
      }
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })
}

// Register IPC handlers
function registerIpcHandlers(): void {
  ipcMain.handle('get-settings', () => {
    return store.getSettings()
  })

  ipcMain.handle('update-settings', (_event, updates: Partial<AppSettings>) => {
    const prevHotkey = store.getSettings().hotkey
    const newSettings = store.updateSettings(updates)
    if (updates.hotkey && updates.hotkey !== prevHotkey) {
      shortcutManager.updateHotkey(updates.hotkey)
    }
    return newSettings
  })

  ipcMain.handle('get-mode', () => {
    return shortcutManager.getMode()
  })

  ipcMain.handle('toggle-mode', async () => {
    return await shortcutManager.toggleAudioMode()
  })

  ipcMain.handle('get-valorant-status', async () => {
    const settings = store.getSettings()
    const isRunning = await windowsAudio.isProcessRunning(settings.valorantProcessName)
    const volume = await windowsAudio.getProcessVolume(settings.valorantProcessName)
    return {
      isRunning,
      hasAudioSession: volume !== null,
      currentVolume: volume !== null ? Math.round(volume * 100) : null
    }
  })

  ipcMain.handle('get-audio-sessions', async () => {
    return await windowsAudio.listAudioSessions()
  })

  ipcMain.handle('get-spotify-status', async () => {
    return await spotifyController.getAuthStatus()
  })

  ipcMain.handle('start-spotify-auth', async (_event, clientId?: string) => {
    return await spotifyController.startAuthFlow(clientId)
  })

  ipcMain.handle('disconnect-spotify', () => {
    spotifyController.disconnect()
    return true
  })

  ipcMain.handle('test-valorant-volume', async (_event, volumePercent: number) => {
    const settings = store.getSettings()
    return await windowsAudio.setProcessVolume(settings.valorantProcessName, volumePercent / 100)
  })

  // Window control IPCs
  ipcMain.on('window-minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow?.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    const settings = store.getSettings()
    if (settings.minimizeToTray) {
      mainWindow?.hide()
    } else {
      isQuitting = true
      mainWindow?.close()
    }
  })
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // App lifecycle
  app.whenReady().then(() => {
    registerIpcHandlers()
    createWindow()
    createTray()
    shortcutManager.register()

    spotifyController.setAuthCallback((status) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('spotify-status-changed', status)
      }
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })

  app.on('will-quit', () => {
    shortcutManager.unregisterAll()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      const settings = store.getSettings()
      if (!settings.minimizeToTray) {
        app.quit()
      }
    }
  })
}
