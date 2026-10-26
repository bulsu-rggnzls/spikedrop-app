import * as http from 'node:http'
import * as crypto from 'node:crypto'
import { shell } from 'electron'
import { store } from './store'
import { windowsAudio } from './windowsAudio'

const REDIRECT_URI = 'http://127.0.0.1:8888/callback'
const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
].join(' ')

export interface SpotifyAuthStatus {
  isConnected: boolean
  displayName: string | null
  product: string | null
  hasActiveDevice: boolean
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export class SpotifyController {
  private localServer: http.Server | null = null
  private currentVerifier: string | null = null
  private onAuthCallback?: (status: SpotifyAuthStatus) => void
  private webApiBlocked: boolean = false

  constructor() {}

  public setAuthCallback(cb: (status: SpotifyAuthStatus) => void): void {
    this.onAuthCallback = cb
  }

  private generateCodeVerifier(): string {
    return base64UrlEncode(crypto.randomBytes(32))
  }

  private generateCodeChallenge(verifier: string): string {
    const hash = crypto.createHash('sha256').update(verifier).digest()
    return base64UrlEncode(hash)
  }

  public async startAuthFlow(clientId?: string): Promise<{ success: boolean; error?: string }> {
    const settings = store.getSettings()
    const finalClientId = clientId || settings.spotifyClientId

    if (!finalClientId || finalClientId.trim() === '') {
      return { success: false, error: 'Spotify Client ID is required. Please provide a Client ID in settings.' }
    }

    if (clientId) {
      store.updateSettings({ spotifyClientId: clientId })
    }

    this.webApiBlocked = false
    this.currentVerifier = this.generateCodeVerifier()
    const challenge = this.generateCodeChallenge(this.currentVerifier)

    await this.startLocalCallbackServer()

    const authUrl =
      `https://accounts.spotify.com/authorize?` +
      `client_id=${encodeURIComponent(finalClientId)}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(SPOTIFY_SCOPES)}&` +
      `code_challenge_method=S256&` +
      `code_challenge=${encodeURIComponent(challenge)}`

    shell.openExternal(authUrl)
    return { success: true }
  }

  private async startLocalCallbackServer(): Promise<void> {
    if (this.localServer) {
      this.localServer.close()
      this.localServer = null
    }

    return new Promise((resolve) => {
      this.localServer = http.createServer(async (req, res) => {
        const url = new URL(req.url || '/', `http://127.0.0.1:8888`)
        if (url.pathname === '/callback') {
          const code = url.searchParams.get('code')
          const error = url.searchParams.get('error')

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' })
            res.end(`
              <html>
                <body style="font-family:sans-serif;background:#0f1923;color:#ff4655;text-align:center;padding:50px;">
                  <h2>Authentication Failed</h2>
                  <p>${error}</p>
                  <p>You can close this tab and try again.</p>
                </body>
              </html>
            `)
            this.closeLocalServer()
            return
          }

          if (code && this.currentVerifier) {
            const success = await this.exchangeCodeForTokens(code, this.currentVerifier)
            if (success) {
              res.writeHead(200, { 'Content-Type': 'text/html' })
              res.end(`
                <html>
                  <body style="font-family:sans-serif;background:#0f1923;color:#ece8e1;text-align:center;padding:50px;">
                    <h2 style="color:#1db954;">Successfully Connected to Spotify!</h2>
                    <p>SpikeDrop is now authorized to control your Spotify playback.</p>
                    <p style="color:#888;">You can now close this browser window and return to the app.</p>
                    <script>setTimeout(() => window.close(), 2500);</script>
                  </body>
                </html>
              `)
              const status = await this.getAuthStatus()
              this.onAuthCallback?.(status)
            } else {
              res.writeHead(500, { 'Content-Type': 'text/html' })
              res.end(`
                <html>
                  <body style="font-family:sans-serif;background:#0f1923;color:#ff4655;text-align:center;padding:50px;">
                    <h2>Token Exchange Failed</h2>
                    <p>Unable to retrieve tokens from Spotify. Please check your credentials.</p>
                  </body>
                </html>
              `)
            }
          }
          this.closeLocalServer()
        }
      })

      this.localServer.listen(8888, '127.0.0.1', () => {
        resolve()
      })
    })
  }

  private closeLocalServer(): void {
    if (this.localServer) {
      setTimeout(() => {
        this.localServer?.close()
        this.localServer = null
      }, 1000)
    }
  }

