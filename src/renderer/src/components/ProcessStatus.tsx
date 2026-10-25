import React, { useState } from 'react'
import { ShieldCheck, ShieldAlert, Activity, RefreshCw, Volume2 } from 'lucide-react'
import { ValorantStatus, AudioSessionInfo } from '../types'

interface ProcessStatusProps {
  status: ValorantStatus
  sessions: AudioSessionInfo[]
  onRefresh: () => void
}

export const ProcessStatus: React.FC<ProcessStatusProps> = ({ status, sessions, onRefresh }) => {
  const [showSessions, setShowSessions] = useState(false)

  return (
    <div className="bg-[#131d27] border border-[#1f2e3d] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-valorant-red" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Game Detection Status
          </h3>
        </div>

        <button
          onClick={onRefresh}
          title="Refresh process status"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Valorant Process Badge */}
        <div className="bg-[#0e161e] p-3 rounded-lg border border-[#1a2835] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                status.isRunning
                  ? 'bg-valorant-red/20 text-valorant-red'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              {status.isRunning ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-white">
                {status.isRunning ? 'VALORANT Running' : 'VALORANT Not Found'}
              </div>
              <div className="text-[11px] text-gray-400 font-mono">
                VALORANT-Win64-Shipping
              </div>
            </div>
          </div>

          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status.isRunning ? 'bg-spotify-green animate-ping' : 'bg-gray-600'
            }`}
          />
        </div>

        {/* Windows Audio Session Badge */}
        <div className="bg-[#0e161e] p-3 rounded-lg border border-[#1a2835] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                status.hasAudioSession
                  ? 'bg-spotify-green/20 text-spotify-green'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </div>

            <div>
              <div className="text-xs font-semibold text-white">
                {status.hasAudioSession ? 'Audio Session Hooked' : 'Waiting for Audio'}
              </div>
              <div className="text-[11px] text-gray-400">
                {status.currentVolume !== null
                  ? `Live Mixer Volume: ${status.currentVolume}%`
                  : 'No active sound stream'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSessions(!showSessions)}
            className="text-[10px] text-gray-400 hover:text-white underline font-mono"
          >
            {showSessions ? 'Hide' : 'Sessions'}
          </button>
        </div>
      </div>

      {showSessions && (
        <div className="mt-3 p-2 bg-[#0a1016] rounded border border-[#1a2835] text-[11px] font-mono max-h-36 overflow-y-auto">
          <div className="text-gray-400 mb-1 font-bold">Active Windows Audio Sessions:</div>
          {sessions.length === 0 ? (
            <div className="text-gray-500">No active audio streams detected.</div>
          ) : (
            <div className="space-y-1">
              {sessions.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-gray-300">
                  <span className="truncate max-w-[200px]">
                    {s.processName || `PID ${s.pid}`}
                  </span>
                  <span className="text-gray-400">
                    {Math.round(s.volume * 100)}% {s.isMuted ? '(Muted)' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

