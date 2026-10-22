# ChatLater

Schedule WhatsApp messages and send them in one tap at the right time. Built with Expo (React Native) and TypeScript.

When a message is due, ChatLater shows a notification. Tapping it (or its **Send now** button) opens WhatsApp with the chat and text ready, and you press send. Everything is stored on the phone; there is no server.

## Features

- Pick a contact or type a number (country code added automatically)
- "Any chat or group" mode: WhatsApp opens its chat list with the message ready
- Repeat daily, weekly, monthly or yearly
- Quick time chips, templates, `{name}` personalisation
- Notification actions (Send now, Snooze), snooze options, follow-up nudge
- "Ready to send" section for missed messages, history with "schedule again"
- Search, light and dark theme, onboarding, in-app help and privacy policy

## Run it

```bash
npm install
npx expo start      # scan the QR code with Expo Go
npm test            # unit tests
npm run typecheck
npm run lint
```

## Project layout

```
src/app/            screens (expo-router: every file is a route)
  (tabs)/           Scheduled, History, Templates, Settings
  compose.tsx       new / edit message
  contacts.tsx      contact picker
  send/[id].tsx     "ready to send" screen opened from a reminder
  message/[id].tsx  message details and actions
src/components/     shared UI pieces
src/lib/            logic: repeats, phone numbers, reminders, WhatsApp links
src/store/          saved data (zustand + AsyncStorage)
store/              Play Store text, graphics and screenshots
docs/               privacy policy (served with GitHub Pages)
```

## Publishing

See [PUBLISHING.md](PUBLISHING.md) for the Google Play steps.

ChatLater is not affiliated with WhatsApp or Meta.
