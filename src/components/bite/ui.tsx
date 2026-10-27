import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ReduceMotion,
  interpolateColor,
} from "react-native-reanimated";
import { svgDimensions } from "@/constants/asset-dimensions";
import { fonts } from "@/constants/tokens";
import { designAssets } from "@/constants/design-assets";
import { usePalette } from "@/hooks/use-palette";
export function Txt({
  size = 14,
  weight = "regular",
  muted,
  style,
  ...props
}: TextProps & {
  size?: number;
  weight?: keyof typeof fonts;
  muted?: boolean;
}) {
  const c = usePalette();
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts[weight],
          fontSize: size,
          lineHeight: size * 1.45,
          color: muted ? c.body : c.text,
        },
        style,
      ]}
    />
  );
}
export function Asset({
  source,
  width,
  height,
  style,
  tintColor,
}: {
  source: number;
  width: number;
  height: number;
  tintColor?: string;
  style?: React.ComponentProps<typeof Image>["style"];
}) {
  const dimensions = svgDimensions.get(source);
  return (
    <Image
      source={source}
      contentFit="contain"
      tintColor={tintColor}
      style={[dimensions || { width, height }, style]}
    />
  );
}
const iconSources = {
  radar: [designAssets["15:3"].imgRadar, 22],
  link: [designAssets["15:3"].imgLink, 19],
  pin: [designAssets["15:3"].imgMapPin, 19],
  bell: [designAssets["15:3"].imgBell, 19],
  back: [designAssets["15:162"].imgArrowLeft, 22],
  close: [designAssets["15:162"].imgX, 22],
  settings: [designAssets["15:58"].imgSettings2, 22],
  search: [designAssets["15:308"].imgSearch, 18],
  plus: [designAssets["15:58"].imgPlus, 26],
  arrow: [designAssets["15:58"].imgArrowUpRight, 21],
  chevron: [designAssets["15:58"].imgChevronRight, 16],
  lock: [designAssets["15:3"].imgLockKeyhole, 15],
  utensils: [designAssets["15:308"].imgUtensils, 20],
  check: [designAssets["15:392"].imgCheck, 13],
  bookmark: [designAssets["15:392"].imgBookmark, 15],
  edit: [designAssets["15:471"].imgPencil, 18],
  play: [designAssets["15:471"].imgPlay, 18],
  bellOff: [designAssets["15:58"].imgBellOff, 15],
  sort: [designAssets["15:392"].imgArrowDownWideNarrow, 16],
  grid: [designAssets["15:392"].imgLayoutGrid, 18],
  list: [designAssets["15:392"].imgList, 18],
  locate: [designAssets["15:308"].imgLocateFixed, 18],
  down: [designAssets["15:58"].imgChevronDown, 13],
  clipboard: [designAssets["15:162"].imgClipboard, 14],
  shield: [designAssets["15:540"].imgShieldCheck, 18],
} as const;
export type IconName = keyof typeof iconSources;
export function Icon({
  name,
  onPrimary = false,
}: {
  name: IconName;
  onPrimary?: boolean;
}) {
  const c = usePalette();
  const [source, size] = iconSources[name];
  return (
    <Asset
      source={source}
      width={size}
      height={size}
      tintColor={c.background !== "#FFF9E8" && !onPrimary ? c.text : undefined}
    />
  );
}
export function Tap({
  children,
  style,
  disabled,
  ...props
}: PressableProps & { style?: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[style, animated]}>
      <Pressable
        {...props}
        hitSlop={props.hitSlop ?? 6}
        disabled={disabled}
        onPressIn={(e) => {
          props.onPressIn?.(e);
          scale.set(
            withTiming(0.975, {
              duration: 100,
              reduceMotion: ReduceMotion.System,
            }),
          );
        }}
        onPressOut={(e) => {
          props.onPressOut?.(e);
          scale.set(
            withTiming(1, { duration: 160, reduceMotion: ReduceMotion.System }),
          );
        }}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
export function Button({
  label,
  onPress,
  secondary,
  busy,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  busy?: boolean;
  disabled?: boolean;
  icon?: IconName;
}) {
  const c = usePalette();
  const [pressed, setPressed] = useState(false);
  return (
    <Tap
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      onPress={onPress}
      disabled={disabled || busy}
    >
      <View
        style={[
          styles.button,
          {
            backgroundColor: secondary
              ? c.surface
              : pressed
                ? c.pressed
                : c.primary,
            borderColor: secondary ? c.border : c.primary,
          },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={c.text} />
        ) : icon ? (
          <Icon name={icon} onPrimary={!secondary} />
        ) : null}
        <Txt
          weight="bold"
          size={15}
          style={{
            color: secondary ? c.text : "#202124",
            textAlign: "center",
            flexShrink: 1,
          }}
        >
          {label}
        </Txt>
      </View>
    </Tap>
  );
}
export function IconButton({
  name,
  label,
  onPress,
  selected,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  const c = usePalette();
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-pressed={selected}
      accessibilityState={selected === undefined ? undefined : { selected }}
    >
      <View
        style={[
          styles.iconButton,
          {
            backgroundColor: selected === false ? c.muted : c.surface,
            borderColor: selected ? c.primary : c.border,
          },
        ]}
      >
        <Icon name={name} />
      </View>
    </Tap>
  );
}
export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const c = usePalette();
  const progress = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    progress.set(
      withTiming(active ? 1 : 0, {
        duration: 180,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [active, progress]);
  const selection = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.get(),
      [0, 1],
      [c.surface, c.text],
    ),
  }));
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      aria-pressed={active}
      style={{ minHeight: 44, justifyContent: "center" }}
    >
      <Animated.View
        style={[
          {
            borderRadius: 30,
            borderWidth: 1,
            borderColor: active ? c.text : c.border,
            paddingHorizontal: 12,
            paddingVertical: 9,
          },
          selection,
        ]}
      >
        <Txt
          size={12}
          weight="semibold"
          style={{ color: active ? c.background : c.body }}
        >
          {label}
        </Txt>
      </Animated.View>
    </Tap>
  );
}
export function Field({
  label,
  error,
  icon,
  multiline,
  style,
  inputRef,
  ...props
}: TextInputProps & {
  inputRef?: React.Ref<React.ComponentRef<typeof TextInput>>;
  label?: string;
  error?: string;
  icon?: IconName;
}) {
  const c = usePalette();
  const [focused, focus] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      {label && (
        <Txt size={13} weight="semibold">
          {label}
        </Txt>
      )}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: multiline ? "flex-start" : "center",
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: error ? c.danger : focused ? c.primary : c.border,
          borderRadius: 12,
          backgroundColor: c.surface,
          minHeight: 54,
        }}
      >
        {icon && (
          <View style={{ paddingVertical: 17 }}>
            <Icon name={icon} />
          </View>
        )}
        <TextInput
          ref={inputRef}
          {...props}
          multiline={multiline}
          onFocus={() => focus(true)}
          onBlur={() => focus(false)}
          placeholderTextColor={c.secondary}
          style={[
            {
              flex: 1,
              minWidth: 0,
              fontFamily: fonts.regular,
              fontSize: 14,
              color: c.text,
              paddingVertical: 15,
              minHeight: multiline ? 88 : 52,
              textAlignVertical: multiline ? "top" : "center",
            },
            style,
          ]}
        />
      </View>
      {!!error && (
        <Txt
          size={12}
          style={{ color: c.danger }}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Txt>
      )}
    </View>
  );
}
export function Card({
  children,
  style,
}: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const c = usePalette();
  return (
    <View
      style={[
        {
          backgroundColor: c.surface,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: c.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Notice({
  children,
  icon = "shield",
}: React.PropsWithChildren<{ icon?: IconName }>) {
  const c = usePalette();
  return (
    <View
      style={{
        backgroundColor: c.accent,
        padding: 16,
        borderRadius: 16,
        flexDirection: "row",
        gap: 10,
      }}
    >
      <Icon name={icon} />
      <Txt size={12} style={{ flex: 1, color: c.body }}>
        {children}
      </Txt>
    </View>
  );
}
export function Header({
  title,
  subtitle,
  close = true,
}: {
  title?: string;
  subtitle?: string;
  close?: boolean;
}) {
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.between}>
        <IconButton
          name="back"
          label="Go back"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/home")
          }
        />
        <Txt size={12} weight="semibold" muted>
          BiteRadar
        </Txt>
        {close ? (
          <IconButton
            name="close"
            label="Back to home"
            onPress={() => router.dismissTo("/home")}
          />
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>
      {title && (
        <Txt size={28} weight="extra" style={{ lineHeight: 33 }}>
          {title}
        </Txt>
      )}
      {subtitle && <Txt muted>{subtitle}</Txt>}
    </View>
  );
}
export function Page({
  children,
  padded = true,
  scroll = true,
}: React.PropsWithChildren<{ padded?: boolean; scroll?: boolean }>) {
  const c = usePalette();
  const inner = (
    <View
      style={{
        width: "100%",
        maxWidth: 760,
        alignSelf: "center",
        paddingHorizontal: padded ? 24 : 0,
        paddingTop: 8,
        paddingBottom: 36,
        gap: 24,
      }}
    >
      {children}
    </View>
  );
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: c.background }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {inner}
          </ScrollView>
        ) : (
          inner
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  const c = usePalette();
  return (
    <View style={styles.between}>
      <Txt size={21} weight="bold">
        {title}
      </Txt>
      {action && (
        <Tap
          onPress={onPress}
          accessibilityRole="button"
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Txt size={12} weight="semibold" style={{ color: c.link }}>
            {action}
          </Txt>
        </Tap>
      )}
    </View>
  );
}
export const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
