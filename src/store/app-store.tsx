import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppData, Draft, Preferences, Spot } from "@/models/spot";
import { initialData } from "@/data/demo";
import { readData, writeData } from "@/services/storage";
type Store = {
  data: AppData;
  ready: boolean;
  error: string;
  reload: () => void;
  completeOnboarding: () => Promise<void>;
  saveSpot: (draft: Draft) => Promise<Spot>;
  updateSpot: (id: string, patch: Partial<Spot>) => Promise<void>;
  removeSpot: (id: string) => Promise<void>;
  setPreferences: (patch: Partial<Preferences>) => Promise<void>;
  clearSpots: () => Promise<void>;
  draft: Draft | null;
  setDraft: (d: Draft | null) => void;
};
const Context = createContext<Store | null>(null);
export function AppProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState(initialData),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [draft, setDraft] = useState<Draft | null>(null);
  const latest = useRef(data),
    queue = useRef<Promise<void>>(Promise.resolve());
  const reload = useCallback(() => {
    setError("");
    setReady(false);
    readData()
      .then((d) => {
        latest.current = d;
        setData(d);
        setReady(true);
      })
      .catch((e) => setError(String(e.message || e)));
  }, []);
  useEffect(() => {
    void Promise.resolve().then(reload);
  }, [reload]);
  const commit = useCallback((change: (d: AppData) => AppData) => {
    const next = queue.current.then(async () => {
      const updated = change(latest.current);
      await writeData(updated);
      latest.current = updated;
      setData(updated);
    });
    queue.current = next.catch(() => {});
    return next;
  }, []);
  const value: Store = {
    data,
    ready,
    error,
    reload,
    draft,
    setDraft,
    completeOnboarding: () => commit((d) => ({ ...d, onboarded: true })),
    saveSpot: async (input) => {
      const old = latest.current.spots.find((s) => s.id === input.id);
      const spot: Spot = {
        ...input,
        id:
          old?.id ||
          `spot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: old?.createdAt || Date.now(),
      };
      await commit((d) => ({
        ...d,
        spots: old
          ? d.spots.map((s) => (s.id === old.id ? spot : s))
          : [spot, ...d.spots],
      }));
      return spot;
    },
    updateSpot: (id, patch) =>
      commit((d) => ({
        ...d,
        spots: d.spots.map((s) =>
          s.id === id ? { ...s, ...patch, id: s.id } : s,
        ),
      })),
    removeSpot: (id) =>
      commit((d) => ({ ...d, spots: d.spots.filter((s) => s.id !== id) })),
    setPreferences: (patch) =>
      commit((d) => ({ ...d, preferences: { ...d.preferences, ...patch } })),
    clearSpots: () => commit((d) => ({ ...d, spots: [] })),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() {
  const store = useContext(Context);
  if (!store) throw new Error("AppProvider is required");
  return store;
}
