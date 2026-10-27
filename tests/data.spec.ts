import { test, expect } from "@playwright/test";
import { isTikTokUrl, distanceMeters } from "../src/services/places";
import { decodeData } from "../src/services/codec";
import { initialData } from "../src/data/demo";
test("TikTok validation accepts video links and rejects spoofed hosts", () => {
  for (const url of [
    "https://www.tiktok.com/@food/video/123456",
    "https://vm.tiktok.com/AbC123/",
    "https://vt.tiktok.com/ABC1/",
    "https://m.tiktok.com/@food/video/123?lang=en",
  ])
    expect(isTikTokUrl(url)).toBe(true);
  for (const url of [
    "http://www.tiktok.com/@a/video/123",
    "https://tiktok.com.evil.test/@a/video/123",
    "https://www.tiktok.com/@a",
    "javascript:alert(1)",
    "https://user:password@tiktok.com/@a/video/123",
    "https://tiktok.com:444/@a/video/123",
    "garbage",
  ])
    expect(isTikTokUrl(url)).toBe(false);
});
test("storage round trip preserves places and preferences and rejects corrupt data", () => {
  expect(decodeData(JSON.stringify(initialData))).toEqual(initialData);
  const empty = { ...initialData, spots: [] };
  expect(decodeData(JSON.stringify(empty)).spots).toEqual([]);
  for (const raw of [
    "invalid",
    "null",
    "{}",
    JSON.stringify({
      ...initialData,
      spots: [{ ...initialData.spots[0], latitude: 999 }],
    }),
    JSON.stringify({
      ...initialData,
      spots: [initialData.spots[0], initialData.spots[0]],
    }),
  ])
    expect(() => decodeData(raw)).toThrow("not been overwritten");
});
test("nearest order uses numeric distance rather than labels", () => {
  expect(
    [...initialData.spots]
      .sort((a, b) => distanceMeters(a) - distanceMeters(b))
      .map((s) => s.id),
  ).toEqual(["malis", "eleven", "davids"]);
});
