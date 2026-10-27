import { Spot } from "@/models/spot";
export const notificationsSupported = false;
export async function notificationPermission(): Promise<boolean> {
  return false;
}
export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}
export async function sendNearby(
  _spot: Spot,
  _distance: number,
): Promise<void> {
  throw new Error(
    "Nearby notifications are available in the Android and iOS app.",
  );
}
export async function listenForNotification(
  _open: (id: string) => void,
): Promise<() => void> {
  return () => {};
}
