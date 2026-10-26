import { execFile, exec } from 'node:child_process'
import { promisify } from 'node:util'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { app } from 'electron'

const execFileAsync = promisify(execFile)
const execAsync = promisify(exec)

export interface AudioSessionInfo {
  pid: number
  processName: string
  volume: number
  isMuted: boolean
}

export class WindowsAudioController {
  private helperPath: string | null = null
  private psScriptPath: string | null = null

  constructor() {
    this.resolveHelperPaths()
  }

  private resolveHelperPaths(): void {
    const isPackaged = app ? app.isPackaged : false
    const baseDir = isPackaged
      ? path.join(process.resourcesPath, 'bin')
      : path.join(__dirname, '../../resources/bin')

    const exeCandidate = path.join(baseDir, 'AudioController.exe')
    const psCandidate = path.join(baseDir, 'AudioController.ps1')

    if (fs.existsSync(exeCandidate)) {
      this.helperPath = exeCandidate
    }
    if (fs.existsSync(psCandidate)) {
      this.psScriptPath = psCandidate
    }
  }

  /**
   * Send Windows Media Key event (play/pause/stop/next/prev)
   */
  async sendMediaKey(action: 'play' | 'pause' | 'stop' | 'next' | 'prev' = 'play'): Promise<boolean> {
    if (this.helperPath && fs.existsSync(this.helperPath)) {
      try {
        await execFileAsync(this.helperPath, ['media', action], {
          windowsHide: true,
          timeout: 2000
        })
        return true
      } catch {
        // ignore
      }
    }
    return false
  }

  /**
   * Set process volume (volume between 0.0 and 1.0)
   */
  async setProcessVolume(processName: string, volume: number): Promise<boolean> {
    const clamped = Math.max(0, Math.min(1, volume))
    const cleanName = processName.replace(/\.exe$/i, '')

    // Fast native binary path
    if (this.helperPath && fs.existsSync(this.helperPath)) {
      try {
        await execFileAsync(this.helperPath, ['set', cleanName, clamped.toFixed(2)], {
          windowsHide: true,
          timeout: 4000
        })
        return true
      } catch (err: any) {
        // Fallback to powershell if process wasn't found or binary threw
        if (err.stderr && err.stderr.includes('PROCESS_NOT_FOUND')) {
          return false
        }
      }
    }

    // PowerShell fallback
    try {
      if (this.psScriptPath && fs.existsSync(this.psScriptPath)) {
        await execFileAsync(
          'powershell.exe',
          ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', this.psScriptPath, 'set', cleanName, clamped.toFixed(2)],
          { windowsHide: true, timeout: 6000 }
        )
        return true
      }
    } catch {
      // ignore
    }

    return false
  }

  /**
   * Get current volume of target process (0.0 to 1.0) or null if not active
   */
  async getProcessVolume(processName: string): Promise<number | null> {
    const cleanName = processName.replace(/\.exe$/i, '')
    if (this.helperPath && fs.existsSync(this.helperPath)) {
      try {
        const { stdout } = await execFileAsync(this.helperPath, ['get', cleanName], {
          windowsHide: true,
          timeout: 4000
        })
        const val = parseFloat(stdout.trim())
        if (!isNaN(val)) return val
      } catch {
        return null
      }
    }

    return null
  }

  /**
   * Check if process is actively running in the OS
   */
  async isProcessRunning(processName: string): Promise<boolean> {
    const cleanName = processName.replace(/\.exe$/i, '')
    try {
      const { stdout } = await execAsync(
        `tasklist /FI "IMAGENAME eq ${cleanName}.exe" /NH`,
        { windowsHide: true, timeout: 3000 }
      )
      return stdout.toLowerCase().includes(cleanName.toLowerCase())
    } catch {
      return false
    }
  }

  /**
   * List all current audio sessions
   */
  async listAudioSessions(): Promise<AudioSessionInfo[]> {
    if (!this.helperPath || !fs.existsSync(this.helperPath)) {
      this.resolveHelperPaths()
    }

    if (!this.helperPath || !fs.existsSync(this.helperPath)) {
      return []
    }

    try {
      const { stdout } = await execFileAsync(this.helperPath, ['list'], {
        windowsHide: true,
        timeout: 4000
      })
      const lines = stdout.split(/\r?\n/).filter((l) => l.trim().length > 0)
      const sessions: AudioSessionInfo[] = []

      for (const line of lines) {
        const parts = line.split('|')
        if (parts.length >= 4) {
          sessions.push({
            pid: parseInt(parts[0], 10) || 0,
            processName: parts[1],
            volume: parseFloat(parts[2]) || 0,
            isMuted: parts[3].toLowerCase() === 'true'
          })
        }
      }
      return sessions
    } catch {
      return []
    }
  }
}

export const windowsAudio = new WindowsAudioController()

