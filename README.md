# Talk Board — AAC Vocabulary

A full-vocabulary AAC (Augmentative and Alternative Communication) web app. Tap symbols to build a
sentence and the app speaks it aloud. It runs in any modern browser, installs to a tablet home screen,
and keeps working offline.

## Features

- **Core board** — 84 high-frequency words in a fixed 12-column layout, so button positions never move
  (motor planning stays consistent as vocabulary grows).
- **Fringe vocabulary** — ~20 category folders (people, feelings, food, body, clothes, home, school,
  play, animals, places, transport, nature, describing words, colours, numbers, time, questions,
  quick phrases and more), several hundred words in total.
- **Speech** — the sentence bar speaks the whole message; each button can also speak on tap
  (Web Speech API, with voice / speed / pitch / volume settings).
- **Speaks proper sentences** — tapped words are tidied before they are spoken: subject-verb
  agreement (`he eat → he eats`, `I is → I am`), progressive forms after *to be* (`I am go → I am
  going`), do-support for negatives (`he not like → he doesn't like`), `a/an`, capitals and a full
  stop or question mark. The tidied sentence is shown under the symbols, and can be switched off in
  settings.
- **Grammar endings** — `+s`, `+ing`, `+ed`, `+en`, `+er`, `+est` are applied to the last word with
  proper irregular forms (`go → went`, `good → better`, `foot → feet`).
- **Spelling keyboard** — type anything not on the board and add it to the sentence.
- **Search** — find any word across every category.
- **Personalisation** — edit mode to add, edit, hide or delete words per category; recent words view;
  adjustable grid size, label visibility, colour coding and high-contrast mode.
- **Backup** — export/import the whole personalised vocabulary as a JSON file.
- **Offline** — service worker caches the app; everything is stored locally in the browser.

Buttons are coloured with the modified Fitzgerald key (yellow pronouns, green verbs, blue describing
words, orange nouns, pink social words, purple question words) which can be switched to category
colours in settings.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run lint       # ESLint
npm test           # Vitest unit tests (grammar + word endings)
npm run typecheck  # TypeScript
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Deploying

`npm run build` produces a static `dist/` folder that can be hosted anywhere (the Vite `base` is
relative, so subdirectories work). The included GitHub Actions workflow builds every push and
publishes `main` to GitHub Pages once Pages is enabled for the repository
(Settings → Pages → Source: GitHub Actions).

## Using it on a tablet

1. Open the deployed URL in the tablet browser.
2. Use the browser menu → *Add to Home Screen* to install it as a full-screen app.
3. Open Settings (⚙️) to pick a voice, set the speaking speed and choose how many buttons fit per row.
4. Use Edit (✏️) to add personal words — names, favourite foods, school staff, motivators.

Vocabulary and settings are stored on the device; export a backup from Settings before switching
devices.
