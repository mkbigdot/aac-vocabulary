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

export function TalkBuddy({ settings, onAnswer }: Props) {
  const name = settings.childName.trim();
  const [prompts] = useState<BuddyPrompt[]>(() => promptsFor(timeOfDay(new Date().getHours())));
  const [index, setIndex] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [mood, setMood] = useState<Mood>('idle');
  const stopListening = useRef<(() => void) | null>(null);
  const lastSpoken = useRef('');

  const prompt = prompts[index % prompts.length];

  const say = useCallback(
    (text: string) => {
      stopListening.current?.();
      lastSpoken.current = text;
      setMood('talking');
      setTurns((current) => [...current, { who: 'buddy', text }]);
      speak(text, settings, () => setMood('idle'));
    },
    [settings],
  );

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const time = timeOfDay(new Date().getHours());
    say(`${greeting(time, name)} ${prompts[0].text}`);
  }, [name, prompts, say]);

  useEffect(
    () => () => {
      stopListening.current?.();
      stopSpeaking();
    },
    [],
  );

  const answer = (text: string) => {
    stopListening.current?.();
    onAnswer(text);
    const next = (index + 1) % prompts.length;
    const reply = `${replyTo(prompt, text, name)} ${prompts[next].text}`;
    lastSpoken.current = reply;
    setTurns((current) => [...current, { who: 'child', text }, { who: 'buddy', text: reply }]);
    setMood('happy');
    speak(reply, settings, () => setMood('idle'));
    setIndex(next);
  };

  const listen = () => {
    if (mood === 'listening') {
      stopListening.current?.();
      return;
    }
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
        <button type="button" onClick={() => say(prompt.text)}>
          🔁 Ask again
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
            say(prompts[next].text);
          }}
        >
          ⏭️ Next question
        </button>
      </div>
    </section>
  );
}
