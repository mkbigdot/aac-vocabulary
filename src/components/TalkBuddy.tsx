import { useCallback, useEffect, useRef, useState } from 'react';
import { buddyFace, greeting, isEcho, promptsFor, replyTo, timeOfDay, type BuddyPrompt } from '../lib/buddy';
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

export function TalkBuddy({ settings, onAnswer }: Props) {
  const name = settings.childName.trim();
  const [prompts] = useState<BuddyPrompt[]>(() => promptsFor(timeOfDay(new Date().getHours())));
  const [index, setIndex] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [mood, setMood] = useState<Mood>('idle');
  const [muted, setMuted] = useState(false);
  const mutedNow = useRef(false);
  const stopListening = useRef<(() => void) | null>(null);
  const lastSpoken = useRef('');
  const pause = useRef<number | undefined>(undefined);

  const prompt = prompts[index % prompts.length];

  /** Says each line in turn, waiting for the one before it to finish plus a pause. */
  const say = useCallback(
    (lines: string[]) => {
      stopListening.current?.();
      window.clearTimeout(pause.current);
      lastSpoken.current = lines.join(' ');
      setTurns((current) => [...current, ...lines.map((text): Turn => ({ who: 'buddy', text }))]);
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

  const answer = (text: string) => {
    stopListening.current?.();
    onAnswer(text);
    const next = (index + 1) % prompts.length;
    setTurns((current) => [...current, { who: 'child', text }]);
    setMood('happy');
    say([replyTo(prompt, text, name), prompts[next].text]);
    setIndex(next);
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
      </div>

      <div className="buddy-chips">
        {prompt.chips.map((chip) => (
          <button key={chip} type="button" className="buddy-chip" onClick={() => answer(chip)}>
            {chip}
          </button>
        ))}
      </div>

      <div className="buddy-actions">
        <button type="button" onClick={() => say([prompt.text])}>
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
            disabled={mood === 'talking'}
            onClick={listen}
          >
            {mood === 'listening' ? '⏹️ Stop' : '🎤 Talk to me'}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            const next = (index + 1) % prompts.length;
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
