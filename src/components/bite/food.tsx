import { View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { designAssets as a } from "@/constants/design-assets";
import { Spot } from "@/models/spot";
import { distanceLabel } from "@/services/places";
import { Card, Icon, Tap, Txt, styles } from "./ui";
import { usePalette } from "@/hooks/use-palette";
export type PhotoSlot =
  "home" | "saved" | "detail" | "preview" | "success" | "confirm";
export function photoSource(
  spot: Pick<Spot, "imageKey">,
  slot: PhotoSlot = "home",
): number {
  if (slot === "saved")
    return spot.imageKey === "malis"
      ? a["15:392"].imgFoodPhotograph
      : spot.imageKey === "eleven"
        ? a["15:392"].imgFoodPhotograph1
        : a["15:392"].imgFoodPhotograph2;
  if (spot.imageKey === "malis")
    if (slot === "confirm") return a["15:229"].imgFoodPhotograph;
  if (spot.imageKey === "malis")
    return slot === "detail"
      ? a["15:471"].imgFoodPhotograph
      : slot === "preview"
        ? a["15:308"].imgFoodPhotograph
        : slot === "success"
          ? a["15:904"].imgFoodPhotograph
          : a["15:58"].imgFoodPhotograph;
  return spot.imageKey === "eleven"
    ? a["15:58"].imgFoodPhotograph1
    : a["15:58"].imgFoodPhotograph2;
}
export function FoodPhoto({
  spot,
  slot,
  height,
  radius = 20,
}: {
  spot: Pick<Spot, "imageKey" | "name">;
  slot?: PhotoSlot;
  height: number;
  radius?: number;
}) {
  return (
    <Image
      source={photoSource(spot, slot)}
      contentFit="cover"
      accessibilityLabel={`${spot.name} · illustrative food photo`}
      style={{ width: "100%", height, borderRadius: radius }}
    />
  );
}
export function NearbyCard({ spot }: { spot: Spot }) {
  const c = usePalette();
  return (
    <Tap
      onPress={() =>
        router.push({ pathname: "/place/[id]", params: { id: spot.id } })
      }
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}, ${distanceLabel(spot)} from demo location`}
      style={{ width: 248 }}
    >
      <View
        style={{
          backgroundColor: c.surface,
          padding: 8,
          borderRadius: 28,
          gap: 10,
          boxShadow: "0px 6px 20px rgba(52,35,25,0.07)",
        }}
      >
        <View>
          <FoodPhoto spot={spot} height={164} />
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: c.surface,
              borderRadius: 16,
              paddingHorizontal: 9,
              paddingVertical: 6,
            }}
          >
            <Txt size={11} weight="bold">
              ↗ {distanceLabel(spot)}
            </Txt>
          </View>
          <View
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              backgroundColor: c.surface,
              padding: 7,
              borderRadius: 14,
            }}
          >
            <Icon name="bookmark" />
          </View>
        </View>
        <View
          style={[styles.between, { paddingHorizontal: 5, paddingBottom: 5 }]}
        >
          <View style={{ flex: 1 }}>
            <Txt size={17} weight="extra">
              {spot.name}
            </Txt>
            <Txt size={11} muted>
              {spot.description}
            </Txt>
          </View>
          <View
            style={{ backgroundColor: c.accent, padding: 9, borderRadius: 14 }}
          >
            <Icon name="arrow" />
          </View>
        </View>
      </View>
    </Tap>
  );
}
export function RecentCard({ spot }: { spot: Spot }) {
  const c = usePalette();
  return (
    <Tap
      onPress={() =>
        router.push({ pathname: "/place/[id]", params: { id: spot.id } })
      }
      accessibilityRole="button"
    >
      <Card
        style={{
          flexDirection: "row",
          gap: 13,
          padding: 10,
          alignItems: "center",
        }}
      >
        <Image
          source={photoSource(spot)}
          style={{ width: 72, height: 76, borderRadius: 14 }}
          contentFit="cover"
        />
        <View style={{ flex: 1 }}>
          <Txt size={14} weight="bold">
            {spot.name}
          </Txt>
          <Txt size={12} muted>
            {spot.description} · {distanceLabel(spot)}
          </Txt>
          <Txt size={10} weight="semibold" style={{ color: c.danger }}>
            {spot.tiktokUrl
              ? "▷ TikTok link saved"
              : "Private collection · demo place"}
          </Txt>
        </View>
        <Icon name="chevron" />
      </Card>
    </Tap>
  );
}
export function SavedCard({ spot, height }: { spot: Spot; height: number }) {
  const c = usePalette();
  return (
    <Tap
      onPress={() =>
        router.push({ pathname: "/place/[id]", params: { id: spot.id } })
      }
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}, ${spot.visited ? "Visited" : "Want to try"}`}
    >
      <View style={{ gap: 8 }}>
        <View>
          <FoodPhoto spot={spot} slot="saved" height={height} radius={22} />
          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: 8,
              backgroundColor: c.surface,
              borderRadius: 18,
            }}
          >
            <Icon name={spot.visited ? "check" : "bookmark"} />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              backgroundColor: c.surface,
              paddingHorizontal: 9,
              paddingVertical: 5,
              borderRadius: 15,
            }}
          >
            <Txt size={10} weight="bold">
              {distanceLabel(spot)}
            </Txt>
          </View>
        </View>
        <View>
          <Txt size={15} weight="bold">
            {spot.name}
          </Txt>
          <Txt size={11} muted>
            {spot.category} ·{" "}
            {spot.demo && spot.imageKey === "malis"
              ? "Fish amok"
              : spot.description}
          </Txt>
          <Txt
            size={10}
            weight="medium"
            style={{ color: spot.visited ? c.body : c.danger }}
          >
            {spot.visited ? "✓ Visited" : "♡ Want to try"}
          </Txt>
        </View>
      </View>
    </Tap>
  );
}
export function VideoPreview({
  onPress,
  hasUrl,
}: {
  onPress?: () => void;
  hasUrl: boolean;
}) {
  const c = usePalette();
  const Container = onPress ? Tap : View;
  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
    >
      <Card
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          gap: 12,
        }}
      >
        <View>
          <Image
            source={a["15:162"].imgFoodPhotograph}
            style={{ width: 74, height: 88, borderRadius: 12 }}
            contentFit="cover"
          />
          <View
            style={{
              position: "absolute",
              left: 25,
              top: 30,
              padding: 7,
              borderRadius: 18,
              backgroundColor: c.surface,
            }}
          >
            <Icon name="play" />
          </View>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Txt size={9} weight="bold" style={{ color: c.danger }}>
            {hasUrl
              ? "TIKTOK LINK · SAMPLE PREVIEW"
              : "ILLUSTRATIVE FOOD PREVIEW"}
          </Txt>
          <Txt size={13} weight="bold">
            Fish amok to remember
          </Txt>
          <Txt size={11} muted>
            {hasUrl
              ? "Your link stays with this place."
              : "Add your own link or save manually."}
          </Txt>
        </View>
      </Card>
    </Container>
  );
}
