import { useMemo, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { router } from "expo-router";
import {
  Asset,
  Button,
  Card,
  Chip,
  Field,
  Icon,
  IconButton,
  Page,
  Tap,
  Txt,
  styles,
} from "@/components/bite/ui";
import { RecentCard, SavedCard } from "@/components/bite/food";
import { designAssets as a } from "@/constants/design-assets";
import { useApp } from "@/store/app-store";
import { distanceMeters } from "@/services/places";
import { usePalette } from "@/hooks/use-palette";
import { Sheet } from "@/components/bite/sheet";
import { useNetworkState } from "expo-network";
export default function SavedScreen() {
  const { data } = useApp(),
    c = usePalette(),
    network = useNetworkState();
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [sort, setSort] = useState("Recently saved"),
    [list, setList] = useState(false),
    [sorting, setSorting] = useState(false);
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const spots = useMemo(
    () =>
      data.spots
        .filter(
          (s) =>
            (filter === "All" || s.visited === (filter === "Visited")) &&
            `${s.name} ${s.category} ${s.notes}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "Nearest"
            ? distanceMeters(a) - distanceMeters(b)
            : sort === "Name"
              ? a.name.localeCompare(b.name)
              : b.createdAt - a.createdAt,
        ),
    [data.spots, filter, query, sort],
  );
  if (!data.spots.length)
    return (
      <Page>
        <Txt size={28} weight="extra">
          My Saved Food
        </Txt>
        <View
          style={{
            backgroundColor: c.accent,
            borderRadius: 28,
            height: 178,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Asset source={a["15:797"].imgBookmarkPlus} width={40} height={40} />
        </View>
        <Txt size={24} weight="bold">
          Your next favorite starts here.
        </Txt>
        <Txt muted>
          Save a TikTok link or search for a restaurant. We’ll keep it here,
          just for you. No followers. No feed. Just your future cravings.
        </Txt>
        <Button
          label="Save your first food spot"
          icon="plus"
          onPress={() => router.push("/add")}
        />
        <Button
          label="Find a place manually"
          secondary
          onPress={() =>
            router.push({ pathname: "/add", params: { manual: "true" } })
          }
        />
      </Page>
    );
  return (
    <Page>
      <View style={styles.between}>
        <View style={{ flex: 1 }}>
          <Txt size={28} weight="extra" style={{ lineHeight: 33 }}>
            My Saved Food
          </Txt>
          <Txt size={13} muted>
            {data.spots.length} little reasons to go out.
          </Txt>
        </View>
        <IconButton
          name="search"
          label="Focus food search"
          onPress={() => input.current?.focus?.()}
        />
      </View>
      {network.isConnected === false && (
        <Tap onPress={() => router.push("/state/offline")}>
          <Card style={{ backgroundColor: c.accent }}>
            <Txt size={12}>
              You’re offline · Your saved places are still here →
            </Txt>
          </Card>
        </Tap>
      )}
      <Field
        inputRef={input}
        placeholder="Search names, food or notes"
        accessibilityLabel="Search saved food"
        value={query}
        onChangeText={setQuery}
        icon="search"
        inputMode="search"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {["All", "Want to Try", "Visited"].map((f) => (
          <Chip
            key={f}
            active={filter === f}
            label={`${f} · ${f === "All" ? data.spots.length : data.spots.filter((s) => s.visited === (f === "Visited")).length}`}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>
      <View style={[styles.between, { marginTop: -8 }]}>
        <Tap
          onPress={() => setSorting(true)}
          accessibilityRole="button"
          accessibilityLabel="Sort restaurants"
        >
          <View style={[styles.row, { minHeight: 44 }]}>
            <Icon name="sort" />
            <Txt size={12} weight="semibold">
              {sort}
            </Txt>
            <Icon name="down" />
          </View>
        </Tap>
        <View
          style={[
            styles.row,
            { backgroundColor: c.muted, borderRadius: 14, gap: 0 },
          ]}
        >
          <IconButton
            name="grid"
            label="Grid view"
            selected={!list}
            onPress={() => setList(false)}
          />
          <IconButton
            name="list"
            label="List view"
            selected={list}
            onPress={() => setList(true)}
          />
        </View>
      </View>
      {spots.length === 0 ? (
        <Card>
          <Txt weight="bold">No spots match this search.</Txt>
          <Button
            label="Clear filters"
            secondary
            onPress={() => {
              setQuery("");
              setFilter("All");
            }}
          />
        </Card>
      ) : list ? (
        <View style={{ gap: 12 }}>
          {spots.map((s) => (
            <RecentCard key={s.id} spot={s} />
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 12 }}>
          {[0, 1].map((col) => (
            <View key={col} style={{ flex: 1, gap: 24 }}>
              {spots
                .filter((_, i) => i % 2 === col)
                .map((s) => (
                  <SavedCard
                    key={s.id}
                    spot={s}
                    height={
                      s.imageKey === "davids"
                        ? 282
                        : s.imageKey === "eleven"
                          ? 166
                          : 206
                    }
                  />
                ))}
              {col === 1 && (
                <View
                  style={{
                    padding: 18,
                    gap: 12,
                    backgroundColor: c.accent,
                    borderRadius: 24,
                  }}
                >
                  <Icon name="lock" />
                  <Txt size={14} weight="bold">
                    Your taste.{"\n"}Your little list.
                  </Txt>
                  <Txt size={11} muted>
                    No followers, no feeds. Just places you want to remember.
                  </Txt>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
      <Txt size={10} muted style={{ paddingBottom: 64 }}>
        Demo distances · Sort by recently saved, nearest or name
      </Txt>
      <Sheet
        visible={sorting}
        title="Sort your collection"
        onClose={() => setSorting(false)}
      >
        {["Recently saved", "Nearest", "Name"].map((s) => (
          <Button
            key={s}
            label={`${sort === s ? "? " : ""}${s}`}
            secondary={sort !== s}
            onPress={() => {
              setSort(s);
              setSorting(false);
            }}
          />
        ))}
        <Txt size={11} muted>
          Nearest uses the demo location in Phnom Penh.
        </Txt>
      </Sheet>
    </Page>
  );
}
