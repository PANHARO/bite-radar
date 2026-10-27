import { AppData, Spot } from "@/models/spot";
function validSpot(value: unknown): value is Spot {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    ["id", "name", "description", "address", "notes", "tiktokUrl"].every(
      (k) => typeof s[k] === "string",
    ) &&
    ["Khmer", "Noodles", "Café", "Other"].includes(String(s.category)) &&
    ["malis", "eleven", "davids"].includes(String(s.imageKey)) &&
    typeof s.visited === "boolean" &&
    typeof s.demo === "boolean" &&
    typeof s.createdAt === "number" &&
    Number.isFinite(s.createdAt) &&
    typeof s.latitude === "number" &&
    Number.isFinite(s.latitude) &&
    Math.abs(s.latitude) <= 90 &&
    typeof s.longitude === "number" &&
    Number.isFinite(s.longitude) &&
    Math.abs(s.longitude) <= 180
  );
}
export function decodeData(raw: string): AppData {
  const fail = () =>
    new Error(
      "Your saved collection could not be read. Your data has not been overwritten.",
    );
  let d: AppData;
  try {
    d = JSON.parse(raw);
  } catch {
    throw fail();
  }
  if (
    !d ||
    d.version !== 1 ||
    typeof d.onboarded !== "boolean" ||
    !Array.isArray(d.spots) ||
    !d.spots.every(validSpot) ||
    !d.preferences
  )
    throw fail();
  const p = d.preferences;
  if (
    typeof p.reminderPreview !== "boolean" ||
    ![200, 500, 1000].includes(p.radius) ||
    !["daily", "once"].includes(p.frequency) ||
    typeof p.quietHours !== "boolean" ||
    !["Light", "Dark", "System"].includes(p.appearance)
  )
    throw fail();
  if (new Set(d.spots.map((s) => s.id)).size !== d.spots.length) throw fail();
  // Older Phase A data is upgraded in memory; preview consent never enables alerts.
  if (p.nearbyReminders !== undefined && typeof p.nearbyReminders !== "boolean")
    throw fail();
  if (
    d.reminderHistory !== undefined &&
    (!d.reminderHistory ||
      typeof d.reminderHistory !== "object" ||
      Array.isArray(d.reminderHistory) ||
      Object.values(d.reminderHistory).some(
        (v) => typeof v !== "number" || !Number.isFinite(v) || v < 0,
      ))
  )
    throw fail();
  return {
    ...d,
    preferences: { ...p, nearbyReminders: p.nearbyReminders ?? false },
    reminderHistory: d.reminderHistory ?? {},
  };
}
