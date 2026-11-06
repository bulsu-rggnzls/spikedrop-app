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
    <div className="bg-theme-surface border border-theme-border-default rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-theme-primary" />
          <h3 className="text-base font-bold text-white tracking-wide uppercase">
            Game Detection Status
          </h3>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          title="Refresh process status"
          className="text-theme-text-muted hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Valorant Process Badge */}
        <div className="bg-theme-inset p-3 rounded-lg border border-theme-border-default flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-[var(--size-badge-md)] h-[var(--size-badge-md)] rounded-lg flex items-center justify-center ${
                status.isRunning
                  ? 'bg-theme-primary/20 text-theme-primary'
                  : 'bg-theme-surface-elevated text-theme-text-dim'
              }`}
            >
              {status.isRunning ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                {status.isRunning ? 'VALORANT Running' : 'VALORANT Not Found'}
              </div>
              <div className="text-xs text-theme-text-muted font-mono">
                VALORANT-Win64-Shipping
              </div>
            </div>
          </div>

          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status.isRunning ? 'bg-theme-success animate-ping' : 'bg-theme-border-focus'
            }`}
          />
        </div>

        {/* Windows Audio Session Badge */}
        <div className="bg-theme-inset p-3 rounded-lg border border-theme-border-default flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-[var(--size-badge-md)] h-[var(--size-badge-md)] rounded-lg flex items-center justify-center ${
                status.hasAudioSession
                  ? 'bg-theme-success/20 text-theme-success'
                  : 'bg-theme-surface-elevated text-theme-text-dim'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                {status.hasAudioSession ? 'Audio Session Hooked' : 'Waiting for Audio'}
              </div>
              <div className="text-xs text-theme-text-muted">
                {status.currentVolume !== null
                  ? `Live Mixer Volume: ${status.currentVolume}%`
                  : 'No active sound stream'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSessions(!showSessions)}
            className="text-2xs text-theme-text-muted hover:text-white underline font-mono"
          >
            {showSessions ? 'Hide' : 'Sessions'}
          </button>
        </div>
      </div>

      {showSessions && (
        <div className="mt-3 p-2 bg-theme-inset-subtle rounded border border-theme-border-default text-xs font-mono max-h-36 overflow-y-auto">
          <div className="text-theme-text-muted mb-1 font-bold">Active Windows Audio Sessions:</div>
          {sessions.length === 0 ? (
            <div className="text-theme-text-dim">No active audio streams detected.</div>
          ) : (
            <div className="space-y-1">
              {sessions.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-theme-text-body">
                  <span className="truncate max-w-[12.5rem]">
                    {s.processName || `PID ${s.pid}`}
                  </span>
                  <span className="text-theme-text-muted">
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