  private async exchangeCodeForTokens(code: string, verifier: string): Promise<boolean> {
    const settings = store.getSettings()
    const bodyParams = new URLSearchParams({
      client_id: settings.spotifyClientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier
    })

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      })

      if (!response.ok) {
        console.error('Spotify token exchange failed:', await response.text())
        return false
      }

      const data = (await response.json()) as any
      const expiresIn = data.expires_in || 3600
      const expiresAt = Date.now() + expiresIn * 1000

      store.updateSettings({
        spotifyAccessToken: data.access_token,
        spotifyRefreshToken: data.refresh_token || settings.spotifyRefreshToken,
        spotifyTokenExpiresAt: expiresAt
      })

      return true
    } catch (err) {
      console.error('Exchange token error:', err)
      return false
    }
  }

  private async getValidAccessToken(): Promise<string | null> {
    const settings = store.getSettings()
    if (!settings.spotifyAccessToken) return null

    // If token is expiring within 60 seconds, refresh it
    if (settings.spotifyTokenExpiresAt && Date.now() > settings.spotifyTokenExpiresAt - 60000) {
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        return store.getSettings().spotifyAccessToken
      }
    }

    return settings.spotifyAccessToken
  }

  private async refreshAccessToken(): Promise<boolean> {
    const settings = store.getSettings()
    if (!settings.spotifyRefreshToken || !settings.spotifyClientId) {
      return false
    }

    const bodyParams = new URLSearchParams({
      client_id: settings.spotifyClientId,
      grant_type: 'refresh_token',
      refresh_token: settings.spotifyRefreshToken
    })

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      })

      if (!response.ok) {
        return false
      }

      const data = (await response.json()) as any
      const expiresIn = data.expires_in || 3600
      const expiresAt = Date.now() + expiresIn * 1000

      store.updateSettings({
        spotifyAccessToken: data.access_token,
        spotifyRefreshToken: data.refresh_token || settings.spotifyRefreshToken,
        spotifyTokenExpiresAt: expiresAt
      })

      return true
    } catch (err) {
      console.error('Failed to refresh Spotify token:', err)
      return false
    }
  }

  public async setSpotifyPlayback(play: boolean): Promise<boolean> {
    const token = await this.getValidAccessToken()
    let webApiSuccess = false

    if (token) {
      const endpoint = play
        ? 'https://api.spotify.com/v1/me/player/play'
        : 'https://api.spotify.com/v1/me/player/pause'

      try {
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.status === 204 || response.ok) {
          webApiSuccess = true
        } else if (response.status === 401) {
          const refreshed = await this.refreshAccessToken()
          if (refreshed) {
            return this.setSpotifyPlayback(play)
          }
        }
      } catch (err) {
        console.warn('Spotify Web API playback call failed, falling back to desktop media key:', err)
      }
    }

    // Fallback: Send Windows Media Play/Pause key event directly to Spotify desktop
    if (!webApiSuccess) {
      await windowsAudio.sendMediaKey(play ? 'play' : 'pause')
    }

    return true
  }

  public async setSpotifyVolume(percent: number): Promise<boolean> {
    const token = await this.getValidAccessToken()
    const clamped = Math.round(Math.max(0, Math.min(100, percent)))
    let webApiSuccess = false

    if (token) {
      const endpoint = `https://api.spotify.com/v1/me/player/volume?volume_percent=${clamped}`

      try {
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.status === 204 || response.ok) {
          webApiSuccess = true
        } else if (response.status === 401) {
          const refreshed = await this.refreshAccessToken()
          if (refreshed) {
            return this.setSpotifyVolume(clamped)
          }
        }
      } catch (err) {
        console.warn('Spotify Web API volume call failed, falling back to Windows mixer:', err)
      }
    }

    // Fallback: Directly adjust Spotify.exe volume in Windows Volume Mixer (WASAPI)
    // Also apply mixer volume control regardless to guarantee exact decibel control
    await windowsAudio.setProcessVolume('Spotify', clamped / 100)

    return true
  }

  public async getAuthStatus(): Promise<SpotifyAuthStatus> {
    const isSpotifyRunning = await windowsAudio.isProcessRunning('Spotify')
    const token = await this.getValidAccessToken()

    if (!token) {
      return {
        isConnected: isSpotifyRunning,
        displayName: isSpotifyRunning ? 'Spotify Desktop' : null,
        product: isSpotifyRunning ? 'Desktop Mode' : null,
        hasActiveDevice: isSpotifyRunning
      }
    }

    // If Spotify Web API previously returned 403 (Free account policy restriction)
    if (this.webApiBlocked) {
      return {
        isConnected: true,
        displayName: 'Spotify (Desktop Mode)',
        product: 'Free / Desktop',
        hasActiveDevice: isSpotifyRunning
      }
    }

    try {
      const userRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (userRes.ok) {
        const userData = (await userRes.json()) as any
        let hasActiveDevice = isSpotifyRunning

        const playerRes = await fetch('https://api.spotify.com/v1/me/player', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (playerRes.status === 200) {
          const playerData = (await playerRes.json()) as any
          hasActiveDevice = !!playerData?.device?.is_active || isSpotifyRunning
        }

        return {
          isConnected: true,
          displayName: userData.display_name || userData.id || 'Spotify User',
          product: userData.product || 'Premium',
          hasActiveDevice
        }
      }

      // If Spotify API returned 403 (Free account restricted by Spotify's Web API policy)
      if (userRes.status === 403) {
        this.webApiBlocked = true
      }

      return {
        isConnected: true,
        displayName: 'Spotify (Desktop Mode)',
        product: 'Free / Desktop',
        hasActiveDevice: isSpotifyRunning
      }
    } catch {
      return {
        isConnected: true,
        displayName: 'Spotify (Desktop Mode)',
        product: 'Desktop Mode',
        hasActiveDevice: isSpotifyRunning
      }
    }
  }

  public disconnect(): void {
    this.webApiBlocked = false
    store.updateSettings({
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
      spotifyTokenExpiresAt: null
    })
  }
}

export const spotifyController = new SpotifyController()

