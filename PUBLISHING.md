# Publishing ChatLater on Google Play

Everything in the code is ready. These are the steps that need your own accounts. Commands are for Windows PowerShell, run inside the project folder.

## 0. Decide the permanent names (5 minutes)

In `app.json`:

- `"name": "ChatLater"`: the name under the icon. You can change this later.
- `"android.package": "com.devsatish.chatlater"`: the app's permanent ID on Google Play. **It can never change after the first upload.** Change it now if you want something else (lowercase, dots, no spaces).

## 1. Try it on your phone

```powershell
npm install
npx expo start
```

Scan the QR code with Expo Go. Everything works there except that the notification shows Expo Go's icon and name.

## 2. Make a real installable app (free)

1. Create a free account at https://expo.dev/signup.
2. Install the build tool and sign in:
   ```powershell
   npm install -g eas-cli
   eas login
   eas init
   ```
   `eas init` links the project to your account and adds a `projectId` to `app.json`. Commit that change.
3. Build a test APK you can install directly on your phone:
   ```powershell
   eas build --platform android --profile preview
   ```
   When asked about a keystore, choose **Generate new keystore**. Expo keeps it safe for you. When the build finishes (10–20 minutes), open the link on your phone and install it. Test sending, reminders with the screen off, snoozing, repeats and contacts.

## 3. Publish the privacy policy (2 minutes)

Google needs a public link. The policy is in `docs/privacy-policy.md`.

1. On GitHub, open the repository → **Settings** → **Pages**.
2. Under "Build and deployment", pick **Deploy from a branch**, branch **main**, folder **/docs**, then **Save**.
3. After a minute it's live at:
   `https://ananyashankar20.github.io/whatsapp-scheduler/privacy-policy`

## 4. Google Play developer account

1. Sign up at https://play.google.com/console/signup (one-time US$25 fee, ID verification can take a few days).
2. **Important for new personal accounts:** before you can publish to everyone, Google requires a **closed test with at least 12 testers who stay opted in for 14 days**. Line up 12 friends with Android phones early.

## 5. Create the app in Play Console

1. **Create app** → name "ChatLater: Message Scheduler", App, Free.
2. **Store listing**: copy the text from `store/listing.md`, and upload `store/graphics/icon-512.png`, `store/graphics/feature-graphic.png` and the six `store/screenshots/phone-*.png`.
3. **App content**: answer each section using the "App content answers" in `store/listing.md`, with the privacy policy URL from step 3.

## 6. Build and upload the release

```powershell
eas build --platform android --profile production
```

This makes an `.aab` file (the format Google Play wants). Then in Play Console:

1. **Testing → Closed testing → Create track**, add your 12+ testers' emails, upload the `.aab`, and roll it out.
2. After 14 days, apply for **Production access** (Dashboard), then create a production release with the same build.

Optional: to upload from the command line instead of the website, create a Google service account key (Play Console → Setup → API access), save it as `google-service-account.json` in the project folder (it's git-ignored), and run `eas submit --platform android`.

## 7. Updating the app later

Change the code, bump `"version"` in `app.json` (e.g. 1.0.1) and run the production build again. The build number goes up automatically.
