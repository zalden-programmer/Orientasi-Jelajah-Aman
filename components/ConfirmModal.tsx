import { useMemo } from "react";
import { View, Text, Button, Modal, StyleSheet, Platform } from "react-native";

import { type WarnaTema } from "../src/constants/theme";
import { useTheme } from "../src/hooks/use-theme";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Hapus",
  cancelText = "Batal",
}: ConfirmModalProps) {
  const warna = useTheme();
  const styles = useMemo(() => buatGaya(warna), [warna]);

  if (Platform.OS === "web") {
    if (visible) {
      const confirmed = window.confirm(message);
      if (confirmed) onConfirm();
      else onCancel();
    }
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <Button title={cancelText} onPress={onCancel} color={warna.textSecondary} />
            <Button title={confirmText} onPress={onConfirm} color={warna.danger} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function buatGaya(warna: WarnaTema) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 20,
    },
    modal: {
      backgroundColor: warna.background,
      borderRadius: 12,
      padding: 20,
      gap: 16,
      borderWidth: 1,
      borderColor: warna.border,
    },
    title: { fontSize: 18, fontWeight: "bold", color: warna.text },
    message: { fontSize: 16, color: warna.textSecondary },
    buttonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 8 },
  });
}
