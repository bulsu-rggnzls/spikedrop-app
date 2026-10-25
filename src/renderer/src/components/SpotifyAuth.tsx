import React, { useState } from 'react'
import { Music, CheckCircle2, XCircle, ExternalLink, RefreshCw, Key } from 'lucide-react'
import { SpotifyAuthStatus } from '../types'

interface SpotifyAuthProps {
  status: SpotifyAuthStatus
  clientId: string
  onUpdateClientId: (clientId: string) => void
  onConnect: () => Promise<void>
  onDisconnect: () => Promise<void>
  onRefreshStatus: () => Promise<void>
}

export const SpotifyAuth: React.FC<SpotifyAuthProps> = ({
  status,
  clientId,
  onUpdateClientId,
  onConnect,
  onDisconnect,
  onRefreshStatus
}) => {
  const [editingClientId, setEditingClientId] = useState(false)
  const [localClientId, setLocalClientId] = useState(clientId)
  const [isConnecting, setIsConnecting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleConnect = async () => {
    setErrorMsg(null)
    setIsConnecting(true)
    try {
      if (localClientId !== clientId) {
        onUpdateClientId(localClientId)
      }
      await onConnect()
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="bg-[#131d27] border border-[#1f2e3d] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-spotify-green" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Spotify Integration
          </h3>
        </div>

        <button
          onClick={onRefreshStatus}
          title="Refresh Spotify connection status"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e161e] p-3 rounded-lg border border-[#1a2835]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                status.isConnected ? 'bg-spotify-green/20 text-spotify-green' : 'bg-gray-800 text-gray-500'
              }`}
            >
              {status.isConnected ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {status.isConnected ? status.displayName : 'Not Connected'}
                </span>
                {status.isConnected && (
                  <span className="text-[10px] bg-spotify-green/20 text-spotify-green px-1.5 py-0.2 rounded font-mono uppercase">
                    {status.product || 'Active'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                {status.isConnected
                  ? status.hasActiveDevice
                    ? 'Player active on device • Ready to control'
                    : 'Connected, but no active playback detected (open Spotify app)'
                  : 'Connect your Spotify account to enable auto play/pause'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status.isConnected ? (
              <button
                onClick={onDisconnect}
                className="px-3 py-1.5 rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/40 text-xs font-semibold transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-4 py-2 rounded bg-spotify-green hover:bg-spotify-hover text-black text-xs font-bold tracking-wide transition-all shadow-[0_0_10px_rgba(29,185,84,0.3)] disabled:opacity-50"
              >
                {isConnecting ? 'Waiting in Browser...' : 'Connect Spotify'}
              </button>
            )}
          </div>
        </div>

        {/* Client ID Configuration Section */}
        <div className="text-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Key className="w-3.5 h-3.5" />
              Spotify Client ID (Developer App)
            </span>
            <button
              onClick={() => setEditingClientId(!editingClientId)}
              className="text-[11px] text-valorant-red hover:underline"
            >
              {editingClientId ? 'Done' : 'Change Client ID'}
            </button>
          </div>

          {editingClientId ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                placeholder="Enter Spotify Client ID..."
                value={localClientId}
                onChange={(e) => setLocalClientId(e.target.value)}
                className="flex-1 bg-[#0b1219] border border-[#2a3d52] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-spotify-green font-mono"
              />
              <button
                onClick={() => {
                  onUpdateClientId(localClientId)
                  setEditingClientId(false)
                }}
                className="px-3 py-1.5 bg-[#1b2733] hover:bg-[#253648] text-xs font-semibold rounded text-white"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono bg-[#0b1219] px-2.5 py-1.5 rounded border border-[#1b2733]">
              <span>
                {clientId
                  ? `${clientId.substring(0, 8)}••••••••••••••••${clientId.substring(clientId.length - 4)}`
                  : 'No Client ID configured'}
              </span>
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-spotify-green flex items-center gap-1 font-sans"
              >
                <span>Get one free</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <p className="text-[10px] text-gray-500 mt-1">
            Redirect URI required in Spotify Dashboard:{' '}
            <code className="text-gray-300 font-mono bg-[#0b1219] px-1 py-0.5 rounded">
              http://127.0.0.1:8888/callback
            </code>
          </p>
        </div>

        {errorMsg && <p className="text-xs text-valorant-red mt-1">{errorMsg}</p>}
      </div>
    </div>
  )
}

