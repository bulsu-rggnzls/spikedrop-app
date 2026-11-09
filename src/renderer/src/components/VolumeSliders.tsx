import { memo, useState, useCallback } from 'react'
import { Volume2, VolumeX, Music, Shield, Play } from 'lucide-react'
import { AppSettings } from '../types'
import { cn } from '../lib/utils'

export interface VolumeSlidersProps {
  settings: AppSettings
  onUpdate: (updates: Partial<AppSettings>) => void
}

interface VolumeSliderItemProps {
  label: string
  valuePercent: number
  min: number
  max: number
  step?: number
  accent: 'valorant' | 'spotify'
  minLabel: string
  midLabel: string
  maxLabel: string
  icon?: React.ReactNode
  onChange: (newPercent: number) => void
}

const VolumeSliderItem = memo(function VolumeSliderItem({
  label,
  valuePercent,
  min,
  max,
  step = 1,
  accent,
  minLabel,
  midLabel,
  maxLabel,
  icon,
  onChange
}: VolumeSliderItemProps) {
  const isValorant = accent === 'valorant'

  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1.5">
        <span className="text-theme-text-body flex items-center gap-1.5 font-medium">
          {icon}
          {label}
        </span>
        <span
          className={cn(
            'font-mono font-bold',
            isValorant ? 'text-theme-primary' : 'text-theme-success'
          )}
        >
          {valuePercent}%
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valuePercent}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={valuePercent}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className={cn('w-full', isValorant ? 'slider-valorant' : 'slider-spotify')}
      />

      <div className="flex justify-between text-2xs text-theme-text-dim mt-1 font-mono">
        <span>{minLabel}</span>
        <span>{midLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
})

export const VolumeSliders = memo(function VolumeSliders({
  settings,
  onUpdate
}: VolumeSlidersProps) {
  const [testingValorant, setTestingValorant] = useState(false)

  const handleTestValorant = useCallback(async (vol: number) => {
    setTestingValorant(true)
    try {
      await window.api.testValorantVolume(Math.round(vol * 100))
    } finally {
      setTimeout(() => setTestingValorant(false), 800)
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Valorant Audio Levels */}
      <section aria-labelledby="valorant-vol-heading" className="bg-theme-surface border border-theme-border-default rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-theme-primary" aria-hidden="true" />
              <h3 id="valorant-vol-heading" className="text-base font-bold text-white tracking-wide uppercase">
                Valorant Volume
              </h3>
            </div>
            <span className="text-2xs uppercase font-mono text-theme-text-dim bg-theme-header px-2 py-0.5 rounded">
              WASAPI Session
            </span>
          </div>

          <div className="space-y-4">
            <VolumeSliderItem
              label="Chill Mode (Target Volume)"
              valuePercent={Math.round(settings.valorantChillVolume * 100)}
              min={0}
              max={40}
              accent="valorant"
              minLabel="0% (Mute)"
              midLabel="20%"
              maxLabel="40%"
              icon={<Volume2 className="w-3.5 h-3.5 text-theme-text-muted" />}
              onChange={(val) => onUpdate({ valorantChillVolume: val / 100 })}
            />

            <VolumeSliderItem
              label="Gaming Mode (Focus Volume)"
              valuePercent={Math.round(settings.valorantGamingVolume * 100)}
              min={50}
              max={100}
              accent="valorant"
              minLabel="50%"
              midLabel="75%"
              maxLabel="100%"
              icon={<Volume2 className="w-3.5 h-3.5 text-theme-primary" />}
              onChange={(val) => onUpdate({ valorantGamingVolume: val / 100 })}
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-theme-border-default flex items-center justify-between">
          <span className="text-xs text-theme-text-muted">Apply instantly to mixer</span>
          <button
            type="button"
            onClick={() => void handleTestValorant(settings.valorantChillVolume)}
            disabled={testingValorant}
            className="px-2.5 py-1 rounded bg-theme-surface-elevated hover:bg-theme-surface-hover text-sm text-theme-text-body hover:text-white transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-primary"
          >
            <Play className="w-3 h-3 text-theme-primary" aria-hidden="true" />
            <span>{testingValorant ? 'Testing...' : 'Test Chill Level'}</span>
          </button>
        </div>
      </section>

      {/* Spotify Audio Levels */}
      <section aria-labelledby="spotify-vol-heading" className="bg-theme-surface border border-theme-border-default rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-theme-success" aria-hidden="true" />
              <h3 id="spotify-vol-heading" className="text-base font-bold text-white tracking-wide uppercase">
                Spotify Volume
              </h3>
            </div>
            <span className="text-2xs uppercase font-mono text-theme-text-dim bg-theme-header px-2 py-0.5 rounded">
              Web Player API
            </span>
          </div>

          <div className="space-y-4">
            <VolumeSliderItem
              label="Chill Mode (Music Boost Volume)"
              valuePercent={settings.spotifyChillVolume}
              min={30}
              max={100}
              accent="spotify"
              minLabel="30%"
              midLabel="65%"
              maxLabel="100%"
              icon={<Volume2 className="w-3.5 h-3.5 text-theme-success" />}
              onChange={(val) => onUpdate({ spotifyChillVolume: val })}
            />

            {!settings.pauseSpotifyInGaming && (
              <VolumeSliderItem
                label="Gaming Mode (Background Music Volume)"
                valuePercent={settings.spotifyGamingVolume ?? 15}
                min={0}
                max={40}
                accent="spotify"
                minLabel="0% (Quiet)"
                midLabel="20%"
                maxLabel="40%"
                icon={<Volume2 className="w-3.5 h-3.5 text-theme-text-muted" />}
                onChange={(val) => onUpdate({ spotifyGamingVolume: val })}
              />
            )}

            {/* Playback Automation Preferences */}
            <div className="bg-theme-inset p-2.5 rounded-lg border border-theme-border-default space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-theme-text-body flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.pauseSpotifyInGaming}
                    onChange={(e) => onUpdate({ pauseSpotifyInGaming: e.target.checked })}
                    className="rounded border-theme-border-focus text-theme-success focus:ring-0 focus:outline-none accent-[var(--color-primitive-spotify-green)]"
                  />
                  <span className="font-medium">Pause playback in Gaming Mode</span>
                </label>
                <VolumeX className="w-3.5 h-3.5 text-theme-text-dim" aria-hidden="true" />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-theme-text-body flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.resumeSpotifyInChill}
                    onChange={(e) => onUpdate({ resumeSpotifyInChill: e.target.checked })}
                    className="rounded border-theme-border-focus text-theme-success focus:ring-0 focus:outline-none accent-[var(--color-primitive-spotify-green)]"
                  />
                  <span className="font-medium">Auto-resume playback in Chill Mode</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-theme-border-default flex items-center justify-between">
          <span className="text-xs text-theme-text-muted">Controls active Spotify player</span>
        </div>
      </section>
    </div>
  )
})
