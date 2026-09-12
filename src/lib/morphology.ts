export type Ending = 's' | 'ing' | 'ed' | 'en' | 'er' | 'est';

export const endings: { id: Ending; label: string; hint: string }[] = [
  { id: 's', label: '+s', hint: 'plural / he-she form' },
  { id: 'ing', label: '+ing', hint: 'doing now' },
  { id: 'ed', label: '+ed', hint: 'past' },
  { id: 'en', label: '+en', hint: 'past participle' },
  { id: 'er', label: '+er', hint: 'more / doer' },
  { id: 'est', label: '+est', hint: 'most' },
];

const IRREGULAR: Record<string, Partial<Record<Ending, string>>> = {
  be: { s: 'is', ing: 'being', ed: 'was', en: 'been' },
  am: { s: 'is', ing: 'being', ed: 'was', en: 'been' },
  is: { ing: 'being', ed: 'was', en: 'been' },
  are: { ing: 'being', ed: 'were', en: 'been' },
  have: { s: 'has', ing: 'having', ed: 'had', en: 'had' },
  do: { s: 'does', ing: 'doing', ed: 'did', en: 'done' },
  go: { s: 'goes', ing: 'going', ed: 'went', en: 'gone' },
  get: { ing: 'getting', ed: 'got', en: 'gotten' },
  eat: { ing: 'eating', ed: 'ate', en: 'eaten' },
  drink: { ing: 'drinking', ed: 'drank', en: 'drunk' },
  see: { ing: 'seeing', ed: 'saw', en: 'seen' },
  come: { ing: 'coming', ed: 'came', en: 'come' },
  make: { ing: 'making', ed: 'made', en: 'made' },
  take: { ing: 'taking', ed: 'took', en: 'taken' },
  give: { ing: 'giving', ed: 'gave', en: 'given' },
  put: { ing: 'putting', ed: 'put', en: 'put' },
  sit: { ing: 'sitting', ed: 'sat', en: 'sat' },
  run: { ing: 'running', ed: 'ran', en: 'run' },
  sleep: { ing: 'sleeping', ed: 'slept', en: 'slept' },
  feel: { ing: 'feeling', ed: 'felt', en: 'felt' },
  hear: { ing: 'hearing', ed: 'heard', en: 'heard' },
  think: { ing: 'thinking', ed: 'thought', en: 'thought' },
  find: { ing: 'finding', ed: 'found', en: 'found' },
  say: { s: 'says', ing: 'saying', ed: 'said', en: 'said' },
  said: { ing: 'saying', s: 'says' },
  tell: { ing: 'telling', ed: 'told', en: 'told' },
  read: { ing: 'reading', ed: 'read', en: 'read' },
  wear: { ing: 'wearing', ed: 'wore', en: 'worn' },
  buy: { ing: 'buying', ed: 'bought', en: 'bought' },
  build: { ing: 'building', ed: 'built', en: 'built' },
  throw: { ing: 'throwing', ed: 'threw', en: 'thrown' },
  catch: { ing: 'catching', ed: 'caught', en: 'caught' },
  swim: { ing: 'swimming', ed: 'swam', en: 'swum' },
  sing: { ing: 'singing', ed: 'sang', en: 'sung' },
  draw: { ing: 'drawing', ed: 'drew', en: 'drawn' },
  child: { s: 'children' },
  person: { s: 'people' },
  foot: { s: 'feet' },
  tooth: { s: 'teeth' },
  mouse: { s: 'mice' },
  good: { er: 'better', est: 'best' },
  bad: { er: 'worse', est: 'worst' },
  little: { er: 'less', est: 'least' },
  many: { er: 'more', est: 'most' },
  much: { er: 'more', est: 'most' },
  fish: { s: 'fish' },
  sheep: { s: 'sheep' },
};

const VOWELS = 'aeiou';
const isVowel = (c: string) => VOWELS.includes(c);

function doubleFinalConsonant(stem: string): string {
  const last = stem.at(-1) ?? '';
  const prev = stem.at(-2) ?? '';
  const prev2 = stem.at(-3) ?? '';
  const doubles = 'bdgklmnprt';
  if (stem.length >= 3 && doubles.includes(last) && isVowel(prev) && !isVowel(prev2)) {
    return stem + last;
  }
  return stem;
}

function addS(stem: string): string {
  if (/(s|x|z|ch|sh)$/.test(stem)) return `${stem}es`;
  if (/[^aeiou]y$/.test(stem)) return `${stem.slice(0, -1)}ies`;
  if (/[^aeiou]o$/.test(stem)) return `${stem}es`;
  if (/fe$/.test(stem)) return `${stem.slice(0, -2)}ves`;
  return `${stem}s`;
}

function addIng(stem: string): string {
  if (/ie$/.test(stem)) return `${stem.slice(0, -2)}ying`;
  if (/[^aeiou]e$/.test(stem)) return `${stem.slice(0, -1)}ing`;
  return `${doubleFinalConsonant(stem)}ing`;
}

function addEd(stem: string): string {
  if (/e$/.test(stem)) return `${stem}d`;
  if (/[^aeiou]y$/.test(stem)) return `${stem.slice(0, -1)}ied`;
  return `${doubleFinalConsonant(stem)}ed`;
}

function addErEst(stem: string, suffix: 'er' | 'est'): string {
  if (/e$/.test(stem)) return stem + suffix.slice(1);
  if (/[^aeiou]y$/.test(stem)) return `${stem.slice(0, -1)}i${suffix}`;
  return doubleFinalConsonant(stem) + suffix;
}

/** Applies an English word ending, using irregular forms where they exist. */
export function applyEnding(word: string, ending: Ending): string {
  const lower = word.toLowerCase();
  const irregular = IRREGULAR[lower]?.[ending];
  if (irregular) return matchCase(word, irregular);

  switch (ending) {
    case 's':
      return matchCase(word, addS(lower));
    case 'ing':
      return matchCase(word, addIng(lower));
    case 'ed':
    case 'en':
      return matchCase(word, addEd(lower));
    case 'er':
    case 'est':
      return matchCase(word, addErEst(lower, ending));
  }
}

function matchCase(source: string, result: string): string {
  if (source[0] && source[0] === source[0].toUpperCase() && source !== source.toUpperCase()) {
    return result[0].toUpperCase() + result.slice(1);
  }
  return result;
}
