import { useColorScheme } from "react-native";
import { colors } from "@/constants/tokens";
import { useApp } from "@/store/app-store";
export function usePalette() {
  const { data } = useApp();
  const system = useColorScheme();
  const dark =
    data.preferences.appearance === "Dark" ||
    (data.preferences.appearance === "System" && system === "dark");
  return dark
    ? {
        ...colors,
        background: "#1D1D19",
        surface: "#292923",
        text: "#FFF9E8",
        secondary: "#B7B4AA",
        body: "#D0CCC1",
        border: "#414137",
        accent: "#463C13",
        muted: "#32322C",
        link: "#F0CD40",
      }
    : colors;
}
