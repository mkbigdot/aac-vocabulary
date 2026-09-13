interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResult {
  0: RecognitionAlternative;
  isFinal: boolean;
}

interface RecognitionEvent {
  results: ArrayLike<RecognitionResult>;
}

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface RecognitionWindow {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
}

function constructor(): (new () => Recognition) | undefined {
  if (typeof window === 'undefined') return undefined;
  const candidates = window as unknown as RecognitionWindow;
  return candidates.SpeechRecognition ?? candidates.webkitSpeechRecognition;
}

export const listeningSupported = Boolean(constructor());

/**
 * Listens for one spoken answer. Returns a function that stops listening early;
 * `onResult` is called with the words that were heard.
 */
export function listenOnce(onResult: (text: string) => void, onDone: () => void): () => void {
  const Recognizer = constructor();
  if (!Recognizer) {
    onDone();
    return () => {};
  }
  const recognition = new Recognizer();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const heard = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(' ')
      .trim();
    if (heard) onResult(heard);
  };
  recognition.onerror = onDone;
  recognition.onend = onDone;
  recognition.start();
  return () => recognition.stop();
}
