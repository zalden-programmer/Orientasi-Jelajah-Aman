import { useState } from "react";
import { View, Text, Button, Modal, StyleSheet, Platform } from "react-native";

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
            <Button title={cancelText} onPress={onCancel} color="#666" />
            <Button title={confirmText} onPress={onConfirm} color="red" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  message: { fontSize: 16 },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 8 },
});