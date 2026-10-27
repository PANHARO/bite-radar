import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import * as Location from "expo-location";
import { useApp } from "./app-store";
import { freshPosition, Position } from "@/services/proximity";
type LocationState = {
  position: Position | null;
  active: boolean;
  busy: boolean;
  permission: "undetermined" | "granted" | "denied";
  error: string;
  request: () => Promise<boolean>;
  refresh: () => Promise<boolean>;
};
const Context = createContext<LocationState | null>(null);
export function LocationProvider({ children }: React.PropsWithChildren) {
  const { ready } = useApp();
  const [position, setPosition] = useState<Position | null>(null);
  const [active, setActive] = useState(
    AppState.currentState === "active" || AppState.currentState === null,
  );
  const [busy, setBusy] = useState(false);
  const [permission, setPermission] =
    useState<LocationState["permission"]>("undetermined");
  const [error, setError] = useState("");
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const generation = useRef(0);
  const pending = useRef(false);
  const permissionPrompt = useRef(false);
  const mounted = useRef(true);
  const stop = useCallback(() => {
    generation.current++;
    subscription.current?.remove();
    subscription.current = null;
  }, []);
  const locate = useCallback(
    async (ask: boolean) => {
      if (pending.current || AppState.currentState === "background")
        return false;
      pending.current = true;
      stop();
      const token = generation.current;
      const current = () => mounted.current && token === generation.current;
      setBusy(true);
      setError("");
      setPosition(null);
      try {
        permissionPrompt.current = ask;
        const access = await (
          ask
            ? Location.requestForegroundPermissionsAsync()
            : Location.getForegroundPermissionsAsync()
        ).finally(() => {
          permissionPrompt.current = false;
        });
        if (!current()) return false;
        setPermission(access.status);
        if (!access.granted) {
          if (ask)
            setError(
              "Location access is off. You can keep saving places, or allow location in device settings.",
            );
          return false;
        }
        if (!(await Location.hasServicesEnabledAsync()))
          throw new Error("Turn on device location, then try again.");
        let timer: ReturnType<typeof setTimeout> | undefined;
        let fix: Location.LocationObject;
        try {
          fix = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            new Promise<never>((_, reject) => {
              timer = setTimeout(
                () =>
                  reject(
                    new Error(
                      "Could not get a location yet. Try near a window or outdoors, then try again.",
                    ),
                  ),
                20000,
              );
            }),
          ]);
        } finally {
          clearTimeout(timer);
        }
        if (!current()) return false;
        const accept = (value: Location.LocationObject) => {
          if (current()) {
            setPosition({ ...value.coords, timestamp: value.timestamp });
            setError("");
          }
        };
        accept(fix);
        const watch = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 25,
            timeInterval: 15000,
          },
          accept,
          (reason) => {
            if (current()) {
              setPosition(null);
              setError(reason || "Location updates stopped. Try again.");
            }
          },
        );
        if (current()) subscription.current = watch;
        else watch.remove();
        return current();
      } catch (cause) {
        if (current())
          setError(
            cause instanceof Error
              ? cause.message
              : "Location is unavailable. Try again.",
          );
        return false;
      } finally {
        pending.current = false;
        if (mounted.current) setBusy(false);
      }
    },
    [stop],
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop();
    };
  }, [stop]);
  useEffect(() => {
    if (!ready) return;
    const listener = AppState.addEventListener("change", (state) => {
      const foreground = state === "active";
      setActive(foreground);
      if (!foreground) {
        if (!permissionPrompt.current) stop();
        setPosition(null);
      } else void locate(false);
    });
    void Promise.resolve().then(() => locate(false));
    const timer = setInterval(() => {
      if (AppState.currentState === "active") void locate(false);
    }, 60000);
    return () => {
      listener.remove();
      clearInterval(timer);
      stop();
    };
  }, [ready, locate, stop]);
  return (
    <Context.Provider
      value={{
        position: freshPosition(position) ? position : null,
        active,
        busy,
        permission,
        error,
        request: () => locate(true),
        refresh: () => locate(false),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useLocation() {
  const value = useContext(Context);
  if (!value) throw new Error("LocationProvider is required");
  return value;
}
