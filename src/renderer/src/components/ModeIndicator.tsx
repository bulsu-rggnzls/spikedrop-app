import { memo } from 'react'
import { Crosshair, Headphones, Zap } from 'lucide-react'
import { AudioMode } from '../types'
import { cn } from '../lib/utils'

export interface ModeIndicatorProps {
  mode: AudioMode
  hotkey: string
  spotifyGamingVolume?: number
  pauseSpotifyInGaming?: boolean
  onToggle: () => void
  isToggling?: boolean
}

export const ModeIndicator = memo(function ModeIndicator({
  mode,
  hotkey,
  spotifyGamingVolume = 15,
  pauseSpotifyInGaming = false,
  onToggle,
  isToggling = false
}: ModeIndicatorProps) {
  const isGaming = mode === 'GAMING'

  return (
    <section
      role="region"
      aria-label="Active Audio Profile"
      onClick={onToggle}
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 cursor-pointer transition-all duration-300 transform active:scale-[0.99] group',
        isGaming
          ? 'bg-gradient-to-r from-[var(--color-gradient-gaming-from)] to-[var(--color-gradient-gaming-to)] border-theme-primary/40 shadow-glow-valorant'
          : 'bg-gradient-to-r from-[var(--color-gradient-chill-from)] to-[var(--color-gradient-chill-to)] border-theme-success/40 shadow-glow-spotify'
      )}
    >
      {/* Background ambient radial glow */}
      <div
        className={cn(
          'absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500',
          isGaming ? 'bg-theme-primary' : 'bg-theme-success'
        )}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-[var(--size-badge-lg)] h-[var(--size-badge-lg)] rounded-xl flex items-center justify-center transition-all duration-300',
              isGaming
                ? 'bg-theme-primary text-white shadow-badge-valorant'
                : 'bg-theme-success text-black shadow-badge-spotify'
            )}
            aria-hidden="true"
          >
            {isGaming ? (
              <Crosshair className="w-8 h-8 animate-pulse" />
            ) : (
              <Headphones className="w-8 h-8 animate-bounce" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm uppercase tracking-widest font-bold text-theme-text-muted">
                Active Audio Profile
              </span>
              <span
                className={cn(
                  'text-2xs px-2 py-0.5 rounded-full font-mono font-semibold',
                  isGaming
                    ? 'bg-theme-primary/20 text-theme-primary border border-theme-primary/30'
                    : 'bg-theme-success/20 text-theme-success border border-theme-success/30'
                )}
                aria-live="polite"
              >
                LIVE
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-wide uppercase text-white flex items-center gap-2 mt-0.5">
              {isGaming ? (
                <>
                  <span className="text-theme-primary">Gaming</span> Mode
                </>
              ) : (
                <>
                  <span className="text-theme-success">Chill</span> Mode
                </>
              )}
            </h2>

            <p className="text-sm text-theme-text-muted mt-0.5">
              {isGaming
                ? pauseSpotifyInGaming
                  ? 'Valorant at 100% volume • Spotify playback paused'
                  : `Valorant at 100% volume • Spotify lowered to ${spotifyGamingVolume}%`
                : 'Valorant lowered to 10% • Spotify playing at boost level'}
            </p>
          </div>
        </div>

        {/* Action Toggle Pill */}
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            disabled={isToggling}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold text-sm tracking-wider uppercase transition-all duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary',
              isGaming
                ? 'bg-theme-primary/20 text-theme-primary border border-theme-primary/40 group-hover:bg-theme-primary group-hover:text-white'
                : 'bg-theme-success/20 text-theme-success border border-theme-success/40 group-hover:bg-theme-success group-hover:text-black'
            )}
            aria-label={`Switch audio mode to ${isGaming ? 'Chill' : 'Gaming'}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Switch to {isGaming ? 'Chill' : 'Gaming'}</span>
          </button>

          <span className="text-xs font-mono text-theme-text-dim">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-theme-surface-elevated border border-theme-border-focus rounded text-theme-text-body font-bold">
              {hotkey}
            </kbd>{' '}
            anywhere
          </span>
        </div>
      </div>
    </section>
  )
})
