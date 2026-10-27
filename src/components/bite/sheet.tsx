import React from "react";
import { Modal, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  ReduceMotion,
  useReducedMotion,
} from "react-native-reanimated";
import { usePalette } from "@/hooks/use-palette";
import { Button, Tap, Txt } from "./ui";
export function Sheet({
  visible,
  title,
  onClose,
  children,
}: React.PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
}>) {
  const c = usePalette(),
    reduce = useReducedMotion();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(reduce ? 0 : 180)}
        style={{
          flex: 1,
          backgroundColor: "#00000055",
          justifyContent: "flex-end",
        }}
      >
        <Tap
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close dialog"
          style={{ flex: 1 }}
        />
        <Animated.View
          entering={FadeInDown.duration(300).reduceMotion(ReduceMotion.System)}
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            paddingBottom: 40,
            gap: 16,
            maxHeight: "85%",
          }}
          accessibilityViewIsModal
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: c.border,
              alignSelf: "center",
            }}
          />
          <Txt size={21} weight="bold">
            {title}
          </Txt>
          {children}
          <Button label="Close" secondary onPress={onClose} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
