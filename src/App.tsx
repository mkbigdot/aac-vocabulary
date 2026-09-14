import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { Board } from './components/Board';
import { EndingBar } from './components/EndingBar';
import { SentenceBar } from './components/SentenceBar';
import { SettingsPanel } from './components/SettingsPanel';
import { SpellPanel } from './components/SpellPanel';
import { TalkBuddy } from './components/TalkBuddy';
import { WordEditor } from './components/WordEditor';
import { defaultCategories } from './data/categories';
import { CORE_COLUMNS, coreWords } from './data/core';
import { correctSentence } from './lib/grammar';
import { localizeCategory, localizeWord, uiText } from './lib/i18n';
import { applyEnding, type Ending } from './lib/morphology';
import { moveInOrder, sortByOrder } from './lib/order';
import { useDragReorder } from './lib/useDragReorder';
import { useFittingColumns } from './lib/useFittingColumns';
import { speak, speechSupported, stopSpeaking } from './lib/speech';
import { emptyState, exportState, importState, loadState, saveState, type PersistedState } from './lib/storage';
import type { Category, PartOfSpeech, SentenceItem, Word } from './types';

const CORE_ID = 'core';
const RECENT_LIMIT = 24;

type View =
  | { kind: 'core' }
  | { kind: 'category'; id: string }
  | { kind: 'recent' }
  | { kind: 'spell' }
  | { kind: 'buddy' };

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

  const counted = useRef(false);
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    setState((current) => ({ ...current, visits: current.visits + 1 }));
  }, []);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', settings.highContrast);
  }, [settings.highContrast]);

  useEffect(() => {
    const rtl = settings.language === 'ar' || settings.language === 'ur';
    document.documentElement.lang = settings.language;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    return () => {
      document.documentElement.dir = 'ltr';
    };
  }, [settings.language]);

  const categories: Category[] = useMemo(() => {
    const hidden = new Set(state.hiddenWordIds);
    const withCustom = (category: Category): Category => ({
      ...category,
      words: sortByOrder(
        [...category.words, ...(state.customWords[category.id] ?? [])].filter((word) => !hidden.has(word.id)),
        state.wordOrder[category.id],
      ),
    });
    return sortByOrder([...defaultCategories, ...state.customCategories], state.categoryOrder)
      .map(withCustom)
      .map((category) => localizeCategory(category, settings.language));
  }, [settings.language, state.categoryOrder, state.customCategories, state.customWords, state.hiddenWordIds, state.wordOrder]);

  const core: Word[] = useMemo(() => {
    const hidden = new Set(state.hiddenWordIds);
    const name = settings.childName.trim();
    const nameWord: Word[] = name ? [{ id: 'child-name', label: name, symbol: '🧒', pos: 'noun' }] : [];
    return sortByOrder(
      [...nameWord, ...coreWords, ...(state.customWords[CORE_ID] ?? [])].filter((word) => !hidden.has(word.id)),
      state.wordOrder[CORE_ID],
    ).map((word) => localizeWord(word, settings.language));
  }, [settings.childName, settings.language, state.customWords, state.hiddenWordIds, state.wordOrder]);

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
  const spokenText = settings.autoGrammar && settings.language === 'en' ? correctSentence(sentence) : plainText;

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

  const columns = useFittingColumns(view.kind === 'core' && !query ? CORE_COLUMNS : settings.columns);

  const currentCategoryId = view.kind === 'category' ? view.id : CORE_ID;

  const reorderCategories = (fromId: string, toId: string) =>
    setState((current) => ({
      ...current,
      categoryOrder: moveInOrder(
        categories.map((category) => category.id),
        fromId,
        toId,
      ),
    }));

  const categoryDrag = useDragReorder(editMode, 'category-id', reorderCategories);

  const reorderWords = (fromId: string, toId: string) =>
    setState((current) => ({
      ...current,
      wordOrder: {
        ...current.wordOrder,
        [currentCategoryId]: moveInOrder(
          boardWords.map((word) => word.id),
          fromId,
          toId,
        ),
      },
    }));

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
        greeting={settings.childName.trim()}
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
          🗣️ {uiText('core', settings.language)}
        </button>
        <button
          type="button"
          className={view.kind === 'recent' ? 'active' : ''}
          onClick={() => {
            setQuery('');
            setView({ kind: 'recent' });
          }}
        >
          🕘 {uiText('recent', settings.language)}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={[
              view.kind === 'category' && view.id === category.id ? 'active' : '',
              categoryDrag.dragId === category.id ? 'dragging' : '',
              categoryDrag.dragId && categoryDrag.overId === category.id ? 'over' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            {...categoryDrag.handlers(category.id)}
            onClick={() => {
              if (editMode && categoryDrag.wasDragged()) return;
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
          🔤 {uiText('spell', settings.language)}
        </button>
        {settings.language === 'en' && (
          <button
            type="button"
            className={view.kind === 'buddy' ? 'active' : ''}
            onClick={() => {
              setQuery('');
              setView({ kind: 'buddy' });
            }}
          >
            🤖 Buddy
          </button>
        )}
        <input
          className="search"
          type="search"
          value={query}
          placeholder={uiText('search', settings.language)}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="button"
          className={editMode ? 'active' : ''}
          title="Add, edit or drag buttons and tabs into the order you want"
          onClick={() => setEditMode((on) => !on)}
        >
          ✏️ {uiText('edit', settings.language)}
        </button>
        <button type="button" onClick={() => setSettingsOpen(true)}>
          ⚙️ {uiText('settings', settings.language)}
        </button>
      </nav>

      {settings.language === 'en' && <EndingBar disabled={sentence.length === 0} onApply={handleEnding} />}

      <main>
        {!speechSupported && (
          <p className="warning">This browser has no speech synthesis, so words cannot be spoken aloud.</p>
        )}
        {view.kind === 'buddy' && !query ? (
          <TalkBuddy
            settings={settings}
            onAnswer={(text) =>
              setSentence((current) => [
                ...current,
                {
                  key: `buddy-${Date.now()}-${current.length}`,
                  word: { id: `buddy:${Date.now()}`, label: text, symbol: '💬', pos: 'noun' },
                },
              ])
            }
          />
        ) : view.kind === 'spell' && !query ? (
          <SpellPanel
            onSpeak={speakText}
            onSubmit={(text) =>
              addWordToSentence({ id: `spelled:${Date.now()}`, label: text, symbol: '🔤', pos: 'noun' })
            }
          />
        ) : (
          <Board
            words={boardWords}
            columns={columns}
            settings={settings}
            categoryColor={activeCategory?.color}
            editMode={editMode && !query}
            onSelect={addWordToSentence}
            onEdit={(word) => setEditing({ categoryId: currentCategoryId, word })}
            onRemove={(word) => removeWord(currentCategoryId, word)}
            onAdd={() => setEditing({ categoryId: currentCategoryId, word: null })}
            onReorder={view.kind === 'core' || view.kind === 'category' ? reorderWords : undefined}
          />
        )}
        {boardWords.length === 0 && view.kind !== 'spell' && view.kind !== 'buddy' && (
          <p className="empty">{query ? `No words match “${query}”.` : 'No words here yet.'}</p>
        )}
      </main>

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          visits={state.visits}
          onChange={(next) => {
            if (next.language !== settings.language) {
              setSentence([]);
              setQuery('');
              setView({ kind: 'core' });
            }
            setState((current) => ({ ...current, settings: next }));
          }}
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
