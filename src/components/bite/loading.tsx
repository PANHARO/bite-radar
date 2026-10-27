import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { usePalette } from "@/hooks/use-palette";
import { Card, Txt } from "./ui";
export function LoadingSkeleton() {
  const c = usePalette(),
    reduce = useReducedMotion(),
    opacity = useSharedValue(1);
  useEffect(() => {
    if (!reduce)
      opacity.set(withRepeat(withTiming(0.45, { duration: 800 }), -1, true));
    return () => cancelAnimation(opacity);
  }, [opacity, reduce]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <Animated.View
      style={[{ gap: 24 }, style]}
      accessibilityLabel="Loading your saved food"
      accessibilityRole="progressbar"
    >
      <Card
        style={{
          flexDirection: "row",
          gap: 16,
          padding: 16,
          alignItems: "center",
        }}
      >
        <View
          style={{
            height: 98,
            width: 76,
            borderRadius: 12,
            backgroundColor: c.border,
          }}
        />
        <View style={{ flex: 1, gap: 14 }}>
          <View
            style={{ height: 14, borderRadius: 8, backgroundColor: c.border }}
          />
          <View
            style={{
              height: 12,
              width: "65%",
              borderRadius: 8,
              backgroundColor: c.muted,
            }}
          />
        </View>
      </Card>
      <View
        style={{ height: 64, borderRadius: 20, backgroundColor: c.muted }}
      />
      <Txt size={13} muted>
        Your private collection. Just a moment.
      </Txt>
    </Animated.View>
  );
}
