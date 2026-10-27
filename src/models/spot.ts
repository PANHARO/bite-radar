export type Category = "Khmer" | "Noodles" | "Café" | "Other";
export type Spot = {
  id: string;
  name: string;
  category: Category;
  description: string;
  address: string;
  notes: string;
  tiktokUrl: string;
  latitude: number;
  longitude: number;
  visited: boolean;
  createdAt: number;
  imageKey: "malis" | "eleven" | "davids";
  demo: boolean;
};
export type Preferences = {
  reminderPreview: boolean;
  nearbyReminders: boolean;
  radius: number;
  frequency: "daily" | "once";
  quietHours: boolean;
  appearance: "Light" | "Dark" | "System";
};
export type AppData = {
  version: 1;
  onboarded: boolean;
  spots: Spot[];
  preferences: Preferences;
  reminderHistory: Record<string, number>;
};
export type Draft = Omit<Spot, "id" | "createdAt"> & { id?: string };
