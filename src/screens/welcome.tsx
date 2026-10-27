import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { Button, Icon, Page, Txt, styles } from "@/components/bite/ui";
import { designAssets as a } from "@/constants/design-assets";
import { usePalette } from "@/hooks/use-palette";
import { useApp } from "@/store/app-store";
export default function WelcomeScreen() {
  const { ready, data, error, reload, completeOnboarding } = useApp(),
    c = usePalette();
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  if (error)
    return (
      <Page>
        <Txt>{error}</Txt>
        <Button label="Try again" onPress={reload} />
      </Page>
    );
  if (!ready)
    return (
      <Page>
        <Txt>Opening your radar…</Txt>
      </Page>
    );
  if (data.onboarded) return <Redirect href="/home" />;
  return (
    <Page>
      <View style={[styles.row, { gap: 10, paddingVertical: 4 }]}>
        <View
          style={{ padding: 7, borderRadius: 12, backgroundColor: c.primary }}
        >
          <Icon name="radar" />
        </View>
        <Txt size={24} weight="extra">
          BiteRadar
        </Txt>
      </View>
      <View style={{ height: 276, marginTop: -10 }}>
        <View
          style={{
            height: 252,
            backgroundColor: "#F4F0E7",
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              right: 0,
              width: 38,
              height: 252,
              backgroundColor: "#CCE4E7",
            }}
          />
          <View
            style={{
              position: "absolute",
              right: 52,
              top: 96,
              width: 58,
              height: 76,
              borderRadius: 12,
              backgroundColor: "#DCE7D5",
            }}
          />
          <View
            style={{
              position: "absolute",
              right: 76,
              width: 8,
              height: 252,
              backgroundColor: "white",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 198,
              width: "100%",
              height: 8,
              backgroundColor: "white",
            }}
          />
          <View
            style={{
              position: "absolute",
              right: 58,
              top: 56,
              padding: 11,
              backgroundColor: c.primary,
              borderRadius: 24,
              borderBottomRightRadius: 4,
            }}
          >
            <Icon name="utensils" />
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            left: 20,
            top: 14,
            width: 208,
            padding: 7,
            borderRadius: 24,
            backgroundColor: c.surface,
            transform: [{ rotate: "-7deg" }],
            boxShadow: "0px 6px 20px rgba(52,35,25,0.07)",
          }}
        >
          <Image
            source={a["15:3"].imgFoodPhotograph}
            contentFit="cover"
            style={{ width: 194, height: 188, borderRadius: 18 }}
          />
          <View
            style={[
              styles.between,
              { paddingTop: 7, paddingHorizontal: 5, paddingBottom: 4 },
            ]}
          >
            <Txt size={14} weight="bold">
              Malis
            </Txt>
            <Txt size={11} style={{ color: c.link }}>
              On your radar ↗
            </Txt>
          </View>
        </View>
        <View
          style={[
            styles.row,
            {
              position: "absolute",
              right: 7,
              top: 216,
              backgroundColor: c.surface,
              borderRadius: 30,
              paddingHorizontal: 13,
              paddingVertical: 10,
              boxShadow: "0px 6px 20px rgba(52,35,25,0.07)",
            },
          ]}
        >
          <Icon name="lock" />
          <Txt size={12} weight="bold">
            Just for your cravings
          </Txt>
        </View>
      </View>
      <View style={{ gap: 16, marginTop: -10 }}>
        <Txt
          size={36}
          weight="extra"
          style={{ lineHeight: 42, letterSpacing: -0.5 }}
        >
          Never forget a food spot again.
        </Txt>
        <Txt size={15} muted>
          Save the places you find on TikTok and get reminded when you’re
          nearby.
        </Txt>
        <View style={{ gap: 12, paddingVertical: 8 }}>
          {(
            [
              ["link", "Save a link", "Paste a TikTok or add a place."],
              ["pin", "Pin the right spot", "Check its location on your map."],
              ["bell", "Find it nearby", "Opt in to a gentle reminder."],
            ] as const
          ).map(([icon, title, description]) => (
            <View key={title} style={[styles.row, { gap: 12 }]}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  backgroundColor: c.accent,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name={icon} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={13} weight="bold">
                  {title}
                </Txt>
                <Txt size={12} muted>
                  {description}
                </Txt>
              </View>
            </View>
          ))}
        </View>
        <Button
          label="Get Started"
          icon="arrow"
          busy={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await completeOnboarding();
            } catch {
              setFailure("Could not save your preferences. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        />
        {failure ? <Txt>{failure}</Txt> : null}
        <Txt size={11} muted style={{ textAlign: "center" }}>
          Location is optional. Nearby reminders are a preview in this release.
        </Txt>
        <Txt
          size={11}
          weight="semibold"
          style={{ color: c.link, textAlign: "center" }}
        >
          Save the food. Find it when you&apos;re nearby.
        </Txt>
      </View>
    </Page>
  );
}
