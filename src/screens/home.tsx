import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Icon,
  IconButton,
  Page,
  Section,
  Tap,
  Txt,
  styles,
} from "@/components/bite/ui";
import { NearbyCard, RecentCard } from "@/components/bite/food";
import { DemoMap } from "@/components/bite/demo-map";
import { useApp } from "@/store/app-store";
import { distanceMeters } from "@/services/places";
import { usePalette } from "@/hooks/use-palette";
export default function HomeScreen() {
  const { data } = useApp(),
    c = usePalette();
  const nearby = [...data.spots].sort(
    (a, b) => distanceMeters(a) - distanceMeters(b),
  );
  const recent = [...data.spots].sort((a, b) => b.createdAt - a.createdAt)[0];
  return (
    <Page padded={false}>
      <View style={{ paddingHorizontal: 24, gap: 12 }}>
        <View style={styles.between}>
          <Tap
            onPress={() => router.push("/state/location")}
            accessibilityRole="button"
          >
            <View style={[styles.row, { minHeight: 44 }]}>
              <Icon name="pin" />
              <Txt size={13} weight="bold">
                Phnom Penh
              </Txt>
              <Icon name="down" />
            </View>
          </Tap>
          <IconButton
            name="settings"
            label="Settings and reminders"
            onPress={() => router.push("/settings")}
          />
        </View>
        <Txt size={32} weight="extra" style={{ lineHeight: 37 }}>
          Hungry for{"\n"}something good?
        </Txt>
        <Txt size={13} muted>
          Your next craving is already on the map.
        </Txt>
      </View>
      <View style={{ gap: 12 }}>
        <View style={{ paddingHorizontal: 24 }}>
          <Section
            title="Near You"
            action="See map ↗"
            onPress={() => router.navigate("/map")}
          />
        </View>
        {nearby.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 14,
              paddingHorizontal: 24,
              paddingBottom: 8,
            }}
          >
            {nearby.map((s) => (
              <NearbyCard key={s.id} spot={s} />
            ))}
          </ScrollView>
        ) : (
          <View style={{ paddingHorizontal: 24 }}>
            <Txt muted>Your next favorite starts here.</Txt>
            <Button
              label="Save your first food spot"
              onPress={() => router.push("/add")}
            />
          </View>
        )}
      </View>
      <View style={{ paddingHorizontal: 24, gap: 12 }}>
        <Section
          title="Your Food Radar"
          action="Explore ↗"
          onPress={() => router.navigate("/map")}
        />
        <View>
          <DemoMap
            spots={data.spots}
            selectedId={nearby[0]?.id}
            onSelect={(s) =>
              router.navigate({ pathname: "/map", params: { selected: s.id } })
            }
            mini
            height={182}
          />
          <Tap
            onPress={() => router.navigate("/map")}
            style={{ position: "absolute", top: 12, left: 12 }}
          >
            <View
              style={{
                backgroundColor: c.surface,
                paddingHorizontal: 10,
                paddingVertical: 7,
                borderRadius: 20,
              }}
            >
              <Txt size={11} weight="bold">
                ◉ {data.spots.length} saved spots
              </Txt>
            </View>
          </Tap>
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, gap: 12 }}>
        <Section
          title="Recently Saved"
          action="View all"
          onPress={() => router.navigate("/saved")}
        />
        {recent ? (
          <RecentCard spot={recent} />
        ) : (
          <Txt muted>Your private collection is ready for its first spot.</Txt>
        )}
      </View>
      <View style={{ paddingHorizontal: 24, gap: 12, paddingBottom: 64 }}>
        <Tap onPress={() => router.push("/settings")}>
          <View style={styles.row}>
            <Icon name="bellOff" />
            <Txt size={11} muted>
              {data.preferences.reminderPreview
                ? "Reminder preview is on · No live alerts"
                : "Quick Reminder is off · Set up when you’re ready"}
            </Txt>
          </View>
        </Tap>
        <Button
          label="Save a Food Spot"
          icon="plus"
          onPress={() => router.push("/add")}
        />
        <Txt size={10} style={{ color: c.secondary }}>
          Private collection · Demo places and distances
        </Txt>
      </View>
    </Page>
  );
}
