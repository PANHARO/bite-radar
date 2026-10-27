import { Tabs } from "expo-router/js-tabs";
import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Asset, Icon, Tap, Txt } from "@/components/bite/ui";
import { designAssets as a } from "@/constants/design-assets";
import { usePalette } from "@/hooks/use-palette";
import { useReducedMotion } from "react-native-reanimated";
export default function TabLayout() {
  const reduce = useReducedMotion();
  const c = usePalette(),
    inset = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: reduce ? "none" : "fade",
        transitionSpec: {
          animation: "timing",
          config: { duration: reduce ? 0 : 250 },
        },
        sceneStyle: { backgroundColor: c.background },
      }}
      tabBar={({ state, navigateToTab }) => (
        <View
          style={{
            backgroundColor: c.surface,
            borderTopWidth: 1,
            borderColor: c.border,
            paddingBottom: Math.max(inset.bottom, 12),
          }}
        >
          <Tap
            accessibilityRole="button"
            accessibilityLabel="Add a Food Spot"
            onPress={() => router.push("/add")}
            style={{ position: "absolute", right: 24, top: -62 }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: c.primary,
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 6px 18px rgba(100,75,0,0.14)",
              }}
            >
              <Icon name="plus" onPrimary />
            </View>
          </Tap>
          <View
            style={{
              flexDirection: "row",
              maxWidth: 760,
              width: "100%",
              alignSelf: "center",
            }}
          >
            {state.routes.map((route, index) => {
              const active = state.index === index;
              const key = route.name as "home" | "map" | "saved";
              const source =
                key === "home"
                  ? active
                    ? a["15:58"].imgHouse
                    : a["15:308"].imgHouse
                  : key === "map"
                    ? active
                      ? a["15:308"].imgMap
                      : a["15:58"].imgMap
                    : active
                      ? a["15:392"].imgBookmark1
                      : a["15:58"].imgBookmark;
              return (
                <Tap
                  key={route.key}
                  accessibilityRole="tab"
                  accessibilityLabel={
                    key === "saved" ? "Saved" : key === "map" ? "Map" : "Home"
                  }
                  accessibilityState={{ selected: active }}
                  aria-selected={active}
                  onPress={() => {
                    navigateToTab(route.key);
                  }}
                  style={{ flex: 1 }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      minHeight: 76,
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <Asset
                      source={source}
                      width={23}
                      height={23}
                      tintColor={
                        c.background !== "#FFF9E8"
                          ? active
                            ? c.link
                            : c.secondary
                          : undefined
                      }
                    />
                    <Txt
                      size={11}
                      weight={active ? "bold" : "medium"}
                      style={{ color: active ? c.link : c.secondary }}
                    >
                      {key === "saved"
                        ? "Saved"
                        : key === "map"
                          ? "Map"
                          : "Home"}
                    </Txt>
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: active ? c.primary : "transparent",
                      }}
                    />
                  </View>
                </Tap>
              );
            })}
          </View>
        </View>
      )}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="saved" />
    </Tabs>
  );
}
