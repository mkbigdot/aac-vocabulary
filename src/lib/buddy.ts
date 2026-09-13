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

function negative(answer: string): boolean {
  return /^(no|nope|not really|nothing|none)\b/i.test(answer.trim());
}

const REASONS = ['noise', 'bad dream', 'too hot', 'light', 'I do not know'];

/**
 * A second question about the same thing the child just answered, so the buddy stays on the topic
 * instead of jumping straight to something new. Returns null when the topic is finished.
 */
export function followUp(prompt: BuddyPrompt, answer: string): BuddyPrompt | null {
  const said = answer.trim();
  if (!said) return null;
  if (prompt.id.endsWith('++')) return null;
  if (prompt.id.endsWith('+')) return { id: `${prompt.id}+`, text: 'How did that feel?', chips: FEELINGS };

  const ask = (text: string, chips: string[]): BuddyPrompt => ({ id: `${prompt.id}+`, text, chips });
  const no = negative(said);

  switch (prompt.id) {
    case 'wake':
    case 'dream':
      return no ? ask('Oh no. What woke you up?', REASONS) : ask('Lovely. What did you dream about?', PLAY);
    case 'feel':
      return /sad|tired|angry|bad/i.test(said)
        ? ask('I am sorry. Do you want a hug or some quiet time?', ['a hug', 'quiet time', 'my tablet', 'nothing'])
        : ask('What made you feel like that?', ['playing', 'friends', 'food', 'family', 'school']);
    case 'breakfast':
    case 'lunch':
    case 'dinner':
      return ask('Did you like it?', YES_NO);
    case 'school':
    case 'learn':
      return ask('Who did you do that with?', PEOPLE);
    case 'friends':
      return no
        ? ask('Would you like to play with someone tomorrow?', YES_NO)
        : ask('What did you play together?', PLAY);
    case 'friend-name':
      return ask('What did you play with them?', PLAY);
    case 'teacher':
      return ask('What did your teacher say to you?', ['well done', 'be quiet', 'nothing', 'a story', 'I forgot']);
    case 'homework':
      return no ? null : ask('Do you want help with it?', YES_NO);
    case 'pain':
      return no ? null : ask('Shall we tell someone to help you?', YES_NO);
    case 'play':
    case 'toy':
      return ask('Do you want to play with it now?', YES_NO);
    case 'tv':
    case 'song':
      return ask('Who do you like to watch it with?', PEOPLE);
    case 'animal':
      return ask('Where do you see them?', ['at home', 'outside', 'on TV', 'at school', 'in a book']);
    case 'colour':
      return ask('What do you have in that colour?', ['t-shirt', 'toy', 'bag', 'shoes', 'nothing']);
    case 'day':
    case 'best':
      return ask('Tell me more about it. Who was with you?', PEOPLE);
    case 'hard':
      return no ? null : ask('That sounds hard. Do you want help with it?', YES_NO);
    case 'snack':
    case 'drink':
    case 'want':
      return ask('Shall we ask for it now?', YES_NO);
    case 'tired':
      return no ? ask('What do you want to do before bed?', PLAY) : ask('Do you want a story first?', YES_NO);
    case 'outside':
      return no ? null : ask('Where do you want to go?', ['park', 'shop', 'garden', 'walk', 'school']);
    default:
      return null;
  }
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
