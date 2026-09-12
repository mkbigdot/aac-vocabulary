import type { Settings } from '../types';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

export const speechSupported = Boolean(synth);

export function listVoices(): SpeechSynthesisVoice[] {
  return synth ? synth.getVoices() : [];
}

/** Voice names shipped by iOS, Android, Windows and Chrome for Indian English male speakers. */
const BOY_NAMES = ['rishi', 'ravi', 'hemant', 'prabhat', 'madhur', 'male'];

function score(voice: SpeechSynthesisVoice): number {
  const lang = voice.lang.replace('_', '-').toLowerCase();
  const name = voice.name.toLowerCase();
  let points = 0;
  if (lang === 'en-in') points += 100;
  else if (lang.startsWith('en')) points += 10;
  if (BOY_NAMES.some((boy) => name.includes(boy))) points += 20;
  if (/female|veena|samantha|karen|zira/.test(name)) points -= 15;
  return points;
}

/**
 * Picks the voice closest to an Indian English boy, falling back to any English voice.
 * Returns undefined when the device has no speech voices at all.
 */
export function pickIndianBoyVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return [...voices].sort((a, b) => score(b) - score(a))[0];
}

/** Voices sorted so Indian English comes first in the settings list. */
export function sortedVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return [...voices].sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
}

export function onVoicesChanged(handler: () => void): () => void {
  if (!synth) return () => {};
  synth.addEventListener('voiceschanged', handler);
  return () => synth.removeEventListener('voiceschanged', handler);
}

/**
 * Some voices read a lone "I" as the letter name ("capital I"), so the pronoun is respelled
 * phonetically when it is spoken on its own.
 */
function pronounce(text: string): string {
  return /^i[.!?]?$/i.test(text.trim()) ? 'eye' : text;
}

export function speak(text: string, settings: Settings): void {
  if (!synth || !text.trim()) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(pronounce(text));
  const voice = settings.voiceURI ? listVoices().find((v) => v.voiceURI === settings.voiceURI) : undefined;
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  synth?.cancel();
}
