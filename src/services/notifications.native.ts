import { AppState, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { AndroidImportance, IosAuthorizationStatus } from "expo-notifications";
import { Spot } from "@/models/spot";
export const notificationsSupported = true;
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: AppState.currentState === "active",
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export async function notificationPermission(): Promise<boolean> {
  const status = await Notifications.getPermissionsAsync();
  return (
    status.granted || status.ios?.status === IosAuthorizationStatus.PROVISIONAL
  );
}
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("nearby", {
      name: "Nearby saved food",
      importance: AndroidImportance.HIGH,
      sound: null,
    });
  await Notifications.requestPermissionsAsync();
  return notificationPermission();
}
export async function sendNearby(spot: Spot, distance: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${spot.name} is nearby`,
      body: `About ${Math.round(distance / 10) * 10} m away. You saved it for a day like today.`,
      data: { spotId: spot.id },
      sound: false,
    },
    trigger: Platform.OS === "android" ? { channelId: "nearby" } : null,
  });
}
export async function listenForNotification(
  open: (id: string) => void,
): Promise<() => void> {
  let lastHandled = "";
  const handle = (response: Notifications.NotificationResponse | null) => {
    const id = response?.notification.request.content.data?.spotId;
    const key = response
      ? `${response.notification.request.identifier}:${response.actionIdentifier}`
      : "";
    if (typeof id === "string" && key !== lastHandled) {
      lastHandled = key;
      open(id);
      void Notifications.clearLastNotificationResponseAsync().catch(() => {});
    }
  };
  const listener =
    Notifications.addNotificationResponseReceivedListener(handle);
  try {
    handle(await Notifications.getLastNotificationResponseAsync());
  } catch {
    /* Live tap listener remains available if cold-start recovery fails. */
  }
  return () => listener.remove();
}
