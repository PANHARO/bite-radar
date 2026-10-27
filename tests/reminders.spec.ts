import { test, expect } from "@playwright/test";
import { initialData } from "../src/data/demo";
import { decodeData } from "../src/services/codec";
import { metersBetween } from "../src/services/proximity";
import {
  ReminderRunner,
  reminderCandidates,
  ReminderSnapshot,
} from "../src/services/reminders";
const now = new Date(2026, 9, 27, 12).getTime();
function snapshot(): ReminderSnapshot {
  return {
    active: true,
    permitted: true,
    position: {
      latitude: 11.555,
      longitude: 104.928,
      accuracy: 10,
      timestamp: now,
    },
    data: {
      ...initialData,
      reminderHistory: {},
      preferences: { ...initialData.preferences, nearbyReminders: true },
      spots: [
        {
          ...initialData.spots[0],
          id: "real",
          demo: false,
          latitude: 11.555,
          longitude: 104.928,
        },
      ],
    },
  };
}
test("an already-inside real place is eligible, but demo and visited places are not", () => {
  const state = snapshot();
  expect(reminderCandidates(state, now).map((s) => s.id)).toEqual(["real"]);
  state.data.spots[0].demo = true;
  expect(reminderCandidates(state, now)).toEqual([]);
  state.data.spots[0].demo = false;
  state.data.spots[0].visited = true;
  expect(reminderCandidates(state, now)).toEqual([]);
});
test("consent, permissions, background state, stale/weak GPS and quiet hours block alerts", () => {
  const changes: ((s: ReminderSnapshot) => void)[] = [
    (s) => {
      s.active = false;
    },
    (s) => {
      s.permitted = false;
    },
    (s) => {
      s.data.preferences.nearbyReminders = false;
    },
    (s) => {
      s.position = null;
    },
    (s) => {
      s.position!.timestamp = now - 120001;
    },
    (s) => {
      s.position!.accuracy = null;
    },
    (s) => {
      s.position!.accuracy = 101;
    },
    (s) => {
      s.position!.latitude += 0.02;
    },
  ];
  for (const change of changes) {
    const state = snapshot();
    change(state);
    expect(reminderCandidates(state, now)).toEqual([]);
  }
  const night = new Date(2026, 9, 27, 23).getTime(),
    state = snapshot();
  state.position!.timestamp = night;
  expect(reminderCandidates(state, night)).toEqual([]);
  state.data.preferences.quietHours = false;
  expect(reminderCandidates(state, night)).toHaveLength(1);
});
test("radius uses actual positions and accounts for reported accuracy", () => {
  expect(
    metersBetween({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 }),
  ).toBeCloseTo(111195, -1);
  const state = snapshot();
  state.data.preferences.radius = 200;
  state.data.spots[0].latitude += 0.00175;
  expect(reminderCandidates(state, now)).toEqual([]); // near boundary + uncertainty
  state.position!.accuracy = 0;
  expect(reminderCandidates(state, now)).toHaveLength(1);
});
test("daily frequency uses device calendar days and once never repeats", () => {
  const state = snapshot();
  state.data.reminderHistory.real = now - 1000;
  expect(reminderCandidates(state, now)).toEqual([]);
  state.data.reminderHistory.real = new Date(2026, 9, 26, 23).getTime();
  expect(reminderCandidates(state, now)).toHaveLength(1);
  state.data.preferences.frequency = "once";
  expect(reminderCandidates(state, now)).toEqual([]);
});
test("old collections retain data and preview consent never enables real notifications", () => {
  const old = JSON.parse(JSON.stringify(initialData));
  delete old.preferences.nearbyReminders;
  delete old.reminderHistory;
  old.preferences.reminderPreview = true;
  const upgraded = decodeData(JSON.stringify(old));
  expect(upgraded.spots).toEqual(initialData.spots);
  expect(upgraded.preferences.nearbyReminders).toBe(false);
  expect(upgraded.reminderHistory).toEqual({});
  expect(() =>
    decodeData(JSON.stringify({ ...old, reminderHistory: { bad: "today" } })),
  ).toThrow();
});
test("concurrent evaluations reserve once, persist across restart, and roll back delivery failure", async () => {
  const state = snapshot(),
    runner = new ReminderRunner(),
    sent: string[] = [];
  const reserve = async (id: string, at: number | null) => {
    if (at === null) delete state.data.reminderHistory[id];
    else state.data.reminderHistory[id] = at;
  };
  const send = async () => {
    sent.push("alert");
  };
  await Promise.all([
    runner.run(
      () => state,
      reserve,
      send,
      () => now,
    ),
    runner.run(
      () => state,
      reserve,
      send,
      () => now,
    ),
  ]);
  await new ReminderRunner().run(
    () => state,
    reserve,
    send,
    () => now,
  );
  expect(sent).toHaveLength(1);
  delete state.data.reminderHistory.real;
  await expect(
    runner.run(
      () => state,
      reserve,
      async () => {
        throw Error("OS refused");
      },
      () => now,
    ),
  ).rejects.toThrow();
  expect(state.data.reminderHistory.real).toBeUndefined();
  await runner.run(
    () => state,
    reserve,
    send,
    () => now,
  );
  expect(sent).toHaveLength(1); // Failure backoff prevents a rerender retry loop.
  await runner.run(
    () => state,
    reserve,
    send,
    () => now + 60000,
  );
  expect(sent).toHaveLength(2);
});
test("failed persistence sends nothing and switching off while reserving prevents delivery", async () => {
  const state = snapshot();
  let sent = 0;
  await expect(
    new ReminderRunner().run(
      () => state,
      async () => {
        throw Error("disk full");
      },
      async () => {
        sent++;
      },
      () => now,
    ),
  ).rejects.toThrow();
  expect(sent).toBe(0);
  await new ReminderRunner().run(
    () => state,
    async (id, at) => {
      if (at === null) delete state.data.reminderHistory[id];
      else {
        state.data.reminderHistory[id] = at;
        state.data.preferences.nearbyReminders = false;
      }
    },
    async () => {
      sent++;
    },
    () => now,
  );
  expect(sent).toBe(0);
  expect(state.data.reminderHistory).toEqual({});
});

test("many nearby places alert nearest first without a burst across restart", async () => {
  const state = snapshot();
  state.data.spots.push({
    ...state.data.spots[0],
    id: "second",
    latitude: 11.5555,
  });
  const sent: string[] = [];
  const reserve = async (id: string, at: number | null) => {
    if (at === null) delete state.data.reminderHistory[id];
    else state.data.reminderHistory[id] = at;
  };
  const send = async (spot: { id: string }) => {
    sent.push(spot.id);
  };
  await new ReminderRunner().run(
    () => state,
    reserve,
    send,
    () => now,
  );
  await new ReminderRunner().run(
    () => state,
    reserve,
    send,
    () => now + 1000,
  );
  expect(sent).toEqual(["real"]);
  await new ReminderRunner().run(
    () => state,
    reserve,
    send,
    () => now + 60000,
  );
  expect(sent).toEqual(["real", "second"]);
});
