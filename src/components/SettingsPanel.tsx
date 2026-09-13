import { useEffect, useState } from 'react';
import type { Settings } from '../types';
import { listVoices, onVoicesChanged, pickIndianBoyVoice, sortedVoices, speak } from '../lib/speech';

interface Props {
  settings: Settings;
  /** How many times the app has been opened on this device. */
  visits: number;
  onChange: (settings: Settings) => void;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

export function SettingsPanel({ settings, visits, onChange, onClose, onExport, onImport, onReset }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(listVoices());

  useEffect(() => {
    const update = () => setVoices(listVoices());
    update();
    return onVoicesChanged(update);
  }, []);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => onChange({ ...settings, [key]: value });

  /** Indian English voice, raised pitch and a calmer speed for a young boy. */
  const useIndianBoyVoice = () =>
    onChange({
      ...settings,
      voiceURI: pickIndianBoyVoice(voices)?.voiceURI ?? null,
      pitch: 1.4,
      rate: 0.9,
    });

  return (
    <aside className="settings-panel" aria-label="Settings">
      <header>
        <h2>Settings</h2>
        <button type="button" onClick={onClose} aria-label="Close settings">
          ✕
        </button>
      </header>

      <label>
        Child's name
        <input
          type="text"
          value={settings.childName}
          placeholder="e.g. Arjun"
          onChange={(event) => set('childName', event.target.value)}
        />
      </label>

      <label>
        Voice
        <select value={settings.voiceURI ?? ''} onChange={(event) => set('voiceURI', event.target.value || null)}>
          <option value="">Device default</option>
          {sortedVoices(voices).map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </label>

      <label>
        Speed: {settings.rate.toFixed(2)}
        <input
          type="range"
          min={0.5}
          max={1.6}
          step={0.05}
          value={settings.rate}
          onChange={(event) => set('rate', Number(event.target.value))}
        />
      </label>

      <label>
        Pitch: {settings.pitch.toFixed(1)}
        <input
          type="range"
          min={0.5}
          max={1.8}
          step={0.1}
          value={settings.pitch}
          onChange={(event) => set('pitch', Number(event.target.value))}
        />
      </label>

      <label>
        Volume: {Math.round(settings.volume * 100)}%
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.volume}
          onChange={(event) => set('volume', Number(event.target.value))}
        />
      </label>

      <button type="button" onClick={useIndianBoyVoice}>
        🧒 Indian boy voice
      </button>

      <button type="button" onClick={() => speak('Hello, this is my voice.', settings)}>
        🔊 Test voice
      </button>

      <label>
        Buttons per row: {settings.columns}
        <input
          type="range"
          min={4}
          max={14}
          step={1}
          value={settings.columns}
          onChange={(event) => set('columns', Number(event.target.value))}
        />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={settings.speakOnTap}
          onChange={(event) => set('speakOnTap', event.target.checked)}
        />
        Speak each word when tapped
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={settings.autoGrammar}
          onChange={(event) => set('autoGrammar', event.target.checked)}
        />
        Fix grammar when speaking
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={settings.showLabels}
          onChange={(event) => set('showLabels', event.target.checked)}
        />
        Show text labels
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={settings.colorByPartOfSpeech}
          onChange={(event) => set('colorByPartOfSpeech', event.target.checked)}
        />
        Colour buttons by word type
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={settings.highContrast}
          onChange={(event) => set('highContrast', event.target.checked)}
        />
        High contrast mode
      </label>

      <hr />

      <button type="button" onClick={onExport}>
        ⬇️ Export my vocabulary
      </button>
      <label className="file-input">
        ⬆️ Import vocabulary
        <input
          type="file"
          accept="application/json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport(file);
            event.target.value = '';
          }}
        />
      </label>
      <button type="button" className="danger" onClick={onReset}>
        Reset everything
      </button>

      <p className="settings-note">
        Opened {visits} {visits === 1 ? 'time' : 'times'} on this device.
      </p>
    </aside>
  );
}
