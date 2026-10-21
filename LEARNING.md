# Learning notes

A running guide to what each step of this app teaches. Read it next to the code.

## Step 1: one screen, local state

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
