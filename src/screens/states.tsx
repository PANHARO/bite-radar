import { useState } from "react";
import { Linking, Platform, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import * as Network from "expo-network";
import {
  Asset,
  Button,
  Card,
  Field,
  Header,
  Notice,
  Page,
  Tap,
  Txt,
  styles,
} from "@/components/bite/ui";
import { LoadingSkeleton } from "@/components/bite/loading";
import { designAssets as a } from "@/constants/design-assets";
import { useApp } from "@/store/app-store";
import { usePalette } from "@/hooks/use-palette";
import { isTikTokUrl } from "@/services/places";
export default function StateScreen() {
  const { kind } = useLocalSearchParams<{ kind: string }>(),
    app = useApp(),
    c = usePalette();
  const [url, setUrl] = useState(app.draft?.tiktokUrl || ""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const spot = app.data.spots[0];
  const settings = async () => {
    if (Platform.OS === "web") {
      setMessage(
        "Open BiteRadar’s app permissions in your Android or iOS device settings.",
      );
      return;
    }
    try {
      await Linking.openSettings();
    } catch {
      setMessage("Open your device settings and choose BiteRadar.");
    }
  };
  const manual = () => {
    if (app.draft) app.setDraft({ ...app.draft, tiktokUrl: "" });
    router.replace({ pathname: "/add", params: { manual: "true" } });
  };
  return (
    <Page>
      <Header close={false} />
      <Txt size={12} weight="bold" style={{ color: c.link }}>
        {kind === "unavailable"
          ? "SAVE → RECOVER"
          : kind === "offline"
            ? "COLLECTION → OFFLINE"
            : kind === "notification"
              ? "REMINDER PREVIEW"
              : kind === "location"
                ? "MAP → MANUAL CITY"
                : kind === "reminders"
                  ? "PERMISSION RECOVERY PREVIEW"
                  : kind === "loading"
                    ? "LOADING LAYOUT PREVIEW"
                    : "YOUR PRIVATE COLLECTION"}
      </Txt>
      {kind === "loading" ? (
        <>
          <Txt size={28} weight="extra">
            One delicious moment…
          </Txt>
          <LoadingSkeleton />
          <Txt muted>
            This is the loading layout. TikTok metadata and place matching are
            not fetched in Phase A.
          </Txt>
          <Button
            label="Enter restaurant manually"
            secondary
            onPress={manual}
          />
        </>
      ) : kind === "unavailable" ? (
        <>
          <Asset source={a["15:829"].imgLink2Off} width={40} height={40} />
          <Txt size={30} weight="extra">
            Still worth saving.
          </Txt>
          <Field
            label="TikTok link"
            icon="link"
            accessibilityLabel="Retry TikTok URL"
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
          />
          <Notice icon="link">
            We couldn’t validate this TikTok URL. Use a video or short link, or
            enter the restaurant manually. Video availability isn’t checked.
          </Notice>
          <Button
            label="Try link again"
            onPress={() => {
              if (!isTikTokUrl(url)) {
                setMessage(
                  "Enter a valid HTTPS TikTok video link. Your notes are still here.",
                );
                return;
              }
              if (app.draft)
                app.setDraft({ ...app.draft, tiktokUrl: url.trim() });
              router.dismissTo("/add");
            }}
          />
          <Button
            label="Enter restaurant manually"
            secondary
            onPress={manual}
          />
          <Txt muted>
            Search for the place, add your note and confirm its location. A
            video isn’t required. Nothing has been saved yet.
          </Txt>
        </>
      ) : kind === "offline" ? (
        <>
          <Txt size={30} weight="extra">
            Good taste travels.
          </Txt>
          <Notice icon="bellOff">
            You can keep reading your saved names, addresses and notes offline.
            Opening videos or a live map needs internet.
          </Notice>
          {app.data.spots.map((s) => (
            <Tap
              key={s.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: "/place/[id]", params: { id: s.id } })
              }
            >
              <Card style={{ gap: 4 }}>
                <Txt weight="bold">{s.name}</Txt>
                <Txt>{s.address}</Txt>
                <Txt muted>{s.notes || "No note yet."}</Txt>
              </Card>
            </Tap>
          ))}
          {!app.data.spots.length && (
            <Txt muted>
              Your collection is empty. You can still add a place manually.
            </Txt>
          )}
          <Button
            label="Try connection again"
            secondary
            busy={busy}
            onPress={async () => {
              setBusy(true);
              try {
                const n = await Network.getNetworkStateAsync();
                if (n.isConnected && n.isInternetReachable !== false)
                  router.dismissTo("/saved");
                else
                  setMessage(
                    "You’re still offline. Your saved collection is available.",
                  );
              } catch {
                setMessage(
                  "Could not check the connection. Your saved collection is available.",
                );
              } finally {
                setBusy(false);
              }
            }}
          />
          <Txt size={11} muted>
            All sample food photos and the illustrated map are bundled locally.
            This screen also serves as an offline layout preview.
          </Txt>
        </>
      ) : kind === "location" ? (
        <>
          <Asset source={a["15:866"].imgLandmark} width={40} height={40} />
          <Txt size={30} weight="extra">
            A city is a good start.
          </Txt>
          <Notice icon="pin">
            Current location is unavailable. You can still save food spots. This
            release uses a demo location in Phnom Penh.
          </Notice>
          <Field
            label="Choose your city"
            value="Phnom Penh, Cambodia"
            editable={false}
            icon="search"
            accessibilityLabel="Demo city"
          />
          <Button
            label="Explore Phnom Penh"
            onPress={() => router.dismissTo("/map")}
          />
          <Button
            label="Open device location settings"
            secondary
            onPress={() => {
              void settings();
            }}
          />
          <Txt size={12} muted>
            Location access is optional. Live Near Me and background reminders
            will be added later. This also previews the fallback shown when
            location access is denied.
          </Txt>
        </>
      ) : kind === "reminders" ? (
        <>
          <Txt size={30} weight="extra">
            Your spot is safe.{"\n"}Alerts are paused.
          </Txt>
          <Txt muted>You can keep saving places without reminders.</Txt>
          <View style={styles.between}>
            <Txt size={16} weight="bold">
              Nearby reminders · Off
            </Txt>
            <View
              style={{
                backgroundColor: c.border,
                width: 48,
                height: 28,
                borderRadius: 20,
                padding: 3,
              }}
            >
              <View
                style={{
                  backgroundColor: c.surface,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                }}
              />
            </View>
          </View>
          <Notice icon="bellOff">
            When notifications are blocked, allow alerts in device settings.
          </Notice>
          <Notice icon="pin">
            When background location is denied, choose Always / Allow all the
            time in a future development build.
          </Notice>
          <Button
            label="Open device settings"
            onPress={() => {
              void settings();
            }}
          />
          <Button
            label="Not now · Keep reminders off"
            secondary
            onPress={async () => {
              try {
                await app.setPreferences({ reminderPreview: false });
                router.dismissTo("/settings");
              } catch {
                setMessage("Could not save this preference. Please try again.");
              }
            }}
          />
          <Txt size={11} muted>
            Permission recovery preview. This release does not request
            notification or location access and does not send live alerts.
          </Txt>
        </>
      ) : kind === "notification" ? (
        <>
          <View
            style={{ borderRadius: 28, overflow: "hidden", minHeight: 540 }}
          >
            <Image
              source={a["15:919"].imgWallpaper}
              contentFit="cover"
              style={{ position: "absolute", width: "100%", height: "100%" }}
            />
            <View style={{ padding: 20, gap: 24, paddingTop: 40 }}>
              <Txt
                size={14}
                weight="semibold"
                style={{ textAlign: "center", color: "#202124" }}
              >
                Monday, October 19
              </Txt>
              <Txt
                size={72}
                style={{
                  textAlign: "center",
                  color: "#202124",
                  lineHeight: 80,
                }}
              >
                12:41
              </Txt>
              <Tap
                onPress={() =>
                  spot
                    ? router.push({
                        pathname: "/place/[id]",
                        params: { id: spot.id },
                      })
                    : router.replace("/saved")
                }
                accessibilityRole="button"
                accessibilityLabel="Open nearby notification restaurant"
              >
                <View
                  style={{
                    backgroundColor: "#FFF9E8",
                    borderRadius: 28,
                    padding: 18,
                    gap: 12,
                  }}
                >
                  <View style={styles.between}>
                    <View style={styles.row}>
                      <Asset
                        source={a["15:919"].imgRadar}
                        width={22}
                        height={22}
                      />
                      <Txt size={11} weight="bold" style={{ color: "#202124" }}>
                        BITERADAR
                      </Txt>
                    </View>
                    <Txt size={11} style={{ color: "#57534F" }}>
                      now
                    </Txt>
                  </View>
                  <View style={styles.row}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <Txt
                        size={16}
                        weight="extra"
                        style={{ color: "#202124" }}
                      >
                        That fish amok?{"\n"}It’s just around the corner.
                      </Txt>
                      <Txt size={13} style={{ color: "#57534F" }}>
                        {spot?.name || "Your saved place"} is nearby. You saved
                        it for a day like today.
                      </Txt>
                    </View>
                    <Image
                      source={a["15:919"].imgFoodPhotograph}
                      contentFit="cover"
                      style={{ width: 66, height: 80, borderRadius: 14 }}
                    />
                  </View>
                  <Txt size={12} weight="semibold" style={{ color: "#806000" }}>
                    Open {spot?.name || "your collection"} in BiteRadar →
                  </Txt>
                </View>
              </Tap>
            </View>
          </View>
          <Txt size={18} weight="extra">
            A nudge, not a feed.
          </Txt>
          <Txt muted>
            Notification preview only · No notification was sent. Your current
            saved radius is {app.data.preferences.radius} m. Live reminders will
            require an opt-in and device permissions.
          </Txt>
        </>
      ) : (
        <>
          <Txt size={28} weight="extra">
            My Saved Food
          </Txt>
          <View
            style={{
              height: 178,
              backgroundColor: c.accent,
              borderRadius: 28,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Asset
              source={a["15:797"].imgBookmarkPlus}
              width={40}
              height={40}
            />
          </View>
          <Txt size={24} weight="bold">
            Your next favorite starts here.
          </Txt>
          <Txt muted>
            Save a TikTok link or search for a restaurant. We’ll keep it here,
            just for you. No followers. No feed. Just your future cravings.
          </Txt>
          <Button
            label="Save your first food spot"
            icon="plus"
            onPress={() => router.replace("/add")}
          />
          <Button label="Find a place manually" secondary onPress={manual} />
        </>
      )}
      {message ? (
        <Txt
          size={13}
          style={{ color: c.link }}
          accessibilityLiveRegion="polite"
        >
          {message}
        </Txt>
      ) : null}
    </Page>
  );
}
