import React, { useState } from 'react'
import { Volume2, VolumeX, Music, Shield, Play } from 'lucide-react'
import { AppSettings } from '../types'

interface VolumeSlidersProps {
  settings: AppSettings
  onUpdate: (updates: Partial<AppSettings>) => void
}

export const VolumeSliders: React.FC<VolumeSlidersProps> = ({ settings, onUpdate }) => {
  const [testingValorant, setTestingValorant] = useState(false)

  const handleTestValorant = async (vol: number) => {
    setTestingValorant(true)
    try {
      await window.api.testValorantVolume(Math.round(vol * 100))
    } finally {
      setTimeout(() => setTestingValorant(false), 800)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Valorant Audio Levels */}
      <div className="bg-[#131d27] border border-[#1f2e3d] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-valorant-red" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Valorant Volume
            </h3>
          </div>
          <span className="text-[10px] uppercase font-mono text-gray-500 bg-[#0b1219] px-2 py-0.5 rounded">
            WASAPI Session
          </span>
        </div>

        <div className="space-y-4">
          {/* Chill Mode Volume Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-gray-400" />
                Chill Mode (Target Volume)
              </span>
              <span className="font-mono font-bold text-valorant-red">
                {Math.round(settings.valorantChillVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={Math.round(settings.valorantChillVolume * 100)}
              onChange={(e) =>
                onUpdate({ valorantChillVolume: parseInt(e.target.value, 10) / 100 })
              }
              className="w-full slider-valorant"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
              <span>0% (Mute)</span>
              <span>20%</span>
              <span>40%</span>
            </div>
          </div>

          {/* Gaming Mode Volume Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-valorant-red" />
                Gaming Mode (Focus Volume)
              </span>
              <span className="font-mono font-bold text-valorant-red">
                {Math.round(settings.valorantGamingVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={Math.round(settings.valorantGamingVolume * 100)}
              onChange={(e) =>
                onUpdate({ valorantGamingVolume: parseInt(e.target.value, 10) / 100 })
              }
              className="w-full slider-valorant"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1f2e3d] flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Apply instantly to mixer</span>
          <button
            onClick={() => handleTestValorant(settings.valorantChillVolume)}
            disabled={testingValorant}
            className="px-2.5 py-1 rounded bg-[#1b2733] hover:bg-[#253648] text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 text-valorant-red" />
            <span>{testingValorant ? 'Testing...' : 'Test Chill Level'}</span>
          </button>
        </div>
      </div>

      {/* Spotify Audio Levels */}
      <div className="bg-[#131d27] border border-[#1f2e3d] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-spotify-green" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Spotify Volume
            </h3>
          </div>
          <span className="text-[10px] uppercase font-mono text-gray-500 bg-[#0b1219] px-2 py-0.5 rounded">
            Web Player API
          </span>
        </div>

        <div className="space-y-4">
          {/* Chill Mode Music Volume */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-spotify-green" />
                Chill Mode (Target Volume)
              </span>
              <span className="font-mono font-bold text-spotify-green">
                {settings.spotifyChillVolume}%
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="1"
              value={settings.spotifyChillVolume}
              onChange={(e) =>
                onUpdate({ spotifyChillVolume: parseInt(e.target.value, 10) })
              }
              className="w-full slider-spotify"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
              <span>30%</span>
              <span>65%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Gaming Mode Playback Option */}
          <div className="bg-[#0e161e] p-2.5 rounded-lg border border-[#1a2835] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pauseSpotifyInGaming}
                  onChange={(e) => onUpdate({ pauseSpotifyInGaming: e.target.checked })}
                  className="rounded border-gray-600 text-spotify-green focus:ring-0 focus:outline-none accent-spotify-green"
                />
                <span className="font-medium">Pause playback in Gaming Mode</span>
              </label>
              <VolumeX className="w-3.5 h-3.5 text-gray-500" />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.resumeSpotifyInChill}
                  onChange={(e) => onUpdate({ resumeSpotifyInChill: e.target.checked })}
                  className="rounded border-gray-600 text-spotify-green focus:ring-0 focus:outline-none accent-spotify-green"
                />
                <span className="font-medium">Auto-resume playback in Chill Mode</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1f2e3d] flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Controls active Spotify player</span>
        </div>
      </div>
    </div>
  )
}

