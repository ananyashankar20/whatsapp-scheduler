// Shown in the app and published as docs/privacy-policy.md. Keep both in step.

export const PRIVACY_UPDATED = '22 October 2026';

export const PRIVACY_SECTIONS: { title: string; body: string }[] = [
  {
    title: 'The short version',
    body: 'ChatLater keeps everything on your phone. We don’t have servers, accounts, analytics or ads, and we never see your messages or contacts.',
  },
  {
    title: 'What the app stores',
    body: 'The messages you schedule, their recipients (name and phone number), your templates, your send history and your settings. All of it is saved only in the app’s private storage on your device. If Android backup is turned on for your phone, Android may include this data in your own Google backup, which is controlled by you and Google, not by us.',
  },
  {
    title: 'Contacts',
    body: 'If you choose “Choose from contacts”, the app asks for permission to read your contacts so it can show a searchable list. It reads names and phone numbers only while that screen is open, and saves only the one person you pick. Contacts are never uploaded or shared.',
  },
  {
    title: 'Notifications and alarms',
    body: 'Notification permission is used to remind you when a message is ready to send. The “Alarms & reminders” permission, if you allow it, lets Android deliver those reminders on time. Both are handled entirely on your device.',
  },
  {
    title: 'WhatsApp',
    body: 'ChatLater never sends messages by itself. When you tap send, it opens WhatsApp (or WhatsApp Business) with the message filled in, and you send it there. What happens after that is covered by WhatsApp’s own privacy policy. ChatLater is not affiliated with WhatsApp or Meta.',
  },
  {
    title: 'Sharing and selling',
    body: 'We don’t collect personal data, so there is nothing to share or sell. The app contains no third-party tracking or advertising code.',
  },
  {
    title: 'Deleting your data',
    body: 'Delete any message or history entry in the app, use Settings → Erase all data, or uninstall the app. Either way the data is gone from the device.',
  },
  {
    title: 'Children',
    body: 'ChatLater is not directed at children under 13.',
  },
  {
    title: 'Changes and contact',
    body: 'If this policy changes, the new version will be published at the same address with a new date. Questions? Use the contact email on the app’s Google Play page.',
  },
];
