import { memo } from 'react'
import { Music, CheckCircle2, XCircle, ExternalLink, RefreshCw, Key } from 'lucide-react'
import { SpotifyAuthStatus } from '../types'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import { cn } from '../lib/utils'

export interface SpotifyAuthProps {
  status: SpotifyAuthStatus
  clientId: string
  onUpdateClientId: (clientId: string) => Promise<void> | void
  onConnect: () => Promise<{ success: boolean; error?: string }>
  onDisconnect: () => Promise<void>
  onRefreshStatus: () => Promise<void>
}

export const SpotifyAuth = memo(function SpotifyAuth({
  status,
  clientId,
  onUpdateClientId,
  onConnect,
  onDisconnect,
  onRefreshStatus
}: SpotifyAuthProps) {
  const {
    isEditingClientId,
    clientIdInput,
    isConnecting,
    errorMessage,
    setClientIdInput,
    toggleEditing,
    saveClientId,
    handleConnect,
    handleDisconnect
  } = useSpotifyAuth({
    initialClientId: clientId,
    onUpdateClientId,
    onConnect,
    onDisconnect
  })

  return (
    <section aria-labelledby="spotify-auth-heading" className="bg-theme-surface border border-theme-border-default rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-theme-success" aria-hidden="true" />
          <h3 id="spotify-auth-heading" className="text-base font-bold text-white tracking-wide uppercase">
            Spotify Integration
          </h3>
        </div>

        <button
          type="button"
          onClick={onRefreshStatus}
          title="Refresh Spotify connection status"
          aria-label="Refresh Spotify connection status"
          className="text-theme-text-muted hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-primary rounded p-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-inset p-3 rounded-lg border border-theme-border-default">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                status.isConnected
                  ? 'bg-theme-success/20 text-theme-success'
                  : 'bg-theme-surface-elevated text-theme-text-dim'
              )}
              aria-hidden="true"
            >
              {status.isConnected ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {status.isConnected ? status.displayName : 'Not Connected'}
                </span>
                {status.isConnected && (
                  <span className="text-2xs bg-theme-success/20 text-theme-success px-1.5 py-0.2 rounded font-mono uppercase">
                    {status.product || 'Active'}
                  </span>
                )}
              </div>
              <p className="text-xs text-theme-text-muted">
                {status.isConnected
                  ? status.hasActiveDevice
                    ? 'Spotify running on PC • Ready to toggle with F8'
                    : 'Connected • Open the Spotify desktop app on your PC to enable control'
                  : 'Connect your Spotify account or launch Spotify desktop to enable auto play/pause'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status.isConnected ? (
              <button
                type="button"
                onClick={() => void handleDisconnect()}
                className="px-3 py-1.5 rounded bg-theme-danger/20 hover:bg-theme-danger/30 text-theme-primary border border-theme-danger/40 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-primary"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleConnect()}
                disabled={isConnecting}
                className="px-4 py-2 rounded bg-theme-success hover:bg-theme-success-hover text-black text-sm font-bold tracking-wide transition-all shadow-glow-spotify disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-success"
              >
                {isConnecting ? 'Waiting in Browser...' : 'Connect Spotify'}
              </button>
            )}
          </div>
        </div>

        {/* Client ID Configuration Section */}
        <div className="text-sm">
          <div className="flex items-center justify-between text-theme-text-muted mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Key className="w-3.5 h-3.5" aria-hidden="true" />
              Spotify Client ID (Developer App)
            </span>
            <button
              type="button"
              onClick={toggleEditing}
              className="text-xs text-theme-primary hover:underline focus-visible:outline-none"
            >
              {isEditingClientId ? 'Cancel' : 'Change Client ID'}
            </button>
          </div>

          {isEditingClientId ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void saveClientId()
              }}
              className="flex items-center gap-2 mt-1"
            >
              <input
                type="text"
                placeholder="Enter Spotify Client ID..."
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                className="flex-1 bg-theme-header border border-theme-border-focus rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-theme-success font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-theme-surface-elevated hover:bg-theme-surface-hover text-sm font-semibold rounded text-white transition-colors"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between text-xs text-theme-text-dim font-mono bg-theme-header px-2.5 py-1.5 rounded border border-theme-border-subtle">
              <span>
                {clientId
                  ? `${clientId.substring(0, 8)}••••••••••••••••${clientId.substring(clientId.length - 4)}`
                  : 'No Client ID configured'}
              </span>
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-theme-text-muted hover:text-theme-success flex items-center gap-1 font-sans focus-visible:underline"
              >
                <span>Get one free</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <p className="text-2xs text-theme-text-dim mt-1">
            Redirect URI required in Spotify Dashboard:{' '}
            <code className="text-theme-text-body font-mono bg-theme-header px-1 py-0.5 rounded">
              http://127.0.0.1:8888/callback
            </code>
          </p>
        </div>

        {errorMessage && (
          <div role="alert" className="text-sm text-theme-primary mt-1">
            {errorMessage}
          </div>
        )}
      </div>
    </section>
  )
})
