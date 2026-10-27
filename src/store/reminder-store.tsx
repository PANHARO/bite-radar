import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { router } from "expo-router";
import { useApp } from "./app-store";
import { useLocation } from "./location-store";
import { ReminderRunner } from "@/services/reminders";
import {
  listenForNotification,
  notificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  sendNearby,
} from "@/services/notifications";
type ReminderState = {
  supported: boolean;
  permitted: boolean;
  busy: boolean;
  error: string;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
};
const Context = createContext<ReminderState | null>(null);
export function ReminderProvider({ children }: React.PropsWithChildren) {
  const app = useApp(),
    location = useLocation();
  const [permitted, setPermitted] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const runner = useRef(new ReminderRunner());
  const live = useRef({ app, location, permitted });
  useEffect(() => {
    live.current = { app, location, permitted };
  }, [app, location, permitted]);
  const evaluate = useCallback(
    () =>
      runner.current
        .run(
          () => {
            const state = live.current;
            return {
              data: state.app.getCurrentData(),
              position: state.location.position,
              active:
                state.app.ready &&
                state.location.active &&
                AppState.currentState !== "background" &&
                AppState.currentState !== "inactive",
              permitted: state.permitted,
            };
          },
          (id, at) => live.current.app.recordReminder(id, at),
          sendNearby,
        )
        .catch(() =>
          setError(
            "Could not deliver a nearby reminder. Check notification access and try again.",
          ),
        ),
    [],
  );
  useEffect(() => {
    if (!app.ready) return;
    let alive = true;
    const check = () => {
      void notificationPermission()
        .then((value) => {
          if (alive) setPermitted(value);
        })
        .catch(() => {
          if (alive) setPermitted(false);
        });
    };
    check();
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      alive = false;
      listener.remove();
    };
  }, [app.ready]);
  useEffect(() => {
    if (app.ready) void evaluate();
  }, [
    app.data,
    app.ready,
    location.position,
    location.active,
    permitted,
    evaluate,
  ]);
  useEffect(() => {
    const timer = setInterval(() => {
      void evaluate();
    }, 30000);
    return () => clearInterval(timer);
  }, [evaluate]);
  useEffect(() => {
    if (!app.ready) return;
    let alive = true,
      remove: (() => void) | undefined;
    void listenForNotification((id) => {
      if (!alive) return;
      const exists = live.current.app
        .getCurrentData()
        .spots.some((spot) => spot.id === id);
      router.push(
        exists ? { pathname: "/place/[id]", params: { id } } : "/saved",
      );
    })
      .then((cleanup) => {
        if (alive) remove = cleanup;
        else cleanup();
      })
      .catch(() => {});
    return () => {
      alive = false;
      remove?.();
    };
  }, [app.ready]);
  const enable = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (!notificationsSupported)
        throw new Error(
          "Use the Android or iOS app for nearby notifications. Web can still show live distances.",
        );
      if (!(await location.request()))
        throw new Error(
          "Allow location and get a current position before enabling reminders.",
        );
      const allowed = await requestNotificationPermission();
      setPermitted(allowed);
      if (!allowed)
        throw new Error(
          "Notifications are blocked. Allow them in device settings, then try again.",
        );
      await app.setPreferences({ nearbyReminders: true });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not enable reminders.",
      );
    } finally {
      setBusy(false);
    }
  };
  const disable = async () => {
    try {
      await app.setPreferences({ nearbyReminders: false });
      setError("");
    } catch {
      setError("Could not turn reminders off. Please try again.");
    }
  };
  return (
    <Context.Provider
      value={{
        supported: notificationsSupported,
        permitted,
        busy,
        error,
        enable,
        disable,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useReminders() {
  const value = useContext(Context);
  if (!value) throw new Error("ReminderProvider is required");
  return value;
}
