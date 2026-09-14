import { useEffect, useState } from 'react';
import type { Settings } from '../types';
import { listVoices, onVoicesChanged, pickIndianBoyVoice, sortedVoices, speak, speechSupported } from '../lib/speech';
import { defaultSettings, type LocalAccount } from '../lib/storage';
import { languageNames, translate } from '../lib/i18n';
import type { AppLanguage } from '../types';

interface Props {
  accounts: LocalAccount[];
  activeAccountId: string;
  settings: Settings;
  /** How many times the app has been opened on this device. */
  visits: number;
  onChange: (settings: Settings) => void;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onSwitchAccount: (accountId: string) => void;
  onCreateAccount: (name: string) => void;
  onDeleteAccount: () => void;
}

export function SettingsPanel({
  accounts,
  activeAccountId,
  settings,
  visits,
  onChange,
  onClose,
  onExport,
  onImport,
  onReset,
  onSwitchAccount,
  onCreateAccount,
  onDeleteAccount,
}: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(listVoices());
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    const update = () => setVoices(listVoices());
    update();
    return onVoicesChanged(update);
  }, []);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => onChange({ ...settings, [key]: value });

  const setLanguage = (language: AppLanguage) =>
    onChange({ ...settings, language, voiceURI: null, autoGrammar: language === 'en' });

  /** Indian English voice, raised pitch and a calmer speed for a young boy. */
  const useIndianBoyVoice = () =>
    onChange({
      ...settings,
      voiceURI: pickIndianBoyVoice(voices)?.voiceURI ?? null,
      pitch: 1.4,
      rate: 0.9,
    });

  /** Puts speech back to the device default when a saved voice or volume has silenced the app. */
  const fixSound = () => {
    const fixed: Settings = {
      ...settings,
      voiceURI: null,
      rate: defaultSettings.rate,
      pitch: defaultSettings.pitch,
      volume: 1,
    };
    onChange(fixed);
    speak('Sound is working now.', fixed);
  };

  return (
    <aside className="settings-panel" aria-label="Settings">
      <header>
        <h2>Settings</h2>
        <button type="button" onClick={onClose} aria-label="Close settings">
          ✕
        </button>
      </header>

      <section className="profile-settings" aria-labelledby="profile-heading">
        <h3 id="profile-heading">Local user profile</h3>
        <label>
          Current profile
          <select value={activeAccountId} onChange={(event) => onSwitchAccount(event.target.value)}>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        <div className="profile-create">
          <input
            type="text"
            value={newProfileName}
            placeholder="New profile name"
            aria-label="New profile name"
            onChange={(event) => setNewProfileName(event.target.value)}
          />
          <button
            type="button"
            disabled={!newProfileName.trim()}
            onClick={() => {
              onCreateAccount(newProfileName);
              setNewProfileName('');
            }}
          >
            ➕ Add profile
          </button>
        </div>
        <button type="button" className="danger" disabled={accounts.length <= 1} onClick={onDeleteAccount}>
          Delete current profile
        </button>
        <p className="settings-note">Each profile keeps separate settings and vocabulary on this device.</p>
      </section>

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
        Language / Idioma / భాష
        <select value={settings.language} onChange={(event) => setLanguage(event.target.value as AppLanguage)}>
          {Object.entries(languageNames).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <label>
        AI talk buddy key (Google Gemini)
        <input
          type="password"
          value={settings.aiKey}
          placeholder="paste key, or leave empty"
          autoComplete="off"
          onChange={(event) => set('aiKey', event.target.value.trim())}
        />
      </label>
      <p className="settings-note">
        With a key the buddy answers freely instead of using set questions. Get a free key at
        aistudio.google.com/apikey. It is kept on this device only, and the buddy still works without it.
      </p>

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

      <button
        type="button"
        onClick={() =>
          speak(translate('hello', settings.language), settings)
        }
      >
        🔊 Test voice
      </button>

      <button type="button" onClick={fixSound}>
        🛠️ Fix sound (reset voice)
      </button>

      {!speechSupported && <p className="settings-note warn">This browser cannot speak. Try Safari or Chrome.</p>}
      {speechSupported && voices.length === 0 && (
        <p className="settings-note warn">No voices installed on this device yet — download an English voice in the device settings.</p>
      )}
      {settings.volume === 0 && <p className="settings-note warn">Volume is at 0%, so nothing will be heard.</p>}

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
