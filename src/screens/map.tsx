import { useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, {
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Button,
  Card,
  Chip,
  Field,
  Icon,
  Page,
  Tap,
  Txt,
  styles,
} from "@/components/bite/ui";
import { DemoMap } from "@/components/bite/demo-map";
import LiveMap, { liveMapAvailable } from "@/components/bite/live-map";
import { FoodPhoto } from "@/components/bite/food";
import { useApp } from "@/store/app-store";
import { usePalette } from "@/hooks/use-palette";
import { distanceLabel } from "@/services/places";
import { openMaps } from "@/services/links";
export default function MapScreen() {
  const { data } = useApp(),
    c = usePalette();
  const params = useLocalSearchParams<{ selected?: string }>();
  const [selected, select] = useState(params.selected || data.spots[0]?.id),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All food"),
    [illustration, setIllustration] = useState(!liveMapAvailable),
    [failure, setFailure] = useState("");
  const visible = data.spots.filter(
    (s) =>
      `${s.name} ${s.category} ${s.notes}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "All food" ||
        (filter === "Visited" && s.visited) ||
        (filter === "Khmer" && s.category === "Khmer")),
  );
  const spot =
    visible.find((s) => s.id === (params.selected || selected)) || visible[0];
  const translate = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: translate.value }],
  }));
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translate.set(Math.max(0, Math.min(72, e.translationY)));
    })
    .onEnd(() => {
      translate.set(
        withTiming(0, { duration: 250, reduceMotion: ReduceMotion.System }),
      );
    });
  const MapComponent = illustration ? DemoMap : LiveMap;
  return (
    <Page padded={false}>
      <View style={{ position: "relative" }}>
        <MapComponent
          spots={visible}
          selectedId={spot?.id}
          onSelect={(s) => {
            select(s.id);
            router.setParams({ selected: s.id });
          }}
          height={540}
        />
        <View
          style={{ position: "absolute", top: 8, left: 24, right: 24, gap: 8 }}
        >
          <Field
            icon="search"
            placeholder="Search your food radar"
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search map"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {["All food", "Khmer", "Visited"].map((f) => (
              <Chip
                key={f}
                label={f}
                active={filter === f}
                onPress={() => setFilter(f)}
              />
            ))}
          </ScrollView>
        </View>
        <Tap
          onPress={() => router.push("/state/location")}
          style={{ position: "absolute", right: 24, top: 368 }}
          accessibilityRole="button"
        >
          <Card style={{ paddingVertical: 10, borderRadius: 24 }}>
            <View style={styles.row}>
              <Icon name="locate" />
              <Txt size={12} weight="bold">
                Near Me
              </Txt>
            </View>
          </Card>
        </Tap>
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 24,
            right: 24,
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <View
            style={{ backgroundColor: c.surface, borderRadius: 16, padding: 8 }}
          >
            <Txt size={10} muted>
              Phnom Penh · {visible.length} private spots
            </Txt>
          </View>
          {liveMapAvailable && (
            <Tap onPress={() => setIllustration(!illustration)}>
              <Card style={{ padding: 8 }}>
                <Txt size={10}>
                  {illustration ? "Live map" : "Illustrated map"}
                </Txt>
              </Card>
            </Tap>
          )}
        </View>
      </View>
      <Animated.View style={animated}>
        <Animated.View
          key={spot?.id || "empty"}
          entering={FadeInDown.duration(300).reduceMotion(ReduceMotion.System)}
          style={[
            {
              marginTop: -24,
              backgroundColor: c.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingTop: 12,
              gap: 14,
            },
          ]}
        >
          <GestureDetector gesture={pan}>
            <View
              collapsable={false}
              style={{
                height: 24,
                marginVertical: -10,
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: c.border,
                  alignSelf: "center",
                  marginBottom: 2,
                }}
              />
            </View>
          </GestureDetector>
          {spot ? (
            <>
              <Tap
                onPress={() =>
                  router.push({
                    pathname: "/place/[id]",
                    params: { id: spot.id },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`View ${spot.name} details`}
              >
                <View style={[styles.row, { gap: 14 }]}>
                  <View style={{ width: 100 }}>
                    <FoodPhoto
                      spot={spot}
                      slot="preview"
                      height={104}
                      radius={18}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Txt size={24} weight="extra">
                      {spot.name}
                    </Txt>
                    <Txt size={13} muted>
                      {spot.category} · {distanceLabel(spot)} away
                    </Txt>
                    <Txt size={11} muted>
                      {spot.address}
                    </Txt>
                    <Txt size={11} weight="bold" style={{ color: c.link }}>
                      {spot.visited ? "✓ Visited" : "♡ Want to try"} · View
                      details →
                    </Txt>
                  </View>
                </View>
              </Tap>
              <Tap
                onPress={() =>
                  router.push({
                    pathname: "/place/[id]",
                    params: { id: spot.id },
                  })
                }
              >
                <Card
                  style={{
                    backgroundColor: c.muted,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Icon name="play" />
                  <View style={{ flex: 1 }}>
                    <Txt size={12} weight="semibold">
                      A craving worth remembering
                    </Txt>
                    <Txt size={10} muted>
                      {spot.tiktokUrl
                        ? "Saved TikTok link"
                        : "Demo food preview · Add your own link"}
                    </Txt>
                  </View>
                  <Icon name="arrow" />
                </Card>
              </Tap>
              <Button
                label={`Navigate to ${spot.name}`}
                icon="arrow"
                onPress={() => {
                  void openMaps(spot).catch((e) => setFailure(e.message));
                }}
              />
              {failure ? (
                <Txt size={12} style={{ color: c.danger }}>
                  {failure}
                </Txt>
              ) : null}
              <Txt size={10} muted>
                {illustration || Platform.OS === "web"
                  ? "Interactive demo map · Illustrative streets"
                  : "Demo restaurant coordinates"}{" "}
                · Demo distances · Opens your maps app
              </Txt>
            </>
          ) : (
            <>
              <Txt size={21} weight="bold">
                Nothing on this radar yet.
              </Txt>
              <Txt muted>
                Try a different filter or save your first food spot.
              </Txt>
              <Button
                label="Add a Food Spot"
                onPress={() => router.push("/add")}
              />
            </>
          )}
        </Animated.View>
      </Animated.View>
      <View style={{ height: 48 }} />
    </Page>
  );
}
