import React from 'react'
import { Crosshair, Headphones, Zap } from 'lucide-react'
import { AudioMode } from '../types'

interface ModeIndicatorProps {
  mode: AudioMode
  hotkey: string
  onToggle: () => void
  isToggling?: boolean
}

export const ModeIndicator: React.FC<ModeIndicatorProps> = ({
  mode,
  hotkey,
  onToggle,
  isToggling = false
}) => {
  const isGaming = mode === 'GAMING'

  return (
    <div
      onClick={onToggle}
      className={`relative overflow-hidden rounded-xl border p-6 cursor-pointer transition-all duration-300 transform active:scale-[0.99] group ${
        isGaming
          ? 'bg-gradient-to-r from-[#181a24] to-[#1e131d] border-valorant-red/40 shadow-[0_0_25px_rgba(255,70,85,0.2)]'
          : 'bg-gradient-to-r from-[#101e19] to-[#121c24] border-spotify-green/40 shadow-[0_0_25px_rgba(29,185,84,0.2)]'
      }`}
    >
      {/* Background ambient pulse */}
      <div
        className={`absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 ${
          isGaming ? 'bg-valorant-red' : 'bg-spotify-green'
        }`}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isGaming
                ? 'bg-valorant-red text-white shadow-[0_0_15px_rgba(255,70,85,0.5)]'
                : 'bg-spotify-green text-black shadow-[0_0_15px_rgba(29,185,84,0.5)]'
            }`}
          >
            {isGaming ? (
              <Crosshair className="w-8 h-8 animate-pulse" />
            ) : (
              <Headphones className="w-8 h-8 animate-bounce" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-gray-400">
                Active Audio Profile
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                  isGaming
                    ? 'bg-valorant-red/20 text-valorant-red border border-valorant-red/30'
                    : 'bg-spotify-green/20 text-spotify-green border border-spotify-green/30'
                }`}
              >
                LIVE
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-wide uppercase text-white flex items-center gap-2 mt-0.5">
              {isGaming ? (
                <>
                  <span className="text-valorant-red">Gaming</span> Mode
                </>
              ) : (
                <>
                  <span className="text-spotify-green">Chill</span> Mode
                </>
              )}
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              {isGaming
                ? 'Valorant at 100% volume • Spotify playback paused'
                : 'Valorant lowered to 10% • Spotify playing at boost level'}
            </p>
          </div>
        </div>

        {/* Action Toggle Pill */}
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            disabled={isToggling}
            className={`px-4 py-2 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-2 ${
              isGaming
                ? 'bg-valorant-red/20 text-valorant-red border border-valorant-red/40 group-hover:bg-valorant-red group-hover:text-white'
                : 'bg-spotify-green/20 text-spotify-green border border-spotify-green/40 group-hover:bg-spotify-green group-hover:text-black'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Switch to {isGaming ? 'Chill' : 'Gaming'}</span>
          </button>

          <span className="text-[11px] font-mono text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-[#1b2733] border border-gray-700 rounded text-gray-300 font-bold">{hotkey}</kbd> anywhere
          </span>
        </div>
      </div>
    </div>
  )
}

