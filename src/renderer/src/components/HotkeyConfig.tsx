import { memo } from 'react'
import { Keyboard, Check, AlertCircle } from 'lucide-react'
import { useHotkeyRecorder } from '../hooks/useHotkeyRecorder'
import { cn } from '../lib/utils'

export interface HotkeyConfigProps {
  hotkey: string
  onUpdateHotkey: (newHotkey: string) => Promise<boolean>
}

const PRESET_HOTKEYS = ['F8', 'Alt+\\', 'F7', 'F9', 'F10', 'Ctrl+Shift+S', 'Alt+M'] as const

export const HotkeyConfig = memo(function HotkeyConfig({
  hotkey,
  onUpdateHotkey
}: HotkeyConfigProps) {
  const {
    isRecording,
    saveSuccess,
    errorMessage,
    startRecording,
    applyHotkey
  } = useHotkeyRecorder({
    currentHotkey: hotkey,
    onSave: onUpdateHotkey
  })

  return (
    <section aria-labelledby="hotkey-config-heading" className="bg-theme-surface border border-theme-border-default rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-theme-primary" aria-hidden="true" />
          <h3 id="hotkey-config-heading" className="text-base font-bold text-white tracking-wide uppercase">
            Global Hotkey
          </h3>
        </div>
        <span className="text-2xs text-theme-text-muted">Works in Fullscreen Game</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isRecording ? (
            <div
              role="status"
              aria-live="assertive"
              className="flex items-center gap-2 px-4 py-2 bg-theme-primary/10 border border-theme-primary text-theme-primary rounded-lg font-mono text-base animate-pulse"
            >
              <span>Press any key combination (or Esc to cancel)...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 bg-theme-inset border border-theme-border-default rounded-lg font-mono text-lg font-bold text-white shadow-inner">
                {hotkey}
              </span>
              <button
                type="button"
                onClick={startRecording}
                className="px-3 py-2 bg-theme-surface-elevated hover:bg-theme-surface-hover text-sm font-semibold rounded-lg text-theme-text-body transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-primary"
              >
                Record Keybind
              </button>
            </div>
          )}

          {saveSuccess && (
            <div role="status" className="flex items-center gap-1 text-sm text-theme-success animate-fade-in">
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm text-theme-text-dim mr-1">Presets:</span>
          {PRESET_HOTKEYS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => void applyHotkey(preset)}
              className={cn(
                'px-2 py-1 text-sm font-mono rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-theme-primary',
                hotkey === preset
                  ? 'bg-theme-primary text-white font-bold'
                  : 'bg-theme-inset hover:bg-theme-surface-elevated text-theme-text-muted hover:text-white border border-theme-border-default'
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="mt-2 text-sm text-theme-primary flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </section>
  )
})
