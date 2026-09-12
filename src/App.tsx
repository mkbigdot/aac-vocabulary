import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { Board } from './components/Board';
import { EndingBar } from './components/EndingBar';
import { SentenceBar } from './components/SentenceBar';
import { SettingsPanel } from './components/SettingsPanel';
import { SpellPanel } from './components/SpellPanel';
import { WordEditor } from './components/WordEditor';
import { defaultCategories } from './data/categories';
import { CORE_COLUMNS, coreWords } from './data/core';
import { correctSentence } from './lib/grammar';
import { applyEnding, type Ending } from './lib/morphology';
import { speak, speechSupported, stopSpeaking } from './lib/speech';
import { emptyState, exportState, importState, loadState, saveState, type PersistedState } from './lib/storage';
import type { Category, PartOfSpeech, SentenceItem, Word } from './types';

const CORE_ID = 'core';
const RECENT_LIMIT = 24;

type View = { kind: 'core' } | { kind: 'category'; id: string } | { kind: 'recent' } | { kind: 'spell' };

export default function App() {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const [sentence, setSentence] = useState<SentenceItem[]>([]);
  const [view, setView] = useState<View>({ kind: 'core' });
  const [query, setQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editing, setEditing] = useState<{ categoryId: string; word: Word | null } | null>(null);

  const { settings } = state;

  useEffect(() => saveState(state), [state]);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', settings.highContrast);
  }, [settings.highContrast]);

  const categories: Category[] = useMemo(() => {
    const hidden = new Set(state.hiddenWordIds);
    const withCustom = (category: Category): Category => ({
      ...category,
      words: [...category.words, ...(state.customWords[category.id] ?? [])].filter((word) => !hidden.has(word.id)),
    });
    return [...defaultCategories, ...state.customCategories].map(withCustom);
  }, [state.customCategories, state.customWords, state.hiddenWordIds]);

  const core: Word[] = useMemo(() => {
    const hidden = new Set(state.hiddenWordIds);
    return [...coreWords, ...(state.customWords[CORE_ID] ?? [])].filter((word) => !hidden.has(word.id));
  }, [state.customWords, state.hiddenWordIds]);

  const allWords: Word[] = useMemo(
    () => [...core, ...categories.flatMap((category) => category.words)],
    [categories, core],
  );

  const recentWords: Word[] = useMemo(() => {
    const byId = new Map(allWords.map((word) => [word.id, word]));
    return state.recentWordIds.map((id) => byId.get(id)).filter((word): word is Word => Boolean(word));
  }, [allWords, state.recentWordIds]);

  const searchResults: Word[] = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return allWords.filter((word) => word.label.toLowerCase().includes(term)).slice(0, 120);
  }, [allWords, query]);

  const activeCategory = view.kind === 'category' ? categories.find((c) => c.id === view.id) : undefined;

  const plainText = sentence.map((item) => item.form ?? item.word.speak ?? item.word.label).join(' ');
  const spokenText = settings.autoGrammar ? correctSentence(sentence) : plainText;

  const speakText = (text: string) => speak(text, settings);

  const addWordToSentence = (word: Word) => {
    if (settings.speakOnTap) speakText(word.speak ?? word.label);
    setSentence((current) => [...current, { key: `${word.id}-${Date.now()}-${current.length}`, word }]);
    setState((current) => ({
      ...current,
      recentWordIds: [word.id, ...current.recentWordIds.filter((id) => id !== word.id)].slice(0, RECENT_LIMIT),
    }));
  };

  const handleEnding = (ending: Ending) => {
    setSentence((current) => {
      if (current.length === 0) return current;
      const last = current[current.length - 1];
      const base = last.form ?? last.word.label;
      return [...current.slice(0, -1), { ...last, form: applyEnding(base, ending) }];
    });
  };

  const saveWord = (values: { label: string; symbol: string; pos: PartOfSpeech; speak?: string }) => {
    if (!editing) return;
    const { categoryId, word } = editing;
    setState((current) => {
      const existing = current.customWords[categoryId] ?? [];
      if (word && word.custom) {
        return {
          ...current,
          customWords: {
            ...current.customWords,
            [categoryId]: existing.map((item) => (item.id === word.id ? { ...item, ...values } : item)),
          },
        };
      }
      const newWord: Word = {
        id: `custom:${categoryId}:${Date.now()}`,
        custom: true,
        ...values,
      };
      return {
        ...current,
        customWords: { ...current.customWords, [categoryId]: [...existing, newWord] },
        hiddenWordIds: word ? [...current.hiddenWordIds, word.id] : current.hiddenWordIds,
      };
    });
    setEditing(null);
  };

  const removeWord = (categoryId: string, word: Word) => {
    setState((current) =>
      word.custom
        ? {
            ...current,
            customWords: {
              ...current.customWords,
              [categoryId]: (current.customWords[categoryId] ?? []).filter((item) => item.id !== word.id),
            },
          }
        : { ...current, hiddenWordIds: [...current.hiddenWordIds, word.id] },
    );
  };

  const currentCategoryId = view.kind === 'category' ? view.id : CORE_ID;

  const boardWords = query.trim()
    ? searchResults
    : view.kind === 'core'
      ? core
      : view.kind === 'category'
        ? (activeCategory?.words ?? [])
        : view.kind === 'recent'
          ? recentWords
          : [];

  return (
    <div className="app">
      <SentenceBar
        items={sentence}
        preview={sentence.length > 0 && spokenText !== plainText ? spokenText : ''}
        onSpeak={() => speakText(spokenText)}
        onBackspace={() => setSentence((current) => current.slice(0, -1))}
        onClear={() => {
          stopSpeaking();
          setSentence([]);
        }}
        onRemove={(key) => setSentence((current) => current.filter((item) => item.key !== key))}
      />

      <nav className="nav-bar">
        <button
          type="button"
          className={view.kind === 'core' && !query ? 'active' : ''}
          onClick={() => {
            setQuery('');
            setView({ kind: 'core' });
          }}
        >
          🗣️ Core
        </button>
        <button
          type="button"
          className={view.kind === 'recent' ? 'active' : ''}
          onClick={() => {
            setQuery('');
            setView({ kind: 'recent' });
          }}
        >
          🕘 Recent
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={view.kind === 'category' && view.id === category.id ? 'active' : ''}
            onClick={() => {
              setQuery('');
              setView({ kind: 'category', id: category.id });
            }}
          >
            <span aria-hidden="true">{category.symbol}</span> {category.name}
          </button>
        ))}
        <button
          type="button"
          className={view.kind === 'spell' ? 'active' : ''}
          onClick={() => {
            setQuery('');
            setView({ kind: 'spell' });
          }}
        >
          🔤 Spell
        </button>
        <input
          className="search"
          type="search"
          value={query}
          placeholder="Search all words…"
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" className={editMode ? 'active' : ''} onClick={() => setEditMode((on) => !on)}>
          ✏️ Edit
        </button>
        <button type="button" onClick={() => setSettingsOpen(true)}>
          ⚙️ Settings
        </button>
      </nav>

      <EndingBar disabled={sentence.length === 0} onApply={handleEnding} />

      <main>
        {!speechSupported && (
          <p className="warning">This browser has no speech synthesis, so words cannot be spoken aloud.</p>
        )}
        {view.kind === 'spell' && !query ? (
          <SpellPanel
            onSpeak={speakText}
            onSubmit={(text) =>
              addWordToSentence({ id: `spelled:${Date.now()}`, label: text, symbol: '🔤', pos: 'noun' })
            }
          />
        ) : (
          <Board
            words={boardWords}
            columns={view.kind === 'core' && !query ? CORE_COLUMNS : settings.columns}
            settings={settings}
            categoryColor={activeCategory?.color}
            editMode={editMode && !query}
            onSelect={addWordToSentence}
            onEdit={(word) => setEditing({ categoryId: currentCategoryId, word })}
            onRemove={(word) => removeWord(currentCategoryId, word)}
            onAdd={() => setEditing({ categoryId: currentCategoryId, word: null })}
          />
        )}
        {boardWords.length === 0 && view.kind !== 'spell' && (
          <p className="empty">{query ? `No words match “${query}”.` : 'No words here yet.'}</p>
        )}
      </main>

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={(next) => setState((current) => ({ ...current, settings: next }))}
          onClose={() => setSettingsOpen(false)}
          onExport={() => {
            const blob = new Blob([exportState(state)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'aac-vocabulary.json';
            link.click();
            URL.revokeObjectURL(url);
          }}
          onImport={async (file) => {
            try {
              setState(importState(await file.text()));
            } catch {
              alert('That file could not be read as an AAC vocabulary export.');
            }
          }}
          onReset={() => {
            if (confirm('Reset all custom words and settings?')) setState(emptyState);
          }}
        />
      )}

      {editing && <WordEditor word={editing.word} onSave={saveWord} onCancel={() => setEditing(null)} />}
    </div>
  );
}
