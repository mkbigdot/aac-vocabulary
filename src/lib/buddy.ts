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

const PEOPLE = ['mum', 'dad', 'brother', 'sister', 'teacher', 'friend', 'nobody'];
const PLAY = ['blocks', 'cars', 'ball', 'drawing', 'music', 'puzzle', 'outside'];
const DRINKS = ['water', 'milk', 'juice', 'tea', 'nothing'];

/** Questions the buddy can ask at any hour, so the chat never runs out. */
const ANYTIME: BuddyPrompt[] = [
  { id: 'feel', text: 'How do you feel right now?', chips: FEELINGS },
  { id: 'play', text: 'What do you like to play with?', chips: PLAY },
  { id: 'who', text: 'Who do you want to be with?', chips: PEOPLE },
  { id: 'drink', text: 'Do you want something to drink?', chips: DRINKS },
  { id: 'pain', text: 'Does anything hurt?', chips: ['no', 'head', 'tummy', 'leg', 'ear', 'teeth'] },
  { id: 'music', text: 'Do you want some music?', chips: YES_NO },
  { id: 'song', text: 'What song do you like?', chips: ['happy song', 'rhymes', 'cartoon song', 'quiet music'] },
  { id: 'tv', text: 'What do you like to watch on TV?', chips: ['cartoons', 'songs', 'animals', 'cars', 'nothing'] },
  { id: 'colour', text: 'What is your favourite colour?', chips: ['red', 'blue', 'green', 'yellow', 'pink'] },
  { id: 'animal', text: 'What animal do you like?', chips: ['dog', 'cat', 'elephant', 'bird', 'fish'] },
  { id: 'weather', text: 'How is the weather today?', chips: ['sunny', 'hot', 'rainy', 'cold', 'windy'] },
  { id: 'outside', text: 'Do you want to go outside?', chips: YES_NO },
  { id: 'snack', text: 'Do you want a snack?', chips: ['biscuit', 'fruit', 'chips', 'chocolate', 'no thanks'] },
  { id: 'help', text: 'Do you need help with anything?', chips: YES_NO },
  { id: 'family', text: 'Who is at home with you?', chips: PEOPLE },
  { id: 'toy', text: 'What is your favourite toy?', chips: PLAY },
  { id: 'game', text: 'Do you want to play a game with me?', chips: YES_NO },
  { id: 'quiet', text: 'Is it too noisy for you?', chips: YES_NO },
];

const MORNING: BuddyPrompt[] = [
  { id: 'wake', text: 'Did you sleep well?', chips: YES_NO },
  { id: 'feel', text: 'How do you feel today?', chips: FEELINGS },
  { id: 'breakfast', text: 'What did you have for breakfast?', chips: FOODS },
  { id: 'dream', text: 'Did you have a nice dream?', chips: YES_NO },
  { id: 'clothes', text: 'What are you wearing today?', chips: ['t-shirt', 'shirt', 'dress', 'shorts', 'uniform'] },
  { id: 'plan', text: 'What do you want to do today?', chips: ['play', 'school', 'watch TV', 'go outside', 'read'] },
  { id: 'school-go', text: 'Are you going to school today?', chips: YES_NO },
  ...ANYTIME,
];

const AFTERNOON: BuddyPrompt[] = [
  { id: 'lunch', text: 'What did you have for lunch?', chips: FOODS },
  { id: 'school', text: 'What did you do in school today?', chips: ['played', 'drawing', 'reading', 'music', 'nothing'] },
  { id: 'friends', text: 'Did you play with your friends?', chips: YES_NO },
  { id: 'friend-name', text: 'Who did you play with?', chips: PEOPLE },
  { id: 'teacher', text: 'Was your teacher nice today?', chips: YES_NO },
  { id: 'learn', text: 'What did you learn today?', chips: ['letters', 'numbers', 'a song', 'a story', 'colours'] },
  { id: 'feel', text: 'How do you feel now?', chips: FEELINGS },
  { id: 'homework', text: 'Do you have homework?', chips: YES_NO },
  ...ANYTIME,
];

const EVENING: BuddyPrompt[] = [
  { id: 'day', text: 'How was your day?', chips: ['good', 'great', 'boring', 'hard', 'fun'] },
  { id: 'dinner', text: 'What did you have for dinner?', chips: FOODS },
  { id: 'best', text: 'What was the best part of today?', chips: ['playing', 'friends', 'food', 'family', 'TV'] },
  { id: 'hard', text: 'Was anything hard today?', chips: ['no', 'school', 'noise', 'people', 'homework'] },
  { id: 'want', text: 'Do you want anything now?', chips: ['water', 'snack', 'a hug', 'my tablet', 'nothing'] },
  { id: 'bath', text: 'Did you have your bath?', chips: YES_NO },
  ...ANYTIME,
];

const NIGHT: BuddyPrompt[] = [
  { id: 'tired', text: 'Are you sleepy?', chips: YES_NO },
  { id: 'story', text: 'Do you want a story before bed?', chips: YES_NO },
  { id: 'teeth', text: 'Did you brush your teeth?', chips: YES_NO },
  { id: 'tomorrow', text: 'What do you want to do tomorrow?', chips: ['play', 'school', 'park', 'swim', 'rest'] },
  { id: 'feel', text: 'How do you feel right now?', chips: FEELINGS },
  { id: 'goodnight', text: 'Who do you want to say good night to?', chips: PEOPLE },
  ...ANYTIME,
];

/** Keeps the first of any question repeated between the time-of-day list and the anytime list. */
function unique(prompts: BuddyPrompt[]): BuddyPrompt[] {
  const seen = new Set<string>();
  return prompts.filter((prompt) => {
    if (seen.has(prompt.id)) return false;
    seen.add(prompt.id);
    return true;
  });
}

export function promptsFor(time: TimeOfDay): BuddyPrompt[] {
  switch (time) {
    case 'morning':
      return unique(MORNING);
    case 'afternoon':
      return unique(AFTERNOON);
    case 'evening':
      return unique(EVENING);
    case 'night':
      return unique(NIGHT);
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
  if (prompt.id === 'pain') {
    return said.toLowerCase() === 'no' ? `I am glad nothing hurts${who}.` : `Your ${said} hurts. Let us tell someone.`;
  }
  if (prompt.id === 'snack' || prompt.id === 'drink' || prompt.id === 'want') return `${said}. Let us ask for it!`;
  return `${cheer} You said ${said}.`;
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

/**
 * True when the microphone picked up the buddy's own voice from the speaker instead of the child:
 * nearly every word heard was in the sentence the buddy just said.
 */
export function isEcho(heard: string, spoken: string): boolean {
  const said = words(heard);
  if (said.length === 0) return true;
  const mine = new Set(words(spoken));
  const overlap = said.filter((word) => mine.has(word)).length;
  return said.length >= 3 && overlap / said.length >= 0.8;
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
