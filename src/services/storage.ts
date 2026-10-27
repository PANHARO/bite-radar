import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppData } from "@/models/spot";
import { initialData } from "@/data/demo";
import { decodeData } from "./codec";
export const STORAGE_KEY = "@biteradar/personal/v1";
export async function readData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    await writeData(initialData);
    return initialData;
  }
  return decodeData(raw);
}
export async function writeData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
