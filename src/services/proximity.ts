export type Coordinates = { latitude: number; longitude: number };
export type Position = Coordinates & {
  accuracy: number | null;
  timestamp: number;
};
export function metersBetween(a: Coordinates, b: Coordinates): number {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((a.latitude - b.latitude) * rad) / 2) ** 2 +
    Math.cos(a.latitude * rad) *
      Math.cos(b.latitude * rad) *
      Math.sin(((a.longitude - b.longitude) * rad) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
}
export function freshPosition(
  position: Position | null,
  now = Date.now(),
): position is Position {
  return (
    !!position &&
    Number.isFinite(position.latitude) &&
    Math.abs(position.latitude) <= 90 &&
    Number.isFinite(position.longitude) &&
    Math.abs(position.longitude) <= 180 &&
    Number.isFinite(position.timestamp) &&
    now - position.timestamp >= -10000 &&
    now - position.timestamp <= 120000
  );
}
