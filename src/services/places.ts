import { demoSpots } from "@/data/demo";
import { Coordinates, metersBetween } from "./proximity";
import { Spot } from "@/models/spot";
export interface PlaceSearchService {
  search(query: string): Promise<Spot[]>;
}
// Replace this adapter with Google Places in a later milestone.
export const placeSearch: PlaceSearchService = {
  async search(query) {
    const q = query.toLowerCase().trim();
    return demoSpots.filter((s) =>
      `${s.name} ${s.address} ${s.category}`.toLowerCase().includes(q),
    );
  },
};
export function isTikTokUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    if (u.protocol !== "https:" || u.username || u.password || u.port)
      return false;
    return /^(www\.|m\.)?tiktok\.com$/.test(u.hostname)
      ? /^\/@[^/]+\/video\/\d+\/?$/.test(u.pathname)
      : /^(vm|vt)\.tiktok\.com$/.test(u.hostname) &&
          /^\/[A-Za-z0-9]+\/?$/.test(u.pathname);
  } catch {
    return false;
  }
}
export function distanceMeters(s: Spot, origin?: Coordinates | null): number {
  if (origin) return metersBetween(origin, s);
  if (s.demo)
    return s.imageKey === "malis" ? 350 : s.imageKey === "eleven" ? 850 : 1800;
  return Number.POSITIVE_INFINITY;
}
export function distanceLabel(s: Spot, origin?: Coordinates | null): string {
  const meters = distanceMeters(s, origin);
  if (!Number.isFinite(meters)) return "Location off";
  const label =
    meters < 1000
      ? `${Math.round(meters / 10) * 10} m`
      : `${(meters / 1000).toFixed(1)} km`;
  return !origin && s.demo ? `${label} demo` : label;
}
