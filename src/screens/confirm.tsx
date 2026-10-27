import { useLocation } from "@/store/location-store";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Card,
  Chip,
  Field,
  Header,
  Icon,
  Page,
  Tap,
  Txt,
  styles,
} from "@/components/bite/ui";
import { DemoMap } from "@/components/bite/demo-map";
import { FoodPhoto } from "@/components/bite/food";
import { useApp } from "@/store/app-store";
import { usePalette } from "@/hooks/use-palette";
import { Draft, Spot } from "@/models/spot";
import { distanceLabel, placeSearch } from "@/services/places";
export default function ConfirmScreen() {
  const location = useLocation();
  const app = useApp(),
    c = usePalette();
  const [place, setPlace] = useState<Draft | null>(app.draft),
    [query, setQuery] = useState(""),
    [results, setResults] = useState<Spot[]>([]),
    [manual, setManual] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [latitude, setLatitude] = useState(
      app.draft?.address ? String(app.draft.latitude) : "",
    ),
    [longitude, setLongitude] = useState(
      app.draft?.address ? String(app.draft.longitude) : "",
    );
  useEffect(() => {
    let active = true;
    placeSearch.search(query).then((r) => {
      if (active) setResults(r);
    });
    return () => {
      active = false;
    };
  }, [query]);
  const choose = (s: Spot) => {
    if (!place) return;
    setPlace({
      ...place,
      name: s.name,
      category: s.category,
      description: s.description,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
      imageKey: s.imageKey,
      demo: true,
    });
    setLatitude(String(s.latitude));
    setLongitude(String(s.longitude));
    setManual(false);
  };
  if (!place)
    return (
      <Page>
        <Header title="Let’s add a place first." />
        <Txt muted>
          Your unsaved form was cleared after restarting. Saved places are still
          in your collection.
        </Txt>
        <Button
          label="Add a Food Spot"
          onPress={() => router.replace("/add")}
        />
      </Page>
    );
  const preview: Spot = { ...place, id: "confirm-preview", createdAt: 0 };
  const save = async () => {
    const lat = Number(latitude),
      lng = Number(longitude);
    if (!place.name.trim() || !place.address.trim()) {
      setError(
        "Enter the restaurant name and address, or choose a demo restaurant.",
      );
      setManual(true);
      return;
    }
    if (
      !latitude.trim() ||
      !longitude.trim() ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      setError("Enter valid latitude (−90 to 90) and longitude (−180 to 180).");
      setManual(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const saved = await app.saveSpot({
        ...place,
        name: place.name.trim(),
        address: place.address.trim(),
        latitude: lat,
        longitude: lng,
      });
      app.setDraft(null);
      router.replace({ pathname: "/success", params: { id: saved.id } });
    } catch {
      setError(
        "Could not save this spot to your device. Your details are still here. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page>
      <Header
        title="Put it on your radar."
        subtitle="Choose the right restaurant before you save."
      />
      <View style={styles.row}>
        <Chip label="1 Link added ✓" onPress={() => router.back()} />
        <Chip
          label="2 Confirm place"
          active
          onPress={() => setManual(!manual)}
        />
      </View>
      <Field
        label="Search a place or address"
        placeholder="Search demo restaurants in Phnom Penh"
        accessibilityLabel="Search demo restaurants"
        icon="search"
        value={query}
        onChangeText={setQuery}
      />
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {results.map((s) => (
          <Tap
            key={s.id}
            onPress={() => choose(s)}
            accessibilityRole="button"
            accessibilityLabel={`Choose ${s.name}`}
          >
            <View
              style={[
                styles.row,
                {
                  padding: 14,
                  backgroundColor:
                    !manual && place.address === s.address
                      ? c.accent
                      : c.surface,
                },
              ]}
            >
              <Icon name="pin" />
              <View style={{ flex: 1 }}>
                <Txt size={14} weight="bold">
                  {s.name}
                </Txt>
                <Txt size={11} muted>
                  {s.address}
                </Txt>
              </View>
              {place.address === s.address && <Icon name="check" />}
            </View>
          </Tap>
        ))}
        {!results.length && (
          <View style={{ padding: 16 }}>
            <Txt size={13} muted>
              No demo match. Confirm the place manually below.
            </Txt>
          </View>
        )}
      </Card>
      <View style={{ borderRadius: 20, overflow: "hidden" }}>
        <DemoMap
          spots={
            place.address
              ? [preview, ...results.filter((s) => s.name !== place.name)]
              : results
          }
          selectedId={place.address ? preview.id : undefined}
          onSelect={choose}
          height={270}
        />
      </View>
      <Button
        label={
          manual
            ? "Hide manual location fields"
            : "Adjust pin / enter location manually"
        }
        icon="locate"
        secondary
        onPress={() => setManual(!manual)}
      />
      <Txt size={10} muted>
        Interactive demo map · Confirm the entrance and address. Search results
        and coordinates are examples.
      </Txt>
      {manual && (
        <Card style={{ gap: 16 }}>
          <Txt size={12} muted>
            At the restaurant? Use your current position below. Otherwise enter
            its verified coordinates. Your position is not an automatic
            restaurant match.
          </Txt>
          <Button
            label={
              location.position
                ? "Use my current location as pin"
                : "Get my current location"
            }
            secondary
            busy={location.busy}
            onPress={() => {
              if (location.position) {
                setLatitude(String(location.position.latitude));
                setLongitude(String(location.position.longitude));
                setPlace({ ...place, demo: false });
              } else {
                void location.request();
              }
            }}
          />
          {!!location.error && (
            <Txt size={12} style={{ color: c.danger }}>
              {location.error}
            </Txt>
          )}
          <Field
            label="Restaurant name"
            accessibilityLabel="Confirmed restaurant name"
            value={place.name}
            onChangeText={(name) => setPlace({ ...place, name, demo: false })}
          />
          <Field
            label="Address"
            accessibilityLabel="Restaurant address"
            placeholder="Street, neighborhood, Phnom Penh"
            value={place.address}
            onChangeText={(address) =>
              setPlace({ ...place, address, demo: false })
            }
            multiline
          />
          <Field
            label="Latitude"
            accessibilityLabel="Latitude"
            value={latitude}
            onChangeText={(value) => {
              setLatitude(value);
              setPlace({ ...place, demo: false });
            }}
            keyboardType="numbers-and-punctuation"
          />
          <Field
            label="Longitude"
            accessibilityLabel="Longitude"
            value={longitude}
            onChangeText={(value) => {
              setLongitude(value);
              setPlace({ ...place, demo: false });
            }}
            keyboardType="numbers-and-punctuation"
          />
          <Txt size={11} muted>
            Enter verified restaurant coordinates. A new place has no default
            location.
          </Txt>
        </Card>
      )}
      <Card
        style={{
          flexDirection: "row",
          gap: 12,
          padding: 10,
          alignItems: "center",
        }}
      >
        <View style={{ width: 64 }}>
          <FoodPhoto spot={preview} slot="confirm" height={64} radius={14} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt size={17} weight="extra">
            {place.name}
          </Txt>
          <Txt size={12} muted>
            {place.category} ·{" "}
            {place.address || "Choose a restaurant or enter its address"}
          </Txt>
          <Txt size={12} muted>
            {distanceLabel(preview, location.position)}
            {location.position ? " from you" : ""}
          </Txt>
        </View>
      </Card>
      {error ? (
        <Txt
          size={13}
          style={{ color: c.danger }}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Txt>
      ) : null}
      <Button
        label={place.id ? "Save Changes" : "Save Spot"}
        busy={busy}
        onPress={save}
      />
      <Txt size={11} muted style={{ textAlign: "center" }}>
        Saved only to your private collection. Nearby reminders stay off until
        you choose them.
      </Txt>
    </Page>
  );
}
