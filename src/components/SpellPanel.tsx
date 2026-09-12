import { useState } from 'react';

interface Props {
  onSubmit: (text: string) => void;
  onSpeak: (text: string) => void;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIGITS = '0123456789'.split('');

export function SpellPanel({ onSubmit, onSpeak }: Props) {
  const [text, setText] = useState('');

  const append = (char: string) => setText((current) => current + char);

  return (
    <div className="spell-panel">
      <div className="spell-display">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or tap letters…"
          aria-label="Spelled text"
        />
        <button type="button" onClick={() => onSpeak(text)} disabled={!text.trim()}>
          🔊 Say
        </button>
        <button
          type="button"
          onClick={() => {
            if (!text.trim()) return;
            onSubmit(text.trim());
            setText('');
          }}
          disabled={!text.trim()}
        >
          ➕ Add to sentence
        </button>
      </div>
      <div className="keyboard">
        {LETTERS.map((letter) => (
          <button key={letter} type="button" onClick={() => append(letter.toLowerCase())}>
            {letter}
          </button>
        ))}
        {DIGITS.map((digit) => (
          <button key={digit} type="button" onClick={() => append(digit)}>
            {digit}
          </button>
        ))}
        <button type="button" onClick={() => append(' ')}>
          space
        </button>
        <button type="button" onClick={() => setText((current) => current.slice(0, -1))}>
          ⌫
        </button>
        <button type="button" onClick={() => setText('')}>
          clear
        </button>
      </div>
    </div>
  );
}
