# Foreground nearby reminders milestone — October 27, 2026

The user completed Android manual acceptance of the Phase A demo save/edit/visited/delete/dark-mode/rotation workflows. This milestone adds real foreground location and local notifications; physical acceptance of the new native behavior remains pending.

- `location-store.tsx`: opt-in foreground permission, current fix/watch, timeout/recovery, app-state cleanup and refresh after returning to the app. No background permission is requested.
- `reminder-store.tsx` and platform notification adapters: explicit consent, Android channel, native local delivery and notification-tap routing after collection hydration. Web notification delivery is unavailable and clearly labeled.
- `proximity.ts` / `reminders.ts`: Haversine distance, accuracy/freshness checks, demo/visited exclusion, quiet hours, persisted once/day or once/place suppression, a persisted one-alert-per-minute cap, serialized reservations and failure backoff.
- Existing data upgrades in memory with real reminders OFF, regardless of the legacy preview preference. History is removed with its place or when clearing the collection.
- Live distances are used in Home, cards, Saved sorting, Map, confirmation and details. Native Near Me centers on the user; illustrated fallback remains geographically limited.
- Manual confirmation requires actual coordinates for a new place. The user can explicitly use their current position as the pin. No automated restaurant identification or real Places search has been added.
- Dependencies installed with `expo install`: `expo-location ~58.0.19` and `expo-notifications ~58.1.6`. Config plugins request only foreground location and local notifications. The lockfile's missing optional dependency records were repaired. Expo's recommended patch updates were applied within SDK 58.
- Validation: TypeScript and ESLint pass; 22 Playwright data/browser tests pass; Expo Doctor passes all 20 checks; the repaired lockfile passes a clean-install dry run; Android, iOS and web production exports succeed. Native permission prompts, map centering and OS notification delivery still require tablet/device acceptance.
- See README for installation and the already-inside test, including disabling quiet hours when testing after 10 PM.

Known delivery limit: disk reservation precedes OS scheduling to avoid repeat alerts after reload. A process crash between the two may suppress a reminder for that period. OS-level channel settings can suppress visible delivery; a scheduling success cannot prove a displayed banner. Background geofencing, Google Places, TikTok metadata, cloud sync and PWA notifications remain future work.

The original Phase A handoff below is historical; its statements about location/reminders being previews are superseded by this section and the current README.

---

# BiteRadar Phase A implementation handoff

## Scope and source

