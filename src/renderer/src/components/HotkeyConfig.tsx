import React, { useState, useEffect } from 'react'
import { Keyboard, Check, AlertCircle } from 'lucide-react'

interface HotkeyConfigProps {
  hotkey: string
  onUpdateHotkey: (newHotkey: string) => Promise<boolean>
}

const PRESET_HOTKEYS = ['F8', 'Alt+\\', 'F7', 'F9', 'F10', 'Ctrl+Shift+S', 'Alt+M']

export const HotkeyConfig: React.FC<HotkeyConfigProps> = ({ hotkey, onUpdateHotkey }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [currentKeys, setCurrentKeys] = useState<string[]>([])
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isRecording) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Ignore lone modifier keys
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return
      }

      const parts: string[] = []
      if (e.ctrlKey) parts.push('Ctrl')
      if (e.altKey) parts.push('Alt')
      if (e.shiftKey) parts.push('Shift')
      if (e.metaKey) parts.push('Super')

      let keyName = e.key
      if (keyName.length === 1) {
        keyName = keyName.toUpperCase()
      } else if (keyName.toLowerCase().startsWith('f') && keyName.length <= 3) {
        keyName = keyName.toUpperCase()
      } else if (keyName === ' ') {
        keyName = 'Space'
      }

      parts.push(keyName)
      const combined = parts.join('+')

      setIsRecording(false)
      handleSave(combined)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRecording])

  const handleSave = async (keyCombination: string) => {
    setErrorMsg(null)
    const ok = await onUpdateHotkey(keyCombination)
    if (ok) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } else {
      setErrorMsg(`Failed to register ${keyCombination}. It may be reserved by Windows or another app.`)
    }
  }

  return (
    <div className="bg-[#131d27] border border-[#1f2e3d] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-valorant-red" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Global Hotkey
          </h3>
        </div>
        <span className="text-[10px] text-gray-400">Works in Fullscreen Game</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isRecording ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-valorant-red/10 border border-valorant-red text-valorant-red rounded-lg font-mono text-sm animate-pulse">
              <span>Press any key combination...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 bg-[#0e161e] border border-[#1f2e3d] rounded-lg font-mono text-base font-bold text-white shadow-inner">
                {hotkey}
              </span>
              <button
                type="button"
                onClick={() => setIsRecording(true)}
                className="px-3 py-2 bg-[#1b2733] hover:bg-[#253648] text-xs font-semibold rounded-lg text-gray-200 transition-colors"
              >
                Record Keybind
              </button>
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center gap-1 text-xs text-spotify-green">
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </div>
          )}
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-500 mr-1">Presets:</span>
          {PRESET_HOTKEYS.map((preset) => (
            <button
              key={preset}
              onClick={() => handleSave(preset)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                hotkey === preset
                  ? 'bg-valorant-red text-white font-bold'
                  : 'bg-[#0e161e] hover:bg-[#1a2836] text-gray-400 hover:text-white border border-[#1f2e3d]'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-2 text-xs text-valorant-red flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  )
}

