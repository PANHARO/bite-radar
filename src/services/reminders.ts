import { AppData, Spot } from "../models/spot";
import { freshPosition, metersBetween, Position } from "./proximity";
export type ReminderSnapshot = {
  data: AppData;
  position: Position | null;
  active: boolean;
  permitted: boolean;
};
export function reminderCandidates(
  snapshot: ReminderSnapshot,
  now = Date.now(),
): Spot[] {
  const { data, position, active, permitted } = snapshot;
  if (
    !active ||
    !permitted ||
    !data.preferences.nearbyReminders ||
    !freshPosition(position, now)
  )
    return [];
  // A crowded area should not produce a burst of notifications. This also
  // survives a restart because successful reservations are persisted.
  if (Object.values(data.reminderHistory).some((at) => now - at < 60000))
    return [];
  const hour = new Date(now).getHours();
  if (data.preferences.quietHours && (hour >= 22 || hour < 8)) return [];
  if (
    position.accuracy === null ||
    !Number.isFinite(position.accuracy) ||
    position.accuracy < 0 ||
    position.accuracy > Math.min(100, data.preferences.radius / 2)
  )
    return [];
  return data.spots
    .filter((spot) => {
      if (
        spot.demo ||
        spot.visited ||
        metersBetween(position, spot) + position.accuracy! >
          data.preferences.radius
      )
        return false;
      const last = data.reminderHistory[spot.id];
      return (
        last === undefined ||
        (data.preferences.frequency === "daily" &&
          last <= now &&
          new Date(last).toDateString() !== new Date(now).toDateString())
      );
    })
    .sort((a, b) => metersBetween(position, a) - metersBetween(position, b));
}
// Serialize evaluations across GPS updates, timers, saves, and preference changes.
// Reserve on disk before delivery so a reload cannot repeat an alert.
export class ReminderRunner {
  private queue = Promise.resolve();
  private retryAfter = 0;
  run(
    get: () => ReminderSnapshot,
    reserve: (id: string, at: number | null) => Promise<void>,
    send: (spot: Spot, distance: number) => Promise<void>,
    clock = Date.now,
  ): Promise<void> {
    const task = this.queue.then(async () => {
      const now = clock();
      if (now < this.retryAfter) return;
      const candidate = reminderCandidates(get(), now)[0];
      if (!candidate) return;
      const previous = get().data.reminderHistory[candidate.id];
      await reserve(candidate.id, now);
      // Permissions, app state, and the collection may change during persistence.
      const current = get();
      const withoutReservation = {
        ...current,
        data: {
          ...current.data,
          reminderHistory: { ...current.data.reminderHistory },
        },
      };
      if (previous === undefined)
        delete withoutReservation.data.reminderHistory[candidate.id];
      else withoutReservation.data.reminderHistory[candidate.id] = previous;
      if (
        !reminderCandidates(withoutReservation, clock()).some(
          (s) => s.id === candidate.id,
        )
      ) {
        await reserve(candidate.id, previous ?? null);
        return;
      }
      try {
        await send(candidate, metersBetween(current.position!, candidate));
      } catch (error) {
        await reserve(candidate.id, previous ?? null);
        throw error;
      }
    });
    const guarded = task.catch((error) => {
      // A failed delivery and rollback both rerender the provider. Back off to
      // avoid a tight retry loop caused by those persistence updates.
      this.retryAfter = clock() + 60000;
      throw error;
    });
    this.queue = guarded.catch(() => {});
    return guarded;
  }
}
