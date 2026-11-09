import { memo } from 'react'
import { TitleBar } from './components/TitleBar'
import { ModeIndicator } from './components/ModeIndicator'
import { VolumeSliders } from './components/VolumeSliders'
import { HotkeyConfig } from './components/HotkeyConfig'
import { SpotifyAuth } from './components/SpotifyAuth'
import { ProcessStatus } from './components/ProcessStatus'
import { useSpikeDropDashboard } from './hooks/useSpikeDropDashboard'
import { ShieldCheck, AlertTriangle } from 'lucide-react'

export const App = memo(function App() {
  const {
    settings,
    mode,
    isToggling,
    valorantStatus,
    spotifyStatus,
    audioSessions,
    toggleMode,
    updateSettings,
    updateHotkey,
    connectSpotify,
    disconnectSpotify,
    refreshStatuses
  } = useSpikeDropDashboard()

  if (!settings) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="h-screen w-screen bg-theme-base flex items-center justify-center text-theme-text-muted"
      >
        Loading SpikeDrop...
      </div>
    )
  }

  const isBrowserPreview = window.api?.isElectron === false

  return (
    <div className="flex flex-col h-screen bg-theme-base text-theme-text-main selection:bg-theme-primary selection:text-white">
      <TitleBar />

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Browser sandbox warning notification */}
        {isBrowserPreview && (
          <aside
            role="alert"
            className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex items-start gap-3 text-amber-300 text-sm shadow-lg"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-bold text-amber-200">
                You are viewing SpikeDrop inside a Web Browser / VS Code Preview
              </div>
              <p className="text-theme-text-body mt-1 leading-relaxed">
                SpikeDrop is a <strong>Windows desktop application</strong>. Operating system features
                (Valorant Windows mixer control, global fullscreen{' '}
                <kbd className="px-1.5 py-0.5 bg-theme-surface-elevated border border-theme-border-focus rounded text-theme-text-body font-mono font-bold">
                  {settings.hotkey}
                </kbd>{' '}
                hotkey, and Spotify integration) run in the <strong>standalone SpikeDrop desktop window</strong>.
              </p>
              <p className="text-amber-400 font-semibold mt-1">
                👉 Switch to the SpikeDrop window on your Windows Taskbar or system tray!
              </p>
            </div>
          </aside>
        )}

        {/* Active Mode Visual Indicator */}
        <ModeIndicator
          mode={mode}
          hotkey={settings.hotkey}
          spotifyGamingVolume={settings.spotifyGamingVolume}
          pauseSpotifyInGaming={settings.pauseSpotifyInGaming}
          onToggle={() => void toggleMode()}
          isToggling={isToggling}
        />

        {/* Game Status & Detection */}
        <ProcessStatus
          status={valorantStatus}
          sessions={audioSessions}
          onRefresh={() => void refreshStatuses()}
        />

        {/* Volume Sliders for Valorant and Spotify */}
        <VolumeSliders
          settings={settings}
          onUpdate={(updates) => void updateSettings(updates)}
        />

        {/* Global Hotkey Config */}
        <HotkeyConfig
          hotkey={settings.hotkey}
          onUpdateHotkey={updateHotkey}
        />

        {/* Spotify OAuth & Player Connect */}
        <SpotifyAuth
          status={spotifyStatus}
          clientId={settings.spotifyClientId}
          onUpdateClientId={(id) => void updateSettings({ spotifyClientId: id })}
          onConnect={connectSpotify}
          onDisconnect={disconnectSpotify}
          onRefreshStatus={() => void refreshStatuses()}
        />

        {/* Preferences & Vanguard Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-4 text-sm text-theme-text-muted border-t border-theme-border-subtle">
          <div className="flex items-center gap-2 text-xs text-theme-text-dim">
            <ShieldCheck className="w-4 h-4 text-theme-success" aria-hidden="true" />
            <span>
              100% Vanguard Safe: Adjusts Windows Volume Mixer (WASAPI) with zero game memory injection.
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-theme-text-muted hover:text-white select-none">
            <input
              type="checkbox"
              checked={settings.minimizeToTray}
              onChange={(e) => void updateSettings({ minimizeToTray: e.target.checked })}
              className="rounded accent-[var(--color-primitive-valorant-red)]"
            />
            <span>Minimize to System Tray on close</span>
          </label>
        </footer>
      </main>
    </div>
  )
})
export default App
