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
- **Personalisation** — edit mode to add, edit, hide, delete or drag words into any position, and to
  drag the category tabs into the order you want; recent words view;
  adjustable grid size, label visibility, colour coding and high-contrast mode.
- **Talk Buddy** — an animated face that greets the child by name, asks the questions of the moment
  (breakfast, lunch, school, dinner, feelings, bedtime), speaks them aloud, takes an answer by tap or
  by microphone, and replies warmly. It runs entirely on the device: no account, no API key, no cost.
  Optionally paste a Google Gemini key in Settings and the buddy answers freely instead of following
  the written questions; the key stays in the browser on that device and the buddy falls back to the
  offline questions whenever there is no key, no internet or no answer.
- **The child's name** — set it in settings; the board greets them and their name becomes a
  speakable button on the core board.
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

## Building the iOS app

The Capacitor wrapper packages the existing React app as a native iPhone/iPad app. The native iOS
project is kept in `ios/`, while the web source remains unchanged.

Requirements:

- macOS with the current Xcode release
- An Apple Developer Program membership
- A unique App ID matching `com.mkbigdot.talkboard`

Install dependencies and open the app in Xcode:

```bash
npm install
npm run ios:open
```

After changing the React app, run `npm run ios:sync` to build it and copy the updated `dist/` files
into the native project. In Xcode, select the `App` target and configure your development team under
**Signing & Capabilities**. Test speech, local storage, offline use, rotation, and microphone behavior
on a real iPhone and iPad before archiving.

For TestFlight/App Store delivery, choose a generic iOS device as the run destination, then use
**Product → Archive → Distribute App → App Store Connect**. The final App Store listing also needs a
1024×1024 icon, device screenshots, support and privacy-policy URLs, age rating, and App Privacy
answers.

## Building the Android app

The Capacitor Android project is kept in `android/` and uses the same React application, local
profiles, offline storage, vocabulary and language packs as the web and iOS versions.

Requirements:

- Android Studio with the current Android SDK and Java toolchain
- A Google Play Console developer account
- The application ID `com.mkbigdot.talkboard`

Install dependencies and open the native project:

```bash
npm install
npm run android:open
```

After changing the React app, run `npm run android:sync` to rebuild and copy the web application into
the Android project. Test speech, microphone access, offline use, local profiles, device rotation and
all required languages on physical phones and tablets.

For Google Play delivery, open the project in Android Studio and choose **Build → Generate Signed App
Bundle or APK → Android App Bundle**. Keep the signing key in a secure location; every future update
must use the same key. Upload the resulting `.aab` file to an internal testing release in Play Console
before submitting it for production. The store listing also needs screenshots, descriptions, contact
details, a privacy-policy URL, content rating, target audience and Data safety answers.

## Using it on a tablet

1. Open the deployed URL in the tablet browser.
2. Use the browser menu → *Add to Home Screen* to install it as a full-screen app.
3. Open Settings (⚙️) to pick a voice, set the speaking speed and choose how many buttons fit per row.
   The "🧒 Indian boy voice" button picks an Indian English voice with a child-like pitch and a
   calmer speed; the default is the device voice. On iOS download the voice once in
   Settings → Accessibility → Spoken Content → Voices → English → English (India).
4. Use Edit (✏️) to add personal words — names, favourite foods, school staff, motivators — and to drag
   buttons or category tabs (Home, School, Gadgets…) into the positions that suit your child. The
   arrangement is saved on the device.

Vocabulary and settings are stored on the device; export a backup from Settings before switching
devices.
