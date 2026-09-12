import type { Settings } from '../types';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

export const speechSupported = Boolean(synth);

export function listVoices(): SpeechSynthesisVoice[] {
  return synth ? synth.getVoices() : [];
}

export function onVoicesChanged(handler: () => void): () => void {
  if (!synth) return () => {};
  synth.addEventListener('voiceschanged', handler);
  return () => synth.removeEventListener('voiceschanged', handler);
}

export function speak(text: string, settings: Settings): void {
  if (!synth || !text.trim()) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
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
