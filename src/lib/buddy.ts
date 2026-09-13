export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface BuddyPrompt {
  id: string;
  /** What the buddy asks out loud. */
  text: string;
  /** Ready answers the child can tap instead of talking. */
  chips: string[];
}

export function timeOfDay(hour: number): TimeOfDay {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

export function greeting(time: TimeOfDay, name: string): string {
  const who = name ? ` ${name}` : '';
  switch (time) {
    case 'morning':
      return `Good morning${who}! I am your talk buddy.`;
    case 'afternoon':
      return `Good afternoon${who}! I am your talk buddy.`;
    case 'evening':
      return `Good evening${who}! I am your talk buddy.`;
    case 'night':
      return `Hello${who}! It is nearly bedtime.`;
  }
}

const FEELINGS = ['happy', 'good', 'tired', 'sad', 'excited', 'okay'];
const FOODS = ['rice', 'bread', 'eggs', 'milk', 'fruit', 'noodles', 'nothing yet'];
const YES_NO = ['yes', 'no', 'a little', 'later'];

const MORNING: BuddyPrompt[] = [
  { id: 'wake', text: 'Did you sleep well?', chips: YES_NO },
  { id: 'feel', text: 'How do you feel today?', chips: FEELINGS },
  { id: 'breakfast', text: 'What did you have for breakfast?', chips: FOODS },
  { id: 'plan', text: 'What do you want to do today?', chips: ['play', 'school', 'watch TV', 'go outside', 'read'] },
];

const AFTERNOON: BuddyPrompt[] = [
  { id: 'lunch', text: 'What did you have for lunch?', chips: FOODS },
  { id: 'school', text: 'What did you do in school today?', chips: ['played', 'drawing', 'reading', 'music', 'nothing'] },
  { id: 'friends', text: 'Did you play with your friends?', chips: YES_NO },
  { id: 'feel', text: 'How do you feel now?', chips: FEELINGS },
];

const EVENING: BuddyPrompt[] = [
  { id: 'day', text: 'How was your day?', chips: ['good', 'great', 'boring', 'hard', 'fun'] },
  { id: 'dinner', text: 'What did you have for dinner?', chips: FOODS },
  { id: 'best', text: 'What was the best part of today?', chips: ['playing', 'friends', 'food', 'family', 'TV'] },
  { id: 'want', text: 'Do you want anything now?', chips: ['water', 'snack', 'a hug', 'my tablet', 'nothing'] },
];

const NIGHT: BuddyPrompt[] = [
  { id: 'tired', text: 'Are you sleepy?', chips: YES_NO },
  { id: 'story', text: 'Do you want a story before bed?', chips: YES_NO },
  { id: 'tomorrow', text: 'What do you want to do tomorrow?', chips: ['play', 'school', 'park', 'swim', 'rest'] },
  { id: 'feel', text: 'How do you feel right now?', chips: FEELINGS },
];

export function promptsFor(time: TimeOfDay): BuddyPrompt[] {
  switch (time) {
    case 'morning':
      return MORNING;
    case 'afternoon':
      return AFTERNOON;
    case 'evening':
      return EVENING;
    case 'night':
      return NIGHT;
  }
}

const CHEERS = ['Nice!', 'Thank you for telling me!', 'That is lovely!', 'Good talking!', 'I like that!'];

/** A short, warm reply to whatever the child answered. */
export function replyTo(prompt: BuddyPrompt, answer: string, name: string): string {
  const said = answer.trim();
  const who = name ? ` ${name}` : '';
  if (!said) return `Take your time${who}.`;
  const cheer = CHEERS[said.length % CHEERS.length];
  if (prompt.id === 'feel') return `${cheer} You feel ${said}.`;
  if (prompt.id === 'breakfast' || prompt.id === 'lunch' || prompt.id === 'dinner') {
    return `${said}! That sounds tasty.`;
  }
  if (prompt.id === 'school') return `You did ${said} in school. ${cheer}`;
  return `${cheer} You said ${said}.`;
}

/** The face the buddy shows while it is talking, listening or waiting. */
export function buddyFace(mood: 'idle' | 'talking' | 'listening' | 'happy'): string {
  switch (mood) {
    case 'talking':
      return '😃';
    case 'listening':
      return '👂';
    case 'happy':
      return '🤩';
    case 'idle':
      return '🤖';
  }
}
