import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  Button,
  Chip,
  Field,
  Header,
  Icon,
  Notice,
  Page,
  Tap,
  Txt,
  styles,
} from "@/components/bite/ui";
import { VideoPreview } from "@/components/bite/food";
import { useApp } from "@/store/app-store";
import { usePalette } from "@/hooks/use-palette";
import { Category, Draft } from "@/models/spot";
import { isTikTokUrl } from "@/services/places";
const emptyDraft: Draft = {
  name: "",
  category: "Khmer",
  description: "A place worth remembering",
  address: "",
  notes: "",
  tiktokUrl: "",
  latitude: 11.555,
  longitude: 104.928,
  visited: false,
  imageKey: "malis",
  demo: false,
};
export default function AddScreen() {
  const app = useApp(),
    c = usePalette(),
    params = useLocalSearchParams<{ id?: string; manual?: string }>();
  const existing = app.data.spots.find((s) => s.id === params.id);
  const [form, setForm] = useState<Draft>(
      () => existing || app.draft || emptyDraft,
    ),
    [manual, setManual] = useState(params.manual === "true"),
    [errors, setErrors] = useState({ name: "", url: "", clipboard: "" }),
    [busy, setBusy] = useState(false);
  const patch = (values: Partial<Draft>) =>
    setForm((d) => ({ ...d, ...values }));
  const next = () => {
    const name = form.name.trim(),
      url = form.tiktokUrl.trim();
    const nameError = !name
      ? "Enter a restaurant name before continuing."
      : name.length > 100
        ? "Use a name under 100 characters."
        : "";
    const urlError =
      !manual && url && !isTikTokUrl(url)
        ? "Use an HTTPS TikTok video link or a vm.tiktok.com / vt.tiktok.com short link."
        : "";
    setErrors({ name: nameError, url: urlError, clipboard: "" });
    const draft = {
      ...form,
      name,
      tiktokUrl: manual ? "" : url,
      description: form.demo ? form.description : `${form.category} food spot`,
    };
    app.setDraft(draft);
    if (nameError) return;
    if (urlError) {
      router.push("/state/unavailable");
      return;
    }
    router.push("/confirm");
  };
  return (
    <Page>
      <Header
        title={existing ? "Edit the craving." : "Save the craving."}
        subtitle="A video today. A great meal another day."
      />
      <View style={styles.row}>
        <Chip label="1 Add a link" active onPress={() => setManual(false)} />
        <Txt size={12} muted>
          → 2 Confirm place
        </Txt>
      </View>
      {!manual ? (
        <View style={{ gap: 12 }}>
          <Field
            label="Paste a TikTok link"
            icon="link"
            placeholder="https://www.tiktok.com/@creator/video/…"
            accessibilityLabel="TikTok URL"
            value={form.tiktokUrl}
            onChangeText={(tiktokUrl) => {
              patch({ tiktokUrl });
              setErrors((e) => ({ ...e, url: "" }));
            }}
            error={errors.url || undefined}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.between}>
            <Txt size={10} muted>
              Optional · Original URL only
            </Txt>
            <Tap
              accessibilityRole="button"
              onPress={async () => {
                setBusy(true);
                try {
                  const tiktokUrl = await Clipboard.getStringAsync();
                  patch({ tiktokUrl });
                  setErrors((e) => ({
                    ...e,
                    clipboard: tiktokUrl ? "" : "Your clipboard is empty.",
                  }));
                } catch {
                  setErrors((e) => ({
                    ...e,
                    clipboard:
                      "Clipboard access is unavailable. Paste directly into the field.",
                  }));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <View style={[styles.row, { minHeight: 44 }]}>
                <Icon name="clipboard" />
                <Txt size={12} weight="semibold" style={{ color: c.link }}>
                  Paste from Clipboard
                </Txt>
              </View>
            </Tap>
          </View>
          {errors.clipboard ? (
            <Txt size={12} style={{ color: c.danger }}>
              {errors.clipboard}
            </Txt>
          ) : null}
          <VideoPreview hasUrl={isTikTokUrl(form.tiktokUrl)} />
        </View>
      ) : (
        <Notice icon="pin">
          Manual entry · A video isn’t required. Add the restaurant and confirm
          its location.
        </Notice>
      )}
      <Field
        label="Restaurant name"
        placeholder="Malis"
        accessibilityLabel="Restaurant name"
        value={form.name}
        onChangeText={(name) => patch({ name })}
        error={errors.name || undefined}
        maxLength={100}
      />
      <View style={{ gap: 6 }}>
        <Txt size={13} weight="semibold">
          Category
        </Txt>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {(["Khmer", "Noodles", "Café", "Other"] as Category[]).map(
            (category) => (
              <Chip
                key={category}
                label={category}
                active={form.category === category}
                onPress={() => patch({ category })}
              />
            ),
          )}
        </ScrollView>
      </View>
      <Field
        label="Personal notes · optional"
        placeholder="What caught your eye? Remember a dish, a table, a reason to go."
        accessibilityLabel="Personal notes"
        multiline
        value={form.notes}
        onChangeText={(notes) => patch({ notes })}
        maxLength={2000}
      />
      <Notice icon="link">
        Found it on TikTok? Tap Share → Copy link, then paste here. BiteRadar
        keeps the original URL. Your private TikTok Favorites are never
        accessed.
      </Notice>
      <Button
        label={existing ? "Continue to location" : "Continue"}
        icon="arrow"
        onPress={next}
        busy={busy}
      />
      <Button
        label={
          manual ? "Add a TikTok link instead" : "Enter restaurant manually"
        }
        secondary
        onPress={() => setManual(!manual)}
      />
      <Txt size={11} muted style={{ textAlign: "center" }}>
        You’ll confirm the location before saving. Sample food imagery is
        illustrative; video metadata is not fetched.
      </Txt>
    </Page>
  );
}
