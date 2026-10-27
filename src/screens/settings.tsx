import { useState } from "react";
import { ScrollView, Share, Switch, View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Card,
  Chip,
  Header,
  Icon,
  Notice,
  Page,
  Tap,
  Txt,
  styles,
} from "@/components/bite/ui";
import { Sheet } from "@/components/bite/sheet";
import { useApp } from "@/store/app-store";
import { usePalette } from "@/hooks/use-palette";
import { Preferences } from "@/models/spot";
export default function SettingsScreen() {
  const { data, setPreferences, clearSpots } = useApp(),
    c = usePalette(),
    p = data.preferences;
  const [sheet, setSheet] = useState(""),
    [failure, setFailure] = useState(""),
    [busy, setBusy] = useState(false);
  const update = (patch: Partial<Preferences>) => {
    void setPreferences(patch).catch(() =>
      setFailure("Could not save preferences. Please try again."),
    );
  };
  return (
    <Page>
      <Header
        title="Your radar, your rules."
        subtitle="A little nudge. Only when you want one."
      />
      <Card style={{ gap: 10 }}>
        <Txt size={12} weight="extra">
          LOCATION &amp; NOTIFICATIONS
        </Txt>
        {[
          ["While using the app", "Not requested"],
          ["Background location", "Not requested"],
          ["Notifications", "Not requested"],
        ].map(([label, value]) => (
          <View key={label} style={styles.between}>
            <Txt size={12}>{label}</Txt>
            <Txt size={11} weight="semibold" style={{ color: c.link }}>
              {value}
            </Txt>
          </View>
        ))}
        <Txt size={11} muted>
          Explore demo places without sharing your location. Live nearby
          reminders arrive in a later milestone.
        </Txt>
      </Card>
      <View style={styles.between}>
        <View style={{ flex: 1 }}>
          <Txt size={18} weight="extra">
            Nearby reminders
          </Txt>
          <Txt size={12} muted>
            {p.reminderPreview
              ? "Preview on · No live alerts"
              : "Off · Your choice, always"}
          </Txt>
        </View>
        <Switch
          accessibilityLabel="Reminder preview"
          value={p.reminderPreview}
          onValueChange={(v) => update({ reminderPreview: v })}
          trackColor={{ false: "#777777", true: "#E6B800" }}
          thumbColor="#FFFFFF"
        />
      </View>
      <Notice>
        {p.reminderPreview
          ? "Preview only. Your saved preferences are active; live notifications and location tracking are not enabled."
          : "Set up when you’re ready. This release previews reminders without requesting notifications or background location."}
      </Notice>
      <View style={{ gap: 6 }}>
        <View style={styles.between}>
          <Txt size={13} weight="semibold">
            Remind me within
          </Txt>
          <Txt size={10} muted>
            Saved preference
          </Txt>
        </View>
        <View style={styles.row}>
          {[200, 500, 1000].map((radius) => (
            <Chip
              key={radius}
              label={radius === 1000 ? "1 km" : `${radius} m`}
              active={p.radius === radius}
              onPress={() => update({ radius })}
            />
          ))}
        </View>
      </View>
      <Card style={{ paddingVertical: 4 }}>
        {[
          [
            "Frequency",
            p.frequency === "daily"
              ? "Once per place per day"
              : "Once per place",
            "frequency",
          ],
          ["Quiet hours", p.quietHours ? "10:00 PM – 8:00 AM" : "Off", "quiet"],
        ].map(([title, value, key], i) => (
          <Tap
            key={key}
            onPress={() => setSheet(key)}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.row,
                {
                  paddingVertical: 16,
                  borderTopWidth: i ? 1 : 0,
                  borderColor: c.border,
                },
              ]}
            >
              <Icon name={i ? "bellOff" : "bell"} />
              <View style={{ flex: 1 }}>
                <Txt size={13} weight="semibold">
                  {title}
                </Txt>
                <Txt size={12} muted>
                  {value}
                </Txt>
              </View>
              <Icon name="chevron" />
            </View>
          </Tap>
        ))}
      </Card>
      <Txt size={11} muted>
        These preferences are stored on this device. Reminder previews do not
        send notifications.
      </Txt>
      <View style={{ gap: 12 }}>
        <Txt size={18} weight="extra">
          Private by design
        </Txt>
        <Card style={{ paddingVertical: 4 }}>
          {[
            ["Account", "Personal collection · this device", "account"],
            [
              "Privacy & your data",
              "Export or delete your saved spots",
              "privacy",
            ],
          ].map(([title, value, key]) => (
            <Tap
              key={key}
              onPress={() => setSheet(key)}
              accessibilityRole="button"
            >
              <View style={[styles.row, { paddingVertical: 14 }]}>
                <Icon name="lock" />
                <View style={{ flex: 1 }}>
                  <Txt size={13} weight="semibold">
                    {title}
                  </Txt>
                  <Txt size={12} muted>
                    {value}
                  </Txt>
                </View>
                <Icon name="chevron" />
              </View>
            </Tap>
          ))}
        </Card>
      </View>
      <View style={{ gap: 6 }}>
        <Txt size={13} weight="semibold">
          Appearance
        </Txt>
        <View style={styles.row}>
          {(["Light", "Dark", "System"] as const).map((v) => (
            <Chip
              key={v}
              label={v}
              active={p.appearance === v}
              onPress={() => update({ appearance: v })}
            />
          ))}
        </View>
      </View>
      <Button
        label="Preview a nearby notification"
        secondary
        onPress={() => router.push("/state/notification")}
      />
      <Tap onPress={() => setSheet("states")}>
        <Txt
          size={12}
          style={{ color: c.link, textAlign: "center", paddingVertical: 12 }}
        >
          Preview app states
        </Txt>
      </Tap>
      {failure ? <Txt style={{ color: c.danger }}>{failure}</Txt> : null}
      <Txt size={10} muted style={{ textAlign: "center" }}>
        BiteRadar · Phase A{"\n"}Save the food. Find it when you&apos;re nearby.
      </Txt>
      <Sheet
        visible={!!sheet}
        title={
          sheet === "privacy"
            ? "Privacy & your data"
            : sheet === "frequency"
              ? "Reminder frequency"
              : sheet === "quiet"
                ? "Quiet hours"
                : sheet === "delete"
                  ? "Delete all saved places?"
                  : sheet === "states"
                    ? "App state previews"
                    : "Your personal collection"
        }
        onClose={() => setSheet("")}
      >
        {sheet === "frequency" ? (
          <>
            {(["daily", "once"] as const).map((v) => (
              <Button
                key={v}
                label={
                  v === "daily" ? "Once per place per day" : "Once per place"
                }
                secondary={p.frequency !== v}
                onPress={() => {
                  update({ frequency: v });
                  setSheet("");
                }}
              />
            ))}
          </>
        ) : sheet === "quiet" ? (
          <View style={styles.between}>
            <Txt>10:00 PM – 8:00 AM</Txt>
            <Switch
              value={p.quietHours}
              onValueChange={(quietHours) => update({ quietHours })}
              accessibilityLabel="Quiet hours"
              trackColor={{ true: "#E6B800" }}
            />
          </View>
        ) : sheet === "privacy" ? (
          <>
            <Txt muted>
              Your {data.spots.length} saved spots live in local device storage.
              No account, upload or cloud sync is used.
            </Txt>
            <Button
              label="Export saved places as JSON"
              secondary
              onPress={() => {
                void Share.share({
                  title: "BiteRadar collection",
                  message: JSON.stringify(data, null, 2),
                }).catch(() => setFailure("Could not open the share menu."));
              }}
            />
            <Button
              label="Delete all saved places"
              secondary
              onPress={() => setSheet("delete")}
            />
          </>
        ) : sheet === "delete" ? (
          <>
            <Txt>
              This removes your collection from this device. This cannot be
              undone.
            </Txt>
            <Button
              label="Delete collection"
              busy={busy}
              onPress={async () => {
                setBusy(true);
                try {
                  await clearSpots();
                  setSheet("");
                } catch {
                  setFailure("Could not delete your collection.");
                } finally {
                  setBusy(false);
                }
              }}
            />
          </>
        ) : sheet === "states" ? (
          <ScrollView style={{ maxHeight: 320 }}>
            {[
              ["empty", "Empty collection"],
              ["loading", "Loading a food spot"],
              ["unavailable", "Unavailable TikTok link"],
              ["offline", "Offline saved places"],
              ["location", "Location unavailable"],
              ["reminders", "Reminder permissions denied"],
              ["notification", "Nearby notification"],
            ].map(([kind, label]) => (
              <Tap
                key={kind}
                onPress={() => {
                  setSheet("");
                  router.push({ pathname: "/state/[kind]", params: { kind } });
                }}
              >
                <Txt style={{ paddingVertical: 12 }}>{label} →</Txt>
              </Tap>
            ))}
          </ScrollView>
        ) : (
          <Txt muted>
            Your private collection is stored on this device. You have{" "}
            {data.spots.length} saved food spots. Sign-in and social features
            are outside Phase A.
          </Txt>
        )}
      </Sheet>
    </Page>
  );
}
