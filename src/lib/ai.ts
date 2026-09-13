/**
 * Optional AI replies for the talk buddy, using a Google Gemini key that the parent pastes into
 * Settings. The key is kept on the device only. Without a key the buddy stays fully offline.
 */

export interface AiTurn {
  /** A short, warm answer to what the child just said. */
  reply: string;
  /** The next question, on the same subject when there is more to talk about. */
  question: string;
  /** Ready answers the child can tap. */
  chips: string[];
}

export interface ChatLine {
  who: 'buddy' | 'child';
  text: string;
}

const API = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Google retires model names, so try the aliases in turn and keep the first one that answers. */
const MODELS = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-2.5-flash'];

let working: string | null = null;

const TIMEOUT_MS = 12000;

function instructions(name: string): string {
  const who = name || 'the child';
  return [
    `You are a gentle talking buddy for ${who}, a child who uses a picture communication app and may be autistic or non-speaking.`,
    'Answer what the child actually said. Never praise a "no" answer.',
    'Use very short, plain sentences (at most 8 words), no emoji, no lists, no baby talk.',
    'Stay on the same subject for two or three turns, then move to a new everyday subject (food, school, play, family, feelings, sleep).',
    'Ask exactly one question at a time and never repeat a question you already asked.',
    'Give 4 to 6 very short answers the child can tap, in the child\'s own simple words.',
    'Reply as JSON: {"reply": string, "question": string, "chips": string[]}.',
  ].join(' ');
}

/** Reads the model output, which may be wrapped in code fences, into a usable turn. */
export function parseTurn(raw: string): AiTurn | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const turn = parsed as Partial<Record<keyof AiTurn, unknown>>;
  const reply = typeof turn.reply === 'string' ? turn.reply.trim() : '';
  const question = typeof turn.question === 'string' ? turn.question.trim() : '';
  if (!reply || !question) return null;
  const chips = Array.isArray(turn.chips)
    ? turn.chips.filter((chip): chip is string => typeof chip === 'string' && chip.trim().length > 0)
    : [];
  return { reply, question, chips: chips.slice(0, 6) };
}

/** Asks Gemini for the next reply and question. Returns null on any problem, so the buddy can fall back. */
export async function aiTurn(
  apiKey: string,
  name: string,
  history: ChatLine[],
  said: string,
): Promise<AiTurn | null> {
  const key = apiKey.trim();
  if (!key) return null;
  const contents = [
    ...history.slice(-8).map((line) => ({
      role: line.who === 'child' ? 'user' : 'model',
      parts: [{ text: line.text }],
    })),
    { role: 'user', parts: [{ text: said }] },
  ];
  const body = JSON.stringify({
    contents,
    systemInstruction: { parts: [{ text: instructions(name) }] },
    generationConfig: { temperature: 0.8, maxOutputTokens: 600, responseMimeType: 'application/json' },
  });

  for (const model of working ? [working, ...MODELS.filter((m) => m !== working)] : MODELS) {
    const turn = await ask(model, key, body);
    if (turn) {
      working = model;
      return turn;
    }
  }
  return null;
}

async function ask(model: string, key: string, body: string): Promise<AiTurn | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API}/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
      body,
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return parseTurn(textOf(data));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Digs the model's text out of the Gemini response without trusting its shape. */
function textOf(data: unknown): string {
  if (typeof data !== 'object' || data === null) return '';
  const { candidates } = data as { candidates?: unknown };
  if (!Array.isArray(candidates) || candidates.length === 0) return '';
  const first = candidates[0] as { content?: { parts?: unknown } };
  const parts = first.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((part) => (typeof (part as { text?: unknown }).text === 'string' ? (part as { text: string }).text : ''))
    .join('');
}
