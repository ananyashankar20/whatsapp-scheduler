# Learning notes

A running guide to what each step of this app teaches. Read it next to the code.

## Step 1: one screen, local state

> The Step 1 files (`App.tsx`, `ScheduleForm`, `MessageList`) were replaced by the full app in Step 2, but the ideas below are all still used. Look at `src/components/ui.tsx` for components and props, and `src/app/compose.tsx` for state.

### Run it on your phone

1. Install **Node.js** (the LTS version) on your computer from https://nodejs.org.
2. Install **Expo Go** on your phone from the App Store or Google Play.
3. In a terminal, inside this folder:
   ```bash
   npm install      # downloads the libraries listed in package.json into node_modules/
   npx expo start   # starts the dev server and prints a QR code
   ```
4. Scan the QR code: on Android, from inside Expo Go; on iPhone, with the Camera app.
   Your phone and computer must be on the same Wi-Fi. If it can't connect
   (office or college Wi-Fi often blocks this), stop the server and run
   `npx expo start --tunnel` instead.
5. Edit any file and save. The app on your phone updates within a second.
   This is called **fast refresh**.

### If Expo Go says "Project is incompatible"

Expo releases a new **SDK** (a bundle of matching library versions) about three
times a year, and Expo Go from the app store supports one SDK at a time. Right
after a new SDK comes out, the store version can lag behind. This project uses
**SDK 57** (see `"expo"` in `package.json`) to match the Expo Go in Google Play.
If the error comes back after a future upgrade, the fix is to move the project
to the SDK your installed Expo Go supports, or install the matching Expo Go
from https://expo.dev/go (Android only).

### The big ideas

**React Native and Expo.** React Native lets you write a phone app in
TypeScript and have it show up as real iPhone and Android screens. Expo is a
toolkit on top that handles the painful setup, and Expo Go is an app that
runs your code on your phone without building an installable app first.

**TypeScript.** JavaScript with labels on your data. `src/types.ts` says a
scheduled message always has an `id`, `recipient`, `text` and `sendAt`. If
you forget one, your editor underlines it in red before you ever run the app.

**Components.** A component is a function that returns a piece of screen.
Ours are:

- `App` (in `App.tsx`): the whole screen.
- `ScheduleForm`: the inputs and the green button.
- `MessageList`: the list of scheduled messages.

The tags that look like HTML (`<View>`, `<Text>`, `<TextInput>`) are called
**JSX**. `View` is a box, `Text` is text, `TextInput` is a text field,
`Pressable` is anything you can tap.

**Props.** Inputs passed from a parent component to a child, like arguments
to a function. `App` gives `ScheduleForm` a prop called `onSchedule`, a
function the form calls when you tap the button.

**State.** A component's memory. `useState('')` returns the current value
and a function to change it. When you change state, React redraws the
screen to match. Typing in the "To" box calls `setRecipient`, which updates
`recipient`, which updates what the box shows.

**Lifting state up.** The list of messages is needed by both the form (to
add) and the list (to show and delete), so it lives in their shared parent,
`App`. Data flows down through props; changes flow up through functions
like `onSchedule` and `onDelete`.

**Styles.** `StyleSheet.create` holds the look of each piece, similar to
CSS. Layout uses **flexbox**: `flexDirection: 'row'` lines children up side
by side, `gap` spaces them out, `flex: 1` means "take the remaining space".

**Platform differences.** The date picker behaves differently on iPhone (a
small inline pill) and Android (a pop-up dialog), so `ScheduleForm` checks
`Platform.OS` and shows the right one.

### What this step can't do yet

The list lives only in memory, so it disappears when the app reloads, and
nothing is actually sent. A phone app can't reliably wake up at an exact
minute to send a message, so the next steps add a small server that stores
messages and sends them through the WhatsApp Business Cloud API on time.

### Try it yourself

Small changes that are good practice:

- Change the button colour in `ScheduleForm.tsx`.
- Show "in 2 hours" next to each time in `MessageList.tsx`.
- Stop the user scheduling an empty-looking phone number (fewer than 10 digits).

## Step 2: the full app

How the finished app fits together, in plain words. Open the files as you read.

### Screens are files (`src/app/`)

The app uses **expo-router**. Every file in `src/app/` is a screen, and its
path is its address: `src/app/compose.tsx` is `/compose`, and
`src/app/message/[id].tsx` is `/message/abc123`, where `[id]` means "any value".
`router.push('/compose')` opens a screen. `_layout.tsx` files decide how
screens are arranged: the root one is a **stack** (screens slide on top of each
other), and `(tabs)/_layout.tsx` makes the four tabs at the bottom.

### Saved data (`src/store/`)

In Step 1 the list lived in `useState`, so it vanished on reload. Now it lives
in a **store** (`app-store.ts`, using a small library called zustand). A store
is state that any screen can read, and its `persist` option saves it to the
phone's storage (AsyncStorage) after every change and loads it on start. Screens
read it with `useAppStore((s) => s.messages)` and re-draw when it changes.

### Logic without screens (`src/lib/`)

Pure functions that take data and return answers, with no UI, so they're easy
to test:

- `recurrence.ts`: "when is the next birthday after today?", including the
  awkward cases (31st of the month, 29 February).
- `phone.ts`: turns "098765 43210" into "919876543210".
- `reminders.ts`: decides which notifications should exist right now.
- `status.ts`: is this message due? what's its next time? fills in `{name}`.

Their tests are in `src/lib/__tests__/`. Run `npm test`.

### Reminders (`src/lib/notifications.ts`)

The phone's notification system can schedule a notification for a future time
even if the app is closed. Rather than adding and removing notifications one by
one, `syncReminders()` asks "what should exist?" (from `reminders.ts`), compares
with what is scheduled, and fixes the difference. It runs after every change and
whenever the app opens, so it can't get out of step.

When you tap a reminder, `use-reminder-responses.ts` hears it and opens the
"Ready to send" screen (or WhatsApp directly, for the **Send now** button).

### Opening WhatsApp (`src/lib/whatsapp.ts`)

A **deep link** is a web-address-like link that opens another app:
`whatsapp://send?phone=919876543210&text=Hello` opens WhatsApp in that chat with
"Hello" typed. Without a phone number, WhatsApp asks which chat to use, which is
how group messages work.

### Light and dark (`src/constants/theme.ts`, `src/hooks/use-theme.ts`)

Colours are defined once for light and once for dark. Components call
`useTheme()` to get the right set, so switching the theme re-colours everything.

### Things to try

- Add a new quick-time chip in `src/lib/quick-times.ts` (e.g. "In 30 min").
- Add a new default template in `src/store/defaults.ts`.
- Add a test to `src/lib/__tests__/phone.test.ts` for your own number format.
