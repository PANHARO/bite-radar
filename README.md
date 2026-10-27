# BiteRadar

Save the food. Find it when you're nearby.

Expo SDK 58 / React Native app with a private device-local collection, TikTok link saving, native/illustrated maps, live foreground location and opt-in nearby local notifications.

## Run on an Android tablet

Use Node 24 LTS and Expo Go supporting SDK 58. Connect the tablet and computer to the same Wi-Fi:

```powershell
cd D:\bite-radar
npm ci
npx expo start --go --lan --clear
```

Scan the new QR code in Expo Go. Use `--tunnel` instead of `--lan` if the network blocks LAN access. No API keys are needed for this milestone. Keep the terminal running.

## Test a real nearby reminder

1. In Settings, choose **Enable my location** and allow foreground location. Wait for coordinates; try outdoors if GPS accuracy is poor.
2. Turn on **Nearby reminders** and allow notifications. Only this switch opts in; the old design preview never enables real alerts.
3. For testing after 10 PM, turn **Quiet hours** off. Choose a 500 m radius.
4. Add a new manual place such as `My nearby test spot`. Give it an address. Under **Adjust pin / enter location manually**, choose **Use my current location as pin**. This explicitly marks it as a real manual place, not demo data.
5. Save while BiteRadar stays open. An eligible already-inside place should produce a local notification. Tap it to open the details.
6. Reopen the app: the same place should not alert again that day. Mark it visited to exclude it. Remove the test place afterward.
7. Deny location or notifications, disable GPS, move outside the radius, and toggle reminders off. Confirm the app explains the state and still lets you save places.

If your device settings disable the app's notification channel, enable **Nearby saved food** there. An OS may suppress banners even when the notification API accepts delivery.

## Behavior and boundaries

- Location runs **only while the app is open**. The watcher stops when the app leaves the foreground. Background geofencing and closed-app alerts are not implemented.
- Distances and nearest sorting use a current device fix. Without location, only demo records show explicitly labeled demo distances; real records show `Location off`.
- Alerts require explicit opt-in, notification permission, a non-visited, non-demo saved place, a fix no older than two minutes, and adequate accuracy. Distance plus reported uncertainty must fit inside the radius.
- Quiet hours are 10 PM–8 AM in device-local time. Frequency is once per place or once per device-local calendar day. Checks happen on valid location updates, saves, preferences, resume, and a foreground timer. At most one nearby alert is delivered per minute across all places. Alert history is reserved on disk before delivery and rolled back on delivery failure, with a one-minute retry backoff. A crash between reservation and OS delivery can suppress that alert until the next eligible day; this favors avoiding duplicate alerts.
- Coordinates remain manual. New places have no default coordinates; using your own position is appropriate only if you are at the place. Search still uses three Phnom Penh demos. Google Places matching is not integrated.
- Native Expo Go uses `react-native-maps`. Web and Android standalone builds without map credentials retain the illustrated fallback. Near Me centers the native map; the illustration is explicitly a demo viewport.
- TikTok links are validated, saved, and opened. No metadata extraction, private Favorites access, scraping or share extension.
- Collection, preferences and alert history stay in AsyncStorage on this device. Older collections migrate without enabling alerts. Uninstalling/clearing app data removes them. No cloud account/sync.
- Web can use foreground geolocation on a secure origin (or localhost), but native notifications are disabled there. No service worker/PWA offline startup is provided.
- Android and iOS native notification permission behavior still needs physical-device acceptance. Browser tests and successful exports do not prove OS delivery.

## Checks

```powershell
npm run typecheck
npm run lint
npm test
npx expo-doctor
npx expo export --platform all
```

Playwright defaults to installed Google Chrome. To use its downloaded Chromium set `PLAYWRIGHT_CHROMIUM=1`; `PLAYWRIGHT_EXECUTABLE_PATH` can select another installed Chromium executable. Tests include reminder consent/migration, quiet hours, accuracy, duplicate prevention, persistence/delivery failures, live browser location, manual pin confirmation and the original collection workflows.

See [the development handoff](BiteRadar_Development_Handoff.md) for milestone history and device acceptance notes.
