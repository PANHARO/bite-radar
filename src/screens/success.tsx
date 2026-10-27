import { router, useLocalSearchParams } from "expo-router";
import Animated, {
  FadeInUp,
  ZoomIn,
  ReduceMotion,
} from "react-native-reanimated";
import { Asset, Button, Notice, Page, Tap, Txt } from "@/components/bite/ui";
import { FoodPhoto } from "@/components/bite/food";
import { designAssets as a } from "@/constants/design-assets";
import { useApp } from "@/store/app-store";
import { usePalette } from "@/hooks/use-palette";
export default function SuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { data } = useApp(),
    c = usePalette();
  const spot = data.spots.find((s) => s.id === id);
  if (!spot)
    return (
      <Page>
        <Txt>No saved spot was found.</Txt>
        <Button
          label="My Saved Food"
          onPress={() => router.dismissTo("/saved")}
        />
      </Page>
    );
  return (
    <Page>
      <Txt size={12} weight="bold" style={{ color: c.link }}>
        SAVED TO YOUR PRIVATE COLLECTION
      </Txt>
      <Animated.View
        entering={ZoomIn.duration(300).reduceMotion(ReduceMotion.System)}
      >
        <Asset source={a["15:904"].imgCircleCheck} width={40} height={40} />
      </Animated.View>
      <Animated.View
        entering={FadeInUp.duration(300).reduceMotion(ReduceMotion.System)}
        style={{ gap: 24 }}
      >
        <Txt size={30} weight="extra" style={{ lineHeight: 36 }}>
          {spot.name} is on your radar.
        </Txt>
        <FoodPhoto spot={spot} slot="success" height={200} radius={24} />
        <Txt muted>
          {spot.category} · {spot.address}
          {"\n"}Saved to My Saved Food. That craving won’t be forgotten.
        </Txt>
        <Notice icon="bell">
          Want a nudge when you’re nearby? Set a radius and preview your
          reminder. Reminders are optional; live alerts are coming later.
        </Notice>
        <Button
          label="Set up nearby reminders"
          onPress={() => router.replace("/settings")}
        />
        <Button
          label={`View ${spot.name} on map`}
          secondary
          onPress={() =>
            router.replace({ pathname: "/map", params: { selected: spot.id } })
          }
        />
        <Tap
          onPress={() => router.dismissTo("/saved")}
          accessibilityRole="button"
        >
          <Txt
            size={13}
            weight="semibold"
            style={{ textAlign: "center", paddingVertical: 12, color: c.body }}
          >
            Not now · Back to my collection
          </Txt>
        </Tap>
      </Animated.View>
    </Page>
  );
}
