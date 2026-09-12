import { describe, expect, it } from 'vitest';
import { pickIndianBoyVoice, sortedVoices } from './speech';

const voice = (name: string, lang: string): SpeechSynthesisVoice => ({
  name,
  lang,
  voiceURI: name,
  default: false,
  localService: true,
});

const voices = [
  voice('Samantha', 'en-US'),
  voice('Veena', 'en-IN'),
  voice('Rishi', 'en-IN'),
  voice('Daniel', 'en-GB'),
];

describe('pickIndianBoyVoice', () => {
  it('prefers an Indian English male voice', () => {
    expect(pickIndianBoyVoice(voices)?.name).toBe('Rishi');
  });

  it('falls back to any Indian English voice', () => {
    expect(pickIndianBoyVoice([voices[0], voices[1]])?.name).toBe('Veena');
  });

  it('falls back to another English voice when none is Indian', () => {
    expect(pickIndianBoyVoice([voices[0], voices[3]])?.name).toBe('Daniel');
  });

  it('returns nothing when the device has no voices', () => {
    expect(pickIndianBoyVoice([])).toBeUndefined();
  });
});

describe('sortedVoices', () => {
  it('lists Indian English voices first', () => {
    expect(sortedVoices(voices).map((v) => v.name)).toEqual(['Rishi', 'Veena', 'Daniel', 'Samantha']);
  });
});
