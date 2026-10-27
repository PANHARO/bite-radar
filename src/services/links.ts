import { Linking, Platform } from "react-native";
import { Spot } from "@/models/spot";
export async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    throw new Error(
      "Could not open this link. Check your connection and try again.",
    );
  }
}
export const openMaps = (s: Spot) =>
  openUrl(
    Platform.OS === "ios"
      ? `https://maps.apple.com/?q=${encodeURIComponent(s.name)}&ll=${s.latitude},${s.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`,
  );
