import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buddyFace,
  followUp,
  greeting,
  isEcho,
  promptsFor,
  replyTo,
  timeOfDay,
  type BuddyPrompt,
} from '../lib/buddy';
import { aiTurn } from '../lib/ai';
import { listenOnce, listeningSupported } from '../lib/listen';
import { speak, stopSpeaking } from '../lib/speech';
import type { Settings } from '../types';

interface Props {
  settings: Settings;
  /** Sends the child's answer to the sentence bar so it can be edited and spoken again. */
  onAnswer: (text: string) => void;
}

type Mood = 'idle' | 'talking' | 'listening' | 'happy';

interface Turn {
  who: 'buddy' | 'child';
  text: string;
}

/** Calm speed for the buddy, whatever speed is set for reading sentences aloud. */
const SLOW = 0.75;
/** Silence between two things the buddy says, so a child has time to take it in. */
const PAUSE_MS = 1200;
/** Answers to offer when the AI buddy forgets to suggest any. */
const FALLBACK_CHIPS = ['yes', 'no', 'a little', 'I do not know'];

export function TalkBuddy({ settings, onAnswer }: Props) {
  const name = settings.childName.trim();
  const [prompts] = useState<BuddyPrompt[]>(() => promptsFor(timeOfDay(new Date().getHours())));
  const [index, setIndex] = useState(0);
  const [topic, setTopic] = useState<BuddyPrompt | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [mood, setMood] = useState<Mood>('idle');
  const [muted, setMuted] = useState(false);
  const [thinking, setThinking] = useState(false);
  const history = useRef<Turn[]>([]);
  const mutedNow = useRef(false);
  const stopListening = useRef<(() => void) | null>(null);
  const lastSpoken = useRef('');
  const pause = useRef<number | undefined>(undefined);

  const prompt = topic ?? prompts[index % prompts.length];

  /** Says each line in turn, waiting for the one before it to finish plus a pause. */
  const say = useCallback(
    (lines: string[]) => {
      stopListening.current?.();
      window.clearTimeout(pause.current);
      lastSpoken.current = lines.join(' ');
      const spoken = lines.map((text): Turn => ({ who: 'buddy', text }));
      history.current = [...history.current, ...spoken];
      setTurns((current) => [...current, ...spoken]);
      if (mutedNow.current) {
        setMood('idle');
        return;
      }
      setMood('talking');
      const slow = { ...settings, rate: Math.min(settings.rate, SLOW) };
      const next = (position: number) => {
        if (position >= lines.length) {
          setMood('idle');
          return;
        }
        speak(lines[position], slow, () => {
          pause.current = window.setTimeout(() => next(position + 1), PAUSE_MS);
        });
      };
      next(0);
    },
    [settings],
  );

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    say([greeting(timeOfDay(new Date().getHours()), name), prompts[0].text]);
  }, [name, prompts, say]);

  useEffect(
    () => () => {
      stopListening.current?.();
      window.clearTimeout(pause.current);
      stopSpeaking();
    },
    [],
  );

  /** The offline buddy: a written reply, then either a follow up or the next question. */
  const scripted = (asked: BuddyPrompt, text: string) => {
    const more = followUp(asked, text);
    if (more) {
      setTopic(more);
      say([replyTo(asked, text, name), more.text]);
      return;
    }
    const next = (index + 1) % prompts.length;
    setTopic(null);
    setIndex(next);
    say([replyTo(asked, text, name), prompts[next].text]);
  };

  const answer = (text: string) => {
    stopListening.current?.();
    onAnswer(text);
    history.current = [...history.current, { who: 'child', text }];
    setTurns((current) => [...current, { who: 'child', text }]);
    setMood('happy');
    if (settings.aiKey.trim()) {
      setThinking(true);
      const asked = prompt;
      aiTurn(settings.aiKey, name, history.current.slice(0, -1), text)
        .then((turn) => {
          if (!turn) {
            scripted(asked, text);
            return;
          }
          setTopic({ id: 'ai', text: turn.question, chips: turn.chips.length ? turn.chips : FALLBACK_CHIPS });
          say([turn.reply, turn.question]);
        })
        .finally(() => setThinking(false));
      return;
    }
    scripted(prompt, text);
  };

  const mute = (on: boolean) => {
    mutedNow.current = on;
    setMuted(on);
    if (on) {
      window.clearTimeout(pause.current);
      stopSpeaking();
      setMood((current) => (current === 'talking' ? 'idle' : current));
    } else {
      say([prompt.text]);
    }
  };

  const listen = () => {
    if (mood === 'listening') {
      stopListening.current?.();
      return;
    }
    window.clearTimeout(pause.current);
    stopSpeaking();
    setMood('listening');
    stopListening.current = listenOnce(
      (heard) => {
        if (isEcho(heard, lastSpoken.current)) return;
        answer(heard);
      },
      () => setMood((current) => (current === 'listening' ? 'idle' : current)),
    );
  };

  return (
    <section className="buddy" aria-label="Talk buddy">
      <div className={`buddy-face ${mood}`} aria-hidden="true">
        {buddyFace(mood)}
      </div>

      <div className="buddy-chat" aria-live="polite">
        {turns.slice(-6).map((turn, position) => (
          <p key={`${turn.who}-${position}-${turn.text}`} className={`buddy-line ${turn.who}`}>
            {turn.text}
          </p>
        ))}
        {thinking && <p className="buddy-line buddy">…</p>}
      </div>

      <div className="buddy-chips">
        {prompt.chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="buddy-chip"
            disabled={thinking}
            onClick={() => answer(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="buddy-actions">
        <button type="button" disabled={thinking} onClick={() => say([prompt.text])}>
          🔁 Ask again
        </button>
        <button
          type="button"
          className={muted ? 'active' : ''}
          onClick={() => mute(!muted)}
        >
          {muted ? '🔇 Muted' : '🔊 Voice on'}
        </button>
        {listeningSupported && (
          <button
            type="button"
            className={mood === 'listening' ? 'active' : ''}
            disabled={mood === 'talking' || thinking}
            onClick={listen}
          >
            {mood === 'listening' ? '⏹️ Stop' : '🎤 Talk to me'}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            const next = (index + 1) % prompts.length;
            setTopic(null);
            setIndex(next);
            say([prompts[next].text]);
          }}
        >
          ⏭️ Next question
        </button>
      </div>
    </section>
  );
}
