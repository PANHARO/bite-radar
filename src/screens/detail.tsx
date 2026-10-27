import { useState } from "react";
import { Switch, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Card,
  Chip,
  Field,
  Icon,
  IconButton,
  Notice,
  Page,
  Tap,
  Txt,
  styles,
} from "@/components/bite/ui";
import { FoodPhoto, VideoPreview } from "@/components/bite/food";
import { Sheet } from "@/components/bite/sheet";
import { useApp } from "@/store/app-store";
import { usePalette } from "@/hooks/use-palette";
import { distanceLabel } from "@/services/places";
import { openMaps, openUrl } from "@/services/links";
export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    app = useApp(),
    c = usePalette();
  const spot = app.data.spots.find((s) => s.id === id);
  const [sheet, setSheet] = useState(""),
    [notes, setNotes] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (!spot)
    return (
      <Page>
        <Txt size={28} weight="extra">
          This spot is no longer here.
        </Txt>
        <Button
          label="My Saved Food"
          onPress={() => router.dismissTo("/saved")}
        />
      </Page>
    );
  const edit = () => {
    app.setDraft(spot);
    router.push({ pathname: "/add", params: { id: spot.id } });
  };
  const fail = (e: unknown) =>
    setError(
      e instanceof Error
        ? e.message
        : "Could not update your saved place. Please try again.",
    );
  const openTikTok = () => {
    if (!spot.tiktokUrl) {
      setSheet("video");
      return;
    }
    void openUrl(spot.tiktokUrl).catch(fail);
  };
  return (
    <Page padded={false}>
      <View style={{ marginTop: -8 }}>
        <FoodPhoto spot={spot} slot="detail" height={322} radius={0} />
        <View style={{ position: "absolute", left: 24, top: 12 }}>
          <IconButton
            name="back"
            label="Go back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.dismissTo("/saved")
            }
          />
        </View>
        <View style={{ position: "absolute", right: 24, top: 12 }}>
          <IconButton
            name="bookmark"
            label="View saved collection"
            onPress={() => router.navigate("/saved")}
          />
        </View>
        <View
          style={{
            position: "absolute",
            left: 24,
            bottom: 16,
            borderRadius: 20,
            backgroundColor: c.surface,
            paddingHorizontal: 12,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name="lock" />
          <Txt size={11} weight="bold">
            In your private collection
          </Txt>
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, gap: 24 }}>
        <View style={{ gap: 10 }}>
          <View style={styles.between}>
            <Txt size={34} weight="extra" style={{ flex: 1 }}>
              {spot.name}
            </Txt>
            <IconButton name="edit" label="Edit restaurant" onPress={edit} />
          </View>
          <Txt muted>
            {spot.category} food · {distanceLabel(spot)} away
          </Txt>
          <View style={styles.row}>
            <Icon name="pin" />
            <Txt size={12} muted style={{ flex: 1 }}>
              {spot.address}
            </Txt>
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <Txt size={13} weight="bold">
            Have you been?
          </Txt>
          <View style={styles.row}>
            {[false, true].map((v) => (
              <Chip
                key={String(v)}
                label={v ? "✓ Visited" : "♡ Want to try"}
                active={spot.visited === v}
                onPress={() => {
                  void app.updateSpot(spot.id, { visited: v }).catch(fail);
                }}
              />
            ))}
          </View>
        </View>
        <Tap
          onPress={() => {
            setNotes(spot.notes);
            setSheet("notes");
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit personal note"
        >
          <View
            style={{
              backgroundColor: c.accent,
              borderRadius: 20,
              padding: 16,
              gap: 8,
            }}
          >
            <View style={styles.between}>
              <Txt size={12} weight="extra">
                A note to future you
              </Txt>
              <Icon name="edit" />
            </View>
            <Txt size={14}>
              {spot.notes || "Add a dish, a craving, a reason to go…"}
            </Txt>
          </View>
        </Tap>
        <View style={{ gap: 12 }}>
          <Txt size={18} weight="extra">
            The video that started it
          </Txt>
          <VideoPreview hasUrl={!!spot.tiktokUrl} onPress={openTikTok} />
          <Txt size={10} muted>
            Illustrative food preview · Not fetched TikTok metadata
          </Txt>
        </View>
        <Tap onPress={() => router.push("/settings")}>
          <Card style={{ gap: 10 }}>
            <View style={styles.row}>
              <Icon name="bell" />
              <View style={{ flex: 1 }}>
                <Txt size={14} weight="bold">
                  Remind me nearby
                </Txt>
                <Txt size={11} muted>
                  {app.data.preferences.reminderPreview
                    ? "Preview on · No live alerts"
                    : "Off · Set up when you’re ready"}
                </Txt>
              </View>
              <Switch
                accessibilityLabel="Configure nearby reminders"
                value={app.data.preferences.reminderPreview}
                onValueChange={() => router.push("/settings")}
                trackColor={{ true: "#E6B800" }}
              />
            </View>
            <Txt size={11} muted>
              Optional. Your preference is local. Live notifications and
              background location will come later.
            </Txt>
          </Card>
        </Tap>
        {error ? (
          <Txt
            size={12}
            style={{ color: c.danger }}
            accessibilityLiveRegion="polite"
          >
            {error}
          </Txt>
        ) : null}
        <View style={{ gap: 12 }}>
          <Button
            label="Open in Maps"
            icon="arrow"
            onPress={() => {
              void openMaps(spot).catch(fail);
            }}
          />
          <Button
            label={
              spot.tiktokUrl
                ? "Open Original TikTok"
                : "Add Original TikTok Link"
            }
            secondary
            icon="arrow"
            onPress={openTikTok}
          />
        </View>
        <View style={styles.between}>
          <Tap onPress={edit} accessibilityRole="button">
            <Txt size={12} weight="bold" style={{ padding: 12 }}>
              Edit place
            </Txt>
          </Tap>
          <Tap onPress={() => setSheet("delete")} accessibilityRole="button">
            <Txt size={12} weight="bold" style={{ color: c.link, padding: 12 }}>
              Remove place
            </Txt>
          </Tap>
        </View>
        <Txt size={10} muted>
          Demo distance · No ratings or availability claims
        </Txt>
      </View>
      <Sheet
        visible={!!sheet}
        title={
          sheet === "delete"
            ? `Remove ${spot.name}?`
            : sheet === "notes"
              ? "A note to future you"
              : "Keep the original video"
        }
        onClose={() => setSheet("")}
      >
        {sheet === "delete" ? (
          <>
            <Txt muted>
              This removes the place and its saved link from this device. This
              cannot be undone.
            </Txt>
            <Button
              label="Remove this place"
              busy={busy}
              onPress={async () => {
                setBusy(true);
                try {
                  await app.removeSpot(spot.id);
                  router.dismissTo("/saved");
                } catch (e) {
                  fail(e);
                  setBusy(false);
                }
              }}
            />
          </>
        ) : sheet === "notes" ? (
          <>
            <Field
              accessibilityLabel="Edit personal notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={2000}
            />
            <Button
              label="Save note"
              busy={busy}
              onPress={async () => {
                setBusy(true);
                try {
                  await app.updateSpot(spot.id, { notes });
                  setSheet("");
                } catch (e) {
                  fail(e);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </>
        ) : (
          <>
            <Notice icon="link">
              This place has no saved TikTok URL. Demo photography is a sample,
              not a video.
            </Notice>
            <Button
              label="Add a TikTok link"
              onPress={() => {
                setSheet("");
                edit();
              }}
            />
          </>
        )}
      </Sheet>
    </Page>
  );
}