Implemented from the [existing Figma file](https://www.figma.com/design/9IPTj3ELTKqsYCb6YNumQS/Untitled). No previous handoff file was present. The repository initially contained the Expo SDK 58 starter; Expo, React Native, Router, Reanimated and Gesture Handler versions were preserved.

The Figma design context, screenshots, tokens, Android compact examples, visual kit, and prototype reactions were inspected before implementation. The final yellow palette overrides outdated coral wording within the UI kit. No generated web/Tailwind layout code was used in the app.

| Figma frame | Implementation |
| --- | --- |
| 15:3 Welcome | `/` |
| 15:58 Home dashboard | `/home` |
| 15:162 Add a food spot | `/add` |
| 15:229 Confirm restaurant location | `/confirm` |
| 15:308 Food map | `/map` |
| 15:392 My saved food | `/saved` |
| 15:471 Restaurant details | `/place/[id]` |
| 15:540 Settings; 40:99 preview enabled | `/settings` |
| 15:797 Empty collection | Empty `/saved`, plus `/state/empty` preview |
| 15:809 Loading | Shared hydration skeleton; `/state/loading` preview |
| 15:829 Unavailable link | `/state/unavailable` validation recovery |
| 15:847 Offline | Offline banner and `/state/offline` |
| 15:866 Location unavailable | `/state/location` |
| 15:884 Reminder permissions denied | `/state/reminders` recovery preview |
| 15:904 Save success | `/success?id=...` after a successful device write |
| 15:919 Nearby notification | `/state/notification` interactive preview |

The 360px Home/Add frames (15:626, 15:730), nearest-sort variant (40:2), and UI kit (15:951) informed responsive layout, tokens, and reusable components.

## Completed milestones

M0: tokens, Inter fonts, shared native components, Router stack and tabs, safe areas, typed models, AsyncStorage adapter and state provider. TypeScript and lint passed before M1.

M1: onboarding, Home carousel and radar, Map with selected-place sheet, Saved masonry/list views, Settings and preferences. Main-screen navigation and screenshots were checked before M2.

M2: TikTok video/short-link validation, clipboard paste, manual entry, restaurant form, demo place search, manual address/coordinates, confirmation, awaited local save, success, details, original link opening, visited status, notes, editing, and removal confirmation. Full local workflow tests passed before M3.

M3: empty/loading/error/offline/recovery/notification states, reduced-motion-aware transitions, press scaling and pressed color, animated filter selection and sheets, draggable map preview sheet, success animation, dark appearance, responsive phone/tablet checks, branded icon/splash, and production bundle checks.

## Files created or changed

| Path | Purpose |
| --- | --- |
| `src/app/_layout.tsx` | Fonts, boot recovery, provider, stack and status bar |
| `src/app/index.tsx` | Welcome route |
| `src/app/(tabs)/_layout.tsx` | Home/Map/Saved tabs and floating add action |
| `src/app/(tabs)/home.tsx`, `map.tsx`, `saved.tsx` | Thin tab route exports |
| `src/app/add.tsx`, `confirm.tsx`, `success.tsx`, `settings.tsx` | Thin stack route exports |
| `src/app/place/[id].tsx`, `src/app/state/[kind].tsx` | Details and additional states |
| `src/screens/welcome.tsx`, `home.tsx`, `map.tsx`, `saved.tsx`, `settings.tsx` | Main screens |
| `src/screens/add.tsx`, `confirm.tsx`, `success.tsx`, `detail.tsx`, `states.tsx` | Save flow, details and state layouts |
| `src/components/bite/ui.tsx` | Buttons, typography, inputs, chips, headers, cards and safe/keyboard-aware page |
| `src/components/bite/food.tsx` | Photo slots, food cards and video sample preview |
| `src/components/bite/demo-map.tsx` | Interactive Figma map illustration |
| `src/components/bite/live-map.native.tsx`, `live-map.tsx` | Native live map and platform fallback |
| `src/components/bite/sheet.tsx`, `loading.tsx` | Animated dialogs/sheets and loading skeleton |
| `src/constants/tokens.ts` | Final palette, fonts, spacing and radii |
| `src/constants/design-assets.ts`, `asset-dimensions.ts` | Local Figma asset references and original SVG dimensions |
| `src/hooks/use-palette.ts` | Local Light/Dark/System appearance |
| `src/models/spot.ts`, `src/data/demo.ts` | Typed places/preferences and Phnom Penh seed data |
| `src/services/places.ts`, `links.ts`, `storage.ts`, `codec.ts` | Place-search boundary, URL validation/distance, link opening, local storage and schema checks |
| `src/store/app-store.tsx` | Hydration and serialized, awaited persistence mutations |
| `src/hooks/use-color-scheme.web.ts` | Fix starter lint issue in hydration effect |
| `assets/figma/` | 135 original downloaded design assets, all non-empty |
| `assets/brand/` | Launcher foreground/icon and splash PNGs rendered from the original Figma radar SVG |
| `scripts/download-figma-assets.py`, `figma-assets.json`, `figma-screen-assets.json` | Asset download/provenance helpers; temporary export URLs are never used at runtime |
| `scripts/generate-brand.cjs` | Reproducible vector-to-PNG launcher rendering |
| `tests/`, `playwright.config.ts` | Data, workflow, navigation, recovery and responsiveness verification |
| `artifacts/` | Reviewed browser screenshots at 360/390/800px and state layouts |
| `app.json` | BiteRadar branding, tablet support, keyboard resize, Router/splash config and client-only web preview |
| `package.json`, `package-lock.json`, `eslint.config.js`, `.gitignore` | SDK-compatible dependencies, check commands and generated-test exclusions |
| `README.md`, this file | Launch instructions and handoff |

Removed starter routes/navigation: `src/app/explore.tsx`, `src/components/app-tabs.tsx`, and `src/components/app-tabs.web.tsx`.

## Persistence and behavior

Storage key: `@biteradar/personal/v1`. The first run seeds Malis, Eleven One Kitchen and David’s Restaurant. An intentionally empty saved collection stays empty after restarting. Demo records have no fabricated original video URL; a user can add one through Edit place.

Writes are serialized, and state/success updates happen after AsyncStorage resolves. A failed write keeps the current form available. Invalid or unreadable stored data is never silently replaced with demo data; the boot screen offers retry. Unsaved forms are held in memory and do not survive restarting.

Nearest sorting uses numeric distance from a fixed demo location, not the device’s position. Native live map markers use each saved record’s coordinates. The illustrated map clamps locations into its demo viewport; use the external Maps action for geographic navigation.

Privacy export opens the device share sheet with the collection as JSON. Individual and collection deletion require explicit in-app confirmation. No cloud account, social feed, public profile, or messaging is implemented.

## Verification and practical limits

- `npx tsc --noEmit` and `npx expo lint`: passed.
- `npx expo-doctor`: 20/20 checks passed.
- `npx expo install --check`: dependencies up to date for SDK 58.
- `npx expo start --web --port 8081`: starts and serves the app.
- `npx expo export --platform all --output-dir dist --max-workers 2`: Android Hermes, iOS Hermes and web bundles exported successfully. This is compilation, not installation/device testing.
- `npx playwright test`: 12 tests passed. Coverage: onboarding and tabs; complete save/reload/map/original-link/visited/edit/delete journey; manual demo selection; search/filter/sort/grid/list; invalid-link recovery; persisted preferences; corrupt-storage protection; offline and permission previews; 360px and 800px layouts. Screenshots also cover the 390px Figma target. The Metro asset server was restarted after production exports before the final browser run.
- All runtime Figma references are local. SVG assets use their exported intrinsic dimensions; map geometry is adapted to the available viewport.

Physical Android/iOS device tests, native map rendering, keyboard behavior with a real soft keyboard, OS back gestures, safe-area behavior on specific hardware, TalkBack/VoiceOver, native Share, and kill/relaunch persistence still need device acceptance testing.

The machine currently runs Node 25.2.1, which emits engine warnings for this SDK. Use Node 24 LTS for ongoing development. `npm audit` reports 20 high-severity dependency-chain findings rooted in `braces` and `node-forge`. Its suggested fixes downgrade Expo/React Native across major versions; no forced incompatible downgrades were applied. Review those transitive advisories before shipping.

## Integration boundaries

TikTok: original HTTPS URLs only. Video availability is not checked. No protected metadata access, Favorites access, scraping, or share extension. A broken original video never prevents a manual restaurant save.

Maps: `react-native-maps` is bundled with Expo Go for SDK 58. It runs without additional setup there. iOS uses the native map provider; Android standalone builds fall back to the illustration until a Google Maps key is configured. The illustration also works without map tiles or a paid service. [SDK 58 map documentation](https://docs.expo.dev/versions/v58.0.0/sdk/map-view/).

Location/reminders: no OS permission requests, device tracking, scheduled local alerts or background geofencing. All switches, radius, quiet-hour and frequency preferences are stored locally and explicitly labeled as previews. Permission-denied layouts are recovery previews and do not claim that access was actually requested or denied.

Data is device-local; uninstalling or clearing app data removes it. The web preview has no service worker, so its first page load needs the dev/hosting server. A running browser preview can still display stored text while offline; native food images and illustration assets are bundled into the app.

## Android tablet acceptance and next milestone

1. Install an Expo Go version supporting SDK 58; use Node 24 LTS on the computer.
2. Run `npm ci`, then `npx expo start --lan` in `D:\bite-radar`.
3. Put the tablet and computer on the same Wi-Fi and scan the QR code with Expo Go. Use `npx expo start --tunnel` if LAN discovery is blocked.
4. Save a real TikTok URL or use manual entry, confirm a location, and check Saved and Map.
5. Force-close/reopen, verify persistence, open the URL, toggle Visited, edit, and confirm removal.
6. Check portrait/landscape, keyboard scrolling, bottom safe area, dark mode and reduced motion on the actual tablet.

Next recommended milestone: native acceptance and an EAS development build, followed by a real Places adapter and provider credentials. Then implement foreground location and opt-in notifications/background geofencing with device permission recovery. Keep social features outside Phase A.
