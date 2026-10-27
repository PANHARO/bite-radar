import { demoSpots } from "@/data/demo";
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
export function distanceMeters(s: Spot): number {
  if (s.demo)
    return s.imageKey === "malis" ? 350 : s.imageKey === "eleven" ? 850 : 1800;
  const rad = Math.PI / 180,
    a = (s.latitude - 11.555) * rad,
    b = (s.longitude - 104.928) * rad;
  const h =
    Math.sin(a / 2) ** 2 +
    Math.cos(11.555 * rad) * Math.cos(s.latitude * rad) * Math.sin(b / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export const distanceLabel = (s: Spot) =>
  distanceMeters(s) < 1000
    ? `${Math.round(distanceMeters(s) / 10) * 10} m`
    : `${(distanceMeters(s) / 1000).toFixed(1)} km`;
