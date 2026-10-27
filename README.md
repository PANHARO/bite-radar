# BiteRadar

Save the food. Find it when you're nearby.

An Expo SDK 58 / React Native application implementing the existing BiteRadar Figma design. Phase A includes a private local collection, an interactive map, and the complete add → confirm → save journey.

## Run on an Android tablet

Use Node 24 LTS and an Expo Go version supporting SDK 58. Install Expo Go on the tablet, connect it and this computer to the same Wi-Fi network, then run:

```powershell
cd D:\bite-radar
npm ci
npx expo start --lan
```

Scan the terminal QR code with Expo Go. If the Wi-Fi network blocks LAN connections, use `npx expo start --tunnel`. No API keys are needed. [Expo device instructions](https://docs.expo.dev/get-started/start-developing/).

The first launch seeds three Phnom Penh demo restaurants. Save your own TikTok URL or enter a place manually. Restart the app to verify your collection persists. Demo restaurants intentionally have no fabricated TikTok links.

## Checks

```powershell
npm run typecheck
npm run lint
npm test
npx expo-doctor
npx expo export --platform all
```

The Playwright tests launch or reuse the web dev server and use a separate headless Chrome profile. Google Chrome must be installed. These are browser and data tests, not native-device tests. Screenshots are saved under `artifacts/`.

## Boundaries

- Saved places and preferences live in AsyncStorage on this device. There is no cloud account or synchronization.
- TikTok URLs are validated and retained; no video metadata, private Favorites, scraping, or share extension is implemented.
- Native Expo Go uses `react-native-maps`. The Figma illustration is available as an alternate map and as the web/offline fallback. Android standalone builds use the illustrated map until Google Maps credentials are configured.
- Places, coordinates, and distances are demo data. The manual form can save your own coordinates. Place search has a replaceable service interface.
- Reminder settings and notifications are clearly labeled previews. Live location, notifications, and geofencing are not enabled.

See [the development handoff](BiteRadar_Development_Handoff.md) for the file inventory, verification details, limitations, and next milestone.
