import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import { Position } from "@/services/proximity";
import { Spot } from "@/models/spot";
import { designAssets as a } from "@/constants/design-assets";
import { Asset, Tap, Txt } from "./ui";
export type MapProps = {
  spots: Spot[];
  userPosition?: Position | null;
  centerOnUser?: number;
  selectedId?: string;
  onSelect: (spot: Spot) => void;
  height?: number;
  mini?: boolean;
};
export function DemoMap({
  spots,
  selectedId,
  onSelect,
  height = 540,
  mini = false,
}: MapProps) {
  const [width, setWidth] = useState(390);
  const compact = mini && width <= 320;
  const confirm = !mini && height === 270;
  const worldW = mini ? (compact ? 312 : 342) : confirm ? 342 : 390,
    worldH = mini ? 182 : confirm ? 270 : 540;
  const scaleX = width / worldW,
    scaleY = height / worldH;
  const d = mini
    ? compact
      ? a["15:626"]
      : a["15:58"]
    : confirm
      ? a["15:229"]
      : a["15:308"];
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        height,
        width: "100%",
        backgroundColor: "#F4F0E7",
        overflow: "hidden",
        borderRadius: mini ? 20 : 0,
      }}
      accessibilityLabel="Interactive illustrated Phnom Penh demo map"
    >
      <View
        style={{
          position: "absolute",
          width: worldW,
          height: worldH,
          transformOrigin: "top left",
          transform: [{ scaleX }, { scaleY }],
        }}
      >
        <View
          style={{
            position: "absolute",
            left: worldW * 0.87,
            top: -30,
            width: worldW * 0.3,
            height: worldH + 60,
            backgroundColor: "#CCE4E7",
            transform: [{ rotate: "-5deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            left: worldW * 0.64,
            top: worldH * 0.22,
            width: worldW * 0.19,
            height: worldH * 0.23,
            backgroundColor: "#DCE7D5",
            borderRadius: 5,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: worldW * 0.66,
            top: worldH * 0.52,
            width: worldW * 0.12,
            height: worldH * 0.13,
            backgroundColor: "#DCE7D5",
            borderRadius: 5,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: worldW * 0.1088,
            top: worldH * 0.1649,
          }}
        >
          <Asset
            source={d.imgLocalStreets}
            width={mini ? 238.66 : 272.163}
            height={mini ? 127.266 : 377.621}
          />
        </View>
        <View style={{ position: "absolute", left: 0, top: mini ? -0.55 : 0 }}>
          <Asset
            source={d.imgNorodomAndSihanoukBoulevards}
            width={mini ? 342 : 390.54}
            height={mini ? 183.098 : 540.691}
          />
        </View>
        <View style={{ position: "absolute", left: 0, top: mini ? -0.34 : 0 }}>
          <Asset
            source={d.imgBoulevardCarriageways}
            width={mini ? 342 : 390.332}
            height={mini ? 182.672 : 540.425}
          />
        </View>
      </View>
      {[
        [0.83, 0.04, "Tonle Sap"],
        [0.1, 0.88, "BKK 1"],
        [0.16, 0.47, "St 240"],
        [0.69, 0.34, "Royal Palace"],
        ...(!mini
          ? [
              [0.44, 0.06, "Norodom Blvd"],
              [0.04, 0.69, "Preah Sihanouk Blvd"],
              [0.67, 0.56, "Wat Botum"],
            ]
          : []),
      ].map(([x, y, label]) => (
        <Txt
          key={String(label)}
          size={mini ? 9 : 11}
          style={{
            position: "absolute",
            left: Number(x) * width,
            top: Number(y) * height,
            color: "#57534F",
          }}
        >
          {label}
        </Txt>
      ))}
      {spots.map((spot, i) => {
        const active = spot.id === selectedId;
        const pos = spot.demo
          ? spot.imageKey === "malis"
            ? [0.475, 0.78]
            : spot.imageKey === "davids"
              ? [0.61, 0.28]
              : [0.205, 0.83]
          : [
              Math.max(
                0.08,
                Math.min(0.85, 0.475 + (spot.longitude - 104.9281) * 30),
              ),
              Math.max(
                0.25,
                Math.min(0.88, 0.78 - (spot.latitude - 11.5519) * 30),
              ),
            ];
        return (
          <Tap
            key={spot.id}
            onPress={() => onSelect(spot)}
            accessibilityRole="button"
            accessibilityLabel={`${spot.name}, ${spot.visited ? "visited" : "want to try"}, demo pin`}
            accessibilityState={{ selected: active }}
            style={{
              position: "absolute",
              left: pos[0] * width - 22 + (i > 2 ? i * 2 : 0),
              top: pos[1] * height - 22,
              width: 44,
              height: 44,
              zIndex: active ? 3 : 2,
              alignItems: "center",
            }}
          >
            <Animated.View
              key={`${spot.id}-${active}`}
              entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)}
              style={{
                width: active ? 44 : 32,
                height: active ? 44 : 32,
                borderRadius: 24,
                borderBottomRightRadius: 5,
                borderWidth: 2,
                borderColor: "#E6B800",
                backgroundColor: active ? "#E6B800" : "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Asset
                source={
                  active ? a["15:308"].imgUtensils : a["15:308"].imgUtensils1
                }
                width={active ? 20 : 16}
                height={active ? 20 : 16}
              />
            </Animated.View>
            {active && (
              <Txt
                pointerEvents="none"
                size={10}
                weight="bold"
                style={{
                  color: "#202124",
                  position: "absolute",
                  top: 45,
                  width: 120,
                  left: -38,
                  textAlign: "center",
                }}
              >
                {spot.name}
              </Txt>
            )}
          </Tap>
        );
      })}
    </View>
  );
}
